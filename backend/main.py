import json
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import SessionLocal, Message

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")

SYSTEM_PROMPT = (
    "Tu es l'assistant IA de SQLock Holmes, un jeu éducatif où les joueurs "
    "résolvent des enquêtes policières en écrivant des requêtes SQL (PostgreSQL). "
    "Ton rôle est d'aider les joueurs quand ils sont bloqués : "
    "- Explique les concepts SQL (SELECT, JOIN, WHERE, GROUP BY, sous-requêtes, etc.) "
    "- Donne des indices sur l'enquête sans donner directement la réponse "
    "- Aide à comprendre les erreurs dans les requêtes SQL "
    "- Oriente le joueur vers les bonnes tables ou colonnes à explorer "
    "Réponds en français, de manière concise et encourageante. "
    "Ne donne jamais la requête complète directement, guide le joueur étape par étape."
)


class AiRequest(BaseModel):
    question: str


@app.post("/api/ai")
async def ask_ai(request: AiRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-small-latest",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": request.question},
                ],
            },
            timeout=30.0,
        )
        data = response.json()
    return {"answer": data["choices"][0]["message"]["content"]}


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
            "created_at": msg.created_at.isoformat(),
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
            db.refresh(db_message)

            broadcast = json.dumps({
                "username": db_message.username,
                "text": db_message.text,
                "created_at": db_message.created_at.isoformat(),
            })
            db.close()

            for client in connected_clients:
                await client.send_text(broadcast)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)