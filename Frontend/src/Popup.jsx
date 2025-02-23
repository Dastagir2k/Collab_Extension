import { useEffect, useState } from "react";
function Popup() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      console.log("atleast calling hre!!!", info);
      if (info.menuItemId === "addContentContextMenu") {
        const newEntry = {
          text: info.selectionText,
          url: info.pageUrl,
          timestamp: Date.now(),
        };
        chrome.storage.local.get(["history"], (result) => {
          if (result.history) {
            const updatedHistory = [...result.history, newEntry];
            setHistory(updatedHistory);
            chrome.storage.local.set({ history: updatedHistory }, () => {
              if (chrome.runtime.lastError) {
                console.error("Storage set error:", chrome.runtime.lastError);
              } else {
                console.log(
                  "Data stored successfully in history:",
                  updatedHistory
                );
              }
            });
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    // Load stored history on mount
    chrome.storage.local.get(["history"], (result) => {
      if (result.history) {
        setHistory(result.history);
      }
    });
  }, []);

  return (
    <div
      style={{ padding: "10px", width: "300px" }}
      className='bg-red-500 text-white'
    >
      <h2 className='text-xl font-bold'>Highlighted History</h2>
      {history.length > 0 ? (
        history.map((item, index) => (
          <div
            key={index}
            tabIndex={0} // Makes it focusable for key events
            onKeyDown={(event) => handleKeyDown(event, item.url)}
            className='border-b border-gray-300 p-2'
          >
            <p className='text-lg'>"{item.text}"</p>
            <a
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-300'
            >
              {item.url}
            </a>
            <p className='text-sm text-gray-300'>
              Saved on: {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

export default Popup;
