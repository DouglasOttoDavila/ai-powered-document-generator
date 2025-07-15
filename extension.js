import path from 'path';
import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import { prompts } from './config/prompts.js';
import { validFiletypes } from './config/validFiletypes.js';

// Utility function to load template files
function loadTemplate(context, templateName) {
  const templatePath = path.join(context.extensionPath, 'templates', templateName);
  return readFileSync(templatePath, 'utf8');
}

class AIDocumentationViewProvider {
  constructor(context) {
    this._context = context;
    this._view = null;
    this._files = [];
  }

  async _getCodeFiles() {
    console.log('Searching for code files...');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      console.log('No workspace folder found');
      return [];
    }
    const rootPath = workspaceFolder.uri.fsPath;
    const pattern = new vscode.RelativePattern(
      workspaceFolder,
      `**/*.{${validFiletypes.join(',')}}`
    );
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
    console.log(`Found ${files.length} test files`);
    return files.map(file => {
      const relativePath = path.relative(rootPath, file.fsPath);
      return {
        path: file.path,
        relativePath,
        parts: relativePath.split(path.sep),
        name: file.path.split(path.sep).pop(),
        checked: false
      };
    });
  }

  async resolveWebviewView(webviewView) {
    console.log('Resolving webview view');
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this._getHtmlContent();
    
    // Initial file list load
    await this._updateFilesList();
    
    // Handle visibility changes
    webviewView.onDidChangeVisibility(async () => {
      console.log('Webview visibility changed:', webviewView.visible);
      if (webviewView.visible) {
        await this._updateFilesList();
      }
    });

    webviewView.webview.onDidReceiveMessage(async message => {
      if (message.command === 'generate') {
        if (!message.files || message.files.length === 0) {
          vscode.window.showErrorMessage('Please select at least one file.');
          return;
        }
        await this._generateDocumentation(message.files, message.task, message.customPrompt);
      } else if (message.command === 'saveApiKey') {
        await this._saveApiKey(message.value);
      }
    });
  }

  async _updateFilesList() {
    if (!this._view) {
      console.log('No view available for file list update');
      return;
    }
    console.log('Updating files list...');
    this._files = await this._getCodeFiles();
    const fileTree = this._buildFileTree(this._files);
    this._view.webview.postMessage({ 
      type: 'updateFiles', 
      files: fileTree 
    });
    console.log(`Updated files list with ${this._files.length} files`);
  }

  _buildFileTree(files) {
    const tree = {};
    files.forEach(file => {
      let current = tree;
      file.parts.forEach((part, idx) => {
        if (idx === file.parts.length - 1) {
          current[part] = { path: file.path, isFile: true };
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      });
    });
    return tree;
  }

  _getHtmlContent() {
    const apiKey = this._getApiKey() || '';
    
    // Load template files
    let template = loadTemplate(this._context, 'template.html');
    const styles = loadTemplate(this._context, 'styles.css');
    const script = loadTemplate(this._context, 'script.js');
    
    // Generate the task options
    const taskOptions = Object.entries(prompts)
      .map(([key, prompt]) => `<option value="${key}">${prompt.name}</option>`)
      .join('');

    // Replace template variables
    template = template
      .replace('${apiKey}', apiKey)
      .replace('${taskOptions}', taskOptions)
      .replace('<link rel="stylesheet" href="./styles.css">', `<style>${styles}</style>`)
      .replace('<script src="./script.js"></script>', `<script>${script}</script>`);

    return template;
  }


  _cleanMarkdownContent(content) {
    // Remove ```markdown from the beginning and ``` from the end if they exist
    return content
      .replace(/^```markdown\n/, '')  // Remove opening ```markdown
      .replace(/\n```$/, '')          // Remove closing ```
      .trim();                        // Clean up any extra whitespace
  }

  async _generateDocumentation(filePaths, task = 'testAutomation', customPrompt = '') {
    console.log('Starting documentation generation for files:', filePaths);
    console.log('Using task type:', task);
    vscode.window.showInformationMessage('Generating documentation with Gemini...');

    try {
      const apiKey = this._getApiKey();
      if (!apiKey) {
        console.log('Error: Gemini API key not found in configuration');
        this._view.webview.postMessage({ type: 'generationError' });
        vscode.window.showErrorMessage('Please configure your Gemini API key in the Configuration section');
        return;
      }

      // Read all selected files
      console.log('Reading selected files...');
      const fileContents = await Promise.all(filePaths.map(async (filePath) => {
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        console.log(`Read file: ${filePath}`);
        return {
          name: filePath.split('/').pop(),
          content: document.getText()
        };
      }));

      const ai = new GoogleGenAI({ apiKey: apiKey});
      console.log('Initialized Gemini AI client');

      let prompt;
      if (task === 'custom' && customPrompt) {
        // For custom prompts, append the file contents after the user's prompt
        prompt = `${customPrompt.trim()}

        ## INPUT FILES:
            ${fileContents.map(file => `
            File: ${file.name}
            \`\`\`
            ${file.content}
            \`\`\`
            `).join('\n')}`;
      } else {
        // Get the selected task's prompt template
        const promptTemplate = prompts[task]?.template;
        if (!promptTemplate) {
          throw new Error(`Invalid task type: ${task}`);
        }
        prompt = promptTemplate(fileContents);
      }
      console.log('Generated prompt for Gemini');

      console.log('Sending request to Gemini API...');
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      let documentation = result.text;

      if (!documentation) {
        console.log('Error: No documentation received from Gemini');
        vscode.window.showErrorMessage('No documentation received from Gemini.');
        return;
      }
      console.log('Received documentation from Gemini');

      // Clean the markdown content before saving
      documentation = this._cleanMarkdownContent(documentation);
      console.log('Cleaned markdown content');

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        console.log('Error: No workspace folder open');
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
      }

      const docFolder = vscode.Uri.joinPath(workspaceFolder.uri, 'documentation');
      await vscode.workspace.fs.createDirectory(docFolder);
      console.log('Created documentation directory');

      // Use the first file name as base for documentation file name
      const fileName = filePaths[0].split('/').pop().replace(/\.(js|ts)$/, '') + 
                      (filePaths.length > 1 ? '-combined' : '') + 
                      '.md';

      const docFile = vscode.Uri.joinPath(docFolder, fileName);
      await vscode.workspace.fs.writeFile(docFile, Buffer.from(documentation, 'utf8'));
      console.log(`Documentation saved to: ${docFile.fsPath}`);

      // Open the newly created markdown file in the editor
      const docDocument = await vscode.workspace.openTextDocument(docFile);
      await vscode.window.showTextDocument(docDocument, vscode.ViewColumn.One);
      console.log(`Opened documentation file: ${docFile.fsPath}`);

      this._view.webview.postMessage({ type: 'generationComplete' });
      vscode.window.showInformationMessage(`Documentation saved to /documentation/${fileName}`);
    } catch (error) {
      console.error('Documentation generation failed:', error);
      this._view.webview.postMessage({ type: 'generationError' });
      console.error('Gemini API error:', error);
      vscode.window.showErrorMessage(`Failed to generate docs: ${error.message}`);
    }
  }

  async _saveApiKey(apiKey) {
    try {
      await vscode.workspace.getConfiguration('aiDocGenerator').update('geminiApiKey', apiKey, true);
      this._view.webview.postMessage({ type: 'apiKeySaved' });
      vscode.window.showInformationMessage('Gemini API key saved successfully');
    } catch (error) {
      console.error('Failed to save API key:', error);
      vscode.window.showErrorMessage('Failed to save Gemini API key');
    }
  }

  _getApiKey() {
    return vscode.workspace.getConfiguration('aiDocGenerator').get('geminiApiKey');
  }
}

function activate(context) {
  console.log('AI-Powered Document Generator extension is being activated');
  const provider = new AIDocumentationViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('aiDocGenerator', provider)
  );
  console.log('Webview provider registered successfully');
}

function deactivate() {}

export { activate, deactivate };
