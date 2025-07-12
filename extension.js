import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { prompts } from './config/prompts.js';

// Get the absolute path to the .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });
console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

class PlaywrightDocumentationViewProvider {
  constructor(context) {
    this._context = context;
    this._view = null;
    this._files = [];
  }

  async _getPlaywrightFiles() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return [];
    }

    const pattern = new vscode.RelativePattern(workspaceFolder, '**/*.{spec,test}.{ts,js}');
    const files = await vscode.workspace.findFiles(pattern);
    return files.map(file => ({
      path: file.path,
      name: file.path.split('/').pop(),
      checked: false
    }));
  }

  async resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this._getHtmlContent();
    
    // Initial file list load
    await this._updateFilesList();
    
    // Handle visibility changes
    webviewView.onDidChangeVisibility(async () => {
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
        await this._generateDocumentation(message.files);
      }
    });
  }

  async _updateFilesList() {
    if (!this._view) return;
    
    this._files = await this._getPlaywrightFiles();
    this._view.webview.postMessage({ 
      type: 'updateFiles', 
      files: this._files 
    });
  }

  _getHtmlContent() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              padding: 15px;
              color: var(--vscode-foreground);
            }
            .file-list {
              margin: 10px 0;
              max-height: 300px;
              overflow-y: auto;
              border: 1px solid var(--vscode-panel-border);
              padding: 5px;
            }
            .file-item {
              display: flex;
              align-items: center;
              padding: 5px;
              cursor: pointer;
            }
            .file-item:hover {
              background: var(--vscode-list-hoverBackground);
            }
            .file-item input[type="checkbox"] {
              margin-right: 8px;
            }
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
            button:hover {
              background: var(--vscode-button-hoverBackground);
            }
            button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .info-text {
              margin: 10px 0;
              font-size: 12px;
              color: var(--vscode-descriptionForeground);
            }
          </style>
        </head>
        <body>
          <div class="info-text">Select one or more test files to generate documentation:</div>
          <div id="fileList" class="file-list"></div>
          <button id="generateBtn" disabled>Generate Documentation</button>
          <script>
            const vscode = acquireVsCodeApi();
            let state = vscode.getState() || { selectedFiles: [] };
            
            // Handle file selection
            document.getElementById('fileList').addEventListener('change', (e) => {
              if (e.target.type === 'checkbox') {
                const filePath = e.target.getAttribute('data-path');
                state.selectedFiles = Array.from(document.querySelectorAll('#fileList input[type="checkbox"]:checked'))
                  .map(checkbox => checkbox.getAttribute('data-path'));
                vscode.setState(state);
                document.getElementById('generateBtn').disabled = state.selectedFiles.length === 0;
              }
            });

            // Handle generate button click
            document.getElementById('generateBtn').addEventListener('click', () => {
              vscode.postMessage({ 
                command: 'generate',
                files: state.selectedFiles
              });
            });

            // Handle file list updates from extension
            window.addEventListener('message', event => {
              const message = event.data;
              if (message.type === 'updateFiles') {
                const fileList = document.getElementById('fileList');
                fileList.innerHTML = message.files.map(file => {
                  const isChecked = state.selectedFiles.includes(file.path);
                  return '<div class="file-item">' +
                    '<input type="checkbox" ' +
                    'data-path="' + file.path + '" ' +
                    (isChecked ? 'checked ' : '') +
                    '/>' +
                    '<span>' + file.name + '</span>' +
                    '</div>';
                }).join('');
                // Update button state
                document.getElementById('generateBtn').disabled = state.selectedFiles.length === 0;
              }
            });
          </script>
        </body>
      </html>
    `;
  }

  async _generateDocumentation(filePaths) {
    vscode.window.showInformationMessage('Generating documentation with Gemini...');

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      // Read all selected files
      const fileContents = await Promise.all(filePaths.map(async (filePath) => {
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        return {
          name: filePath.split('/').pop(),
          content: document.getText()
        };
      }));

      const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

      // Get the test automation documentation prompt
      const prompt = prompts.testAutomation.template(fileContents);

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const documentation = result.text;

      if (!documentation) {
        vscode.window.showErrorMessage('No documentation received from Gemini.');
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
      }

      const docFolder = vscode.Uri.joinPath(workspaceFolder.uri, 'documentation');
      await vscode.workspace.fs.createDirectory(docFolder);

      // Use the first file name as base for documentation file name
      const fileName = filePaths[0].split('/').pop().replace(/\.(js|ts)$/, '') + 
                      (filePaths.length > 1 ? '-combined' : '') + 
                      '.md';

      const docFile = vscode.Uri.joinPath(docFolder, fileName);
      await vscode.workspace.fs.writeFile(docFile, Buffer.from(documentation, 'utf8'));

      vscode.window.showInformationMessage(`Documentation saved to /documentation/${fileName}`);
    } catch (error) {
      console.error('Gemini API error:', error);
      vscode.window.showErrorMessage(`Failed to generate docs: ${error.message}`);
    }
  }
}

function activate(context) {
  const provider = new PlaywrightDocumentationViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('playwrightDocGenerator', provider)
  );
}

function deactivate() {}

export { activate, deactivate };
