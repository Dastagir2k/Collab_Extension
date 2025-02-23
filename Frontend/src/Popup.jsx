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
          let historyData = [];
          if (result.history?.length) {
            historyData = [...result.history];
          }
          const updatedHistory = [...historyData, newEntry];
          console.log("updatedHistory>>", updatedHistory);
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

  useEffect(() => {
    console.log("history onChange>>>", history);
  }, [history]);

  const handleKeyDown = (event, url) => {
    if (event.key === "Enter" && url) {
      chrome.tabs.create({ url });
    }
  };

  const toggleAccordion = (event) => {
    const button = event.currentTarget;
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", !isExpanded);
    button.classList.toggle("active");
    const content = button.nextElementSibling;
    if (button.classList.contains("active")) {
      console.log("content.scrollHeight>>", content.scrollHeight);
      content.style.maxHeight = "100vh";
    } else {
      content.style.maxHeight = 0;
    }
  };

  const openLink = (url) => {
    chrome.tabs.create({ url });
  };

  return (
    <>
      <div className='pink'>
        <h2>
          <p className='p'>Collab tool extension</p>
        </h2>
      </div>
      <h2 className='simple_line'></h2>
      <button
        className='accordion-button'
        onClick={toggleAccordion}
        aria-expanded='false'
      >
        <span className='arrow'>▶</span> Group
      </button>
      <div className='accordion-content' key={history.length}>
        {history.length > 0 ? (
          history.map((item, index) => (
            <div
              key={index + item.timestamp}
              className='accordion-item'
              tabIndex={index}
              onKeyDown={(event) => handleKeyDown(event, item.url)}
            >
              <div className='animated-paragraph word'>
                <p>{item.text}</p>
                <p style={{ fontWeight: "bold" }}>
                  Saved on: {new Date(item.timestamp).toLocaleString()}
                </p>
                <div className='button_class'>
                  <button
                    className='link_button'
                    onClick={() => openLink(item.url)}
                  >
                    Link
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </>
  );
}

export default Popup;
