// Card Stack functionality
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
            // Show front card
            this.frontCard.classList.add('active');
            this.frontCard.classList.remove('behind');
            this.backCard.classList.remove('active');
        } else {
            // Show back card (front goes behind)
            this.frontCard.classList.remove('active');
            this.frontCard.classList.add('behind');
            this.backCard.classList.add('active');
        }

        // Update dots
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    loadImages() {
        const frontData = localStorage.getItem(`license_${this.pageId}_front`);
        const backData = localStorage.getItem(`license_${this.pageId}_back`);

        const frontImage = document.getElementById('frontImage');
        const backImage = document.getElementById('backImage');

        // Use uploaded images or default examples
        frontImage.src = frontData || 'photo_2025-12-27_17-55-50.jpg';
        backImage.src = backData || 'photo_2025-12-27_17-56-00.jpg';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CardStack();
});
