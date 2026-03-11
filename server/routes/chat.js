const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { generateEmbedding, getChatResponse } = require('../services/gemini');

// Helper for cosine similarity
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
}

router.post('/:restaurantId', async (req, res) => {
    try {
        const { query } = req.body;
        const { restaurantId } = req.params;

        // 1. Fetch restaurant info
        const restaurant = await Restaurant.findById(restaurantId);
        const restaurantName = restaurant ? restaurant.name : "our restaurant";

        // 2. Generate query embedding
        const queryVector = await generateEmbedding(query);

        // 3. Fetch all menu items for this restaurant
        const items = await MenuItem.find({ restaurantId });

        // 4. Find top 5 similar items locally
        const scoredItems = items
            .filter(i => i.embedding && i.embedding.length > 0)
            .map(item => ({
                item,
                score: cosineSimilarity(queryVector, item.embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // 5. Construct Context String
        const context = scoredItems
            .map(s => `${s.item.name}: ${s.item.description} ($${s.item.price})`)
            .join('\n');

        // 6. Get AI Response
        const prompt = `You are a helpful restaurant assistant for "${restaurantName}". 
          Below are relevant items from our menu:
          ${context}
          
          User Question: ${query}
          
          Provide a friendly and concise answer based ONLY on the provided menu context. If no items are relevant, just inform the user what we generally offer or ask for clarification.`;

        const response = await getChatResponse(prompt);
        res.json({ response });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chat processing failed' });
    }
});

module.exports = router;
