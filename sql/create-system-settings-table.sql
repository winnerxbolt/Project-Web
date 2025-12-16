-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_key TEXT UNIQUE NOT NULL,
  system_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(system_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_enabled ON system_settings(is_enabled);

-- Insert default system settings
INSERT INTO system_settings (system_key, system_name, description, is_enabled)
VALUES 
  ('dashboard', 'ภาพรวมระบบ', 'แสดงสถิติและข้อมูลภาพรวมของระบบ', true),
  ('rooms', 'จัดการห้องพัก', 'จัดการข้อมูลห้องพัก เพิ่ม แก้ไข ลบห้อง', true),
  ('calendar', 'ปฏิทินการจอง', 'ดูและจัดการปฏิทินการจองห้องพัก', true),
  ('users', 'จัดการสิทธิ์ผู้ใช้', 'จัดการผู้ใช้ในระบบ เพิ่มยศ ถอดยศ admin', true),
  ('reviews', 'จัดการรีวิว', 'จัดการรีวิวจากลูกค้า อนุมัติ ลบ แก้ไข', true),
  ('articles', 'จัดการบทความ', 'จัดการบทความและข่าวสาร เพิ่ม แก้ไข ลบบทความ', true),
  ('bookings', 'จัดการการจอง', 'ดูและจัดการการจองทั้งหมด', true),
  ('payments', 'จัดการการชำระเงิน', 'ดูและจัดการประวัติการชำระเงิน', true),
  ('promotions', 'จัดการโปรโมชั่น', 'สร้างและจัดการโปรโมชั่นส่วนลด', true),
  ('reports', 'รายงานและสถิติ', 'ดูรายงานและสถิติต่างๆ ของระบบ', true),
  ('notifications', 'จัดการการแจ้งเตือน', 'ส่งและจัดการการแจ้งเตือนให้ผู้ใช้', true),
  ('videos', 'จัดการวิดีโอ', 'อัพโหลดและจัดการวิดีโอประชาสัมพันธ์', true),
  ('settings', 'ตั้งค่าระบบ', 'ตั้งค่าทั่วไปของระบบ (แสดงเสมอ)', true)
ON CONFLICT (system_key) 
DO UPDATE SET 
  system_name = EXCLUDED.system_name,
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access" ON system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON system_settings;
DROP POLICY IF EXISTS "Allow admins to update settings" ON system_settings;

-- Create policy to allow service role to read all settings
CREATE POLICY "Allow service role full access"
ON system_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings"
ON system_settings
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow admins to update settings
CREATE POLICY "Allow admins to update settings"
ON system_settings
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
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;

-- Create trigger
CREATE TRIGGER update_system_settings_updated_at 
BEFORE UPDATE ON system_settings 
FOR EACH ROW 
EXECUTE FUNCTION update_system_settings_updated_at();
