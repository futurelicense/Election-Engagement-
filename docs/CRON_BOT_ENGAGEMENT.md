# Automated Bot Engagement (Cron)

The app runs an **automated process at intervals** that triggers bot engagement: posting comments, liking comments, adding reactions, and sending chat messages. The logic lives in `backend/src/routes/cron.ts`.

## How it works

1. **Vercel Cron** (production only) calls `GET /api/cron/bot-engagement` on a schedule.
2. **Schedule** is set in `vercel.json` under `crons`. Default: **every 10 minutes** (`*/10 * * * *`).
3. The request is **secured** with `CRON_SECRET`: Vercel sends it as `Authorization: Bearer <CRON_SECRET>`.
4. The handler runs **one tick** of `runBotEngagementTick()`:
   - Ensures **bot users** exist (Ada, Chidi, Zainab) in `users` with `is_bot = true` (created on first run if missing).
   - Picks one random bot and one action: **comment** (weighted 2×), **like**, **reaction**, or **chat**.
   - **Comment**: Picks an election, inserts a comment with a phrase from `COMMENT_PHRASES`.
   - **Like**: Picks a recent top-level comment the bot hasn’t liked, inserts into `comment_likes` and updates `comments.likes`.
   - **Reaction**: Picks a recent comment, adds a reaction (👍, ❤️, or 🤔) in `comment_reactions`.
   - **Chat**: Picks a chat room, inserts a message with a phrase from `CHAT_PHRASES`.
5. Returns `{ ok, message, actions }` for logging.

## Database

- **Migration**: `backend/supabase/migrations/20250307100000_bot_users.sql` adds `is_bot` to `users` and an index.
- Run this in Supabase (SQL Editor or migrations) before or when the cron first runs. If `is_bot` is missing, the tick will no-op (no crash).
- Bot users are created automatically on first tick with fixed IDs: `bot_ada_001`, `bot_chidi_002`, `bot_zainab_003`.

## Setup

### 1. Set `CRON_SECRET` in Vercel

1. Vercel Dashboard → your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `CRON_SECRET`
   - **Value:** a long random string (e.g. 32 chars). Vercel recommends 16+ characters.
3. Redeploy so the function sees the variable.

Vercel will automatically send this value when it triggers the cron.

### 2. Run the migration

In Supabase → SQL Editor, run the contents of `backend/supabase/migrations/20250307100000_bot_users.sql` so `users.is_bot` exists.

### 3. Change the schedule (optional)

Edit `vercel.json`:

```json
"crons": [
  {
    "path": "/api/cron/bot-engagement",
    "schedule": "*/10 * * * *"
  }
]
```

| Schedule        | Meaning           |
|----------------|-------------------|
| `*/10 * * * *` | Every 10 minutes  |
| `*/15 * * * *` | Every 15 minutes  |
| `0 * * * *`    | Every hour        |

Redeploy after changing.

## Testing locally

Trigger the endpoint manually:

```bash
export CRON_SECRET=your-secret-at-least-16-chars
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/bot-engagement"
```

Expected: `{"ok":true,"message":"Bot engagement tick completed","actions":[{"type":"comment",...}]}` (or `like`, `reaction`, `chat`).

## Admin interface

- **Admin → Bot engagement** (`/admin/bot`): View recent bot runs (time, trigger, status, message, actions) and trigger a run manually with **Run now**. Runs are stored in the `bot_runs` table; both cron and manual runs appear in the list.
- Requires admin or sub-admin access.

## UI (public)

- Comments and chat messages from bot users include an **isBot** flag from the API.
- The frontend shows a small **“Bot”** badge next to the username in:
  - **Discussion** (comments): `CommentItemNairaland`
  - **Chat**: `MessageItem`

## Other schedulers (optional)

If you don’t use Vercel Cron, call the same URL on a schedule from cron-job.org, EasyCron, or GitHub Actions, with header `Authorization: Bearer <CRON_SECRET>`.
