-- Drop existing table if exists (ระวัง: จะลบข้อมูลเดิมทั้งหมด)
-- DROP TABLE IF EXISTS videos CASCADE;

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id INTEGER,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  category TEXT DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_room_id ON videos(room_id);
CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(active);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can view all videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON videos;

-- Policy: Allow all users to read active videos
CREATE POLICY "Anyone can view active videos"
ON videos FOR SELECT
USING (active = true);

-- Policy: Allow authenticated users to read all videos
CREATE POLICY "Authenticated users can view all videos"
ON videos FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert videos
CREATE POLICY "Authenticated users can insert videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos"
ON videos FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON videos FOR DELETE
TO authenticated
USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS videos_updated_at_trigger ON videos;

-- Create trigger
CREATE TRIGGER videos_updated_at_trigger
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_videos_updated_at();

-- Insert sample data
INSERT INTO videos (title, description, video_url, thumbnail_url, category, active, order_index)
VALUES 
  (
    'Pool Villa Tour - Luxury Experience',
    'ชมบรรยากาศภายใน Pool Villa สุดหรูของเรา พร้อมสระว่ายน้ำส่วนตัว',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'tour',
    true,
    1
  ),
  (
    'สิ่งอำนวยความสะดวกครบครัน',
    'เครื่องใช้ไฟฟ้าครบครัน ห้องครัวสมบูรณ์แบบ พร้อมอุปกรณ์ทันสมัย',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'amenities',
    true,
    2
  ),
  (
    'ทำเลที่ตั้ง Pool Villa',
    'อยู่ใจกลางเมืองพัทยา ใกล้ทะเล ช้อปปิ้ง และแหล่งท่องเที่ยวชื่อดัง',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'location',
    true,
    3
  ),
  (
    'ห้องนอนหรูหรา',
    'ห้องนอนพร้อมเตียงขนาดคิงไซส์ เครื่องนอนคุณภาพสูง',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'rooms',
    true,
    4
  )
ON CONFLICT DO NOTHING;

-- Verify installation
SELECT 
  'Videos table created successfully!' as status,
  COUNT(*) as total_videos,
  COUNT(*) FILTER (WHERE active = true) as active_videos
FROM videos;
