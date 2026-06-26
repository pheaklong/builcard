<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - BUILCARD</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Khmer&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Khmer', 'Khmer OS Moul Light', sans-serif; }
        .sidebar {
            background: #1a1a2e;
            min-height: 100vh;
            width: 250px;
            position: fixed;
            top: 0;
            left: 0;
            padding: 20px 0;
            color: white;
        }
        .sidebar .brand {
            text-align: center;
            padding: 16px 0;
            font-size: 20px;
            font-weight: bold;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 20px;
        }
        .sidebar .brand span {
            color: #4f46e5;
        }
        .sidebar .nav-item {
            display: flex;
            align-items: center;
            padding: 12px 24px;
            color: #a0aec0;
            text-decoration: none;
            transition: all 0.3s;
            cursor: pointer;
            border-left: 3px solid transparent;
        }
        .sidebar .nav-item:hover {
            background: rgba(255,255,255,0.05);
            color: white;
        }
        .sidebar .nav-item.active {
            background: rgba(79, 70, 229, 0.2);
            color: white;
            border-left-color: #4f46e5;
        }
        .sidebar .nav-item .icon {
            margin-right: 12px;
            font-size: 18px;
        }
        .main-content {
            margin-left: 250px;
            padding: 24px;
            min-height: 100vh;
            background: #f7fafc;
        }
        .stats-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .stats-card .number {
            font-size: 28px;
            font-weight: bold;
        }
        .logout-btn {
            color: #fc8181;
        }
        .logout-btn:hover {
            color: #f56565;
            background: rgba(252, 129, 129, 0.1);
        }
        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                min-height: auto;
                position: relative;
                padding: 10px;
            }
            .main-content {
                margin-left: 0;
            }
            .sidebar .nav-item {
                padding: 8px 16px;
                font-size: 14px;
            }
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="brand">📚 BUIL<span>CARD</span></div>
        <nav>
            <a class="nav-item active" data-tab="dashboard" onclick="switchTab('dashboard')">
                <span class="icon">📊</span> ផ្ទាំងគ្រប់គ្រង
            </a>
            <a class="nav-item" data-tab="users" onclick="switchTab('users')">
                <span class="icon">👥</span> គ្រប់គ្រងអ្នកប្រើប្រាស់
            </a>
            <a class="nav-item" data-tab="notifications" onclick="switchTab('notifications')">
                <span class="icon">🔔</span> ការជូនដំណឹង
            </a>
            <a class="nav-item" data-tab="settings" onclick="switchTab('settings')">
                <span class="icon">⚙️</span> ការកំណត់
            </a>
            <a class="nav-item logout-btn" onclick="handleLogout()">
                <span class="icon">🚪</span> ចាកចេញ
            </a>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800" id="pageTitle">📊 ផ្ទាំងគ្រប់គ្រង</h1>
            <div class="flex items-center gap-3">
                <span id="userDisplay" class="text-sm text-gray-600"></span>
                <span id="roleBadge" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Admin</span>
            </div>
        </div>

        <!-- Tab: Dashboard -->
        <div id="tab-dashboard" class="tab-content active">
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="stats-card">
                    <p class="text-gray-500 text-sm">អ្នកប្រើប្រាស់សរុប</p>
                    <p class="number text-indigo-600" id="totalUsers">0</p>
                </div>
                <div class="stats-card">
                    <p class="text-gray-500 text-sm">គ្រូ</p>
                    <p class="number text-green-600" id="totalTeachers">0</p>
                </div>
                <div class="stats-card">
                    <p class="text-gray-500 text-sm">សិស្ស</p>
                    <p class="number text-blue-600" id="totalStudents">0</p>
                </div>
                <div class="stats-card">
                    <p class="text-gray-500 text-sm">ការជូនដំណឹង</p>
                    <p class="number text-yellow-600" id="totalNotifications">0</p>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="font-bold text-gray-800 mb-4">⚡ សកម្មភាពរហ័ស</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onclick="switchTab('users')" class="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-center">
                        <div class="text-2xl">➕</div>
                        <p class="text-sm font-medium text-gray-700">បង្កើតអ្នកប្រើប្រាស់</p>
                    </button>
                    <button onclick="switchTab('notifications')" class="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center">
                        <div class="text-2xl">🔔</div>
                        <p class="text-sm font-medium text-gray-700">ផ្ញើការជូនដំណឹង</p>
                    </button>
                    <a href="attendance.html" class="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center">
                        <div class="text-2xl">📋</div>
                        <p class="text-sm font-medium text-gray-700">ស្រង់វត្តមាន</p>
                    </a>
                    <a href="index.html" class="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
                        <div class="text-2xl">🏠</div>
                        <p class="text-sm font-medium text-gray-700">ទំព័រដើម</p>
                    </a>
                </div>
            </div>
        </div>

        <!-- Tab: Users -->
        <div id="tab-users" class="tab-content">
            <div id="userManagementContainer"></div>
        </div>

        <!-- Tab: Notifications -->
        <div id="tab-notifications" class="tab-content">
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="font-bold text-gray-800 mb-4">🔔 ការជូនដំណឹង</h3>
                
                <!-- Create Notification -->
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-medium text-gray-700 mb-2">📝 បង្កើតការជូនដំណឹងថ្មី</h4>
                    <form id="notificationForm" onsubmit="handleCreateNotification(event)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <input type="text" id="notifTitle" placeholder="ចំណងជើង" class="w-full border rounded-lg px-3 py-2 text-sm" required>
                            </div>
                            <div>
                                <select id="notifType" class="w-full border rounded-lg px-3 py-2 text-sm">
                                    <option value="info">📘 ព័ត៌មាន</option>
                                    <option value="success">✅ ជោគជ័យ</option>
                                    <option value="warning">⚠️ ការព្រមាន</option>
                                    <option value="error">❌ កំហុស</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-2">
                            <textarea id="notifMessage" placeholder="សារជូនដំណឹង..." class="w-full border rounded-lg px-3 py-2 text-sm" rows="2" required></textarea>
                        </div>
                        <div class="mt-2 flex flex-wrap gap-3">
                            <select id="notifAudience" class="border rounded-lg px-3 py-2 text-sm">
                                <option value="all">ទាំងអស់គ្នា</option>
                                <option value="teachers">គ្រូទាំងអស់</option>
                                <option value="students">សិស្សទាំងអស់</option>
                                <option value="admins">Admin ទាំងអស់</option>
                            </select>
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
                                📤 ផ្ញើការជូនដំណឹង
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Notification List -->
                <div id="notificationList">
                    <!-- Will be rendered by JS -->
                </div>
            </div>
        </div>

        <!-- Tab: Settings -->
        <div id="tab-settings" class="tab-content">
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="font-bold text-gray-800 mb-4">⚙️ ការកំណត់ប្រព័ន្ធ</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ឈ្មោះប្រព័ន្ធ</label>
                        <input type="text" value="BUILCARD" class="w-full max-w-md border rounded-lg px-3 py-2 text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ឆ្នាំសិក្សា</label>
                        <select class="w-full max-w-md border rounded-lg px-3 py-2 text-sm">
                            <option>2024-2025</option>
                            <option>2025-2026</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ភាសា</label>
                        <select class="w-full max-w-md border rounded-lg px-3 py-2 text-sm">
                            <option>ភាសាខ្មែរ</option>
                            <option>English</option>
                        </select>
                    </div>
                    <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                        💾 រក្សាទុកការកំណត់
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/config.js"></script>
    <script src="../js/user-management.js"></script>
    <script>
        // ============================================
        // PAGE INITIALIZATION
        // ============================================

        document.addEventListener('DOMContentLoaded', function() {
            // Check if user is logged in and is admin
            if (!userManagement.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }

            const user = userManagement.getCurrentUser();
            if (user.role !== 'admin') {
                alert('អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ');
                window.location.href = 'login.html';
                return;
            }

            // Display user info
            document.getElementById('userDisplay').textContent = `👤 ${user.fullName}`;
            document.getElementById('roleBadge').textContent = 'Admin';

            // Load stats
            updateStats();

            // Load user management
            userManagement.renderUserManagement('userManagementContainer');

            // Load notifications
            renderNotifications();

            // Update UI
            userManagement.updateUI();
        });

        // ============================================
        // TAB SWITCHING
        // ============================================

        function switchTab(tabId) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(el => {
                el.classList.remove('active');
            });

            // Show selected tab
            const tab = document.getElementById(`tab-${tabId}`);
            if (tab) {
                tab.classList.add('active');
            }

            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.tab === tabId) {
                    el.classList.add('active');
                }
            });

            // Update page title
            const titles = {
                'dashboard': '📊 ផ្ទាំងគ្រប់គ្រង',
                'users': '👥 គ្រប់គ្រងអ្នកប្រើប្រាស់',
                'notifications': '🔔 ការជូនដំណឹង',
                'settings': '⚙️ ការកំណត់'
            };
            document.getElementById('pageTitle').textContent = titles[tabId] || '📊 ផ្ទាំងគ្រប់គ្រង';

            // Refresh content if needed
            if (tabId === 'users') {
                userManagement.renderUserManagement('userManagementContainer');
            } else if (tabId === 'notifications') {
                renderNotifications();
            }
        }

        // ============================================
        // STATS
        // ============================================

        function updateStats() {
            const users = userManagement.getUsers();
            const total = users.length;
            const teachers = users.filter(u => u.role === 'teacher').length;
            const students = users.filter(u => u.role === 'student').length;
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]').length;

            document.getElementById('totalUsers').textContent = total;
            document.getElementById('totalTeachers').textContent = teachers;
            document.getElementById('totalStudents').textContent = students;
            document.getElementById('totalNotifications').textContent = notifications;
        }

        // ============================================
        // NOTIFICATIONS
        // ============================================

        function renderNotifications() {
            const container = document.getElementById('notificationList');
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

            if (notifications.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <p>📭 មិនមានការជូនដំណឹងទេ</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="space-y-2 max-h-96 overflow-y-auto">
                    ${notifications.map(n => `
                        <div class="p-3 bg-gray-50 border rounded-lg">
                            <div class="flex justify-between items-start">
                                <h4 class="font-medium text-gray-800">${n.title}</h4>
                                <span class="text-xs text-gray-400">${new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${n.message}</p>
                            <span class="text-xs text-gray-400 mt-1 block">
                                អ្នកទទួល៖ ${n.userIds === 'all' ? 'ទាំងអស់គ្នា' : n.userIds.join(', ')}
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function handleCreateNotification(event) {
            event.preventDefault();

            const title = document.getElementById('notifTitle').value.trim();
            const message = document.getElementById('notifMessage').value.trim();
            const type = document.getElementById('notifType').value;
            const audience = document.getElementById('notifAudience').value;

            if (!title || !message) {
                alert('សូមបញ្ចូលចំណងជើង និងសារជូនដំណឹង');
                return;
            }

            // Determine user IDs based on audience
            let userIds = 'all';
            if (audience !== 'all') {
                const users = userManagement.getUsers();
                userIds = users
                    .filter(u => {
                        if (audience === 'teachers') return u.role === 'teacher';
                        if (audience === 'students') return u.role === 'student';
                        if (audience === 'admins') return u.role === 'admin';
                        return true;
                    })
                    .map(u => u.id);
            }

            const result = userManagement.createNotification(title, message, type, userIds);
            
            if (result.success) {
                alert('✅ បានផ្ញើការជូនដំណឹងដោយជោគជ័យ!');
                document.getElementById('notifTitle').value = '';
                document.getElementById('notifMessage').value = '';
                renderNotifications();
                updateStats();
            } else {
                alert('❌ ' + result.message);
            }
        }

        // ============================================
        // LOGOUT
        // ============================================

        function handleLogout() {
            if (confirm('តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) {
                userManagement.logout();
                window.location.href = 'login.html';
            }
        }

        // ============================================
        // MAKE FUNCTIONS GLOBAL
        // ============================================

        window.switchTab = switchTab;
        window.handleLogout = handleLogout;
        window.handleCreateNotification = handleCreateNotification;
        window.renderNotifications = renderNotifications;
        window.updateStats = updateStats;
    </script>
</body>
</html>
