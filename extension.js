import path from 'path';
import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import { prompts } from './config/prompts.js';
import { validFiletypes } from './config/validFiletypes.js';

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
        await this._generateDocumentation(message.files, message.task);
      } else if (message.command === 'saveApiKey') {
        await this._saveApiKey(message.value);
      }
    });
  }

  /* async _updateFilesList() {
    if (!this._view) {
      console.log('No view available for file list update');
      return;
    }
    
    console.log('Updating files list...');
    this._files = await this._getCodeFiles();
    this._view.webview.postMessage({ 
      type: 'updateFiles', 
      files: this._files 
    });
    console.log(`Updated files list with ${this._files.length} files`);
  } */

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
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              padding: 15px;
              color: var(--vscode-foreground);
              font-family: var(--vscode-font-family);
            }
            .file-list {
              margin: 10px 0;
              max-height: 300px;
              overflow-y: auto;
              border: 1px solid var(--vscode-panel-border);
              padding: 5px;
            }
            ul { list-style-type: none; padding-left: 1em; margin: 0; }
            .folder { cursor: pointer; font-weight: bold; }
            .hidden { display: none; }
            .file-item { margin-left: 1em; }
            button {
              width: 100%;
              padding: 8px;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              border-radius: 2px;
              cursor: pointer;
              margin-top: 10px;
            }
            button:hover { background: var(--vscode-button-hoverBackground); }
            button:disabled { opacity: 0.5; cursor: not-allowed; }
            .info-text {
              margin: 10px 0;
              font-size: 12px;
              color: var(--vscode-descriptionForeground);
            }
            select {
              width: 100%;
              padding: 8px;
              margin-bottom: 10px;
              background: var(--vscode-input-background);
              color: var(--vscode-input-foreground);
              border: 1px solid var(--vscode-input-border);
              border-radius: 2px;
            }
            select:focus { outline: 1px solid var(--vscode-focusBorder); }
            .spinner {
              display: none;
              width: 24px;
              height: 24px;
              margin: 10px auto;
              border: 3px solid var(--vscode-button-background);
              border-radius: 50%;
              border-top-color: transparent;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="config-section">
            <div class="config-header" id="configHeader">
              <span>⚙️ Configuration</span>
              <span class="toggle-icon">▼</span>
            </div>
            <div class="config-content" id="configContent" style="display:none;">
              <div class="info-text">Enter your <a href="https://aistudio.google.com/app/apikey" target="_blank">Gemini API key</a>:</div>
              <input type="password" id="apiKeyInput" value="${apiKey}" placeholder="Enter your Gemini API key here"/>
              <button id="saveApiKey">Save API Key</button>
            </div>
          </div>

          <div class="info-text">Select the type of documentation to generate:</div>
          <select id="taskSelect">
            <option value="">Select a documentation type...</option>
            ${Object.entries(prompts).map(([key, prompt]) =>
              `<option value="${key}">${prompt.name}</option>`).join('')}
          </select>

          <div class="info-text">Select one or more files:</div>
          <div id="fileList" class="file-list"></div>
          <div class="spinner" id="loadingSpinner"></div>
          <button id="generateBtn" disabled>Generate Documentation</button>

          <div class="info-text" style="text-align:center; font-size:10px; margin-top:20px;">
            Created by <a href="https://github.com/DouglasOttoDavila" target="_blank">Douglas D'Avila</a>
          </div>

          <script>
            const vscode = acquireVsCodeApi();
            let state = vscode.getState() || { selectedFiles: [], selectedTask: '' };

            const generateBtn = document.getElementById('generateBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const taskSelect = document.getElementById('taskSelect');
            const configHeader = document.getElementById('configHeader');
            const configContent = document.getElementById('configContent');
            const apiKeyInput = document.getElementById('apiKeyInput');
            const saveApiKeyBtn = document.getElementById('saveApiKey');

            configHeader.addEventListener('click', () => {
              configContent.style.display = configContent.style.display === 'none' ? 'block' : 'none';
            });

            saveApiKeyBtn.addEventListener('click', () => {
              const apiKey = apiKeyInput.value.trim();
              if (!apiKey) {
                vscode.window.showErrorMessage('API key cannot be empty');
                return;
              }
              vscode.postMessage({ command: 'saveApiKey', value: apiKey });
            });

            taskSelect.value = state.selectedTask;
            taskSelect.addEventListener('change', e => {
              state.selectedTask = e.target.value;
              vscode.setState(state);
              updateGenerateButton();
            });

            function updateGenerateButton() {
              generateBtn.disabled = !state.selectedTask || state.selectedFiles.length === 0;
            }

            function toggleFolder(element) {
              const next = element.nextElementSibling;
              if (next) next.classList.toggle('hidden');
              element.textContent = element.textContent.startsWith('▶') 
                ? element.textContent.replace('▶', '▼') 
                : element.textContent.replace('▼', '▶');
            }

            function renderTree(node) {
              let html = '<ul>';
              for (const key in node) {
                const item = node[key];
                if (item.isFile) {
                  const checked = state.selectedFiles.includes(item.path) ? 'checked' : '';
                  html += \`<li class="file-item">
                    <input type="checkbox" data-path="\${item.path}" \${checked}>
                    \${key}
                  </li>\`;
                } else {
                  html += \`<li>
                    <span class="folder" onclick="toggleFolder(this)">▶ \${key}</span>
                    <div class="hidden">\${renderTree(item)}</div>
                  </li>\`;
                }
              }
              html += '</ul>';
              return html;
            }

            document.getElementById('fileList').addEventListener('change', e => {
              if (e.target.type === 'checkbox') {
                const filePath = e.target.getAttribute('data-path');
                if (e.target.checked) {
                  if (!state.selectedFiles.includes(filePath)) {
                    state.selectedFiles.push(filePath);
                  }
                } else {
                  state.selectedFiles = state.selectedFiles.filter(p => p !== filePath);
                }
                vscode.setState(state);
                updateGenerateButton();
              }
            });

            generateBtn.addEventListener('click', () => {
              loadingSpinner.style.display = 'block';
              vscode.postMessage({
                command: 'generate',
                files: state.selectedFiles,
                task: state.selectedTask
              });
            });

            window.addEventListener('message', event => {
              const message = event.data;
              if (message.type === 'updateFiles') {
                const fileList = document.getElementById('fileList');
                fileList.innerHTML = renderTree(message.files);
                updateGenerateButton();
                loadingSpinner.style.display = 'none';
              } else if (message.type === 'generationComplete' || message.type === 'generationError') {
                loadingSpinner.style.display = 'none';
              } else if (message.type === 'apiKeySaved') {
                vscode.window.showInformationMessage('Gemini API key saved successfully');
              }
            });
          </script>
        </body>
      </html>
    `;
  }


  _cleanMarkdownContent(content) {
    // Remove ```markdown from the beginning and ``` from the end if they exist
    return content
      .replace(/^```markdown\n/, '')  // Remove opening ```markdown
      .replace(/\n```$/, '')          // Remove closing ```
      .trim();                        // Clean up any extra whitespace
  }

  async _generateDocumentation(filePaths, task = 'testAutomation') {
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

      // Get the selected task's prompt template
      const promptTemplate = prompts[task]?.template;
      if (!promptTemplate) {
        throw new Error(`Invalid task type: ${task}`);
      }
      const prompt = promptTemplate(fileContents);
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
