-- Insert Sample Videos for Video Reviews Page
-- Run this in your Supabase SQL Editor

-- Clear existing videos (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE videos CASCADE;

-- Insert Sample Poolvilla Videos
INSERT INTO videos (video_url, thumbnail_url, title, description, duration, order_index, active) VALUES
(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'Pool Villa Pattaya - ห้องสระว่ายน้ำส่วนตัว บรรยากาศสุดหรู',
  'พาชมห้อง Pool Villa พร้อมสระว่ายน้ำส่วนตัว บรรยากาศโรแมนติก เหมาะสำหรับคู่รัก ครอบครัว',
  180,
  1,
  true
),
(
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  'Tour Poolvilla พัทยา - ห้องพักสุดพรีเมียม พร้อมสิ่งอำนวยความสะดวกครบครัน',
  'รีวิวห้องพัก Poolvilla แบบ Grand Deluxe พร้อมเฟอร์นิเจอร์หรูหรา และสิ่งอำนวยความสะดวกครบครัน',
  240,
  2,
  true
),
(
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
  'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  'Pool Villa Sunset View - วิวพระอาทิตย์ตกสุดโรแมนติก',
  'พาชมบรรยากาศยามเย็นที่ Pool Villa พร้อมวิวพระอาทิตย์ตกสุดสวย เหมาะสำหรับฮันนีมูน',
  150,
  3,
  true
),
(
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
  'Luxury Poolvilla - สระว่ายน้ำขนาดใหญ่ บรรยากาศส่วนตัว 100%',
  'รีวิวห้อง Luxury Poolvilla พร้อมสระว่ายน้ำขนาดใหญ่ ความเป็นส่วนตัวสูง เหมาะสำหรับพักผ่อน',
  200,
  4,
  true
),
(
  'https://www.youtube.com/watch?v=uelHwf8o7_U',
  'https://img.youtube.com/vi/uelHwf8o7_U/maxresdefault.jpg',
  'Family Poolvilla - เหมาะสำหรับครอบครัวใหญ่',
  'พาชมห้อง Family Poolvilla ขนาดใหญ่ รองรับได้ถึง 8 ท่าน พร้อมสระว่ายน้ำกว้างขวาง',
  210,
  5,
  true
);

-- Insert Sample Promotion Videos
INSERT INTO videos (video_url, thumbnail_url, title, description, duration, order_index, active) VALUES
(
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
  'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
  '🎉 โปรโมชั่นพิเศษ! ลด 40% สำหรับการจองล่วงหน้า',
  'โปรโมชั่นสุดคุ้ม จองวันนี้ลดสูงสุด 40% พร้อมอาหารเช้าฟรี! จองเลย!',
  90,
  6,
  true
),
(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  '💝 Special Package สำหรับคู่รัก - ฮันนีมูนสุดโรแมนติก',
  'แพ็คเกจพิเศษสำหรับคู่รัก ดินเนอร์แสงเทียน + ห้องดอกไม้ + อาหารเช้าในห้อง ราคาพิเศษ!',
  120,
  7,
  true
);

-- Insert Sample Room Tour Videos
INSERT INTO videos (video_url, thumbnail_url, title, description, duration, order_index, active) VALUES
(
  'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
  'https://img.youtube.com/vi/ZZ5LpwO-An4/maxresdefault.jpg',
  '🛏️ Room Tour - Deluxe Room พร้อมวิวสระว่ายน้ำ',
  'พาชมห้อง Deluxe Room แบบละเอียด ตกแต่งสไตล์โมเดิร์น พร้อมระเบียงส่วนตัว',
  160,
  8,
  true
),
(
  'https://www.youtube.com/watch?v=HEXWRTEbj1I',
  'https://img.youtube.com/vi/HEXWRTEbj1I/maxresdefault.jpg',
  '🌟 Suite Room - ห้องสวีทหรูหรา พร้อมห้องนั่งเล่นแยก',
  'รีวิวห้อง Suite Room ขนาดใหญ่ ห้องนอน + ห้องนั่งเล่นแยก พร้อมสิ่งอำนวยความสะดวกครบครัน',
  190,
  9,
  true
);

-- Insert Sample Amenities Videos  
INSERT INTO videos (video_url, thumbnail_url, title, description, order_index, active) VALUES
(
  'https://www.youtube.com/watch?v=e-ORhEE9VVg',
  'https://img.youtube.com/vi/e-ORhEE9VVg/maxresdefault.jpg',
  '🎯 สิ่งอำนวยความสะดวก - สระว่ายน้ำกลาง ฟิตเนส สปา',
  'พาชมสิ่งอำนวยความสะดวกต่างๆ สระว่ายน้ำกลาง ห้องฟิตเนส สปา และร้านอาหาร',
  140,
  10,
  true
);

-- Verify inserted data
SELECT 
  id, 
  title, 
  video_url,
  active,
  order_index,
  created_at
FROM videos
ORDER BY order_index;

-- Note: You can update video_url with your actual YouTube video URLs
-- The thumbnail_url will be auto-generated from YouTube video ID
