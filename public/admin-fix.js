// ══════════════════════════════
// SHOW USER DETAIL MODAL
// ══════════════════════════════
window.showUserDetail = async function(phone) {
    console.log('showUserDetail called for:', phone);
    const modal = document.getElementById('userDetailModal');
    const content = document.getElementById('userDetailContent');
    
    content.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:2rem;">⏳</div><p>Loading user data...</p></div>';
    modal.classList.add('show');
    
    try {
        // Get user from users table
        const { data: userData } = await db.from('users').select('*').eq('phone', phone).single();
        
        // Get user events
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const { data: events } = await db.from('analytics_events').select('*').eq('user_phone', phone).gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }).limit(100);
        
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
                <button class="btn btn-green" style="flex:1;" onclick="openSendCreditModal('${phone}', '${user.name || 'User'}')">💰 Send Credit</button>
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
        console.error('Error loading user:', err);
        content.innerHTML = `<div style="text-align:center;padding:40px;color:#e74c3c;"><div style="font-size:2rem;">❌</div><p>Error loading user data</p><p style="font-size:0.8rem;">${err.message}</p></div>`;
    }
};

// ══════════════════════════════
// SEND CREDIT MODAL
// ══════════════════════════════
window.openSendCreditModal = function(phone, name) {
    console.log('openSendCreditModal called for:', phone, name);
    
    // Close user detail modal if open
    document.getElementById('userDetailModal').classList.remove('show');
    
    document.getElementById('credit-phone').value = phone;
    document.getElementById('credit-user-display').textContent = (name || 'User') + ' (' + phone + ')';
    document.getElementById('credit-amount').value = 100;
    document.getElementById('credit-reason').value = '';
    document.getElementById('sendCreditModal').classList.add('show');
};

// Confirm send credit
document.getElementById('confirmSendCreditBtn').addEventListener('click', async function() {
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
        // Get current user data
        const { data: userData } = await db.from('users').select('*').eq('phone', phone).single();
        
        if (!userData) {
            alert('User not found in database');
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
        }).eq('phone', phone);
        
        if (error) throw error;
        
        // Log the transaction
        await db.from('wallet_transactions').insert({
            user_phone: phone,
            amount: amount,
            type: 'credit',
            reason: reason,
            balance_after: newBalance
        });
        
        alert('✅ Successfully sent ₹' + amount + ' to ' + phone + '\n\nNew balance: ₹' + newBalance);
        
        document.getElementById('sendCreditModal').classList.remove('show');
        
        // Refresh users list
        loadUsers();
        
    } catch (err) {
        console.error('Error sending credit:', err);
        alert('❌ Error sending credit: ' + err.message);
    }
    
    this.disabled = false;
    this.textContent = '💰 Send Credit';
});

// Close modals on background click
document.getElementById('userDetailModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
});

document.getElementById('sendCreditModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
});

// Also expose openWalletModal for backward compatibility
window.openWalletModal = function(phone, balance, name) {
    openSendCreditModal(phone, name);
};

console.log('[Admin] User detail and send credit functions loaded');
