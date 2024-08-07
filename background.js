console.log('Background script loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);
    if (message.action === "saveToken") {
        console.log('Saving token to chrome.storage.local');
        chrome.storage.local.set({trelloToken: message.token}, () => {
            console.log('Token saved, sending auth_success message');
            chrome.runtime.sendMessage({action: "auth_success"});
            sendResponse({status: "token saved"});
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tabId, changeInfo, tab.url);
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('trello.terekhovsergei.life/redirect.html')) {
        console.log('Redirect page loaded, sending checkForToken message');
        chrome.tabs.sendMessage(tabId, {action: "checkForToken"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
            } else {
                console.log('checkForToken message sent successfully');
            }
        });
    }
});