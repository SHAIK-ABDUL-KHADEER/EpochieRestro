const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sendOTP = async (recipient, otpCode) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey || apiKey === 'your_brevo_api_key_here') {
            console.log(`[MOCK SMS] Sending OTP ${otpCode} to ${recipient}`);
            return { success: true, mocked: true };
        }

        const payload = {
            sender: "Epochie",
            recipient: recipient,
            content: `Your Epochie login code is: ${otpCode}. Valid for 10 minutes.`
        };

        const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo SMS Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Error sending SMS:", error);
        throw error;
    }
};

module.exports = { sendOTP };
