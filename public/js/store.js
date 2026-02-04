/**
 * SeaSalt Pickles - Store Module
 * ================================
 * Centralized state management
 */

const Store = (function() {
    let state = {
        products: [],
        categories: [],
        cart: [],
        user: null,
        wallet: { balance: 0, transactions: [] },
        siteConfig: {},
        selectedProduct: null,
        selectedVariant: null,
        quantity: 1,
        activeCategory: 'all',
        useWallet: false,
        currentPage: 'home'
    };
    
    const subscribers = { cart: [], wallet: [], user: [], products: [] };
    
    function init() {
        loadFromStorage();
    }
    
    function loadFromStorage() {
        try {
            const savedCart = localStorage.getItem('seasalt_cart');
            if (savedCart) state.cart = JSON.parse(savedCart);
            
            const savedUser = localStorage.getItem('seasalt_user');
            if (savedUser) state.user = JSON.parse(savedUser);
            
            const savedWallet = localStorage.getItem('seasalt_wallet');
            if (savedWallet) state.wallet = JSON.parse(savedWallet);
        } catch (e) { console.error('Storage error:', e); }
    }
    
    function saveToStorage() {
        try {
            localStorage.setItem('seasalt_cart', JSON.stringify(state.cart));
            localStorage.setItem('seasalt_user', JSON.stringify(state.user));
            localStorage.setItem('seasalt_wallet', JSON.stringify(state.wallet));
        } catch (e) { console.error('Storage error:', e); }
    }
    
    function subscribe(key, callback) {
        if (subscribers[key]) subscribers[key].push(callback);
    }
    
    function notify(key) {
        if (subscribers[key]) subscribers[key].forEach(cb => cb(state[key]));
    }
    
    function getState() { return state; }
    function getProducts() { return state.products; }
    function getCategories() { return state.categories; }
    
    function getActiveProducts() {
        if (state.activeCategory === 'all') {
            return state.products.filter(p => p.isActive !== false);
        }
        return state.products.filter(p => p.isActive !== false && p.category === state.activeCategory);
    }
    
    function getCart() {
        const items = state.cart;
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = subtotal >= 500 ? 0 : 50;
        let walletDiscount = 0;
        if (state.useWallet && state.wallet.balance > 0) {
            walletDiscount = Math.min(state.wallet.balance, subtotal + deliveryCharge);
        }
        const total = Math.max(0, subtotal + deliveryCharge - walletDiscount);
        return { items, subtotal, deliveryCharge, walletDiscount, total, useWallet: state.useWallet };
    }
    
    function getCartItemCount() {
        return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    function getWalletBalance() { return state.wallet.balance; }
    
    function searchProducts(query) {
        const q = query.toLowerCase();
        return state.products.filter(p => 
            p.isActive !== false && (
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            )
        );
    }
    
    function setProducts(products) { state.products = products; notify('products'); }
    function setCategories(categories) { state.categories = categories; }
    function setSiteConfig(config) { state.siteConfig = config; }
    function setActiveCategory(cat) { state.activeCategory = cat; }
    function setSelectedProduct(product) {
        state.selectedProduct = product;
        state.selectedVariant = product?.variants?.[0] || null;
        state.quantity = 1;
    }
    function setSelectedVariant(variant) { state.selectedVariant = variant; }
    function setQuantity(qty) { state.quantity = qty; }
    function setUseWallet(use) { state.useWallet = use; }
    function setCurrentPage(page) { state.currentPage = page; }
    function setUser(user) { state.user = user; saveToStorage(); notify('user'); }
    
    function addToCart(product, variant, quantity = 1) {
        const cartItem = {
            id: `${product.id}-${variant.weight}`,
            productId: product.id,
            name: product.name,
            image: product.image,
            category: product.category,
            weight: variant.weight,
            price: variant.price,
            quantity: quantity
        };
        const existingIndex = state.cart.findIndex(item => item.id === cartItem.id);
        if (existingIndex >= 0) {
            state.cart[existingIndex].quantity += quantity;
        } else {
            state.cart.push(cartItem);
        }
        saveToStorage();
        notify('cart');
        if (typeof Analytics !== 'undefined') Analytics.trackAddToCart(product, quantity, variant);
    }
    
    function updateCartItem(itemId, quantity) {
        const index = state.cart.findIndex(item => item.id === itemId);
        if (index >= 0) {
            if (quantity <= 0) state.cart.splice(index, 1);
            else state.cart[index].quantity = quantity;
            saveToStorage();
            notify('cart');
        }
    }
    
    function removeFromCart(itemId) {
        state.cart = state.cart.filter(item => item.id !== itemId);
        saveToStorage();
        notify('cart');
    }
    
    function clearCart() {
        state.cart = [];
        state.useWallet = false;
        saveToStorage();
        notify('cart');
    }
    
    function addToWallet(amount, description = 'Credit') {
        state.wallet.balance += amount;
        state.wallet.transactions.push({ type: 'credit', amount, description, date: new Date().toISOString() });
        saveToStorage();
        notify('wallet');
    }
    
    function deductFromWallet(amount, description = 'Debit') {
        if (amount <= state.wallet.balance) {
            state.wallet.balance -= amount;
            state.wallet.transactions.push({ type: 'debit', amount, description, date: new Date().toISOString() });
            saveToStorage();
            notify('wallet');
            return true;
        }
        return false;
    }
    
    function logout() { state.user = null; saveToStorage(); notify('user'); }
    
    init();
    
    return {
        getState, getProducts, getActiveProducts, getCategories, getCart, getCartItemCount,
        getWalletBalance, searchProducts, setProducts, setCategories, setSiteConfig,
        setActiveCategory, setSelectedProduct, setSelectedVariant, setQuantity, setUseWallet,
        setCurrentPage, setUser, addToCart, updateCartItem, removeFromCart, clearCart,
        addToWallet, deductFromWallet, logout, subscribe
    };
})();

window.Store = Store;
