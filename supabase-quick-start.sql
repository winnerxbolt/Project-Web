-- ========================================
-- SUPABASE QUICK START SCRIPT
-- Copy ทั้งหมด และ Paste ใน Supabase SQL Editor
-- คลิก "Run" หรือกด Ctrl+Enter
-- ========================================

-- ขั้นตอนที่ 1: Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ขั้นตอนที่ 2: สร้าง Core Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hash TEXT NOT NULL,
    salt VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
    phone VARCHAR(20),
    picture TEXT,
    social_provider JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    guests INTEGER DEFAULT 1,
    beds INTEGER DEFAULT 1,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    size DECIMAL(10, 2),
    image TEXT,
    images TEXT[],
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    amenities TEXT[],
    location VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    kitchen BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    pool BOOLEAN DEFAULT FALSE,
    wifi BOOLEAN DEFAULT TRUE,
    air_conditioning BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(255),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cover_image TEXT,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[],
    published BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ขั้นตอนที่ 3: สร้าง Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- ขั้นตอนที่ 4: สร้าง Function สำหรับ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ขั้นตอนที่ 5: สร้าง Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ขั้นตอนที่ 6: Insert Sample Data (Optional)
INSERT INTO users (id, email, name, hash, role) VALUES
    ('501cf967-7be2-43b9-a765-73166f06177a', 'admin@webwin.com', 'Admin User', 'sample_hash', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO rooms (name, price, description, guests, beds, available) VALUES
    ('ห้องดีลักซ์', 3000, 'ห้องพักสวยงาม พร้อมสิ่งอำนวยความสะดวกครบครัน', 2, 1, true),
    ('ห้องสวีท', 5000, 'ห้องพักหรูหรา พร้อมวิวสวยงาม', 4, 2, true)
ON CONFLICT DO NOTHING;

-- ขั้นตอนที่ 7: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ขั้นตอนที่ 8: สร้าง RLS Policies

-- Users can read their own data
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can read their own bookings
DROP POLICY IF EXISTS bookings_select_own ON bookings;
CREATE POLICY bookings_select_own ON bookings
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can create bookings
DROP POLICY IF EXISTS bookings_insert_own ON bookings;
CREATE POLICY bookings_insert_own ON bookings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read their own notifications
DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Public can read available rooms
DROP POLICY IF EXISTS rooms_select_public ON rooms;
CREATE POLICY rooms_select_public ON rooms
    FOR SELECT USING (available = true);

-- Public can read published articles
DROP POLICY IF EXISTS articles_select_public ON articles;
CREATE POLICY articles_select_public ON articles
    FOR SELECT USING (published = true);

-- ========================================
-- ✅ SETUP COMPLETE!
-- ========================================

-- ตรวจสอบว่า tables ถูกสร้างแล้ว
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- แสดงจำนวน records ในแต่ละ table
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
