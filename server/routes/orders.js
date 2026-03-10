const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get orders for a restaurant (Kitchen view)
router.get('/:restaurantId', async (req, res) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort('-createdAt');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Place a new order
router.post('/', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;
