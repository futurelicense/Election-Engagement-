# Election Engagement – Backend API

Node.js/Express API for the Election Engagement platform. Uses **Supabase** (PostgreSQL) and JWT auth.

## Where it lives

- **In this repo:** `Election-Engagement--main/backend/`
- **API base path:** `/api` (e.g. `http://localhost:3000/api`)

## Quick start

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `SUPABASE_URL` – Supabase project URL  
   - `SUPABASE_SERVICE_KEY` – Supabase service role key  
   - `JWT_SECRET` – Secret for signing JWTs (min 32 chars)  
   - `CORS_ORIGIN` – Frontend origin(s), e.g. `http://localhost:5173` or `https://your-app.vercel.app`

3. **Database**
   - In Supabase Dashboard → SQL Editor, run the schema from the frontend repo: `../src/database.supabase.sql`

4. **Confirm Supabase connection**
   ```bash
   node check-supabase.mjs
   ```
   Should print `✅ Supabase connection OK`. If not, fix `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`.

5. **Run**
   ```bash
   npm run dev
   ```
   API: `http://localhost:3000/api`

## Scripts

- `npm run dev` – Start with hot reload (tsx)
- `npm run build` – Compile TypeScript to `dist/`
- `npm start` – Run production build (`node dist/index.js`)

## Endpoints (overview)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/countries`
- `GET/POST/PUT/DELETE /api/elections`, `GET /api/elections/:id/stats`
- `GET/POST/PUT/DELETE /api/candidates`
- `POST /api/votes`, `GET /api/votes/check/:electionId`, `GET /api/votes/user`
- `GET/POST/PUT/DELETE /api/news`
- `GET/POST /api/comments/election/:id`, `POST /api/comments`, etc.
- `GET/POST /api/chat/rooms`, `GET/POST /api/chat/rooms/:id/messages`, etc.
- `GET/PUT /api/settings`, `GET/PUT /api/settings/:key`

See project root `CRUD_IMPLEMENTATION.md` and `README.md` for full API details.

## Deployment (e.g. Render)

1. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `CORS_ORIGIN` (include your Vercel frontend URL).
2. Build: `npm run build`
3. Start: `npm start`
4. Point frontend `VITE_API_BASE_URL` to this API (e.g. `https://your-backend.onrender.com/api`).
