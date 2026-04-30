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

notion-lite
├── backend
│   ├── app
│   │   ├── api
│   │   │   └── v1
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── workspaces.py
│   │   │       ├── notes.py
│   │   │       ├── tasks.py
│   │   │       ├── comments.py
│   │   │       └── notifications.py
│   │   │
│   │   ├── core
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── db
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── init_db.py
│   │   │
│   │   ├── models
│   │   │   ├── user.py
│   │   │   ├── workspace.py
│   │   │   ├── note.py
│   │   │   ├── note_version.py
│   │   │   ├── task.py
│   │   │   ├── comment.py
│   │   │   └── notification.py
│   │   │
│   │   ├── schemas
│   │   │   ├── user.py
│   │   │   ├── workspace.py
│   │   │   ├── note.py
│   │   │   ├── task.py
│   │   │   ├── comment.py
│   │   │   └── notification.py
│   │   │
│   │   ├── services
│   │   │   ├── auth_service.py
│   │   │   ├── workspace_service.py
│   │   │   ├── note_service.py
│   │   │   ├── task_service.py
│   │   │   ├── comment_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── websockets
│   │   │   ├── manager.py
│   │   │   ├── handlers.py
│   │   │   └── routes.py
│   │   │
│   │   └── main.py
│   │
│   ├── alembic
│   │   ├── versions
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
│
└── frontend
    ├── src
    │   ├── api
    │   │   ├── axios.js
    │   │   ├── authApi.js
    │   │   ├── workspaceApi.js
    │   │   ├── noteApi.js
    │   │   ├── taskApi.js
    │   │   ├── commentApi.js
    │   │   └── notificationApi.js
    │   │
    │   ├── components
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── NoteEditor.jsx
    │   │
    │   ├── pages
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Workspace.jsx
    │   │   ├── Notes.jsx
    │   │   ├── Kanban.jsx
    │   │   └── Notifications.jsx
    │   │
    │   ├── store
    │   │   ├── authStore.js
    │   │   └── workspaceStore.js
    │   │
    │   ├── hooks
    │   │   └── useSocket.js
    │   │
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── .env

---

---

Docker Setup

1. Clone Repository

git clone https://github.com/your-username/notion-lite.git
cd notion-lite

---

2. Run with Docker

docker-compose up --build

---

3. Services

Service| URL
Backend API| http://localhost:9000
Frontend| http://localhost:5173
Swagger Docs| http://localhost:9000/docs
PostgreSQL| localhost:5432

---

4. Stop Containers

docker-compose down

---

5. Rebuild (if needed)

docker-compose up --build --force-recreate

---

Docker Architecture

- backend → FastAPI app (port 9000)
- frontend → React Vite app (port 5173)
- postgres → Database (port 5432)

All services communicate via Docker network.

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
- Auth Required: Yes

GET /workspaces

- List user workspaces
- Auth Required: Yes

GET /workspaces/{id}

- Get workspace details
- Auth Required: Yes

POST /workspaces/{id}/invite

- Invite user
- Auth Required: Owner only

---

Notes

POST /notes

- Create note
- Auth Required: Editor/Owner

GET /notes/{workspace_id}

- List notes
- Auth Required: Yes

PATCH /notes/{id}

- Update note
- Auth Required: Editor/Owner

DELETE /notes/{id}

- Delete note
- Auth Required: Owner only

GET /notes/{id}/versions

- Get note history
- Auth Required: Yes

---

Tasks

POST /tasks

- Create task
- Auth Required: Editor/Owner

GET /tasks/{workspace_id}

- List tasks
- Auth Required: Yes

PATCH /tasks/{id}

- Update task
- Auth Required: Editor/Owner

DELETE /tasks/{id}

- Delete task
- Auth Required: Owner only

---

Comments

POST /comments

- Add comment to task
- Auth Required: Yes

GET /comments/{task_id}

- Get task comments
- Auth Required: Yes

---

Notifications

GET /notifications

- Get user notifications
- Auth Required: Yes

PATCH /notifications/{id}/read

- Mark notification as read
- Auth Required: Yes

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

Owner → Full access
Editor → Create & update
Viewer → Read-only

---
