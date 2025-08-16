# React + FastAPI Todo Application

A simple todo list application built with React frontend and FastAPI backend.

## Features

- ✅ Create, read, update, and delete todos
- ✅ Mark todos as completed
- ✅ Clean, responsive UI with Tailwind CSS
- ✅ RESTful API with FastAPI
- ✅ Dockerized for easy development

## Quick Start

1. Clone the repository
2. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open your browser:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo