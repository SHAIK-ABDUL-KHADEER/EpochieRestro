import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Clock, CheckCircle, ChefHat, ArrowLeft, UtensilsCrossed } from 'lucide-react';

export default function KitchenDashboard() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(loadDashboard, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [slug]);

    const loadDashboard = async () => {
        try {
            if (!restaurant) {
                const { data: restData } = await api.getRestaurantBySlug(slug);
                setRestaurant(restData);
                const { data: ordersData } = await api.getOrders(restData._id);
                setOrders(ordersData);
            } else {
                const { data: ordersData } = await api.getOrders(restaurant._id);
                setOrders(ordersData);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await api.updateOrderStatus(orderId, status);
            loadDashboard();
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Received': return '#f59e0b'; // warning/orange
            case 'Preparing': return '#3b82f6'; // blue
            case 'Ready': return '#10b981'; // green
            case 'Delivered': return '#64748b'; // gray
            default: return 'var(--text-muted)';
        }
    };

    if (!restaurant) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading kitchen...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={18} /> Admin
                </Link>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <ChefHat color="var(--primary)" /> {restaurant?.name || 'Kitchen'} Logs
                </h1>
            </div>

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {orders.map(order => (
                    <div key={order._id} className="card glass animate-fade-in" style={{ borderTop: `4px solid ${getStatusColor(order.status)}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem' }}>Table {order.tableNumber}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    <Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                            </div>

                            <span style={{ background: `${getStatusColor(order.status)}33`, color: getStatusColor(order.status), padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                {order.status}
                            </span>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', minHeight: '100px' }}>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                    <span style={{ fontWeight: '600' }}><span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{item.quantity}x</span> {item.name}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {order.status === 'Received' && (
                                <button className="btn" style={{ flex: 1, background: '#3b82f6', color: 'white' }} onClick={() => updateStatus(order._id, 'Preparing')}>
                                    Start Preparing
                                </button>
                            )}
                            {order.status === 'Preparing' && (
                                <button className="btn" style={{ flex: 1, background: '#10b981', color: 'white' }} onClick={() => updateStatus(order._id, 'Ready')}>
                                    <CheckCircle size={18} /> Mark Ready
                                </button>
                            )}
                            {order.status === 'Ready' && (
                                <button className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-light)', color: 'white' }} onClick={() => updateStatus(order._id, 'Delivered')}>
                                    Mark Delivered
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <UtensilsCrossed size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p>No active orders right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
