# Chat-App

Application de chat en temps réel avec un assistant IA intégré, conçue comme compagnon du jeu éducatif **SQLock Holmes** où les joueurs résolvent des enquêtes policières en écrivant des requêtes SQL (PostgreSQL).

## Fonctionnalités

- **Chat temps réel** entre plusieurs utilisateurs via WebSocket
- **Historique persistant** des messages (SQLite)
- **Assistant IA** (Mistral) qui guide les joueurs bloqués sur leurs requêtes SQL sans donner directement la réponse

## Architecture

Le projet est organisé en deux parties :

- [backend/](backend/) — API **FastAPI** (Python) : endpoint WebSocket `/ws` pour le chat et endpoint REST `/api/ai` pour l'assistant IA, avec persistance SQLAlchemy / SQLite.
- [frontend/](frontend/) — Application **Angular 21** (TypeScript) consommant le WebSocket et l'API IA.

## Prérequis

- Python 3.11+
- Node.js 20+ et npm 11+
- Une clé API Mistral (variable d'environnement `MISTRAL_API_KEY`)

## Démarrage

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
echo "MISTRAL_API_KEY=votre_clé" > .env
uvicorn main:app --reload