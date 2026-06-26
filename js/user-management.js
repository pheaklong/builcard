// ============================================
// USER MANAGEMENT SYSTEM - WITH SUPABASE
// ============================================

class UserManagement {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.roles = {
            ADMIN: 'admin',
            EDITOR: 'editor',
            TEACHER: 'teacher',
            STUDENT: 'student'
        };
        this.permissions = {
            admin: {
                create_user: true,
                delete_user: true,
                edit_user: true,
                view_all: true,
                manage_roles: true,
                manage_system: true,
                view_attendance: true,
                view_grades: true,
                manage_grades: true,
                manage_attendance: true,
                view_student_results: true,
                create_notification: true,
                assign_teacher_permissions: true
            },
            editor: {
                create_user: false,
                delete_user: false,
                edit_user: true,
                view_all: true,
                manage_roles: true,
                manage_system: false,
                view_attendance: true,
                view_grades: true,
                manage_grades: true,
                manage_attendance: true,
                view_student_results: true,
                create_notification: true,
                assign_teacher_permissions: true
            },
            teacher: {
                create_user: false,
                delete_user: false,
                edit_user: false,
                view_all: false,
                manage_roles: false,
                manage_system: false,
                view_attendance: true,
                view_grades: true,
                manage_grades: true,
                manage_attendance: true,
                view_student_results: true,
                create_notification: false,
                view_own_classes: true,
                take_attendance: true,
                enter_grades: true,
                assign_teacher_permissions: false
            },
            student: {
                create_user: false,
                delete_user: false,
                edit_user: false,
                view_all: false,
                manage_roles: false,
                manage_system: false,
                view_attendance: false,
                view_grades: false,
                manage_grades: false,
                manage_attendance: false,
                view_student_results: true,
                create_notification: false,
                view_own_results: true,
                request_certificate: true,
                receive_notifications: true,
                assign_teacher_permissions: false
            }
        };
        this.isUsingSupabase = false;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        // Check if Supabase is available
        if (typeof SupabaseConfig !== 'undefined') {
            this.isUsingSupabase = true;
            console.log('✅ Using Supabase for user management');
            try {
                await this.loadUsersFromSupabase();
            } catch (error) {
                console.error('Error loading from Supabase, using localStorage fallback:', error);
                this.loadUsersFromLocal();
            }
        } else {
            console.log('⚠️ Using localStorage for user management (fallback)');
            this.loadUsersFromLocal();
        }
        
        this.loadCurrentUser();
        this.setupAuthListeners();
        this.isInitialized = true;
    }

    // ============================================
    // LOAD USERS FROM SUPABASE
    // ============================================

    async loadUsersFromSupabase() {
        try {
            const users = await SupabaseConfig.getAllUsers();
            if (users && users.length > 0) {
                this.users = users;
                this.saveUsersToLocal();
                console.log(`✅ Loaded ${users.length} users from Supabase`);
            } else {
                console.log('No users found in Supabase, creating default admin...');
                this.createDefaultAdmin();
                // Sync to Supabase
                await this.syncToSupabase();
            }
        } catch (error) {
            console.error('Error loading users from Supabase:', error);
            // Fallback to localStorage
            this.loadUsersFromLocal();
        }
    }

    loadUsersFromLocal() {
        const saved = localStorage.getItem('system_users');
        if (saved) {
            try {
                this.users = JSON.parse(saved);
                console.log(`✅ Loaded ${this.users.length} users from localStorage`);
            } catch (e) {
                console.warn('Error parsing users from localStorage, creating default admin');
                this.users = [];
                this.createDefaultAdmin();
            }
        } else {
            console.log('No users found in localStorage, creating default admin');
            this.createDefaultAdmin();
        }
    }

    saveUsersToLocal() {
        localStorage.setItem('system_users', JSON.stringify(this.users));
    }

    createDefaultAdmin() {
        const defaultAdmin = {
            id: 'admin_001',
            username: 'admin',
            password: this.hashPassword('admin123'),
            email: 'admin@school.edu.kh',
            fullName: 'Administrator',
            role: this.roles.ADMIN,
            createdAt: new Date().toISOString(),
            status: 'active',
            permissions: this.permissions.admin,
            lastLogin: null,
            class: null,
            studentId: null,
            phone: null,
            parentName: null,
            parentPhone: null,
            address: null
        };
        this.users = [defaultAdmin];
        this.saveUsersToLocal();
        console.log('✅ Default admin created: admin / admin123');
    }

    // ============================================
    // SYNC TO SUPABASE
    // ============================================

    async syncToSupabase() {
        if (!this.isUsingSupabase) return;
        
        try {
            for (const user of this.users) {
                const result = await SupabaseConfig.saveUser(user);
                if (!result.success) {
                    console.warn(`Failed to sync user ${user.username}: ${result.error}`);
                }
            }
            console.log('✅ Users synced to Supabase');
        } catch (error) {
            console.error('Error syncing users to Supabase:', error);
        }
    }

    // ============================================
    // HASH PASSWORD
    // ============================================

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    // ============================================
    // LOAD CURRENT USER
    // ============================================

    loadCurrentUser() {
        const saved = localStorage.getItem('current_user');
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
                // Verify user still exists
                const userData = this.users.find(u => u.id === this.currentUser.id);
                if (userData) {
                    const { password, ...userWithoutPassword } = userData;
                    this.currentUser = userWithoutPassword;
                } else {
                    this.currentUser = null;
                    localStorage.removeItem('current_user');
                }
            } catch (e) {
                this.currentUser = null;
            }
        }
    }

    setupAuthListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'current_user') {
                this.loadCurrentUser();
                this.updateUI();
            }
        });
    }

    // ============================================
    // AUTHENTICATION METHODS
    // ============================================

    async login(username, password) {
        const hashedPassword = this.hashPassword(password);
        let user = this.users.find(u => 
            u.username === username && 
            u.password === hashedPassword &&
            u.status === 'active'
        );

        // If not found locally, try Supabase
        if (!user && this.isUsingSupabase) {
            try {
                const supabaseUser = await SupabaseConfig.getUserByUsername(username);
                if (supabaseUser && supabaseUser.password === hashedPassword && supabaseUser.status === 'active') {
                    user = supabaseUser;
                    // Add to local cache
                    const existingIndex = this.users.findIndex(u => u.id === user.id);
                    if (existingIndex === -1) {
                        this.users.push(user);
                    } else {
                        this.users[existingIndex] = user;
                    }
                    this.saveUsersToLocal();
                }
            } catch (error) {
                console.error('Error checking user in Supabase:', error);
            }
        }

        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsersToLocal();
            
            // Update in Supabase
            if (this.isUsingSupabase) {
                try {
                    await SupabaseConfig.updateLastLogin(user.id);
                } catch (e) {
                    console.warn('Could not update last login in Supabase:', e);
                }
            }
            
            // Set current user (without password)
            const { password: pwd, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;
            localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
            
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        return { success: true };
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // ============================================
    // USER MANAGEMENT METHODS
    // ============================================

    async createUser(userData) {
        if (!this.hasPermission('create_user')) {
            return { success: false, message: 'អ្នកមិនមានសិទ្ធិបង្កើតអ្នកប្រើប្រាស់ទេ' };
        }

        // Check if username already exists
        if (this.users.find(u => u.username === userData.username)) {
            return { success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់មានរួចហើយ' };
        }

        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'អ៊ីមែលមានរួចហើយ' };
        }

        // Generate unique ID
        const id = crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newUser = {
            id: id,
            username: userData.username,
            password: this.hashPassword(userData.password),
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role || this.roles.STUDENT,
            createdAt: new Date().toISOString(),
            status: 'active',
            permissions: this.permissions[userData.role] || this.permissions[this.roles.STUDENT],
            lastLogin: null,
            class: userData.class || null,
            studentId: userData.studentId || null,
            phone: userData.phone || null,
            parentName: userData.parentName || null,
            parentPhone: userData.parentPhone || null,
            address: userData.address || null
        };

        this.users.push(newUser);
        this.saveUsersToLocal();

        // Save to Supabase
        if (this.isUsingSupabase) {
            try {
                const result = await SupabaseConfig.saveUser(newUser);
                if (!result.success) {
                    console.warn('Error saving user to Supabase:', result.error);
                }
            } catch (e) {
                console.warn('Could not save user to Supabase:', e);
            }
        }

        const { password, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword };
    }

    // ... (rest of the methods remain the same)
}

// ============================================
// INITIALIZE USER MANAGEMENT
// ============================================

const userManagement = new UserManagement();
window.userManagement = userManagement;

document.addEventListener('DOMContentLoaded', function() {
    userManagement.updateUI();
});
