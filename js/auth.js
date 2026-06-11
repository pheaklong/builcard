// ============================================
// AUTHENTICATION SYSTEM - SIMPLE VERSION
// ============================================

// Users database (in production, move to backend)
const USERS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' },
    { username: 'keovriev', password: 'school2024', role: 'admin' }
];

// Session timeout (8 hours)
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

// Check if user is logged in
function isLoggedIn() {
    const session = localStorage.getItem('userSession');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        const loginTime = sessionData.loginTime;
        const currentTime = Date.now();
        
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
        return JSON.parse(session).user;
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
    localStorage.removeItem('redirectAfterLogin');
    
    // Redirect based on current path
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        window.location.href = '../login.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Check if current page is public
function isPublicPage() {
    const publicPages = ['digital-card.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    return publicPages.includes(currentPage);
}

// Protect page
function protectPage() {
    if (!isPublicPage() && !isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = '../login.html';
        } else {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

// Make functions globally available
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;
window.protectPage = protectPage;

console.log('✅ Auth system loaded');
