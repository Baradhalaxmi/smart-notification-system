import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [notifications, setNotifications] = useState([]);
  const userId = "user1";

  // ✅ Detect environment (local vs deployed)
  const WS_URL =
    window.location.hostname === "localhost"
      ? `ws://127.0.0.1:8000/ws/${userId}`
      : `wss://smart-notification-backend.onrender.com/ws/${userId}`;

  const API_URL =
    window.location.hostname === "localhost"
      ? `http://127.0.0.1:8000/send/${userId}`
      : `https://smart-notification-backend.onrender.com/send/${userId}`;

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      console.log("📩 Message received:", event.data);

      const data = JSON.parse(event.data);

      setNotifications((prev) => {
        // جلوگیری duplicates
        if (prev.find((n) => n.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    ws.onerror = (err) => {
      console.log("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Send notification
  const sendNotification = async () => {
    console.log("Button clicked");

    try {
      const res = await fetch(`${API_URL}?message=Assignment Updated`, {
        method: "POST",
      });

      const data = await res.json();
      console.log("Response:", data);
    } catch (err) {
      console.log("Error sending:", err);
    }
  };

  return (
    <div className="App">
      <h1>🔔 Smart Notification System</h1>

      <button onClick={sendNotification}>Send Notification</button>

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