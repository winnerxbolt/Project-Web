-- Fix Videos Table RLS Policies to Allow Delete
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON videos;
DROP POLICY IF EXISTS "Allow admin write" ON videos;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON videos;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON videos;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON videos;

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- 1. Allow everyone to read active videos
CREATE POLICY "Allow public read access" 
ON videos FOR SELECT 
USING (active = true);

-- 2. Allow all authenticated users to read all videos (including inactive)
CREATE POLICY "Allow authenticated users to read all" 
ON videos FOR SELECT 
TO authenticated
USING (true);

-- 3. Allow authenticated users to insert videos
CREATE POLICY "Allow authenticated users to insert" 
ON videos FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 4. Allow authenticated users to update videos
CREATE POLICY "Allow authenticated users to update" 
ON videos FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Allow authenticated users to delete videos
CREATE POLICY "Allow authenticated users to delete" 
ON videos FOR DELETE 
TO authenticated
USING (true);

-- 6. Allow service role (admin) full access
CREATE POLICY "Allow service role full access" 
ON videos FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'videos';

-- Test: Try to select videos
SELECT id, title, active FROM videos LIMIT 5;

-- Note: After running this, restart your Next.js server for changes to take effect
