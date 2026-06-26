// ============================================
// USER MANAGEMENT SYSTEM
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
            // Admin permissions
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
                create_notification: true
            },
            // Editor permissions
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
            // Teacher permissions
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
                enter_grades: true
            },
            // Student permissions
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
                receive_notifications: true
            }
        };
        this.init();
    }

    init() {
        // Load users from localStorage
        this.loadUsers();
        
        // Check if there's a logged in user
        this.loadCurrentUser();
        
        // Setup auth listeners
        this.setupAuthListeners();
    }

    loadUsers() {
        const saved = localStorage.getItem('system_users');
        if (saved) {
            try {
                this.users = JSON.parse(saved);
            } catch (e) {
                this.users = [];
            }
        } else {
            // Create default admin user if no users exist
            this.createDefaultAdmin();
        }
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
            lastLogin: null
        };
        this.users = [defaultAdmin];
        this.saveUsers();
        console.log('✅ Default admin created: admin / admin123');
    }

    saveUsers() {
        localStorage.setItem('system_users', JSON.stringify(this.users));
        // Also sync to Supabase if available
        this.syncToSupabase();
    }

    async syncToSupabase() {
        try {
            if (typeof SupabaseConfig !== 'undefined') {
                // Save each user to Supabase
                for (const user of this.users) {
                    await SupabaseConfig.saveUser({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        full_name: user.fullName,
                        role: user.role,
                        status: user.status,
                        permissions: user.permissions,
                        created_at: user.createdAt,
                        last_login: user.lastLogin
                    });
                }
            }
        } catch (e) {
            console.warn('Could not sync users to Supabase:', e);
        }
    }

    hashPassword(password) {
        // Simple hash (in production, use bcrypt or similar)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    loadCurrentUser() {
        const saved = localStorage.getItem('current_user');
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
                // Update user data from users list
                const userData = this.users.find(u => u.id === this.currentUser.id);
                if (userData) {
                    this.currentUser = userData;
                }
            } catch (e) {
                this.currentUser = null;
            }
        }
    }

    setupAuthListeners() {
        // Listen for login/logout events
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

    login(username, password) {
        const hashedPassword = this.hashPassword(password);
        const user = this.users.find(u => 
            u.username === username && 
            u.password === hashedPassword &&
            u.status === 'active'
        );

        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            
            // Set current user (without password)
            const { password, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;
            localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
            
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'Username or password incorrect' };
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

    createUser(userData) {
        // Check if user has permission
        if (!this.hasPermission('create_user')) {
            return { success: false, message: 'You do not have permission to create users' };
        }

        // Check if username already exists
        if (this.users.find(u => u.username === userData.username)) {
            return { success: false, message: 'Username already exists' };
        }

        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newUser = {
            id: `user_${Date.now()}`,
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
        this.saveUsers();
        
        const { password, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword };
    }

    updateUser(userId, updates) {
        if (!this.hasPermission('edit_user')) {
            return { success: false, message: 'You do not have permission to edit users' };
        }

        const index = this.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return { success: false, message: 'User not found' };
        }

        // Don't allow editing yourself if you're not admin
        if (this.currentUser && this.currentUser.id === userId && this.currentUser.role !== this.roles.ADMIN) {
            return { success: false, message: 'You cannot edit your own account' };
        }

        // If updating role, update permissions
        if (updates.role) {
            updates.permissions = this.permissions[updates.role] || this.permissions[this.roles.STUDENT];
        }

        // If updating password
        if (updates.password) {
            updates.password = this.hashPassword(updates.password);
        }

        this.users[index] = { ...this.users[index], ...updates };
        this.saveUsers();

        // If updating current user, refresh session
        if (this.currentUser && this.currentUser.id === userId) {
            const { password, ...userWithoutPassword } = this.users[index];
            this.currentUser = userWithoutPassword;
            localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
        }

        return { success: true, user: this.users[index] };
    }

    deleteUser(userId) {
        if (!this.hasPermission('delete_user')) {
            return { success: false, message: 'You do not have permission to delete users' };
        }

        // Cannot delete yourself
        if (this.currentUser && this.currentUser.id === userId) {
            return { success: false, message: 'You cannot delete your own account' };
        }

        // Cannot delete the last admin
        const adminCount = this.users.filter(u => u.role === this.roles.ADMIN).length;
        const userToDelete = this.users.find(u => u.id === userId);
        if (userToDelete && userToDelete.role === this.roles.ADMIN && adminCount <= 1) {
            return { success: false, message: 'Cannot delete the last admin account' };
        }

        this.users = this.users.filter(u => u.id !== userId);
        this.saveUsers();
        return { success: true };
    }

    getUsers(filters = {}) {
        if (!this.hasPermission('view_all')) {
            // Students can only see their own data
            if (this.currentUser && this.currentUser.role === this.roles.STUDENT) {
                return this.users.filter(u => u.id === this.currentUser.id);
            }
            return [];
        }

        let filteredUsers = this.users;
        
        if (filters.role) {
            filteredUsers = filteredUsers.filter(u => u.role === filters.role);
        }
        if (filters.status) {
            filteredUsers = filteredUsers.filter(u => u.status === filters.status);
        }
        if (filters.class) {
            filteredUsers = filteredUsers.filter(u => u.class === filters.class);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(u => 
                u.fullName.toLowerCase().includes(search) ||
                u.username.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search)
            );
        }

        // Remove passwords
        return filteredUsers.map(({ password, ...user }) => user);
    }

    getUserById(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;
        
        // Check permission
        if (!this.hasPermission('view_all') && this.currentUser.id !== userId) {
            return null;
        }
        
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // ============================================
    // PERMISSION CHECKING
    // ============================================

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === this.roles.ADMIN) return true;
        
        const user = this.users.find(u => u.id === this.currentUser.id);
        if (!user) return false;
        
        return user.permissions && user.permissions[permission] === true;
    }

    hasAnyPermission(permissions) {
        for (const perm of permissions) {
            if (this.hasPermission(perm)) return true;
        }
        return false;
    }

    // ============================================
    // TEACHER PERMISSION MANAGEMENT
    // ============================================

    assignTeacherPermissions(teacherId, permissions) {
        if (!this.hasPermission('assign_teacher_permissions') && 
            !this.hasPermission('manage_roles')) {
            return { success: false, message: 'You do not have permission to assign teacher permissions' };
        }

        const teacher = this.users.find(u => u.id === teacherId);
        if (!teacher) {
            return { success: false, message: 'Teacher not found' };
        }

        if (teacher.role !== this.roles.TEACHER) {
            return { success: false, message: 'User is not a teacher' };
        }

        // Merge permissions
        teacher.permissions = { ...teacher.permissions, ...permissions };
        this.saveUsers();
        return { success: true, user: teacher };
    }

    getTeacherPermissions(teacherId) {
        const teacher = this.users.find(u => u.id === teacherId);
        if (!teacher || teacher.role !== this.roles.TEACHER) {
            return null;
        }
        return teacher.permissions || this.permissions[this.roles.TEACHER];
    }

    // ============================================
    // UI METHODS
    // ============================================

    renderLoginForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="login-container max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-indigo-700">🔐 ចូលប្រើប្រព័ន្ធ</h2>
                    <p class="text-gray-500 text-sm">សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់</p>
                </div>
                <form id="loginForm" onsubmit="return userManagement.handleLogin(event)">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">ឈ្មោះអ្នកប្រើប្រាស់</label>
                        <input type="text" id="loginUsername" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">ពាក្យសម្ងាត់</label>
                        <input type="password" id="loginPassword" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="បញ្ចូលពាក្យសម្ងាត់" required>
                    </div>
                    <div id="loginError" class="text-red-500 text-sm mb-2 hidden"></div>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                        ចូលប្រើប្រាស់
                    </button>
                </form>
                <div class="mt-4 text-center text-sm text-gray-500">
                    <p>សាកល្បងប្រើ៖ admin / admin123</p>
                </div>
            </div>
        `;
    }

    handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        const result = this.login(username, password);
        
        if (result.success) {
            window.location.href = this.getRedirectUrl(result.user.role);
        } else {
            errorEl.textContent = result.message;
            errorEl.classList.remove('hidden');
        }
    }

    getRedirectUrl(role) {
        switch(role) {
            case this.roles.ADMIN:
                return 'admin-dashboard.html';
            case this.roles.EDITOR:
                return 'editor-dashboard.html';
            case this.roles.TEACHER:
                return 'teacher-dashboard.html';
            case this.roles.STUDENT:
                return 'student-dashboard.html';
            default:
                return 'index.html';
        }
    }

    renderUserManagement(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!this.hasPermission('view_all')) {
            container.innerHTML = '<div class="text-center py-8 text-red-500">អ្នកមិនមានសិទ្ធិមើលទំព័រនេះទេ</div>';
            return;
        }

        const users = this.getUsers();
        const roles = ['admin', 'editor', 'teacher', 'student'];

        container.innerHTML = `
            <div class="user-management">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">👥 គ្រប់គ្រងអ្នកប្រើប្រាស់</h3>
                    ${this.hasPermission('create_user') ? `
                        <button onclick="userManagement.showCreateUserForm()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            + បង្កើតអ្នកប្រើប្រាស់
                        </button>
                    ` : ''}
                </div>

                <div class="mb-4 flex flex-wrap gap-2">
                    <input type="text" id="userSearch" placeholder="ស្វែងរក..." class="border rounded-lg px-3 py-1 text-sm flex-1 min-w-[150px]" oninput="userManagement.filterUsers()">
                    <select id="roleFilter" class="border rounded-lg px-3 py-1 text-sm" onchange="userManagement.filterUsers()">
                        <option value="">ទាំងអស់</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="teacher">គ្រូ</option>
                        <option value="student">សិស្ស</option>
                    </select>
                    <select id="statusFilter" class="border rounded-lg px-3 py-1 text-sm" onchange="userManagement.filterUsers()">
                        <option value="">ទាំងអស់</option>
                        <option value="active">សកម្ម</option>
                        <option value="inactive">អសកម្ម</option>
                    </select>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="px-3 py-2 text-left">ឈ្មោះ</th>
                                <th class="px-3 py-2 text-left">អ៊ីមែល</th>
                                <th class="px-3 py-2 text-left">តួនាទី</th>
                                <th class="px-3 py-2 text-left">ស្ថានភាព</th>
                                <th class="px-3 py-2 text-center">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            ${users.map(user => this.renderUserRow(user)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderUserRow(user) {
        const roleLabels = {
            admin: '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Admin</span>',
            editor: '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Editor</span>',
            teacher: '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">គ្រូ</span>',
            student: '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">សិស្ស</span>'
        };

        const statusLabels = {
            active: '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">សកម្ម</span>',
            inactive: '<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">អសកម្ម</span>'
        };

        const canEdit = this.hasPermission('edit_user');
        const canDelete = this.hasPermission('delete_user');
        const canManageRoles = this.hasPermission('manage_roles');

        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-3 py-2 font-medium">${user.fullName}</td>
                <td class="px-3 py-2 text-gray-600">${user.email}</td>
                <td class="px-3 py-2">${roleLabels[user.role] || user.role}</td>
                <td class="px-3 py-2">${statusLabels[user.status] || user.status}</td>
                <td class="px-3 py-2 text-center">
                    ${canEdit ? `<button onclick="userManagement.editUser('${user.id}')" class="text-blue-600 hover:text-blue-800 mr-2">✏️</button>` : ''}
                    ${canDelete ? `<button onclick="userManagement.deleteUser('${user.id}')" class="text-red-600 hover:text-red-800">🗑️</button>` : ''}
                    ${canManageRoles && user.role === 'teacher' ? `<button onclick="userManagement.manageTeacherPermissions('${user.id}')" class="text-green-600 hover:text-green-800 ml-2">🔑</button>` : ''}
                </td>
            </tr>
        `;
    }

    filterUsers() {
        const search = document.getElementById('userSearch')?.value || '';
        const role = document.getElementById('roleFilter')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';

        const filtered = this.getUsers({
            search: search,
            role: role,
            status: status
        });

        const tbody = document.getElementById('userTableBody');
        if (tbody) {
            tbody.innerHTML = filtered.map(user => this.renderUserRow(user)).join('');
        }
    }

    showCreateUserForm() {
        if (!this.hasPermission('create_user')) {
            alert('អ្នកមិនមានសិទ្ធិបង្កើតអ្នកប្រើប្រាស់ទេ');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold text-gray-800 mb-4">➕ បង្កើតអ្នកប្រើប្រាស់ថ្មី</h3>
                <form id="createUserForm" onsubmit="userManagement.handleCreateUser(event)">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">ឈ្មោះអ្នកប្រើប្រាស់ *</label>
                        <input type="text" id="newUsername" class="w-full border rounded-lg px-3 py-2" required>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">ពាក្យសម្ងាត់ *</label>
                        <input type="password" id="newPassword" class="w-full border rounded-lg px-3 py-2" required minlength="6">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">ឈ្មោះពេញ *</label>
                        <input type="text" id="newFullName" class="w-full border rounded-lg px-3 py-2" required>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">អ៊ីមែល *</label>
                        <input type="email" id="newEmail" class="w-full border rounded-lg px-3 py-2" required>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">តួនាទី *</label>
                        <select id="newRole" class="w-full border rounded-lg px-3 py-2" required>
                            <option value="student">សិស្ស</option>
                            <option value="teacher">គ្រូ</option>
                            ${this.hasPermission('manage_roles') ? `<option value="editor">Editor</option>` : ''}
                            ${this.currentUser.role === this.roles.ADMIN ? `<option value="admin">Admin</option>` : ''}
                        </select>
                    </div>
                    <div class="mb-3" id="studentFields">
                        <label class="block text-sm font-medium text-gray-700">ថ្នាក់</label>
                        <input type="text" id="newClass" class="w-full border rounded-lg px-3 py-2" placeholder="ឧ. 12A">
                    </div>
                    <div class="mb-3" id="studentFields2">
                        <label class="block text-sm font-medium text-gray-700">លេខសម្គាល់សិស្ស</label>
                        <input type="text" id="newStudentId" class="w-full border rounded-lg px-3 py-2" placeholder="ឧ. STU001">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">លេខទូរស័ព្ទ</label>
                        <input type="tel" id="newPhone" class="w-full border rounded-lg px-3 py-2">
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                            បង្កើត
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
                            បោះបង់
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Show/hide student fields based on role
        document.getElementById('newRole').addEventListener('change', function() {
            const show = this.value === 'student';
            document.getElementById('studentFields').style.display = show ? 'block' : 'none';
            document.getElementById('studentFields2').style.display = show ? 'block' : 'none';
        });
    }

    handleCreateUser(event) {
        event.preventDefault();
        
        const userData = {
            username: document.getElementById('newUsername').value,
            password: document.getElementById('newPassword').value,
            fullName: document.getElementById('newFullName').value,
            email: document.getElementById('newEmail').value,
            role: document.getElementById('newRole').value,
            class: document.getElementById('newClass').value || null,
            studentId: document.getElementById('newStudentId').value || null,
            phone: document.getElementById('newPhone').value || null
        };

        const result = this.createUser(userData);
        if (result.success) {
            alert('✅ បានបង្កើតអ្នកប្រើប្រាស់ដោយជោគជ័យ!');
            document.querySelector('.fixed')?.remove();
            this.renderUserManagement('userManagementContainer');
        } else {
            alert('❌ ' + result.message);
        }
    }

    editUser(userId) {
        const user = this.getUserById(userId);
        if (!user) {
            alert('រកមិនឃើញអ្នកប្រើប្រាស់');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold text-gray-800 mb-4">✏️ កែប្រែអ្នកប្រើប្រាស់</h3>
                <form id="editUserForm" onsubmit="userManagement.handleEditUser(event, '${userId}')">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">ឈ្មោះពេញ</label>
                        <input type="text" id="editFullName" class="w-full border rounded-lg px-3 py-2" value="${user.fullName}" required>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">អ៊ីមែល</label>
                        <input type="email" id="editEmail" class="w-full border rounded-lg px-3 py-2" value="${user.email}" required>
                    </div>
                    ${this.hasPermission('manage_roles') ? `
                        <div class="mb-3">
                            <label class="block text-sm font-medium text-gray-700">តួនាទី</label>
                            <select id="editRole" class="w-full border rounded-lg px-3 py-2">
                                <option value="student" ${user.role === 'student' ? 'selected' : ''}>សិស្ស</option>
                                <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>គ្រូ</option>
                                ${this.currentUser.role === this.roles.ADMIN ? `
                                    <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Editor</option>
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                ` : ''}
                            </select>
                        </div>
                    ` : ''}
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">ស្ថានភាព</label>
                        <select id="editStatus" class="w-full border rounded-lg px-3 py-2">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>សកម្ម</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>អសកម្ម</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">ពាក្យសម្ងាត់ថ្មី (ទុកចោលប្រសិនបើមិនចង់ប្តូរ)</label>
                        <input type="password" id="editPassword" class="w-full border rounded-lg px-3 py-2" placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី">
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                            រក្សាទុក
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
                            បោះបង់
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    handleEditUser(event, userId) {
        event.preventDefault();
        
        const updates = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            status: document.getElementById('editStatus').value
        };

        const roleSelect = document.getElementById('editRole');
        if (roleSelect) {
            updates.role = roleSelect.value;
        }

        const password = document.getElementById('editPassword').value;
        if (password) {
            updates.password = password;
        }

        const result = this.updateUser(userId, updates);
        if (result.success) {
            alert('✅ បានកែប្រែអ្នកប្រើប្រាស់ដោយជោគជ័យ!');
            document.querySelector('.fixed')?.remove();
            this.renderUserManagement('userManagementContainer');
        } else {
            alert('❌ ' + result.message);
        }
    }

    deleteUser(userId) {
        if (!confirm('តើអ្នកប្រាកដជាចង់លុបអ្នកប្រើប្រាស់នេះមែនទេ?')) return;

        const result = this.deleteUser(userId);
        if (result.success) {
            alert('✅ បានលុបអ្នកប្រើប្រាស់ដោយជោគជ័យ!');
            this.renderUserManagement('userManagementContainer');
        } else {
            alert('❌ ' + result.message);
        }
    }

    manageTeacherPermissions(teacherId) {
        const teacher = this.getUserById(teacherId);
        if (!teacher) {
            alert('រកមិនឃើញគ្រូ');
            return;
        }

        const permissions = this.getTeacherPermissions(teacherId) || this.permissions[this.roles.TEACHER];

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                <h3 class="text-xl font-bold text-gray-800 mb-4">🔑 កំណត់សិទ្ធិគ្រូ</h3>
                <p class="text-sm text-gray-500 mb-4">គ្រូ៖ <strong>${teacher.fullName}</strong></p>
                <form id="permissionForm" onsubmit="userManagement.handlePermissionUpdate(event, '${teacherId}')">
                    <div class="space-y-2 mb-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="perm_attendance" ${permissions.take_attendance ? 'checked' : ''}>
                            <span>ស្រង់វត្តមាន</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="perm_grades" ${permissions.enter_grades ? 'checked' : ''}>
                            <span>បញ្ជូលពិន្ទុ</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="perm_results" ${permissions.view_student_results ? 'checked' : ''}>
                            <span>មើលលទ្ធផលសិស្ស</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="perm_manage" ${permissions.manage_grades ? 'checked' : ''}>
                            <span>គ្រប់គ្រងពិន្ទុ</span>
                        </label>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                            រក្សាទុក
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
                            បោះបង់
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    handlePermissionUpdate(event, teacherId) {
        event.preventDefault();
        
        const permissions = {
            take_attendance: document.getElementById('perm_attendance').checked,
            enter_grades: document.getElementById('perm_grades').checked,
            view_student_results: document.getElementById('perm_results').checked,
            manage_grades: document.getElementById('perm_manage').checked
        };

        const result = this.assignTeacherPermissions(teacherId, permissions);
        if (result.success) {
            alert('✅ បានកំណត់សិទ្ធិដោយជោគជ័យ!');
            document.querySelector('.fixed')?.remove();
            this.renderUserManagement('userManagementContainer');
        } else {
            alert('❌ ' + result.message);
        }
    }

    // ============================================
    // UI UPDATE
    // ============================================

    updateUI() {
        // Update navigation based on user role
        const nav = document.querySelector('.user-nav');
        if (!nav) return;

        if (this.currentUser) {
            const roleLabels = {
                admin: '👑 Admin',
                editor: '📝 Editor',
                teacher: '👨‍🏫 គ្រូ',
                student: '👨‍🎓 សិស្ស'
            };

            nav.innerHTML = `
                <span class="text-sm text-gray-600">${roleLabels[this.currentUser.role] || this.currentUser.role}</span>
                <span class="text-sm text-gray-600">${this.currentUser.fullName}</span>
                <button onclick="userManagement.logout()" class="text-red-600 hover:text-red-800 text-sm">ចាកចេញ</button>
            `;
        } else {
            nav.innerHTML = `
                <button onclick="userManagement.showLogin()" class="text-indigo-600 hover:text-indigo-800 text-sm">ចូលប្រើប្រាស់</button>
            `;
        }
    }

    showLogin() {
        // Redirect to login page or show login modal
        window.location.href = 'login.html';
    }

    logout() {
        if (confirm('តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) {
            this.logout();
            window.location.href = 'login.html';
        }
    }

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================

    createNotification(title, message, type = 'info', userIds = null) {
        if (!this.hasPermission('create_notification')) {
            return { success: false, message: 'You do not have permission to create notifications' };
        }

        const notification = {
            id: `notif_${Date.now()}`,
            title: title,
            message: message,
            type: type, // 'info', 'warning', 'success', 'error'
            createdAt: new Date().toISOString(),
            readBy: [],
            userIds: userIds || 'all' // 'all' or array of user IDs
        };

        // Save to localStorage
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));

        // Also save to Supabase
        if (typeof SupabaseConfig !== 'undefined') {
            SupabaseConfig.saveNotification(notification).catch(e => {
                console.warn('Could not save notification to Supabase:', e);
            });
        }

        return { success: true, notification: notification };
    }

    getNotifications(userId = null) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        if (!userId) {
            userId = this.currentUser?.id;
        }

        if (!userId) return [];

        return notifications.filter(n => {
            return n.userIds === 'all' || n.userIds.includes(userId);
        });
    }

    markNotificationRead(notificationId, userId = null) {
        if (!userId) {
            userId = this.currentUser?.id;
        }
        if (!userId) return;

        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    }

    renderNotifications(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const notifications = this.getNotifications();
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <p>📭 មិនមានការជូនដំណឹងទេ</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-2">
                ${notifications.slice(0, 10).map(n => `
                    <div class="p-3 bg-white border rounded-lg ${n.readBy.includes(this.currentUser?.id) ? 'opacity-70' : 'border-indigo-300'}">
                        <div class="flex justify-between items-start">
                            <h4 class="font-medium text-gray-800">${n.title}</h4>
                            <span class="text-xs text-gray-400">${new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">${n.message}</p>
                        ${!n.readBy.includes(this.currentUser?.id) ? `
                            <button onclick="userManagement.markNotificationRead('${n.id}')" class="text-xs text-indigo-600 mt-1">
                                អានរួច
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ============================================
// INITIALIZE USER MANAGEMENT
// ============================================

const userManagement = new UserManagement();

// Make available globally
window.userManagement = userManagement;

// Auto update UI on load
document.addEventListener('DOMContentLoaded', function() {
    userManagement.updateUI();
});
