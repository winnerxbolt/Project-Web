-- Fix bookings table schema to match API expectations
-- Run this in Supabase SQL Editor

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS room_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS slip_image TEXT,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2);

-- Migrate data from total_price to total
UPDATE bookings SET total = total_price WHERE total IS NULL;

-- Optional: Keep both columns for backward compatibility
-- Or you can drop total_price if you want to use only 'total'
-- ALTER TABLE bookings DROP COLUMN IF EXISTS total_price;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_name ON bookings(room_name);
CREATE INDEX IF NOT EXISTS idx_bookings_total ON bookings(total);

-- Update RLS policies if needed
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to read bookings
DROP POLICY IF EXISTS "Allow public read access" ON bookings;
CREATE POLICY "Allow public read access" ON bookings
  FOR SELECT USING (true);

-- Allow public to insert bookings
DROP POLICY IF EXISTS "Allow public insert" ON bookings;  
CREATE POLICY "Allow public insert" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow public to update bookings
DROP POLICY IF EXISTS "Allow public update" ON bookings;
CREATE POLICY "Allow public update" ON bookings
  FOR UPDATE USING (true);

-- Allow public to delete bookings (admin only in production)
DROP POLICY IF EXISTS "Allow public delete" ON bookings;
CREATE POLICY "Allow public delete" ON bookings
  FOR DELETE USING (true);

SELECT 'Bookings table updated successfully!' AS status;
