// create-card.js
// This script handles creating student cards with PIC_link support

// =====================================================
// 1. CONFIGURATION & INITIALIZATION
// =====================================================

// Supabase configuration
const SUPABASE_URL = 'https://xmowdtwlidnwnxrkrysj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables - preserve existing functionality
let capturedPhotoDataURL = null;
let isUsingCameraPhoto = false;
let currentStudentData = null;
let photoFile = null; // For file upload

// =====================================================
// 2. NEW: PIC_link PHOTO HANDLING FUNCTIONS
// =====================================================

/**
 * Load photo from Google Drive PIC_link
 * @param {string} picLink - Google Drive image link
 * @param {string} imgElementId - ID of image element to display
 * @returns {Promise<boolean>} - Success status
 */
async function loadPhotoFromDrive(picLink, imgElementId = 'photoPreview') {
    if (!picLink || picLink.trim() === '') {
        return false;
    }
    
    const imgElement = document.getElementById(imgElementId);
    const defaultIcon = document.getElementById('defaultPhotoIcon');
    
    if (!imgElement) return false;
    
    try {
        // Convert Google Drive link to direct image URL
        let imageUrl = picLink;
        
        // Extract file ID from various Google Drive URL formats
        let fileId = null;
        
        // Format 1: https://drive.google.com/file/d/FILE_ID/view
        const fileIdMatch = picLink.match(/\/d\/([^\/]+)/);
        if (fileIdMatch) {
            fileId = fileIdMatch[1];
        }
        
        // Format 2: https://drive.google.com/open?id=FILE_ID
        if (!fileId) {
            const openIdMatch = picLink.match(/[?&]id=([^&]+)/);
            if (openIdMatch) {
                fileId = openIdMatch[1];
            }
        }
        
        // Format 3: Direct download link
        if (!fileId) {
            const downloadMatch = picLink.match(/\/uc\?export=download&id=([^&]+)/);
            if (downloadMatch) {
                fileId = downloadMatch[1];
            }
        }
        
        if (fileId) {
            // Use Google Drive's direct download URL
            imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        
        // Test if the image can be loaded
        return new Promise((resolve) => {
            const testImg = new Image();
            testImg.crossOrigin = "anonymous";
            
            testImg.onload = function() {
                // Image loaded successfully
                if (imgElement) {
                    imgElement.src = imageUrl;
                    imgElement.classList.remove('hidden');
                    if (defaultIcon) defaultIcon.classList.add('hidden');
                }
                resolve(true);
            };
            
            testImg.onerror = function() {
                console.warn('Failed to load image from PIC_link:', picLink);
                // Try alternative URL format
                tryAlternativeUrl(picLink, imgElement, defaultIcon, resolve);
            };
            
            // Set a timeout in case the image hangs
            setTimeout(() => {
                if (!testImg.complete) {
                    tryAlternativeUrl(picLink, imgElement, defaultIcon, resolve);
                }
            }, 5000);
            
            testImg.src = imageUrl;
        });
    } catch (error) {
        console.error('Error loading photo from drive:', error);
        return false;
    }
}

/**
 * Try alternative URL formats for Google Drive
 */
function tryAlternativeUrl(picLink, imgElement, defaultIcon, resolve) {
    try {
        let fileId = null;
        const fileIdMatch = picLink.match(/\/d\/([^\/]+)/);
        if (fileIdMatch) {
            fileId = fileIdMatch[1];
        } else {
            const openIdMatch = picLink.match(/[?&]id=([^&]+)/);
            if (openIdMatch) {
                fileId = openIdMatch[1];
            }
        }
        
        if (fileId) {
            // Try with a different Google Drive URL format
            const altUrl = `https://lh3.googleusercontent.com/d/${fileId}=w200-h200`;
            const testImg2 = new Image();
            testImg2.onload = function() {
                if (imgElement) {
                    imgElement.src = altUrl;
                    imgElement.classList.remove('hidden');
                    if (defaultIcon) defaultIcon.classList.add('hidden');
                }
                resolve(true);
            };
            testImg2.onerror = function() {
                // Fallback: show default icon
                if (imgElement) {
                    imgElement.classList.add('hidden');
                }
                if (defaultIcon) defaultIcon.classList.remove('hidden');
                resolve(false);
            };
            testImg2.src = altUrl;
        } else {
            // No file ID found, show default icon
            if (imgElement) {
                imgElement.classList.add('hidden');
            }
            if (defaultIcon) defaultIcon.classList.remove('hidden');
            resolve(false);
        }
    } catch (e) {
        // Fallback: show default icon
        if (imgElement) {
            imgElement.classList.add('hidden');
        }
        if (defaultIcon) defaultIcon.classList.remove('hidden');
        resolve(false);
    }
}

/**
 * Get photo URL from various sources (PIC_link, file, camera)
 */
function getPhotoUrl() {
    // Check if using PIC_link
    const picLinkInput = document.getElementById('picLinkInput');
    if (picLinkInput && picLinkInput.value.trim() !== '') {
        // Try to get direct URL
        const link = picLinkInput.value.trim();
        let fileId = null;
        const fileIdMatch = link.match(/\/d\/([^\/]+)/);
        if (fileIdMatch) {
            fileId = fileIdMatch[1];
        }
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        return link;
    }
    
    // Check if using captured photo
    if (capturedPhotoDataURL) {
        return capturedPhotoDataURL;
    }
    
    // Check if using file upload
    const preview = document.getElementById('photoPreview');
    if (preview && !preview.classList.contains('hidden') && preview.src) {
        return preview.src;
    }
    
    return null;
}

// =====================================================
// 3. PRESERVED: PHOTO FILE HANDLING (Modified to support PIC_link)
// =====================================================

function handlePhotoFileSelection() {
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('photoPreview');
    const defaultIcon = document.getElementById('defaultPhotoIcon');
    const photoSizeInfo = document.getElementById('photoSizeInfo');
    
    if (!photoInput) return;
    
    photoInput.addEventListener('change', function(e) {
        const file = this.files[0];
        if (!file) return;
        
        // Check file size (max 50KB)
        if (file.size > 50 * 1024) {
            photoSizeInfo.textContent = '⚠️ រូបភាពធំពេក! សូមប្រើរូបភាពតូចជាង 50KB';
            photoSizeInfo.classList.remove('hidden');
            this.value = ''; // Clear the input
            return;
        }
        
        photoSizeInfo.textContent = `✅ ទំហំ: ${(file.size / 1024).toFixed(1)} KB`;
        photoSizeInfo.classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            defaultIcon.classList.add('hidden');
            capturedPhotoDataURL = null; // Clear captured photo when file is selected
            isUsingCameraPhoto = false;
            photoFile = file;
            
            // Clear PIC_link input if file is selected
            const picLinkInput = document.getElementById('picLinkInput');
            if (picLinkInput) {
                picLinkInput.value = '';
            }
        };
        reader.readAsDataURL(file);
    });
}

// =====================================================
// 4. PRESERVED: CAMERA FUNCTIONALITY (Unchanged)
// =====================================================

async function initCamera() {
    const video = document.getElementById('video');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        video.srcObject = stream;
        return stream;
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('មិនអាចបើកកាមេរ៉ាបានទេ');
        return null;
    }
}

function setupCamera() {
    const modal = document.getElementById('cameraModal');
    const openBtn = document.getElementById('openCameraBtn');
    const closeBtn = document.getElementById('closeCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakePhotoBtn');
    const confirmBtn = document.getElementById('confirmPhotoBtn');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const capturedContainer = document.getElementById('capturedPhotoContainer');
    const previewImg = document.getElementById('capturedPhotoPreview');
    
    if (!openBtn) return;
    
    let stream = null;
    let capturedImageData = null;
    
    // Open camera modal
    openBtn.addEventListener('click', async function() {
        modal.classList.add('active');
        capturedContainer.classList.add('hidden');
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        
        stream = await initCamera();
        if (!stream) {
            modal.classList.remove('active');
        }
    });
    
    // Close camera modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
    });
    
    // Capture photo
    captureBtn.addEventListener('click', function() {
        if (!stream) return;
        
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Compress image to 4x6 ratio and under 50KB
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        
        // Resize to 4x6 ratio (width:height = 2:3)
        const img = new Image();
        img.onload = function() {
            let w, h;
            if (img.width / img.height > 2/3) {
                w = img.height * 2/3;
                h = img.height;
            } else {
                w = img.width;
                h = img.width * 3/2;
            }
            
            canvas.width = w;
            canvas.height = h;
            context.drawImage(img, 0, 0, w, h);
            
            // Reduce quality until under 50KB
            let quality = 0.8;
            let finalData = canvas.toDataURL('image/jpeg', quality);
            while (finalData.length > 50 * 1024 && quality > 0.1) {
                quality -= 0.05;
                finalData = canvas.toDataURL('image/jpeg', quality);
            }
            
            capturedImageData = finalData;
            previewImg.src = finalData;
            capturedContainer.classList.remove('hidden');
            video.style.display = 'none';
            captureBtn.style.display = 'none';
            
            // Show photo size info
            const sizeKB = (finalData.length / 1024).toFixed(1);
            const photoSizeInfo = document.getElementById('photoSizeInfo');
            if (photoSizeInfo) {
                photoSizeInfo.textContent = `✅ រូបថតពីកាមេរ៉ា: ${sizeKB} KB`;
                photoSizeInfo.classList.remove('hidden');
            }
            
            // Clear PIC_link input if using camera
            const picLinkInput = document.getElementById('picLinkInput');
            if (picLinkInput) {
                picLinkInput.value = '';
            }
        };
        img.src = imageData;
    });
    
    // Retake photo
    retakeBtn.addEventListener('click', function() {
        capturedContainer.classList.add('hidden');
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        capturedImageData = null;
    });
    
    // Confirm photo
    confirmBtn.addEventListener('click', function() {
        if (!capturedImageData) return;
        
        // Set the photo preview
        const preview = document.getElementById('photoPreview');
        const defaultIcon = document.getElementById('defaultPhotoIcon');
        preview.src = capturedImageData;
        preview.classList.remove('hidden');
        defaultIcon.classList.add('hidden');
        
        // Store captured photo data
        capturedPhotoDataURL = capturedImageData;
        isUsingCameraPhoto = true;
        photoFile = null; // Clear file
        
        // Clear PIC_link input
        const picLinkInput = document.getElementById('picLinkInput');
        if (picLinkInput) {
            picLinkInput.value = '';
        }
        
        // Close modal
        modal.classList.remove('active');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        
        // Clear file input
        document.getElementById('photo').value = '';
    });
}

// =====================================================
// 5. PRESERVED: STUDENT DATA FETCHING (Modified for PIC_link)
// =====================================================

async function fetchStudentData(studentId) {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();
        
        if (error) {
            console.error('Error fetching student:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function displayStudentData(studentData) {
    if (!studentData) {
        alert('មិនឃើញទិន្នន័យសិស្សនេះទេ');
        return;
    }
    
    currentStudentData = studentData;
    
    // Fill form fields
    document.getElementById('studentID').value = studentData.id || '';
    document.getElementById('name').value = studentData.name || '';
    document.getElementById('sex').value = studentData.sex || 'ប្រុស';
    document.getElementById('date_of_birth').value = studentData.date_of_birth || '';
    document.getElementById('phonenumber').value = studentData.phonenumber || '';
    document.getElementById('class').value = studentData.class || '';
    document.getElementById('address').value = studentData.address || '';
    document.getElementById('fathername').value = studentData.fathername || '';
    document.getElementById('fatherphone').value = studentData.fatherphone || '';
    document.getElementById('fatherjob').value = studentData.fatherjob || '';
    document.getElementById('mothername').value = studentData.mothername || '';
    document.getElementById('motherphone').value = studentData.motherphone || '';
    document.getElementById('motherjob').value = studentData.motherjob || '';
    
    // NEW: Handle photo from PIC_link
    if (studentData.PIC_link && studentData.PIC_link.trim() !== '') {
        // Set PIC_link input
        const picLinkInput = document.getElementById('picLinkInput');
        if (picLinkInput) {
            picLinkInput.value = studentData.PIC_link;
        }
        // Load photo from Google Drive
        await loadPhotoFromDrive(studentData.PIC_link, 'photoPreview');
        // Clear other photo sources
        capturedPhotoDataURL = null;
        isUsingCameraPhoto = false;
        photoFile = null;
        document.getElementById('photo').value = '';
    } else {
        // No PIC_link, check if there's a photo from other sources
        const preview = document.getElementById('photoPreview');
        const defaultIcon = document.getElementById('defaultPhotoIcon');
        if (preview && !preview.classList.contains('hidden')) {
            // Keep existing photo
        } else {
            // Show default icon
            if (preview) preview.classList.add('hidden');
            if (defaultIcon) defaultIcon.classList.remove('hidden');
        }
    }
    
    // Update the card preview
    generateStudentCard(studentData);
}

// =====================================================
// 6. PRESERVED: CARD GENERATION (Modified to support PIC_link)
// =====================================================

function generateStudentCard(studentData) {
    const cardContainer = document.getElementById('studentCard');
    
    if (!studentData) {
        cardContainer.innerHTML = `
            <div class="text-gray-400 text-center py-10">
                <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                </svg>
                <p>បំពេញព័ត៌មានសិស្ស ឬស្វែងរក</p>
            </div>
        `;
        return;
    }
    
    // Get photo URL
    let photoUrl = getPhotoUrl();
    
    // If no photo URL, try from studentData.PIC_link
    if (!photoUrl && studentData.PIC_link) {
        let fileId = null;
        const fileIdMatch = studentData.PIC_link.match(/\/d\/([^\/]+)/);
        if (fileIdMatch) {
            fileId = fileIdMatch[1];
        }
        if (fileId) {
            photoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        } else {
            photoUrl = studentData.PIC_link;
        }
    }
    
    // Generate QR code (preserved functionality)
    let qrCodeSvg = '';
    try {
        const qrData = JSON.stringify({
            id: studentData.id,
            name: studentData.name,
            class: studentData.class || ''
        });
        // Use the QRCode library
        if (typeof QRCode !== 'undefined') {
            const canvas = document.createElement('canvas');
            QRCode.toCanvas(canvas, qrData, {
                width: 60,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function(error) {
                if (error) {
                    console.warn('QR code generation failed:', error);
                } else {
                    qrCodeSvg = canvas.outerHTML;
                }
            });
        }
    } catch (e) {
        console.warn('QR code generation failed:', e);
    }
    
    // Build the card HTML
    const cardHTML = `
        <div class="student-card" style="width: 100%; max-width: 400px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); overflow: hidden; border: 2px solid #d97706;">
            <div style="background: linear-gradient(135deg, #fbbf24, #d97706); padding: 12px; text-align: center;">
                <h3 style="color: white; font-size: 18px; margin: 0; font-weight: bold;">កាតសិស្ស</h3>
                <p style="color: #fef3c7; font-size: 12px; margin: 0;">Student ID Card</p>
            </div>
            
            <div style="display: flex; padding: 16px; gap: 16px;">
                <!-- Photo Section -->
                <div style="flex-shrink: 0;">
                    <div style="width: 120px; height: 120px; border-radius: 8px; overflow: hidden; border: 2px solid #d97706; background: #f3f4f6;">
                        ${photoUrl ? `<img src="${photoUrl}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;" crossOrigin="anonymous">` : 
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px;">គ្មានរូប</div>`}
                    </div>
                    <!-- QR Code -->
                    <div style="margin-top: 8px; display: flex; justify-content: center;">
                        ${qrCodeSvg || `<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 4px;"></div>`}
                    </div>
                </div>
                
                <!-- Info Section -->
                <div style="flex: 1; font-size: 13px;">
                    <div style="margin-bottom: 4px;"><strong>ID:</strong> ${studentData.id || '-'}</div>
                    <div style="margin-bottom: 4px;"><strong>ឈ្មោះ:</strong> ${studentData.name || '-'}</div>
                    <div style="margin-bottom: 4px;"><strong>ភេទ:</strong> ${studentData.sex || '-'}</div>
                    <div style="margin-bottom: 4px;"><strong>ថ្ងៃកំណើត:</strong> ${studentData.date_of_birth || '-'}</div>
                    <div style="margin-bottom: 4px;"><strong>ថ្នាក់:</strong> ${studentData.class || '-'}</div>
                    <div style="margin-bottom: 4px;"><strong>ទូរស័ព្ទ:</strong> ${studentData.phonenumber || '-'}</div>
                    <div style="margin-bottom: 4px;"><strong>អាសយដ្ឋាន:</strong> ${studentData.address || '-'}</div>
                    <hr style="margin: 6px 0; border-color: #fcd34d;">
                    <div style="font-size: 12px; color: #6b7280;">
                        <div><strong>ឪពុក:</strong> ${studentData.fathername || '-'}</div>
                        <div><strong>ម្តាយ:</strong> ${studentData.mothername || '-'}</div>
                    </div>
                    ${studentData.PIC_link ? `<div style="font-size: 9px; color: #9ca3af; margin-top: 4px;">📎 ${studentData.PIC_link.substring(0, 30)}...</div>` : ''}
                </div>
            </div>
            
            <div style="background: #fef3c7; padding: 8px; text-align: center; font-size: 10px; color: #92400e; border-top: 1px solid #fcd34d;">
                ចេញថ្ងៃទី ${new Date().toLocaleDateString('km-KH')}
            </div>
        </div>
    `;
    
    cardContainer.innerHTML = cardHTML;
}

// =====================================================
// 7. PRESERVED: SAVE STUDENT DATA (Modified to include PIC_link)
// =====================================================

async function saveStudentData() {
    // Collect form data
    const studentData = {
        id: document.getElementById('studentID').value.trim(),
        name: document.getElementById('name').value.trim(),
        sex: document.getElementById('sex').value,
        date_of_birth: document.getElementById('date_of_birth').value,
        phonenumber: document.getElementById('phonenumber').value.trim(),
        class: document.getElementById('class').value.trim(),
        address: document.getElementById('address').value.trim(),
        fathername: document.getElementById('fathername').value.trim(),
        fatherphone: document.getElementById('fatherphone').value.trim(),
        fatherjob: document.getElementById('fatherjob').value.trim(),
        mothername: document.getElementById('mothername').value.trim(),
        motherphone: document.getElementById('motherphone').value.trim(),
        motherjob: document.getElementById('motherjob').value.trim()
    };
    
    // NEW: Handle PIC_link
    const picLinkInput = document.getElementById('picLinkInput');
    if (picLinkInput && picLinkInput.value.trim() !== '') {
        studentData.PIC_link = picLinkInput.value.trim();
    } else {
        studentData.PIC_link = null; // Clear if no link
    }
    
    // Validate required fields
    if (!studentData.id || !studentData.name) {
        alert('សូមបញ្ចូលអត្តលេខ និងឈ្មោះសិស្ស');
        return;
    }
    
    try {
        // Save to Supabase
        const { data, error } = await supabase
            .from('students')
            .upsert(studentData, { onConflict: 'id' });
        
        if (error) {
            console.error('Error saving student:', error);
            alert('មានបញ្ហាក្នុងការរក្សាទុក: ' + error.message);
            return;
        }
        
        alert('✅ រក្សាទុកជោគជ័យ!');
        
        // Generate card with the saved data
        await generateStudentCard(studentData);
        
    } catch (error) {
        console.error('Error:', error);
        alert('មានបញ្ហាក្នុងការរក្សាទុក');
    }
}

// =====================================================
// 8. PRESERVED: PRINT & DOWNLOAD FUNCTIONS (Unchanged)
// =====================================================

function setupPrintAndDownload() {
    const printBtn = document.getElementById('printCard');
    const downloadBtn = document.getElementById('downloadCard');
    
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            const cardContent = document.querySelector('#studentCard .student-card');
            if (!cardContent) {
                alert('សូមបង្កើតកាតសិស្សមុនពេលបោះពុម្ព');
                return;
            }
            
            const printWindow = window.open('', '_blank', 'width=600,height=800');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>បោះពុម្ពកាតសិស្ស</title>
                        <style>
                            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>
                        ${cardContent.outerHTML}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 1000);
                            };
                        <\/script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const cardElement = document.querySelector('#studentCard .student-card');
            if (!cardElement) {
                alert('សូមបង្កើតកាតសិស្សមុនពេលទាញយក');
                return;
            }
            
            if (typeof html2canvas === 'undefined') {
                alert('បណ្ណាល័យ html2canvas មិនត្រូវបានផ្ទុកទេ');
                return;
            }
            
            html2canvas(cardElement, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `student-card-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(error => {
                console.error('Error generating image:', error);
                alert('មានបញ្ហាក្នុងការទាញយករូបភាព');
            });
        });
    }
}

// =====================================================
// 9. PRESERVED: SEARCH FUNCTIONALITY (Unchanged)
// =====================================================

function setupSearch() {
    const fetchBtn = document.getElementById('fetchStudentBtn');
    const searchInput = document.getElementById('searchStudentID');
    
    if (fetchBtn) {
        fetchBtn.addEventListener('click', async function() {
            const searchId = searchInput.value.trim();
            if (!searchId) {
                alert('សូមបញ្ចូលអត្តលេខសិស្ស');
                return;
            }
            
            const studentData = await fetchStudentData(searchId);
            if (studentData) {
                await displayStudentData(studentData);
            } else {
                alert('មិនឃើញសិស្សដែលមានអត្តលេខនេះទេ');
            }
        });
    }
    
    // Search on Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (fetchBtn) fetchBtn.click();
            }
        });
    }
}

// =====================================================
// 10. NEW: PIC_link INPUT HANDLING
// =====================================================

function setupPicLinkHandling() {
    const picLinkInput = document.getElementById('picLinkInput');
    if (!picLinkInput) return;
    
    // Load photo when input changes
    picLinkInput.addEventListener('change', function() {
        if (this.value.trim() !== '') {
            loadPhotoFromDrive(this.value.trim(), 'photoPreview');
            // Clear other photo sources
            capturedPhotoDataURL = null;
            isUsingCameraPhoto = false;
            photoFile = null;
            document.getElementById('photo').value = '';
            
            // Hide default icon
            const defaultIcon = document.getElementById('defaultPhotoIcon');
            if (defaultIcon) defaultIcon.classList.add('hidden');
        }
    });
    
    // Also load when typing (with debounce)
    let timeoutId = null;
    picLinkInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (this.value.trim() !== '') {
                loadPhotoFromDrive(this.value.trim(), 'photoPreview');
            }
        }, 500);
    });
}

// =====================================================
// 11. INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    // Setup photo file handling
    handlePhotoFileSelection();
    
    // Setup camera
    setupCamera();
    
    // Setup search
    setupSearch();
    
    // Setup print and download
    setupPrintAndDownload();
    
    // Setup PIC_link handling (NEW)
    setupPicLinkHandling();
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveStudentData);
    }
    
    // NEW: Add PIC_link input field if not exists
    const form = document.getElementById('studentForm');
    if (form && !document.getElementById('picLinkInput')) {
        const picLinkDiv = document.createElement('div');
        picLinkDiv.className = 'mt-4';
        picLinkDiv.innerHTML = `
            <label class="block text-sm font-medium text-gray-700">🔗 Google Drive Link (PIC_link)</label>
            <input type="url" id="picLinkInput" class="mt-1 block w-full rounded-md border p-2" placeholder="https://drive.google.com/file/d/...">
            <p class="text-xs text-gray-500 mt-1">បិទភ្ជាប់តំណ Google Drive នៃរូបភាពសិស្ស</p>
        `;
        form.insertBefore(picLinkDiv, form.querySelector('.flex.space-x-4.mt-6'));
        
        // Setup PIC_link handling after adding the input
        setupPicLinkHandling();
    }
    
    console.log('✅ Create Card page initialized with PIC_link support');
    console.log('🔗 Supabase connected to:', SUPABASE_URL);
});
