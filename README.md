# AI-Powered Document Generator

A Visual Studio Code extension that uses AI (Google's Gemini) to automatically generate comprehensive documentation for your code.  
This extension can analyze any code files and create well-structured, professional documentation in Markdown format.

---

## ✨ Features

- **Multi-Language Support**  
  Generate documentation for any programming language including JavaScript, TypeScript, Python, Java, C#, and more.

- **Smart Analysis**  
  Uses Google's Gemini AI (via official `@google/genai` library) to understand your code's structure, purpose, and relationships.

- **Comprehensive Documentation**  
  Creates detailed documentation including:
  - Code overview and architecture
  - Dependencies and setup requirements
  - Detailed implementation explanations
  - Usage guides and examples
  - Best practices and recommendations

- **Customizable Templates**  
  Different documentation templates for various types of code:
  - General code documentation
  - Test automation documentation
  - API documentation
  - Component documentation

- **Markdown Output**  
  Clean, well-structured documentation in Markdown format.

- **VS Code Integration**  
  Easy-to-use interface integrated into the VS Code activity bar.

- **Folder Tree View**  
  Visual file selector that mirrors the VS Code Explorer, with expandable/collapsible folders and multi-file selection.

- **Customizable File Type Filtering**  
  Easily adjust which file types are included by editing `config/validFiletypes.js` in the extension code.

---

## ⚙️ Requirements

- Visual Studio Code v1.102.0 or higher  
- Node.js (v18+ recommended)  
- Google Gemini API key

---

## 🚀 Setup

1️⃣ Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=DouglasDavila.ai-powered-document-generator) or `.vsix` package.

2️⃣ Get your Gemini API key:
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
- Copy your **Gemini API key**.

3️⃣ Set the API key in the extension:
- Method 1 (preferred):
  - Open the extension tab on VS Code.
  - Click `Configuration` on the top of the widget.
  - Set your **Gemini API key**.
  - Click `Save API Key` button.

- Method 2:
  - Open **VS Code Settings** → search for `AI Documentation Generator`.
  - Paste your **Gemini API key** into the `geminiApiKey` field.


4️⃣ Open the AI Documentation Generator view from the VS Code activity bar.

5️⃣ Select:
- Files you want to document.
- Documentation type (from the dropdown).

6️⃣ Click **Generate Documentation** and let the extension create beautiful Markdown docs.

---

## 🛠 Technical Notes

- Uses the official [`@google/genai`](https://www.npmjs.com/package/@google/genai) package.
- Passes the API key correctly via `{ apiKey }` object.
- Does **not** rely on `.env` files inside the packaged extension — keys are set via VS Code settings or system env.
- Uses `config/validFiletypes.js` to define the list of supported file extensions.
- Builds the folder tree dynamically, showing paths relative to the open workspace root (not full system paths).

---

## 💬 Questions or Feedback?

Check out the project on [GitHub](https://github.com/DouglasOttoDavila/ai-powered-document-generator)  
or reach out to the creator, [Douglas D'Avila](https://github.com/DouglasOttoDavila).

---

🛡️ **Note:**  
Your API key is stored **only** in your local VS Code settings and is never transmitted to the extension owner or third parties.
