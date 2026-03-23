from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

app = FastAPI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"status": "Backend is working"}
# Store connections + notifications
connected_users: Dict[str, WebSocket] = {}
notifications_db: Dict[str, List[dict]] = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connected_users[user_id] = websocket

    # Send missed notifications
    if user_id in notifications_db:
        for notif in notifications_db[user_id]:
            await websocket.send_json(notif)

    try:
        while True:
            await websocket.receive_text()
    except:
        connected_users.pop(user_id)


@app.post("/send/{user_id}")
async def send_notification(user_id: str, message: str):
    notif = {
        "id": hash(message + user_id),
        "message": message
    }

    # Save notification
    notifications_db.setdefault(user_id, []).append(notif)

    # Send instantly if online
    if user_id in connected_users:
        await connected_users[user_id].send_json(notif)

    return {"status": "sent"}