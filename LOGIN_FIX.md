# Login Fix - Invalid Credentials

## ✅ Fixed!

The setup script has been run successfully. All demo users now have properly hashed PINs.

## 🔑 Login Credentials

### Admin User
- **Email**: `admin@election.com`
- **PIN**: `1234`

### Regular User
- **Email**: `user@example.com`
- **PIN**: `5678`

### Demo Users (All use PIN: 1234)
- `amaka.johnson@email.com` / PIN: `1234`
- `kwame.mensah@email.com` / PIN: `1234`
- `fatima.adeyemi@email.com` / PIN: `1234`
- `chidi.okafor@email.com` / PIN: `1234`

## 🧪 Test Your Login

### Option 1: Test via API (Development Only)

```bash
curl -X POST http://localhost:3000/api/test-auth/test \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@election.com","pin":"1234"}'
```

This will show you:
- If user exists
- If PIN hash is set
- If PIN is correct

### Option 2: Try Login in Frontend

1. Make sure backend is running: `cd backend && pnpm dev`
2. Make sure frontend is running: `pnpm dev`
3. Go to `/login`
4. Use: `admin@election.com` / `1234`

## 🔍 Troubleshooting

### Still Getting "Invalid credentials"?

1. **Check backend is running**
   ```bash
   cd backend
   pnpm dev
   ```
   Should see: `🚀 Server running on http://localhost:3000`

2. **Check user exists in database**
   - Go to Supabase Dashboard → Table Editor → `users`
   - Verify user exists with email `admin@election.com`
   - Check that `pin_hash` field is populated (not null)

3. **Re-run setup script**
   ```bash
   cd backend
   pnpm setup:users
   ```

4. **Check email case sensitivity**
   - Try: `admin@election.com` (lowercase)
   - The backend now normalizes email to lowercase

5. **Check browser console**
   - Open DevTools (F12)
   - Check Network tab for the login request
   - Look for error messages

6. **Test API directly**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@election.com","pin":"1234"}'
   ```

## 📝 What Was Fixed

1. ✅ Ran setup script to create proper PIN hashes
2. ✅ Improved error logging in backend
3. ✅ Added email normalization (lowercase, trim)
4. ✅ Added test endpoint for debugging
5. ✅ Better error messages

## 🚀 Next Steps

If login still doesn't work:

1. Check backend console for error messages
2. Verify Supabase connection
3. Test with the test endpoint above
4. Create a new user via `/signup` as a workaround

The setup script has successfully updated all users with proper PIN hashes, so login should work now!

