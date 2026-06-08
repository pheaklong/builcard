// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Generate QR Code (student ID)
function generateQRCode(studentID) {
    return `
        <svg width="45" height="45" viewBox="0 0 100 100" fill="#233D2E">
            <rect x="10" y="10" width="8" height="8" fill="#233D2E"/>
            <rect x="26" y="10" width="8" height="8" fill="#233D2E"/>
            <rect x="42" y="10" width="8" height="8" fill="#233D2E"/>
            <rect x="58" y="10" width="8" height="8" fill="#233D2E"/>
            <rect x="74" y="10" width="8" height="8" fill="#233D2E"/>
            <rect x="10" y="26" width="8" height="8" fill="#233D2E"/>
            <rect x="42" y="26" width="8" height="8" fill="#233D2E"/>
            <rect x="74" y="26" width="8" height="8" fill="#233D2E"/>
            <rect x="10" y="42" width="8" height="8" fill="#233D2E"/>
            <rect x="26" y="42" width="8" height="8" fill="#233D2E"/>
            <rect x="42" y="42" width="8" height="8" fill="#233D2E"/>
            <rect x="58" y="42" width="8" height="8" fill="#233D2E"/>
            <rect x="74" y="42" width="8" height="8" fill="#233D2E"/>
            <rect x="26" y="58" width="8" height="8" fill="#233D2E"/>
            <rect x="42" y="58" width="8" height="8" fill="#233D2E"/>
            <rect x="74" y="58" width="8" height="8" fill="#233D2E"/>
            <rect x="10" y="74" width="8" height="8" fill="#233D2E"/>
            <rect x="42" y="74" width="8" height="8" fill="#233D2E"/>
            <rect x="58" y="74" width="8" height="8" fill="#233D2E"/>
            <rect x="74" y="74" width="8" height="8" fill="#233D2E"/>
        </svg>
    `;
}

// School Logo - using local image file
function getSchoolLogo() {
    return `
        <img src="../logomoeys.png" 
             alt="School Logo" 
             style="width: 35px; height: 35px; object-fit: contain;">
    `;
}

// Signature Image - using signature.png (moved 1cm to the right)
function getSignatureImage() {
    return `
        <img src="../Signature.png" 
             alt="នាយកវិទ្យាល័យ" 
             style="width: 100px; height: auto; max-height: 40px; object-fit: contain; margin-left: 38px;">
    `;
}

// Watermark Logo - using same logo image as watermark
function getWatermarkLogo() {
    return `
        <img src="../logomoeys.png" 
             alt="Watermark" 
             style="width: 100%; height: 100%; object-fit: contain; opacity: 0.12;">
    `;
}

// ============================================
// STAMP FUNCTIONS - stamp overlaps photo slightly
// ============================================

// Stamp Image - placed overlapping the photo (from right side)
function getStampImage() {
    return `
        <div style="position: absolute; top: 50%; right: -15px; transform: translateY(-50%); width: 50px; height: 50px; z-index: 10; display: flex; align-items: center; justify-content: center;">
            <img src="../tra.png" 
                 alt="ត្រា" 
                 style="width: 100%; height: 100%; object-fit: contain; opacity: 0.9;">
        </div>
    `;
}

// Student Photo with Stamp overlapping
function getPhotoHTML(photoData) {
    if (photoData && photoData !== 'null' && photoData !== '') {
        return `
            <div style="position: relative; width: 100%; height: 100%;">
                <img src="${photoData}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover;">
                ${getStampImage()}
            </div>
        `;
    }
    return `
        <div class="photo-placeholder-content" style="position: relative; width: 100%; height: 100%;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#aaa">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span style="font-size: 10px; margin-top: 5px;">រូបថត</span>
            ${getStampImage()}
        </div>
    `;
}

// ============================================
// MAIN CARD GENERATOR (6.5cm x 8.5cm)
// ============================================

function generateCardHTML(data) {
    const studentID = data.studentID || '_________';
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : '____/____/______';
    
    return `
        <div class="student-id-card">
            <!-- Background Watermark -->
            <div class="watermark-bg">
                ${getWatermarkLogo()}
            </div>
            
            <!-- Header: Logo + Royal Text -->
            <div class="card-header">
                <div class="logo-area">
                    ${getSchoolLogo()}
                </div>
                <div class="royal-text">
                    <div class="royal-line-1">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div class="royal-line-2">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                </div>
            </div>
            
            <!-- Ministry & School Section -->
            <div class="ministry-section">
                <div class="ministry-text">
                    <div>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                    <div>មន្ទីរក្រសួងអប់រំ យុវជន និងកីឡា</div>
                    <div class="school-name-card">វិទ្យាល័យកំរៀង</div>
                </div>
                <div class="qr-area">
                    ${generateQRCode(studentID)}
                </div>
            </div>
            
            <!-- Title Section -->
            <div class="title-section-card">
                <div class="card-title-text">បណ្ណសម្គាល់ខ្លួនសិស្ស</div>
                <div class="academic-year-card">ឆ្នាំសិក្សា ២០២៥-២០២៦</div>
            </div>
            
            <!-- Student Information Grid -->
            <div class="info-grid">
                <div class="info-row-grid">
                    <span class="info-label-grid">គោត្តនាម និងនាម</span>
                    <span class="info-value-grid">${escapeHtml(data.name) || '___________________'}</span>
                    <span class="info-label-grid">ភេទ</span>
                    <span class="info-value-grid">${escapeHtml(data.sex) || '_____'}</span>
                </div>
                <div class="info-row-grid">
                    <span class="info-label-grid">ថ្ងៃខែឆ្នាំកំណើត</span>
                    <span class="info-value-grid" colspan="3">${birthDate}</span>
                </div>
                <div class="info-row-grid">
                    <span class="info-label-grid">ទីកន្លែងកំណើត</span>
                    <span class="info-value-grid" colspan="3">${escapeHtml(data.address) || '_____________________________'}</span>
                </div>
                <div class="info-row-grid">
                    <span class="info-label-grid">លេខទូរស័ព្ទសាលា</span>
                    <span class="info-value-grid">${escapeHtml(data.phonenumber) || '_______________'}</span>
                    <span class="info-label-grid">ឈ្មោះឪពុក</span>
                    <span class="info-value-grid">${escapeHtml(data.fathername) || '_____________'}</span>
                </div>
                <div class="info-row-grid">
                    <span class="info-label-grid"></span>
                    <span class="info-value-grid"></span>
                    <span class="info-label-grid">ឈ្មោះម្តាយ</span>
                    <span class="info-value-grid">${escapeHtml(data.mothername) || '_____________'}</span>
                </div>
                <div class="info-row-grid">
                    <span class="info-label-grid">អត្តលេខ</span>
                    <span class="info-value-grid" colspan="3">${studentID}</span>
                </div>
            </div>
            
            <!-- Bottom Section: Photo + Date & Signature -->
            <div class="bottom-section-card">
                <div class="photo-section">
                    <div class="photo-frame-card">
                        ${getPhotoHTML(data.photo)}
                    </div>
                </div>
                <div class="info-section-card">
                    <div class="date-text">
                        ថ្ងៃសៅរ៍ ១១កើត ខែកត្តិក ឆ្នាំម្សាញ់ ព.ស ២៥៦៩
                    </div>
                    <div class="school-detail-text">
                        វិ.កំរៀង , ថ្ងៃទី១ ខែវិច្ឆិកា ឆ្នាំ២០២៥
                    </div>
                    <div class="principal-section">
                        <div class="principal-title">នាយកវិទ្យាល័យ</div>
                        <div class="signature-image">${getSignatureImage()}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SMALL CARD FOR BATCH GENERATE (100% SAME AS MAIN CARD)
// ============================================

function generateSmallCardHTML(student) {
    // Use EXACTLY the same function as generateCardHTML
    return generateCardHTML(student);
}
