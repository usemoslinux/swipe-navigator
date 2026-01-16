browser.runtime.onMessage.addListener(function (message, sender) {
    if (!message || message.type !== 'swipe-navigate') {
        return;
    }

    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId) {
        return;
    }

    if (message.direction === 'back') {
        return browser.tabs.goBack(tabId);
    }

    if (message.direction === 'forward') {
        return browser.tabs.goForward(tabId);
    }
});
