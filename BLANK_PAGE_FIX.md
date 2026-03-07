# Blank Page Fix Guide

## ✅ What I Fixed

1. **Added Error Boundary** - Catches React errors and shows a friendly message
2. **Improved API Error Handling** - API failures won't crash the app
3. **Added Loading States** - Shows spinners while data loads
4. **Made Contexts Resilient** - Falls back to empty arrays if API fails
5. **Better Error Messages** - Shows helpful error messages instead of blank page

## 🔍 Debugging Steps

### 1. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab** - Look for red errors
- **Network tab** - Check if API calls are failing

### 2. Check Backend is Running

```bash
cd backend
pnpm dev
```

Should see: `🚀 Server running on http://localhost:3000`

### 3. Check Frontend Environment

Create `.env` file in root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Test API Connection

Open browser console and run:

```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{ status: 'ok', timestamp: '...' }`

### 5. Check Network Requests

In browser DevTools → Network tab:
- Look for failed requests (red)
- Check if requests are going to correct URL
- Verify CORS headers

## 🐛 Common Issues

### Issue: "Failed to fetch" or Network Error

**Cause**: Backend not running or wrong API URL

**Fix**:
1. Start backend: `cd backend && pnpm dev`
2. Check `.env` has: `VITE_API_BASE_URL=http://localhost:3000/api`
3. Restart frontend: `pnpm dev`

### Issue: CORS Error

**Cause**: Backend CORS not configured

**Fix**: Check `backend/.env` has:
```env
CORS_ORIGIN=http://localhost:5173
```

### Issue: 401 Unauthorized

**Cause**: Token expired or invalid

**Fix**: Logout and login again

### Issue: 500 Internal Server Error

**Cause**: Database connection issue

**Fix**: 
1. Check Supabase credentials in `backend/.env`
2. Verify database schema is set up
3. Check backend console for errors

## 🚀 Quick Test

1. **Open browser console** (F12)
2. **Check for errors** - Look for red error messages
3. **Check Network tab** - See if API calls are being made
4. **Try direct API call**:
   ```javascript
   fetch('http://localhost:3000/api/countries')
     .then(r => r.json())
     .then(console.log)
   ```

## 📝 What to Look For

### In Browser Console:
- ❌ Red errors = Something is broken
- ⚠️ Yellow warnings = Non-critical issues
- ✅ No errors = App should work

### In Network Tab:
- ✅ Green (200) = Success
- ❌ Red (4xx/5xx) = Error
- ⏳ Pending = Request in progress

## 🔧 If Still Blank

1. **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear cache**: DevTools → Application → Clear Storage
3. **Check React DevTools**: Install React DevTools extension
4. **Check terminal**: Look for build errors in frontend terminal

The app should now show:
- Loading spinner while data loads
- Error message if API fails (but page still renders)
- Content once data loads successfully

