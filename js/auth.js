// ============================================
// AUTHENTICATION SYSTEM
// ============================================

// Users database
const USERS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    
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

// Logout function - redirect to login.html
function logout() {
    // Clear session from localStorage
    localStorage.removeItem('userSession');
    
    // Clear any redirect URL to prevent auto-login loop
    localStorage.removeItem('redirectAfterLogin');
    
    // Redirect to login page
    // Need to determine correct path based on current location
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/pages/')) {
        // If we're in a subdirectory (pages folder)
        window.location.href = '../login.html';
    } else {
        // If we're in root directory
        window.location.href = 'login.html';
    }
}

// Check if current page is public (no login required)
function isPublicPage() {
    const publicPages = ['digital-card.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    return publicPages.includes(currentPage);
}

// Protect page - redirect to login if not authenticated
function protectPage() {
    if (!isPublicPage() && !isLoggedIn()) {
        // Save the attempted URL to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.href);
        
        // Redirect to login page
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

// Display user info in navbar (optional)
function displayUserInfo() {
    const user = getCurrentUser();
    if (user && document.getElementById('userInfo')) {
        document.getElementById('userInfo').innerHTML = `
            <span class="text-sm text-gray-600">👤 ${user.username}</span>
            <button onclick="logout()" class="ml-3 text-red-600 hover:text-red-800 text-sm">🚪 ចាកចេញ</button>
        `;
    }
}

// Make functions globally available
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;
window.protectPage = protectPage;
window.displayUserInfo = displayUserInfo;

console.log('✅ Auth system loaded');
