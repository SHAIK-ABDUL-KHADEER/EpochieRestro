const express = require('express');
const router = express.Router();
const db = require('../db');

const COLLECTION = 'restaurants';

// Get all restaurants
router.get('/', (req, res) => {
    try {
        const restaurants = db.readData(COLLECTION);
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get restaurant by slug
router.get('/:slug', (req, res) => {
    try {
        const restaurant = db.findOne(COLLECTION, { slug: req.params.slug });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new restaurant
router.post('/', (req, res) => {
    try {
        const newRestaurant = {
            ...req.body,
            logo: req.body.logo || '',
            address: req.body.address || '',
            contactDetails: req.body.contactDetails || '',
            settings: {
                enableOrdering: true,
                enableAIAssistant: true,
                enableImageDisplay: true,
                enableRecommendations: true,
                enableVoiceAssistant: true
            }
        };

        // check unique slug
        if (db.findOne(COLLECTION, { slug: req.body.slug })) {
            return res.status(400).json({ error: 'Slug already exists' });
        }

        const savedRestaurant = db.insert(COLLECTION, newRestaurant);
        res.status(201).json(savedRestaurant);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Update restaurant settings
router.put('/:id', (req, res) => {
    try {
        const restaurant = db.findByIdAndUpdate(COLLECTION, req.params.id, req.body);
        res.json(restaurant);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
