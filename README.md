# AI-Powered Document Generator

A Visual Studio Code extension that uses AI (Google's Gemini) to automatically generate comprehensive documentation for your code. This extension can analyze any code files and create well-structured, professional documentation in Markdown format.

## Features

- **Multi-Language Support**: Generate documentation for any programming language including JavaScript, TypeScript, Python, Java, C#, and more.
- **Smart Analysis**: Uses Google's Gemini AI to understand your code's structure, purpose, and relationships.
- **Comprehensive Documentation**: Creates detailed documentation including:
  - Code overview and architecture
  - Dependencies and setup requirements
  - Detailed implementation explanations
  - Usage guides and examples
  - Best practices and recommendations
- **Customizable Templates**: Different documentation templates for various types of code:
  - General code documentation
  - Test automation documentation
  - API documentation
  - Component documentation
- **Markdown Output**: Clean, well-structured documentation in Markdown format
- **VS Code Integration**: Easy-to-use interface integrated into VS Code's activity bar

## Requirements

- Visual Studio Code v1.102.0 or higher
- Google Gemini API key (set in `.env` file)
- Node.js and npm installed

## Setup

1. Install the extension from the VS Code marketplace
2. Create a `.env` file in your workspace root with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Open the AI Documentation Generator view from the activity bar
4. Select the files you want to document and choose a documentation type
5. Click "Generate Documentation" to create your documentation

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
