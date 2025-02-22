
document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  const pageUrl = window.location.href;
  
  if (selectedText) {
    console.log("Attempting to send message with selected text:", selectedText);

    chrome.runtime.sendMessage({ text: selectedText, url: pageUrl }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
      } else {
        console.log("Message sent successfully:", response);
      }
    });
  }
});
