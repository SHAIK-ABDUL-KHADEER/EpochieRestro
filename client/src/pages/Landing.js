import { Link } from 'react-router-dom';
import { ChefHat, QrCode, Sparkles, UtensilsCrossed } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in relative z-10" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid var(--primary)', transform: 'rotate(-5deg)' }}>
                <ChefHat size={64} color="var(--primary)" />
            </div>

            <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: '1', WebkitTextStroke: '1px var(--primary)' }}>
                DINE-IN ORDERING<br />REIMAGINED.
            </h1>

            <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', maxWidth: '600px', marginBottom: '3rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem', textAlign: 'left' }}>
                Epochie empowers restaurants with elegant QR menus, real-time kitchen dashboards, and a smart AI assistant that guides your customers.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
                <Link to="/admin" className="btn btn-primary" style={{ fontSize: '1.25rem' }}>
                    Get Started as Admin
                </Link>
            </div>

            <div className="grid-container" style={{ width: '100%', maxWidth: '1000px', textAlign: 'left' }}>
                <div className="card glass">
                    <QrCode size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Instant QR Menus</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Automatically generate tableside QR codes linking directly to your beautiful mobile-first menu.</p>
                </div>

                <div className="card glass">
                    <UtensilsCrossed size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Kitchen Dashboard</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Receive table orders in real-time. Update statuses and sync instantly with your customers.</p>
                </div>

                <div className="card glass">
                    <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>AI Menu Assistant</h3>
                    <p style={{ color: 'var(--text-muted)' }}>An embedded RAG-powered assistant that answers customer questions about your dishes naturally.</p>
                </div>
            </div>
        </div>
    );
}
