# Connect Frontend to Render Backend - Step by Step

## 🔍 Step 1: Get Your Render Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (e.g., `election-engagement-backend`)
3. Copy the URL from the top of the page
   - It will look like: `https://election-engagement-backend.onrender.com`
   - **Note:** Don't include `/api` in the URL yet

## 📝 Step 2: Update Frontend `.env` File

### Option A: Manual Update

1. Open `.env` file in the root directory
2. Replace the content with:

```env
VITE_API_BASE_URL=https://election-engagement-backend.onrender.com/api
```

**Replace `YOUR-SERVICE-NAME` with your actual Render service name.**

Example:
```env
VITE_API_BASE_URL=https://election-engagement-backend.onrender.com/api
```

### Option B: Quick Command

Run this command (replace `YOUR-SERVICE-NAME`):

```bash
echo "VITE_API_BASE_URL=https://YOUR-SERVICE-NAME.onrender.com/api" > .env
```

## 🔐 Step 3: Update Render CORS Settings

**IMPORTANT:** You must update CORS in Render to allow your frontend to make requests.

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service
3. Go to **Environment** tab
4. Find or add `CORS_ORIGIN` variable
5. Set it to:
   - **For local development:** `http://localhost:5173`
   - **For production (if frontend is deployed):** Your frontend URL (e.g., `https://your-app.vercel.app`)

**If you're testing locally, use:**
```
CORS_ORIGIN=http://localhost:5173
```

6. Click **Save Changes**
7. Render will automatically redeploy (or manually trigger a deploy)

## 🔄 Step 4: Restart Frontend

After updating `.env`:

```bash
# Stop the current dev server (Ctrl+C or Cmd+C)
# Then restart:
pnpm dev
```

**Important:** Vite requires a restart to pick up new environment variables.

## ✅ Step 5: Test Connection

1. Open your browser console (F12)
2. Go to the **Network** tab
3. Try to:
   - Log in
   - Load elections
   - View any data
4. Check the Network tab - you should see requests to:
   - `https://your-service.onrender.com/api/...`

### Expected Behavior:
- ✅ Requests go to your Render backend
- ✅ No CORS errors in console
- ✅ Data loads successfully

### If You See Errors:

**CORS Error:**
- Check `CORS_ORIGIN` in Render is set correctly
- Make sure it matches your frontend URL exactly
- Wait for Render to redeploy after changing environment variables

**404 Not Found:**
- Verify the backend URL is correct
- Make sure `/api` is included at the end
- Check backend is running in Render dashboard

**Connection Refused:**
- Check if backend service is running (green status in Render)
- Verify the backend URL is correct
- Check Render service logs for errors

## 🎯 Quick Checklist

- [ ] Got Render backend URL
- [ ] Updated `.env` with Render URL (including `/api`)
- [ ] Updated `CORS_ORIGIN` in Render environment variables
- [ ] Restarted frontend dev server
- [ ] Tested connection in browser
- [ ] Verified API calls in Network tab

## 📋 Example Configuration

### Frontend `.env`:
```env
VITE_API_BASE_URL=https://election-engagement-backend.onrender.com/api
```

### Render Environment Variables:
```
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-key
JWT_SECRET=your-secret
NODE_ENV=production
PORT=10000
```

## 🚀 After Everything Works

Once you confirm the frontend is connecting to Render:

1. **For Production:** When you deploy your frontend (Vercel, Netlify, etc.), add `VITE_API_BASE_URL` to that platform's environment variables too.

2. **Update CORS:** Change `CORS_ORIGIN` in Render to your production frontend URL.

---

## 💡 Need Help?

If you're stuck:
1. Check Render service logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Make sure backend is running (green status in Render)

