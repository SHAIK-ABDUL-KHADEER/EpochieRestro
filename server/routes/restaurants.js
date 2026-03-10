const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
});

// Get single restaurant by slug
router.get('/:slug', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ slug: req.params.slug });
        if (!restaurant) return res.status(404).json({ error: 'Not found' });
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch restaurant' });
    }
});

// Create restaurant
router.post('/', async (req, res) => {
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create restaurant' });
    }
});

// Update settings
router.put('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update restaurant' });
    }
});

module.exports = router;
