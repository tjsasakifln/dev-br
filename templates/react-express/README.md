# React + Express.js Application

A full-stack application template with React (TypeScript + Vite) frontend and Express.js (TypeScript) backend.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Node.js
- **Containerization**: Docker, Docker Compose

## Project Structure

```
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        └── App.tsx
```

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation and Execution

1. Clone this template
2. Navigate to the project directory
3. Start the application:

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### API Endpoints

- `GET /api/health` - Health check endpoint that returns `{ status: 'ok' }`

## Development

### Backend (Express.js)

The backend runs on port 3001 and provides a REST API.

### Frontend (React)

The frontend runs on port 3000 and is configured with a Vite proxy to forward API calls to the backend.

### Hot Reload

Both frontend and backend support hot reload during development when running with Docker Compose.