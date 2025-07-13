const fs = require('fs');
const path = require('path');
const html2text = require('html-to-text');
const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const { MarkItDown } = require('markitdown');

/**
 * Retrieves a list of files from a specified folder based on the provided criteria.
 * 
 * @param {string} [company] - A string to filter files containing the company name.
 * @param {string} folderPath - The path to the folder where files will be searched.
 * @returns {Array<string>} A list of file paths that match the specified criteria.
 * @throws {Error} If folderPath is not provided
 */
function getFileList(company = null, folderPath = null) {
    if (!folderPath) {
        throw new Error("folderPath must be provided");
    }

    const fileTypes = new Set(['.pdf', '.txt']);
    const fileList = [];

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileExtension = path.extname(file).toLowerCase();

        if (fileTypes.has(fileExtension)) {
            if (company) {
                if (file.includes(company) || file === 'Object Edge.pdf') {
                    fileList.push(file);
                }
            } else {
                fileList.push(file);
            }
        } else if (fileExtension === '.xlsx') {
            try {
                // Convert XLSX to TXT and save under folderPath
                const convertedFile = convertXlsxToTxt(filePath);
                fileList.push(path.basename(convertedFile));
                // Remove the original .xlsx file
                fs.unlinkSync(filePath);
            } catch (e) {
                console.log(`Failed to convert ${file} to TXT: ${e}`);
            }
        } else {
            try {
                // Attempt to convert unsupported file types to .txt using convertToMarkdown
                const convertedFile = convertToMarkdown(filePath);
                fileList.push(path.basename(convertedFile));
            } catch (e) {
                console.log(`Failed to convert ${file} to Markdown: ${e}`);
            }
        }
    }

    console.log(`File list: ${fileList}`);
    return fileList;
}

/**
 * Converts an Excel file (.xlsx) to a text file (.txt).
 * 
 * @param {string} filepath - The path to the Excel file to be converted.
 * @returns {string} The path to the converted text file.
 * @throws {Error} If the file does not exist
 */
function convertXlsxToTxt(filepath) {
    console.log(`Converting file to text: ${filepath}`);

    // Check if the file exists
    if (!fs.existsSync(filepath)) {
        throw new Error(`The file ${filepath} does not exist.`);
    }

    // Read the Excel file
    const workbook = xlsx.readFile(filepath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Create the output text file path with .txt extension
    const textFilepath = filepath.replace(/\.xlsx$/, '.txt');

    // Convert the data to TSV format
    const headers = Object.keys(data[0]);
    const tsvContent = [
        headers.join('\t'),
        ...data.map(row => headers.map(header => row[header]).join('\t'))
    ].join('\n');

    // Write the content to a text file
    fs.writeFileSync(textFilepath, tsvContent, 'utf8');

    console.log(`File converted to text: ${textFilepath}`);
    return textFilepath;
}

/**
 * Converts a file into Markdown format using the MarkItDown library.
 * 
 * @param {string} filepath - The path to the file to be converted.
 * @returns {string} The path to the converted Markdown file.
 * @throws {Error} If the file does not exist
 */
function convertToMarkdown(filepath) {
    console.log(`Converting file to Markdown: ${filepath}`);

    // Initialize MarkItDown
    const md = new MarkItDown();

    if (!fs.existsSync(filepath)) {
        throw new Error(`The file ${filepath} does not exist.`);
    }

    // Read the content of the file
    const content = fs.readFileSync(filepath, 'utf-8');

    // Convert the content to Markdown using MarkItDown
    const markdownContent = md(content);

    // Create the output Markdown file path with .txt extension
    const markdownFilepath = filepath.replace(/\.[^.]+$/, '.txt');

    // Write the converted content to the Markdown file
    fs.writeFileSync(markdownFilepath, markdownContent, 'utf-8');

    console.log(`File converted to Markdown: ${markdownFilepath}`);
    return markdownFilepath;
}

/**
 * Replace placeholders with replacements in originalContent.
 * 
 * @param {string} originalContent - The original content to be modified.
 * @param {Array<string>} placeholders - A list of placeholders to be replaced.
 * @param {Array<string>} replacements - A list of replacements to replace the placeholders.
 * @returns {string} The modified content with placeholders replaced.
 * @throws {Error} If placeholders and replacements are not the same size
 */
function replacePlaceholders(originalContent, placeholders, replacements) {
    if (placeholders.length !== replacements.length) {
        throw new Error("placeholders and replacements must be the same size");
    }

    // Convert all items to strings
    placeholders = placeholders.map(String);
    replacements = replacements.map(String);

    return placeholders.reduce((content, placeholder, index) => {
        return content.replace(new RegExp(placeholder, 'g'), replacements[index]);
    }, originalContent);
}

/**
 * Cleans a JSON-like string by removing Markdown-style code block markers and parses it as a JSON object.
 * 
 * @param {string} text - JSON string with potential formatting issues.
 * @returns {object|string} Parsed JSON object (object) or original text if parsing fails.
 */
function cleanAndParseJson(text) {
    try {
        // Remove leading/trailing code block markers
        const cleanedText = text.trim().replace(/^```json\n?|\n?```$/g, '');
        return JSON.parse(cleanedText);
    } catch {
        console.log(`Failed to parse JSON: ${text}`);
        return text;
    }
}

/**
 * Converts HTML to Markdown, preserving the structure of the given HTML.
 * 
 * @param {string} htmlString - The HTML string to convert.
 * @returns {string} The Markdown equivalent of the HTML.
 */
function htmlToMarkdown(htmlString) {
    const options = {
        ignoreImage: true,
        tables: true,
        wordwrap: false,
        ignoreHref: false,
    };
    
    return html2text.convert(htmlString, options);
}

/**
 * Gets the content of a URL and optionally converts it to markdown format.
 * 
 * @param {string} url - The URL to fetch content from.
 * @returns {string} The HTML content of the URL.
 */
async function getUrlContent(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    console.log($.html());
    return $.html();
    // Commented out as in original:
    // return htmlToMarkdown($.html());
}

/**
 * Extracts the username from a LinkedIn profile URL.
 * 
 * @param {string} url - The LinkedIn profile URL.
 * @returns {string|null} The extracted username or null if not found.
 */
function extractUsernameFromUrl(url) {
    console.log(`Extracting username from URL: ${url}`);
    const match = url.match(/linkedin\.com\/in\/([^/]+)\/?/);
    return match ? match[1] : null;
}

module.exports = {
    getFileList,
    convertXlsxToTxt,
    convertToMarkdown,
    replacePlaceholders,
    cleanAndParseJson,
    htmlToMarkdown,
    getUrlContent,
    extractUsernameFromUrl
};
