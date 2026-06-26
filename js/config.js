// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SupabaseConfig = {
    // Supabase credentials - សូមប្តូរតាមគម្រោងរបស់អ្នក
    supabaseUrl: 'https://xmowdtwlidnwnxrkrysj.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAAeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA',
    supabase: null,

    // Tables
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
        try {
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
                console.log('✅ Supabase initialized');
                return true;
            } else {
                console.error('❌ Supabase library not loaded');
                return false;
            }
        } catch (error) {
            console.error('❌ Supabase initialization error:', error);
            return false;
        }
    },

    // ============================================
    // CONNECTION CHECK
    // ============================================

    async checkConnection() {
        try {
            if (!this.supabase) {
                this.init();
            }
            if (!this.supabase) return false;
            
            const { data, error } = await this.supabase
                .from(this.tables.users)
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('Connection error:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Connection error:', error);
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
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            // Check if user exists
            const { data: existing, error: checkError } = await this.supabase
                .from(this.tables.users)
                .select('id')
                .eq('id', user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            let result;
            if (existing) {
                // Update existing user
                result = await this.supabase
                    .from(this.tables.users)
                    .update({
                        username: user.username,
                        email: user.email,
                        full_name: user.fullName,
                        role: user.role,
                        status: user.status,
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
                    .eq('id', user.id);
            } else {
                // Insert new user
                result = await this.supabase
                    .from(this.tables.users)
                    .insert({
                        id: user.id,
                        username: user.username,
                        password: user.password,
                        email: user.email,
                        full_name: user.fullName,
                        role: user.role,
                        status: user.status,
                        permissions: user.permissions || {},
                        class: user.class || null,
                        student_id: user.studentId || null,
                        phone: user.phone || null,
                        parent_name: user.parentName || null,
                        parent_phone: user.parentPhone || null,
                        address: user.address || null,
                        created_at: user.createdAt || new Date().toISOString(),
                        last_login: user.lastLogin || null
                    });
            }

            if (result.error) throw result.error;
            return { success: true, data: result.data };
        } catch (error) {
            console.error('Error saving user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all users from Supabase
     */
    async getAllUsers() {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.users)
                .select('*')
                .order('full_name');

            if (error) throw error;
            
            if (!data || data.length === 0) {
                return [];
            }

            return data.map(user => ({
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
            console.error('Error fetching users:', error);
            return [];
        }
    },

    /**
     * Get a single user by ID
     */
    async getUserById(userId) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.users)
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            
            if (!data) return null;
            
            return {
                id: data.id,
                username: data.username,
                password: data.password,
                email: data.email,
                fullName: data.full_name,
                role: data.role,
                status: data.status,
                permissions: data.permissions || {},
                class: data.class,
                studentId: data.student_id,
                phone: data.phone,
                parentName: data.parent_name,
                parentPhone: data.parent_phone,
                address: data.address,
                createdAt: data.created_at,
                lastLogin: data.last_login
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    },

    /**
     * Get user by username
     */
    async getUserByUsername(username) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.users)
                .select('*')
                .eq('username', username)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            if (!data) return null;
            
            return {
                id: data.id,
                username: data.username,
                password: data.password,
                email: data.email,
                fullName: data.full_name,
                role: data.role,
                status: data.status,
                permissions: data.permissions || {},
                class: data.class,
                studentId: data.student_id,
                phone: data.phone,
                parentName: data.parent_name,
                parentPhone: data.parent_phone,
                address: data.address,
                createdAt: data.created_at,
                lastLogin: data.last_login
            };
        } catch (error) {
            console.error('Error fetching user by username:', error);
            return null;
        }
    },

    /**
     * Delete a user
     */
    async deleteUser(userId) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.users)
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update user status
     */
    async updateUserStatus(userId, status) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.users)
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating user status:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update user permissions
     */
    async updateUserPermissions(userId, permissions) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.users)
                .update({ 
                    permissions: permissions,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating user permissions:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update last login
     */
    async updateLastLogin(userId) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.users)
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating last login:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get users by role
     */
    async getUsersByRole(role) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.users)
                .select('*')
                .eq('role', role)
                .eq('status', 'active')
                .order('full_name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching users by role:', error);
            return [];
        }
    },

    // ============================================
    // NOTIFICATION FUNCTIONS
    // ============================================

    /**
     * Save notification to Supabase
     */
    async saveNotification(notification) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.notifications)
                .insert({
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type || 'info',
                    user_ids: notification.userIds || 'all',
                    read_by: notification.readBy || '',
                    created_at: notification.createdAt || new Date().toISOString()
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error saving notification:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get notifications for a user
     */
    async getNotifications(userId) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.notifications)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) return [];

            // Filter notifications for this user
            return data.filter(n => {
                if (n.user_ids === 'all') return true;
                if (!n.user_ids) return false;
                const userIdsList = n.user_ids.split(',');
                return userIdsList.includes(userId);
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId, userId) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            // Get current notification
            const { data, error } = await this.supabase
                .from(this.tables.notifications)
                .select('read_by')
                .eq('id', notificationId)
                .single();

            if (error) throw error;

            let readBy = data.read_by || '';
            const readList = readBy ? readBy.split(',') : [];
            if (!readList.includes(userId)) {
                readList.push(userId);
                readBy = readList.join(',');
            }

            const { error: updateError } = await this.supabase
                .from(this.tables.notifications)
                .update({ read_by: readBy })
                .eq('id', notificationId);

            if (updateError) throw updateError;
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // SCHEDULE CONFIGURATION
    // ============================================

    /**
     * Save schedule configuration
     */
    async saveScheduleConfig(schedule) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.schedule)
                .upsert({
                    class: schedule.class,
                    subject: schedule.subject,
                    time_slot: schedule.time_slot,
                    semester: schedule.semester,
                    days: schedule.days,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'class,subject,time_slot,semester'
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error saving schedule:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get schedule configuration
     */
    async getScheduleConfig(classVal, subjectVal, timeVal, semesterVal) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.schedule)
                .select('*')
                .eq('class', classVal)
                .eq('subject', subjectVal)
                .eq('time_slot', timeVal)
                .eq('semester', semesterVal)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data || null;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return null;
        }
    },

    // ============================================
    // ATTENDANCE FUNCTIONS
    // ============================================

    async fetchAttendance(classVal, semester, date) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            let query = this.supabase
                .from(this.tables.attendance)
                .select('*')
                .eq('class', classVal);

            if (semester) {
                query = query.eq('semester', parseInt(semester));
            }
            if (date) {
                query = query.eq('date', date);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    },

    async saveAttendanceToSupabase(records) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            if (records.length === 0) return true;

            // Delete existing records for the same class, subject, date
            const first = records[0];
            await this.supabase
                .from(this.tables.attendance)
                .delete()
                .eq('class', first.class)
                .eq('subject', first.subject)
                .eq('date', first.date)
                .eq('time_slot', first.time_slot);

            // Insert new records
            const { error } = await this.supabase
                .from(this.tables.attendance)
                .insert(records.map(r => ({
                    class: r.class,
                    subject: r.subject,
                    time_slot: r.time_slot,
                    semester: r.semester,
                    date: r.date,
                    student_id: r.student_id,
                    status: r.status,
                    auto_assigned: r.auto_assigned || false,
                    teacher_set: r.teacher_set || false,
                    auto_submitted: r.auto_submitted || false,
                    not_scheduled: r.not_scheduled || false,
                    created_at: r.created_at || new Date().toISOString()
                })));

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving attendance:', error);
            return false;
        }
    },

    // ============================================
    // STUDENT FUNCTIONS
    // ============================================

    async fetchStudentsByClass(classVal) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            // First try to get from students table
            const { data, error } = await this.supabase
                .from(this.tables.students)
                .select('*')
                .eq('class', classVal)
                .order('name');

            if (error) throw error;

            if (data && data.length > 0) {
                return data.map(s => ({
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

            // If no students in students table, try to get from users table
            const { data: userData, error: userError } = await this.supabase
                .from(this.tables.users)
                .select('*')
                .eq('role', 'student')
                .eq('class', classVal)
                .eq('status', 'active')
                .order('full_name');

            if (userError) throw userError;

            if (userData && userData.length > 0) {
                return userData.map(s => ({
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
            console.error('Error fetching students:', error);
            return [];
        }
    },

    async fetchAllClasses() {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            // Get distinct classes from students table
            const { data, error } = await this.supabase
                .from(this.tables.students)
                .select('class')
                .not('class', 'is', null);

            if (error) throw error;

            const classes = [...new Set(data.map(s => s.class))].filter(Boolean);
            
            if (classes.length > 0) {
                return classes.sort();
            }

            // If no classes in students, try from users
            const { data: userData, error: userError } = await this.supabase
                .from(this.tables.users)
                .select('class')
                .eq('role', 'student')
                .not('class', 'is', null);

            if (userError) throw userError;

            const userClasses = [...new Set(userData.map(s => s.class))].filter(Boolean);
            return userClasses.sort();
        } catch (error) {
            console.error('Error fetching classes:', error);
            return ['12A', '12B', '12C', '11A', '11B', '10A', '10B'];
        }
    },

    // ============================================
    // CERTIFICATE FUNCTIONS
    // ============================================

    async requestCertificate(studentId, type, details) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.certificates)
                .insert({
                    student_id: studentId,
                    type: type,
                    details: details || {},
                    status: 'pending',
                    requested_at: new Date().toISOString()
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error requesting certificate:', error);
            return { success: false, error: error.message };
        }
    },

    async getCertificates(studentId) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { data, error } = await this.supabase
                .from(this.tables.certificates)
                .select('*')
                .eq('student_id', studentId)
                .order('requested_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching certificates:', error);
            return [];
        }
    },

    async updateCertificateStatus(certificateId, status) {
        try {
            if (!this.supabase) this.init();
            if (!this.supabase) throw new Error('Supabase not initialized');

            const { error } = await this.supabase
                .from(this.tables.certificates)
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString(),
                    completed_at: status === 'completed' ? new Date().toISOString() : null
                })
                .eq('id', certificateId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating certificate:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================
// AUTO-INITIALIZE
// ============================================

// Initialize Supabase when the script loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        SupabaseConfig.init();
    });
}

// Make available globally
window.SupabaseConfig = SupabaseConfig;
