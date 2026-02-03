# Uganda Election Votes Setup

This document explains how to set up the vote counts for the Uganda Presidential Election 2025.

## Vote Counts

- **Bobi Wine (Robert Kyagulanyi)**: 7,814 votes
- **Yoweri Museveni**: 6,392 votes  
- **Mugisha Muntu**: 3,246 votes

**Total Votes**: 17,452

## Database Updates

### 1. Candidate Names Updated

The following candidate names have been updated in the database schema files:
- `c8`: Changed from "Janet Museveni" to "Yoweri Museveni"
- `c9`: Changed from "Patrick Oboi Amuriat" to "Mugisha Muntu"
- `c7`: "Robert Kyagulanyi" (Bobi Wine) - unchanged

### 2. Running the Migration

To apply the vote counts to your database, run the migration script:

#### For Supabase/PostgreSQL:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `uganda_votes_migration.sql`
4. Click **Run** to execute the script

#### For Local PostgreSQL:

```bash
psql -U your_username -d your_database -f uganda_votes_migration.sql
```

## What the Migration Script Does

1. **Updates candidate names** in the `candidates` table
2. **Deletes existing votes** for Uganda election (e7) to start fresh
3. **Creates dummy users** for each vote (required by the database schema)
4. **Inserts votes** for each candidate with the specified counts
5. **Verifies** the vote counts with a final SELECT query

## Verification

After running the migration, you can verify the vote counts by running:

```sql
SELECT 
    c.name AS candidate_name,
    c.party,
    COUNT(v.id) AS vote_count
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id
WHERE c.election_id = 'e7'
GROUP BY c.id, c.name, c.party
ORDER BY vote_count DESC;
```

Expected results:
- Robert Kyagulanyi (Bobi Wine): 7,814 votes
- Yoweri Museveni: 6,392 votes
- Mugisha Muntu: 3,246 votes

## Notes

- The migration creates temporary users for each vote (required by the database foreign key constraints)
- Each vote has a unique user_id to satisfy the UNIQUE constraint on (user_id, election_id)
- Vote timestamps are randomized within the last 30 days to simulate realistic voting patterns
- The script uses `ON CONFLICT DO NOTHING` to prevent errors if run multiple times

## Files Modified

- `src/database.sql` - Updated candidate names
- `src/database.supabase.sql` - Updated candidate names
- `uganda_votes_migration.sql` - Migration script to insert votes

