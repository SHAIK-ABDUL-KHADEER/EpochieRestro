const express = require('express');
const router = express.Router();
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const { generateEmbedding } = require('../services/gemini');

// --- CATEGORIES ---

// Get all categories for a restaurant
router.get('/:restaurantId/categories', async (req, res) => {
    try {
        const categories = await MenuCategory.find({ restaurantId: req.params.restaurantId }).sort('order');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create a category
router.post('/:restaurantId/categories', async (req, res) => {
    try {
        const category = new MenuCategory({
            ...req.body,
            restaurantId: req.params.restaurantId
        });
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// --- ITEMS ---

// Get items for a category
router.get('/categories/:categoryId/items', async (req, res) => {
    try {
        const items = await MenuItem.find({ categoryId: req.params.categoryId });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Create item (with RAG Embedding)
router.post('/categories/:categoryId/items', async (req, res) => {
    try {
        const { name, description, price, tags, restaurantId } = req.body;

        // Generate embedding for RAG
        let embedding = [];
        try {
            embedding = await generateEmbedding(`${name} - ${description}`);
        } catch (e) {
            console.error("Embedding generation failed, continuing without one.");
        }

        const item = new MenuItem({
            restaurantId,
            categoryId: req.params.categoryId,
            name,
            description,
            price,
            tags,
            embedding
        });

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Delete item
router.delete('/items/:itemId', async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.itemId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router;
