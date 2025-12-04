-- Verify admin_users table and check if admin exists
SELECT * FROM admin_users WHERE username = 'admin';

-- If nothing shows up, run this to insert the admin user:
-- INSERT INTO admin_users (username, password_hash, role)
-- VALUES (
--     'admin',
--     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
--     'admin'
-- );
