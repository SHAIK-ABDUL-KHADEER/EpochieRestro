const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: String, required: true },
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Received', 'Preparing', 'Ready', 'Delivered'],
        default: 'Received'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
