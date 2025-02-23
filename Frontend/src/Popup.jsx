import { useEffect, useState } from "react";
import './App.css';

function Popup() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(["history"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving history:", chrome.runtime.lastError);
      } else if (result.history) {
        setHistory(result.history);
      }
    });
  }, []);

  const handleKeyDown = (event, url) => {
    if (event.key === "Enter" && url) {
      chrome.tabs.create({ url });
    }
  };

  const toggleAccordion = (event) => {
    const button = event.currentTarget;
    button.classList.toggle('active'); 
    const content = button.nextElementSibling;
    if (button.classList.contains('active')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = 0;
    }
  };

  return (
    <div>
      <div className="pink">
        <h2 className="black"><p className="p">Collab tool extension</p></h2>
        <h2 className="high-paragraph"><p className="p">Highlighted History</p></h2>
      </div>
      <button className="accordion-button" onClick={toggleAccordion} aria-expanded="false">
        Group
      </button>
      <div className="accordion-content">
        {history.length > 0 ? (
          history.map((item, index) => (
            <div key={index} className="accordion-item" tabIndex={0} onKeyDown={(event) => handleKeyDown(event, item.url)}>
              <p className="button">{item.text}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="animated-paragraph word">
                {item.url}
              </a>
              <p className="highlighted-paragraph">Saved on: {new Date(item.timestamp).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}

export default Popup;