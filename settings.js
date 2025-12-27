// Update time in status bar
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
}

// Set random battery level
function setBatteryLevel() {
    const level = Math.floor(Math.random() * 101);
    const batteryLevelEl = document.getElementById('batteryLevel');
    const batteryPercentEl = document.getElementById('batteryPercent');

    batteryLevelEl.style.width = `${level}%`;
    batteryPercentEl.textContent = level;

    if (level <= 20) {
        batteryLevelEl.style.background = '#EF5350';
    } else if (level <= 50) {
        batteryLevelEl.style.background = '#FFA726';
    } else {
        batteryLevelEl.style.background = '#66BB6A';
    }
}

// Settings page functionality
class SettingsManager {
    constructor() {
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
                area.style.borderColor = '#1976D2';
                area.style.background = 'rgba(25, 118, 210, 0.03)';
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
                this.frontPreviewImage.src = imageData;
                this.frontPreviewImage.classList.add('visible');
                this.frontPreview.classList.add('hidden');
                this.frontUploadArea.classList.add('has-image');
                this.removeFrontBtn.style.display = 'flex';
            } else {
                this.backImageData = imageData;
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
            this.frontPreviewImage.src = '';
            this.frontPreviewImage.classList.remove('visible');
            this.frontPreview.classList.remove('hidden');
            this.frontUploadArea.classList.remove('has-image');
            this.removeFrontBtn.style.display = 'none';
            this.frontInput.value = '';
            localStorage.removeItem('driverLicense_front');
        } else {
            this.backImageData = null;
            this.backPreviewImage.src = '';
            this.backPreviewImage.classList.remove('visible');
            this.backPreview.classList.remove('hidden');
            this.backUploadArea.classList.remove('has-image');
            this.removeBackBtn.style.display = 'none';
            this.backInput.value = '';
            localStorage.removeItem('driverLicense_back');
        }
    }

    loadExistingImages() {
        const frontData = localStorage.getItem('driverLicense_front');
        const backData = localStorage.getItem('driverLicense_back');

        if (frontData) {
            this.frontImageData = frontData;
            this.frontPreviewImage.src = frontData;
            this.frontPreviewImage.classList.add('visible');
            this.frontPreview.classList.add('hidden');
            this.frontUploadArea.classList.add('has-image');
            this.removeFrontBtn.style.display = 'flex';
        }

        if (backData) {
            this.backImageData = backData;
            this.backPreviewImage.src = backData;
            this.backPreviewImage.classList.add('visible');
            this.backPreview.classList.add('hidden');
            this.backUploadArea.classList.add('has-image');
            this.removeBackBtn.style.display = 'flex';
        }
    }

    saveImages() {
        if (this.frontImageData) {
            localStorage.setItem('driverLicense_front', this.frontImageData);
        }

        if (this.backImageData) {
            localStorage.setItem('driverLicense_back', this.backImageData);
        }

        this.showToast('Сакталды!');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
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
        }, 2000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setBatteryLevel();
    new SettingsManager();

    setInterval(updateTime, 60000);
});
