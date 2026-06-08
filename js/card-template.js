// ============================================
// CARD TEMPLATE - Professional Cambodian Student ID Card
// ============================================

// អនុគមន៍សម្រាប់ការពារ XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// អនុគមន៍សម្រាប់បង្កើត QR Code (placeholder)
function generateQRCode(studentID) {
    // នេះជា QR Code សាមញ្ញ (ប្រើ canvas)
    // សម្រាប់ QR Code ពិតប្រាកដ អ្នកអាចប្រើ library ដូចជា qrcode.js
    return `
        <div class="qr-placeholder" style="width: 60px; height: 60px; background: #1a1a2e; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
            <svg width="50" height="50" viewBox="0 0 100 100" fill="white">
                <rect x="10" y="10" width="10" height="10" fill="white"/>
                <rect x="30" y="10" width="10" height="10" fill="white"/>
                <rect x="50" y="10" width="10" height="10" fill="white"/>
                <rect x="70" y="10" width="10" height="10" fill="white"/>
                <rect x="10" y="30" width="10" height="10" fill="white"/>
                <rect x="50" y="30" width="10" height="10" fill="white"/>
                <rect x="70" y="30" width="10" height="10" fill="white"/>
                <rect x="10" y="50" width="10" height="10" fill="white"/>
                <rect x="30" y="50" width="10" height="10" fill="white"/>
                <rect x="50" y="50" width="10" height="10" fill="white"/>
                <rect x="30" y="70" width="10" height="10" fill="white"/>
                <rect x="50" y="70" width="10" height="10" fill="white"/>
                <rect x="70" y="70" width="10" height="10" fill="white"/>
            </svg>
        </div>
    `;
}

// អនុគមន៍សម្រាប់បង្ហាញរូបថត
function getPhotoHTML(photoData) {
    if (photoData && photoData !== 'null' && photoData !== '') {
        return `<img src="${photoData}" alt="Student Photo" class="student-photo">`;
    }
    return `<div class="photo-placeholder">
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                <span>រូបថត</span>
            </div>`;
}

// ទម្រង់កាតធំ (សម្រាប់ create.html)
function generateCardHTML(data) {
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const studentID = data.studentID || 'N/A';
    
    return `
        <div class="student-id-card">
            <!-- Watermark Emblem -->
            <div class="watermark">
                <svg viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M50 20 L65 45 L60 45 L55 35 L55 80 L45 80 L45 35 L40 45 L35 45 Z" fill="currentColor"/>
                    <circle cx="50" cy="50" r="15" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
            </div>
            
            <!-- Header Section -->
            <div class="card-header">
                <div class="school-logo">
                    <svg viewBox="0 0 50 50" fill="currentColor">
                        <path d="M25 5 L45 15 L45 35 L25 45 L5 35 L5 15 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        <text x="25" y="30" text-anchor="middle" font-size="12" fill="currentColor">សា</text>
                    </svg>
                </div>
                <div class="school-title">
                    <div class="ministry-text">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                    <div class="school-name">វិទ្យាល័យ កែវរៀវ</div>
                    <div class="school-name-english">KEOV RIEV HIGH SCHOOL</div>
                </div>
                <div class="qr-code">
                    ${generateQRCode(studentID)}
                </div>
            </div>
            
            <!-- Main Title -->
            <div class="card-title">
                <h1>អត្តសញ្ញាណប័ណ្ណសិស្ស</h1>
                <div class="academic-year">ឆ្នាំសិក្សា ${academicYear}</div>
            </div>
            
            <!-- Body Content - Two Columns -->
            <div class="card-body">
                <!-- Left Column -->
                <div class="left-column">
                    <div class="info-group">
                        <div class="info-row">
                            <span class="info-label">គោត្តនាម នាម៖</span>
                            <span class="info-value">${escapeHtml(data.name) || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ភេទ៖</span>
                            <span class="info-value">${escapeHtml(data.sex) || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត៖</span>
                            <span class="info-value">${birthDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ថ្នាក់៖</span>
                            <span class="info-value">${escapeHtml(data.class) || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ទីកន្លែងកំណើត៖</span>
                            <span class="info-value">${escapeHtml(data.address) || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">លេខទូរស័ព្ទ៖</span>
                            <span class="info-value">${escapeHtml(data.phonenumber) || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">អាសយដ្ឋាន៖</span>
                            <span class="info-value">${escapeHtml(data.address) || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ព្រះបិតា/ព្រះមាតា៖</span>
                            <span class="info-value">${escapeHtml(data.fathername) || 'N/A'} / ${escapeHtml(data.mothername) || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <!-- Student ID Box -->
                    <div class="student-id-box">
                        <span class="id-label">អត្តលេខសម្គាល់</span>
                        <span class="id-number">ID-${studentID}</span>
                    </div>
                    
                    <!-- Photo Placeholder -->
                    <div class="photo-container">
                        ${getPhotoHTML(data.photo)}
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="right-column">
                    <!-- Issue Information -->
                    <div class="issue-info">
                        <div class="issue-title">ព័ត៌មានចេញប័ណ្ណ</div>
                        <div class="issue-row">
                            <span class="issue-label">ចេញថ្ងៃទី៖</span>
                            <span class="issue-value">${new Date().toLocaleDateString('km-KH')}</span>
                        </div>
                        <div class="issue-row">
                            <span class="issue-label">សុពលភាព៖</span>
                            <span class="issue-value">ដល់ថ្ងៃទី 31 ធ្នូ ${academicYear}</span>
                        </div>
                    </div>
                    
                    <!-- School Details -->
                    <div class="school-details">
                        <div class="detail-row">
                            <span class="detail-label">អាសយដ្ឋានសាលា៖</span>
                            <span class="detail-value">ភូមិ កែវរៀវ, ឃុំ កែវរៀវ, ស្រុក កែវរៀវ, ខេត្ត កែវរៀវ</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">ទូរស័ព្ទ៖</span>
                            <span class="detail-value">095 858 545</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">អ៊ីមែល៖</span>
                            <span class="detail-value">info@keovriev.edu.kh</span>
                        </div>
                    </div>
                    
                    <!-- Official Certification -->
                    <div class="certification">
                        <p>ប័ណ្ណនេះជាភស្តុតាងបញ្ជាក់ថា អ្នកកាន់ប័ណ្ណគឺជាសិស្សនៃវិទ្យាល័យ កែវរៀវ ក្រោមការគ្រប់គ្រងរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។</p>
                        <p>ប័ណ្ណនេះត្រូវតែយកតាមខ្លួនជានិច្ច ហើយត្រូវបង្ហាញតាមការស្នើសុំរបស់មន្ត្រីសាលា។</p>
                    </div>
                    
                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-line">
                            <div class="signature">_________________</div>
                            <div class="signature-name">ព្រះគ្រូអធិការ</div>
                        </div>
                        <div class="signature-line">
                            <div class="signature">_________________</div>
                            <div class="signature-name red">ព្រះគ្រូប្រចាំថ្នាក់</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="card-footer">
                <div class="footer-text">ប័ណ្ណនេះជាកម្មសិទ្ធិរបស់វិទ្យាល័យ កែវរៀវ</div>
            </div>
        </div>
    `;
}

// ទម្រង់កាតតូច (សម្រាប់ generate.html)
function generateSmallCardHTML(student) {
    const birthDate = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
    const studentID = student.studentID || 'N/A';
    const photoHTML = getPhotoHTML(student.photo);
    
    return `
        <div class="student-id-card-small">
            <div class="small-card-header">
                <div class="small-logo">
                    <svg viewBox="0 0 30 30" fill="currentColor">
                        <path d="M15 3 L27 11 L27 25 L15 31 L3 25 L3 11 Z" stroke="currentColor" stroke-width="1" fill="none"/>
                    </svg>
                </div>
                <div class="small-title">
                    <div>វិទ្យាល័យ កែវរៀវ</div>
                    <div class="small-sub">អត្តសញ្ញាណប័ណ្ណសិស្ស</div>
                </div>
            </div>
            
            <div class="small-card-body">
                <div class="small-photo">${photoHTML}</div>
                <div class="small-info">
                    <div class="small-name">${escapeHtml(student.name) || 'N/A'}</div>
                    <div class="small-detail">ID: ${studentID}</div>
                    <div class="small-detail">ថ្នាក់: ${escapeHtml(student.class) || 'N/A'}</div>
                    <div class="small-detail">ភេទ: ${escapeHtml(student.sex) || 'N/A'}</div>
                    <div class="small-detail">កើតថ្ងៃ: ${birthDate}</div>
                </div>
            </div>
            
            <div class="small-card-footer">
                <div>${new Date().toLocaleDateString('km-KH')}</div>
                <div class="small-signature">_________________</div>
            </div>
        </div>
    `;
}
