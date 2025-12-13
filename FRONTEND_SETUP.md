# Frontend Setup - Connect to Render Backend

## Quick Setup

### Step 1: Get Your Render Backend URL

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service
3. Copy the service URL (e.g., `https://election-engagement-backend.onrender.com`)

### Step 2: Create `.env` File

Create a `.env` file in the root directory (same level as `package.json`):

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

**Important:** 
- Replace `your-backend-service` with your actual Render service name
- Make sure to include `/api` at the end
- Use `https://` (not `http://`)

### Step 3: Update Backend CORS Settings

In your Render dashboard, go to your backend service → **Environment** tab and update:

```
CORS_ORIGIN=https://your-frontend-domain.com
```

Replace `your-frontend-domain.com` with:
- Your frontend URL if deployed (e.g., `https://your-app.vercel.app`)
- Or `http://localhost:5173` for local development

### Step 4: Restart Frontend

After creating `.env`:
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
pnpm dev
```

---

## Example `.env` File

```env
# For local development with Render backend
VITE_API_BASE_URL=https://election-engagement-backend.onrender.com/api
```

---

## Verify Connection

1. Open browser console (F12)
2. Try logging in or loading data
3. Check Network tab for API calls
4. Should see requests to: `https://your-backend.onrender.com/api/...`

---

## Troubleshooting

### Issue: CORS Errors
**Solution:** Update `CORS_ORIGIN` in Render environment variables to match your frontend URL.

### Issue: 404 Not Found
**Solution:** 
- Check backend URL is correct
- Make sure `/api` is included at the end
- Verify backend is deployed and running

### Issue: Connection Refused
**Solution:**
- Check if backend service is running in Render dashboard
- Verify the backend URL is correct
- Check Render service logs for errors

---

## For Production Deployment

When deploying frontend (Vercel, Netlify, etc.):

1. Add `VITE_API_BASE_URL` to your deployment platform's environment variables
2. Set it to your Render backend URL: `https://your-backend.onrender.com/api`
3. Redeploy your frontend

