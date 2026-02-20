# Setting vote counts by candidate name

You can set the **displayed** vote count for candidates to specific numbers (e.g. for demos or pre-loaded data). The app will show this number in stats instead of the real count from the `votes` table.

## 1. Run the migration (once)

In **Supabase → SQL Editor**, run:

```sql
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS vote_display_override integer NULL;
```

Or run the migration file: `backend/supabase/migrations/20250210000000_add_vote_display_override.sql`.

## 2. Set vote counts by candidate name

From the **backend** directory, run the script with your **election ID** and pairs of **candidate name** and **vote count**:

```bash
cd backend
node scripts/set-vote-overrides.mjs <electionId> "Candidate A" <votes> "Candidate B" <votes> ...
```

**Example:**

```bash
node scripts/set-vote-overrides.mjs e_1234567890 "Tinubu" 5000 "Atiku" 3000 "Obi" 2000
```

- Names are matched case-insensitively; partial matches work (e.g. `"Tinubu"` matches `"Bola Tinubu"`).
- To find your election ID: Supabase → Table Editor → `elections`, or from the app URL when viewing an election.

The script uses `backend/.env` for `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.

## 3. Clear override (use real votes again)

Set the override to `null` via Supabase Table Editor, or use the admin API:

```http
PUT /api/candidates/:candidateId
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{ "voteDisplayOverride": null }
```

## Admin API

- **Update override:** `PUT /api/candidates/:id` with body `{ "voteDisplayOverride": 1234 }` (admin only).
- Stats endpoint `GET /api/elections/:id/stats` returns these numbers when `vote_display_override` is set.
