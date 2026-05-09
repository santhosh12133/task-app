# Task App

Full-stack AI-powered task management application with a Node.js/Express API, MongoDB database, and a React + Vite frontend.

## Features

- Task management with status updates, ordering, and realtime sync
- Notes and dashboard modules
- JWT-based authentication plus Google sign-in support
- AI assistant endpoints with fallback behavior when API keys are unavailable
- Responsive frontend built with modern React tooling

## Tech Stack

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`)
- Google token verification (`google-auth-library`)
- Socket.IO for realtime events
- Zod validation
- Security middleware: Helmet, CORS, rate limiting, cookie parser

### Frontend

- React 19 + Vite
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- React Hook Form + Zod

## Repository Structure

- `server.js` - server bootstrap and startup
- `app.js` - app composition/middleware wiring
- `routes/` - API endpoints (`auth`, `tasks`, `notes`, `dashboard`, `ai`)
- `models/` - Mongoose models
- `middleware/` - auth, validation, and error handling middleware
- `config/` - environment and database setup
- `utils/` - helpers for JWT, sockets, activity logging, etc.
- `client/` - React frontend application
- `tests/` - backend tests (integration, smoke, jest suites)

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string (local or Atlas)

## Environment Variables

Create a `.env` file in the project root.

Required/commonly used variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `NODE_ENV`
- `CLIENT_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Create `client/.env` for frontend-specific values:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

## Installation

Install root dependencies:

```bash
npm install --legacy-peer-deps
```

Install client dependencies:

```bash
cd client
npm install --legacy-peer-deps
cd ..
```

## Running Locally

Run backend (from project root):

```bash
npm run dev
```

Run frontend (new terminal):

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Available Scripts

From project root:

- `npm start` - start backend server
- `npm run dev` - run backend in development mode
- `npm test` - run Node test suites
- `npm run test:api` - run API-focused Jest project
- `npm run test:ui` - run client Jest project from root config
- `npm run test:coverage` - run Jest with coverage
- `npm run test:e2e` - run Playwright e2e tests (delegates to client)
- `npm run lint` - lint repository
- `npm run build:client` - build frontend
- `npm run verify` - lint + tests + client build

From `client/`:

- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run test:e2e` - Playwright tests
- `npm run test:e2e:ui` - Playwright UI mode
- `npm run test:e2e:debug` - Playwright debug mode

## Realtime Events

Socket.IO is initialized on the backend and emits user-scoped task events such as:

- `task:created`
- `task:updated`
- `task:toggled`
- `task:reordered`
- `task:deleted`

Clients can pass JWT through socket handshake auth (`auth.token`) for user-specific channels.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment guidance.

Quick summary:

- Backend: Render/Railway/Fly as a Node web service
- Frontend: Vercel (recommended) or serve built static assets from backend
- Build root app with client build step before production deploy

## Security Notes

- Never commit `.env` files
- Use strong secrets for `JWT_SECRET`
- Restrict `CLIENT_ORIGIN` to trusted frontend domains in production

## License

ISC
