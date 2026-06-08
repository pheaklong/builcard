// ============ SUPABASE CONFIGURATION ============
const SUPABASE_URL = 'https://xmowdtwlidnwnxrkrysj.supabase.co/rest/v1/'; // ប្តូរនេះ
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA'; // ប្តូរនេះ

// Initialize Supabase client
const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Table name
const TABLE_NAME = 'table_student';

// Export functions
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
