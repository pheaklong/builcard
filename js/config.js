// ============================================
// SUPABASE CONFIGURATION - DIRECT FETCH
// ============================================

const SupabaseConfig = {
    // Supabase credentials
    supabaseUrl: 'https://xmodwtwlidnwnxrkrvsj.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQzMjYwMCwiZXhwIjoyMDk2MDA4NjAwfQ.rNPt8E7eoNHon1oTLj64DU8DDVBZ-SZp4ZJmREHH8N8',
    supabase: null,
    isInitialized: false,

    tables: {
        users: 'users',
        attendance: 'attendance',
        grades: 'grades',
        students: 'students',
        classes: 'classes',
        notifications: 'notifications',
        certificates: 'certificates',
        schedule: 'schedule'
    },

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        if (this.isInitialized) return true;
        
        try {
            // Check if supabase library is loaded
            if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
                // Regular client for authentication
                this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true
                    },
                    global: {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }
                });
                console.log('✅ Supabase client initialized');
            } else {
                console.warn('⚠️ Supabase library not loaded, using direct fetch only');
            }
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ Supabase initialization error:', error);
            this.isInitialized = true;
            return true;
        }
    },

    // ============================================
    // DIRECT FETCH HELPERS
    // ============================================

    getHeaders(useServiceRole = true) {
        const key = useServiceRole ? this.supabaseServiceKey : this.supabaseKey;
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
        };
    },

    async fetchFromSupabase(endpoint, options = {}) {
        const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
        const useServiceRole = options.useServiceRole !== false;
        const headers = this.getHeaders(useServiceRole);
        
        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                ...headers,
                ...(options.headers || {})
            }
        };

        if (options.body) {
            fetchOptions.body = options.body;
        }

        try {
            console.log(`📡 ${fetchOptions.method} ${url}`);
            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP ${response.status}: ${errorText}`);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            console.error('Fetch error:', error);
            return { data: null, error: error };
        }
    },

    // ============================================
    // CONNECTION CHECK
    // ============================================

    async checkConnection() {
        try {
            console.log('🔍 Checking Supabase connection...');
            
            const result = await this.fetchFromSupabase('users?select=count&limit=1', {
                useServiceRole: true
            });
            
            if (result.error) {
                console.error('❌ Connection failed');
                return false;
            }
            
            console.log('✅ Supabase connection successful');
            return true;
        } catch (error) {
            console.error('❌ Connection error:', error);
            return false;
        }
    },

    // ============================================
    // USER MANAGEMENT FUNCTIONS
    // ============================================

    /**
     * Save a user to Supabase
     */
    async saveUser(user) {
        try {
            console.log(`📝 Saving user: ${user.username}`);
            
            // Check if user exists
            const checkResult = await this.fetchFromSupabase(
                `users?select=id&id=eq.${encodeURIComponent(user.id)}`,
                { useServiceRole: true }
            );

            let result;
            if (checkResult.data && checkResult.data.length > 0) {
                // Update existing user
                console.log(`🔄 Updating user: ${user.username}`);
                result = await this.fetchFromSupabase(
                    `users?id=eq.${encodeURIComponent(user.id)}`,
                    {
                        method: 'PATCH',
                        useServiceRole: true,
                        body: JSON.stringify({
                            username: user.username,
                            email: user.email,
                            full_name: user.fullName,
                            role: user.role,
                            status: user.status || 'active',
                            permissions: user.permissions || {},
                            class: user.class || null,
                            student_id: user.studentId || null,
                            phone: user.phone || null,
                            parent_name: user.parentName || null,
                            parent_phone: user.parentPhone || null,
                            address: user.address || null,
                            last_login: user.lastLogin || null,
                            updated_at: new Date().toISOString()
                        })
                    }
                );
            } else {
                // Insert new user
                console.log(`➕ Inserting user: ${user.username}`);
                result = await this.fetchFromSupabase(
                    'users',
                    {
                        method: 'POST',
                        useServiceRole: true,
                        body: JSON.stringify({
                            id: user.id,
                            username: user.username,
                            password: user.password,
                            email: user.email,
                            full_name: user.fullName,
                            role: user.role,
                            status: user.status || 'active',
                            permissions: user.permissions || {},
                            class: user.class || null,
                            student_id: user.studentId || null,
                            phone: user.phone || null,
                            parent_name: user.parentName || null,
                            parent_phone: user.parentPhone || null,
                            address: user.address || null,
                            created_at: user.createdAt || new Date().toISOString(),
                            last_login: user.lastLogin || null
                        })
                    }
                );
            }

            if (result.error) {
                console.error('❌ Supabase error:', result.error);
                throw result.error;
            }
            
            console.log(`✅ User saved: ${user.username}`);
            return { success: true, data: result.data };
        } catch (error) {
            console.error('❌ Error saving user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all users from Supabase
     */
    async getAllUsers() {
        try {
            console.log('📋 Fetching all users...');
            
            const result = await this.fetchFromSupabase(
                'users?select=*&order=full_name.asc',
                { useServiceRole: true }
            );

            if (result.error) {
                console.error('❌ Error fetching users:', result.error);
                return [];
            }
            
            if (!result.data || result.data.length === 0) {
                console.log('📭 No users found');
                return [];
            }

            console.log(`✅ Fetched ${result.data.length} users`);
            return result.data.map(user => ({
                id: user.id,
                username: user.username,
                password: user.password,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                status: user.status,
                permissions: user.permissions || {},
                class: user.class,
                studentId: user.student_id,
                phone: user.phone,
                parentName: user.parent_name,
                parentPhone: user.parent_phone,
                address: user.address,
                createdAt: user.created_at,
                lastLogin: user.last_login
            }));
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            return [];
        }
    },

    /**
     * Get user by username
     */
    async getUserByUsername(username) {
        try {
            console.log(`🔍 Fetching user by username: ${username}`);
            
            const result = await this.fetchFromSupabase(
                `users?select=*&username=eq.${encodeURIComponent(username)}`,
                { useServiceRole: true }
            );

            if (result.error) {
                console.error('❌ Error fetching user:', result.error);
                return null;
            }
            
            if (!result.data || result.data.length === 0) {
                console.log(`📭 User not found: ${username}`);
                return null;
            }

            const user = result.data[0];
            console.log(`✅ Found user: ${username}`);
            
            return {
                id: user.id,
                username: user.username,
                password: user.password,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                status: user.status,
                permissions: user.permissions || {},
                class: user.class,
                studentId: user.student_id,
                phone: user.phone,
                parentName: user.parent_name,
                parentPhone: user.parent_phone,
                address: user.address,
                createdAt: user.created_at,
                lastLogin: user.last_login
            };
        } catch (error) {
            console.error('❌ Error fetching user by username:', error);
            return null;
        }
    },

    /**
     * Delete a user
     */
    async deleteUser(userId) {
        try {
            console.log(`🗑️ Deleting user: ${userId}`);
            
            const result = await this.fetchFromSupabase(
                `users?id=eq.${encodeURIComponent(userId)}`,
                {
                    method: 'DELETE',
                    useServiceRole: true
                }
            );

            if (result.error) {
                console.error('❌ Error deleting user:', result.error);
                throw result.error;
            }
            
            console.log(`✅ User deleted: ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update user permissions
     */
    async updateUserPermissions(userId, permissions) {
        try {
            console.log(`🔑 Updating permissions for user: ${userId}`);
            
            const result = await this.fetchFromSupabase(
                `users?id=eq.${encodeURIComponent(userId)}`,
                {
                    method: 'PATCH',
                    useServiceRole: true,
                    body: JSON.stringify({
                        permissions: permissions,
                        updated_at: new Date().toISOString()
                    })
                }
            );

            if (result.error) {
                console.error('❌ Error updating permissions:', result.error);
                throw result.error;
            }
            
            console.log(`✅ Permissions updated for user: ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating permissions:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update last login
     */
    async updateLastLogin(userId) {
        try {
            const result = await this.fetchFromSupabase(
                `users?id=eq.${encodeURIComponent(userId)}`,
                {
                    method: 'PATCH',
                    useServiceRole: true,
                    body: JSON.stringify({
                        last_login: new Date().toISOString()
                    })
                }
            );

            if (result.error) {
                console.error('❌ Error updating last login:', result.error);
                throw result.error;
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating last login:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // NOTIFICATION FUNCTIONS
    // ============================================

    async saveNotification(notification) {
        try {
            console.log(`📝 Saving notification: ${notification.title}`);
            
            const result = await this.fetchFromSupabase(
                'notifications',
                {
                    method: 'POST',
                    useServiceRole: true,
                    body: JSON.stringify({
                        id: notification.id,
                        title: notification.title,
                        message: notification.message,
                        type: notification.type || 'info',
                        user_ids: notification.userIds || 'all',
                        read_by: notification.readBy || '',
                        created_at: notification.createdAt || new Date().toISOString()
                    })
                }
            );

            if (result.error) {
                console.error('❌ Error saving notification:', result.error);
                throw result.error;
            }
            
            console.log(`✅ Notification saved: ${notification.title}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving notification:', error);
            return { success: false, error: error.message };
        }
    },

    async getNotifications(userId) {
        try {
            const result = await this.fetchFromSupabase(
                'notifications?select=*&order=created_at.desc',
                { useServiceRole: true }
            );

            if (result.error) {
                console.error('❌ Error fetching notifications:', result.error);
                return [];
            }

            if (!result.data || result.data.length === 0) return [];

            return result.data.filter(n => {
                if (n.user_ids === 'all') return true;
                if (!n.user_ids) return false;
                const userIdsList = n.user_ids.split(',');
                return userIdsList.includes(userId);
            });
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
            return [];
        }
    },

    async markNotificationRead(notificationId, userId) {
        try {
            // Get current notification
            const getResult = await this.fetchFromSupabase(
                `notifications?select=read_by&id=eq.${encodeURIComponent(notificationId)}`,
                { useServiceRole: true }
            );

            if (getResult.error) {
                console.error('❌ Error fetching notification:', getResult.error);
                throw getResult.error;
            }

            let readBy = getResult.data?.[0]?.read_by || '';
            const readList = readBy ? readBy.split(',') : [];
            if (!readList.includes(userId)) {
                readList.push(userId);
                readBy = readList.join(',');
            }

            const result = await this.fetchFromSupabase(
                `notifications?id=eq.${encodeURIComponent(notificationId)}`,
                {
                    method: 'PATCH',
                    useServiceRole: true,
                    body: JSON.stringify({ read_by: readBy })
                }
            );

            if (result.error) {
                console.error('❌ Error marking notification as read:', result.error);
                throw result.error;
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // ATTENDANCE FUNCTIONS
    // ============================================

    async fetchAttendance(classVal, semester, date) {
        try {
            let query = `attendance?select=*&class=eq.${encodeURIComponent(classVal)}`;
            if (semester) query += `&semester=eq.${semester}`;
            if (date) query += `&date=eq.${date}`;
            
            const result = await this.fetchFromSupabase(query, { useServiceRole: true });
            if (result.error) throw result.error;
            return result.data || [];
        } catch (error) {
            console.error('❌ Error fetching attendance:', error);
            return [];
        }
    },

    async saveAttendanceToSupabase(records) {
        try {
            if (records.length === 0) return true;

            const first = records[0];
            // Delete existing records
            await this.fetchFromSupabase(
                `attendance?class=eq.${encodeURIComponent(first.class)}&subject=eq.${encodeURIComponent(first.subject)}&date=eq.${first.date}&time_slot=eq.${encodeURIComponent(first.time_slot)}`,
                {
                    method: 'DELETE',
                    useServiceRole: true
                }
            );

            // Insert new records
            for (const record of records) {
                await this.fetchFromSupabase(
                    'attendance',
                    {
                        method: 'POST',
                        useServiceRole: true,
                        body: JSON.stringify({
                            class: record.class,
                            subject: record.subject,
                            time_slot: record.time_slot,
                            semester: record.semester,
                            date: record.date,
                            student_id: record.student_id,
                            status: record.status,
                            auto_assigned: record.auto_assigned || false,
                            teacher_set: record.teacher_set || false,
                            auto_submitted: record.auto_submitted || false,
                            not_scheduled: record.not_scheduled || false,
                            created_at: record.created_at || new Date().toISOString()
                        })
                    }
                );
            }

            return true;
        } catch (error) {
            console.error('❌ Error saving attendance:', error);
            return false;
        }
    },

    // ============================================
    // STUDENT FUNCTIONS
    // ============================================

    async fetchStudentsByClass(classVal) {
        try {
            const result = await this.fetchFromSupabase(
                `students?select=*&class=eq.${encodeURIComponent(classVal)}&order=name.asc`,
                { useServiceRole: true }
            );

            if (result.error) throw result.error;

            if (result.data && result.data.length > 0) {
                return result.data.map(s => ({
                    studentID: s.student_id || s.id,
                    name: s.name,
                    class: s.class,
                    sex: s.sex || 'N/A',
                    photo: s.photo || null,
                    phone: s.phone || null,
                    parentName: s.parent_name || null,
                    parentPhone: s.parent_phone || null,
                    address: s.address || null
                }));
            }

            // If no students, try from users table
            const userResult = await this.fetchFromSupabase(
                `users?select=*&role=eq.student&class=eq.${encodeURIComponent(classVal)}&status=eq.active&order=full_name.asc`,
                { useServiceRole: true }
            );

            if (userResult.error) throw userResult.error;

            if (userResult.data && userResult.data.length > 0) {
                return userResult.data.map(s => ({
                    studentID: s.student_id || s.id,
                    name: s.full_name,
                    class: s.class,
                    sex: 'N/A',
                    photo: null,
                    phone: s.phone || null,
                    parentName: s.parent_name || null,
                    parentPhone: s.parent_phone || null,
                    address: s.address || null
                }));
            }

            return [];
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            return [];
        }
    },

    async fetchAllClasses() {
        try {
            const result = await this.fetchFromSupabase(
                'students?select=class&not.class=is.null',
                { useServiceRole: true }
            );

            if (result.error) throw result.error;

            const classes = [...new Set((result.data || []).map(s => s.class))].filter(Boolean);
            
            if (classes.length > 0) {
                return classes.sort();
            }

            // If no classes, try from users
            const userResult = await this.fetchFromSupabase(
                'users?select=class&role=eq.student&not.class=is.null',
                { useServiceRole: true }
            );

            if (userResult.error) throw userResult.error;

            const userClasses = [...new Set((userResult.data || []).map(s => s.class))].filter(Boolean);
            return userClasses.sort();
        } catch (error) {
            console.error('❌ Error fetching classes:', error);
            return ['12A', '12B', '12C', '11A', '11B', '10A', '10B'];
        }
    },

    // ============================================
    // CERTIFICATE FUNCTIONS
    // ============================================

    async requestCertificate(studentId, type, details) {
        try {
            const result = await this.fetchFromSupabase(
                'certificates',
                {
                    method: 'POST',
                    useServiceRole: true,
                    body: JSON.stringify({
                        student_id: studentId,
                        type: type,
                        details: details || {},
                        status: 'pending',
                        requested_at: new Date().toISOString()
                    })
                }
            );

            if (result.error) throw result.error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error requesting certificate:', error);
            return { success: false, error: error.message };
        }
    },

    async getCertificates(studentId) {
        try {
            const result = await this.fetchFromSupabase(
                `certificates?select=*&student_id=eq.${encodeURIComponent(studentId)}&order=requested_at.desc`,
                { useServiceRole: true }
            );

            if (result.error) throw result.error;
            return result.data || [];
        } catch (error) {
            console.error('❌ Error fetching certificates:', error);
            return [];
        }
    },

    async updateCertificateStatus(certificateId, status) {
        try {
            const result = await this.fetchFromSupabase(
                `certificates?id=eq.${encodeURIComponent(certificateId)}`,
                {
                    method: 'PATCH',
                    useServiceRole: true,
                    body: JSON.stringify({
                        status: status,
                        updated_at: new Date().toISOString(),
                        completed_at: status === 'completed' ? new Date().toISOString() : null
                    })
                }
            );

            if (result.error) throw result.error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating certificate:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================
// AUTO-INITIALIZE
// ============================================

console.log('🚀 Initializing Supabase config...');
SupabaseConfig.init();

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM ready, ensuring Supabase is initialized...');
        SupabaseConfig.init();
    });
}

window.SupabaseConfig = SupabaseConfig;
console.log('📦 SupabaseConfig loaded');
