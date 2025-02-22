import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Popup() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load stored history on mount
    chrome.storage.local.get(["history"], (result) => {
      if (result.history) {
        setHistory(result.history);
      }
    });
  }, []);

  // Handle key down events on the popup div
  const handleKeyDown = (event, url) => {
    if (event.key === "Enter" && url) {
      chrome.tabs.create({ url });
    }
  };

  return (
    <div style={{ padding: "10px", width: "300px" }} className="bg-red-500 text-white">
      <h2 className="text-xl font-bold">Highlighted History</h2>
      {history.length > 0 ? (
        history.map((item, index) => (
          <div
            key={index}
            tabIndex={0} // Makes it focusable for key events
            onKeyDown={(event) => handleKeyDown(event, item.url)}
            className="border-b border-gray-300 p-2"
          >
            <p className="text-lg">"{item.text}"</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-300">
              {item.url}
            </a>
            <p className="text-sm text-gray-300">Saved on: {new Date(item.timestamp).toLocaleString()}</p>
          </div>
        ))
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

export default Popup;
