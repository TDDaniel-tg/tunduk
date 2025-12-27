// API Configuration
const CONFIG = {
    IMGBB_API_KEY: '5feb3ce61eb21969bc8a62cbcd6fc7e3',
    JSONBIN_MASTER_KEY: '$2a$10$75xWT79jkSb0.65qkAebkeJQmIxGZBXiSNbTwsFrG5q9Do5EL1oY.',
    JSONBIN_BIN_ID: '69502bbbd0ea881f4043d9c2' // Fixed bin ID for all devices
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

// JSONBin API - Get all data
async function getData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}/latest`, {
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
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}`, {
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
