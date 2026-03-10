import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { ShoppingCart, Sparkles, MessageSquare, Send, X, ArrowLeft } from 'lucide-react';

export default function RestaurantMenu() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState({});
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [tableNumber, setTableNumber] = useState('');

    // Auth State
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('epochie_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [authModal, setAuthModal] = useState({ show: false, step: 'request' }); // request | verify
    const [authForm, setAuthForm] = useState({ name: '', mobile: '', otp: '' });
    const [authLoading, setAuthLoading] = useState(false);

    // Order Tracking State
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [myOrders, setMyOrders] = useState([]);

    // AI Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        loadMenu();
    }, [slug]);

    useEffect(() => {
        if (isOrdersOpen && user) {
            fetchMyOrders();
        }
    }, [isOrdersOpen, user]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory]);

    const loadMenu = async () => {
        try {
            const { data: restData } = await api.getRestaurantBySlug(slug);
            setRestaurant(restData);

            const { data: cats } = await api.getCategories(restData._id);
            setCategories(cats);

            const itemsMap = {};
            for (const cat of cats) {
                const { data: catItems } = await api.getItems(cat._id);
                itemsMap[cat._id] = catItems;
            }
            setItems(itemsMap);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const { data } = await api.getOrders(restaurant._id);
            // Filter only the authenticated user's orders
            const filtered = data.filter(o => o.userMobile === user.mobile);
            setMyOrders(filtered);
        } catch (e) {
            console.error("Failed to load orders");
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const currentTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const initiateCheckout = () => {
        if (!tableNumber) return alert("Please enter your table number.");
        if (cart.length === 0) return alert("Cart is empty.");

        if (!user) {
            setAuthModal({ show: true, step: 'request' });
        } else {
            handlePlaceOrder();
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            await api.sendOtp({ name: authForm.name, mobile: authForm.mobile });
            setAuthModal({ show: true, step: 'verify' });
        } catch (err) {
            alert("Failed to send OTP.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            const { data } = await api.verifyOtp({ mobile: authForm.mobile, otpCode: authForm.otp });
            setUser(data.user);
            localStorage.setItem('epochie_user', JSON.stringify(data.user));
            setAuthModal({ show: false, step: 'request' });

            // Proceed to place order now that we're logged in
            await handlePlaceOrder(data.user);
        } catch (err) {
            alert("Invalid OTP.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handlePlaceOrder = async (orderUser = user) => {
        const orderData = {
            restaurantId: restaurant._id,
            tableNumber,
            userId: orderUser.id,
            userName: orderUser.name,
            userMobile: orderUser.mobile,
            items: cart.map(i => ({
                menuItemId: i._id,
                name: i.name,
                quantity: i.qty,
                price: i.price
            })),
            totalAmount: currentTotal
        };

        try {
            await api.placeOrder(orderData);
            setCart([]);
            setIsCartOpen(false);
            alert("Order placed successfully! The kitchen is preparing your food.");
        } catch (e) {
            alert("Failed to place order.");
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const query = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: query }]);
        setIsChatLoading(true);

        try {
            const { data } = await api.chat(restaurant._id, query);
            setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (!restaurant) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading menu...</div>;

    return (
        <div style={{ paddingBottom: '100px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

            {/* Header Info */}
            <div className="card glass animate-fade-in" style={{ margin: '1rem', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{restaurant.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{restaurant.description}</p>
            </div>

            {/* Categories & Items Loop */}
            <div style={{ padding: '0 1rem' }}>
                {categories.map(cat => (
                    <div key={cat._id} className="animate-fade-in" style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                            {cat.name}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {(items[cat._id] || []).map(item => (
                                <div key={item._id} className="card glass flex items-center" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{item.description}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>${item.price.toFixed(2)}</span>
                                            {item.tags?.map(t => (
                                                <span key={t} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '1rem', color: 'var(--warning)' }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="btn btn-secondary" onClick={() => addToCart(item)} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}>
                                        +
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Buttons */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 40 }}>

                {user && (
                    <button
                        className="btn glass animate-fade-in"
                        onClick={() => setIsOrdersOpen(true)}
                        style={{ width: '60px', height: '60px', padding: 0, position: 'relative', background: 'var(--bg-card)' }}
                    >
                        {/* Bell Icon for notifications */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>
                )}

                {restaurant.settings?.enableAIAssistant !== false && (
                    <button
                        className="btn btn-primary animate-fade-in"
                        onClick={() => setIsChatOpen(true)}
                        style={{ width: '60px', height: '60px', padding: 0 }}
                    >
                        <Sparkles size={24} color="var(--bg-dark)" />
                    </button>
                )}

                <button
                    className="btn glass animate-fade-in"
                    onClick={() => setIsCartOpen(true)}
                    style={{ width: '60px', height: '60px', padding: 0, position: 'relative', background: 'var(--bg-card)' }}
                >
                    <ShoppingCart size={24} color="var(--primary)" />
                    {cart.length > 0 && (
                        <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary)', color: 'var(--bg-dark)', fontSize: '0.875rem', fontWeight: 'bold', width: '28px', height: '28px', border: '2px solid var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cart.reduce((s, i) => s + i.qty, 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* AI Assistant Chat Modal */}
            {isChatOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-dark)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
                    <header className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                        <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)' }}>
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={18} color="var(--primary)" /> Epochie AI Guide
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ask me anything about the menu!</p>
                        </div>
                    </header>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {chatHistory.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                                <MessageSquare size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                <p>Try asking: "What's the best spicy dish?"</p>
                            </div>
                        )}

                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)', padding: '1rem', borderRadius: '1rem', borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem', borderBottomLeftRadius: msg.role === 'ai' ? '0.25rem' : '1rem' }}>
                                <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                            </div>
                        ))}

                        {isChatLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', padding: '1rem', borderRadius: '1rem' }}>
                                <p className="animate-fade-in" style={{ color: 'var(--text-muted)' }}>Thinking...</p>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChatSubmit} className="glass" style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
                        <input
                            className="input-field"
                            style={{ flex: 1, borderRadius: '2rem' }}
                            placeholder="Ask about the menu..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }} disabled={isChatLoading}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* Cart Slider */}
            {isCartOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '400px', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Your Order</h2>
                            <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {cart.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cart.map(item => (
                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div>
                                                <p style={{ fontWeight: '500' }}>{item.qty}x {item.name}</p>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>${(item.price * item.qty).toFixed(2)}</p>
                                            </div>
                                            <button style={{ color: 'var(--primary)', background: 'transparent' }} onClick={() => removeFromCart(item._id)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span>${currentTotal.toFixed(2)}</span>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label">Table Number</label>
                                    <input className="input-field" required value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="e.g. 12" />
                                </div>

                                <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={initiateCheckout}>
                                    Confirm & Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            {authModal.show && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '400px', margin: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>{authModal.step === 'request' ? 'Your Details' : 'Verify OTP'}</h2>
                            <button onClick={() => setAuthModal({ show: false, step: 'request' })} style={{ background: 'transparent', color: 'var(--text-main)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {authModal.step === 'request' ? (
                            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Full Name</label>
                                    <input className="input-field" required value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="input-label">Mobile Number (with country code)</label>
                                    <input className="input-field" required value={authForm.mobile} onChange={e => setAuthForm({ ...authForm, mobile: e.target.value })} placeholder="+1234567890" />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={authLoading}>
                                    {authLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter the 6-digit code sent to {authForm.mobile}</p>
                                <div>
                                    <label className="input-label">OTP Code</label>
                                    <input className="input-field" required value={authForm.otp} onChange={e => setAuthForm({ ...authForm, otp: e.target.value })} placeholder="123456" maxLength={6} style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.25rem' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={authLoading}>
                                    {authLoading ? 'Verifying...' : 'Verify & Place Order'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* My Orders Slider */}
            {isOrdersOpen && user && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '400px', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s', borderRight: '1px solid var(--border-light)', borderLeft: 'none' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                My Orders <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 'normal' }}>({user.name})</span>
                            </h2>
                            <button onClick={() => setIsOrdersOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {myOrders.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>You have no recent orders.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {myOrders.map(order => (
                                        <div key={order._id} className="card glass" style={{ padding: '1rem', borderLeft: order.status === 'Ready' ? '4px solid var(--primary)' : '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString()}</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: order.status === 'Ready' || order.status === 'Delivered' ? 'var(--primary)' : 'var(--text-main)' }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.9rem' }}>{item.quantity}x {item.name}</div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Table {order.tableNumber}</span>
                                                <span style={{ fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
