-- ============================================================
-- FINAL DATABASE FIX - รันไฟล์นี้ใน Supabase SQL Editor
-- https://supabase.com/dashboard/project/ffkzqihfaqscqnkhstnv/sql/new
-- ============================================================

-- 1. แก้ไข BOOKINGS TABLE
-- ============================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS room_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS slip_image TEXT,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Sync data
UPDATE bookings SET total = total_price WHERE total IS NULL;
UPDATE bookings SET phone = guest_phone WHERE phone IS NULL;
UPDATE bookings b SET room_name = r.name FROM rooms r WHERE b.room_id = r.id AND b.room_name IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_room_name ON bookings(room_name);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);

-- 2. แก้ไข REVIEWS TABLE
-- ============================================================
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS photos TEXT[];

CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_hidden ON reviews(is_hidden) WHERE is_hidden = FALSE;

-- 3. สร้าง GALLERY TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(50) DEFAULT 'room',
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_videos (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title VARCHAR(255),
    description TEXT,
    duration INTEGER,
    category VARCHAR(50) DEFAULT 'tour',
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_vr_tours (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    tour_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title VARCHAR(255),
    description TEXT,
    platform VARCHAR(50) DEFAULT 'matterport',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_drone_shots (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    thumbnail_url TEXT,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_room ON gallery_images(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_videos_room ON gallery_videos(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_vr_room ON gallery_vr_tours(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_drone_room ON gallery_drone_shots(room_id);

-- 4. แก้ไข VIDEOS TABLE (add missing columns)
-- ============================================================
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_videos_room ON videos(room_id);
CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(active) WHERE active = TRUE;

-- 5. แก้ไข NOTIFICATIONS TABLE
-- ============================================================
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 6. สร้าง/แก้ไข LOCATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    province VARCHAR(100),
    country VARCHAR(50) DEFAULT 'Thailand',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add region column if not exists (for existing tables)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS region VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_locations_province ON locations(province);
CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region);

-- 7. RLS POLICIES - เปิดการเข้าถึงสาธารณะ
-- ============================================================

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON bookings;
CREATE POLICY "Allow public access" ON bookings FOR ALL USING (true);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON reviews;
CREATE POLICY "Allow public access" ON reviews FOR ALL USING (true);

-- Videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON videos;
CREATE POLICY "Allow public access" ON videos FOR ALL USING (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON notifications;
CREATE POLICY "Allow public read" ON notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write" ON notifications;
CREATE POLICY "Allow public write" ON notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow user update own" ON notifications;
CREATE POLICY "Allow user update own" ON notifications FOR UPDATE USING (true);

-- Gallery tables
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON gallery_images;
CREATE POLICY "Allow public access" ON gallery_images FOR ALL USING (true);

ALTER TABLE gallery_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON gallery_videos;
CREATE POLICY "Allow public access" ON gallery_videos FOR ALL USING (true);

ALTER TABLE gallery_vr_tours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON gallery_vr_tours;
CREATE POLICY "Allow public access" ON gallery_vr_tours FOR ALL USING (true);

ALTER TABLE gallery_drone_shots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON gallery_drone_shots;
CREATE POLICY "Allow public access" ON gallery_drone_shots FOR ALL USING (true);

-- Wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON wishlist;
CREATE POLICY "Allow public access" ON wishlist FOR ALL USING (true);

-- FAQ
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON faq;
CREATE POLICY "Allow public read" ON faq FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON faq;
CREATE POLICY "Allow admin write" ON faq FOR ALL USING (true);

-- Group Bookings
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON group_bookings;
CREATE POLICY "Allow public access" ON group_bookings FOR ALL USING (true);

-- Dynamic Pricing
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON dynamic_pricing_rules;
CREATE POLICY "Allow public read" ON dynamic_pricing_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON dynamic_pricing_rules;
CREATE POLICY "Allow admin write" ON dynamic_pricing_rules FOR ALL USING (true);

ALTER TABLE dynamic_pricing_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON dynamic_pricing_settings;
CREATE POLICY "Allow public read" ON dynamic_pricing_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON dynamic_pricing_settings;
CREATE POLICY "Allow admin write" ON dynamic_pricing_settings FOR ALL USING (true);

-- Seasonal Pricing
ALTER TABLE seasonal_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON seasonal_pricing;
CREATE POLICY "Allow public read" ON seasonal_pricing FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON seasonal_pricing;
CREATE POLICY "Allow admin write" ON seasonal_pricing FOR ALL USING (true);

-- Demand Pricing
ALTER TABLE demand_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON demand_pricing;
CREATE POLICY "Allow public read" ON demand_pricing FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON demand_pricing;
CREATE POLICY "Allow admin write" ON demand_pricing FOR ALL USING (true);

-- Locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON locations;
CREATE POLICY "Allow public read" ON locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON locations;
CREATE POLICY "Allow admin write" ON locations FOR ALL USING (true);

-- 8. สร้าง USEFUL VIEWS
-- ============================================================

-- View: Bookings with room details
CREATE OR REPLACE VIEW bookings_with_rooms AS
SELECT 
    b.*,
    r.name as room_full_name,
    r.image as room_image,
    r.location as room_location,
    r.price as room_base_price
FROM bookings b
LEFT JOIN rooms r ON b.room_id = r.id;

-- View: Reviews with details
CREATE OR REPLACE VIEW reviews_with_details AS
SELECT 
    rv.*,
    r.name as room_name,
    u.name as user_name,
    u.email as user_email,
    u.picture as user_picture
FROM reviews rv
LEFT JOIN rooms r ON rv.room_id = r.id
LEFT JOIN users u ON rv.user_id = u.id
WHERE rv.is_hidden = FALSE;

-- View: Active rooms with stats
CREATE OR REPLACE VIEW active_rooms_stats AS
SELECT 
    r.*,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT rv.id) as total_reviews,
    AVG(rv.rating) as avg_rating
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id
LEFT JOIN reviews rv ON r.id = rv.room_id
WHERE r.available = TRUE
GROUP BY r.id;

-- ============================================================
-- 9. สร้างตารางเสริมสำหรับ data ที่อาจขาด
-- ============================================================

-- Ensure dynamic_pricing_settings has a default row
INSERT INTO dynamic_pricing_settings (enabled, min_price_multiplier, max_price_multiplier, occupancy_thresholds, settings)
VALUES (true, 0.7, 2.0, '{"low": 0.3, "medium": 0.6, "high": 0.8}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
SELECT '✅ Database schema fixed successfully! All tables ready!' AS status;
-- ============================================================
