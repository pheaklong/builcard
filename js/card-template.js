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

// School Logo
function getSchoolLogo() {
    return `
        <svg width="35" height="35" viewBox="0 0 100 100" fill="#233D2E">
            <circle cx="50" cy="50" r="45" stroke="#233D2E" stroke-width="2" fill="none"/>
            <path d="M50 15 L70 35 L70 65 L50 85 L30 65 L30 35 Z" stroke="#233D2E" stroke-width="2" fill="none"/>
            <text x="50" y="55" text-anchor="middle" font-size="20" fill="#233D2E" font-weight="bold">សា</text>
        </svg>
    `;
}

// Signature Image Placeholder
function getSignatureImage() {
    return `
        <svg width="80" height="30" viewBox="0 0 200 50" fill="#1a56db">
            <path d="M10 25 Q30 15 50 25 Q70 35 90 25 Q110 15 130 25 Q150 35 170 25" stroke="#1a56db" stroke-width="2" fill="none"/>
            <path d="M20 30 Q40 20 60 30 Q80 40 100 30 Q120 20 140 30 Q160 40 180 30" stroke="#1a56db" stroke-width="1.5" fill="none"/>
            <text x="185" y="28" font-size="12" fill="#1a56db" font-style="italic">សុខ</text>
        </svg>
    `;
}

// Watermark Logo
function getWatermarkLogo() {
    return `
        <svg viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="3" fill="none"/>
            <path d="M100 30 L140 70 L140 130 L100 170 L60 130 L60 70 Z" stroke="currentColor" stroke-width="3" fill="none"/>
            <circle cx="100" cy="100" r="30" stroke="currentColor" stroke-width="2" fill="none"/>
            <text x="100" y="108" text-anchor="middle" font-size="28" fill="currentColor" font-weight="bold">ក</text>
        </svg>
    `;
}

// Student Photo
function getPhotoHTML(photoData) {
    if (photoData && photoData !== 'null' && photoData !== '') {
        return `<img src="${photoData}" alt="Student Photo" class="student-photo-img">`;
    }
    return `
        <div class="photo-placeholder-content">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#aaa">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>រូបថត</span>
        </div>
    `;
}

// ============================================
// MAIN CARD GENERATOR (6.5cm x 8.5cm)
// ============================================

function generateCardHTML(data) {
    const studentID = data.studentID || '_________';
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : '____/____/______';
    const currentYear = new Date().getFullYear();
    
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
// SMALL CARD FOR BATCH GENERATE
// ============================================

function generateSmallCardHTML(student) {
    const studentID = student.studentID || 'N/A';
    const photoHTML = getPhotoHTML(student.photo);
    
    return `
        <div class="student-id-card-small">
            <div class="small-card-inner">
                <div class="small-header-card">
                    <div class="small-logo-card">${getSchoolLogo()}</div>
                    <div class="small-title-card">បណ្ណសម្គាល់ខ្លួនសិស្ស</div>
                    <div class="small-qr-card">${generateQRCode(studentID)}</div>
                </div>
                <div class="small-body-card">
                    <div class="small-photo-card">${photoHTML}</div>
                    <div class="small-info-card">
                        <div><strong>${escapeHtml(student.name)}</strong></div>
                        <div>ID: ${studentID}</div>
                        <div>ភេទ: ${escapeHtml(student.sex)}</div>
                        <div>ថ្នាក់: ${escapeHtml(student.class)}</div>
                    </div>
                </div>
                <div class="small-footer-card">
                    <div>${new Date().toLocaleDateString('km-KH')}</div>
                    <div class="small-signature-card">នាយក</div>
                </div>
            </div>
        </div>
    `;
}
