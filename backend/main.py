import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stockage en mémoire (temporaire — on ajoutera SQLite plus tard)
messages: list[dict] = []

# Liste des clients WebSocket connectés
connected_clients: list[WebSocket] = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)

    # Envoyer l'historique au nouveau client
    for msg in messages:
        await websocket.send_text(json.dumps(msg))

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            messages.append(message)

            # Diffuser à tous les clients connectés
            for client in connected_clients:
                await client.send_text(json.dumps(message))
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
