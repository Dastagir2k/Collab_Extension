chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background:", message);

  if (message.text && message.url) {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.error("Storage clear error:", chrome.runtime.lastError);
        return;
      }

      chrome.storage.local.set({ selectedText: message.text, pageUrl: message.url }, () => {
        if (chrome.runtime.lastError) {
          console.error("Storage set error:", chrome.runtime.lastError);
        } else {
          console.log("Data stored successfully.");
        }
      });
    });
  }
});
