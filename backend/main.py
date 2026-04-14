import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, Message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients: list[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)

    db = SessionLocal()
    history = db.query(Message).order_by(Message.id).all()
    for msg in history:
        await websocket.send_text(json.dumps({
            "username": msg.username,
            "text": msg.text,
        }))
    db.close()

    try:
        while True:
            data = await websocket.receive_text()
            parsed = json.loads(data)

            db = SessionLocal()
            db_message = Message(username=parsed["username"], text=parsed["text"])
            db.add(db_message)
            db.commit()
            db.close()

            for client in connected_clients:
                await client.send_text(data)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)