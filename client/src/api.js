import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:5000/api';

export const api = {
    // Restaurants
    getRestaurants: () => axios.get(`${API_URL}/restaurants`),
    getRestaurantBySlug: (slug) => axios.get(`${API_URL}/restaurants/${slug}`),
    createRestaurant: (data) => axios.post(`${API_URL}/restaurants`, data),
    updateRestaurantSettings: (id, data) => axios.put(`${API_URL}/restaurants/${id}`, data),

    // Menus
    getCategories: (restaurantId) => axios.get(`${API_URL}/menus/${restaurantId}/categories`),
    createCategory: (restaurantId, data) => axios.post(`${API_URL}/menus/${restaurantId}/categories`, data),
    getItems: (categoryId) => axios.get(`${API_URL}/menus/categories/${categoryId}/items`),
    createItem: (categoryId, data) => axios.post(`${API_URL}/menus/categories/${categoryId}/items`, data),
    deleteItem: (itemId) => axios.delete(`${API_URL}/menus/items/${itemId}`),

    // Orders
    getOrders: (restaurantId) => axios.get(`${API_URL}/orders/${restaurantId}`),
    placeOrder: (data) => axios.post(`${API_URL}/orders`, data),
    updateOrderStatus: (orderId, status) => axios.put(`${API_URL}/orders/${orderId}/status`, { status }),

    // Chat RAG
    chat: (restaurantId, query) => axios.post(`${API_URL}/chat/${restaurantId}`, { query }),

    // Auth
    sendOtp: (data) => axios.post(`${API_URL}/auth/send-otp`, data),
    verifyOtp: (data) => axios.post(`${API_URL}/auth/verify-otp`, data)
};
