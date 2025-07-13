# Change Log

All notable changes to the "AI-Powered Document Generator" extension will be documented in this file.

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