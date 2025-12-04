-- Run these queries in Supabase SQL Editor to diagnose the issue

-- 1. Check if admin_users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'admin_users';

-- 2. Check if admin user exists
SELECT username, role, created_at, 
       LEFT(password_hash, 20) as password_hash_preview
FROM admin_users 
WHERE username = 'admin';

-- 3. Check RLS policies on admin_users
SELECT * FROM pg_policies WHERE tablename = 'admin_users';

-- 4. If no admin user found, insert one:
-- DELETE FROM admin_users WHERE username = 'admin';
-- INSERT INTO admin_users (username, password_hash, role)
-- VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- 5. Verify the insert worked:
-- SELECT * FROM admin_users WHERE username = 'admin';
