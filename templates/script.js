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
      html += `<li class="file-item">
        <input type="checkbox" data-path="${item.path}" ${checked}>
        ${key}
      </li>`;
    } else {
      html += `<li>
        <span class="folder" onclick="toggleFolder(this)">▶ ${key}</span>
        <div class="hidden">${renderTree(item)}</div>
      </li>`;
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
