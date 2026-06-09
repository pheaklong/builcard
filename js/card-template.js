// ============================================
// QR CODE GENERATION WITH OPTIMIZED POSITION
// ============================================

function generateQRCode(studentID, size, color) {
    console.log('=== QR CODE GENERATION START ===');
    console.log('Student ID:', studentID);
    console.log('QR Size:', size);
    console.log('QR Color:', color);
    
    // កំណត់ទំហំ QR Code អប្បបរមាសម្រាប់ស្កេនបាន (យ៉ាងតិច 1.5cm)
    const qrSize = Math.max(size || 45, 55); // បង្កើនទំហំអប្បបរមា
    const qrColor = color || "#233D2E";
    
    // Create the QR code URL with student ID
    const qrCodeUrl = `https://pheaklong.github.io/IDcard-Project/digital-card.html?id=${encodeURIComponent(studentID)}`;
    console.log('QR Code URL:', qrCodeUrl);
    
    // Check if studentID is valid
    if (!studentID || studentID === '_________') {
        console.warn('⚠️ Warning: Student ID is empty or default value!');
    }
    
    // Using quickchart.io API with higher quality
    const qrCodeImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeUrl)}&size=${qrSize}&dark=${qrColor.replace('#', '')}&light=ffffff&margin=2`;
    console.log('QR Code Image URL:', qrCodeImageUrl);
    
    const qrHtml = `<img src="${qrCodeImageUrl}" alt="QR Code" style="width:100%;height:100%;object-fit:contain;" 
        onerror="console.error('❌ Failed to load QR code image for student:', '${studentID}'); this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'text-align:center;font-size:10px;color:red;\\'>QR Error</div>';" 
        onload="console.log('✅ QR Code loaded successfully for student:', '${studentID}');" />`;
    
    console.log('QR Code HTML generated successfully');
    console.log('=== QR CODE GENERATION END ===');
    
    return qrHtml;
}

// មុខងារសម្រាប់ពិនិត្យទីតាំងធាតុទាំងអស់
function debugCardElementPositions() {
    const elements = {
        'QR Code': { x: getElementConfig('qrCode', 'x', 5.5), y: getElementConfig('qrCode', 'y', 1.3), size: getElementConfig('qrCode', 'size', 1.1) },
        'Royal Text': { x: getElementConfig('royalText', 'x', 4.2), y: getElementConfig('royalText', 'y', 0.4) },
        'Ministry Text': { x: getElementConfig('ministryText', 'x', 0.3), y: getElementConfig('ministryText', 'y', 1.5) },
        'Title Text': { x: getElementConfig('titleText', 'x', 3.25), y: getElementConfig('titleText', 'y', 2.8) },
        'Student Photo': { x: getElementConfig('studentPhoto', 'x', 0.3), y: getElementConfig('studentPhoto', 'y', 5.8), size: '2.0x2.5' },
        'Student Info': { x: getElementConfig('studentInfo', 'x', 0.3), y: getElementConfig('studentInfo', 'y', 3.6) },
        'Signature': { x: getElementConfig('signature', 'x', 4.5), y: getElementConfig('signature', 'y', 7.7) }
    };
    
    console.table(elements);
    console.log('Card dimensions: 6.5cm x 8.5cm');
    
    // ពិនិត្យមើលការត្រួតគ្នា
    console.log('\n--- Overlap Check ---');
    
    // QR Code ស្ថិតនៅជ្រុងខាងស្តាំលើ
    const qrRightEdge = getElementConfig('qrCode', 'x', 5.5) + getElementConfig('qrCode', 'size', 1.1);
    if (qrRightEdge > 6.5) {
        console.warn('⚠️ QR Code extends beyond right edge of card!');
    }
    
    // ពិនិត្យមើលថា QR Code ត្រួតលើ Royal Text ដែរឬទេ
    const royalTextX = getElementConfig('royalText', 'x', 4.2);
    const qrCodeX = getElementConfig('qrCode', 'x', 5.5);
    if (Math.abs(royalTextX - qrCodeX) < 1.5) {
        console.warn('⚠️ QR Code might overlap with Royal Text!');
    } else {
        console.log('✅ QR Code position looks good');
    }
    
    return elements;
}

// ============================================
// MAIN CARD GENERATOR WITH IMPROVED QR DISPLAY
// ============================================

function generateCardHTML(data) {
    console.log('🃏 Generating card for student:', data.name || 'Unknown');
    console.log('Student data received:', data);
    
    const cardWidthCm = getCardWidthCm();
    const cardHeightCm = getCardHeightCm();
    const fontFamily = getGlobalFontFamily();
    const cardBgColor = getCardBgColor();
    const cardBorderColor = getCardBorderColor();
    const cardBorderWidth = getCardBorderWidth();
    
    const studentID = data.studentID || '_________';
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : '____/____/______';
    
    console.log('Card dimensions:', cardWidthCm, 'cm x', cardHeightCm, 'cm');
    console.log('Student ID for QR:', studentID);
    
    // Get element configurations
    const qrCodeVisible = getElementConfig('qrCode', 'visible', true);
    
    // QR Code position - កែតម្រូវទីតាំងឱ្យល្អប្រសើរ
    let qrCodeX = getElementConfig('qrCode', 'x', 5.5);
    let qrCodeY = getElementConfig('qrCode', 'y', 1.3);
    let qrCodeSize = getElementConfig('qrCode', 'size', 1.1);
    
    // ប្រសិនបើ QR Code ធំពេក កែតម្រូវទីតាំង
    if (qrCodeSize > 1.5) {
        qrCodeX = Math.min(qrCodeX, cardWidthCm - qrCodeSize - 0.2);
        console.log('Adjusted QR position to avoid overflow:', qrCodeX);
    }
    
    console.log('QR Code position:', { x: qrCodeX, y: qrCodeY, size: qrCodeSize });
    
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
    
    // បង្កើត QR Code HTML
    const qrCodeHTML = qrCodeVisible ? generateQRCode(studentID, cmToPx(qrCodeSize), royalTextColor) : '';
    console.log('QR Code HTML length:', qrCodeHTML.length);
    console.log('QR Code will be placed at:', cmToPx(qrCodeX), 'px from left,', cmToPx(qrCodeY), 'px from top');
    
    const finalHTML = `
        <div class="student-id-card" style="width: ${cmToPx(cardWidthCm)}px; height: ${cmToPx(cardHeightCm)}px; background: ${cardBgColor}; border: ${cardBorderWidth}px solid ${cardBorderColor}; border-radius: 8px; padding: 8px 10px; font-family: ${fontFamily}; position: relative; overflow: visible; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            
            ${getWatermarkLogo()}
            ${getSchoolLogo()}
            ${getStampElement()}
            
            ${royalTextVisible ? `<div style="position: absolute; left: ${cmToPx(royalTextX)}px; top: ${cmToPx(royalTextY)}px; text-align: right; font-family: ${fontFamily}; font-size: ${cmToPx(royalTextFontSize)}px; color: ${royalTextColor}; z-index: 1;">
                <div>ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            </div>` : ''}
            
            ${ministryTextVisible ? `<div style="position: absolute; left: ${cmToPx(ministryTextX)}px; top: ${cmToPx(ministryTextY)}px; font-family: ${fontFamily}; font-size: ${cmToPx(ministryTextFontSize)}px; line-height: 1.3; color: ${ministryTextColor}; z-index: 1;">
                <div>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                <div>មន្ទីរអប់រំ យុវជន និងកីឡា ភ្នំពេញ</div>
                <div style="font-weight: bold; margin-top: 2px;">វិទ្យាល័យកំរៀង</div>
            </div>` : ''}
            
            <!-- QR Code Container with better visibility -->
            ${qrCodeVisible ? `<div style="position: absolute; left: ${cmToPx(qrCodeX)}px; top: ${cmToPx(qrCodeY)}px; width: ${cmToPx(qrCodeSize)}px; height: ${cmToPx(qrCodeSize)}px; z-index: 10; background: white; border-radius: 6px; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); border: 1px solid #e0e0e0;">
                ${qrCodeHTML}
                <div style="text-align: center; font-size: ${cmToPx(0.12)}px; color: #666; margin-top: 2px;">ស្កេនមើលព័ត៌មាន</div>
            </div>` : '<div style="display:none;">QR Code disabled</div>'}
            
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
    
    console.log('✅ Card HTML generated successfully');
    console.log('Card contains QR Code:', finalHTML.includes('quickchart.io') || finalHTML.includes('chart.googleapis.com'));
    
    return finalHTML;
}

// បន្ថែម function សម្រាប់ debug
window.debugCardPositions = debugCardElementPositions;
