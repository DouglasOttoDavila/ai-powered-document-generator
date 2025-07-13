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
