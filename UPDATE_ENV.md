# Update Frontend to Connect to Render Backend

## Current Status
Your `.env` file is currently set to:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

This needs to be updated to your Render backend URL.

## Steps to Fix

### 1. Get Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Copy the URL from the top (e.g., `https://election-engagement-backend.onrender.com`)

### 2. Update `.env` File

Edit `.env` in the root directory and change:

**FROM:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**TO:**
```env
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE-NAME.onrender.com/api
```

**Replace `YOUR-RENDER-SERVICE-NAME` with your actual service name.**

### 3. Update Render CORS Settings

In Render dashboard:

1. Go to your backend service
2. Click **Environment** tab
3. Find `CORS_ORIGIN` variable
4. Set it to:
   - **For local dev:** `http://localhost:5173`
   - **For production:** Your frontend URL (if deployed)

### 4. Restart Frontend

```bash
# Stop current server (Ctrl+C)
# Then restart:
pnpm dev
```

### 5. Test Connection

1. Open browser console (F12)
2. Try logging in
3. Check Network tab - should see requests to your Render backend

---

## Quick Command (if you know your Render URL)

Replace `YOUR-SERVICE-NAME` with your actual Render service name:

```bash
echo "VITE_API_BASE_URL=https://YOUR-SERVICE-NAME.onrender.com/api" > .env
```

Then restart: `pnpm dev`

