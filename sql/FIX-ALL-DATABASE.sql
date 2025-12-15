-- ============================================================
-- FIX ALL DATABASE SCHEMA ISSUES
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. FIX BOOKINGS TABLE - Add missing columns
-- ============================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS room_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS slip_image TEXT,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Sync data from existing columns
UPDATE bookings SET total = total_price WHERE total IS NULL;
UPDATE bookings SET phone = guest_phone WHERE phone IS NULL;

-- Update room_name from rooms table
UPDATE bookings b
SET room_name = r.name
FROM rooms r
WHERE b.room_id = r.id AND b.room_name IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_name ON bookings(room_name);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);

-- ============================================================
-- 2. FIX REVIEWS TABLE - Ensure all needed columns exist
-- ============================================================
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ============================================================
-- 3. CREATE GALLERY TABLES (if not exist)
-- ============================================================

-- Gallery Images Table
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

CREATE INDEX IF NOT EXISTS idx_gallery_images_room ON gallery_images(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_featured ON gallery_images(is_featured) WHERE is_featured = TRUE;

-- Gallery Videos Table  
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

CREATE INDEX IF NOT EXISTS idx_gallery_videos_room ON gallery_videos(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_videos_featured ON gallery_videos(is_featured) WHERE is_featured = TRUE;

-- Gallery VR Tours Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_vr_room ON gallery_vr_tours(room_id);

-- Gallery Drone Shots Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_drone_room ON gallery_drone_shots(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_drone_featured ON gallery_drone_shots(is_featured) WHERE is_featured = TRUE;

-- ============================================================
-- 4. UPDATE RLS POLICIES FOR ALL TABLES
-- ============================================================

-- Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON bookings;
CREATE POLICY "Allow public access" ON bookings FOR ALL USING (true);

-- Reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON reviews;
CREATE POLICY "Allow public read" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON reviews;
CREATE POLICY "Allow public insert" ON reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON reviews;
CREATE POLICY "Allow public update" ON reviews FOR UPDATE USING (true);

-- Videos RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON videos;
CREATE POLICY "Allow public read" ON videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write" ON videos;
CREATE POLICY "Allow admin write" ON videos FOR ALL USING (true);

-- Gallery Tables RLS
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

-- ============================================================
-- 5. CREATE USEFUL VIEWS
-- ============================================================

-- View for bookings with room details
CREATE OR REPLACE VIEW bookings_with_rooms AS
SELECT 
    b.*,
    r.name as room_name_from_rooms,
    r.image as room_image,
    r.location as room_location
FROM bookings b
LEFT JOIN rooms r ON b.room_id = r.id;

-- View for reviews with room and user details  
CREATE OR REPLACE VIEW reviews_with_details AS
SELECT 
    rv.*,
    r.name as room_name,
    u.name as user_name,
    u.email as user_email
FROM reviews rv
LEFT JOIN rooms r ON rv.room_id = r.id
LEFT JOIN users u ON rv.user_id = u.id;

-- ============================================================
SELECT 'Database schema fixed successfully! ✅' AS status;
-- ============================================================
