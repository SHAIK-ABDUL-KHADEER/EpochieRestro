const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { generateEmbedding, getChatResponse } = require('../services/gemini');

// Helper for cosine similarity
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
}

router.post('/:restaurantId', async (req, res) => {
    try {
        const { query } = req.body;
        const { restaurantId } = req.params;

        // 1. Generate query embedding
        const queryVector = await generateEmbedding(query);

        // 2. Fetch all menu items for this restaurant
        const items = await MenuItem.find({ restaurantId });

        // 3. Find top 5 similar items locally
        // (Using local similarity as Atlas Vector Search requires index setup)
        const scoredItems = items
            .filter(i => i.embedding && i.embedding.length > 0)
            .map(item => ({
                item,
                score: cosineSimilarity(queryVector, item.embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // 4. Construct Context String
        const context = scoredItems
            .map(s => `${s.item.name}: ${s.item.description} ($${s.item.price})`)
            .join('\n');

        // 5. Get AI Response
        const prompt = `You are a helpful restaurant assistant for ${restaurantId}. 
          Below are relevant items from our menu:
          ${context}
          
          User Question: ${query}
          
          Provide a friendly and concise answer based ONLY on the provided menu context.`;

        const response = await getChatResponse(prompt);
        res.json({ response });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chat processing failed' });
    }
});

module.exports = router;
