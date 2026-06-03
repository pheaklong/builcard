// Generate Card Module
let selectedStudents = [];

// Load selected students from localStorage
function loadSelectedStudents() {
    const stored = localStorage.getItem('selectedStudents');
    if (stored) {
        selectedStudents = JSON.parse(stored);
        displaySelectedStudents();
    }
}

// Display selected students
function displaySelectedStudents() {
    const container = document.getElementById('selectedStudentsList');
    const countSpan = document.getElementById('selectedCount');
    
    if (!selectedStudents || selectedStudents.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500">មិនមានសិស្សដែលបានជ្រើសរើសទេ</div>';
        if (countSpan) countSpan.innerHTML = '(0 នាក់)';
        return;
    }
    
    if (countSpan) countSpan.innerHTML = `(${selectedStudents.length} នាក់)`;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${selectedStudents.map(student => `
                <div class="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                        ${student.photo ? `<img src="${student.photo}" class="w-10 h-10 rounded-full object-cover">` : '<div class="w-10 h-10 bg-gray-200 rounded-full"></div>'}
                        <div>
                            <p class="font-semibold">${student.name}</p>
                            <p class="text-sm text-gray-600">${student.studentID} | ${student.class || 'N/A'}</p>
                        </div>
                    </div>
                    <button onclick="removeStudent('${student.studentID}')" class="text-red-600 hover:text-red-800">✖</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Remove student from list
window.removeStudent = (studentID) => {
    selectedStudents = selectedStudents.filter(s => s.studentID !== studentID);
    localStorage.setItem('selectedStudents', JSON.stringify(selectedStudents));
    displaySelectedStudents();
    updateGenerateButton();
};

// Update generate button
function updateGenerateButton() {
    const generateBtn = document.getElementById('generateCardsBtn');
    if (generateBtn) {
        generateBtn.innerHTML = `🖨️ បង្កើតកាតសិស្ស (${selectedStudents.length})`;
        generateBtn.disabled = selectedStudents.length === 0;
    }
}

// Clear all
document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    if (confirm('តើអ្នកចង់លុបសិស្សទាំងអស់មែនទេ?')) {
        selectedStudents = [];
        localStorage.setItem('selectedStudents', JSON.stringify(selectedStudents));
        displaySelectedStudents();
        updateGenerateButton();
    }
});

// Generate all cards
document.getElementById('generateCardsBtn')?.addEventListener('click', () => {
    if (selectedStudents.length === 0) {
        alert('មិនមានសិស្សដើម្បីបង្កើតកាតទេ');
        return;
    }
    
    const cardsHTML = selectedStudents.map(student => generateSmallCardHTML(student)).join('');
    const modal = document.getElementById('cardsModal');
    const container = document.getElementById('cardsContainer');
    container.innerHTML = cardsHTML;
    modal.classList.remove('hidden');
});

// Print all cards
document.getElementById('printAllCards')?.addEventListener('click', () => {
    const cardsHTML = document.getElementById('cardsContainer').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>បោះពុម្ពកាតសិស្ស</title><meta charset="UTF-8">
        <style>body{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;padding:20px;}@media print{body{padding:0;gap:10px;}div{break-inside:avoid;page-break-inside:avoid;}}</style>
        </head><body>${cardsHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
});

// Close modal
document.getElementById('closeModalBtn')?.addEventListener('click', () => {
    document.getElementById('cardsModal').classList.add('hidden');
});

document.getElementById('cardsModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('cardsModal')) {
        document.getElementById('cardsModal').classList.add('hidden');
    }
});

// Load on page load
loadSelectedStudents();
updateGenerateButton();
