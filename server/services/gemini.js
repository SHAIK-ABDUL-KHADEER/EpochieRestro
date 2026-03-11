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
    if (!text || typeof text !== 'string') return [];
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ Skipping embedding: GEMINI_API_KEY is null');
            return [];
        }
        const model = genai.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent({
            content: { parts: [{ text }] },
            taskType: "RETRIEVAL_DOCUMENT",
        });
        
        if (result && result.embedding && result.embedding.values) {
            return result.embedding.values;
        }
        console.warn('⚠️ Gemini returned empty embedding for text:', text.substring(0, 30));
        return [];
    } catch (error) {
        console.error('❌ Error generating embedding:', error.message);
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
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('❌ Error generating chat response:', error.message);
        if (error.message.includes('API key')) {
            return "I'm having trouble with my API key. Please ensure it's set correctly in the environment (GEMINI_API_KEY).";
        }
        if (error.message.includes('safety')) {
            return "I cannot answer that question as it was flagged by safety filters.";
        }
        return `Backend Error: ${error.message.substring(0, 100)}`;
    }
}

/**
 * Cosine similarity helper
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;
    return dotProduct / magnitude;
}

module.exports = {
    generateEmbedding,
    getChatResponse,
    cosineSimilarity
};
