/**
 * SeaSalt Pickles - UI Module
 * ============================
 */

const UI = (function() {
    let elements = {};
    
    function cacheElements() {
        elements = {
            loadingOverlay: document.getElementById('loading-overlay'),
            categoryScroll: document.getElementById('category-scroll'),
            featuredProducts: document.getElementById('featured-products'),
            categorySections: document.getElementById('category-sections'),
            productModal: document.getElementById('product-modal'),
            cartSidebar: document.getElementById('cart-sidebar'),
            cartItems: document.getElementById('cart-items'),
            cartFooter: document.getElementById('cart-footer'),
            cartBtn: document.getElementById('cart-btn'),
            cartCount: document.getElementById('cart-count'),
            walletBalance: document.getElementById('wallet-balance'),
            walletBtn: document.getElementById('wallet-btn'),
            useWalletCheckbox: document.getElementById('use-wallet'),
            qtyValue: document.getElementById('qty-value'),
            toastContainer: document.getElementById('toast-container')
        };
    }
    
    function init() { cacheElements(); }
    function getElements() { return elements; }
    
    function showLoading() {
        if (elements.loadingOverlay) elements.loadingOverlay.classList.remove('hidden');
    }
    
    function hideLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                elements.loadingOverlay.classList.add('hidden');
                elements.loadingOverlay.style.opacity = '1';
            }, 500);
        }
    }
    
    function renderCategoryPills(categories) {
        if (!elements.categoryScroll) return;
        
        const allPill = `<button class="category-pill active flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all bg-pickle-500 text-white" data-category="all">All</button>`;
        const categoryPills = categories.map(cat => `
            <button class="category-pill flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200" data-category="${cat.id}">
                ${cat.emoji || ''} ${cat.name}
            </button>
        `).join('');
        
        elements.categoryScroll.innerHTML = allPill + categoryPills;
        
        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.category-pill').forEach(p => {
                    p.classList.remove('active', 'bg-pickle-500', 'text-white');
                    p.classList.add('bg-gray-100', 'text-gray-700');
                });
                pill.classList.add('active', 'bg-pickle-500', 'text-white');
                pill.classList.remove('bg-gray-100', 'text-gray-700');
                Store.setActiveCategory(pill.dataset.category);
                const products = Store.getActiveProducts();
                const cats = Store.getCategories();
                renderCategorySections(cats, products);
            });
        });
    }
    
    function createProductCard(product) {
        const defaultVariant = product.variants?.[0] || { price: product.price, weight: '' };
        const imageUrl = product.image || 'https://via.placeholder.com/300x300?text=Pickle';
        
        return `
            <div class="product-card bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-lg" data-product-id="${product.id}">
                <div class="relative aspect-square bg-gradient-to-br from-pickle-50 to-orange-50">
                    <img src="${imageUrl}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=Pickle'">
                    ${product.badge ? `<span class="absolute top-3 left-3 px-2 py-1 bg-spice-gold text-white text-xs font-bold rounded-full">${product.badge}</span>` : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-display font-bold text-gray-800 mb-1 line-clamp-1">${product.name}</h3>
                    <p class="text-gray-500 text-sm mb-2">${defaultVariant.weight}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-bold text-pickle-600">₹${defaultVariant.price}</span>
                        <button class="add-btn w-8 h-8 bg-pickle-500 text-white rounded-full flex items-center justify-center hover:bg-pickle-600 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderFeaturedProducts(products) {
        if (!elements.featuredProducts) return;
        const featured = products.filter(p => p.isFeatured).slice(0, 6);
        if (featured.length === 0) {
            elements.featuredProducts.parentElement.classList.add('hidden');
            return;
        }
        elements.featuredProducts.innerHTML = featured.map(createProductCard).join('');
        bindProductCardEvents(elements.featuredProducts);
    }
    
    function renderCategorySections(categories, products) {
        if (!elements.categorySections) return;
        const activeCategory = Store.getState().activeCategory;
        
        if (activeCategory === 'all') {
            elements.categorySections.innerHTML = categories.map(cat => {
                const catProducts = products.filter(p => p.category === cat.id);
                if (catProducts.length === 0) return '';
                return `
                    <section class="mb-8">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="font-display text-xl font-bold text-gray-800">${cat.emoji || ''} ${cat.name}</h2>
                        </div>
                        <div class="grid grid-cols-2 gap-4">${catProducts.map(createProductCard).join('')}</div>
                    </section>
                `;
            }).join('');
        } else {
            const catProducts = products.filter(p => p.category === activeCategory);
            const cat = categories.find(c => c.id === activeCategory);
            elements.categorySections.innerHTML = `
                <section class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="font-display text-xl font-bold text-gray-800">${cat?.emoji || ''} ${cat?.name || 'Products'}</h2>
                    </div>
                    <div class="grid grid-cols-2 gap-4">${catProducts.map(createProductCard).join('')}</div>
                </section>
            `;
        }
        bindProductCardEvents(elements.categorySections);
    }
    
    function renderSearchResults(products) {
        if (!elements.categorySections) return;
        if (products.length === 0) {
            elements.categorySections.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="font-display text-xl font-bold text-gray-800 mb-2">No products found</h3>
                    <p class="text-gray-500">Try a different search term</p>
                </div>
            `;
            return;
        }
        elements.categorySections.innerHTML = `
            <section class="mb-8">
                <h2 class="font-display text-xl font-bold text-gray-800 mb-4">Search Results (${products.length})</h2>
                <div class="grid grid-cols-2 gap-4">${products.map(createProductCard).join('')}</div>
            </section>
        `;
        bindProductCardEvents(elements.categorySections);
    }
    
    function bindProductCardEvents(container) {
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-btn')) return;
                const productId = card.dataset.productId;
                const product = Store.getProducts().find(p => p.id === productId);
                if (product) openProductModal(product);
            });
            
            card.querySelector('.add-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = card.dataset.productId;
                const product = Store.getProducts().find(p => p.id === productId);
                if (product) {
                    const variant = product.variants?.[0] || { price: product.price, weight: '' };
                    Store.addToCart(product, variant, 1);
                    showToast(`${product.name} added to cart`, 'success');
                }
            });
        });
    }
    
    function openProductModal(product) {
        Store.setSelectedProduct(product);
        if (typeof Analytics !== 'undefined') Analytics.trackProductView(product);
        
        const modal = elements.productModal;
        if (!modal) return;
        
        const variant = product.variants?.[0] || { price: product.price, weight: '' };
        const imageUrl = product.image || 'https://via.placeholder.com/600x600?text=Pickle';
        
        modal.querySelector('#product-modal-image').src = imageUrl;
        modal.querySelector('#product-modal-name').textContent = product.name;
        modal.querySelector('#product-modal-description').textContent = product.description || '';
        modal.querySelector('#product-modal-price').textContent = `₹${variant.price}`;
        modal.querySelector('#qty-value').textContent = '1';
        
        const variantsContainer = modal.querySelector('#product-variants');
        if (variantsContainer && product.variants) {
            variantsContainer.innerHTML = product.variants.map((v, i) => `
                <button class="variant-btn px-4 py-2 rounded-xl text-sm font-medium transition-all ${i === 0 ? 'bg-pickle-500 text-white' : 'bg-gray-100 text-gray-700'}" data-variant-index="${i}">
                    ${v.weight} - ₹${v.price}
                </button>
            `).join('');
            
            variantsContainer.querySelectorAll('.variant-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    variantsContainer.querySelectorAll('.variant-btn').forEach(b => {
                        b.classList.remove('bg-pickle-500', 'text-white');
                        b.classList.add('bg-gray-100', 'text-gray-700');
                    });
                    btn.classList.add('bg-pickle-500', 'text-white');
                    btn.classList.remove('bg-gray-100', 'text-gray-700');
                    const variantIndex = parseInt(btn.dataset.variantIndex);
                    Store.setSelectedVariant(product.variants[variantIndex]);
                    updateModalPrice();
                });
            });
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function closeProductModal() {
        if (elements.productModal) {
            elements.productModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    function updateModalPrice() {
        const state = Store.getState();
        const variant = state.selectedVariant;
        const quantity = state.quantity || 1;
        if (variant && elements.productModal) {
            elements.productModal.querySelector('#product-modal-price').textContent = `₹${variant.price * quantity}`;
        }
    }
    
    function openCart() {
        if (elements.cartSidebar) {
            elements.cartSidebar.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeCart() {
        if (elements.cartSidebar) {
            elements.cartSidebar.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    function renderCartItems() {
        const cart = Store.getCart();
        if (!elements.cartItems) return;
        
        if (cart.items.length === 0) {
            elements.cartItems.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🛒</div>
                    <h3 class="font-display text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                    <p class="text-gray-500">Add some delicious pickles!</p>
                </div>
            `;
            if (elements.cartFooter) elements.cartFooter.classList.add('hidden');
            return;
        }
        
        elements.cartItems.innerHTML = cart.items.map(item => `
            <div class="cart-item flex gap-4 p-4 bg-white rounded-xl" data-item-id="${item.id}">
                <img src="${item.image || 'https://via.placeholder.com/80x80?text=Pickle'}" class="w-20 h-20 rounded-lg object-cover" alt="${item.name}">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${item.name}</h4>
                    <p class="text-sm text-gray-500">${item.weight}</p>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-2">
                            <button class="qty-btn w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center" data-action="decrease">−</button>
                            <span class="font-medium">${item.quantity}</span>
                            <button class="qty-btn w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center" data-action="increase">+</button>
                        </div>
                        <span class="font-bold text-pickle-600">₹${item.price * item.quantity}</span>
                    </div>
                </div>
                <button class="remove-btn text-gray-400 hover:text-red-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        `).join('');
        
        elements.cartItems.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.closest('.cart-item').dataset.itemId;
                const item = cart.items.find(i => i.id === itemId);
                if (item) {
                    const newQty = btn.dataset.action === 'increase' ? item.quantity + 1 : item.quantity - 1;
                    Store.updateCartItem(itemId, newQty);
                    renderCartItems();
                    updateCartTotals();
                }
            });
        });
        
        elements.cartItems.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.closest('.cart-item').dataset.itemId;
                Store.removeFromCart(itemId);
                renderCartItems();
                updateCartTotals();
            });
        });
        
        if (elements.cartFooter) elements.cartFooter.classList.remove('hidden');
        updateCartTotals();
    }
    
    function updateCartTotals() {
        const cart = Store.getCart();
        const subtotalEl = document.getElementById('cart-subtotal');
        const deliveryEl = document.getElementById('delivery-charge');
        const walletEl = document.getElementById('wallet-discount');
        const totalEl = document.getElementById('cart-total');
        
        if (subtotalEl) subtotalEl.textContent = `₹${cart.subtotal}`;
        if (deliveryEl) deliveryEl.textContent = cart.deliveryCharge === 0 ? 'FREE' : `₹${cart.deliveryCharge}`;
        if (walletEl) walletEl.textContent = cart.walletDiscount > 0 ? `-₹${cart.walletDiscount}` : '₹0';
        if (totalEl) totalEl.textContent = `₹${cart.total}`;
    }
    
    function updateCartUI() {
        const count = Store.getCartItemCount();
        if (elements.cartCount) {
            elements.cartCount.textContent = count;
            elements.cartCount.classList.toggle('hidden', count === 0);
        }
        const walletBalance = Store.getWalletBalance();
        if (elements.walletBalance) {
            elements.walletBalance.textContent = `₹${walletBalance}`;
        }
    }
    
    function updateBottomNav(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('text-pickle-500', item.dataset.page === page);
            item.classList.toggle('text-gray-400', item.dataset.page !== page);
        });
    }
    
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `px-4 py-3 rounded-xl shadow-lg text-white text-sm animate-slide-in ${
            type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800'
        }`;
        toast.textContent = message;
        
        if (elements.toastContainer) {
            elements.toastContainer.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
    
    return {
        init, getElements, showLoading, hideLoading, renderCategoryPills,
        renderFeaturedProducts, renderCategorySections, renderSearchResults,
        openProductModal, closeProductModal, updateModalPrice,
        openCart, closeCart, renderCartItems, updateCartTotals, updateCartUI,
        updateBottomNav, showToast
    };
})();

window.UI = UI;
