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

// QR Code Generator (simple SVG placeholder)
function generateQRCode(studentID) {
    return `
        <svg width="95" height="95" viewBox="0 0 100 100" fill="#233D2E">
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
        <svg width="80" height="80" viewBox="0 0 100 100" fill="#233D2E">
            <circle cx="50" cy="50" r="45" stroke="#233D2E" stroke-width="2.5" fill="none"/>
            <path d="M50 15 L70 35 L70 65 L50 85 L30 65 L30 35 Z" stroke="#233D2E" stroke-width="2" fill="none"/>
            <text x="50" y="55" text-anchor="middle" font-size="20" fill="#233D2E" font-weight="bold">សា</text>
            <circle cx="50" cy="35" r="5" fill="#233D2E"/>
        </svg>
    `;
}

// Photo Placeholder / Student Photo
function getPhotoHTML(photoData) {
    if (photoData && photoData !== 'null' && photoData !== '') {
        return `<img src="${photoData}" alt="Student Photo" class="student-photo-img">`;
    }
    return `
        <div class="photo-placeholder-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#aaa">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>3X4</span>
        </div>
    `;
}

// ============================================
// MAIN CARD GENERATOR
// ============================================

function generateCardHTML(data) {
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : '_____ / _____ / _____';
    const currentYear = new Date().getFullYear();
    const academicYear = `២០២៥-២០២៦`;
    const studentID = data.studentID || '5906';
    
    return `
        <div class="student-id-card">
            <!-- Watermark Emblem -->
            <div class="watermark-emblem">
                <svg viewBox="0 0 200 200" fill="currentColor">
                    <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="3" fill="none"/>
                    <path d="M100 30 L140 70 L140 130 L100 170 L60 130 L60 70 Z" stroke="currentColor" stroke-width="3" fill="none"/>
                    <circle cx="100" cy="100" r="30" stroke="currentColor" stroke-width="2.5" fill="none"/>
                    <text x="100" y="108" text-anchor="middle" font-size="28" fill="currentColor" font-weight="bold">ក</text>
                </svg>
            </div>
            
            <!-- Header Section -->
            <div class="card-header">
                <div class="logo-section">
                    ${getSchoolLogo()}
                    <div class="school-name-block">
                        <div class="school-line-1">ព្រះរាជាណាចក្រកម្ពុជា</div>
                        <div class="school-line-2">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                        <div class="school-line-3">វិទ្យាល័យ កែវរៀវ</div>
                    </div>
                </div>
                <div class="header-right">
                    <div class="header-text-right">
                        <div>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                        <div>ដេប៉ាតឺម៉ង់ផែនការ និងហិរញ្ញវត្ថុ</div>
                        <div>កម្មវិធីសាលារៀនឌីជីថល</div>
                    </div>
                    <div class="decorative-divider"></div>
                    <div class="qr-code-container">
                        ${generateQRCode(studentID)}
                    </div>
                </div>
            </div>
            
            <!-- Main Title Section -->
            <div class="title-section">
                <h1 class="card-main-title">អត្តសញ្ញាណប័ណ្ណសិស្ស</h1>
                <div class="academic-year-text">ឆ្នាំសិក្សា ${academicYear}</div>
            </div>
            
            <!-- Information Section - Two Columns -->
            <div class="info-section">
                <!-- Left Column -->
                <div class="info-column left-col">
                    <div class="info-row">
                        <span class="info-label">គោត្តនាម និងនាម</span>
                        <span class="info-value">${escapeHtml(data.name) || '_________________________'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ភេទ</span>
                        <span class="info-value">${escapeHtml(data.sex) || '_____'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត</span>
                        <span class="info-value">${birthDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ទីកន្លែងកំណើត</span>
                        <span class="info-value">${escapeHtml(data.address) || '_________________________'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">មុខរបរ</span>
                        <span class="info-value">${escapeHtml(data.fatherjob) || '_________________________'}</span>
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="info-column right-col">
                    <div class="info-row">
                        <span class="info-label">សញ្ជាតិ</span>
                        <span class="info-value">ខ្មែរ</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ថ្នាក់</span>
                        <span class="info-value">${escapeHtml(data.class) || '_____'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">លេខទូរស័ព្ទ</span>
                        <span class="info-value">${escapeHtml(data.phonenumber) || '_______________'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">អាណាព្យាបាល</span>
                        <span class="info-value">${escapeHtml(data.fathername) || '_________________'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">អាសយដ្ឋាន</span>
                        <span class="info-value">${escapeHtml(data.address) || '_________________________________'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Bottom Section -->
            <div class="bottom-section">
                <!-- Left Side: ID Box + Photo -->
                <div class="bottom-left">
                    <div class="student-id-box">
                        <span class="id-number-text">ID-${studentID}</span>
                    </div>
                    <div class="photo-frame">
                        ${getPhotoHTML(data.photo)}
                    </div>
                </div>
                
                <!-- Right Side: Certification + Signature -->
                <div class="bottom-right">
                    <div class="certification-text">
                        <p>ប័ណ្ណនេះជាកម្មសិទ្ធិរបស់សិស្សខាងលើ</p>
                        <p>ត្រូវតែយកតាមខ្លួនជានិច្ច</p>
                        <p>ចេញថ្ងៃទី ${new Date().toLocaleDateString('km-KH')}</p>
                        <p>សុពលភាពដល់ថ្ងៃទី 31 ធ្នូ ${currentYear + 1}</p>
                    </div>
                    <div class="signature-area">
                        <div class="signature-title">នាយកវិទ្យាល័យ</div>
                        <div class="signature-line">_________________</div>
                        <div class="principal-name-red">ព្រះគ្រូ សុខ សុភក្ត្រា</div>
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
    const birthDate = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
    const studentID = student.studentID || 'N/A';
    const photoHTML = getPhotoHTML(student.photo);
    
    return `
        <div class="student-id-card-small">
            <div class="small-card-inner">
                <div class="small-header">
                    <div class="small-logo">${getSchoolLogo()}</div>
                    <div class="small-title">អត្តសញ្ញាណប័ណ្ណសិស្ស</div>
                    <div class="small-qr">${generateQRCode(studentID)}</div>
                </div>
                <div class="small-body">
                    <div class="small-photo">${photoHTML}</div>
                    <div class="small-info">
                        <div><strong>${escapeHtml(student.name)}</strong></div>
                        <div>ID: ${studentID}</div>
                        <div>ភេទ: ${escapeHtml(student.sex)}</div>
                        <div>ថ្នាក់: ${escapeHtml(student.class)}</div>
                        <div>កើតថ្ងៃ: ${birthDate}</div>
                    </div>
                </div>
                <div class="small-footer">
                    <div>${new Date().toLocaleDateString('km-KH')}</div>
                    <div class="small-signature">នាយក</div>
                </div>
            </div>
        </div>
    `;
}
