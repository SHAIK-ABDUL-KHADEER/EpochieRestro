const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: '' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    contactDetails: { type: String, default: '' },
    settings: {
        enableOrdering: { type: Boolean, default: true },
        enableAIAssistant: { type: Boolean, default: true },
        enableImageDisplay: { type: Boolean, default: true },
        enableRecommendations: { type: Boolean, default: true },
        enableVoiceAssistant: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
