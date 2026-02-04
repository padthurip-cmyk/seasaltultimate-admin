/**
 * SeaSalt Pickles - Orders Module
 * ================================
 */

(function() {
    'use strict';
    
    const ORDERS_KEY = 'seasalt_orders';
    
    const ORDER_STATUS = {
        'pending': { label: 'Order Placed', icon: '📝', bg: 'bg-yellow-100 text-yellow-800' },
        'confirmed': { label: 'Confirmed', icon: '✅', bg: 'bg-blue-100 text-blue-800' },
        'preparing': { label: 'Preparing', icon: '👨‍🍳', bg: 'bg-orange-100 text-orange-800' },
        'shipped': { label: 'Shipped', icon: '🚚', bg: 'bg-purple-100 text-purple-800' },
        'out_for_delivery': { label: 'Out for Delivery', icon: '📦', bg: 'bg-indigo-100 text-indigo-800' },
        'delivered': { label: 'Delivered', icon: '🎉', bg: 'bg-green-100 text-green-800' },
        'cancelled': { label: 'Cancelled', icon: '❌', bg: 'bg-red-100 text-red-800' }
    };
    
    function getOrders() {
        try {
            return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
        } catch (e) { return []; }
    }
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
    
    function showOrdersPage() {
        const orders = getOrders();
        
        const modal = document.createElement('div');
        modal.id = 'orders-page';
        modal.className = 'fixed inset-0 z-[90] bg-pickle-50';
        modal.innerHTML = `
            <div class="h-full flex flex-col">
                <header class="bg-white px-4 py-4 flex items-center gap-4 shadow-sm">
                    <button id="close-orders" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <h1 class="text-xl font-bold text-gray-800">My Orders</h1>
                </header>
                <div class="flex-1 overflow-y-auto p-4 pb-24">
                    ${orders.length === 0 ? `
                        <div class="text-center py-16">
                            <div class="text-6xl mb-4">📦</div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
                            <p class="text-gray-500 mb-6">Start shopping to see your orders here</p>
                            <button id="start-shopping" class="px-6 py-3 bg-pickle-500 text-white font-bold rounded-xl">Start Shopping</button>
                        </div>
                    ` : `
                        <div class="space-y-4">
                            ${orders.map(order => {
                                const status = ORDER_STATUS[order.status] || ORDER_STATUS.confirmed;
                                return `
                                    <div class="bg-white rounded-2xl p-4 shadow-sm">
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="font-bold text-pickle-600">${order.id}</span>
                                            <span class="px-2 py-1 rounded-full text-xs font-medium ${status.bg}">${status.icon} ${status.label}</span>
                                        </div>
                                        <div class="flex gap-3 mb-3">
                                            ${(order.items || []).slice(0, 3).map(item => `
                                                <img src="${item.image || 'https://via.placeholder.com/60'}" class="w-14 h-14 rounded-lg object-cover" alt="${item.name}">
                                            `).join('')}
                                            ${(order.items?.length || 0) > 3 ? `<div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">+${order.items.length - 3}</div>` : ''}
                                        </div>
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-500">${formatDate(order.createdAt)}</span>
                                            <span class="font-bold">₹${order.total || 0}</span>
                                        </div>
                                        ${order.shipping ? `
                                            <div class="mt-3 pt-3 border-t text-sm">
                                                <span class="text-gray-500">Tracking:</span>
                                                <span class="font-medium ml-1">${order.shipping.trackingNumber}</span>
                                                <span class="text-gray-400 ml-1">(${order.shipping.partner})</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#close-orders')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#start-shopping')?.addEventListener('click', () => modal.remove());
    }
    
    // Expose globally
    window.OrdersPage = { show: showOrdersPage, getOrders };
})();
