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

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const currentTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handlePlaceOrder = async () => {
        if (!tableNumber) return alert("Please enter your table number.");
        if (cart.length === 0) return alert("Cart is empty.");

        const orderData = {
            restaurantId: restaurant._id,
            tableNumber,
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

                {restaurant.settings?.enableAIAssistant !== false && (
                    <button
                        className="btn btn-primary animate-fade-in"
                        onClick={() => setIsChatOpen(true)}
                        style={{ borderRadius: '50%', width: '60px', height: '60px', padding: 0, boxShadow: '0 4px 20px rgba(255, 51, 102, 0.4)' }}
                    >
                        <Sparkles size={24} />
                    </button>
                )}

                <button
                    className="btn glass animate-fade-in"
                    onClick={() => setIsCartOpen(true)}
                    style={{ borderRadius: '50%', width: '60px', height: '60px', padding: 0, position: 'relative', background: 'var(--bg-card)' }}
                >
                    <ShoppingCart size={24} />
                    {cart.length > 0 && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                                <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={handlePlaceOrder}>
                                    Confirm & Place Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
