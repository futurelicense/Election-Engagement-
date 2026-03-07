# Environment variables – where and what

## Summary

| Where           | File loaded              | When it’s used |
|----------------|--------------------------|----------------|
| **Frontend**   | Root `.env` (optional)   | `pnpm dev` / Vite build; only `VITE_*` are exposed |
| **Backend**    | `backend/.env`           | When you run from `backend/` (e.g. `npm run dev:backend`) |
| **Vercel**     | Dashboard env vars only  | No `.env` file; set in Project → Settings → Environment Variables |

---

## Frontend (root `.env`)

- **Loaded by:** Vite when you run `pnpm dev` or `npm run build`.
- **Only variables starting with `VITE_`** are exposed to the client (e.g. `import.meta.env.VITE_*`).

| Variable             | Required | Description |
|----------------------|----------|-------------|
| `VITE_API_BASE_URL`  | No       | API base. Default: `/api` (proxied in dev). Set to e.g. `http://localhost:3000/api` if you want to call the backend directly. |
| `VITE_SITE_URL`      | No       | Canonical site URL for SEO. Default: `window.location.origin` or `https://www.nigeriaelection.com`. |

**Example (root):** Copy from `.env.example`. For local dev you can leave both unset.

---

## Backend (`backend/.env`)

- **Loaded by:** `dotenv/config` in `backend/src/index.ts` when the Node process starts. The working directory is `backend/` when you run `npm run dev:backend` or `cd backend && pnpm dev`, so **`backend/.env`** is the one that’s loaded.
- **Never** commit real secrets; `.env` and `backend/.env` are in `.gitignore`.

| Variable                 | Required | Description |
|--------------------------|----------|-------------|
| `SUPABASE_URL`           | Yes      | Supabase project URL (e.g. `https://xxxxx.supabase.co`). |
| `SUPABASE_SERVICE_KEY`   | Yes      | Supabase **service_role** key (Project Settings → API). Use the **service_role** (secret) key, not the **anon** (public) key, or DB writes and auth will fail. |
| `JWT_SECRET`             | Yes      | Secret for signing JWTs (min 32 characters). |
| `CORS_ORIGIN`            | No       | Allowed CORS origins, comma-separated. Default: `http://localhost:5173`. |
| `PORT`                   | No       | Port the backend listens on. Default: `3000`. |

**Example:** Copy `backend/.env.example` to `backend/.env` and fill in real values.

---

## Vercel (production)

- **No `.env` file.** Set all variables in Vercel → Project → Settings → Environment Variables.
- Use the **same names** as the backend: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `CORS_ORIGIN`.
- Do **not** set `VITE_API_BASE_URL` for production if the app is served from the same origin (Vercel serves both frontend and `/api`).

See **DEPLOY_VERCEL.md** for the exact list and deployment steps.
