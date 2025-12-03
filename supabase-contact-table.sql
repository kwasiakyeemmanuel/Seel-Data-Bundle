-- Contact Messages Table for Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert contact messages (public form)
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Policy: Only service role can read messages (admin only)
CREATE POLICY "Service role can read all messages" ON contact_messages
    FOR SELECT USING (true);

-- Policy: Service role can update messages (mark as read, etc)
CREATE POLICY "Service role can update messages" ON contact_messages
    FOR UPDATE USING (true);

COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from website';
COMMENT ON COLUMN contact_messages.status IS 'Message status: unread, read, replied';
