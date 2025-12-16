-- Check if users table exists and view structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- View all users (if table exists)
SELECT * FROM users LIMIT 10;

-- If users table doesn't exist, create it
-- Run this only if the table doesn't exist:

/*
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read users (for admin panel)
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT
    USING (true);

-- Policy: Only authenticated users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Insert sample admin user (Change password before production!)
INSERT INTO users (name, email, password, role, is_verified)
VALUES 
    ('Admin User', 'admin@poolvilla.com', '$2a$10$samplehashedpassword', 'admin', true)
ON CONFLICT (email) DO NOTHING;
*/
