const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateEmbedding, generateChatResponse, cosineSimilarity } = require('../services/gemini');

router.post('/:restaurantId', async (req, res) => {
    try {
        const { query } = req.body;
        const { restaurantId } = req.params;

        if (!query) return res.status(400).json({ error: 'Query is required' });

        // 1. Generate text embedding for the user's question
        const queryEmbedding = await generateEmbedding(query);

        // 2. Fetch all menu items for THIS restaurant
        const allItems = db.find('items', { restaurantId });
        const allCategories = db.find('categories', { restaurantId });

        if (allItems.length === 0) {
            return res.json({ response: "This restaurant hasn't added any menu items yet." });
        }

        // 3. Calculate cosine similarity
        const scoredItems = allItems.map(item => {
            // Find category name
            const category = allCategories.find(c => c._id === item.categoryId);
            const categoryName = category ? category.name : 'Unknown';

            const score = cosineSimilarity(queryEmbedding, item.embedding);

            return {
                _id: item._id,
                name: item.name,
                description: item.description,
                price: item.price,
                categoryName: categoryName,
                score: score
            };
        });

        // 4. Sort by highest similarity
        scoredItems.sort((a, b) => b.score - a.score);

        // 5. Take the top 10 most relevant items to form the context window
        const topContextItems = scoredItems.slice(0, 10);

        // 6. Generate final response
        const finalResponseText = await generateChatResponse(query, topContextItems);

        res.json({ response: finalResponseText });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: err.message, response: 'Sorry, the AI is currently unavailable.' });
    }
});

module.exports = router;
