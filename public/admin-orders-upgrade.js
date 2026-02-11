/**
 * SeaSalt Admin - Orders Upgrade v3
 * ===================================
 * ADDS: Tracking number column + WhatsApp notifications on status change
 * 
 * HOW TO USE:
 * Add this script AFTER admin-fix.js in your admin index.html:
 * <script src="js/admin-orders-upgrade.js"></script>
 * 
 * Or paste its content at the end of admin-fix.js
 */

(function() {
    'use strict';
    
    var SU = 'https://yosjbsncvghpscsrvxds.supabase.co';
    var SK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvc2pic25jdmdocHNjc3J2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjc3NTgsImV4cCI6MjA4NTgwMzc1OH0.PNEbeofoyT7KdkzepRfqg-zqyBiGAat5ElCMiyQ4UAs';
    var HDRS = { 'apikey': SK, 'Authorization': 'Bearer ' + SK, 'Content-Type': 'application/json' };
    
    // WhatsApp business number (admin's number to send FROM via wa.me link)
    var ADMIN_PHONE = '919963971447';
    
    var STATUS_LABELS = {
        confirmed: '\u2705 Confirmed',
        processing: '\uD83D\uDC68\u200D\uD83C\uDF73 Preparing',
        preparing: '\uD83D\uDC68\u200D\uD83C\uDF73 Preparing',
        shipped: '\uD83D\uDE9A Dispatched',
        dispatched: '\uD83D\uDE9A Dispatched',
        delivered: '\uD83C\uDF89 Delivered',
        cancelled: '\u274C Cancelled'
    };
    
    console.log('[AdminOrders] v3 Loading...');
    
    // ========================================
    // UPGRADE ORDER TABLE ROWS
    // ========================================
    
    function upgradeOrderRows() {
        // Find all order rows in the admin table
        var rows = document.querySelectorAll('table tbody tr, .orders-table tr, [data-order-id]');
        if (rows.length === 0) {
            // Try to find by status dropdowns
            rows = document.querySelectorAll('select');
            rows.forEach(function(select) {
                var row = select.closest('tr');
                if (row) upgradeRow(row, select);
            });
            return;
        }
        rows.forEach(function(row) {
            var select = row.querySelector('select');
            if (select) upgradeRow(row, select);
        });
    }
    
    function upgradeRow(row, select) {
        // Skip if already upgraded
        if (row.dataset.upgraded) return;
        row.dataset.upgraded = 'true';
        
        // Get order ID from first cell
        var cells = row.querySelectorAll('td');
        if (cells.length < 2) return;
        var orderId = (cells[0] ? cells[0].textContent.trim() : '');
        var customerName = (cells[1] ? cells[1].textContent.trim() : '');
        
        // Get order ID from any data attribute too
        if (!orderId && row.dataset.orderId) orderId = row.dataset.orderId;
        
        // Store the current status
        var currentStatus = select.value;
        
        // Add tracking number input next to status dropdown (in ACTIONS cell)
        var actionsCell = select.parentElement;
        if (actionsCell && !actionsCell.querySelector('.tracking-input')) {
            var trackingDiv = document.createElement('div');
            trackingDiv.style.cssText = 'margin-top:6px;display:flex;gap:4px;align-items:center;';
            trackingDiv.innerHTML = '<input type="text" class="tracking-input" placeholder="Tracking #" ' +
                'style="width:120px;padding:4px 8px;font-size:11px;border:1px solid #ddd;border-radius:6px;outline:none;" ' +
                'data-order-id="' + orderId + '">' +
                '<button class="save-tracking-btn" title="Save tracking" ' +
                'style="padding:4px 8px;font-size:11px;background:#4F46E5;color:white;border:none;border-radius:6px;cursor:pointer;">Save</button>';
            actionsCell.appendChild(trackingDiv);
            
            // Load existing tracking number from Supabase
            loadTracking(orderId, trackingDiv.querySelector('.tracking-input'));
            
            // Save tracking handler
            trackingDiv.querySelector('.save-tracking-btn').addEventListener('click', function() {
                var input = trackingDiv.querySelector('.tracking-input');
                var tracking = input.value.trim();
                if (!tracking) return;
                saveTracking(orderId, tracking, customerName);
            });
        }
        
        // Override the status change handler to save to Supabase + notify
        select.addEventListener('change', function() {
            var newStatus = select.value;
            var trackingInput = actionsCell ? actionsCell.querySelector('.tracking-input') : null;
            var tracking = trackingInput ? trackingInput.value.trim() : '';
            
            updateOrderStatus(orderId, newStatus, tracking, customerName, select);
        });
    }
    
    // ========================================
    // SUPABASE OPERATIONS
    // ========================================
    
    async function loadTracking(orderId, input) {
        if (!orderId || !input) return;
        try {
            var res = await fetch(SU + '/rest/v1/orders?id=eq.' + encodeURIComponent(orderId) + '&select=tracking_number,customer_phone', {
                headers: { 'apikey': SK, 'Authorization': 'Bearer ' + SK }
            });
            if (res.ok) {
                var data = await res.json();
                if (data[0] && data[0].tracking_number) {
                    input.value = data[0].tracking_number;
                    input.style.borderColor = '#4F46E5';
                    input.style.fontWeight = '600';
                }
            }
        } catch(e) {}
    }
    
    async function saveTracking(orderId, tracking, customerName) {
        try {
            var res = await fetch(SU + '/rest/v1/orders?id=eq.' + encodeURIComponent(orderId), {
                method: 'PATCH',
                headers: HDRS,
                body: JSON.stringify({ tracking_number: tracking, updated_at: new Date().toISOString() })
            });
            if (res.ok) {
                showAdminToast('\uD83D\uDCE6 Tracking saved for ' + orderId, 'success');
                
                // Get customer phone for notification
                var orderRes = await fetch(SU + '/rest/v1/orders?id=eq.' + encodeURIComponent(orderId) + '&select=customer_phone,status', {
                    headers: { 'apikey': SK, 'Authorization': 'Bearer ' + SK }
                });
                if (orderRes.ok) {
                    var orderData = await orderRes.json();
                    if (orderData[0] && orderData[0].customer_phone) {
                        sendWhatsAppNotification(orderData[0].customer_phone, orderId, orderData[0].status, tracking, customerName);
                    }
                }
            } else {
                var err = await res.text();
                console.error('[AdminOrders] Save tracking failed:', err);
                showAdminToast('Failed to save tracking', 'error');
            }
        } catch(e) {
            console.error('[AdminOrders] Save tracking error:', e);
            showAdminToast('Error saving tracking', 'error');
        }
    }
    
    async function updateOrderStatus(orderId, newStatus, tracking, customerName, selectEl) {
        var updatePayload = { 
            status: newStatus, 
            updated_at: new Date().toISOString() 
        };
        if (tracking) updatePayload.tracking_number = tracking;
        
        try {
            var res = await fetch(SU + '/rest/v1/orders?id=eq.' + encodeURIComponent(orderId), {
                method: 'PATCH',
                headers: HDRS,
                body: JSON.stringify(updatePayload)
            });
            
            if (res.ok) {
                console.log('[AdminOrders] Status updated:', orderId, '->', newStatus);
                showAdminToast((STATUS_LABELS[newStatus] || newStatus) + ' — ' + orderId, 'success');
                
                // Update status badge in the row
                var row = selectEl.closest('tr');
                if (row) {
                    var badge = row.querySelector('.status-badge, span[class*="rounded"]');
                    if (badge) {
                        badge.textContent = newStatus;
                        updateStatusBadgeColor(badge, newStatus);
                    }
                }
                
                // Get customer phone and send notification
                var orderRes = await fetch(SU + '/rest/v1/orders?id=eq.' + encodeURIComponent(orderId) + '&select=customer_phone', {
                    headers: { 'apikey': SK, 'Authorization': 'Bearer ' + SK }
                });
                if (orderRes.ok) {
                    var orderData = await orderRes.json();
                    if (orderData[0] && orderData[0].customer_phone) {
                        sendWhatsAppNotification(orderData[0].customer_phone, orderId, newStatus, tracking, customerName);
                    }
                }
            } else {
                var err = await res.text();
                console.error('[AdminOrders] Status update failed:', err);
                showAdminToast('Failed to update status: ' + err, 'error');
            }
        } catch(e) {
            console.error('[AdminOrders] Status update error:', e);
            showAdminToast('Error updating status', 'error');
        }
    }
    
    function updateStatusBadgeColor(badge, status) {
        var colors = {
            pending:    { bg: '#FEF3C7', text: '#92400E' },
            confirmed:  { bg: '#D1FAE5', text: '#065F46' },
            processing: { bg: '#DBEAFE', text: '#1E40AF' },
            preparing:  { bg: '#DBEAFE', text: '#1E40AF' },
            shipped:    { bg: '#E0E7FF', text: '#3730A3' },
            dispatched: { bg: '#E0E7FF', text: '#3730A3' },
            delivered:  { bg: '#D1FAE5', text: '#065F46' },
            cancelled:  { bg: '#FEE2E2', text: '#991B1B' }
        };
        var c = colors[status] || colors.pending;
        badge.style.background = c.bg;
        badge.style.color = c.text;
    }
    
    // ========================================
    // WHATSAPP NOTIFICATION
    // ========================================
    
    function sendWhatsAppNotification(customerPhone, orderId, status, tracking, customerName) {
        // Clean phone number
        var phone = customerPhone.replace(/[^0-9]/g, '');
        if (phone.length === 10) phone = '91' + phone;
        if (phone.startsWith('+')) phone = phone.substring(1);
        
        var name = customerName || 'Customer';
        var message = '';
        
        switch(status) {
            case 'confirmed':
                message = 'Hi ' + name + '! \u2705\n\nYour order *#' + orderId + '* has been *confirmed*!\n\nWe\'re getting it ready for you. You\'ll receive updates as your order progresses.\n\nThank you for shopping with SeaSalt Pickles! \uD83C\uDF36\uFE0F';
                break;
            case 'processing':
            case 'preparing':
                message = 'Hi ' + name + '! \uD83D\uDC68\u200D\uD83C\uDF73\n\nYour order *#' + orderId + '* is now being *prepared*!\n\nOur team is carefully packing your authentic Andhra pickles & masalas.\n\nThank you for your patience! \uD83E\uDD52';
                break;
            case 'shipped':
            case 'dispatched':
                message = 'Hi ' + name + '! \uD83D\uDE9A\n\nGreat news! Your order *#' + orderId + '* has been *dispatched*!';
                if (tracking) {
                    message += '\n\n\uD83D\uDCE6 *Tracking Number:* ' + tracking + '\nTrack your order: https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
                }
                message += '\n\nYour package is on its way! \uD83C\uDF89';
                break;
            case 'delivered':
                message = 'Hi ' + name + '! \uD83C\uDF89\n\nYour order *#' + orderId + '* has been *delivered*!\n\nWe hope you enjoy your authentic Andhra pickles & masalas. If you have any feedback, we\'d love to hear from you!\n\nThank you for choosing SeaSalt Pickles! \u2764\uFE0F';
                break;
            case 'cancelled':
                message = 'Hi ' + name + ',\n\nYour order *#' + orderId + '* has been *cancelled*.\n\nIf you have any questions or need a refund, please don\'t hesitate to reach out.\n\nWe hope to serve you again soon! \uD83D\uDE4F';
                break;
            default:
                message = 'Hi ' + name + '!\n\nYour order *#' + orderId + '* status has been updated to: *' + status + '*.\n\nThank you! - SeaSalt Pickles';
        }
        
        // Open WhatsApp with pre-filled message
        var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
        
        // Show notification popup asking admin to send
        showWhatsAppPopup(waUrl, phone, status, orderId);
    }
    
    function showWhatsAppPopup(waUrl, phone, status, orderId) {
        // Create a small notification bar
        var popup = document.createElement('div');
        popup.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:#25D366;color:white;' +
            'padding:12px 20px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.2);' +
            'display:flex;align-items:center;gap:12px;max-width:400px;animation:slideUp 0.3s ease;font-family:sans-serif;';
        popup.innerHTML = '<div style="font-size:24px;">\uD83D\uDCF1</div>' +
            '<div style="flex:1;">' +
            '<p style="font-weight:700;font-size:13px;margin:0;">Send WhatsApp Notification</p>' +
            '<p style="font-size:11px;margin:2px 0 0;opacity:0.9;">Order #' + orderId + ' → ' + (STATUS_LABELS[status] || status) + '</p></div>' +
            '<a href="' + waUrl + '" target="_blank" rel="noopener" ' +
            'style="background:white;color:#25D366;padding:8px 16px;border-radius:8px;font-weight:700;font-size:12px;text-decoration:none;">' +
            'Send \u2197</a>' +
            '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;padding:0 0 0 4px;">\u2715</button>';
        
        document.body.appendChild(popup);
        
        // Auto-remove after 15 seconds
        setTimeout(function() { if (popup.parentElement) popup.remove(); }, 15000);
    }
    
    // ========================================
    // ADMIN TOAST
    // ========================================
    
    function showAdminToast(message, type) {
        var toast = document.createElement('div');
        var bg = type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#3B82F6';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:' + bg + ';color:white;' +
            'padding:12px 20px;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.15);' +
            'font-family:sans-serif;font-size:13px;font-weight:600;animation:slideUp 0.3s ease;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 4000);
    }
    
    // ========================================
    // AUTO-UPGRADE ON PAGE LOAD & REFRESH
    // ========================================
    
    function init() {
        // Add slideUp animation
        if (!document.getElementById('admin-orders-styles')) {
            var style = document.createElement('style');
            style.id = 'admin-orders-styles';
            style.textContent = '@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}';
            document.head.appendChild(style);
        }
        
        // Upgrade rows after a delay to let admin-fix.js render first
        setTimeout(upgradeOrderRows, 1000);
        setTimeout(upgradeOrderRows, 3000);
        setTimeout(upgradeOrderRows, 6000);
        
        // Also upgrade after any Refresh button click
        var refreshBtn = document.querySelector('button:has(svg), [onclick*="refresh"], [onclick*="Refresh"]');
        if (!refreshBtn) {
            // Try to find by text content
            document.querySelectorAll('button').forEach(function(btn) {
                if (btn.textContent.includes('Refresh')) refreshBtn = btn;
            });
        }
        if (refreshBtn && !refreshBtn._ordersUpgraded) {
            refreshBtn._ordersUpgraded = true;
            refreshBtn.addEventListener('click', function() {
                setTimeout(upgradeOrderRows, 2000);
                setTimeout(upgradeOrderRows, 5000);
            });
        }
        
        // MutationObserver to catch dynamically added rows
        var observer = new MutationObserver(function(mutations) {
            var hasNewRows = false;
            mutations.forEach(function(m) {
                if (m.addedNodes.length > 0) hasNewRows = true;
            });
            if (hasNewRows) {
                setTimeout(upgradeOrderRows, 500);
            }
        });
        
        var tableContainer = document.querySelector('table, .orders-table, main, #orders-container, [class*="orders"]');
        if (tableContainer) {
            observer.observe(tableContainer, { childList: true, subtree: true });
        } else {
            // Observe body as fallback
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('[AdminOrders] v3 Ready - Tracking + WhatsApp notifications enabled');
})();
