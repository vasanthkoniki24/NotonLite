Notion-Lite – Real-Time Collaborative Notes & Task Board

A full-stack web application for real-time collaborative note editing, Kanban task management, and multi-user workspace interaction.

---

Tech Stack

Backend

- FastAPI
- PostgreSQL
- SQLAlchemy (Async)
- Alembic
- JWT Authentication
- WebSockets

Frontend

- React (Vite)
- Zustand
- React Query
- Tailwind CSS
- Framer Motion
- @dnd-kit

---

Project Structure

notion-lite/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── websockets/
│   │   └── main.py
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
└── docker-compose.yml

---

Docker Setup

Clone

git clone https://github.com/your-username/notion-lite.git
cd notion-lite

Run

docker-compose up --build

Services

Service| URL
Backend| http://localhost:9000
Frontend| http://localhost:5173
Swagger| http://localhost:9000/docs
PostgreSQL| localhost:5432

Stop

docker-compose down

---

API Endpoints

Auth

- POST /auth/register
- POST /auth/login
- GET /auth/me

Workspaces

- POST /workspaces
- GET /workspaces
- GET /workspaces/{id}
- POST /workspaces/{id}/invite

Notes

- POST /notes
- GET /notes/{workspace_id}
- PATCH /notes/{id}
- DELETE /notes/{id}
- GET /notes/{id}/versions

Tasks

- POST /tasks
- GET /tasks/{workspace_id}
- PATCH /tasks/{id}
- DELETE /tasks/{id}

Comments

- POST /comments
- GET /comments/{task_id}

Notifications

- GET /notifications
- PATCH /notifications/{id}/read

---

WebSocket

ws://localhost:9000/ws/workspaces/{workspace_id}

---

Events

- task_updated
- note_updated
- user_joined
- user_left

---

Roles

- Owner → Full access
- Editor → Create & update
- Viewer → Read-only