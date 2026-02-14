# Troubleshooting Guide

## Login Issues

### Problem: "Login failed. Please try again."

#### Solution 1: Setup Demo Users with Proper PIN Hashes

The database might have placeholder PIN hashes. Run the setup script:

```bash
cd backend
pnpm setup:users
```

This will create/update users with properly hashed PINs:
- **Admin**: `admin@election.com` / PIN: `1234`
- **User**: `user@example.com` / PIN: `5678`
- **Demo users**: Use their email / PIN: `1234`

#### Solution 2: Check Backend is Running

```bash
cd backend
pnpm dev
```

The backend should be running on `http://localhost:3000`

#### Solution 3: Check API Connection

1. Open browser console (F12)
2. Check Network tab for failed requests
3. Verify `VITE_API_BASE_URL` in frontend `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

#### Solution 4: Check Database Connection

1. Verify Supabase credentials in `backend/.env`:
   ```env
   SUPABASE_URL=https://pwcmyidxdyetvyiuosnm.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

2. Test connection:
   ```bash
   cd backend
   pnpm dev
   # Check console for connection errors
   ```

#### Solution 5: Create New User

If demo users don't work, create a new user:

1. Go to `/signup`
2. Register with:
   - Name: Your Name
   - Email: your@email.com
   - PIN: Your PIN (remember it!)
3. Then login with those credentials

### Problem: "Invalid credentials"

This means:
- User doesn't exist in database, OR
- PIN is incorrect

**Fix**: Run the setup script or create a new user via signup.

### Problem: CORS Error

If you see CORS errors in console:

1. Check `CORS_ORIGIN` in `backend/.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

2. Restart backend server

### Problem: "Network Error" or "Failed to fetch"

1. **Backend not running**: Start backend with `pnpm dev` in `backend/` folder
2. **Wrong API URL**: Check `VITE_API_BASE_URL` in frontend `.env`
3. **Port conflict**: Make sure port 3000 is available

## Database Issues

### Problem: Tables don't exist

Run the Supabase SQL schema:

1. Go to Supabase Dashboard → SQL Editor
2. Run `src/database.supabase.sql`
3. Then run `backend/src/database/setupUsers.sql` to fix PIN hashes

### Problem: Users exist but can't login

The PIN hashes are placeholders. Run:

```bash
cd backend
pnpm setup:users
```

Or manually update PIN hashes in Supabase using the SQL in `backend/src/database/setupUsers.sql`

## API Issues

### Problem: 401 Unauthorized

- Token expired or invalid
- User not logged in
- Solution: Logout and login again

### Problem: 403 Forbidden

- User doesn't have admin privileges
- Solution: Login as admin user (`admin@election.com`)

### Problem: 500 Internal Server Error

- Check backend console for error details
- Verify database connection
- Check environment variables

## Quick Fix Checklist

1. ✅ Backend running on port 3000?
2. ✅ Frontend running on port 5173?
3. ✅ `.env` files configured correctly?
4. ✅ Database schema run in Supabase?
5. ✅ Demo users setup with proper PIN hashes?
6. ✅ Browser console shows any errors?

## Still Having Issues?

1. Check browser console (F12) for errors
2. Check backend console for errors
3. Verify all environment variables
4. Test API directly: `curl http://localhost:3000/api/health`
5. Check Supabase dashboard for data

## Common Commands

```bash
# Start backend
cd backend
pnpm dev

# Setup demo users
cd backend
pnpm setup:users

# Start frontend
pnpm dev

# Check backend health
curl http://localhost:3000/api/health
```

