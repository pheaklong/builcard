// ============ SUPABASE CONFIGURATION ============
const SUPABASE_URL = 'https://xmowdtwlidnwnxrkrysj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb3dkdHdsaWRud254cmtyeXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzI2MDAsImV4cCI6MjA5NjAwODYwMH0.p22ZAL4oRIMVd9xYotVhRcWDICLqVp_LTj_AszA9JAA';

// Initialize Supabase client
let supabaseClient;

try {
    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
        supabaseClient = window.supabaseClient;
        console.log('✅ Using existing supabase client');
    } else if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created from window.supabase');
    } else if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created from global supabase');
    } else {
        throw new Error('Supabase library not found');
    }
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabaseClient = {
        from: () => { throw new Error('Supabase client not initialized'); }
    };
}

window.supabaseClient = supabaseClient;

const TABLE_NAME = 'table_student';

// Global variables
let currentPhotoBase64 = null;
let capturedPhotoData = null;

// ============ PIC_link FUNCTIONS ============

/**
 * Extract Google Drive File ID from various URL formats
 */
function extractFileId(picLink) {
    if (!picLink || picLink.trim() === '') {
        return null;
    }
    
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
    
    // Format 3: /uc?export=download&id=FILE_ID
    if (!fileId) {
        const downloadMatch = picLink.match(/\/uc\?export=download&id=([^&]+)/);
        if (downloadMatch) {
            fileId = downloadMatch[1];
        }
    }
    
    // Format 4: /thumbnail?id=FILE_ID
    if (!fileId) {
        const thumbnailMatch = picLink.match(/thumbnail\?id=([^&]+)/);
        if (thumbnailMatch) {
            fileId = thumbnailMatch[1];
        }
    }
    
    return fileId;
}

/**
 * Get direct image URL from Google Drive (thumbnail - best for CORS)
 */
function getDirectImageUrl(picLink) {
    if (!picLink || picLink.trim() === '') {
        return null;
    }
    
    const fileId = extractFileId(picLink);
    
    if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}=w400-h400`;
    }
    
    return picLink;
}

/**
 * Get multiple image URLs for fallback
 */
function getImageUrls(picLink) {
    if (!picLink || picLink.trim() === '') {
        return [];
    }
    
    const fileId = extractFileId(picLink);
    
    if (fileId) {
        return [
            `https://lh3.googleusercontent.com/d/${fileId}=w400-h400`,
            `https://lh3.googleusercontent.com/d/${fileId}=w200-h200`,
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`
        ];
    }
    
    return [picLink];
}

// ============ GET URL PARAMETERS ============
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ============ LOAD STUDENT FROM URL ============
async function loadStudentFromUrl() {
    const studentID = getUrlParameter('studentID');
    if (studentID) {
        console.log('📥 Loading student from URL:', studentID);
        document.getElementById('searchStudentID').value = studentID;
        await searchStudentById(studentID);
    }
}

// ============ SEARCH STUDENT BY ID ============
async function searchStudentById(studentID) {
    try {
        if (!supabaseClient || typeof supabaseClient.from !== 'function') {
            alert('❌ Supabase client not initialized. Please refresh the page.');
            return false;
        }

        console.log('🔍 Searching for student:', studentID);
        
        const { data, error } = await supabaseClient
            .from(TABLE_NAME)
            .select('*')
            .eq('studentID', studentID)
            .maybeSingle();
        
        if (error) {
            console.error('❌ Search error:', error);
            alert('❌ កំហុសក្នុងការស្វែងរក: ' + error.message);
            return false;
        }
        
        if (!data) {
            alert('❌ រកមិនឃើញសិស្សដែលមានលេខ ID: ' + studentID);
            return false;
        }
        
        console.log('✅ Found student:', data.name);
        
        // Fill form
        document.getElementById('studentID').value = data.studentID || '';
        document.getElementById('name').value = data.name || '';
        document.getElementById('sex').value = data.sex || 'ប្រុស';
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
        
        // Handle PIC_link
        const picLinkInput = document.getElementById('picLinkInput');
        if (data.PIC_link && data.PIC_link !== 'null' && data.PIC_link !== '') {
            console.log('📸 Found PIC_link:', data.PIC_link);
            if (picLinkInput) {
                picLinkInput.value = data.PIC_link;
            }
            // Load photo from PIC_link
            await loadPhotoFromPICLink(data.PIC_link, 'photoPreview');
        } else {
            // No PIC_link, check for stored photo
            if (data.photo && data.photo !== 'null' && data.photo !== '') {
                currentPhotoBase64 = data.photo;
                const preview = document.getElementById('photoPreview');
                const defaultIcon = document.getElementById('defaultPhotoIcon');
                if (preview) {
                    preview.src = currentPhotoBase64;
                    preview.classList.remove('hidden');
                }
                if (defaultIcon) {
                    defaultIcon.classList.add('hidden');
                }
                console.log('📸 Photo loaded from database');
            } else {
                resetPhotoPreview();
                if (picLinkInput) {
                    picLinkInput.value = '';
                }
            }
        }
        
        // Display card
        displayCard(data);
        return true;
        
    } catch (error) {
        console.error('❌ Search error:', error);
        alert('❌ កំហុស: ' + error.message);
        return false;
    }
}

// ============ LOAD PHOTO FROM PIC_LINK ============

/**
 * Load photo from PIC_link with multiple fallback URLs
 */
async function loadPhotoFromPICLink(picLink, imgElementId = 'photoPreview') {
    if (!picLink || picLink.trim() === '') {
        return false;
    }
    
    const imgElement = document.getElementById(imgElementId);
    const defaultIcon = document.getElementById('defaultPhotoIcon');
    
    if (!imgElement) {
        console.warn('Image element not found:', imgElementId);
        return false;
    }
    
    // Get all possible URLs
    const urls = getImageUrls(picLink);
    console.log('🖼️ Trying to load from PIC_link, URLs:', urls);
    
    return new Promise((resolve) => {
        let urlIndex = 0;
        let loaded = false;
        
        function tryNextUrl() {
            if (urlIndex >= urls.length || loaded) {
                if (!loaded) {
                    console.warn('⚠️ All URLs failed to load image');
                    imgElement.classList.add('hidden');
                    if (defaultIcon) {
                        defaultIcon.classList.remove('hidden');
                    }
                    resolve(false);
                }
                return;
            }
            
            const url = urls[urlIndex];
            console.log(`🔄 Trying URL ${urlIndex + 1}/${urls.length}:`, url);
            
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = function() {
                console.log('✅ Image loaded successfully from:', url);
                imgElement.src = url;
                imgElement.classList.remove('hidden');
                if (defaultIcon) {
                    defaultIcon.classList.add('hidden');
                }
                loaded = true;
                resolve(true);
            };
            
            img.onerror = function() {
                console.warn('❌ Failed to load from:', url);
                urlIndex++;
                tryNextUrl();
            };
            
            // Set timeout for each URL
            const timeoutId = setTimeout(() => {
                console.warn('⏰ Timeout for URL:', url);
                urlIndex++;
                tryNextUrl();
            }, 5000);
            
            img.src = url;
            
            // Store timeoutId to clear it if image loads
            img.__timeoutId = timeoutId;
            img.onload = function() {
                clearTimeout(timeoutId);
                console.log('✅ Image loaded successfully from:', url);
                imgElement.src = url;
                imgElement.classList.remove('hidden');
                if (defaultIcon) {
                    defaultIcon.classList.add('hidden');
                }
                loaded = true;
                resolve(true);
            };
        }
        
        tryNextUrl();
    });
}

// ============ CHECK TABLE ACCESS ============
async function checkTableAccess() {
    try {
        console.log('Checking table access for:', TABLE_NAME);
        const { data, error, count } = await supabaseClient
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .limit(1);
        
        if (error) {
            console.error('❌ Table access error:', error);
            if (error.code === '401' || error.message.includes('Unauthorized')) {
                alert('⚠️ គ្មានសិទ្ធិចូលប្រើ (401 Unauthorized)។ សូមពិនិត្យការកំណត់ RLS ។');
            } else {
                alert('⚠️ កំហុស: ' + error.message);
            }
            return false;
        }
        
        console.log('✅ Table access successful!');
        console.log('Total records:', count || 0);
        return true;
        
    } catch (error) {
        console.error('❌ Table access check failed:', error);
        alert('⚠️ កំហុស: ' + error.message);
        return false;
    }
}

// ============ IMAGE PROCESSING FUNCTIONS ============

async function resizeAndCompressImage(imageDataUrl, maxWidth = 400, maxHeight = 600, maxSizeKB = 50) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.onload = function() {
                const targetRatio = 2 / 3;
                let width = img.width;
                let height = img.height;
                let cropX = 0, cropY = 0, cropWidth = width, cropHeight = height;
                
                const currentRatio = width / height;
                if (currentRatio > targetRatio) {
                    cropWidth = height * targetRatio;
                    cropX = (width - cropWidth) / 2;
                } else if (currentRatio < targetRatio) {
                    cropHeight = width / targetRatio;
                    cropY = (height - cropHeight) / 2;
                }
                
                const cropCanvas = document.createElement('canvas');
                cropCanvas.width = cropWidth;
                cropCanvas.height = cropHeight;
                const cropCtx = cropCanvas.getContext('2d');
                cropCtx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                
                let resizedWidth = cropWidth;
                let resizedHeight = cropHeight;
                
                if (resizedWidth > maxWidth) {
                    resizedHeight = (maxWidth / resizedWidth) * resizedHeight;
                    resizedWidth = maxWidth;
                }
                if (resizedHeight > maxHeight) {
                    resizedWidth = (maxHeight / resizedHeight) * resizedWidth;
                    resizedHeight = maxHeight;
                }
                
                if (resizedWidth / resizedHeight > targetRatio) {
                    resizedWidth = resizedHeight * targetRatio;
                } else {
                    resizedHeight = resizedWidth / targetRatio;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(resizedWidth);
                canvas.height = Math.round(resizedHeight);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(cropCanvas, 0, 0, canvas.width, canvas.height);
                
                let quality = 0.9;
                let result = canvas.toDataURL('image/jpeg', quality);
                
                while (result.length > maxSizeKB * 1024 && quality > 0.1) {
                    quality -= 0.05;
                    result = canvas.toDataURL('image/jpeg', quality);
                }
                
                if (result.length > maxSizeKB * 1024) {
                    let scale = Math.sqrt((maxSizeKB * 1024) / result.length);
                    const smallCanvas = document.createElement('canvas');
                    smallCanvas.width = Math.round(canvas.width * scale);
                    smallCanvas.height = Math.round(canvas.height * scale);
                    const smallCtx = smallCanvas.getContext('2d');
                    smallCtx.imageSmoothingEnabled = true;
                    smallCtx.imageSmoothingQuality = 'high';
                    smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
                    result = smallCanvas.toDataURL('image/jpeg', 0.7);
                }
                
                const sizeKB = (result.length / 1024).toFixed(1);
                const sizeInfo = document.getElementById('photoSizeInfo');
                if (sizeInfo) {
                    sizeInfo.classList.remove('hidden');
                    sizeInfo.innerHTML = `📊 ទំហំ: ${sizeKB} KB | វិមាត្រ: ${Math.round(resizedWidth)}x${Math.round(resizedHeight)} px (4:6)`;
                    if (parseFloat(sizeKB) > maxSizeKB) {
                        sizeInfo.style.color = 'red';
                    } else {
                        sizeInfo.style.color = 'green';
                    }
                }
                
                resolve(result);
            };
            img.onerror = function() {
                reject(new Error('មិនអាចផ្ទុករូបភាពបាន'));
            };
            img.src = imageDataUrl;
        } catch (error) {
            reject(error);
        }
    });
}

// ============ CAMERA FUNCTIONS ============

let cameraStream = null;
let isCameraOpen = false;

async function openCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('❌ កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការប្រើប្រាស់កាមេរ៉ាទេ');
            return;
        }
        
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        
        const video = document.getElementById('video');
        video.srcObject = cameraStream;
        await video.play();
        
        const modal = document.getElementById('cameraModal');
        modal.classList.add('active');
        isCameraOpen = true;
        
        document.getElementById('capturedPhotoContainer').classList.add('hidden');
        document.getElementById('captureBtn').style.display = 'inline-block';
        
    } catch (error) {
        console.error('Camera error:', error);
        if (error.name === 'NotAllowedError') {
            alert('❌ សូមអនុញ្ញាតឲ្យប្រើប្រាស់កាមេរ៉ា');
        } else if (error.name === 'NotFoundError') {
            alert('❌ រកមិនឃើញកាមេរ៉ា');
        } else {
            alert('❌ កំហុស: ' + error.message);
        }
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    isCameraOpen = false;
    document.getElementById('cameraModal').classList.remove('active');
    document.getElementById('video').srcObject = null;
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    capturedPhotoData = imageData;
    
    const previewImg = document.getElementById('capturedPhotoPreview');
    previewImg.src = imageData;
    document.getElementById('capturedPhotoContainer').classList.remove('hidden');
    document.getElementById('captureBtn').style.display = 'none';
}

async function confirmPhoto() {
    if (!capturedPhotoData) {
        alert('សូមថតរូបជាមុនសិន');
        return;
    }
    
    try {
        const confirmBtn = document.getElementById('confirmPhotoBtn');
        confirmBtn.innerHTML = '⏳ កំពុងដំណើរការ...';
        confirmBtn.disabled = true;
        
        const resizedImage = await resizeAndCompressImage(capturedPhotoData);
        
        currentPhotoBase64 = resizedImage;
        const preview = document.getElementById('photoPreview');
        const defaultIcon = document.getElementById('defaultPhotoIcon');
        if (preview) {
            preview.src = resizedImage;
            preview.classList.remove('hidden');
        }
        if (defaultIcon) {
            defaultIcon.classList.add('hidden');
        }
        
        // Clear PIC_link when using camera
        const picLinkInput = document.getElementById('picLinkInput');
        if (picLinkInput) {
            picLinkInput.value = '';
        }
        
        closeCamera();
        capturedPhotoData = null;
        
        alert('✅ រូបភាពត្រូវបានថតដោយជោគជ័យ!');
        
    } catch (error) {
        console.error('Photo processing error:', error);
        alert('❌ កំហុស: ' + error.message);
    } finally {
        const confirmBtn = document.getElementById('confirmPhotoBtn');
        confirmBtn.innerHTML = '✅ យល់ព្រម';
        confirmBtn.disabled = false;
    }
}

function retakePhoto() {
    capturedPhotoData = null;
    document.getElementById('capturedPhotoContainer').classList.add('hidden');
    document.getElementById('captureBtn').style.display = 'inline-block';
}

// ============ PHOTO HANDLING ============
document.getElementById('photo')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    const resizedImage = await resizeAndCompressImage(event.target.result);
                    currentPhotoBase64 = resizedImage;
                    const preview = document.getElementById('photoPreview');
                    const defaultIcon = document.getElementById('defaultPhotoIcon');
                    if (preview) {
                        preview.src = resizedImage;
                        preview.classList.remove('hidden');
                    }
                    if (defaultIcon) {
                        defaultIcon.classList.add('hidden');
                    }
                    
                    const picLinkInput = document.getElementById('picLinkInput');
                    if (picLinkInput) {
                        picLinkInput.value = '';
                    }
                } catch (error) {
                    console.error('Image processing error:', error);
                    alert('❌ កំហុស: ' + error.message);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('File read error:', error);
            alert('❌ កំហុស: ' + error.message);
        }
    } else {
        resetPhotoPreview();
    }
});

function resetPhotoPreview() {
    currentPhotoBase64 = null;
    const preview = document.getElementById('photoPreview');
    const defaultIcon = document.getElementById('defaultPhotoIcon');
    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }
    if (defaultIcon) {
        defaultIcon.classList.remove('hidden');
    }
    const sizeInfo = document.getElementById('photoSizeInfo');
    if (sizeInfo) {
        sizeInfo.classList.add('hidden');
    }
}

// ============ CARD DISPLAY FUNCTIONS (UPDATED to use card-template.js) ============

/**
 * Display card using card-template.js
 * This uses the template from card-template.js file
 */
function displayCard(data) {
    const cardContainer = document.getElementById('studentCard');
    if (!cardContainer) {
        console.error('❌ Card container not found');
        return;
    }
    
    console.log('📇 Displaying card for student:', data.studentID || 'Unknown');
    console.log('📸 PIC_link:', data.PIC_link || 'None');
    console.log('📸 Photo stored:', data.photo ? 'Yes' : 'No');
    
    // Check if card-template.js is loaded and has generateCardHTML function
    if (typeof window.generateCardHTML === 'function') {
        console.log('✅ Using card-template.js template');
        
        // Prepare data for the template
        const cardData = {
            studentID: data.studentID || '',
            name: data.name || '',
            sex: data.sex || '',
            date_of_birth: data.date_of_birth || '',
            phonenumber: data.phonenumber || '',
            address: data.address || '',
            fathername: data.fathername || '',
            fatherphone: data.fatherphone || '',
            fatherjob: data.fatherjob || '',
            mothername: data.mothername || '',
            motherphone: data.motherphone || '',
            motherjob: data.motherjob || '',
            class: data.class || '',
            photo: data.photo || null,
            PIC_link: data.PIC_link || null
        };
        
        // Generate card HTML using the template
        const cardHTML = window.generateCardHTML(cardData);
        cardContainer.innerHTML = cardHTML;
        console.log('✅ Card displayed using card-template.js');
        
        // Load photo from PIC_link if available (for preview in the form)
        if (data.PIC_link && data.PIC_link !== 'null' && data.PIC_link !== '') {
            console.log('📸 Loading photo from PIC_link for preview:', data.PIC_link);
            loadPhotoFromPICLink(data.PIC_link, 'photoPreview');
        }
        
    } else {
        // Fallback: if card-template.js is not loaded, use local template
        console.warn('⚠️ generateCardHTML not found, using fallback');
        const fallbackHTML = generateFallbackCardHTML(data);
        cardContainer.innerHTML = fallbackHTML;
    }
}

/**
 * Fallback card generation if card-template.js is not loaded
 * This is the same template structure as your existing code
 */
function generateFallbackCardHTML(data) {
    const birthDate = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('km-KH') : 'N/A';
    
    // Get photo URL
    let photoUrl = null;
    if (data.PIC_link && data.PIC_link !== 'null' && data.PIC_link !== '') {
        photoUrl = getDirectImageUrl(data.PIC_link);
    } else if (data.photo && data.photo !== 'null' && data.photo !== '') {
        photoUrl = data.photo;
    }
    
    // Create photo HTML
    let photoHTML = '';
    if (photoUrl) {
        photoHTML = `<img src="${photoUrl}" alt="Student Photo" class="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" 
                         onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-500\\'><svg class=\\'w-10 h-10\\' fill=\\'currentColor\\' viewBox=\\'0 0 20 20\\'><path fill-rule=\\'evenodd\\' d=\\'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z\\' clip-rule=\\'evenodd\\'/></svg></div>'">`;
    } else {
        photoHTML = `<div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                        </svg>
                    </div>`;
    }
    
    return `
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-2xl overflow-hidden" style="width: 380px; font-family: 'Khmer', Arial, sans-serif;">
            <div class="bg-white p-4 text-center border-b-4 border-yellow-400">
                <h3 class="text-xl font-bold text-blue-800">កាតសម្គាល់សិស្ស</h3>
                <p class="text-sm text-gray-600">សាលារៀន​ ឌីជីថល</p>
            </div>
            
            <div class="p-4 text-white">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <p class="text-sm opacity-90">លេខសម្គាល់៖</p>
                        <p class="font-bold text-lg">${escapeHtml(data.studentID) || 'N/A'}</p>
                    </div>
                    ${photoHTML}
                </div>
                
                <div class="space-y-2 text-sm">
                    <div><p class="opacity-90">ឈ្មោះ៖</p><p class="font-semibold text-base">${escapeHtml(data.name) || 'N/A'}</p></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><p class="opacity-90">ភេទ៖</p><p>${escapeHtml(data.sex) || 'N/A'}</p></div>
                        <div><p class="opacity-90">ថ្ងៃខែកំណើត៖</p><p>${birthDate}</p></div>
                    </div>
                    <div><p class="opacity-90">ថ្នាក់៖</p><p class="font-medium">${escapeHtml(data.class) || 'N/A'}</p></div>
                    <div><p class="opacity-90">ទូរស័ព្ទ៖</p><p>${escapeHtml(data.phonenumber) || 'N/A'}</p></div>
                    <div><p class="opacity-90">អាសយដ្ឋាន៖</p><p class="text-xs">${escapeHtml(data.address) || 'N/A'}</p></div>
                </div>
                
                <hr class="my-3 border-white/30">
                
                <div class="text-xs space-y-1">
                    <p><span class="opacity-90">ឪពុក៖</span> ${escapeHtml(data.fathername) || 'N/A'} (${escapeHtml(data.fatherjob) || ''})</p>
                    <p><span class="opacity-90">ទូរស័ព្ទ៖</span> ${escapeHtml(data.fatherphone) || 'N/A'}</p>
                    <p><span class="opacity-90">ម្តាយ៖</span> ${escapeHtml(data.mothername) || 'N/A'} (${escapeHtml(data.motherjob) || ''})</p>
                    <p><span class="opacity-90">ទូរស័ព្ទ៖</span> ${escapeHtml(data.motherphone) || 'N/A'}</p>
                    ${data.PIC_link ? `<p class="text-xs opacity-70">📎 Google Drive</p>` : ''}
                </div>
            </div>
            
            <div class="bg-yellow-400 p-2 text-center text-xs font-bold text-blue-900">
                ចេញថ្ងៃទី: ${new Date().toLocaleDateString('km-KH')}
            </div>
        </div>
    `;
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============ SAVE STUDENT ============
async function saveStudent() {
    try {
        if (!supabaseClient || typeof supabaseClient.from !== 'function') {
            alert('❌ Supabase client not initialized. Please refresh the page.');
            return false;
        }

        // Get form values
        const studentData = {
            studentID: document.getElementById('studentID').value.trim(),
            name: document.getElementById('name').value.trim(),
            sex: document.getElementById('sex').value,
            date_of_birth: document.getElementById('date_of_birth').value || null,
            phonenumber: document.getElementById('phonenumber').value.trim(),
            address: document.getElementById('address').value.trim(),
            fathername: document.getElementById('fathername').value.trim(),
            fatherphone: document.getElementById('fatherphone').value.trim(),
            fatherjob: document.getElementById('fatherjob').value.trim(),
            mothername: document.getElementById('mothername').value.trim(),
            motherphone: document.getElementById('motherphone').value.trim(),
            motherjob: document.getElementById('motherjob').value.trim(),
            class: document.getElementById('class').value.trim()
        };
        
        // Get PIC_link from input (save only the link, not the image)
        const picLinkInput = document.getElementById('picLinkInput');
        if (picLinkInput && picLinkInput.value.trim() !== '') {
            studentData.PIC_link = picLinkInput.value.trim();
            console.log('📎 Saving PIC_link:', studentData.PIC_link);
        } else {
            studentData.PIC_link = null;
        }
        
        // Only save photo if it's from camera or file upload (not from PIC_link)
        if (currentPhotoBase64 && currentPhotoBase64 !== '') {
            studentData.photo = currentPhotoBase64;
            console.log('📸 Saving photo from camera/file');
        }
        
        // Validate required fields
        if (!studentData.studentID) {
            alert('សូមបញ្ចូល Student ID');
            return false;
        }
        if (!studentData.name) {
            alert('សូមបញ្ចូលឈ្មោះសិស្ស');
            return false;
        }
        
        console.log('Saving student:', studentData);
        
        // Check if student exists
        const { data: existing, error: findError } = await supabaseClient
            .from(TABLE_NAME)
            .select('*')
            .eq('studentID', studentData.studentID)
            .maybeSingle();
        
        if (findError && findError.code !== 'PGRST116') {
            console.error('Find error:', findError);
            alert('❌ កំហុស: ' + findError.message);
            return false;
        }
        
        let result;
        if (existing) {
            // Update - keep existing photo if not overwritten
            if (!studentData.photo && existing.photo) {
                studentData.photo = existing.photo;
            }
            
            result = await supabaseClient
                .from(TABLE_NAME)
                .update(studentData)
                .eq('studentID', studentData.studentID);
            
            if (!result.error) {
                alert('✅ បានកែប្រែព័ត៌មានសិស្សដោយជោគជ័យ!');
                displayCard(studentData);
                return true;
            } else {
                alert('❌ កំហុស: ' + result.error.message);
                return false;
            }
        } else {
            // Insert
            result = await supabaseClient
                .from(TABLE_NAME)
                .insert([studentData]);
            
            if (!result.error) {
                alert('✅ បានរក្សាទុកព័ត៌មានសិស្សដោយជោគជ័យ!');
                displayCard(studentData);
                return true;
            } else {
                alert('❌ កំហុស: ' + result.error.message);
                return false;
            }
        }
        
    } catch (error) {
        console.error('Save error:', error);
        alert('❌ កំហុសប្រព័ន្ធ: ' + error.message);
        return false;
    }
}

// ============ SEARCH STUDENT FROM INPUT ============
async function searchStudent() {
    const studentID = document.getElementById('searchStudentID').value.trim();
    if (!studentID) {
        alert('សូមបញ្ចូល Student ID');
        return;
    }
    await searchStudentById(studentID);
}

// ============ PRINT CARD ============
function printCard() {
    const cardContent = document.getElementById('studentCard').innerHTML;
    if (!cardContent || cardContent.includes('បំពេញព័ត៌មានសិស្ស')) {
        alert('មិនមានកាតដើម្បីបោះពុម្ពទេ');
        return;
    }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>បោះពុម្ពកាតសិស្ស</title>
                <meta charset="UTF-8">
                <style>
                    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: white; }
                </style>
            </head>
            <body>${cardContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ============ DOWNLOAD CARD ============
async function downloadCard() {
    const cardElement = document.querySelector('#studentCard > div');
    if (!cardElement || (cardElement.innerHTML && cardElement.innerHTML.includes('បំពេញព័ត៌មានសិស្ស'))) {
        alert('មិនមានកាតដើម្បីទាញយកទេ');
        return;
    }
    try {
        const canvas = await html2canvas(cardElement, { 
            scale: 2, 
            backgroundColor: null,
            logging: false
        });
        const link = document.createElement('a');
        const studentID = document.getElementById('studentID').value || 'card';
        link.download = `student_card_${studentID}.png`;
        link.href = canvas.toDataURL();
        link.click();
        alert('✅ បានទាញយករូបភាពដោយជោគជ័យ!');
    } catch (error) {
        console.error('Download error:', error);
        alert('កើតមានបញ្ហា: ' + error.message);
    }
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up event listeners...');
    console.log('TABLE_NAME:', TABLE_NAME);
    
    // Check if card-template.js is loaded
    console.log('card-template.js loaded:', typeof window.generateCardHTML === 'function');
    console.log('window.generateCardHTML:', window.generateCardHTML);
    
    // Save button
    document.getElementById('saveBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        saveStudent();
    });
    
    // Form submit
    document.getElementById('studentForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveStudent();
    });
    
    // Search button
    document.getElementById('fetchStudentBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        searchStudent();
    });
    
    // Print button
    document.getElementById('printCard')?.addEventListener('click', (e) => {
        e.preventDefault();
        printCard();
    });
    
    // Download button
    document.getElementById('downloadCard')?.addEventListener('click', (e) => {
        e.preventDefault();
        downloadCard();
    });
    
    // Camera buttons
    document.getElementById('openCameraBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        openCamera();
    });
    
    document.getElementById('closeCameraBtn')?.addEventListener('click', closeCamera);
    document.getElementById('captureBtn')?.addEventListener('click', capturePhoto);
    document.getElementById('confirmPhotoBtn')?.addEventListener('click', confirmPhoto);
    document.getElementById('retakePhotoBtn')?.addEventListener('click', retakePhoto);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isCameraOpen) {
            closeCamera();
        }
    });
    
    // PIC_link input event listener - load photo when pasted
    const picLinkInput = document.getElementById('picLinkInput');
    if (picLinkInput) {
        picLinkInput.addEventListener('change', function() {
            if (this.value.trim() !== '') {
                console.log('📎 PIC_link changed:', this.value);
                loadPhotoFromPICLink(this.value.trim(), 'photoPreview');
                // Clear camera/file photo when using PIC_link
                currentPhotoBase64 = null;
                document.getElementById('photo').value = '';
            } else {
                resetPhotoPreview();
            }
        });
        
        // Load when typing (with debounce)
        let timeoutId = null;
        picLinkInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (this.value.trim() !== '') {
                    loadPhotoFromPICLink(this.value.trim(), 'photoPreview');
                }
            }, 500);
        });
    }
    
    // Load student from URL parameter
    setTimeout(() => {
        loadStudentFromUrl();
    }, 500);
    
    // Check table access
    setTimeout(() => {
        checkTableAccess();
    }, 1500);
});

// Export functions for use in HTML
window.saveStudent = saveStudent;
window.searchStudent = searchStudent;
window.searchStudentById = searchStudentById;
window.loadStudentFromUrl = loadStudentFromUrl;
window.printCard = printCard;
window.downloadCard = downloadCard;
window.openCamera = openCamera;
window.closeCamera = closeCamera;
window.capturePhoto = capturePhoto;
window.confirmPhoto = confirmPhoto;
window.retakePhoto = retakePhoto;
window.supabaseClient = supabaseClient;
window.checkTableAccess = checkTableAccess;
window.displayCard = displayCard;
window.loadPhotoFromPICLink = loadPhotoFromPICLink;
window.extractFileId = extractFileId;
window.getDirectImageUrl = getDirectImageUrl;

console.log('✅ create-card.js loaded successfully');
