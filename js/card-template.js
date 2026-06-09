// ============================================
// LOAD CUSTOM CONFIGURATION FROM LOCALSTORAGE
// ============================================

let customCardConfig = null;

function loadCustomConfig() {
    try {
        const savedConfig = localStorage.getItem('cardSystemConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            customCardConfig = config.cardConfig;
            console.log('✅ Loaded custom card configuration from system');
            return true;
        }
    } catch(e) {
        console.warn('Failed to load custom config:', e);
    }
    return false;
}

loadCustomConfig();

function getCustomConfigValue(path, defaultValue) {
    if (!customCardConfig) return defaultValue;
    const parts = path.split('.');
    let current = customCardConfig;
    for (const part of parts) {
        if (current && current[part] !== undefined) {
            current = current[part];
        } else {
            return defaultValue;
        }
    }
    return current;
}

function getElementConfig(elementName, property, defaultValue) {
    if (customCardConfig && customCardConfig.elements && customCardConfig.elements[elementName]) {
        const val = customCardConfig.elements[elementName][property];
        if (val !== undefined) return val;
    }
    return defaultValue;
}

function getCardWidthCm() { return getCustomConfigValue('cardWidthCm', 6.5); }
function getCardHeightCm() { return getCustomConfigValue('cardHeightCm', 8.5); }
function getGlobalFontFamily() { return getCustomConfigValue('globalFontFamily', "'Khmer', 'Khmer OS Moul Light', sans-serif"); }
function getCardBgColor() { return getElementConfig('cardBg', 'bgColor', "#f5f5f0"); }
function getCardBorderColor() { return getElementConfig('cardBg', 'borderColor', "#4A86E8"); }
function getCardBorderWidth() { return getElementConfig('cardBg', 'borderWidth', 1); }

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

function cmToPx(cm) { return cm * 37.8; }

// ============================================
// QR CODE GENERATION WITH LINK
// ============================================

function generateQRCode(studentID, size, color) {
    console.log('=== QR CODE GENERATION START ===');
    console.log('Student ID:', studentID);
    
    const qrSize = size || 45;
    const qrColor = color || "#233D2E";
    
    // Create the QR code URL with student ID
    const qrCodeUrl = `https://pheaklong.github.io/IDcard-Project/digital-card.html?id=${encodeURIComponent(studentID)}`;
    console.log('QR Code URL:', qrCodeUrl);
    
    // Using quickchart.io API
    const qrCodeImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeUrl)}&size=${qrSize}&dark=${qrColor.replace('#', '')}&light=ffffff`;
    console.log('QR Code Image URL:', qrCodeImageUrl);
    
    const qrHtml = `<img src="${qrCodeImageUrl}" alt="QR Code" style="width:100%;height:100%;object-fit:contain;" 
        onerror="console.error('❌ Failed to load QR code for student:', '${studentID}'); this.onerror=null; this.parentElement.innerHTML='<div style=\\'text-align:center;font-size:10px;color:red;\\'>QR Error</div>';" 
        onload="console.log('✅ QR Code loaded for student:', '${studentID}');" />`;
    
    console.log('=== QR CODE GENERATION END ===');
    return qrHtml;
}

// ============================================
// STAMP ELEMENT
// ============================================

function getStampElement() {
    const stampVisible = getElementConfig('stamp', 'visible', true);
    if (!stampVisible) return '';
    
    const stampX = getElementConfig('stamp', 'x', 2.5);
    const stampY = getElementConfig('stamp', 'y', 6.3);
    const stampWidth = getElementConfig('stamp', 'width', 1.6);
    const stampHeight = getElementConfig('stamp', 'height', 1.6);
    const stampOpacity = getElementConfig('stamp', 'opacity', 0.85);
    
    return `
        <div style="position: absolute; left: ${cmToPx(stampX)}px; top: ${cmToPx(stampY)}px; width: ${cmToPx(stampWidth)}px; height: ${cmToPx(stampHeight)}px; opacity: ${stampOpacity}; z-index: 20; pointer-events: none;">
            <img src="../tra.png" alt="ត្រា" style="width:100%;height:100%;object-fit:contain;" onerror="console.warn('⚠️ Stamp image not found')">
        </div>
    `;
}

// ============================================
// STUDENT PHOTO
// ============================================

function getPhotoHTML(photoData) {
    const studentPhotoVisible = getElementConfig('studentPhoto', 'visible', true);
    if (!studentPhotoVisible) return '';
    
    const photoHtml = (photoData && photoData !== 'null' && photoData !== '') 
        ? `<img src="${photoData}" alt="Student Photo" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="console.warn('⚠️ Student photo not found')">`
        : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#aaa">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span style="font-size:10px;margin-top:5px;">រូបថត</span>
        </div>`;
    
    return photoHtml;
}

// ============================================
// SCHOOL LOGO
// ============================================

function getSchoolLogo() {
    const logoVisible = getElementConfig('logo', 'visible', true);
    if (!logoVisible) return '';
    
    const logoX = getElementConfig('logo', 'x', 0.3);
    const logoY = getElementConfig('logo', 'y', 0.3);
    const logoWidth = getElementConfig('logo', 'width', 0.9);
    const logoHeight = getElementConfig('logo', 'height', 0.9);
    
    return `
        <div style="position: absolute; left: ${cmToPx(logoX)}px; top: ${cmToPx(logoY)}px; width: ${cmToPx(logoWidth)}px; height: ${cmToPx(logoHeight)}px; z-index: 1;">
            <img src="../logomoeys.png" alt="School Logo" style="width:100%;height:100%;object-fit:contain;" onerror="console.warn('⚠️ School logo not found')">
        </div>
    `;
}

// ============================================
// SIGNATURE
// ============================================

function getSignatureImage() {
    const signatureVisible = getElementConfig('signature', 'visible', true);
    if (!signatureVisible) return '';
    
    const signatureX = getElementConfig('signature', 'x', 4.5);
    const signatureY = getElementConfig('signature', 'y', 7.7);
    const signatureWidth = getElementConfig('signature', 'width', 2.2);
    const signatureHeight = getElementConfig('signature', 'height', 0.8);
    
    return `
        <div style="position: absolute; left: ${cmToPx(signatureX)}px; top: ${cmToPx(signatureY)}px; width: ${cmToPx(signatureWidth)}px; text-align: center; z-index: 1;">
            <div style="font-size: ${cmToPx(0.2)}px; font-weight: bold; color: #233D2E;">នាយកវិទ្យាល័យ</div>
            <div style="margin-top: 2px;">
                <img src="../Signature.png" alt="Signature" style="width:100%;height:auto;max-height:${cmToPx(signatureHeight)}px;object-fit:contain;" onerror="console.warn('⚠️ Signature image not found')">
            </div>
        </div>
    `;
}

// ============================================
// WATERMARK
// ============================================

function getWatermarkLogo() {
    const watermarkVisible = getElementConfig('watermark', 'visible', true);
    if (!watermarkVisible) return '';
    
    const watermarkX = getElementConfig('watermark', 'x', 3.25);
    const watermarkY = getElementConfig('watermark', 'y', 4.25);
    const watermarkWidth = getElementConfig('watermark', 'width', 4.0);
    const watermarkHeight = getElementConfig('watermark', 'height', 4.0);
    const watermarkOpacity = getElementConfig('watermark', 'opacity', 0.1);
    
    return `
        <div style="position: absolute; left: ${cmToPx(watermarkX)}px; top: ${cmToPx(watermarkY)}px; width: ${cmToPx(watermarkWidth)}px; height: ${cmToPx(watermarkHeight)}px; opacity: ${watermarkOpacity}; pointer-events: none; z-index: 0;">
            <img src="../logomoeys.png" alt="Watermark" style="width:100%;height:100%;object-fit:contain;">
        </div>
    `;
}

// ============================================
// MAIN CARD GENERATOR
// ============================================

function generateCardHTML(data) {
    console.log('🃏 Generating card for student:', data.name || 'Unknown');
    
    const cardWidthCm = getCardWidthCm();
    const cardHeightCm = getCardHeightCm();
    const fontFamily = getGlobalFontFamily();
    const cardBgColor = getCardBgColor();
    const cardBorderColor = getCardBorderColor();
    const cardBorderWidth = getCardBorderWidth();
    
    const studentID = data.studentID || '_________';
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : '____/____/______';
    
    // Get element configurations
    const qrCodeVisible = getElementConfig('qrCode', 'visible', true);
    const royalTextVisible = getElementConfig('royalText', 'visible', true);
    const royalTextX = getElementConfig('royalText', 'x', 4.2);
    const royalTextY = getElementConfig('royalText', 'y', 0.4);
    const royalTextFontSize = getElementConfig('royalText', 'fontSize', 0.22);
    const royalTextColor = getElementConfig('royalText', 'color', "#233D2E");
    
    const ministryTextVisible = getElementConfig('ministryText', 'visible', true);
    const ministryTextX = getElementConfig('ministryText', 'x', 0.3);
    const ministryTextY = getElementConfig('ministryText', 'y', 1.5);
    const ministryTextFontSize = getElementConfig('ministryText', 'fontSize', 0.2);
    const ministryTextColor = getElementConfig('ministryText', 'color', "#233D2E");
    
    const qrCodeX = getElementConfig('qrCode', 'x', 5.5);
    const qrCodeY = getElementConfig('qrCode', 'y', 1.3);
    const qrCodeSize = getElementConfig('qrCode', 'size', 1.1);
    
    const titleTextVisible = getElementConfig('titleText', 'visible', true);
    const titleTextX = getElementConfig('titleText', 'x', 3.25);
    const titleTextY = getElementConfig('titleText', 'y', 2.8);
    const titleTextFontSize = getElementConfig('titleText', 'fontSize', 0.32);
    const titleTextColor = getElementConfig('titleText', 'color', "#D28A17");
    
    const subtitleTextVisible = getElementConfig('subtitleText', 'visible', true);
    const subtitleTextX = getElementConfig('subtitleText', 'x', 3.25);
    const subtitleTextY = getElementConfig('subtitleText', 'y', 3.15);
    const subtitleTextFontSize = getElementConfig('subtitleText', 'fontSize', 0.22);
    const subtitleTextColor = getElementConfig('subtitleText', 'color', "#3D8BFF");
    
    const studentInfoVisible = getElementConfig('studentInfo', 'visible', true);
    const studentInfoX = getElementConfig('studentInfo', 'x', 0.3);
    const studentInfoY = getElementConfig('studentInfo', 'y', 3.6);
    const studentInfoFontSize = getElementConfig('studentInfo', 'fontSize', 0.19);
    const studentInfoLabelColor = getElementConfig('studentInfo', 'labelColor', "#233D2E");
    const studentInfoValueColor = getElementConfig('studentInfo', 'valueColor', "#304FFE");
    
    const studentPhotoVisible = getElementConfig('studentPhoto', 'visible', true);
    const studentPhotoX = getElementConfig('studentPhoto', 'x', 0.3);
    const studentPhotoY = getElementConfig('studentPhoto', 'y', 5.8);
    const studentPhotoWidth = getElementConfig('studentPhoto', 'width', 2.0);
    const studentPhotoHeight = getElementConfig('studentPhoto', 'height', 2.5);
    
    const dateTextVisible = getElementConfig('dateText', 'visible', true);
    const dateTextX = getElementConfig('dateText', 'x', 2.5);
    const dateTextY = getElementConfig('dateText', 'y', 7.0);
    const dateTextFontSize = getElementConfig('dateText', 'fontSize', 0.16);
    const dateTextColor = getElementConfig('dateText', 'color', "#233D2E");
    const dateTextContent = getElementConfig('dateText', 'text', "ថ្ងៃសៅរ៍ ១១កើត ខែកត្តិក ឆ្នាំម្សាញ់ ព.ស ២៥៦៩");
    
    const schoolLocationVisible = getElementConfig('schoolLocation', 'visible', true);
    const schoolLocationX = getElementConfig('schoolLocation', 'x', 2.5);
    const schoolLocationY = getElementConfig('schoolLocation', 'y', 7.35);
    const schoolLocationFontSize = getElementConfig('schoolLocation', 'fontSize', 0.16);
    const schoolLocationColor = getElementConfig('schoolLocation', 'color', "#233D2E");
    const schoolLocationContent = getElementConfig('schoolLocation', 'text', "វិ.កំរៀង , ថ្ងៃទី១ ខែវិច្ឆិកា ឆ្នាំ២០២៥");
    
    const principalTextVisible = getElementConfig('principalText', 'visible', true);
    const principalTextX = getElementConfig('principalText', 'x', 4.5);
    const principalTextY = getElementConfig('principalText', 'y', 7.5);
    const principalTextFontSize = getElementConfig('principalText', 'fontSize', 0.18);
    const principalTextColor = getElementConfig('principalText', 'color', "#D50000");
    const principalTextContent = getElementConfig('principalText', 'text', "ព្រះគ្រូ សុខ សុភក្ត្រា");
    
    const qrCodeHTML = qrCodeVisible ? generateQRCode(studentID, cmToPx(qrCodeSize), royalTextColor) : '';
    
    return `
        <div class="student-id-card" style="width: ${cmToPx(cardWidthCm)}px; height: ${cmToPx(cardHeightCm)}px; background: ${cardBgColor}; border: ${cardBorderWidth}px solid ${cardBorderColor}; border-radius: 8px; padding: 8px 10px; font-family: ${fontFamily}; position: relative; overflow: visible; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
            
            ${getWatermarkLogo()}
            ${getSchoolLogo()}
            ${getStampElement()}
            
            ${royalTextVisible ? `<div style="position: absolute; left: ${cmToPx(royalTextX)}px; top: ${cmToPx(royalTextY)}px; text-align: right; font-family: ${fontFamily}; font-size: ${cmToPx(royalTextFontSize)}px; color: ${royalTextColor}; z-index: 1;">
                <div>ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            </div>` : ''}
            
            ${ministryTextVisible ? `<div style="position: absolute; left: ${cmToPx(ministryTextX)}px; top: ${cmToPx(ministryTextY)}px; font-family: ${fontFamily}; font-size: ${cmToPx(ministryTextFontSize)}px; line-height: 1.3; color: ${ministryTextColor}; z-index: 1;">
                <div>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                <div>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង</div>
                <div style="font-weight: bold; margin-top: 2px;">វិទ្យាល័យកំរៀង</div>
            </div>` : ''}
            
            ${qrCodeVisible ? `<div style="position: absolute; left: ${cmToPx(qrCodeX)}px; top: ${cmToPx(qrCodeY)}px; width: ${cmToPx(qrCodeSize)}px; height: ${cmToPx(qrCodeSize)}px; z-index: 10; background: white; border-radius: 6px; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); border: 1px solid #e0e0e0;">
                ${qrCodeHTML}
                <div style="text-align: center; font-size: ${cmToPx(0.12)}px; color: #666; margin-top: 2px;">ស្កេនមើល</div>
            </div>` : ''}
            
            ${titleTextVisible ? `<div style="position: absolute; left: ${cmToPx(titleTextX)}px; top: ${cmToPx(titleTextY)}px; transform: translateX(-50%); text-align: center; font-family: ${fontFamily}; font-size: ${cmToPx(titleTextFontSize)}px; font-weight: bold; color: ${titleTextColor}; z-index: 1;">
                <div>បណ្ណសម្គាល់ខ្លួនសិស្ស</div>
            </div>` : ''}
            
            ${subtitleTextVisible ? `<div style="position: absolute; left: ${cmToPx(subtitleTextX)}px; top: ${cmToPx(subtitleTextY)}px; transform: translateX(-50%); text-align: center; font-family: ${fontFamily}; font-size: ${cmToPx(subtitleTextFontSize)}px; color: ${subtitleTextColor}; z-index: 1;">
                <div>ឆ្នាំសិក្សា ២០២៥-២០២៦</div>
            </div>` : ''}
            
            <div style="position: absolute; left: ${cmToPx(studentPhotoX)}px; top: ${cmToPx(studentPhotoY)}px; width: ${cmToPx(studentPhotoWidth)}px; height: ${cmToPx(studentPhotoHeight)}px; border: 1px solid ${cardBorderColor}; border-radius: 6px; background: #e5e7eb; overflow: hidden; z-index: 1;">
                ${getPhotoHTML(data.photo)}
            </div>
            
            ${studentInfoVisible ? `<div style="position: absolute; left: ${cmToPx(studentInfoX)}px; top: ${cmToPx(studentInfoY)}px; font-family: ${fontFamily}; font-size: ${cmToPx(studentInfoFontSize)}px; line-height: 1.4; z-index: 1;">
                <div><span style="color: ${studentInfoLabelColor};">គោត្តនាម និងនាម:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.name) || '___________________'}</span>
                <span style="margin-left: 15px;"><span style="color: ${studentInfoLabelColor};">ភេទ:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.sex) || '_____'}</span></span></div>
                <div><span style="color: ${studentInfoLabelColor};">ថ្ងៃខែឆ្នាំកំណើត:</span> <span style="color: ${studentInfoValueColor};">${birthDate}</span>
                <span style="margin-left: 15px;"><span style="color: ${studentInfoLabelColor};">ថ្នាក់:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.class) || '_____'}</span></span></div>
                <div><span style="color: ${studentInfoLabelColor};">ទីកន្លែងកំណើត:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.address) || '_____________________________'}</span></div>
                <div><span style="color: ${studentInfoLabelColor};">លេខទូរស័ព្ទ:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.phonenumber) || '_______________'}</span>
                <span style="margin-left: 15px;"><span style="color: ${studentInfoLabelColor};">ឈ្មោះឪពុក:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.fathername) || '_____________'}</span></span></div>
                <div><span style="color: ${studentInfoLabelColor};">អត្តលេខ:</span> <span style="color: ${studentInfoValueColor};">${studentID}</span>
                <span style="margin-left: 15px;"><span style="color: ${studentInfoLabelColor};">ឈ្មោះម្តាយ:</span> <span style="color: ${studentInfoValueColor};">${escapeHtml(data.mothername) || '_____________'}</span></span></div>
            </div>` : ''}
            
            ${dateTextVisible ? `<div style="position: absolute; left: ${cmToPx(dateTextX)}px; top: ${cmToPx(dateTextY)}px; font-family: ${fontFamily}; font-size: ${cmToPx(dateTextFontSize)}px; color: ${dateTextColor}; z-index: 1;">${dateTextContent}</div>` : ''}
            
            ${schoolLocationVisible ? `<div style="position: absolute; left: ${cmToPx(schoolLocationX)}px; top: ${cmToPx(schoolLocationY)}px; font-family: ${fontFamily}; font-size: ${cmToPx(schoolLocationFontSize)}px; color: ${schoolLocationColor}; z-index: 1;">${schoolLocationContent}</div>` : ''}
            
            ${getSignatureImage()}
            
            ${principalTextVisible ? `<div style="position: absolute; left: ${cmToPx(principalTextX)}px; top: ${cmToPx(principalTextY)}px; font-family: ${fontFamily}; font-size: ${cmToPx(principalTextFontSize)}px; color: ${principalTextColor}; font-weight: bold; text-align: center; z-index: 1;">${principalTextContent}</div>` : ''}
            
        </div>
    `;
}

function generateSmallCardHTML(student) {
    console.log('🃏 Generating card for student:', student.name || 'Unknown');
    return generateCardHTML(student);
}

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

if (typeof window !== 'undefined') {
    window.generateCardHTML = generateCardHTML;
    window.generateSmallCardHTML = generateSmallCardHTML;
    window.generateQRCode = generateQRCode;
    window.cmToPx = cmToPx;
    window.escapeHtml = escapeHtml;
    window.getElementConfig = getElementConfig;
    
    console.log('✅ card-template.js loaded successfully');
    console.log('✅ Functions available:', {
        generateSmallCardHTML: typeof generateSmallCardHTML,
        generateCardHTML: typeof generateCardHTML
    });
}
