import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
function Popup() {
  const [data, setData] = useState({ text: "", url: "" });

  useEffect(() => {
    // Load stored data on mount
    chrome.storage.local.get(["selectedText", "pageUrl"], (result) => {
      if (result.selectedText && result.pageUrl) {
        setData({ text: result.selectedText, url: result.pageUrl });
      }
    });
  }, []);

  // Handle key down events on the popup div
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed!");
      console.log("Selected Text:", data.text);
      console.log("Page URL:", data.url);
      // Open the URL in a new tab
      if (data.url) {
        chrome.tabs.create({ url: data.url });
      }
    }
  };

  return  (
    <div
      style={{ padding: "10px", width: "250px" }}
      tabIndex={0}  // makes the div focusable to capture key events
      onKeyDown={handleKeyDown}
      className="bg-red-500 text-2xl"
    >
      <h2>Highlighted Texttttt</h2>
      <p>{data.text || "No text selected"}</p>
      <h3>Source URL</h3>
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        {data.url || "No URL"}
      </a>
      <p style={{ fontSize: "0.8rem", color: "gray" }}>
        Press Enter to log and open the URL.
      </p>
    </div> 
  )
 
}

export default Popup;
