# Election Engagement – Workflow Showcase

This document shows how the main flows work: **guest voting**, **vote claiming on sign-up**, and **automated bot engagement** (cron).

---

## 1. Guest voting workflow

User can vote without an account; the vote is stored and counted. If they sign up later, that vote is attached to their account.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  USER (not logged in)                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    │  1. Visits election page, clicks "Vote" on a candidate
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                                         │
│  • getOrCreateGuestId() → read or create guest_id in localStorage                 │
│  • castVote(electionId, candidateId) → no user, so use guestId                  │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    │  2. POST /api/votes { electionId, candidateId, guestId }
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  BACKEND (optionalAuth)                                                           │
│  • No JWT → treat as guest                                                        │
│  • Insert into guest_votes (guest_id, election_id, candidate_id)                  │
│  • Return 201                                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    │  3. Live stats include guest_votes
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  GET /api/elections/:id/stats                                                     │
│  • Counts votes + guest_votes per candidate                                       │
│  • UI shows updated totals and "You voted for X" (from guest_votes)              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Later: user signs up or logs in**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  USER completes Sign up or Login                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT (frontend)                                                          │
│  • After successful login/signup                                                   │
│  • guestId = getOrCreateGuestId() from localStorage                               │
│  • POST /api/votes/claim { guestId }  (with user JWT)                             │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  BACKEND POST /votes/claim                                                        │
│  • For each row in guest_votes WHERE guest_id = guestId:                          │
│    - If user has no vote for that election → INSERT into votes (user_id, ...)    │
│    - DELETE from guest_votes                                                      │
│  • Return { claimed: N }                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  RESULT                                                                           │
│  • Guest votes are now in votes table under the user’s account                    │
│  • Same totals (no double-count); user keeps their vote and gets full features   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Automated bot engagement workflow (cron)

Scheduled job runs at intervals and will eventually post comments, add reactions, and send chat messages as bot users.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SCHEDULER (Vercel Cron)                                                          │
│  • Schedule: */10 * * * *  (every 10 minutes)                                     │
│  • Only in production                                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    │  At each tick: GET https://your-app.vercel.app/api/cron/bot-engagement
    │                Header: Authorization: Bearer <CRON_SECRET>
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  BACKEND GET /api/cron/bot-engagement                                             │
│  • Verify CRON_SECRET (401 if missing/wrong)                                      │
│  • Call runBotEngagementTick()                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  runBotEngagementTick()  (current: stub)                                          │
│  • Returns { ok: true, message: '...', actions?: [...] }                         │
│  • FUTURE:                                                                        │
│    1. Load bot profiles (from DB/config)                                          │
│    2. Pick action type: comment | react | chat                                     │
│    3. Pick context: election, room, target comment                                │
│    4. Generate or pick content (templates / Hugging Face)                          │
│    5. Post as bot user (comment API, reaction API, chat API)                       │
│    6. Return actions for logging                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  RESPONSE                                                                         │
│  • 200 { ok: true, message: '...', actions: [...] }                               │
│  • Vercel logs the response; no retry unless you configure it                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Future: bot engagement with real actions

When bot profiles and actions are implemented, one tick could look like this:

```
  runBotEngagementTick()
         │
         ├─► [Pick bot] e.g. "Ada"
         │
         ├─► [Pick action] e.g. "post_comment"
         │
         ├─► [Pick context] e.g. election_id = "e_nigeria_2027"
         │
         ├─► [Get content]
         │      • Option A: Random from phrase list
         │      • Option B: Hugging Face – prompt with recent comment + "write one short reply"
         │      • Optional: moderation model on output
         │
         ├─► [Post as bot]
         │      • Backend has JWT or service auth for bot user "Ada"
         │      • POST /api/comments (electionId, content) or equivalent
         │
         └─► Return { ok: true, actions: [{ type: 'comment', detail: 'e_nigeria_2027' }] }
```

Same idea for **react** (pick a recent comment, add 👍/❤️) and **chat** (pick room, generate message, send).

---

## 4. End-to-end flow (one diagram)

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   Visitor    │     │   Frontend   │     │   Backend    │
  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
         │                    │                    │
         │  Click Vote        │                    │
         │───────────────────►│                    │
         │                    │  guestId + vote    │
         │                    │───────────────────►│
         │                    │                    │  guest_votes
         │                    │  201 OK            │  + stats
         │                    │◄───────────────────│
         │  "You voted for X" │                    │
         │◄───────────────────│                    │
         │                    │                    │
         │  (later) Sign up   │                    │
         │───────────────────►│                    │
         │                    │  register +        │
         │                    │  claim(guestId)    │
         │                    │───────────────────►│
         │                    │                    │  votes ← guest_votes
         │                    │  user + token     │
         │                    │◄───────────────────│
         │  Logged in, vote   │                    │
         │  still counts      │                    │
         │◄───────────────────│                    │
         │                    │                    │

  ┌──────────────┐     ┌──────────────┐
  │ Vercel Cron  │     │   Backend    │
  └──────┬───────┘     └──────┬───────┘
         │                    │
         │  Every 10 min      │
         │  GET /api/cron/    │
         │  bot-engagement   │
         │  + Bearer secret  │
         │──────────────────►│
         │                    │  runBotEngagementTick()
         │                    │  (stub → later: comment/react/chat)
         │  200 { ok }       │
         │◄───────────────────│
```

---

## 5. Files involved

| Flow              | Frontend                    | Backend                          |
|-------------------|-----------------------------|----------------------------------|
| Guest vote        | `guestId.ts`, `voteService`, `ElectionContext`, `ElectionDashboard` | `votes.ts` (POST, GET check), `elections.ts` (stats) |
| Claim on signup   | `AuthContext` (after login/signup) | `votes.ts` (POST /claim)         |
| Cron / bot tick   | —                           | `vercel.json` (crons), `cron.ts`, `runBotEngagementTick()` |

---

## 6. Environment variables

| Variable          | Where     | Purpose                          |
|-------------------|-----------|-----------------------------------|
| `CRON_SECRET`     | Vercel env| Secures GET /api/cron/bot-engagement; Vercel sends it when triggering cron |
| `SUPABASE_*`, `JWT_SECRET` | Backend | Existing (auth, DB, votes)        |

This is the workflow in place today and how it extends once bot actions and (optionally) Hugging Face are added.
