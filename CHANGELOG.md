# Change Log

All notable changes to the "AI-Powered Document Generator" extension will be documented in this file.

## [0.1.2] - 2025-07-13

### Added
- Added package categories 'AI' and 'Testing', from valid Marketplace categories.

### Changed
- Replaced old icon with a higher definition one.


## [0.1.0] - 2025-07-13

### Added
- Introduced dynamic file type filtering using `config/validFiletypes.js`, allowing easy customization of supported extensions.
- Implemented a full folder tree view in the extension panel, mirroring the VS Code Explorer experience.
- Added multi-file selection with expandable/collapsible folders.

### Changed
- Replaced flat file list with a hierarchical file tree starting from the workspace root (instead of absolute system paths).
- Refactored backend to use `file.fsPath` and `path.relative()` for accurate cross-platform path handling.

### Fixed
- Fixed issue where file tree incorrectly showed system-level paths (like `C:/`) instead of starting at the workspace folder.

## [0.0.5] - 2024-07-13

### Changed
- Replaced extension icon with a more modern, abstract design (new logo!)

---

## [0.0.4] - 2024-07-13

### Added
- Added application icon alongside extension icon for better brand presence

### Changed
- Replaced initial extension icon with an improved, more polished version

---

## [0.0.3] - 2024-07-13

### Changed
- Updated README and documentation for clearer setup, usage instructions, and feature descriptions

---

## [0.0.2] - 2024-07-13

### Fixed
- Removed reliance on `.env` files for API keys; now uses VS Code configuration or environment variable `GEMINI_API_KEY`
- Fixed runtime errors caused by incorrect `process.env` usage in production builds
- Corrected Gemini API client initialization to pass `{ apiKey }` object as required by `@google/genai`
- Addressed duplicate `apiKey` declaration issue causing debug failures
- Improved error handling for missing or invalid Gemini API key

### Changed
- Updated README with clearer setup instructions and correct use of the official Google Gemini API library
- Cleaned up unused `__dirname`, `fileURLToPath`, and manual path joins in `extension.js`

### Added
- Fallback to use system environment variable if no API key is set in extension configuration (optional for advanced users)

---

## [1.0.0] - 2024-07-12

### Changed
- Rebranded from Playwright-specific to general-purpose documentation generator
- Added support for multiple programming languages
- Introduced new documentation templates for different code types
- Improved file detection and analysis
- Enhanced AI prompts for better documentation generation

### Added
- General code documentation template
- Support for additional file types
- More comprehensive documentation structure
- Improved README with better setup instructions

---

## [0.0.1] - Initial Release
- Basic Playwright test documentation functionality