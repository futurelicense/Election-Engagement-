# Deploy on Vercel – Fix HTTP 500 on /api/candidates and /api/settings

The API runs as serverless functions on Vercel. If you see **HTTP 500** on `/api/candidates`, `/api/settings`, or other API routes, the backend is missing environment variables. Vercel does **not** use your local `.env` file; you must set variables in the dashboard.

## 1. Add environment variables in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) and select your project (e.g. **Election-Engagement-** or **nigeriaelection**).
2. Go to **Settings** → **Environment Variables**.
3. Add these variables (use **Production**, and optionally **Preview**):

| Name | Value | Required |
|------|--------|----------|
| `SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxxx.supabase.co` | Yes |
| `SUPABASE_SERVICE_KEY` | Your Supabase **service_role** key (Project Settings → API) | Yes |
| `JWT_SECRET` | A long random string (min 32 chars) for auth tokens | Yes (for login/signup) |
| `CORS_ORIGIN` | Your frontend origin, e.g. `https://www.nigeriaelection.com` | Recommended |

**Where to get Supabase values**

- Supabase Dashboard → **Project Settings** → **API**
- **Project URL** → use as `SUPABASE_URL`
- **service_role** key (under "Project API keys") → use as `SUPABASE_SERVICE_KEY`  
  (Keep this secret; never expose in frontend.)

**CORS_ORIGIN**

- For **https://www.nigeriaelection.com** set:  
  `CORS_ORIGIN=https://www.nigeriaelection.com`
- For multiple origins (e.g. + Vercel preview):  
  `CORS_ORIGIN=https://www.nigeriaelection.com,https://your-app.vercel.app`

## 2. Redeploy

After saving the variables:

- **Redeploy** the latest deployment (Deployments → ⋮ → Redeploy), or  
- Push a new commit so Vercel runs a fresh build.

New serverless invocations will then have access to `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, and `/api/candidates` and `/api/settings` should return 200 instead of 500.

## 3. Quick check

- Open: `https://www.nigeriaelection.com/api/health`  
  You should see: `{"ok":true}`.
- Then try: `https://www.nigeriaelection.com/api/candidates`  
  You should get JSON (array of candidates or `[]`), not 500.

If you still get 500, check the **Function Logs** for that project in Vercel (Logs or Deployments → select deployment → Functions) to see the exact error.
