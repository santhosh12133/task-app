# Orion Task App

Premium full-stack AI-powered task management app with Node/Express + MongoDB backend and React/Vite frontend.

## Tech Stack

- Backend: Node.js, Express 5, MongoDB (Mongoose), JWT, Google auth verification, OpenAI SDK, Socket.io
- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Security: Helmet, CORS, rate limiting, cookie parser

## Project Structure

- `server.js` - backend bootstrap + API + static serving
- `routes/` - API routes (`auth`, `tasks`, `ai`, `notes`, `dashboard`)
- `models/` - Mongoose schemas
- `middleware/` - auth and error handling
- `utils/` - JWT, AI helpers, Socket.io setup
- `client/` - React + Vite app
- `tests/` - node:test smoke tests

## Environment Variables

Create `.env` in the project root (or copy from `.env.example`):

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `CLIENT_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PORT`
- `NODE_ENV`

For frontend Google Sign-In, create `client/.env`:

- `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
- `VITE_API_BASE_URL=http://localhost:5000/api`

## Local Development

### 1) Install backend dependencies

```powershell
npm install --legacy-peer-deps
```

### 2) Install frontend dependencies

```powershell
Push-Location client
npm install --legacy-peer-deps
Pop-Location
```

### 3) Start backend

```powershell
npm start
```

### 4) Start frontend

```powershell
Push-Location client
npm run dev
Pop-Location
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## Tests and Checks

Run smoke tests:

```powershell
npm test
```

Optional syntax check:

```powershell
Get-ChildItem -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Realtime Events

Socket.io is initialized in `server.js` through `utils/socket.js`.
Task API emits user-scoped events:

- `task:created`
- `task:updated`
- `task:toggled`
- `task:reordered`
- `task:deleted`

Clients can authenticate socket connections using JWT in handshake `auth.token`.

## Deployment

### Backend (Render / Railway)

- Deploy the root project as a Node service.
- Start command: `npm start`
- Set environment variables from `.env.example`.
- Ensure MongoDB URI is reachable from the deployment platform.

### Frontend (Vercel)

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to your deployed backend API URL.

## Notes

- If `OPENAI_API_KEY` is not set, AI endpoints return sensible fallback suggestions.
- Google login supports token verification when `GOOGLE_CLIENT_ID` is configured.
# task-app
