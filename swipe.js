(function () {
    let touchStartX = 0;
    let isSwiping = false;
    let indicatorElement = null;
    const EDGE_THRESHOLD = 20;     // pixels from edge to consider an edge swipe
    const SWIPE_MINIMUM = 80;      // minimum pixels to swipe for action to trigger

    // Remove any existing indicator element with slide out animation
    function removeIndicator() {
        if (indicatorElement) {
            document.body.style.overflow = ''; // reenable window scrolling
            
            // Remove visible class to trigger slide out animation
            indicatorElement.classList.remove('visible');
            
            if (indicatorElement) {
                indicatorElement.remove();
                indicatorElement = null;
            }
        }
    }

    // Create and add the visual indicator element with a given type (back/forward)
    function showIndicator(type) {
        if (indicatorElement) return;

        // disable window scrolling
        document.body.style.overflow = 'hidden';

        indicatorElement = document.createElement('div');
        indicatorElement.className = 'swipe-indicator ' + type;

        // Use simple Unicode icons for visual feedback.
        if (type === 'back') {
            indicatorElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        `;
        } else if (type === 'forward') {
            indicatorElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        `;
        }

        document.body.appendChild(indicatorElement);
    }

    // Update indicator position and state based on swipe distance
    function updateIndicatorPosition(dx) {
        if (!indicatorElement) return;
        
        // Calculate position based on swipe progress
        let translateX = 0;
        let isActive = false;
        
        if (indicatorElement.classList.contains("back")) {
            // For back swipe, move right as user swipes right
            translateX = Math.max(0, Math.min(dx, SWIPE_MINIMUM));
            isActive = dx > SWIPE_MINIMUM;
        } else if (indicatorElement.classList.contains("forward")) {
            // For forward swipe, move left as user swipes left (dx is negative)
            translateX = Math.min(0, Math.max(dx, -SWIPE_MINIMUM));
            isActive = dx < -SWIPE_MINIMUM;
        }
        
        // Apply transform with swipe progress
        const baseTransform = `translateY(-50%)`;
        const slideTransform = `translateX(${translateX}px)`;
        indicatorElement.style.transform = `${baseTransform} ${slideTransform}`;
        
        // Update active state
        if (isActive) {
            indicatorElement.classList.add('active');
        } else {
            indicatorElement.classList.remove('active');
        }
    }

    // Touch start: record starting coordinates and initialize state
    document.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        isSwiping = true;
        touchStartX = e.touches[0].clientX;

        // Check if the touch started near either edge of the screen
        const isLeftEdge = touchStartX < EDGE_THRESHOLD;
        const isRightEdge = touchStartX > (window.innerWidth - EDGE_THRESHOLD);

        if (isLeftEdge) {
            showIndicator("back");
        } else if (isRightEdge) {
            showIndicator("forward");
        }
    }, { passive: true });

    // Touch move: determine swipe direction and update the indicator position
    document.addEventListener('touchmove', function (e) {
        if (!isSwiping || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;

        // Update indicator position based on swipe progress
        updateIndicatorPosition(dx);
    }, { passive: true });

    // Touch end: if the swipe meets the threshold, trigger the appropriate navigation action
    document.addEventListener('touchend', function (e) {
        if (!isSwiping) return;
        
        if (indicatorElement) {
            // Only trigger actions if the indicator is in active state
            if (indicatorElement.classList.contains("active")) {
                if (indicatorElement.classList.contains("back")) {
                    removeIndicator();
                    window.history.back();
                } else if (indicatorElement.classList.contains("forward")) {
                    removeIndicator();
                    window.history.forward();
                }
            } else {
                removeIndicator();
            }
        }

        isSwiping = false;
    });

    // Handle touch cancel event
    document.addEventListener('touchcancel', function () {
        isSwiping = false;
        removeIndicator();
    });
})();