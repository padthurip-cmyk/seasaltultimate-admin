/**
 * SeaSalt Admin - Fix Module v2
 * =============================
 * Adds missing functionality: View User, Send Credit
 * Auto-injects required modals into the page
 */

(function() {
    'use strict';
    
    // Supabase reference
    const SUPA_URL = 'https://yosjbsncvghpscsrvxds.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvc2pic25jdmdocHNjc3J2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjc3NTgsImV4cCI6MjA4NTgwMzc1OH0.PNEbeofoyT7KdkzepRfqg-zqyBiGAat5ElCMiyQ4UAs';
    
    const db = supabase.createClient(SUPA_URL, SUPA_KEY);

    // ══════════════════════════════
    // INJECT MODALS INTO PAGE
    // ══════════════════════════════
    function injectModals() {
        // Check if modals already exist
        if (document.getElementById('userDetailModal')) return;
        
        // User Detail Modal
        const userDetailModal = document.createElement('div');
        userDetailModal.id = 'userDetailModal';
        userDetailModal.className = 'modal-overlay';
        userDetailModal.innerHTML = `
            <div class="modal-box" style="max-width:500px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-weight:700;">👤 User Details</h3>
                    <button style="background:none;border:none;font-size:1.5rem;cursor:pointer;" onclick="document.getElementById('userDetailModal').classList.remove('show')">&times;</button>
                </div>
                <div id="userDetailContent">Loading...</div>
            </div>
        `;
        document.body.appendChild(userDetailModal);
        
        // Send Credit Modal
        const sendCreditModal = document.createElement('div');
        sendCreditModal.id = 'sendCreditModal';
        sendCreditModal.className = 'modal-overlay';
        sendCreditModal.innerHTML = `
            <div class="modal-box" style="max-width:400px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-weight:700;">💰 Send Wallet Credit</h3>
                    <button style="background:none;border:none;font-size:1.5rem;cursor:pointer;" onclick="document.getElementById('sendCreditModal').classList.remove('show')">&times;</button>
                </div>
                <input type="hidden" id="credit-phone">
                <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:16px;text-align:center;">
                    <div style="font-size:0.8rem;color:#666;">Sending to:</div>
                    <div style="font-size:1.1rem;font-weight:600;color:#333;" id="credit-user-display">User</div>
                </div>
                <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:4px;">Amount (₹)</label>
                <input type="number" id="credit-amount" value="100" min="10" max="1000" style="width:100%;padding:12px;border:2px solid #eee;border-radius:8px;margin-bottom:12px;font-size:1.2rem;text-align:center;">
                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <button class="btn btn-sm" style="flex:1;background:#eee;" onclick="document.getElementById('credit-amount').value=50">₹50</button>
                    <button class="btn btn-sm" style="flex:1;background:#eee;" onclick="document.getElementById('credit-amount').value=100">₹100</button>
                    <button class="btn btn-sm" style="flex:1;background:#eee;" onclick="document.getElementById('credit-amount').value=200">₹200</button>
                    <button class="btn btn-sm" style="flex:1;background:#eee;" onclick="document.getElementById('credit-amount').value=500">₹500</button>
                </div>
                <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:4px;">Reason (optional)</label>
                <input type="text" id="credit-reason" placeholder="e.g., Sorry for the inconvenience" style="width:100%;padding:10px;border:2px solid #eee;border-radius:8px;margin-bottom:16px;">
                <button class="btn btn-primary" style="width:100%;padding:14px;font-size:1rem;" id="confirmSendCreditBtn">💰 Send Credit</button>
                <p style="text-align:center;font-size:0.75rem;color:#999;margin-top:12px;">Credit expires in 48 hours</p>
            </div>
        `;
        document.body.appendChild(sendCreditModal);
        
        // Add styles for btn-green if not exists
        if (!document.getElementById('admin-fix-styles')) {
            const styles = document.createElement('style');
            styles.id = 'admin-fix-styles';
            styles.textContent = `
                .btn-green { background: #10b981; color: #fff; }
                .btn-green:hover { background: #059669; }
            `;
            document.head.appendChild(styles);
        }
        
        console.log('[Admin Fix] Modals injected');
    }

    // ══════════════════════════════
    // GET COUNTRY FLAG
    // ══════════════════════════════
    function getCountryFlag(country) {
        const flags = {
            'India': '🇮🇳', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧',
            'United Arab Emirates': '🇦🇪', 'Singapore': '🇸🇬', 'Australia': '🇦🇺',
            'Canada': '🇨🇦', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Saudi Arabia': '🇸🇦',
            'Qatar': '🇶🇦', 'Kuwait': '🇰🇼', 'Oman': '🇴🇲', 'Malaysia': '🇲🇾', 'New Zealand': '🇳🇿'
        };
        return flags[country] || '🌍';
    }

    // ══════════════════════════════
    // SHOW USER DETAIL MODAL
    // ══════════════════════════════
    window.showUserDetail = async function(phone) {
        console.log('[Admin Fix] showUserDetail called for:', phone);
        
        // Ensure modals exist
        injectModals();
        
        const modal = document.getElementById('userDetailModal');
        const content = document.getElementById('userDetailContent');
        
        content.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:2rem;">⏳</div><p>Loading user data...</p></div>';
        modal.classList.add('show');
        
        try {
            // Normalize phone number for query
            const phoneClean = phone.replace(/[^0-9+]/g, '');
            
            // Get user from users table
            const { data: userData } = await db.from('users').select('*').or(`phone.eq.${phoneClean},phone.eq.${phone}`).limit(1).single();
            
            // Get user events
            const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
            const { data: events } = await db.from('analytics_events')
                .select('*')
                .or(`user_phone.eq.${phoneClean},user_phone.eq.${phone}`)
                .gte('created_at', thirtyDaysAgo)
                .order('created_at', { ascending: false })
                .limit(100);
            
            const user = userData || { phone: phone };
            const userEvents = events || [];
            
            // Calculate stats
            const pageViews = userEvents.filter(e => e.event_type === 'page_view').length;
            const cartAdds = userEvents.filter(e => e.event_type === 'add_to_cart').length;
            const purchases = userEvents.filter(e => e.event_type === 'purchase').length;
            const lastEvent = userEvents[0];
            
            // Get location info from events
            let location = 'Unknown';
            let device = 'Unknown';
            let browser = 'Unknown';
            if (lastEvent) {
                try {
                    const data = JSON.parse(lastEvent.data || '{}');
                    if (data.city) location = data.city + (data.region ? ', ' + data.region : '') + (data.country ? ', ' + data.country : '');
                    else if (data.country) location = data.country;
                } catch(e) {}
                device = lastEvent.device_type || 'Unknown';
                browser = lastEvent.browser || 'Unknown';
            }
            
            // Build HTML
            let html = `
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="width:80px;height:80px;background:linear-gradient(135deg,#e67e22,#f39c12);border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;">
                        ${(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <h3 style="font-size:1.2rem;font-weight:700;color:#333;">${user.name || 'Unknown User'}</h3>
                    <p style="color:#666;font-size:0.9rem;">📱 ${phone}</p>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
                    <div style="background:#f8f9fa;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;font-weight:700;color:#3b82f6;">${pageViews}</div>
                        <div style="font-size:0.75rem;color:#666;">Page Views</div>
                    </div>
                    <div style="background:#f8f9fa;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;font-weight:700;color:#f59e0b;">${cartAdds}</div>
                        <div style="font-size:0.75rem;color:#666;">Cart Adds</div>
                    </div>
                    <div style="background:#f8f9fa;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;font-weight:700;color:#10b981;">${purchases}</div>
                        <div style="font-size:0.75rem;color:#666;">Purchases</div>
                    </div>
                    <div style="background:#f8f9fa;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;font-weight:700;color:#8b5cf6;">₹${user.wallet_balance || 0}</div>
                        <div style="font-size:0.75rem;color:#666;">Wallet</div>
                    </div>
                </div>
                
                <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:20px;">
                    <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">📍 User Info</h4>
                    <table style="font-size:0.85rem;width:100%;">
                        <tr><td style="color:#666;padding:4px 0;">Country:</td><td style="text-align:right;">${getCountryFlag(user.selected_country)} ${user.selected_country || user.country || 'Unknown'}</td></tr>
                        <tr><td style="color:#666;padding:4px 0;">Location:</td><td style="text-align:right;">${location}</td></tr>
                        <tr><td style="color:#666;padding:4px 0;">Device:</td><td style="text-align:right;">${device}</td></tr>
                        <tr><td style="color:#666;padding:4px 0;">Browser:</td><td style="text-align:right;">${browser}</td></tr>
                        <tr><td style="color:#666;padding:4px 0;">First Seen:</td><td style="text-align:right;">${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</td></tr>
                        <tr><td style="color:#666;padding:4px 0;">Last Active:</td><td style="text-align:right;">${user.last_seen ? new Date(user.last_seen).toLocaleString() : (lastEvent ? new Date(lastEvent.created_at).toLocaleString() : 'Unknown')}</td></tr>
                    </table>
                </div>
                
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-green" style="flex:1;" onclick="openSendCreditModal('${phone}', '${(user.name || 'User').replace(/'/g, "\\'")}')">💰 Send Credit</button>
                    <button class="btn btn-primary" style="flex:1;" onclick="document.getElementById('userDetailModal').classList.remove('show')">Close</button>
                </div>
            `;
            
            // Recent activity
            if (userEvents.length > 0) {
                html += `<div style="margin-top:20px;"><h4 style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">📊 Recent Activity</h4><div style="max-height:200px;overflow-y:auto;">`;
                
                const labelMap = { page_view: 'Viewed page', product_view: 'Viewed product', add_to_cart: 'Added to cart', checkout_start: 'Checkout', purchase: 'Purchased', spin_wheel: 'Spun wheel' };
                
                userEvents.slice(0, 20).forEach(e => {
                    const time = new Date(e.created_at).toLocaleString();
                    const label = labelMap[e.event_type] || e.event_type;
                    const detail = e.product_name || e.page || '';
                    html += `<div style="padding:6px 0;border-bottom:1px solid #eee;font-size:0.8rem;">
                        <span>${label}${detail ? ' — <strong>' + detail + '</strong>' : ''}</span>
                        <span style="float:right;color:#999;">${time}</span>
                    </div>`;
                });
                
                html += '</div></div>';
            }
            
            content.innerHTML = html;
            
        } catch (err) {
            console.error('[Admin Fix] Error loading user:', err);
            content.innerHTML = `<div style="text-align:center;padding:40px;color:#e74c3c;">
                <div style="font-size:2rem;">❌</div>
                <p>Error loading user data</p>
                <p style="font-size:0.8rem;">${err.message}</p>
                <button class="btn btn-primary" style="margin-top:16px;" onclick="document.getElementById('userDetailModal').classList.remove('show')">Close</button>
            </div>`;
        }
    };

    // ══════════════════════════════
    // SEND CREDIT MODAL
    // ══════════════════════════════
    window.openSendCreditModal = function(phone, name) {
        console.log('[Admin Fix] openSendCreditModal called for:', phone, name);
        
        // Ensure modals exist
        injectModals();
        
        // Close user detail modal if open
        const userModal = document.getElementById('userDetailModal');
        if (userModal) userModal.classList.remove('show');
        
        document.getElementById('credit-phone').value = phone;
        document.getElementById('credit-user-display').textContent = (name || 'User') + ' (' + phone + ')';
        document.getElementById('credit-amount').value = 100;
        document.getElementById('credit-reason').value = '';
        document.getElementById('sendCreditModal').classList.add('show');
    };

    // ══════════════════════════════
    // CONFIRM SEND CREDIT
    // ══════════════════════════════
    function setupSendCreditButton() {
        // Wait for modal to be injected
        const checkButton = setInterval(() => {
            const btn = document.getElementById('confirmSendCreditBtn');
            if (btn) {
                clearInterval(checkButton);
                
                btn.addEventListener('click', async function() {
                    const phone = document.getElementById('credit-phone').value;
                    const amount = parseInt(document.getElementById('credit-amount').value) || 0;
                    const reason = document.getElementById('credit-reason').value.trim() || 'Admin credit';
                    
                    if (!phone) {
                        alert('No user selected');
                        return;
                    }
                    
                    if (amount < 10 || amount > 1000) {
                        alert('Amount must be between ₹10 and ₹1000');
                        return;
                    }
                    
                    this.disabled = true;
                    this.textContent = '⏳ Sending...';
                    
                    try {
                        // Normalize phone
                        const phoneClean = phone.replace(/[^0-9+]/g, '');
                        
                        // Get current user data
                        const { data: userData } = await db.from('users').select('*').or(`phone.eq.${phoneClean},phone.eq.${phone}`).limit(1).single();
                        
                        if (!userData) {
                            alert('User not found in database. They may need to register first via the spin wheel.');
                            this.disabled = false;
                            this.textContent = '💰 Send Credit';
                            return;
                        }
                        
                        // Update wallet balance
                        const newBalance = (userData.wallet_balance || 0) + amount;
                        const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours
                        
                        const { error } = await db.from('users').update({
                            wallet_balance: newBalance,
                            wallet_expires_at: newExpiry
                        }).eq('id', userData.id);
                        
                        if (error) throw error;
                        
                        // Log the transaction (optional - create table if needed)
                        try {
                            await db.from('wallet_transactions').insert({
                                user_phone: phone,
                                amount: amount,
                                type: 'credit',
                                reason: reason,
                                balance_after: newBalance
                            });
                        } catch (txErr) {
                            console.warn('[Admin Fix] Could not log transaction:', txErr);
                        }
                        
                        alert('✅ Successfully sent ₹' + amount + ' to ' + phone + '\n\nNew balance: ₹' + newBalance);
                        
                        document.getElementById('sendCreditModal').classList.remove('show');
                        
                        // Refresh users list if function exists
                        if (typeof loadUsers === 'function') {
                            loadUsers();
                        }
                        
                    } catch (err) {
                        console.error('[Admin Fix] Error sending credit:', err);
                        alert('❌ Error sending credit: ' + err.message);
                    }
                    
                    this.disabled = false;
                    this.textContent = '💰 Send Credit';
                });
                
                console.log('[Admin Fix] Send credit button configured');
            }
        }, 500);
    }

    // ══════════════════════════════
    // MODAL CLOSE HANDLERS
    // ══════════════════════════════
    function setupModalCloseHandlers() {
        document.addEventListener('click', function(e) {
            if (e.target.id === 'userDetailModal' || e.target.id === 'sendCreditModal') {
                e.target.classList.remove('show');
            }
        });
    }

    // ══════════════════════════════
    // BACKWARD COMPATIBILITY
    // ══════════════════════════════
    window.openWalletModal = function(phone, balance, name) {
        openSendCreditModal(phone, name);
    };

    // ══════════════════════════════
    // INITIALIZE
    // ══════════════════════════════
    function init() {
        // Wait for Supabase to be available
        if (typeof supabase === 'undefined') {
            setTimeout(init, 500);
            return;
        }
        
        injectModals();
        setupSendCreditButton();
        setupModalCloseHandlers();
        
        console.log('[Admin Fix] v2 initialized ✅');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
