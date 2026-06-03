// Create Card Module
let currentPhotoBase64 = null;

// Photo handling
document.getElementById('photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentPhotoBase64 = event.target.result;
            const preview = document.getElementById('photoPreview');
            const defaultIcon = document.getElementById('defaultPhotoIcon');
            preview.src = currentPhotoBase64;
            preview.classList.remove('hidden');
            defaultIcon.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
});

function resetPhotoPreview() {
    currentPhotoBase64 = null;
    const preview = document.getElementById('photoPreview');
    const defaultIcon = document.getElementById('defaultPhotoIcon');
    if (preview) preview.src = '';
    if (preview) preview.classList.add('hidden');
    if (defaultIcon) defaultIcon.classList.remove('hidden');
}

// Display card
function displayCard(data) {
    const cardContainer = document.getElementById('studentCard');
    if (cardContainer) cardContainer.innerHTML = generateCardHTML(data);
}

// Save or Update student
document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
        studentID: document.getElementById('studentID').value,
        name: document.getElementById('name').value,
        sex: document.getElementById('sex').value,
        date_of_birth: document.getElementById('date_of_birth').value || null,
        phonenumber: document.getElementById('phonenumber').value,
        address: document.getElementById('address').value,
        fathername: document.getElementById('fathername').value,
        fatherphone: document.getElementById('fatherphone').value,
        fatherjob: document.getElementById('fatherjob').value,
        mothername: document.getElementById('mothername').value,
        motherphone: document.getElementById('motherphone').value,
        motherjob: document.getElementById('motherjob').value,
        class: document.getElementById('class').value,
        photo: currentPhotoBase64 || null
    };
    
    // Check if student exists
    const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('studentID', studentData.studentID)
        .single();
    
    let result;
    if (existing) {
        result = await supabase
            .from(TABLE_NAME)
            .update(studentData)
            .eq('studentID', studentData.studentID);
        alert('✅ បានកែប្រែព័ត៌មានសិស្សដោយជោគជ័យ!');
    } else {
        result = await supabase
            .from(TABLE_NAME)
            .insert([studentData]);
        alert('✅ បានរក្សាទុកព័ត៌មានសិស្សដោយជោគជ័យ!');
    }
    
    if (!result.error) {
        displayCard(studentData);
        resetPhotoPreview();
    } else {
        alert('❌ កំហុស: ' + result.error.message);
    }
});

// Search student by ID
document.getElementById('fetchStudentBtn')?.addEventListener('click', async () => {
    const studentID = document.getElementById('searchStudentID').value;
    if (!studentID) {
        alert('សូមបញ្ចូល Student ID');
        return;
    }
    
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('studentID', studentID)
        .single();
    
    if (error) {
        alert('❌ រកមិនឃើញសិស្សទេ!');
        return;
    }
    
    // Fill form
    document.getElementById('studentID').value = data.studentID;
    document.getElementById('name').value = data.name;
    document.getElementById('sex').value = data.sex;
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
        preview.src = currentPhotoBase64;
        preview.classList.remove('hidden');
        defaultIcon.classList.add('hidden');
    } else {
        resetPhotoPreview();
    }
    
    displayCard(data);
});

// Print card
document.getElementById('printCard')?.addEventListener('click', () => {
    const cardContent = document.getElementById('studentCard').innerHTML;
    if (!cardContent || cardContent.includes('សូមបញ្ចូលព័ត៌មានសិស្ស')) {
        alert('មិនមានកាតដើម្បីបោះពុម្ពទេ');
        return;
    }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>បោះពុម្ពកាតសិស្ស</title><meta charset="UTF-8"><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;}</style></head><body>${cardContent}</body></html>`);
    printWindow.document.close();
    printWindow.print();
});

// Download card as image
document.getElementById('downloadCard')?.addEventListener('click', async () => {
    const cardElement = document.querySelector('#studentCard > div');
    if (!cardElement || cardElement.innerHTML.includes('សូមបញ្ចូលព័ត៌មានសិស្ស')) {
        alert('មិនមានកាតដើម្បីទាញយកទេ');
        return;
    }
    try {
        const canvas = await html2canvas(cardElement, { scale: 2, backgroundColor: null });
        const link = document.createElement('a');
        const studentID = document.getElementById('studentID').value || 'card';
        link.download = `student_card_${studentID}.png`;
        link.href = canvas.toDataURL();
        link.click();
    } catch (error) {
        alert('កើតមានបញ្ហាក្នុងការទាញយករូបភាព');
    }
});
