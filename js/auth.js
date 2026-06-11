// ============================================
// AUTHENTICATION SYSTEM
// ============================================

// Users database (in production, use Supabase Auth instead)
const USERS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' },
    { username: 'keovriev', password: 'school2024', role: 'admin' }
];

// Session timeout in milliseconds (8 hours)
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

// Check if user is logged in
function isLoggedIn() {
    const session = localStorage.getItem('userSession');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        const loginTime = sessionData.loginTime;
        const currentTime = Date.now();
        
        // Check if session expired
        if (currentTime - loginTime > SESSION_TIMEOUT) {
            logout();
            return false;
        }
        
        return true;
    } catch(e) {
        return false;
    }
}

// Get current user
function getCurrentUser() {
    const session = localStorage.getItem('userSession');
    if (!session) return null;
    
    try {
        const sessionData = JSON.parse(session);
        return sessionData.user;
    } catch(e) {
        return null;
    }
}

// Login function
function login(username, password) {
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
        const session = {
            user: { username: user.username, role: user.role },
            loginTime: Date.now()
        };
        localStorage.setItem('userSession', JSON.stringify(session));
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('userSession');
    window.location.href = '../login.html';
}

// Check if current page requires authentication
function isPublicPage() {
    const publicPages = ['digital-card.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    return publicPages.includes(currentPage);
}

// Protect page (call this on every protected page)
function protectPage() {
    if (!isPublicPage() && !isLoggedIn()) {
        // Save the attempted URL to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// Auto logout if session expired (call this periodically)
function checkSession() {
    if (!isPublicPage() && isLoggedIn()) {
        const session = localStorage.getItem('userSession');
        if (session) {
            const sessionData = JSON.parse(session);
            if (Date.now() - sessionData.loginTime > SESSION_TIMEOUT) {
                logout();
            }
        }
    }
}

// Run session check every minute
setInterval(checkSession, 60000);
