// ============================================
// CARD TEMPLATE - កែប្រែទម្រង់កាតតែត្រង់នេះ!!!
// ============================================

// អនុគមន៍សម្រាប់បង្ហាញរូបថត
function getPhotoHTML(photoData) {
    if (photoData && photoData !== 'null' && photoData !== '') {
        return `<img src="${photoData}" alt="Student Photo" class="w-20 h-20 rounded-full object-cover border-2 border-amber-600 shadow-md">`;
    }
    return `<div class="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 border-2 border-amber-600">
                <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
            </div>`;
}

// អនុគមន៍សម្រាប់ការពារ XSS (កុំកែប្រែ)
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// ទម្រង់កាតធំ (សម្រាប់ create.html)
// ============================================
function generateCardHTML(data) {
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
    const photoHTML = getPhotoHTML(data.photo);
    
    return `
        <div class="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg shadow-xl overflow-hidden border-4 border-amber-700" style="width: 380px;">
            <!-- Header ក្រសួងអប់រំ -->
            <div class="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-3 text-center border-b-4 border-amber-600">
                <div class="flex justify-center mb-1">
                    <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span class="text-amber-800 text-xl font-bold">🇰🇭</span>
                    </div>
                </div>
                <p class="text-xs leading-tight">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p class="text-xs leading-tight">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <p class="text-[10px] mt-1 opacity-90">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            </div>
            
            <!-- Main Content -->
            <div class="p-4">
                <!-- ឈ្មោះសាលា -->
                <div class="text-center border-b-2 border-amber-600 pb-2 mb-3">
                    <h3 class="text-md font-bold text-amber-900">វិទ្យាល័យ កែវរៀវ</h3>
                    <p class="text-[10px] text-gray-600">បណ្តាញសហប្រតិបត្តិការខ្មែរ</p>
                </div>
                
                <!-- Title Card -->
                <div class="text-center mb-3">
                    <div class="inline-block border border-amber-600 px-4 py-1 rounded-full">
                        <span class="text-sm font-bold text-amber-800">បណ្ណសម្គាល់សិស្ស</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">ឆ្នាំសិក្សា ២០២៥-២០២៦</p>
                </div>
                
                <!-- រូបថត និងឈ្មោះ -->
                <div class="flex space-x-4 mb-4">
                    <div class="flex-shrink-0">${photoHTML}</div>
                    <div class="flex-1 space-y-1">
                        <div class="border-b border-amber-300 pb-1">
                            <p class="text-[10px] text-gray-500">គោត្តនាម នាម</p>
                            <p class="text-sm font-bold text-amber-900">${escapeHtml(data.name) || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-500">ភេទ</p>
                            <p class="text-sm">${escapeHtml(data.sex) || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <!-- ID Card -->
                <div class="bg-amber-100 rounded p-2 mb-3 text-center border border-amber-300">
                    <p class="text-[10px] text-gray-600">អត្តលេខសម្គាល់</p>
                    <p class="text-lg font-bold text-amber-900 tracking-wider">${escapeHtml(data.studentID) || 'N/A'}</p>
                </div>
                
                <!-- ព័ត៌មានលម្អិត -->
                <div class="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div class="border border-amber-200 rounded p-2">
                        <p class="text-[9px] text-gray-500">ថ្ងៃខែឆ្នាំកំណើត</p>
                        <p class="text-sm font-medium">${birthDate}</p>
                    </div>
                    <div class="border border-amber-200 rounded p-2">
                        <p class="text-[9px] text-gray-500">ថ្នាក់</p>
                        <p class="text-sm font-medium text-amber-800">${escapeHtml(data.class) || 'N/A'}</p>
                    </div>
                    <div class="border border-amber-200 rounded p-2">
                        <p class="text-[9px] text-gray-500">ទីកន្លែងកំណើត</p>
                        <p class="text-xs">${escapeHtml(data.address) || 'N/A'}</p>
                    </div>
                    <div class="border border-amber-200 rounded p-2">
                        <p class="text-[9px] text-gray-500">លេខទំនាក់ទំនង</p>
                        <p class="text-xs">${escapeHtml(data.phonenumber) || 'N/A'}</p>
                    </div>
                </div>
                
                <!-- ព័ត៌មានមាតាបិតា -->
                <div class="bg-amber-50 rounded p-2 mb-3 border border-amber-200">
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p class="text-[9px] text-gray-500">ព្រះបិតា (ឪពុក)</p>
                            <p class="text-sm font-medium">${escapeHtml(data.fathername) || 'N/A'}</p>
                            <p class="text-[10px] text-gray-500">${escapeHtml(data.fatherphone) || ''}</p>
                            <p class="text-[10px] text-gray-500">${escapeHtml(data.fatherjob) || ''}</p>
                        </div>
                        <div>
                            <p class="text-[9px] text-gray-500">ព្រះមាតា (ម្តាយ)</p>
                            <p class="text-sm font-medium">${escapeHtml(data.mothername) || 'N/A'}</p>
                            <p class="text-[10px] text-gray-500">${escapeHtml(data.motherphone) || ''}</p>
                            <p class="text-[10px] text-gray-500">${escapeHtml(data.motherjob) || ''}</p>
                        </div>
                    </div>
                </div>
                
                <!-- លេខទំនាក់ទំនងសាលា -->
                <div class="text-center text-[9px] text-gray-500 mb-2">
                    <p>លេខទំនាក់ទំនងសាលា: 095 858 545</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-amber-800 text-amber-100 p-2 text-center text-[9px]">
                <div class="flex justify-between items-center px-2">
                    <span>ចេញថ្ងៃទី: ${new Date().toLocaleDateString('km-KH')}</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// ទម្រង់កាតតូច (សម្រាប់ generate.html)
// ============================================
function generateSmallCardHTML(student) {
    const birthDate = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
    const photoHTML = getPhotoHTML(student.photo);
    
    return `
        <div class="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg shadow-lg overflow-hidden border-2 border-amber-700" style="width: 350px;">
            <div class="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-2 text-center">
                <p class="text-[10px] leading-tight">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p class="text-[10px] leading-tight">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <p class="text-[8px] opacity-90">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            </div>
            
            <div class="p-3">
                <div class="text-center border-b border-amber-600 pb-1 mb-2">
                    <h3 class="text-xs font-bold text-amber-900">វិទ្យាល័យ កែវរៀវ</h3>
                </div>
                
                <div class="flex space-x-3 mb-3">
                    <div class="flex-shrink-0">${photoHTML}</div>
                    <div class="flex-1">
                        <p class="text-[9px] text-gray-500">គោត្តនាម នាម</p>
                        <p class="text-sm font-bold text-amber-900">${escapeHtml(student.name) || 'N/A'}</p>
                        <p class="text-[9px] text-gray-500 mt-1">អត្តលេខ: ${escapeHtml(student.studentID) || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div><span class="text-gray-500">ភេទ:</span> ${escapeHtml(student.sex) || 'N/A'}</div>
                    <div><span class="text-gray-500">ថ្នាក់:</span> ${escapeHtml(student.class) || 'N/A'}</div>
                    <div colspan="2"><span class="text-gray-500">កើតថ្ងៃ:</span> ${birthDate}</div>
                </div>
                
                <div class="bg-amber-100 rounded p-1 text-center text-[9px]">
                    <span>ឪពុក: ${escapeHtml(student.fathername) || 'N/A'}</span> | 
                    <span>ម្តាយ: ${escapeHtml(student.mothername) || 'N/A'}</span>
                </div>
            </div>
            
            <div class="bg-amber-800 text-amber-100 p-1 text-center text-[8px]">
                ចេញថ្ងៃទី: ${new Date().toLocaleDateString('km-KH')}
            </div>
        </div>
    `;
}
