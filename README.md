Notion-Lite – Real-Time Collaborative Notes & Task Board

A full-stack web application for real-time collaborative note editing, Kanban task management, and multi-user workspace interaction. Users can create notes, manage tasks, collaborate live, and receive real-time updates with role-based access control.

---

Tech Stack

Backend

- FastAPI
- PostgreSQL
- SQLAlchemy (Async)
- Alembic
- JWT Authentication
- WebSockets (Real-time)

Frontend

- React (Vite)
- Zustand
- React Query
- Tailwind CSS
- Framer Motion
- @dnd-kit (Drag and Drop)

---

Project Structure

notion-lite/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── workspaces.py
│   │   │       ├── notes.py
│   │   │       ├── tasks.py
│   │   │       ├── comments.py
│   │   │       └── notifications.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── init_db.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── workspace.py
│   │   │   ├── note.py
│   │   │   ├── note_version.py
│   │   │   ├── task.py
│   │   │   ├── comment.py
│   │   │   └── notification.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── workspace.py
│   │   │   ├── note.py
│   │   │   ├── task.py
│   │   │   ├── comment.py
│   │   │   └── notification.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── workspace_service.py
│   │   │   ├── note_service.py
│   │   │   ├── task_service.py
│   │   │   ├── comment_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── websockets/
│   │   │   ├── manager.py
│   │   │   ├── handlers.py
│   │   │   └── routes.py
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js
    │   │   ├── authApi.js
    │   │   ├── workspaceApi.js
    │   │   ├── noteApi.js
    │   │   ├── taskApi.js
    │   │   ├── commentApi.js
    │   │   └── notificationApi.js
    │   │
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── NoteEditor.jsx
    │   │
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Workspace.jsx
    │   │   ├── Notes.jsx
    │   │   ├── Kanban.jsx
    │   │   └── Notifications.jsx
    │   │
    │   ├── store/
    │   │   ├── authStore.js
    │   │   └── workspaceStore.js
    │   │
    │   ├── hooks/
    │   │   └── useSocket.js
    │   │
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── .env

---

Docker Setup

1. Clone Repository

git clone https://github.com/your-username/notion-lite.git
cd notion-lite

2. Run with Docker

docker-compose up --build

3. Services

Service| URL
Backend API| http://localhost:9000
Frontend| http://localhost:5173
Swagger Docs| http://localhost:9000/docs
PostgreSQL| localhost:5432

4. Stop Containers

docker-compose down

5. Rebuild

docker-compose up --build --force-recreate

---

API Endpoints

Auth

POST /auth/register

- Register a new user
- Auth Required: No

POST /auth/login

- Login and receive JWT token
- Auth Required: No

GET /auth/me

- Get current user
- Auth Required: Yes

---

Workspaces

POST /workspaces

- Create workspace

GET /workspaces

- List user workspaces

GET /workspaces/{id}

- Get workspace details

POST /workspaces/{id}/invite

- Invite user (Owner only)

---

Notes

POST /notes

- Create note

GET /notes/{workspace_id}

- List notes

PATCH /notes/{id}

- Update note

DELETE /notes/{id}

- Delete note

GET /notes/{id}/versions

- Get note history

---

Tasks

POST /tasks

- Create task

GET /tasks/{workspace_id}

- List tasks

PATCH /tasks/{id}

- Update task

DELETE /tasks/{id}

- Delete task

---

Comments

POST /comments

- Add comment

GET /comments/{task_id}

- Get comments

---

Notifications

GET /notifications

- Get user notifications

PATCH /notifications/{id}/read

- Mark as read

---

WebSocket

Endpoint:

ws://localhost:9000/ws/workspaces/{workspace_id}

---

Events

- task_updated → task created/updated/moved
- note_updated → note edited
- user_joined → user connected
- user_left → user disconnected

---

Role-Based Access

- Owner → Full access
- Editor → Create & update
- Viewer → Read-only