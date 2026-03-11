import { useState, useEffect } from 'react';
import { api } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, QrCode as QrIcon } from 'lucide-react';

export default function AdminPanel() {
    const [restaurants, setRestaurants] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '', logo: '' });
    const [selectedRest, setSelectedRest] = useState(null);

    // Menu Management State
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState({}); // mapped by categoryId
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [catName, setCatName] = useState('');

    const [showItemModal, setShowItemModal] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [itemForm, setItemForm] = useState({ name: '', price: '', description: '', tags: '' });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const { data } = await api.getRestaurants();
            setRestaurants(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        try {
            await api.createRestaurant(formData);
            setShowModal(false);
            setFormData({ name: '', slug: '', description: '', logo: '' });
            fetchRestaurants();
        } catch (e) {
            alert("Error: " + e.response?.data?.error || e.message);
        }
    };

    // --- Menu Management ---
    const handleSelectRestaurant = async (rest) => {
        setSelectedRest(rest);
        try {
            const { data } = await api.getCategories(rest._id);
            setCategories(data);
            // Fetch items for each category
            const itemsMap = {};
            for (let cat of data) {
                const res = await api.getItems(cat._id);
                itemsMap[cat._id] = res.data;
            }
            setItems(itemsMap);
        } catch (e) { console.error(e); }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.createCategory(selectedRest._id, { name: catName });
            setShowCategoryModal(false);
            setCatName('');
            handleSelectRestaurant(selectedRest); // refresh
        } catch (e) { console.error(e); }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            const tagsArray = itemForm.tags.split(',').map(t => t.trim()).filter(Boolean);
            await api.createItem(activeCategoryId, {
                ...itemForm,
                restaurantId: selectedRest._id,
                price: Number(itemForm.price),
                tags: tagsArray
            });
            setShowItemModal(false);
            setItemForm({ name: '', price: '', description: '', tags: '' });
            handleSelectRestaurant(selectedRest); // refresh
        } catch (e) { console.error(e); }
    };

    const deleteItem = async (itemId) => {
        try {
            await api.deleteItem(itemId);
            handleSelectRestaurant(selectedRest);
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LayoutDashboard color="var(--primary)" /> Platform Admin
                </h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <PlusCircle size={18} /> New Restaurant
                </button>
            </header>

            {!selectedRest ? (
                <div className="grid-container">
                    {restaurants.map(rest => (
                        <div key={rest._id} className="card glass animate-fade-in" style={{ cursor: 'pointer' }} onClick={() => handleSelectRestaurant(rest)}>
                            <h3>{rest.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>/{rest.slug}</p>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Link to={`/restaurants/${rest.slug}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                    Menu
                                </Link>
                                <Link to={`/kitchens/${rest.slug}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                    Kitchen
                                </Link>
                            </div>
                        </div>
                    ))}
                    {restaurants.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No restaurants found. Create one!</p>}
                </div>
            ) : (
                <div className="animate-fade-in">
                    <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => setSelectedRest(null)}>
                        &larr; Back to all
                    </button>

                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {/* Left Col: Settings & QR */}
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <div className="card glass" style={{ marginBottom: '2rem' }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Settings size={20} color="var(--primary)" /> Settings
                                </h2>
                                <h3 className="text-gradient" style={{ fontSize: '2rem' }}>{selectedRest.name}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Slug: {selectedRest.slug}</p>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Description: {selectedRest.description}</p>
                            </div>

                            <div className="card glass" style={{ textAlign: 'center' }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <QrIcon size={20} color="var(--primary)" /> Tableside QR
                                </h2>
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
                                    <QRCodeSVG value={`${window.location.origin}/restaurants/${selectedRest.slug}`} size={150} />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Scan to open Menu</p>
                            </div>
                        </div>

                        {/* Right Col: Menu Builder */}
                        <div style={{ flex: '2', minWidth: '400px' }}>
                            <div className="card glass">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2>Menu Builder</h2>
                                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowCategoryModal(true)}>
                                        + Category
                                    </button>
                                </div>

                                {categories.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No categories yet.</p>}

                                {categories.map(cat => (
                                    <div key={cat._id} style={{ marginBottom: '2rem', borderLeft: '2px solid var(--primary)', paddingLeft: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ color: 'var(--text-main)' }}>{cat.name}</h3>
                                            <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => { setActiveCategoryId(cat._id); setShowItemModal(true); }}>
                                                + Item
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {(items[cat._id] || []).map(item => (
                                                <div key={item._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <p style={{ fontWeight: '600' }}>{item.name} <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>${item.price}</span></p>
                                                        {item.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.description}</p>}
                                                        {item.tags?.length > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem' }}>{item.tags.join(', ')}</p>}
                                                    </div>
                                                    <button style={{ color: 'var(--text-muted)', background: 'transparent' }} onClick={() => deleteItem(item._id)}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE RESTAURANT MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <form className="card glass" style={{ width: '400px' }} onSubmit={handleCreateRestaurant}>
                        <h2 style={{ marginBottom: '1.5rem' }}>New Restaurant</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="input-label">Name</label>
                            <input className="input-field" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Spice Table" />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="input-label">URL Slug</label>
                            <input className="input-field" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. spice-table" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* CREATE CATEGORY MODAL */}
            {showCategoryModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <form className="card glass" style={{ width: '400px' }} onSubmit={handleCreateCategory}>
                        <h2 style={{ marginBottom: '1.5rem' }}>New Category</h2>
                        <input className="input-field" required value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Main Course, Desserts" />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCategoryModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* CREATE ITEM MODAL */}
            {showItemModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <form className="card glass" style={{ width: '400px' }} onSubmit={handleCreateItem}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add Menu Item</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <input className="input-field" required value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item Name" />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <input type="number" step="0.01" className="input-field" required value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="Price (e.g. 12.99)" />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <textarea className="input-field" rows={2} value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description (Good for AI RAG)" />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <input className="input-field" value={itemForm.tags} onChange={e => setItemForm({ ...itemForm, tags: e.target.value })} placeholder="Tags (comma separated: spicy, vegan)" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowItemModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save & Embed</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
