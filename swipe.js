(function() {
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeDirection = null; // "vertical" or "horizontal"
  let isSwiping = false;
  let indicatorElement = null;
  const VERTICAL_THRESHOLD = 100; // pixels needed for a pull-down action
  const HORIZONTAL_MARGIN = 50;   // (still defined, if needed for other logic)
  
  // Remove any existing indicator element
  function removeIndicator() {
    if (indicatorElement) {
      indicatorElement.remove();
      indicatorElement = null;
    }
  }
  
  // Create and add the visual indicator element with a given class (reload/back/forward)
  function showIndicator(type) {
    if (indicatorElement) return;
    indicatorElement = document.createElement('div');
    indicatorElement.className = 'swipe-indicator ' + type;
    
    // Use simple Unicode icons for visual feedback.
    // &#x21bb; : Reload, &#x2190; : Back, &#x2192; : Forward.
    if (type === 'reload') {
      indicatorElement.innerHTML = "&#x21bb;";
    } else if (type === 'back') {
      indicatorElement.innerHTML = "&#x2190;";
    } else if (type === 'forward') {
      indicatorElement.innerHTML = "&#x2192;";
    }
    
    document.body.appendChild(indicatorElement);
  }
  
  // Touch start: record starting coordinates and initialize state
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return;
    isSwiping = true;
    swipeDirection = null;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive: true});
  
  // Touch move: determine swipe direction and update the indicator animation.
  document.addEventListener('touchmove', function(e) {
    if (!isSwiping || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    
    // Determine if the swipe is primarily horizontal or vertical.
    if (!swipeDirection) {
      swipeDirection = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }
    
    if (swipeDirection === "vertical") {
      // Only consider vertical swipes when at the top of the page (pull-to-refresh).
      if (window.scrollY === 0 && dy > 0) {
        showIndicator("reload");
      }
      // Animate the reload icon: rotate proportional to the vertical displacement.
      if (indicatorElement && indicatorElement.classList.contains("reload")) {
        indicatorElement.style.transform = 'translateX(-50%) rotate(' + dy + 'deg)';
      }
    } else if (swipeDirection === "horizontal") {
      // Choose an indicator based on whether the finger is on the left or right half.
      if (touch.clientX < window.innerWidth / 2) {
        showIndicator("back");
        // Animate the back icon: scale up based on horizontal swipe distance.
        if (indicatorElement && indicatorElement.classList.contains("back")) {
          let scale = 1 + Math.min(Math.abs(dx) / 200, 0.5);
          indicatorElement.style.transform = 'translateY(-50%) scale(' + scale + ')';
        }
      } else {
        showIndicator("forward");
        // Animate the forward icon: scale up based on horizontal swipe distance.
        if (indicatorElement && indicatorElement.classList.contains("forward")) {
          let scale = 1 + Math.min(Math.abs(dx) / 200, 0.5);
          indicatorElement.style.transform = 'translateY(-50%) scale(' + scale + ')';
        }
      }
    }
  }, {passive: true});
  
  // Touch end: if the swipe meets the threshold, trigger the appropriate navigation action.
  document.addEventListener('touchend', function(e) {
    if (!isSwiping) return;
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    if (swipeDirection === "vertical") {
      const dy = endY - touchStartY;
      if (dy > VERTICAL_THRESHOLD && window.scrollY === 0) {
        window.location.reload();
      }
    } else if (swipeDirection === "horizontal") {
      if (indicatorElement && indicatorElement.classList.contains("back")) {
        window.history.back();
      } else if (indicatorElement && indicatorElement.classList.contains("forward")) {
        window.history.forward();
      }
    }
    
    isSwiping = false;
    swipeDirection = null;
    removeIndicator();
  });
})();

