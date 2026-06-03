// Search List Module
let currentStudentsList = [];
let selectedStudents = new Set();

// Load all students
async function loadAllStudents() {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error(error);
        return;
    }
    
    const studentListDiv = document.getElementById('studentList');
    if (!data || data.length === 0) {
        studentListDiv.innerHTML = '<p class="text-gray-500 text-center py-8">មិនទាន់មានទិន្នន័យសិស្សទេ</p>';
        return;
    }
    
    studentListDiv.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">រូបថត</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ឈ្មោះ</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ភេទ</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ថ្នាក់</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ទូរស័ព្ទ</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">សកម្មភាព</th></tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${data.map(student => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">${student.photo ? `<img src="${student.photo}" class="w-10 h-10 rounded-full object-cover">` : '<div class="w-10 h-10 bg-gray-200 rounded-full"></div>'}</td>
                        <td class="px-6 py-4 text-sm font-mono">${student.studentID}</td>
                        <td class="px-6 py-4 text-sm font-medium">${student.name}</td>
                        <td class="px-6 py-4 text-sm">${student.sex}</td>
                        <td class="px-6 py-4 text-sm"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">${student.class || 'N/A'}</span></td>
                        <td class="px-6 py-4 text-sm">${student.phonenumber || 'N/A'}</td>
                        <td class="px-6 py-4 text-sm space-x-2">
                            <button onclick="viewStudent('${student.studentID}')" class="text-blue-600 hover:text-blue-800">👁️ មើល</button>
                            <button onclick="deleteStudent('${student.studentID}')" class="text-red-600 hover:text-red-800">🗑️ លុប</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// View student
window.viewStudent = async (studentID) => {
    window.location.href = `create.html?studentID=${studentID}`;
};

// Delete student
window.deleteStudent = async (studentID) => {
    if (confirm('តើអ្នកពិតជាចង់លុបសិស្សនេះមែនទេ?')) {
        const { error } = await supabase.from(TABLE_NAME).delete().eq('studentID', studentID);
        if (!error) {
            alert('✅ បានលុបដោយជោគជ័យ');
            loadAllStudents();
        } else {
            alert('❌ កំហុស: ' + error.message);
        }
    }
};

// Search by class
document.getElementById('searchByClassBtn')?.addEventListener('click', async () => {
    const className = document.getElementById('searchClass').value.trim();
    if (!className) {
        alert('សូមបញ្ចូលឈ្មោះថ្នាក់');
        return;
    }
    
    const { data, error } = await supabase.from(TABLE_NAME).select('*').ilike('class', `%${className}%`).order('name');
    if (error) { alert('❌ កំហុស: ' + error.message); return; }
    if (data.length === 0) { alert(`❌ រកមិនឃើញសិស្សក្នុងថ្នាក់ "${className}" ទេ`); return; }
    
    displaySearchResults(data);
    alert(`✅ រកឃើញសិស្ស ${data.length} នាក់ក្នុងថ្នាក់ "${className}"`);
});

// Show all students
document.getElementById('showAllStudentsBtn')?.addEventListener('click', async () => {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('name');
    if (error) { alert('❌ កំហុស: ' + error.message); return; }
    document.getElementById('searchClass').value = '';
    displaySearchResults(data);
});

// Display search results
function displaySearchResults(students) {
    currentStudentsList = students;
    const container = document.getElementById('searchResults');
    
    if (!students || students.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500">មិនមានទិន្នន័យសិស្សទេ</div>';
        return;
    }
    
    container.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">ជ្រើស</th><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">រូបថត</th><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ឈ្មោះ</th><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ភេទ</th><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ថ្នាក់</th><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ទូរស័ព្ទ</th></tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3"><input type="checkbox" class="student-checkbox w-4 h-4 text-blue-600 rounded" value="${student.studentID}"></td>
                        <td class="px-4 py-3">${student.photo ? `<img src="${student.photo}" class="w-8 h-8 rounded-full object-cover">` : '<div class="w-8 h-8 bg-gray-200 rounded-full"></div>'}</td>
                        <td class="px-4 py-3 text-sm font-mono">${student.studentID}</td>
                        <td class="px-4 py-3 text-sm font-medium">${student.name}</td>
                        <td class="px-4 py-3 text-sm">${student.sex}</td>
                        <td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">${student.class || 'N/A'}</span></td>
                        <td class="px-4 py-3 text-sm">${student.phonenumber || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.querySelectorAll('.student-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) selectedStudents.add(e.target.value);
            else selectedStudents.delete(e.target.value);
            updateSelectedCount();
        });
    });
}

function updateSelectedCount() {
    const count = selectedStudents.size;
    const addBtn = document.getElementById('addSelectedBtn');
    if (addBtn) addBtn.innerHTML = `➕ បន្ថែមសិស្សដែលបានជ្រើស (${count})`;
}

// Add selected students
document.getElementById('addSelectedBtn')?.addEventListener('click', () => {
    if (selectedStudents.size === 0) {
        alert('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់');
        return;
    }
    
    const selectedData = currentStudentsList.filter(s => selectedStudents.has(s.studentID));
    localStorage.setItem('selectedStudents', JSON.stringify(selectedData));
    alert(`✅ បានបន្ថែមសិស្ស ${selectedStudents.size} នាក់ហើយ! សូមចូលទៅកាន់ទំព័រ Generate Card`);
    window.location.href = 'generate.html';
});

// Initial load
loadAllStudents();
