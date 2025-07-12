import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the absolute path to the .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });
console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

function activate(context) {
  let disposable = vscode.commands.registerCommand('playwright-doc-gemini.generateDocs', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor open.');
      return;
    }

    const scriptContent = editor.document.getText();
    const fileName = editor.document.uri.path.split('/').pop().replace(/\.(js|ts)$/, '.md');

    vscode.window.showInformationMessage('Generating documentation with Gemini...');

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }
      
      const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

      const result = await ai.models.generateContent(
        {
          model: 'gemini-2.0-flash',
          contents: `Generate detailed Markdown documentation for this Playwright test script:\n\n${scriptContent}`,
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

      const docFile = vscode.Uri.joinPath(docFolder, fileName);
      await vscode.workspace.fs.writeFile(docFile, Buffer.from(documentation, 'utf8'));

      vscode.window.showInformationMessage(`Documentation saved to /documentation/${fileName}`);
    } catch (error) {
      console.error('Gemini API error:', error);
      vscode.window.showErrorMessage(`Failed to generate docs: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

export { activate, deactivate };
