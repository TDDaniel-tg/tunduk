// Settings page functionality with cloud upload
class SettingsManager {
    constructor() {
        this.pageId = new URLSearchParams(window.location.search).get('page') || '1';

        this.frontInput = document.getElementById('frontInput');
        this.backInput = document.getElementById('backInput');
        this.frontUploadArea = document.getElementById('frontUploadArea');
        this.backUploadArea = document.getElementById('backUploadArea');
        this.frontPreview = document.getElementById('frontPreview');
        this.backPreview = document.getElementById('backPreview');
        this.frontPreviewImage = document.getElementById('frontPreviewImage');
        this.backPreviewImage = document.getElementById('backPreviewImage');
        this.removeFrontBtn = document.getElementById('removeFront');
        this.removeBackBtn = document.getElementById('removeBack');
        this.saveBtn = document.getElementById('saveBtn');

        this.frontImageData = null;
        this.backImageData = null;
        this.frontUrl = null;
        this.backUrl = null;

        this.isUploading = false;

        this.init();
        this.loadExistingImages();
    }

    init() {
        this.frontUploadArea.addEventListener('click', () => this.frontInput.click());
        this.backUploadArea.addEventListener('click', () => this.backInput.click());

        this.frontInput.addEventListener('change', (e) => this.handleFileSelect(e, 'front'));
        this.backInput.addEventListener('change', (e) => this.handleFileSelect(e, 'back'));

        this.removeFrontBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage('front');
        });
        this.removeBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage('back');
        });

        this.saveBtn.addEventListener('click', () => this.saveImages());

        ['front', 'back'].forEach(side => {
            const area = side === 'front' ? this.frontUploadArea : this.backUploadArea;

            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.style.borderColor = '#165FBB';
                area.style.background = 'rgba(22, 95, 187, 0.03)';
            });

            area.addEventListener('dragleave', (e) => {
                e.preventDefault();
                area.style.borderColor = '#E0E0E0';
                area.style.background = 'transparent';
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.style.borderColor = '#E0E0E0';
                area.style.background = 'transparent';

                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.processFile(file, side);
                }
            });
        });
    }

    handleFileSelect(e, side) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file, side);
        }
    }

    processFile(file, side) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = e.target.result;

            if (side === 'front') {
                this.frontImageData = imageData;
                this.frontUrl = null; // Reset URL, will upload on save
                this.frontPreviewImage.src = imageData;
                this.frontPreviewImage.classList.add('visible');
                this.frontPreview.classList.add('hidden');
                this.frontUploadArea.classList.add('has-image');
                this.removeFrontBtn.style.display = 'flex';
            } else {
                this.backImageData = imageData;
                this.backUrl = null;
                this.backPreviewImage.src = imageData;
                this.backPreviewImage.classList.add('visible');
                this.backPreview.classList.add('hidden');
                this.backUploadArea.classList.add('has-image');
                this.removeBackBtn.style.display = 'flex';
            }
        };

        reader.readAsDataURL(file);
    }

    removeImage(side) {
        if (side === 'front') {
            this.frontImageData = null;
            this.frontUrl = null;
            this.frontPreviewImage.src = '';
            this.frontPreviewImage.classList.remove('visible');
            this.frontPreview.classList.remove('hidden');
            this.frontUploadArea.classList.remove('has-image');
            this.removeFrontBtn.style.display = 'none';
            this.frontInput.value = '';
        } else {
            this.backImageData = null;
            this.backUrl = null;
            this.backPreviewImage.src = '';
            this.backPreviewImage.classList.remove('visible');
            this.backPreview.classList.remove('hidden');
            this.backUploadArea.classList.remove('has-image');
            this.removeBackBtn.style.display = 'none';
            this.backInput.value = '';
        }
    }

    async loadExistingImages() {
        try {
            const pageData = await getPageData(this.pageId);

            if (pageData) {
                if (pageData.front) {
                    this.frontUrl = pageData.front;
                    this.frontPreviewImage.src = pageData.front;
                    this.frontPreviewImage.classList.add('visible');
                    this.frontPreview.classList.add('hidden');
                    this.frontUploadArea.classList.add('has-image');
                    this.removeFrontBtn.style.display = 'flex';
                }

                if (pageData.back) {
                    this.backUrl = pageData.back;
                    this.backPreviewImage.src = pageData.back;
                    this.backPreviewImage.classList.add('visible');
                    this.backPreview.classList.add('hidden');
                    this.backUploadArea.classList.add('has-image');
                    this.removeBackBtn.style.display = 'flex';
                }
            }
        } catch (error) {
            console.error('Error loading existing images:', error);
        }
    }

    async saveImages() {
        if (this.isUploading) return;

        this.isUploading = true;
        this.saveBtn.textContent = 'Жүктөлүүдө...';
        this.saveBtn.disabled = true;

        try {
            // Upload front image if new
            if (this.frontImageData && !this.frontUrl) {
                this.showToast('Алдыңкы сүрөт жүктөлүүдө...');
                const result = await uploadToImgBB(this.frontImageData);
                if (result.success) {
                    this.frontUrl = result.url;
                } else {
                    throw new Error('Front image upload failed');
                }
            }

            // Upload back image if new
            if (this.backImageData && !this.backUrl) {
                this.showToast('Арткы сүрөт жүктөлүүдө...');
                const result = await uploadToImgBB(this.backImageData);
                if (result.success) {
                    this.backUrl = result.url;
                } else {
                    throw new Error('Back image upload failed');
                }
            }

            // Save to JSONBin
            this.showToast('Маалыматтар сакталууда...');
            const saved = await savePageData(this.pageId, this.frontUrl, this.backUrl, null);

            if (saved) {
                this.showToast('Ийгиликтүү сакталды!');
                setTimeout(() => {
                    window.location.href = `index.html?page=${this.pageId}`;
                }, 1500);
            } else {
                throw new Error('Failed to save data');
            }

        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Ката кетти: ' + error.message);
        } finally {
            this.isUploading = false;
            this.saveBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Сактоо
            `;
            this.saveBtn.disabled = false;
        }
    }

    showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
