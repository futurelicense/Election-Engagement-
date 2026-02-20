# Supabase Database Setup

The Election Engagement backend uses **Supabase (PostgreSQL)**. Use this guide to create and configure your database.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Project created in Supabase Dashboard

## Steps

### 1. Create a project

1. Go to [Supabase Dashboard](https://app.supabase.com) and create a new project (or use an existing one).
2. Note your **Project URL** and **service_role** key: **Settings → API**. You will need these for `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in backend env.

### 2. Run the schema

1. In the Supabase Dashboard, open **SQL Editor**.
2. Open the file **`backend/supabase/schema.sql`** from this repo.
3. Copy its contents and paste into the SQL Editor.
4. Run the script. It creates all required tables, indexes, and types. It is idempotent where possible (e.g. `CREATE TABLE IF NOT EXISTS`).

**Important:** The schema in `src/database.sql` is **MySQL** (legacy/reference). For Supabase you **must** use **`backend/supabase/schema.sql`** (PostgreSQL).

### 3. Create an admin user (optional)

After the schema is applied, create at least one admin user for the platform. You can do this via your app’s **Sign up** flow, then promote the user in Supabase:

1. **SQL Editor** in Supabase, run:

```sql
-- Replace 'user_xxxxxxxx' with the actual user id from the users table
-- (get it after registering once via the app)
UPDATE users SET is_admin = true WHERE email = 'admin@yourdomain.com';
```

Or insert a user manually (use a real bcrypt hash for `pin_hash`; e.g. hash of `"1234"` with 10 rounds):

```sql
INSERT INTO users (id, name, email, pin_hash, is_admin, is_sub_admin)
VALUES (
  'user_admin',
  'Admin User',
  'admin@election.com',
  '$2a$10$...',  -- replace with bcrypt hash of your PIN
  true,
  false
);
```

### 4. Configure the backend

In **backend/.env** (or Vercel Environment Variables for production):

- `SUPABASE_URL` – Project URL from Supabase
- `SUPABASE_SERVICE_KEY` – **service_role** key (never expose in frontend)
- `JWT_SECRET` – Min 32 characters, used to sign JWTs

See **ENV.md** (project root) for a full list of variables.

## Tables overview

| Table               | Purpose                          |
|---------------------|----------------------------------|
| users               | App users; is_admin, is_sub_admin for roles |
| countries           | Countries with elections        |
| elections           | Elections per country            |
| candidates          | Candidates per election; vote_display_override for admin override |
| votes               | One vote per user per election (unique constraint) |
| news, news_tags, news_hashtags | News and metadata   |
| comments            | Comments (likes = denormalized count) |
| comment_likes, comment_reactions | Comment engagement |
| chat_rooms, chat_messages, chat_moderators | Chat |
| platform_settings   | Key-value settings               |

## Troubleshooting

- **"relation does not exist"** – Ensure you ran **`backend/supabase/schema.sql`** in the SQL Editor, not `src/database.sql`.
- **"JWT_SECRET is not set"** – Set it in backend `.env` or Vercel env.
- **403 on admin routes** – Ensure the user has `is_admin = true` (or `is_sub_admin = true` for sub-admin routes) in the `users` table; JWT is issued with these flags at login.
