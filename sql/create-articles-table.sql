-- สร้างตาราง Articles สำหรับระบบบทความ
-- Run this in Supabase SQL Editor

-- Drop existing table if exists
DROP TABLE IF EXISTS articles CASCADE;

-- Create articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cover_image TEXT,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public can view published articles
CREATE POLICY "Allow public to view published articles" 
    ON articles FOR SELECT 
    TO public 
    USING (published = true);

-- Authenticated users can view all articles
CREATE POLICY "Allow authenticated users to view all articles" 
    ON articles FOR SELECT 
    TO authenticated 
    USING (true);

-- Service role (admin) has full access
CREATE POLICY "Allow service role full access" 
    ON articles FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Admin users can do everything
CREATE POLICY "Allow admin users full access" 
    ON articles FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();

-- Insert sample articles (optional)
INSERT INTO articles (title, content, excerpt, author, author_id, category, tags, published) VALUES
(
    'ยินดีต้อนรับสู่ Pool Villa Pattaya',
    '<h2>เกี่ยวกับเรา</h2><p>Pool Villa Pattaya คือที่พักสุดหรูพร้อมสระว่ายน้ำส่วนตัว ตั้งอยู่ในทำเลดีที่พัทยา</p><h3>บริการของเรา</h3><ul><li>สระว่ายน้ำส่วนตัว</li><li>ห้องครัวพร้อมอุปกรณ์</li><li>WiFi ความเร็วสูง</li><li>ที่จอดรถ</li></ul>',
    'Pool Villa Pattaya คือที่พักสุดหรูพร้อมสระว่ายน้ำส่วนตัว ตั้งอยู่ในทำเลดีที่พัทยา...',
    'Admin',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    'general',
    ARRAY['พัทยา', 'pool villa', 'ที่พัก'],
    true
),
(
    'เคล็ดลับการเลือกที่พักในพัทยา',
    '<h2>วิธีเลือกที่พักที่ดีที่สุด</h2><p>การเลือกที่พักในพัทยาต้องพิจารณาหลายปัจจัย...</p><ol><li>ทำเล</li><li>สิ่งอำนวยความสะดวก</li><li>ราคา</li><li>รีวิวจากผู้เข้าพัก</li></ol>',
    'การเลือกที่พักในพัทยาต้องพิจารณาหลายปัจจัย เช่น ทำเล สิ่งอำนวยความสะดวก และราคา...',
    'Admin',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    'tips',
    ARRAY['เคล็ดลับ', 'พัทยา', 'ท่องเที่ยว'],
    true
);

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- Success message
SELECT 'Articles table created successfully!' as message;
