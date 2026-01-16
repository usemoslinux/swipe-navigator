# Summary

Bring intuitive mobile-like navigation gestures to Firefox! Swipe from the left to go back, and from the right to go forward—with smooth animations and visual feedback.

# Description

Swipe Navigator makes browsing more fluid and natural by adding gesture-based navigation to Firefox, as seen on other popular mobile browsers, like Brave. This extension allows you to:

- Swipe left-to-right from the left edge to go back
- Swipe right-to-left from the right edge to go forward

As you swipe, a subtle animated icon appears to let you know which action is about to be triggered: a scaling back arrow, or a forward arrow—all styled to stay visible and separate from page content.

Designed with mobile devices in mind, but also works great on touch-enabled laptops and tablets. Lightweight, responsive, and works across all websites.

No settings. No ads. Just smooth gesture navigation.

On Firefox versions that support the Navigation API (v147+), back swipes will close the tab if there is no back history, and the forward indicator only appears when forward history exists.

# Permissions

Access to all sites is required to inject the gesture detection script and show visual feedback during your swipes. The `tabs` permission is used to trigger back/forward navigation at the browser level.

# Compatibility

Works best on Firefox for Android or any touch-enabled device running Firefox.

Navigation API support is available on Firefox v147+ (see https://caniuse.com/mdn-api_navigation).

# Limitations

- Content scripts do not run on privileged Firefox pages (for example: `about:` pages, `addons.mozilla.org`, or the built-in PDF viewer).
- On older Firefox versions without the Navigation API, the extension shows both indicators and back swipes will not auto-close tabs.
