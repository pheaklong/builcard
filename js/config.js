// ============ SUPABASE CONFIGURATION ============
(function() {
    'use strict';
    
    // ពិនិត្យមើលថា window.supabase មានឬនៅ
    if (typeof window.supabase === 'undefined') {
        console.error('❌ window.supabase is undefined. Make sure Supabase library is loaded first!');
        if (typeof window.SupabaseConfig === 'undefined') {
            window.SupabaseConfig = {
                error: 'Supabase library not loaded',
                isLoaded: false
            };
        }
        return;
    }
    
    // ====== ប្រើព័ត៌មានថ្មី ======
    const SUPABASE_URL = 'https://xmowdtwlidnwnxrkrysj.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA';

    console.log('🔧 Creating Supabase client...');
    console.log('📡 URL:', SUPABASE_URL);
    console.log('🔑 ANON KEY (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    console.log('📅 IAT:', new Date(1780432600 * 1000).toLocaleString());
    console.log('📅 EXP:', new Date(2096008600 * 1000).toLocaleString());
    
    // Initialize Supabase client
    let supabaseClient;
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created successfully!');
    } catch (error) {
        console.error('❌ Failed to create Supabase client:', error);
        if (typeof window.SupabaseConfig === 'undefined') {
            window.SupabaseConfig = {
                error: error.message,
                isLoaded: false
            };
        }
        return;
    }

    // Table names
    const TABLE_NAME = 'table_student';
    const ATTENDANCE_TABLE = 'attendance';

    // ============ ATTENDANCE FUNCTIONS ============

    // មុខងារសម្រាប់ទាញយកថ្នាក់ទាំងអស់
    async function fetchAllClasses() {
        try {
            console.log('🔍 Fetching all classes...');
            const { data, error } = await supabaseClient
                .from(TABLE_NAME)
                .select('class')
                .order('class');
            
            if (error) {
                console.error('❌ Error from Supabase:', error);
                throw error;
            }
            
            // យកតែថ្នាក់ដែលមានតែមួយ (unique)
            const uniqueClasses = [...new Set(data.map(item => item.class).filter(c => c && c.trim() !== ''))];
            console.log('✅ Classes found:', uniqueClasses);
            return uniqueClasses.sort();
        } catch (error) {
            console.error('❌ Error fetching classes:', error);
            return [];
        }
    }

    // មុខងារសម្រាប់ទាញយកសិស្សតាមថ្នាក់
    async function fetchStudentsByClass(className) {
        try {
            console.log('🔍 Fetching students for class:', className);
            const { data, error } = await supabaseClient
                .from(TABLE_NAME)
                .select('id, studentID, name, sex, date_of_birth, class, photo, phonenumber, address, fathername, fatherphone, fatherjob, mothername, motherphone, motherjob')
                .eq('class', className)
                .order('name');
            
            if (error) {
                console.error('❌ Error from Supabase:', error);
                throw error;
            }
            console.log('✅ Students found:', data ? data.length : 0);
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            return [];
        }
    }

    // មុខងារសម្រាប់ទាញយកវត្តមាន
    async function fetchAttendance(classVal, semesterVal, dateVal) {
        try {
            const { data, error } = await supabaseClient
                .from(ATTENDANCE_TABLE)
                .select('*')
                .eq('class', classVal)
                .eq('semester', semesterVal)
                .eq('date', dateVal);
            
            if (error) {
                console.warn('⚠️ Attendance table not found or error:', error);
                return null;
            }
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching attendance:', error);
            return null;
        }
    }

    // មុខងារសម្រាប់រក្សាទុកវត្តមាន
    async function saveAttendanceToSupabase(attendanceRecords) {
        if (!attendanceRecords || attendanceRecords.length === 0) {
            return null;
        }

        try {
            // លុបកំណត់ត្រាចាស់ចេញ
            const { error: deleteError } = await supabaseClient
                .from(ATTENDANCE_TABLE)
                .delete()
                .eq('class', attendanceRecords[0]?.class)
                .eq('semester', attendanceRecords[0]?.semester)
                .eq('date', attendanceRecords[0]?.date);
            
            if (deleteError) {
                console.warn('⚠️ Error deleting old records:', deleteError);
            }
            
            // បញ្ចូលកំណត់ត្រាថ្មី
            const { data, error } = await supabaseClient
                .from(ATTENDANCE_TABLE)
                .insert(attendanceRecords);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error saving attendance to Supabase:', error);
            // Fallback to localStorage
            try {
                localStorage.setItem('attendanceData_backup', JSON.stringify(attendanceRecords));
                console.log('💾 Saved to localStorage as backup');
            } catch (e) {
                console.error('❌ Error saving to localStorage:', e);
            }
            return null;
        }
    }

    // មុខងារសម្រាប់ពិនិត្យការតភ្ជាប់
    async function checkConnection() {
        try {
            console.log('🔍 Checking connection to Supabase...');
            const { data, error } = await supabaseClient
                .from(TABLE_NAME)
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('❌ Connection check failed:', error);
                return false;
            }
            console.log('✅ Connection successful!');
            return true;
        } catch (error) {
            console.error('❌ Connection check failed:', error);
            return false;
        }
    }

    // ============ CARD FUNCTIONS ============

    function getPhotoHTML(photoData) {
        if (photoData && photoData !== 'null' && photoData !== '') {
            return `<img src="${photoData}" alt="Student Photo" class="w-16 h-16 rounded-full object-cover border-2 border-yellow-400">`;
        }
        return `<div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                    <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                </div>`;
    }

    function generateCardHTML(data) {
        const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
        const photoHTML = getPhotoHTML(data.photo);
        
        return `
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-2xl overflow-hidden" style="width: 380px; font-family: 'Khmer', Arial, sans-serif;">
                <div class="bg-white p-4 text-center border-b-4 border-yellow-400">
                    <h3 class="text-xl font-bold text-blue-800">កាតសម្គាល់សិស្ស</h3>
                    <p class="text-sm text-gray-600">សាលារៀន​ ឌីជីថល</p>
                </div>
                
                <div class="p-4 text-white">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <p class="text-sm opacity-90">លេខសម្គាល់៖</p>
                            <p class="font-bold text-lg">${data.studentID || 'N/A'}</p>
                        </div>
                        ${photoHTML}
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        <div><p class="opacity-90">ឈ្មោះ៖</p><p class="font-semibold text-base">${data.name || 'N/A'}</p></div>
                        <div class="grid grid-cols-2 gap-2">
                            <div><p class="opacity-90">ភេទ៖</p><p>${data.sex || 'N/A'}</p></div>
                            <div><p class="opacity-90">ថ្ងៃខែកំណើត៖</p><p>${birthDate}</p></div>
                        </div>
                        <div><p class="opacity-90">ថ្នាក់៖</p><p class="font-medium">${data.class || 'N/A'}</p></div>
                        <div><p class="opacity-90">ទូរស័ព្ទ៖</p><p>${data.phonenumber || 'N/A'}</p></div>
                        <div><p class="opacity-90">អាសយដ្ឋាន៖</p><p class="text-xs">${data.address || 'N/A'}</p></div>
                    </div>
                    
                    <hr class="my-3 border-white/30">
                    
                    <div class="text-xs space-y-1">
                        <p><span class="opacity-90">ឪពុក៖</span> ${data.fathername || 'N/A'} (${data.fatherjob || ''})</p>
                        <p><span class="opacity-90">ទូរស័ព្ទ៖</span> ${data.fatherphone || 'N/A'}</p>
                        <p><span class="opacity-90">ម្តាយ៖</span> ${data.mothername || 'N/A'} (${data.motherjob || ''})</p>
                        <p><span class="opacity-90">ទូរស័ព្ទ៖</span> ${data.motherphone || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="bg-yellow-400 p-2 text-center text-xs font-bold text-blue-900">
                    ចេញថ្ងៃទី: ${new Date().toLocaleDateString('km-KH')}
                </div>
            </div>
        `;
    }

    function generateSmallCardHTML(student) {
        const birthDate = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
        const photoHTML = getPhotoHTML(student.photo);
        
        return `
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow" style="font-family: 'Khmer', Arial, sans-serif;">
                <div class="bg-white p-3 text-center border-b-2 border-yellow-400">
                    <h3 class="text-md font-bold text-blue-800">កាតសម្គាល់សិស្ស</h3>
                    <p class="text-xs text-gray-600">សាលារៀន​ ឌីជីថល</p>
                </div>
                <div class="p-3 text-white">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <p class="text-xs opacity-90">លេខសម្គាល់៖</p>
                            <p class="font-bold text-sm">${student.studentID || 'N/A'}</p>
                        </div>
                        ${photoHTML}
                    </div>
                    <div class="space-y-1 text-xs">
                        <div><p class="opacity-90">ឈ្មោះ៖</p><p class="font-semibold">${student.name || 'N/A'}</p></div>
                        <div class="grid grid-cols-2 gap-1">
                            <div><p class="opacity-90">ភេទ៖</p><p>${student.sex || 'N/A'}</p></div>
                            <div><p class="opacity-90">ថ្ងៃកំណើត៖</p><p>${birthDate}</p></div>
                        </div>
                        <div><p class="opacity-90">ថ្នាក់៖</p><p class="font-medium">${student.class || 'N/A'}</p></div>
                        <div><p class="opacity-90">ទូរស័ព្ទ៖</p><p>${student.phonenumber || 'N/A'}</p></div>
                    </div>
                    <hr class="my-2 border-white/30">
                    <div class="text-xs space-y-0.5">
                        <p><span class="opacity-90">ឪពុក៖</span> ${student.fathername || 'N/A'}</p>
                        <p><span class="opacity-90">ម្តាយ៖</span> ${student.mothername || 'N/A'}</p>
                    </div>
                </div>
                <div class="bg-yellow-400 p-1.5 text-center text-[10px] font-bold text-blue-900">
                    ចេញថ្ងៃទី: ${new Date().toLocaleDateString('km-KH')}
                </div>
            </div>
        `;
    }

    // ============ EXPORT ============
    if (typeof window.SupabaseConfig === 'undefined') {
        window.SupabaseConfig = {
            supabase: supabaseClient,
            TABLE_NAME: TABLE_NAME,
            ATTENDANCE_TABLE: ATTENDANCE_TABLE,
            fetchAllClasses: fetchAllClasses,
            fetchStudentsByClass: fetchStudentsByClass,
            fetchAttendance: fetchAttendance,
            saveAttendanceToSupabase: saveAttendanceToSupabase,
            checkConnection: checkConnection,
            getPhotoHTML: getPhotoHTML,
            generateCardHTML: generateCardHTML,
            generateSmallCardHTML: generateSmallCardHTML,
            isLoaded: true
        };
    }

    console.log('✅ Supabase Config loaded successfully!');
    console.log('📡 URL:', SUPABASE_URL);
    console.log('📊 Table:', TABLE_NAME);
    console.log('📋 Attendance Table:', ATTENDANCE_TABLE);
})();
