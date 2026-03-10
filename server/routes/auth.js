const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOTP } = require('../services/brevo');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { mobile, name } = req.body;
        if (!mobile || !name) {
            return res.status(400).json({ error: 'Mobile and Name are required' });
        }

        const otpCode = generateOTP();

        // Save pending OTP in DB (upsert)
        await Otp.findOneAndUpdate(
            { mobile },
            { name, otpCode, expiresAt: new Date(Date.now() + 10 * 60000) },
            { upsert: true, new: true }
        );

        // Send SMS
        const result = await sendOTP(mobile, otpCode);

        res.json({ success: true, message: 'OTP Sent successfully', mocked: result.mocked, _devOtp: result.mocked ? otpCode : undefined });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobile, otpCode } = req.body;
        if (!mobile || !otpCode) {
            return res.status(400).json({ error: 'Mobile and OTP are required' });
        }

        const pendingOtp = await Otp.findOne({ mobile });
        if (!pendingOtp) {
            return res.status(400).json({ error: 'No OTP requested for this mobile number' });
        }

        if (new Date() > pendingOtp.expiresAt) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        if (pendingOtp.otpCode !== otpCode) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP Valid. Create or update user.
        let user = await User.findOne({ mobile });
        if (!user) {
            user = new User({ mobile, name: pendingOtp.name });
            await user.save();
        } else if (user.name !== pendingOtp.name) {
            user.name = pendingOtp.name;
            await user.save();
        }

        // Delete the used OTP
        await Otp.findByIdAndDelete(pendingOtp._id);

        res.json({ success: true, user: { id: user._id, name: user.name, mobile: user.mobile } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
