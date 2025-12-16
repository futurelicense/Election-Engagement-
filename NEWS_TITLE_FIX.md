# News Title Length Fix

## Problem
When creating news articles, users were encountering the error:
```
value too long for type character varying(500)
```

This error occurred because the `title` column in the `news` table was defined as `VARCHAR(500)`, limiting titles to 500 characters.

## Solution
The `title` column has been changed from `VARCHAR(500)` to `TEXT` in both database schema files, allowing titles of unlimited length.

## Changes Made

### 1. Database Schema Updates
- ✅ Updated `src/database.sql` (MySQL/MariaDB) - Changed `title VARCHAR(500)` to `title TEXT`
- ✅ Updated `src/database.supabase.sql` (PostgreSQL/Supabase) - Changed `title VARCHAR(500)` to `title TEXT`

### 2. Migration Scripts Created
- ✅ `migrate_news_title_postgresql.sql` - For PostgreSQL/Supabase databases
- ✅ `migrate_news_title_mysql.sql` - For MySQL/MariaDB databases

### 3. UI Enhancement
- ✅ Added character counter to `NewsForm` component showing title length
- ✅ Added warning message when title exceeds 500 characters (for display purposes)

## Next Steps

### For New Databases
If you're setting up a new database, the updated schema files will automatically create the table with the correct `TEXT` type for the title column.

### For Existing Databases
If you already have a database with the old schema, you need to run the appropriate migration script:

#### PostgreSQL/Supabase
Run the migration script in your Supabase SQL Editor or PostgreSQL database:
```sql
ALTER TABLE news ALTER COLUMN title TYPE TEXT;
```

Or use the provided file:
```bash
# In Supabase SQL Editor, paste the contents of:
migrate_news_title_postgresql.sql
```

#### MySQL/MariaDB
Run the migration script in your MySQL/MariaDB database:
```sql
ALTER TABLE news MODIFY COLUMN title TEXT NOT NULL;
```

Or use the provided file:
```bash
# In your MySQL client, run:
mysql -u your_user -p your_database < migrate_news_title_mysql.sql
```

### Verify the Migration
After running the migration, verify the change:

**PostgreSQL/Supabase:**
```sql
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'news' AND column_name = 'title';
```
You should see `data_type = 'text'` instead of `'character varying'`.

**MySQL/MariaDB:**
```sql
DESCRIBE news;
```
You should see `title` as `TEXT` type instead of `VARCHAR(500)`.

## Testing
After applying the migration:
1. Try creating a news article with a title longer than 500 characters
2. The error should no longer occur
3. The character counter in the form will show the title length
4. Titles of any length should now be accepted

## Notes
- The character counter in the UI shows a warning at 500+ characters for display/UX purposes, but the database will accept titles of any length
- If you want to enforce a maximum length for display purposes, consider truncating titles in the frontend components that display news cards

