-- Sub-admins: can post news, manage comments, view analytics (not full admin).
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_sub_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN users.is_sub_admin IS 'When true, user can access admin panel for news, comments, and analytics only.';
