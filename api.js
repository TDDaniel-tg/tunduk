// API Configuration
const CONFIG = {
    IMGBB_API_KEY: '5feb3ce61eb21969bc8a62cbcd6fc7e3',
    JSONBIN_MASTER_KEY: '$2a$10$75xWT79jkSb0.65qkAebkeJQmIxGZBXiSNbTwsFrG5q9Do5EL1oY.',
    JSONBIN_BIN_ID: null // Will be set after first creation
};

// ImgBB API - Upload image
async function uploadToImgBB(base64Image) {
    // Remove data:image/...;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const formData = new FormData();
    formData.append('key', CONFIG.IMGBB_API_KEY);
    formData.append('image', base64Data);

    try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                url: data.data.url,
                deleteUrl: data.data.delete_url
            };
        } else {
            console.error('ImgBB error:', data);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

// JSONBin API - Get or create bin
async function getOrCreateBin() {
    const storedBinId = localStorage.getItem('jsonbin_id');

    if (storedBinId) {
        CONFIG.JSONBIN_BIN_ID = storedBinId;
        return storedBinId;
    }

    // Create new bin
    try {
        const response = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.JSONBIN_MASTER_KEY,
                'X-Bin-Name': 'driver-license-data'
            },
            body: JSON.stringify({ pages: {} })
        });

        const data = await response.json();

        if (data.metadata && data.metadata.id) {
            CONFIG.JSONBIN_BIN_ID = data.metadata.id;
            localStorage.setItem('jsonbin_id', data.metadata.id);
            return data.metadata.id;
        }
    } catch (error) {
        console.error('JSONBin create error:', error);
    }

    return null;
}

// JSONBin API - Get all data
async function getData() {
    const binId = await getOrCreateBin();
    if (!binId) return { pages: {} };

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: {
                'X-Master-Key': CONFIG.JSONBIN_MASTER_KEY
            }
        });

        const data = await response.json();
        return data.record || { pages: {} };
    } catch (error) {
        console.error('JSONBin read error:', error);
        return { pages: {} };
    }
}

// JSONBin API - Save data
async function saveData(data) {
    const binId = await getOrCreateBin();
    if (!binId) return false;

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.JSONBIN_MASTER_KEY
            },
            body: JSON.stringify(data)
        });

        return response.ok;
    } catch (error) {
        console.error('JSONBin save error:', error);
        return false;
    }
}

// Save page data (images URLs)
async function savePageData(pageId, frontUrl, backUrl, qrUrl) {
    const data = await getData();

    data.pages[pageId] = {
        front: frontUrl,
        back: backUrl,
        qr: qrUrl,
        updatedAt: new Date().toISOString()
    };

    return await saveData(data);
}

// Get page data
async function getPageData(pageId) {
    const data = await getData();
    return data.pages[pageId] || null;
}
