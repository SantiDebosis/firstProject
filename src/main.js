document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu after clicking a link
            // Check if navContent exists before trying to remove class
            const navContent = document.getElementById('nav-content');
            if (window.innerWidth < 1024 && navContent) {
                navContent.classList.remove('active');
            }
        });
    });

    // Toggle mobile menu
    const navToggle = document.getElementById('nav-toggle');
    const navContent = document.getElementById('nav-content');

    if (navToggle && navContent) {
        navToggle.addEventListener('click', function() {
            navContent.classList.toggle('active');
        });
    }

    // Carousel functionality for both videos and opinions
    // This function sets up the carousel behavior including dots and optional navigation buttons.
    function setupCarousel(carouselId, dotsContainerId, scrollLeftBtnId = null, scrollRightBtnId = null) {
        const carousel = document.getElementById(carouselId);
        const dotsContainer = document.getElementById(dotsContainerId);
        const scrollLeftBtn = scrollLeftBtnId ? document.getElementById(scrollLeftBtnId) : null;
        const scrollRightBtn = scrollRightBtnId ? document.getElementById(scrollRightBtnId) : null;

        // Exit if essential elements are not found
        if (!carousel || !dotsContainer) {
            console.error(`Carousel or dots container not found for ID: ${carouselId}`);
            return;
        }

        const items = Array.from(carousel.children);
        // If there are no items, no need to proceed with carousel logic
        if (items.length === 0) {
            return;
        }

        let currentActiveDotIndex = 0;

        // Function to create and append pagination dots
        function generateDots() {
            dotsContainer.innerHTML = ''; // Clear existing dots
            items.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) {
                    dot.classList.add('active'); // First dot is active by default
                }
                // Add click listener to scroll to the corresponding item
                dot.addEventListener('click', () => {
                    carousel.scrollTo({
                        left: items[index].offsetLeft,
                        behavior: 'smooth'
                    });
                });
                dotsContainer.appendChild(dot);
            });
        }

        // Function to update the active dot based on carousel's scroll position
        function updateActiveDot() {
            const scrollLeft = carousel.scrollLeft;
            const dots = Array.from(dotsContainer.children);

            // Find the item that is currently most visible
            let newActiveDotIndex = 0;
            let minDistance = Infinity;

            items.forEach((item, index) => {
                // Calculate the distance from the start of the carousel to the start of the item
                const itemStart = item.offsetLeft;
                // Calculate the distance from the current scroll position to the item's start
                const distance = Math.abs(itemStart - scrollLeft);

                // Consider the item active if its start is close to the current scroll position
                // or if it's the first item and we're at the beginning of the carousel.
                // This helps in accurately determining the active dot even with slight scroll variations.
                if (distance < minDistance) {
                    minDistance = distance;
                    newActiveDotIndex = index;
                }
            });

            // Update active class only if the active dot has changed
            if (newActiveDotIndex !== currentActiveDotIndex) {
                if (dots[currentActiveDotIndex]) {
                    dots[currentActiveDotIndex].classList.remove('active');
                }
                if (dots[newActiveDotIndex]) {
                    dots[newActiveDotIndex].classList.add('active');
                }
                currentActiveDotIndex = newActiveDotIndex;
            }

            // Update visibility of scroll buttons (only for carousels that have them, like opinions)
            if (scrollLeftBtn && scrollRightBtn) {
                const scrollTolerance = 5; // Small tolerance for floating point inaccuracies
                // Hide left button if at the very beginning
                if (carousel.scrollLeft <= scrollTolerance) {
                    scrollLeftBtn.style.display = 'none';
                } else {
                    scrollLeftBtn.style.display = 'block';
                }

                // Hide right button if at the very end
                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - scrollTolerance) {
                    scrollRightBtn.style.display = 'none';
                } else {
                    scrollRightBtn.style.display = 'block';
                }
            }
        }

        // Add event listeners for scroll and resize
        carousel.addEventListener('scroll', updateActiveDot);
        window.addEventListener('resize', () => {
            generateDots(); // Regenerate dots on resize (in case item count or layout changes)
            updateActiveDot(); // Update active dot after resize
            // Ensure buttons are correctly displayed/hidden after resize for opinions carousel
            if (scrollLeftBtn && scrollRightBtn) {
                if (carousel.scrollWidth > carousel.clientWidth) {
                    scrollRightBtn.style.display = 'block'; // Show right button if scrollable
                } else {
                    scrollLeftBtn.style.display = 'none'; // Hide both if not scrollable
                    scrollRightBtn.style.display = 'none';
                }
            }
        });

        // Initial setup calls
        generateDots();
        updateActiveDot(); // Call once initially to set the correct active dot and button visibility

        // Set up scroll buttons for carousels that have them (e.g., opinions carousel)
        if (scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                // Calculate scroll amount based on the first item's width and its horizontal margins/gaps
                // This ensures we scroll exactly one item at a time
                const itemWidth = items[0].offsetWidth +
                                  parseFloat(getComputedStyle(items[0]).marginLeft) +
                                  parseFloat(getComputedStyle(items[0]).marginRight); // Account for margin if any
                // If using gap on parent, the item's margin might be 0, so just use offsetWidth
                // A safer approach for gap is to scroll by carousel.clientWidth for full page scroll or a fixed amount.
                // For this specific layout, scrolling by the first item's offsetWidth is a good approximation.
                carousel.scrollBy({ left: -itemWidth, behavior: 'smooth' });
            });
            scrollRightBtn.addEventListener('click', () => {
                const itemWidth = items[0].offsetWidth +
                                  parseFloat(getComputedStyle(items[0]).marginLeft) +
                                  parseFloat(getComputedStyle(items[0]).marginRight);
                carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
            });
        }
    }

    // Setup for Videos Carousel (no explicit scroll buttons, only dots)
    setupCarousel('videos-carousel', 'videos-dots');

    // Setup for Opinions Carousel (with scroll buttons and dots)
    setupCarousel('opinions-carousel', 'opinions-dots', 'scroll-left', 'scroll-right');
});
