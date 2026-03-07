# Connect Frontend to Render Backend

## Quick Setup Guide

### Step 1: Get Your Render Backend URL

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service (e.g., `election-engagement-backend`)
3. Copy the service URL from the top of the page
   - Example: `https://election-engagement-backend.onrender.com`

### Step 2: Update Frontend `.env` File

Edit the `.env` file in the root directory and add/update:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

**Replace `your-backend-service` with your actual Render service name.**

**Important:**
- ✅ Include `/api` at the end
- ✅ Use `https://` (not `http://`)
- ✅ No trailing slash after `/api`

### Step 3: Update Backend CORS Settings

In your Render dashboard:

1. Go to your backend service
2. Click **Environment** tab
3. Find or add `CORS_ORIGIN`
4. Set it to your frontend URL:
   - **For local development:** `http://localhost:5173`
   - **For production:** `https://your-frontend-domain.com` (Vercel, Netlify, etc.)

### Step 4: Restart Frontend

After updating `.env`:

```bash
# Stop the dev server (Ctrl+C if running)
# Then restart:
pnpm dev
```

---

## Verify Connection

1. Open browser console (F12)
2. Try logging in or loading data
3. Check Network tab - you should see requests to:
   - `https://your-backend.onrender.com/api/auth/login`
   - `https://your-backend.onrender.com/api/countries`
   - etc.

---

## Example Configuration

### `.env` file:
```env
VITE_API_BASE_URL=https://election-engagement-backend.onrender.com/api
```

### Render Environment Variables:
```env
CORS_ORIGIN=http://localhost:5173
# OR for production:
# CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## Troubleshooting

### ❌ CORS Errors
**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Check `CORS_ORIGIN` in Render environment variables
2. Make sure it matches your frontend URL exactly
3. For local dev: `http://localhost:5173`
4. Redeploy backend after updating CORS_ORIGIN

### ❌ 404 Not Found
**Error:** `Failed to fetch` or `404 Not Found`

**Solution:**
1. Verify backend URL is correct in `.env`
2. Make sure `/api` is included: `https://backend.onrender.com/api`
3. Check backend is running in Render dashboard
4. Test backend directly: `https://backend.onrender.com/health`

### ❌ Connection Refused
**Error:** `Unable to connect to server`

**Solution:**
1. Check if backend service is running in Render
2. Verify the backend URL is correct
3. Check Render service logs for errors
4. Make sure backend deployed successfully

### ❌ Still Using Localhost
**Issue:** Frontend still calling `http://localhost:3000`

**Solution:**
1. Make sure `.env` file is in the root directory (same level as `package.json`)
2. Restart the dev server after creating/updating `.env`
3. Check `.env` file has correct variable name: `VITE_API_BASE_URL`
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## For Production Deployment

When deploying frontend to Vercel/Netlify/etc:

1. Add environment variable in your deployment platform:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend.onrender.com/api`

2. Update Render `CORS_ORIGIN` to your production frontend URL:
   - Example: `https://your-app.vercel.app`

3. Redeploy both frontend and backend

---

## Quick Checklist

- [ ] Got Render backend URL
- [ ] Updated `.env` with `VITE_API_BASE_URL`
- [ ] Updated Render `CORS_ORIGIN` environment variable
- [ ] Restarted frontend dev server
- [ ] Tested connection in browser console
- [ ] Verified API calls are going to Render backend

