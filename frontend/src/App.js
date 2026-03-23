import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const userId = "user1";

  // ✅ FIXED URLs (ONLY production)
  const WS_URL = `wss://smart-notification-backend.onrender.com/ws/${userId}`;
  const API_URL = `https://smart-notification-backend.onrender.com/send/${userId}`;

  useEffect(() => {
    console.log("Connecting to:", WS_URL);

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      console.log("📩 Message received:", event.data);

      const data = JSON.parse(event.data);

      setNotifications((prev) => [...prev, data]);
    };

    ws.onerror = (err) => {
      console.log("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket closed");
    };

    return () => ws.close();
  }, []);

  const sendNotification = async () => {
    if (!message) return;

    console.log("Sending:", message);

    try {
      const res = await fetch(`${API_URL}?message=${message}`, {
        method: "POST",
      });

      const data = await res.json();
      console.log("Response:", data);

      setMessage(""); // clear input
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <div className="App">
      <h1>🔔 Smart Notification System</h1>

      {/* ✅ Input Box */}
      <input
        type="text"
        placeholder="Enter notification..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          padding: "10px",
          width: "250px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <br /><br />

      {/* ✅ Send Button */}
      <button onClick={sendNotification}>Send Notification</button>

      <br /><br />

      {/* ✅ Notifications */}
      <div className="notifications">
        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="notification">
              {n.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;