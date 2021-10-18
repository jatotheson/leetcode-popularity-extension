export {}

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        // read changeInfo data and do something with it
        // like send the new url to content.js
        if (changeInfo.url) {
            chrome.tabs.sendMessage( tabId, {
                message: 'new page detected!',
                url: changeInfo.url
            })
        }
    }
);