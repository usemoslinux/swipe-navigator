browser.runtime.onMessage.addListener(function (message, sender) {
    if (!message || message.type !== 'swipe-navigate' || sender.frameId !== 0) {
        return;
    }

    const tabId = sender && sender.tab && sender.tab.id;
    if (typeof tabId !== 'number') {
        return;
    }

    if (message.direction === 'back') {
        return browser.tabs.goBack(tabId);
    }

    if (message.direction === 'forward') {
        return browser.tabs.goForward(tabId);
    }
});
