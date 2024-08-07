console.log('Content script loaded');

function checkForToken() {
    console.log('checkForToken called in content script');
    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    const token = urlParams.get('token');
    console.log('Token from URL:', token);
    if (token) {
        console.log('Token found, sending message to extension');
        chrome.runtime.sendMessage({action: "saveToken", token: token}, function(response) {
            console.log('Token sent to extension, response:', response);
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
            } else {
                console.log('Token sent successfully');
            }
        });
    } else {
        console.log('No token found in URL');
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in content script:', message);
    if (message.action === "checkForToken") {
        checkForToken();
        sendResponse({status: "check completed"});
    }
    return true;
});

// Check for token when the script loads
checkForToken();