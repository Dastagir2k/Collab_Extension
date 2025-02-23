import { useEffect, useState } from "react";
function Popup() {
  const [history, setHistory] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

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

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates an 8-character random code
    setRoomCode(code);
  };

  // Function to copy room code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      alert("Room code copied: " + roomCode);
    });
  };


  const handleJoinRoom = () => {
    // You can add your join room logic here, for now we'll simply log it
    console.log("Joining room with code:", joinRoomCode);
    // Reset the join room code and hide the input
    setJoinRoomCode("");
    setShowJoinInput(false);
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
          TeamWrite
        </h2>
      </div>
      <div>
      <div className="join-room-sec">
      <button
        style={{
          backgroundColor: "blue",
          cursor: "pointer",
          color: "white",
          padding: "5px 10px",
          marginBottom: "10px",
          borderRadius:"5px",
        }}
        onClick={generateRoomCode}
      >
        Create Room
      </button>
      <button
        style={{
          backgroundColor: "blue",
          cursor: "pointer",
          color: "white",
          padding: "5px 10px",
          marginBottom: "10px",
          marginLeft: "5px",
          borderRadius:"5px",
        }}
        onClick={() => setShowJoinInput(true)}
      >
        Join Room
      </button>
      </div>

      {showJoinInput && (
        <div style={{ marginBottom: "10px", backgroundColor: "#222", padding: "8px", borderRadius: "5px" }}>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value)}
            style={{ padding: "5px", width: "80%", marginBottom: "5px", borderRadius: "3px" }}
          />
          <button
            style={{
              backgroundColor: "green",
              cursor: "pointer",
              color: "white",
              padding: "5px 10px",
              width: "100%"
            }}
            onClick={handleJoinRoom}
          >
            Join
          </button>
        </div>
      )}


{roomCode && (
        <div style={{ marginBottom: "10px", backgroundColor: "#222", padding: "8px", borderRadius: "5px"}}>
          <p style={{ color: "white" }}>Room Code: <strong>{roomCode}</strong></p>
          <button
            style={{
              backgroundColor: "green",
              cursor: "pointer",
              color: "white",
              padding: "5px 10px",
              borderRadius:"5px",
            }}
            onClick={copyToClipboard}
          >
            Copy Code
          </button>
        </div>
      )}


      </div>
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
                    Location
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
