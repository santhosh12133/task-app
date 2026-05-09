Render deployment (recommended for backend + static frontend):

1. Create a new Web Service on Render (https://render.com).
2. Connect your GitHub repo and choose the repo root.
3. Build Command: `npm install --legacy-peer-deps && cd client && npm install --legacy-peer-deps && npm run build && cd ..`
4. Start Command: `npm start`
5. Set Environment:
   - `MONGODB_URI` to your production MongoDB connection string
   - `JWT_SECRET`, `OPENAI_API_KEY`, `CLIENT_ORIGIN` and other secrets
6. Render will build and start your Node server which will serve the `client/dist` static files if present.

Vercel deployment (frontend on Vercel, backend on Render/Railway):

- Frontend (client/):
  1. In Vercel, create a new project, connect the repo, and set the root directory to `client`.
  2. Build Command: `npm install --legacy-peer-deps && npm run build`
  3. Output Directory: `dist`
  4. Set env: `VITE_API_BASE_URL` to your backend URL (e.g., `https://your-backend.onrender.com/api`)

- Backend: Deploy separately to Render, Railway, or Fly.io using the Render steps above.

Notes:
- Use environment variables for secrets; do NOT commit `.env` to the repo.
- For CI, prefer `--legacy-peer-deps` only if you encounter ERESOLVE peer conflicts.
- For HTTPS and custom domains, configure in your hosting provider dashboard.
