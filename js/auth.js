// ============================================
// AUTHENTICATION SYSTEM WITH SUPABASE
// ============================================

const SUPABASE_URL = 'https://xmowdtwlidnwnxrkrysj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'users';

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

// Login function with Supabase
async function login(username, password) {
    try {
        // Query user from Supabase
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('username, role')
            .eq('username', username)
            .eq('password', password)
            .single();
        
        if (error || !data) {
            console.error('Login error:', error);
            return false;
        }
        
        // Create session
        const session = {
            user: { username: data.username, role: data.role },
            loginTime: Date.now()
        };
        localStorage.setItem('userSession', JSON.stringify(session));
        return true;
        
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
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

// Make functions global
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;
window.protectPage = protectPage;

console.log('✅ Auth system with Supabase loaded');
