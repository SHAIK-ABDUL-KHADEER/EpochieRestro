const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate an embedding for a string of text.
 * Used when ingestion new menu items.
 */
async function generateEmbedding(text) {
    try {
        const response = await genai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });
        // The embedding is typically in response.embeddings[0].values
        // For the REST api the response format is embeddings[0].values, let's just make sure we extract it
        return response.embeddings[0].values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return [];
    }
}

/**
 * Generate a chat response using Gemini.
 */
async function getChatResponse(prompt) {
    try {
        const genModel = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await genModel.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error generating chat response:', error);
        return "I'm sorry, I'm having trouble connecting to the menu right now.";
    }
}

/**
 * Cosine similarity helper for local MongoDB RAG implementation
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
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
