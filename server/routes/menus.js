const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateEmbedding } = require('../services/gemini');

const CAT = 'categories';
const ITEM = 'items';

// Get all categories for a restaurant
router.get('/:restaurantId/categories', (req, res) => {
    try {
        const categories = db.find(CAT, { restaurantId: req.params.restaurantId });
        // sort by order if needed, but simple return is fine
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create category
router.post('/:restaurantId/categories', (req, res) => {
    try {
        const newCategory = { ...req.body, restaurantId: req.params.restaurantId, order: 0 };
        const saved = db.insert(CAT, newCategory);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get items for a category
router.get('/categories/:categoryId/items', (req, res) => {
    try {
        const items = db.find(ITEM, { categoryId: req.params.categoryId });
        // Strip embeddings array from response
        const safeItems = items.map(item => {
            const { embedding, ...rest } = item;
            return rest;
        });
        res.json(safeItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create item WITH RAG Ingestion
router.post('/categories/:categoryId/items', async (req, res) => {
    try {
        const itemData = req.body;

        // 1. Generate text snippet for the embeddings vector
        const textToEmbed = `${itemData.name} - ${itemData.description || ''} - Tags: ${(itemData.tags || []).join(', ')}`;

        // 2. Call Gemini to get the vector
        const embedding = await generateEmbedding(textToEmbed);

        // 3. Save to Local JSON
        // We also need the restaurant ID explicitly to make the chat search easier
        const category = db.findById(CAT, req.params.categoryId);

        const newItem = {
            ...itemData,
            categoryId: req.params.categoryId,
            restaurantId: category.restaurantId,
            embedding: embedding
        };

        const saved = db.insert(ITEM, newItem);

        // Omit embedding from response
        const { embedding: e, ...responseItem } = saved;
        res.status(201).json(responseItem);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Delete item
router.delete('/items/:id', (req, res) => {
    try {
        db.findByIdAndDelete(ITEM, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
