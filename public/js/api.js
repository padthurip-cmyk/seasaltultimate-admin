/**
 * SeaSalt Pickles - API Module
 * =============================
 */

const API = (function() {
    const BASE_URL = '/.netlify/functions';
    const USE_LOCAL_DATA = true;
    
    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }
    
    async function getProducts() {
        if (USE_LOCAL_DATA) return { data: null };
        return request('/products');
    }
    
    async function getCategories() {
        if (USE_LOCAL_DATA) return { data: null };
        return request('/categories');
    }
    
    async function getSiteConfig() {
        if (USE_LOCAL_DATA) return { data: null };
        return request('/config');
    }
    
    async function createOrder(orderData) {
        return { success: true, orderId: orderData.id };
    }
    
    async function getOrders(userId) {
        const orders = JSON.parse(localStorage.getItem('seasalt_orders') || '[]');
        return { data: orders };
    }
    
    return { getProducts, getCategories, getSiteConfig, createOrder, getOrders };
})();

window.API = API;
