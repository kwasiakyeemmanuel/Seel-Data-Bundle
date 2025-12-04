-- Update admin password with correct bcrypt hash for "admin123"
UPDATE admin_users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'admin';

-- Verify the update
SELECT username, LEFT(password_hash, 30) as hash_preview, role, created_at 
FROM admin_users 
WHERE username = 'admin';
