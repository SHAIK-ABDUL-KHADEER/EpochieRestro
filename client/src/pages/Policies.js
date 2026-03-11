import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const PolicyLayout = ({ title, children }) => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
            <button 
                onClick={() => window.history.back()} 
                className="btn btn-secondary" 
                style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}
            >
                <ArrowLeft size={18} /> Back
            </button>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{title}</h1>
            <div className="card glass animate-fade-in" style={{ padding: '2rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                {children}
            </div>
        </div>
    );
};

export const PrivacyPolicy = () => (
    <PolicyLayout title="Privacy Policy">
        <p>Last updated: March 11, 2026</p>
        <h3 style={{ marginTop: '1.5rem' }}>1. Information We Collect</h3>
        <p>We collect your mobile number and name to facilitate order tracking and communication between you and the restaurant. We do not sell your personal data.</p>
        
        <h3 style={{ marginTop: '1.5rem' }}>2. How We Use Information</h3>
        <p>Your data is used solely to provide the services of Epochie, including OTP verification and order status updates.</p>
        
        <h3 style={{ marginTop: '1.5rem' }}>3. Data Security</h3>
        <p>We implement industry-standard security measures to protect your information.</p>
        
        <p style={{ marginTop: '2rem' }}>Contact us at <strong>support@epochie.com</strong> for any privacy concerns.</p>
    </PolicyLayout>
);

export const TermsOfService = () => (
    <PolicyLayout title="Terms of Service">
        <p>Last updated: March 11, 2026</p>
        <h3 style={{ marginTop: '1.5rem' }}>1. Acceptance of Terms</h3>
        <p>By using Epochie, you agree to these terms. Epochie is a platform connecting customers and restaurants.</p>
        
        <h3 style={{ marginTop: '1.5rem' }}>2. Use of Service</h3>
        <p>You agree to provide accurate information (Name, Mobile) for order processing.</p>
        
        <h3 style={{ marginTop: '1.5rem' }}>3. Limitation of Liability</h3>
        <p>Epochie is not responsible for the quality of food or service provided by individual restaurants.</p>
        
        <p style={{ marginTop: '2rem' }}>Questions? Contact <strong>support@epochie.com</strong></p>
    </PolicyLayout>
);

export const RefundPolicy = () => (
    <PolicyLayout title="Refund Policy">
        <p>Last updated: March 11, 2026</p>
        <h3 style={{ marginTop: '1.5rem' }}>1. Refund Eligibility</h3>
        <p>Refunds for food orders are handled directly by the restaurant where the order was placed. Epochie does not process payments or refunds directly.</p>
        
        <h3 style={{ marginTop: '1.5rem' }}>2. How to Request a Refund</h3>
        <p>Please contact the restaurant staff immediately if there is an issue with your order.</p>
        
        <p style={{ marginTop: '2rem' }}>For platform-related issues, contact <strong>support@epochie.com</strong></p>
    </PolicyLayout>
);
