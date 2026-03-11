const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing in environment variables!');
}

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate an embedding for a string of text.
 */
async function generateEmbedding(text) {
    try {
        if (!process.env.GEMINI_API_KEY) return [];
        const model = genai.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error.message);
        return [];
    }
}

/**
 * Generate a chat response using Gemini.
 */
async function getChatResponse(prompt) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "AI Chat is currently unavailable. Please check the server configuration (GEMINI_API_KEY).";
        }
        const genModel = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await genModel.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error generating chat response:', error.message);
        if (error.message.includes('API key')) {
            return "I'm having trouble with my API key. Please ensure it's set correctly in the environment.";
        }
        return "I'm sorry, I'm having trouble connecting to the menu right now. Please try again in a moment.";
    }
}

/**
 * Cosine similarity helper
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
    generateEmbedding,
    getChatResponse,
    cosineSimilarity
};
