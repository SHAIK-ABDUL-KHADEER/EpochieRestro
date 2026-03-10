const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    mobile: { type: String, required: true },
    name: { type: String, required: true },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Otp', OtpSchema);
