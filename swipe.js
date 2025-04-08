(function () {
    let touchStartX = 0;
    let isSwiping = false;
    let indicatorElement = null;
    const EDGE_THRESHOLD = 20;     // pixels from edge to consider an edge swipe
    const SWIPE_MINIMUM = 80;      // minimum pixels to swipe for action to trigger

    // Remove any existing indicator element
    function removeIndicator() {
        if (indicatorElement) {
            indicatorElement.remove();
            indicatorElement = null;
        }
    }

    // Create and add the visual indicator element with a given type (back/forward)
    function showIndicator(type) {
        if (indicatorElement) return;
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

    // Update indicator state (active/inactive) based on swipe distance
    function updateIndicatorState(isActive) {
        if (indicatorElement) {
            if (isActive) {
                indicatorElement.classList.add('active');
            } else {
                indicatorElement.classList.remove('active');
            }
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

    // Touch move: determine swipe direction and update the indicator state
    document.addEventListener('touchmove', function (e) {
        if (!isSwiping || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;

        // Left edge swipe (back)
        if (indicatorElement && indicatorElement.classList.contains("back")) {
            // Check if swipe is long enough to trigger action
            updateIndicatorState(dx > SWIPE_MINIMUM);
        }
        // Right edge swipe (forward)
        else if (indicatorElement && indicatorElement.classList.contains("forward")) {
            // Check if swipe is long enough to trigger action
            updateIndicatorState(Math.abs(dx) > SWIPE_MINIMUM);
        }
    }, { passive: true });

    // Touch end: if the swipe meets the threshold, trigger the appropriate navigation action
    document.addEventListener('touchend', function (e) {
        if (!isSwiping) return;

        // Only trigger actions if the indicator is in active state
        if (indicatorElement && indicatorElement.classList.contains("active")) {
            if (indicatorElement.classList.contains("back")) {
                window.history.back();
            } else if (indicatorElement.classList.contains("forward")) {
                window.history.forward();
            }
        }

        isSwiping = false;
        removeIndicator();
    });

    // Handle touch cancel event
    document.addEventListener('touchcancel', function () {
        isSwiping = false;
        removeIndicator();
    });
})();