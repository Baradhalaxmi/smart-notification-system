from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

app = FastAPI()

# ✅ CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later you can restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Root route (to check deployment)
@app.get("/")
def home():
    return {"status": "Backend is working 🚀"}

# ✅ Store active connections
connected_users: Dict[str, WebSocket] = {}

# ✅ Store notifications (acts like DB)
notifications_db: Dict[str, List[dict]] = {}

# ✅ WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connected_users[user_id] = websocket

    print(f"{user_id} connected")

    # 🔥 Send missed notifications (offline support)
    if user_id in notifications_db:
        for notif in notifications_db[user_id]:
            await websocket.send_json(notif)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"{user_id} disconnected")
        connected_users.pop(user_id, None)


# ✅ Send notification API
@app.post("/send/{user_id}")
async def send_notification(user_id: str, message: str):
    notif = {
        "id": hash(message + user_id),
        "message": message
    }

    # 🔥 Save notification (for offline users)
    notifications_db.setdefault(user_id, []).append(notif)

    # 🔥 Send instantly if user is online
    if user_id in connected_users:
        await connected_users[user_id].send_json(notif)

    return {"status": "sent"}