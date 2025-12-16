-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  phone TEXT,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, name, hash, role, phone)
VALUES (
  'admin@webwin.com',
  'Admin User',
  '$2a$10$rOj0GDPMKJGvVuD9qJdN8OqXZ5K3yZ8vZ8vZ8vZ8vZ8vZ8vZ8vZ8v',
  'admin',
  '0812345678'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample regular user
INSERT INTO users (email, name, hash, role, phone)
VALUES (
  'user@webwin.com',
  'Regular User',
  '$2a$10$rOj0GDPMKJGvVuD9qJdN8OqXZ5K3yZ8vZ8vZ8vZ8vZ8vZ8vZ8vZ8v',
  'user',
  '0823456789'
)
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow admins to update any user" ON users;

-- Create policy to allow service role to read all users
CREATE POLICY "Allow service role full access"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to read all users
CREATE POLICY "Allow authenticated users to read users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Allow users to update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Create policy to allow admins to update any user
CREATE POLICY "Allow admins to update any user"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role = 'admin'
  )
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
