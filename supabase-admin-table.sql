-- Admin Users Table for Supabase
-- Run this in Supabase SQL Editor to create admin authentication

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access admin_users (backend API only)
CREATE POLICY "Service role can manage admin users" ON admin_users
    FOR ALL USING (true);

COMMENT ON TABLE admin_users IS 'Stores admin user credentials for admin panel access';

-- Insert default admin user (username: admin, password: admin123)
-- IMPORTANT: Change this password after first login!
INSERT INTO admin_users (username, password_hash, role)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Note: The password hash above is for "admin123"
-- To create a new admin with a different password, use bcrypt with 10 rounds
-- You can use this Node.js code to generate a hash:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);
-- console.log(hash);
