chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background:", message);

  if (message.text && message.url) {
    console.log(message.text);
    
    // Retrieve the current history array (or default to an empty array)
    chrome.storage.local.get({ history: [] }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Storage get error:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }

      // Create a new entry with a timestamp
      const newEntry = { text: message.text, url: message.url, timestamp: Date.now() };

      // Append the new entry to the history array
      const updatedHistory = [...result.history, newEntry];

      // Save the updated array back to storage
      chrome.storage.local.set({ history: updatedHistory }, () => {
        if (chrome.runtime.lastError) {
          console.error("Storage set error:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          console.log("Data stored successfully in history:", updatedHistory);
          sendResponse({ success: true });
        }
      });
    });

    // Return true to indicate we wish to send a response asynchronously.
    return true;
  }
});
