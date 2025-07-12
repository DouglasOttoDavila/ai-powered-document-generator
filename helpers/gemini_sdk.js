require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');
const { cleanAndParseJson } = require('./helpers/general_helpers');

async function getGeminiResponse(systemPrompt = null, prompt = null, useFile = false, fileList = null) {
    console.log(`Starting Gemini request with prompt: ${prompt}`);
    const client = new GoogleGenAI (process.env.GEMINI_API_KEY);

    if (useFile) {
        const response = [];
        console.log(`file_list: ${fileList}`);

        // Upload client's files from static/content folder
        for (const file of fileList) {
            console.log(`Uploading file ${file}...`);
            try {
                const filePath = path.join('static', 'content', file);
                const fileContent = await fs.readFile(filePath);
                const upload_response = await client.upload(fileContent);
                console.log(`Uploaded file ${file}\n${upload_response}`);
                response.push(upload_response);
            } catch {
                console.log(`Error uploading file ${file}`);
            }
        }

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent({
            contents: [...response, prompt],
            config: {
                systemInstruction: [systemPrompt],
                temperature: 0.1
            }
        });

        return await handleResponse(result, useFile, fileList);
    } else {
        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent({
            contents: prompt
        });

        return await handleResponse(result, useFile, fileList);
    }
}

async function handleResponse(response, useFile, fileList) {
    let cleanResponse;
    try {
        cleanResponse = cleanAndParseJson(response.text);
        console.log('### GEMINI RESPONSE:', cleanResponse);
    } catch {
        cleanResponse = response.text;
    }

    // Delete uploaded files except "Object Edge.pdf"
    if (useFile) {
        for (const file of fileList) {
            if (file !== "Object Edge.pdf") {
                try {
                    await fs.unlink(path.join('static', 'content', file));
                    console.log(`Deleted file ${file}`);
                } catch {
                    console.log(`Error deleting file ${file}`);
                }
            }
        }
    }

    return cleanResponse;
}

module.exports = {
    getGeminiResponse
};
