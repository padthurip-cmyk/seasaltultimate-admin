/**
 * SeaSalt Pickles - Orders Fix
 * =============================
 * Patches the orders navigation
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', () => {
        // Override orders navigation
        const ordersNav = document.querySelector('.nav-item[data-page="orders"]');
        if (ordersNav) {
            ordersNav.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof OrdersPage !== 'undefined') {
                    OrdersPage.show();
                }
            });
        }
    });
    
    console.log('📦 Orders Fix: Loaded');
})();
