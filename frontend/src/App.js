import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const userId = "user1";

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${userId}`);

    ws.onopen = () => console.log("Connected to backend");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setNotifications((prev) => {
        if (prev.find((n) => n.id === data.id)) return prev;
        return [data, ...prev]; // newest on top
      });
    };

    return () => ws.close();
  }, []);

  // grouping
  const grouped = {};
  notifications.forEach((n) => {
    grouped[n.message] = (grouped[n.message] || 0) + 1;
  });

  const unreadCount = notifications.length;

  return (
    <div className="container">
      <h1>Smart Notification System</h1>

      {/* 🔔 Bell */}
      <div className="bell" onClick={() => setShowPanel(!showPanel)}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {/* Button */}
      <button
        onClick={async () => {
          await fetch(
            "http://127.0.0.1:8000/send/user1?message=Assignment Updated",
            { method: "POST" }
          );
        }}
      >
        Send Notification
      </button>

      {/* Dropdown Panel */}
      {showPanel && (
        <div className="panel">
          <h3>Notifications</h3>

          {Object.keys(grouped).length === 0 && <p>No notifications</p>}

          {Object.keys(grouped).map((msg, i) => (
            <div key={i} className="notif">
              {msg} {grouped[msg] > 1 && `(${grouped[msg]} times)`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;