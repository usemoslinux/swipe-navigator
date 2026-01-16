(function () {
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    let swipeConfirmed = false;
    let indicatorElement = null;
    let indicatorHost = null;
    let previousBodyOverflow = null;
    let indicatorRemovalTimer = null;
    let navigationState = { supported: false, canGoBack: true, canGoForward: true };

    const EDGE_THRESHOLD = 20;     // pixels from edge to consider an edge swipe
    const SWIPE_MINIMUM = 80;      // minimum pixels to swipe for action to trigger
    const SWIPE_CONFIRM = 10;      // minimum horizontal movement to confirm a swipe

    function restoreBodyOverflow() {
        if (previousBodyOverflow !== null && document.body) {
            document.body.style.overflow = previousBodyOverflow;
            previousBodyOverflow = null;
        }
    }

    // Remove any existing indicator element with slide out animation
    function removeIndicator(options) {
        if (!indicatorElement) {
            restoreBodyOverflow();
            return;
        }

        if (indicatorRemovalTimer) {
            clearTimeout(indicatorRemovalTimer);
            indicatorRemovalTimer = null;
        }

        const shouldAnimateBack = options && options.animateBack;
        if (!shouldAnimateBack) {
            indicatorElement.classList.remove('visible');
            finalizeIndicatorRemoval();
            return;
        }

        indicatorElement.classList.remove('active');
        indicatorElement.classList.add('cancelling');
        indicatorElement.style.transform = 'translateY(-50%)';
        indicatorElement.classList.remove('visible');

        const onTransitionEnd = function (event) {
            if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return;
            indicatorElement.removeEventListener('transitionend', onTransitionEnd);
            finalizeIndicatorRemoval();
        };

        indicatorElement.addEventListener('transitionend', onTransitionEnd);
        indicatorRemovalTimer = setTimeout(function () {
            if (!indicatorElement) return;
            indicatorElement.removeEventListener('transitionend', onTransitionEnd);
            finalizeIndicatorRemoval();
        }, 320);
    }

    function finalizeIndicatorRemoval() {
        if (indicatorHost) {
            indicatorHost.remove();
            indicatorHost = null;
        }

        indicatorElement = null;
        restoreBodyOverflow();
    }

    function buildIndicatorStyles() {
        return `
            .swipe-indicator {
                align-items: center;
                background-color: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                color: white;
                display: flex;
                font-size: 1rem;
                height: 3rem;
                justify-content: center;
                line-height: 3rem;
                opacity: 0;
                pointer-events: none;
                position: fixed;
                text-align: center;
                transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                width: 3rem;
                z-index: 2147483647;
            }

            .swipe-indicator.active {
                color: #ff8c00;
            }

            .swipe-indicator.visible {
                opacity: 1;
            }

            .swipe-indicator.cancelling {
                transition: opacity 0.2s ease, transform 0.32s cubic-bezier(0.18, 0.9, 0.2, 1.08);
            }

            .swipe-indicator.back {
                top: 50%;
                left: -3rem;
                transform: translateY(-50%);
            }

            .swipe-indicator.forward {
                top: 50%;
                right: -3rem;
                transform: translateY(-50%);
            }
        `;
    }

    // Create and add the visual navigation indicator (back or forward)
    function showIndicator(type) {
        if (indicatorElement || !document.body) return;

        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        indicatorHost = document.createElement('div');
        indicatorHost.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;';

        const shadowRoot = indicatorHost.attachShadow({ mode: 'closed' });
        const style = document.createElement('style');
        style.textContent = buildIndicatorStyles();

        indicatorElement = document.createElement('div');
        indicatorElement.className = 'swipe-indicator ' + type;
        indicatorElement.classList.add('visible');

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

        shadowRoot.appendChild(style);
        shadowRoot.appendChild(indicatorElement);
        document.body.appendChild(indicatorHost);
    }

    function navigate(direction) {
        if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
            browser.runtime.sendMessage({
                type: 'swipe-navigate',
                direction: direction,
                canGoBack: navigationState.supported ? navigationState.canGoBack : undefined
            }).catch(function () {
                if (direction === 'back') {
                    window.history.back();
                } else if (direction === 'forward') {
                    window.history.forward();
                }
            });
            return;
        }

        if (direction === 'back') {
            window.history.back();
        } else if (direction === 'forward') {
            window.history.forward();
        }
    }

    function updateNavigationState() {
        const nav = window.navigation;
        const canGoBack = nav && typeof nav.canGoBack === 'boolean' ? nav.canGoBack : null;
        const canGoForward = nav && typeof nav.canGoForward === 'boolean' ? nav.canGoForward : null;

        if (canGoBack === null || canGoForward === null) {
            navigationState = { supported: false, canGoBack: true, canGoForward: true };
            return;
        }

        navigationState = { supported: true, canGoBack: canGoBack, canGoForward: canGoForward };
    }

    // Update indicator position and state based on swipe distance
    function updateIndicatorPosition(dx) {
        if (!indicatorElement) return;

        let translateX = 0;
        let isActive = false;

        if (indicatorElement.classList.contains("back")) {
            translateX = Math.max(0, Math.min(dx, SWIPE_MINIMUM));
            isActive = dx > SWIPE_MINIMUM;
        } else if (indicatorElement.classList.contains("forward")) {
            translateX = Math.min(0, Math.max(dx, -SWIPE_MINIMUM));
            isActive = dx < -SWIPE_MINIMUM;
        }

        const baseTransform = 'translateY(-50%)';
        const slideTransform = `translateX(${translateX}px)`;
        indicatorElement.style.transform = `${baseTransform} ${slideTransform}`;

        if (isActive) {
            indicatorElement.classList.add('active');
        } else {
            indicatorElement.classList.remove('active');
        }
    }

    // Touch start: record starting coordinates and initialize state
    document.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        swipeConfirmed = false;

        const isLeftEdge = touchStartX < EDGE_THRESHOLD;
        const isRightEdge = touchStartX > (window.innerWidth - EDGE_THRESHOLD);

        updateNavigationState();

        if (isLeftEdge) {
            isSwiping = true;
            showIndicator("back");
        } else if (isRightEdge) {
            if (navigationState.supported && !navigationState.canGoForward) {
                isSwiping = false;
                return;
            }
            isSwiping = true;
            showIndicator("forward");
        } else {
            isSwiping = false;
        }
    }, { passive: true });

    // Touch move: determine swipe direction and update the indicator position
    document.addEventListener('touchmove', function (e) {
        if (!isSwiping || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;

        if (!swipeConfirmed) {
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SWIPE_CONFIRM) {
                isSwiping = false;
                removeIndicator({ animateBack: true });
                return;
            }

            if (Math.abs(dx) >= SWIPE_CONFIRM && Math.abs(dx) > Math.abs(dy)) {
                swipeConfirmed = true;
            }
        }

        if (swipeConfirmed && e.cancelable) {
            e.preventDefault();
        }

        updateIndicatorPosition(dx);
    }, { passive: false });

    // Touch end: if the swipe meets the threshold, trigger the appropriate navigation action
    document.addEventListener('touchend', function () {
        if (!isSwiping) return;

        if (indicatorElement) {
            if (indicatorElement.classList.contains("active")) {
                if (indicatorElement.classList.contains("back")) {
                    removeIndicator();
                    navigate('back');
                } else if (indicatorElement.classList.contains("forward")) {
                    removeIndicator();
                    navigate('forward');
                }
            } else {
                removeIndicator({ animateBack: true });
            }
        }

        isSwiping = false;
        swipeConfirmed = false;
    });

    // Handle touch cancel event
    document.addEventListener('touchcancel', function () {
        isSwiping = false;
        swipeConfirmed = false;
        removeIndicator({ animateBack: true });
    });
})();
