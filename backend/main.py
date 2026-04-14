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
messages: list[str] = []

# Liste des clients WebSocket connectés
connected_clients: list[WebSocket] = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)

    # Envoyer l'historique des messages au nouveau client
    for msg in messages:
        await websocket.send_text(msg)

    try:
        while True:
            # Attendre un message du client
            text = await websocket.receive_text()
            messages.append(text)

            # Diffuser à TOUS les clients connectés
            for client in connected_clients:
                await client.send_text(text)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
