// ============ SUPABASE CONFIGURATION ============
// សូមប្តូរតម្លៃខាងក្រោមតាមគណនី Supabase របស់អ្នក!!!
const SUPABASE_URL = 'https://xmowdtwldnwnxrkrrysj.supabase.co';  // ឬ URL Project ទីពីរ
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb2R0d2xpZG53bnhya3JyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQyNzAsImV4cCI6MjA4MjU3MDI3MH0.8GmfjB2g5Kc5yK5c5yK5c5yK5c5yK5c5yK5c5yK5c5';  // Key ដែលត្រូវគ្នាះ

// Initialize Supabase client
const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'table_student'; // កំណត់ TABLE_NAME នៅទីនេះ!!!

// Global variables
let currentPhotoBase64 = null;

// ============ PHOTO HANDLING ============
document.getElementById('photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentPhotoBase64 = event.target.result;
            const preview = document.getElementById('photoPreview');
            const defaultIcon = document.getElementById('defaultPhotoIcon');
            if (preview) {
                preview.src = currentPhotoBase64;
                preview.classList.remove('hidden');
            }
            if (defaultIcon) {
                defaultIcon.classList.add('hidden');
            }
        };
        reader.readAsDataURL(file);
    } else {
        resetPhotoPreview();
    }
});

function resetPhotoPreview() {
    currentPhotoBase64 = null;
    const preview = document.getElementById('photoPreview');
    const defaultIcon = document.getElementById('defaultPhotoIcon');
    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }
    if (defaultIcon) {
        defaultIcon.classList.remove('hidden');
    }
}

// ============ CARD GENERATION FUNCTIONS ============
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
                        <p class="font-bold text-lg">${escapeHtml(data.studentID) || 'N/A'}</p>
                    </div>
                    ${photoHTML}
                </div>
                
                <div class="space-y-2 text-sm">
                    <div><p class="opacity-90">ឈ្មោះ៖</p><p class="font-semibold text-base">${escapeHtml(data.name) || 'N/A'}</p></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><p class="opacity-90">ភេទ៖</p><p>${escapeHtml(data.sex) || 'N/A'}</p></div>
                        <div><p class="opacity-90">ថ្ងៃខែកំណើត៖</p><p>${birthDate}</p></div>
                    </div>
                    <div><p class="opacity-90">ថ្នាក់៖</p><p class="font-medium">${escapeHtml(data.class) || 'N/A'}</p></div>
                    <div><p class="opacity-90">ទូរស័ព្ទ៖</p><p>${escapeHtml(data.phonenumber) || 'N/A'}</p></div>
                    <div><p class="opacity-90">អាសយដ្ឋាន៖</p><p class="text-xs">${escapeHtml(data.address) || 'N/A'}</p></div>
                </div>
                
                <hr class="my-3 border-white/30">
                
                <div class="text-xs space-y-1">
                    <p><span class="opacity-90">ឪពុក៖</span> ${escapeHtml(data.fathername) || 'N/A'} (${escapeHtml(data.fatherjob) || ''})</p>
                    <p><span class="opacity-90">ទូរស័ព្ទ៖</span> ${escapeHtml(data.fatherphone) || 'N/A'}</p>
                    <p><span class="opacity-90">ម្តាយ៖</span> ${escapeHtml(data.mothername) || 'N/A'} (${escapeHtml(data.motherjob) || ''})</p>
                    <p><span class="opacity-90">ទូរស័ព្ទ៖</span> ${escapeHtml(data.motherphone) || 'N/A'}</p>
                </div>
            </div>
            
            <div class="bg-yellow-400 p-2 text-center text-xs font-bold text-blue-900">
                ចេញថ្ងៃទី: ${new Date().toLocaleDateString('km-KH')}
            </div>
        </div>
    `;
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function displayCard(data) {
    const cardContainer = document.getElementById('studentCard');
    if (cardContainer) {
        cardContainer.innerHTML = generateCardHTML(data);
    }
}

// ============ SAVE STUDENT ============
async function saveStudent() {
    try {
        // Get form values
        const studentData = {
            studentID: document.getElementById('studentID').value.trim(),
            name: document.getElementById('name').value.trim(),
            sex: document.getElementById('sex').value,
            date_of_birth: document.getElementById('date_of_birth').value || null,
            phonenumber: document.getElementById('phonenumber').value.trim(),
            address: document.getElementById('address').value.trim(),
            fathername: document.getElementById('fathername').value.trim(),
            fatherphone: document.getElementById('fatherphone').value.trim(),
            fatherjob: document.getElementById('fatherjob').value.trim(),
            mothername: document.getElementById('mothername').value.trim(),
            motherphone: document.getElementById('motherphone').value.trim(),
            motherjob: document.getElementById('motherjob').value.trim(),
            class: document.getElementById('class').value.trim(),
            photo: currentPhotoBase64 || null
        };
        
        // Validate required fields
        if (!studentData.studentID) {
            alert('សូមបញ្ចូល Student ID');
            return false;
        }
        if (!studentData.name) {
            alert('សូមបញ្ចូលឈ្មោះសិស្ស');
            return false;
        }
        
        console.log('Saving student:', studentData);
        
        // Check if student exists
        const { data: existing, error: findError } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('studentID', studentData.studentID)
            .maybeSingle();
        
        if (findError && findError.code !== 'PGRST116') {
            console.error('Find error:', findError);
            alert('❌ កំហុសក្នុងការស្វែងរក: ' + findError.message);
            return false;
        }
        
        let result;
        if (existing) {
            // Update
            result = await supabase
                .from(TABLE_NAME)
                .update(studentData)
                .eq('studentID', studentData.studentID);
            
            if (!result.error) {
                alert('✅ បានកែប្រែព័ត៌មានសិស្សដោយជោគជ័យ!');
                displayCard(studentData);
                return true;
            } else {
                alert('❌ កំហុសក្នុងការកែប្រែ: ' + result.error.message);
                return false;
            }
        } else {
            // Insert
            result = await supabase
                .from(TABLE_NAME)
                .insert([studentData]);
            
            if (!result.error) {
                alert('✅ បានរក្សាទុកព័ត៌មានសិស្សដោយជោគជ័យ!');
                displayCard(studentData);
                return true;
            } else {
                alert('❌ កំហុសក្នុងការរក្សាទុក: ' + result.error.message);
                return false;
            }
        }
        
    } catch (error) {
        console.error('Save error:', error);
        alert('❌ កំហុសប្រព័ន្ធ: ' + error.message);
        return false;
    }
}

// ============ SEARCH STUDENT ============
async function searchStudent() {
    const studentID = document.getElementById('searchStudentID').value.trim();
    if (!studentID) {
        alert('សូមបញ្ចូល Student ID');
        return;
    }
    
    try {
        console.log('Searching for student:', studentID);
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('studentID', studentID)
            .maybeSingle();
        
        if (error) {
            alert('❌ កំហុស: ' + error.message);
            return;
        }
        
        if (!data) {
            alert('❌ រកមិនឃើញសិស្សទេ!');
            return;
        }
        
        console.log('Found student:', data);
        
        // Fill form
        document.getElementById('studentID').value = data.studentID || '';
        document.getElementById('name').value = data.name || '';
        document.getElementById('sex').value = data.sex || 'ប្រុស';
        document.getElementById('date_of_birth').value = data.date_of_birth || '';
        document.getElementById('phonenumber').value = data.phonenumber || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('fathername').value = data.fathername || '';
        document.getElementById('fatherphone').value = data.fatherphone || '';
        document.getElementById('fatherjob').value = data.fatherjob || '';
        document.getElementById('mothername').value = data.mothername || '';
        document.getElementById('motherphone').value = data.motherphone || '';
        document.getElementById('motherjob').value = data.motherjob || '';
        document.getElementById('class').value = data.class || '';
        
        if (data.photo && data.photo !== 'null') {
            currentPhotoBase64 = data.photo;
            const preview = document.getElementById('photoPreview');
            const defaultIcon = document.getElementById('defaultPhotoIcon');
            if (preview) {
                preview.src = currentPhotoBase64;
                preview.classList.remove('hidden');
            }
            if (defaultIcon) {
                defaultIcon.classList.add('hidden');
            }
        } else {
            resetPhotoPreview();
        }
        
        displayCard(data);
        
    } catch (error) {
        console.error('Search error:', error);
        alert('❌ កំហុស: ' + error.message);
    }
}

// ============ PRINT CARD ============
function printCard() {
    const cardContent = document.getElementById('studentCard').innerHTML;
    if (!cardContent || cardContent.includes('បំពេញព័ត៌មានសិស្ស')) {
        alert('មិនមានកាតដើម្បីបោះពុម្ពទេ');
        return;
    }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>បោះពុម្ពកាតសិស្ស</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: white;
                    }
                </style>
            </head>
            <body>${cardContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ============ DOWNLOAD CARD ============
async function downloadCard() {
    const cardElement = document.querySelector('#studentCard > div');
    if (!cardElement || (cardElement.innerHTML && cardElement.innerHTML.includes('បំពេញព័ត៌មានសិស្ស'))) {
        alert('មិនមានកាតដើម្បីទាញយកទេ');
        return;
    }
    try {
        const canvas = await html2canvas(cardElement, { 
            scale: 2, 
            backgroundColor: null,
            logging: false
        });
        const link = document.createElement('a');
        const studentID = document.getElementById('studentID').value || 'card';
        link.download = `student_card_${studentID}.png`;
        link.href = canvas.toDataURL();
        link.click();
        alert('✅ បានទាញយករូបភាពដោយជោគជ័យ!');
    } catch (error) {
        console.error('Download error:', error);
        alert('កើតមានបញ្ហាក្នុងការទាញយករូបភាព: ' + error.message);
    }
}

// ============ EVENT LISTENERS ============
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up event listeners...');
    console.log('TABLE_NAME:', TABLE_NAME);
    console.log('Supabase URL:', SUPABASE_URL);
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveStudent();
        });
    }
    
    // Form submit
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveStudent();
        });
    }
    
    // Search button
    const fetchBtn = document.getElementById('fetchStudentBtn');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchStudent();
        });
    }
    
    // Print button
    const printBtn = document.getElementById('printCard');
    if (printBtn) {
        printBtn.addEventListener('click', (e) => {
            e.preventDefault();
            printCard();
        });
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadCard');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadCard();
        });
    }
});

// ============ TEST CONNECTION ============
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error, count } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.warn('Connection test warning:', error);
            console.warn('Please check your SUPABASE_URL and SUPABASE_ANON_KEY');
        } else {
            console.log('✅ Supabase connected successfully!');
            console.log('Table:', TABLE_NAME);
        }
    } catch (error) {
        console.error('Connection test failed:', error);
    }
}

// Run connection test
testConnection();
