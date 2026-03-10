const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendOTP } = require('../services/brevo');

const USERS_COLLECTION = 'users';
const OTP_COLLECTION = 'otps'; // to store pending OTPs

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

        // Save pending OTP in DB (upsert-like behavior based on mobile)
        const existingOtp = db.findOne(OTP_COLLECTION, { mobile });
        if (existingOtp) {
            db.findByIdAndUpdate(OTP_COLLECTION, existingOtp._id, { otpCode, name, expiresAt: Date.now() + 10 * 60000 });
        } else {
            db.insert(OTP_COLLECTION, { mobile, name, otpCode, expiresAt: Date.now() + 10 * 60000 });
        }

        // Send SMS
        const result = await sendOTP(mobile, otpCode);

        // For development/mock purposes, we might want to return the code if mocked so we can trace it easily in terminal
        res.json({ success: true, message: 'OTP Sent successfully', mocked: result.mocked, _devOtp: result.mocked ? otpCode : undefined });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 2. Verify OTP
router.post('/verify-otp', (req, res) => {
    try {
        const { mobile, otpCode } = req.body;
        if (!mobile || !otpCode) {
            return res.status(400).json({ error: 'Mobile and OTP are required' });
        }

        const pendingOtp = db.findOne(OTP_COLLECTION, { mobile });
        if (!pendingOtp) {
            return res.status(400).json({ error: 'No OTP requested for this mobile number' });
        }

        if (Date.now() > pendingOtp.expiresAt) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        if (pendingOtp.otpCode !== otpCode) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP Valid. Create or update user.
        let user = db.findOne(USERS_COLLECTION, { mobile });
        if (!user) {
            user = db.insert(USERS_COLLECTION, { mobile, name: pendingOtp.name });
        } else if (user.name !== pendingOtp.name) {
            // Update name if they changed it
            user = db.findByIdAndUpdate(USERS_COLLECTION, user._id, { name: pendingOtp.name });
        }

        // Delete the used OTP
        db.findByIdAndDelete(OTP_COLLECTION, pendingOtp._id);

        res.json({ success: true, user: { id: user._id, name: user.name, mobile: user.mobile } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
