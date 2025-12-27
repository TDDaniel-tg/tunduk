// Card Stack functionality with cloud sync
class CardStack {
    constructor() {
        // Get page ID from URL parameter
        this.pageId = new URLSearchParams(window.location.search).get('page') || '1';

        this.cardStack = document.getElementById('cardStack');
        this.frontCard = document.getElementById('frontCardWrapper');
        this.backCard = document.getElementById('backCardWrapper');
        this.dots = document.querySelectorAll('.dot');
        this.currentIndex = 0;
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;

        this.init();
        this.loadImages();
    }

    init() {
        // Touch events
        this.cardStack.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.cardStack.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.cardStack.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Mouse events for desktop
        this.cardStack.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.cardStack.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.cardStack.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.cardStack.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Dot clicks
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToCard(index));
        });
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        const diff = this.currentX - this.startX;
        const threshold = 50;

        if (diff > threshold && this.currentIndex > 0) {
            this.goToCard(0);
        } else if (diff < -threshold && this.currentIndex < 1) {
            this.goToCard(1);
        }
    }

    handleMouseDown(e) {
        this.startX = e.clientX;
        this.isDragging = true;
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.clientX;
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        const diff = this.currentX - this.startX;
        const threshold = 50;

        if (diff > threshold && this.currentIndex > 0) {
            this.goToCard(0);
        } else if (diff < -threshold && this.currentIndex < 1) {
            this.goToCard(1);
        }
    }

    goToCard(index) {
        this.currentIndex = index;

        if (index === 0) {
            this.frontCard.classList.add('active');
            this.frontCard.classList.remove('behind');
            this.backCard.classList.remove('active');
        } else {
            this.frontCard.classList.remove('active');
            this.frontCard.classList.add('behind');
            this.backCard.classList.add('active');
        }

        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    async loadImages() {
        const frontImage = document.getElementById('frontImage');
        const backImage = document.getElementById('backImage');
        const qrImage = document.getElementById('qrImage');

        // Show loading state
        frontImage.style.opacity = '0.5';
        backImage.style.opacity = '0.5';

        try {
            // Try to load from cloud first
            const pageData = await getPageData(this.pageId);

            if (pageData) {
                if (pageData.front) frontImage.src = pageData.front;
                if (pageData.back) backImage.src = pageData.back;
                if (pageData.qr && qrImage) qrImage.src = pageData.qr;
            } else {
                // Fallback to local or defaults
                const localFront = localStorage.getItem(`license_${this.pageId}_front`);
                const localBack = localStorage.getItem(`license_${this.pageId}_back`);

                frontImage.src = localFront || 'photo_2025-12-27_17-55-50.jpg';
                backImage.src = localBack || 'photo_2025-12-27_17-56-00.jpg';
            }
        } catch (error) {
            console.error('Error loading images:', error);
            // Fallback to defaults
            frontImage.src = 'photo_2025-12-27_17-55-50.jpg';
            backImage.src = 'photo_2025-12-27_17-56-00.jpg';
        }

        // Remove loading state
        frontImage.style.opacity = '1';
        backImage.style.opacity = '1';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CardStack();
});
