// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SupabaseConfig = {
    // Supabase credentials
    supabaseUrl: 'https://xmodwtwlidnwnxrkrvsj.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQzMjYwMCwiZXhwIjoyMDk2MDA4NjAwfQ.rNPt8E7eoNHon1oTLj64DU8DDVBZ-SZp4ZJmREHH8N8',
    supabase: null,
    supabaseAdmin: null,
    isInitialized: false,
    connectionAttempts: 0,
    maxConnectionAttempts: 5,

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
            if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
                console.warn('⚠️ Supabase library not loaded yet, will retry...');
                if (this.connectionAttempts < this.maxConnectionAttempts) {
                    this.connectionAttempts++;
                    setTimeout(() => this.init(), 1000);
                } else {
                    console.error('❌ Supabase library not loaded after maximum attempts');
                }
                return false;
            }

            // Regular client for authentication
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                },
                global: {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            });
            
            // Admin client with service role (bypass RLS)
            if (this.supabaseServiceKey && this.supabaseServiceKey !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
                this.supabaseAdmin = supabase.createClient(this.supabaseUrl, this.supabaseServiceKey, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    },
                    global: {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apikey': this.supabaseServiceKey,
                            'Authorization': `Bearer ${this.supabaseServiceKey}`
                        }
                    }
                });
                console.log('✅ Supabase admin client initialized with service role');
            } else {
                console.warn('⚠️ Service role key not configured, using regular client');
                this.supabaseAdmin = this.supabase;
            }
            
            this.isInitialized = true;
            this.connectionAttempts = 0;
            console.log('✅ Supabase initialized successfully');
            console.log(`📡 URL: ${this.supabaseUrl}`);
            return true;
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
            if (!this.isInitialized) {
                const initResult = this.init();
                if (!initResult) {
                    console.warn('⚠️ Supabase not initialized');
                    return false;
                }
            }
            
            if (!this.supabase) {
                console.warn('⚠️ Supabase client not available');
                return false;
            }
            
            const client = this.supabaseAdmin || this.supabase;
            
            const { data, error } = await client
                .from(this.tables.users)
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('Connection error:', error);
                return false;
            }
            
            console.log('✅ Supabase connection successful');
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
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log(`📝 Saving user: ${user.username} (${user.id})`);

            // Check if user exists
            const { data: existing, error: checkError } = await client
                .from(this.tables.users)
                .select('id, username')
                .eq('id', user.id)
                .maybeSingle();

            let result;
            if (existing) {
                // Update existing user
                console.log(`🔄 Updating existing user: ${user.username}`);
                const updateData = {
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
                };
                
                result = await client
                    .from(this.tables.users)
                    .update(updateData)
                    .eq('id', user.id);
            } else {
                // Insert new user
                console.log(`➕ Inserting new user: ${user.username}`);
                const insertData = {
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
                };
                
                result = await client
                    .from(this.tables.users)
                    .insert(insertData);
            }

            if (result.error) {
                console.error('Supabase error:', result.error);
                throw result.error;
            }
            
            console.log(`✅ User saved successfully: ${user.username}`);
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
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log('📋 Fetching all users...');

            const { data, error } = await client
                .from(this.tables.users)
                .select('*')
                .order('full_name');

            if (error) {
                console.error('Error fetching users:', error);
                return [];
            }
            
            if (!data || data.length === 0) {
                console.log('📭 No users found');
                return [];
            }

            console.log(`✅ Fetched ${data.length} users`);

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
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log(`🔍 Fetching user by ID: ${userId}`);

            const { data, error } = await client
                .from(this.tables.users)
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user:', error);
                return null;
            }
            
            if (!data) {
                console.log(`📭 User not found: ${userId}`);
                return null;
            }
            
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
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log(`🔍 Fetching user by username: ${username}`);

            const { data, error } = await client
                .from(this.tables.users)
                .select('*')
                .eq('username', username)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user by username:', error);
                return null;
            }
            
            if (!data) {
                console.log(`📭 User not found: ${username}`);
                return null;
            }
            
            console.log(`✅ Found user: ${username}`);
            
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
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log(`🗑️ Deleting user: ${userId}`);

            const { error } = await client
                .from(this.tables.users)
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('Error deleting user:', error);
                throw error;
            }
            
            console.log(`✅ User deleted: ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update user permissions
     */
    async updateUserPermissions(userId, permissions) {
        try {
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log(`🔑 Updating permissions for user: ${userId}`);

            const { error } = await client
                .from(this.tables.users)
                .update({ 
                    permissions: permissions,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                console.error('Error updating user permissions:', error);
                throw error;
            }
            
            console.log(`✅ Permissions updated for user: ${userId}`);
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
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await client
                .from(this.tables.users)
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

            if (error) {
                console.error('Error updating last login:', error);
                throw error;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error updating last login:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // NOTIFICATION FUNCTIONS
    // ============================================

    async saveNotification(notification) {
        try {
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            console.log(`📝 Saving notification: ${notification.title}`);

            const { error } = await client
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

            if (error) {
                console.error('Error saving notification:', error);
                throw error;
            }
            
            console.log(`✅ Notification saved: ${notification.title}`);
            return { success: true };
        } catch (error) {
            console.error('Error saving notification:', error);
            return { success: false, error: error.message };
        }
    },

    async getNotifications(userId) {
        try {
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await client
                .from(this.tables.notifications)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
                return [];
            }

            if (!data || data.length === 0) return [];

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

    async markNotificationRead(notificationId, userId) {
        try {
            if (!this.isInitialized) {
                this.init();
            }
            
            const client = this.supabaseAdmin || this.supabase;
            if (!client) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await client
                .from(this.tables.notifications)
                .select('read_by')
                .eq('id', notificationId)
                .single();

            if (error) {
                console.error('Error fetching notification:', error);
                throw error;
            }

            let readBy = data.read_by || '';
            const readList = readBy ? readBy.split(',') : [];
            if (!readList.includes(userId)) {
                readList.push(userId);
                readBy = readList.join(',');
            }

            const { error: updateError } = await client
                .from(this.tables.notifications)
                .update({ read_by: readBy })
                .eq('id', notificationId);

            if (updateError) {
                console.error('Error marking notification as read:', updateError);
                throw updateError;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================
// AUTO-INITIALIZE
// ============================================

// Try to initialize immediately
console.log('🚀 Initializing Supabase...');
SupabaseConfig.init();

// Also try again when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM ready, ensuring Supabase is initialized...');
        SupabaseConfig.init();
    });
}

// Make available globally
window.SupabaseConfig = SupabaseConfig;
