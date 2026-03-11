import { Link } from 'react-router-dom';
import { Mail, Shield, FileText, RefreshCcw } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="glass" style={{ 
            marginTop: '4rem', 
            padding: '3rem 1rem', 
            borderTop: '1px solid var(--border-light)',
            background: 'rgba(0,0,0,0.8)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Epochie</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Modern QR-based ordering platform for smart restaurants. Scan, Order, Enjoy.
                    </p>
                </div>

                <div style={{ flex: '1', minWidth: '200px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>Support</h4>
                    <a href="mailto:support@epochie.com" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        <Mail size={16} color="var(--primary)" /> support@epochie.com
                    </a>
                </div>

                <div style={{ flex: '1', minWidth: '200px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>Legal</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link to="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <Shield size={16} /> Privacy Policy
                        </Link>
                        <Link to="/terms" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <FileText size={16} /> Terms of Service
                        </Link>
                        <Link to="/refund" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <RefreshCcw size={16} /> Refund Policy
                        </Link>
                    </div>
                </div>
            </div>
            
            <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    © {new Date().getFullYear()} Epochie Platforms. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
