-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'vimeo', 'mp4')),
  category TEXT DEFAULT 'general',
  published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read published videos
CREATE POLICY "Anyone can view published videos"
ON videos FOR SELECT
USING (published = true);

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

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_updated_at
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_videos_updated_at();

-- Insert sample data
INSERT INTO videos (title, description, video_url, thumbnail_url, video_type, category, published, views)
VALUES 
  (
    'Pool Villa Tour - Luxury Experience',
    'ชมบรรยากาศภายใน Pool Villa สุดหรูของเรา พร้อมสระว่ายน้ำส่วนตัว',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'youtube',
    'tour',
    true,
    1250
  ),
  (
    'สิ่งอำนวยความสะดวกครบครัน',
    'เครื่องใช้ไฟฟ้าครบครัน ห้องครัวสมบูรณ์แบบ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'youtube',
    'amenities',
    true,
    850
  ),
  (
    'ทำเลที่ตั้ง Pool Villa',
    'อยู่ใจกลางเมืองพัทยา ใกล้ทะเล ช้อปปิ้ง และแหล่งท่องเที่ยว',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'youtube',
    'location',
    true,
    620
  )
ON CONFLICT DO NOTHING;
