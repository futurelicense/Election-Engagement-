# Fix: "value too long for type character varying(500)" Error

## Problem
When creating news articles, you're getting the error:
```
value too long for type character varying(500)
```

This error occurs because either:
1. The `title` column is still `VARCHAR(500)` in your database (should be `TEXT`)
2. The `image` column is `VARCHAR(500)` and the image URL is longer than 500 characters

## Solution

### For Supabase/PostgreSQL Databases

**IMPORTANT:** Use PostgreSQL syntax, NOT MySQL syntax!

1. **Go to your Supabase Dashboard**
   - Navigate to SQL Editor
   - Create a new query

2. **Run the migration script (PostgreSQL syntax):**
   ```sql
   -- Fix title column
   ALTER TABLE news ALTER COLUMN title TYPE TEXT;
   
   -- Fix image column  
   ALTER TABLE news ALTER COLUMN image TYPE TEXT;
   ```

   **Use the file:** `migrate_news_fix_postgresql.sql` (NOT the MySQL one!)
   
   **DO NOT use:** `MODIFY COLUMN` - that's MySQL syntax and will cause errors in PostgreSQL

3. **Verify the changes:**
   ```sql
   SELECT column_name, data_type, character_maximum_length 
   FROM information_schema.columns 
   WHERE table_name = 'news' 
   AND column_name IN ('title', 'image');
   ```
   
   You should see `data_type = 'text'` for both columns.

### For MySQL/MariaDB Databases

1. **Run the migration script:**
   ```sql
   ALTER TABLE news MODIFY COLUMN title TEXT NOT NULL;
   ALTER TABLE news MODIFY COLUMN image TEXT;
   ```

   Or use the provided migration file: `migrate_news_fix_mysql.sql`

2. **Verify the changes:**
   ```sql
   DESCRIBE news;
   ```
   
   You should see both `title` and `image` as `TEXT` type.

## Quick Fix (Supabase)

If you're using Supabase, you can run this directly in the SQL Editor:

```sql
ALTER TABLE news 
  ALTER COLUMN title TYPE TEXT,
  ALTER COLUMN image TYPE TEXT;
```

## After Migration

1. Try creating a news article again
2. The error should no longer occur
3. Both title and image fields can now accept unlimited length

## Notes

- The schema files have been updated to use `TEXT` for both fields
- For new databases, the schema will automatically create the correct types
- For existing databases, you must run the migration script above
