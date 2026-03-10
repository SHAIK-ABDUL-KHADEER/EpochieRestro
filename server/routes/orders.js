const express = require('express');
const router = express.Router();
const db = require('../db');

const COLLECTION = 'orders';

// Get all orders for yesterday/today (kitchen dashboard polling)
router.get('/:restaurantId', (req, res) => {
    try {
        const orders = db.find(COLLECTION, { restaurantId: req.params.restaurantId });
        // sort newest first
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Place new order
router.post('/', (req, res) => {
    try {
        const newOrder = {
            ...req.body,
            status: 'Received'
        };
        const saved = db.insert(COLLECTION, newOrder);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update order status
router.put('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const order = db.findByIdAndUpdate(COLLECTION, req.params.id, { status });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
