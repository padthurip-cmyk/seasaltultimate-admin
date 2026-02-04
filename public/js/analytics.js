/**
 * SeaSalt Pickles - Analytics Tracker
 * ====================================
 * Tracks user behavior, page views, conversions, and more.
 * 
 * Add to index.html before </body>:
 * <script src="js/analytics.js"></script>
 */

const Analytics = (function() {
    'use strict';
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        storageKey: 'seasalt_analytics',
        sessionKey: 'seasalt_session',
        maxEvents: 10000, // Max events to store
        heartbeatInterval: 5000, // 5 seconds
        idleTimeout: 30000 // 30 seconds idle = session end
    };
    
    // ============================================
    // STATE
    // ============================================
    
    let session = null;
    let currentPage = 'home';
    let pageStartTime = Date.now();
    let lastActivityTime = Date.now();
    let heartbeatTimer = null;
    let isIdle = false;
    let scrollDepth = 0;
    
    // ============================================
    // SESSION MANAGEMENT
    // ============================================
    
    function initSession() {
        // Check for existing session
        const existingSession = sessionStorage.getItem(CONFIG.sessionKey);
        
        if (existingSession) {
            session = JSON.parse(existingSession);
            session.pageViews++;
        } else {
            // Create new session
            session = {
                id: generateId(),
                startTime: Date.now(),
                userId: getUserId(),
                device: getDeviceInfo(),
                referrer: document.referrer || 'direct',
                landingPage: window.location.pathname,
                pageViews: 1,
                events: [],
                cartAdds: 0,
                checkoutStarts: 0,
                purchases: 0
            };
        }
        
        saveSession();
        
        console.log('📊 Analytics: Session started', session.id);
    }
    
    function saveSession() {
        sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(session));
    }
    
    function endSession() {
        if (!session) return;
        
        // Record final page time
        recordPageTime();
        
        // Save session to analytics storage
        const analytics = getAnalytics();
        analytics.sessions.push({
            ...session,
            endTime: Date.now(),
            duration: Date.now() - session.startTime
        });
        
        // Keep only last 100 sessions
        if (analytics.sessions.length > 100) {
            analytics.sessions = analytics.sessions.slice(-100);
        }
        
        saveAnalytics(analytics);
        sessionStorage.removeItem(CONFIG.sessionKey);
        
        console.log('📊 Analytics: Session ended', session.id);
    }
    
    function getUserId() {
        let userId = localStorage.getItem('seasalt_user_id');
        if (!userId) {
            userId = 'user_' + generateId();
            localStorage.setItem('seasalt_user_id', userId);
        }
        return userId;
    }
    
    // ============================================
    // ANALYTICS STORAGE
    // ============================================
    
    function getAnalytics() {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            sessions: [],
            pageViews: [],
            events: [],
            funnelData: {
                views: 0,
                productViews: 0,
                cartAdds: 0,
                checkoutStarts: 0,
                purchases: 0
            },
            dailyStats: {},
            productStats: {},
            createdAt: Date.now()
        };
    }
    
    function saveAnalytics(analytics) {
        // Trim events if too many
        if (analytics.events.length > CONFIG.maxEvents) {
            analytics.events = analytics.events.slice(-CONFIG.maxEvents);
        }
        if (analytics.pageViews.length > CONFIG.maxEvents) {
            analytics.pageViews = analytics.pageViews.slice(-CONFIG.maxEvents);
        }
        
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(analytics));
    }
    
    // ============================================
    // PAGE TRACKING
    // ============================================
    
    function trackPageView(pageName) {
        const previousPage = currentPage;
        currentPage = pageName || 'home';
        
        // Record time on previous page
        if (previousPage) {
            recordPageTime();
        }
        
        // Reset for new page
        pageStartTime = Date.now();
        scrollDepth = 0;
        
        // Update funnel
        const analytics = getAnalytics();
        analytics.funnelData.views++;
        
        // Record page view
        const pageView = {
            sessionId: session?.id,
            userId: session?.userId,
            page: currentPage,
            timestamp: Date.now(),
            referrer: previousPage
        };
        
        analytics.pageViews.push(pageView);
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        if (!analytics.dailyStats[today]) {
            analytics.dailyStats[today] = {
                views: 0,
                uniqueUsers: [],
                cartAdds: 0,
                checkouts: 0,
                purchases: 0,
                revenue: 0
            };
        }
        analytics.dailyStats[today].views++;
        
        if (session?.userId && !analytics.dailyStats[today].uniqueUsers.includes(session.userId)) {
            analytics.dailyStats[today].uniqueUsers.push(session.userId);
        }
        
        saveAnalytics(analytics);
        
        console.log('📊 Analytics: Page view', currentPage);
    }
    
    function recordPageTime() {
        const timeSpent = Date.now() - pageStartTime;
        
        const analytics = getAnalytics();
        
        // Find or create page stats
        if (!analytics.pageStats) {
            analytics.pageStats = {};
        }
        
        if (!analytics.pageStats[currentPage]) {
            analytics.pageStats[currentPage] = {
                totalTime: 0,
                visits: 0,
                avgTime: 0,
                maxScrollDepth: 0,
                bounces: 0
            };
        }
        
        const stats = analytics.pageStats[currentPage];
        stats.totalTime += timeSpent;
        stats.visits++;
        stats.avgTime = Math.round(stats.totalTime / stats.visits);
        stats.maxScrollDepth = Math.max(stats.maxScrollDepth, scrollDepth);
        
        // Record if bounce (less than 10 seconds)
        if (timeSpent < 10000) {
            stats.bounces++;
        }
        
        saveAnalytics(analytics);
    }
    
    // ============================================
    // EVENT TRACKING
    // ============================================
    
    function trackEvent(category, action, label, value) {
        const event = {
            sessionId: session?.id,
            userId: session?.userId,
            category,
            action,
            label,
            value,
            page: currentPage,
            timestamp: Date.now()
        };
        
        const analytics = getAnalytics();
        analytics.events.push(event);
        saveAnalytics(analytics);
        
        // Update session
        if (session) {
            session.events.push({ category, action, label, timestamp: Date.now() });
            saveSession();
        }
        
        console.log('📊 Analytics: Event', category, action, label);
    }
    
    // ============================================
    // E-COMMERCE TRACKING
    // ============================================
    
    function trackProductView(product) {
        const analytics = getAnalytics();
        analytics.funnelData.productViews++;
        
        // Product stats
        if (!analytics.productStats[product.id]) {
            analytics.productStats[product.id] = {
                name: product.name,
                views: 0,
                cartAdds: 0,
                purchases: 0,
                revenue: 0
            };
        }
        analytics.productStats[product.id].views++;
        
        saveAnalytics(analytics);
        
        trackEvent('Product', 'View', product.name, product.price);
    }
    
    function trackAddToCart(product, quantity, variant) {
        const analytics = getAnalytics();
        analytics.funnelData.cartAdds++;
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        if (analytics.dailyStats[today]) {
            analytics.dailyStats[today].cartAdds++;
        }
        
        // Product stats
        if (analytics.productStats[product.id]) {
            analytics.productStats[product.id].cartAdds++;
        }
        
        saveAnalytics(analytics);
        
        // Update session
        if (session) {
            session.cartAdds++;
            saveSession();
        }
        
        trackEvent('Cart', 'Add', product.name, product.price * quantity);
    }
    
    function trackRemoveFromCart(product) {
        trackEvent('Cart', 'Remove', product.name, product.price);
    }
    
    function trackCheckoutStart(cartTotal) {
        const analytics = getAnalytics();
        analytics.funnelData.checkoutStarts++;
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        if (analytics.dailyStats[today]) {
            analytics.dailyStats[today].checkouts++;
        }
        
        saveAnalytics(analytics);
        
        // Update session
        if (session) {
            session.checkoutStarts++;
            saveSession();
        }
        
        trackEvent('Checkout', 'Start', 'Cart Total', cartTotal);
    }
    
    function trackPurchase(order) {
        const analytics = getAnalytics();
        analytics.funnelData.purchases++;
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        if (analytics.dailyStats[today]) {
            analytics.dailyStats[today].purchases++;
            analytics.dailyStats[today].revenue += order.total || 0;
        }
        
        // Update product stats
        (order.items || []).forEach(item => {
            if (analytics.productStats[item.id]) {
                analytics.productStats[item.id].purchases += item.quantity || 1;
                analytics.productStats[item.id].revenue += (item.price || 0) * (item.quantity || 1);
            }
        });
        
        saveAnalytics(analytics);
        
        // Update session
        if (session) {
            session.purchases++;
            saveSession();
        }
        
        trackEvent('Purchase', 'Complete', order.id, order.total);
    }
    
    // ============================================
    // USER INTERACTION TRACKING
    // ============================================
    
    function trackScroll() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const depth = Math.round((currentScroll / scrollHeight) * 100);
        
        if (depth > scrollDepth) {
            scrollDepth = depth;
            
            // Track milestones
            if (depth >= 25 && scrollDepth < 25) {
                trackEvent('Scroll', '25%', currentPage);
            } else if (depth >= 50 && scrollDepth < 50) {
                trackEvent('Scroll', '50%', currentPage);
            } else if (depth >= 75 && scrollDepth < 75) {
                trackEvent('Scroll', '75%', currentPage);
            } else if (depth >= 90 && scrollDepth < 90) {
                trackEvent('Scroll', '90%', currentPage);
            }
        }
    }
    
    function trackClick(element) {
        const tagName = element.tagName.toLowerCase();
        const id = element.id || '';
        const className = element.className || '';
        const text = element.textContent?.slice(0, 50) || '';
        
        trackEvent('Click', tagName, id || text);
    }
    
    function trackSearch(query) {
        trackEvent('Search', 'Query', query);
    }
    
    // ============================================
    // ACTIVITY MONITORING
    // ============================================
    
    function startHeartbeat() {
        heartbeatTimer = setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivityTime;
            
            if (timeSinceActivity > CONFIG.idleTimeout && !isIdle) {
                isIdle = true;
                trackEvent('Session', 'Idle', currentPage);
            }
        }, CONFIG.heartbeatInterval);
    }
    
    function recordActivity() {
        lastActivityTime = Date.now();
        
        if (isIdle) {
            isIdle = false;
            trackEvent('Session', 'Resume', currentPage);
        }
    }
    
    // ============================================
    // DEVICE INFO
    // ============================================
    
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        
        let device = 'desktop';
        if (/mobile/i.test(ua)) device = 'mobile';
        else if (/tablet|ipad/i.test(ua)) device = 'tablet';
        
        let browser = 'unknown';
        if (/chrome/i.test(ua)) browser = 'chrome';
        else if (/firefox/i.test(ua)) browser = 'firefox';
        else if (/safari/i.test(ua)) browser = 'safari';
        else if (/edge/i.test(ua)) browser = 'edge';
        
        let os = 'unknown';
        if (/windows/i.test(ua)) os = 'windows';
        else if (/mac/i.test(ua)) os = 'macos';
        else if (/linux/i.test(ua)) os = 'linux';
        else if (/android/i.test(ua)) os = 'android';
        else if (/ios|iphone|ipad/i.test(ua)) os = 'ios';
        
        return {
            type: device,
            browser,
            os,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language
        };
    }
    
    // ============================================
    // UTILITIES
    // ============================================
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    // ============================================
    // REPORTING (for Admin Panel)
    // ============================================
    
    function getReport() {
        const analytics = getAnalytics();
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        // Calculate metrics
        const totalSessions = analytics.sessions.length;
        const avgSessionDuration = totalSessions > 0 
            ? Math.round(analytics.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions / 1000)
            : 0;
        
        const bounceRate = analytics.pageStats 
            ? Object.values(analytics.pageStats).reduce((sum, p) => sum + p.bounces, 0) / 
              Object.values(analytics.pageStats).reduce((sum, p) => sum + p.visits, 0) * 100
            : 0;
        
        // Conversion funnel
        const funnel = analytics.funnelData;
        const conversionRate = funnel.views > 0 
            ? (funnel.purchases / funnel.views * 100).toFixed(2)
            : 0;
        
        // Top pages
        const topPages = analytics.pageStats 
            ? Object.entries(analytics.pageStats)
                .map(([page, stats]) => ({ page, ...stats }))
                .sort((a, b) => b.visits - a.visits)
                .slice(0, 10)
            : [];
        
        // Top products
        const topProducts = Object.entries(analytics.productStats || {})
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);
        
        // Daily data for charts
        const dailyData = last7Days.map(date => ({
            date,
            ...analytics.dailyStats[date] || { views: 0, uniqueUsers: [], cartAdds: 0, checkouts: 0, purchases: 0, revenue: 0 }
        }));
        
        // Device breakdown
        const devices = { mobile: 0, desktop: 0, tablet: 0 };
        analytics.sessions.forEach(s => {
            if (s.device?.type) {
                devices[s.device.type] = (devices[s.device.type] || 0) + 1;
            }
        });
        
        // Traffic sources
        const sources = {};
        analytics.sessions.forEach(s => {
            const source = s.referrer || 'direct';
            const domain = source === 'direct' ? 'Direct' : new URL(source).hostname;
            sources[domain] = (sources[domain] || 0) + 1;
        });
        
        // Recent events
        const recentEvents = analytics.events.slice(-50).reverse();
        
        return {
            summary: {
                totalSessions,
                totalPageViews: analytics.funnelData.views,
                avgSessionDuration,
                bounceRate: bounceRate.toFixed(1),
                conversionRate
            },
            funnel,
            topPages,
            topProducts,
            dailyData,
            devices,
            sources,
            recentEvents,
            pageStats: analytics.pageStats || {}
        };
    }
    
    function clearAnalytics() {
        localStorage.removeItem(CONFIG.storageKey);
        console.log('📊 Analytics: Data cleared');
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        initSession();
        trackPageView('home');
        startHeartbeat();
        
        // Event listeners
        window.addEventListener('scroll', debounce(trackScroll, 100));
        window.addEventListener('mousemove', recordActivity);
        window.addEventListener('keydown', recordActivity);
        window.addEventListener('click', (e) => {
            recordActivity();
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                trackClick(e.target);
            }
        });
        
        // Track session end
        window.addEventListener('beforeunload', () => {
            recordPageTime();
            endSession();
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                trackEvent('Session', 'Hidden', currentPage);
            } else {
                trackEvent('Session', 'Visible', currentPage);
                recordActivity();
            }
        });
        
        console.log('📊 Analytics: Initialized');
    }
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    return {
        trackPageView,
        trackEvent,
        trackProductView,
        trackAddToCart,
        trackRemoveFromCart,
        trackCheckoutStart,
        trackPurchase,
        trackSearch,
        getReport,
        clearAnalytics,
        getSession: () => session
    };
    
})();

// Make globally available
window.Analytics = Analytics;
