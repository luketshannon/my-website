let currentIndex = 0;

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const carouselImages = document.getElementById('carouselImages');

    const slideWidth = carousel.offsetWidth; // Dynamically calculate the current width

    // Update the transform property to match the new width
    carouselImages.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
}

function showSlide(index) {
    const carousel = document.getElementById('carousel');
    const carouselImages = document.getElementById('carouselImages');
    const totalSlides = carouselImages.children.length;
    const slideWidth = carousel.offsetWidth; // Dynamically calculate the current width

    // Update current index and wrap around if necessary
    if (index < 0) {
        currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }

    // Slide to the new position
    carouselImages.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
}

function prevSlide() {
    showSlide(currentIndex - 1);
}

function nextSlide() {
    showSlide(currentIndex + 1);
}

// Add an event listener to handle window resize
window.addEventListener('resize', updateCarousel);

// Ensure the correct position on initial load
window.onload = updateCarousel;