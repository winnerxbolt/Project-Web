# ระบบ Login Delay พร้อม Database

## 📋 ภาพรวม
ระบบนี้จะบันทึกความพยายาม login ที่ผิดพลาดลง database และ delay 30 วินาทีหลังจาก login ผิด

## 🚀 ขั้นตอนการติดตั้ง

### 1. รัน SQL Script ใน Supabase

เปิด Supabase Dashboard → SQL Editor → รันไฟล์ `create-failed-login-table.sql`

```sql
-- ไฟล์นี้จะสร้าง:
-- ✅ ตาราง failed_login_attempts
-- ✅ Indexes สำหรับ query ที่เร็วขึ้น
-- ✅ RLS policies
-- ✅ Triggers สำหรับ auto-update
```

### 2. ตรวจสอบ Environment Variables

ตรวจสอบไฟล์ `.env.local` ให้มีค่าเหล่านี้:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-super-secret-cron-key
```

### 3. Restart Development Server

```bash
# หยุด server (Ctrl+C)
# เริ่มใหม่
npm run dev
```

## 📊 โครงสร้าง Database

### ตาราง: `failed_login_attempts`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| identifier | TEXT | IP address หรือ client identifier |
| attempt_count | INTEGER | จำนวนครั้งที่พยายาม login ผิด |
| last_attempt_at | TIMESTAMP | เวลาที่พยายามล่าสุด |
| blocked_until | TIMESTAMP | เวลาที่ block จนถึง (30 วินาที) |
| created_at | TIMESTAMP | เวลาที่สร้างข้อมูล |
| updated_at | TIMESTAMP | เวลาที่อัพเดทล่าสุด |

## 🔧 การทำงานของระบบ

### เมื่อ Login ผิด:
1. บันทึก IP address ลง database
2. ตั้งค่า `blocked_until` = ปัจจุบัน + 30 วินาที
3. เพิ่ม `attempt_count` ขึ้น 1
4. Frontend แสดง countdown timer

### เมื่อ Login สำเร็จ:
1. ลบข้อมูลออกจาก database
2. ปลดบล็อคทันที
3. Redirect ไปหน้าหลัก

### เมื่อครบ 30 วินาที:
1. ระบบอนุญาตให้ลองใหม่ได้
2. ยังเก็บประวัติไว้ใน database
3. ถ้า login ผิดอีก จะ reset เป็น 30 วินาทีใหม่

## 🧹 Cleanup (ทำความสะอาดข้อมูลเก่า)

### วิธีที่ 1: Manual Cleanup

เรียก API endpoint:

```bash
curl -X GET http://localhost:3000/api/cron/cleanup-failed-logins \
  -H "Authorization: Bearer your-super-secret-cron-key"
```

### วิธีที่ 2: Auto Cleanup (Vercel Cron)

สร้างไฟล์ `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/cleanup-failed-logins",
    "schedule": "0 */6 * * *"
  }]
}
```

หมายเหตุ: จะรันทุก 6 ชั่วโมง (ลบข้อมูลเก่ากว่า 24 ชม.)

### วิธีที่ 3: Database Scheduled Query (Supabase)

ไปที่ Supabase Dashboard → SQL Editor → สร้าง scheduled query:

```sql
-- รันทุก 6 ชั่วโมง
SELECT cleanup_old_failed_login_attempts();
```

## 🎯 API Endpoints

### `/api/auth/login` (POST)
- บันทึก failed attempts
- ตรวจสอบ delay
- ล้างข้อมูลเมื่อสำเร็จ

### `/api/cron/cleanup-failed-logins` (GET)
- ทำความสะอาดข้อมูลเก่า
- ต้องมี Authorization header

## 📱 Frontend Features

- ✅ Countdown timer นับถอยหลัง
- ✅ Disable ฟอร์มขณะรอ
- ✅ แสดงเวลาที่เหลือ
- ✅ Animation เตือน
- ✅ ปลดบล็อคอัตโนมัติหลัง 30 วิ

## 🔒 ความปลอดภัย

### 1. Rate Limiting
- 5 ครั้งต่อ 15 นาที (from memory)
- 30 วินาทีต่อ 1 ครั้ง login ผิด (from database)

### 2. Database Security
- RLS policies เปิดใช้งาน
- เฉพาะ service_role เข้าถึงได้
- Auto-cleanup ข้อมูลเก่า

### 3. Best Practices
- ใช้ IP address + user agent เป็น identifier
- Generic error messages (ไม่บอกว่า email หรือ password ผิด)
- Secure cookie (httpOnly, sameSite, secure)

## 🧪 การทดสอบ

### 1. ทดสอบ Login ผิด
```
1. ไปที่ /login
2. ใส่รหัสผ่านผิด
3. เห็น countdown 30 วินาที
4. ปุ่ม disabled
5. ตรวจสอบ database: SELECT * FROM failed_login_attempts;
```

### 2. ทดสอบ Login สำเร็จ
```
1. รอครบ 30 วินาที
2. ใส่รหัสผ่านถูก
3. ข้อมูลถูกลบออกจาก database
4. Redirect ไปหน้าหลัก
```

### 3. ทดสอบ Cleanup
```
1. สร้างข้อมูลทดสอบอายุ 25 ชม.
2. เรียก cleanup API
3. ตรวจสอบว่าข้อมูลถูกลบ
```

## 📊 ตรวจสอบสถานะ

### ดูข้อมูลทั้งหมดใน database:

```sql
SELECT 
  identifier,
  attempt_count,
  last_attempt_at,
  blocked_until,
  CASE 
    WHEN blocked_until > NOW() THEN 'BLOCKED'
    ELSE 'ALLOWED'
  END as status,
  EXTRACT(EPOCH FROM (blocked_until - NOW())) as remaining_seconds
FROM failed_login_attempts
ORDER BY last_attempt_at DESC;
```

### ดูเฉพาะที่ถูก block อยู่:

```sql
SELECT * FROM failed_login_attempts
WHERE blocked_until > NOW()
ORDER BY blocked_until DESC;
```

### สถิติ:

```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE blocked_until > NOW()) as currently_blocked,
  MAX(attempt_count) as max_attempts,
  AVG(attempt_count) as avg_attempts
FROM failed_login_attempts;
```

## 🎨 Customization

### เปลี่ยนเวลา Delay

แก้ไขใน `lib/server/failedLoginAttempts.ts`:

```typescript
const blockedUntil = new Date(now.getTime() + 60 * 1000) // เปลี่ยนเป็น 60 วิ
```

### เปลี่ยน Cleanup Period

แก้ไขใน `lib/server/failedLoginAttempts.ts`:

```typescript
const twentyFourHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 ชม.
```

## ⚠️ สิ่งที่ควรทราบ

1. **Database Dependency**: ระบบต้องการ Supabase ทำงาน
2. **IP Address**: ใช้ IP เป็น identifier (อาจมีปัญหาถ้าอยู่หลัง NAT)
3. **Cleanup**: ควรตั้ง cron job ให้รันเป็นระยะ
4. **Rate Limiting**: ยังมี rate limit แบบเดิมทำงานควบคู่กัน

## 🆘 Troubleshooting

### ปัญหา: Delay ไม่ทำงาน
- ตรวจสอบ SQL รันสำเร็จหรือไม่
- ตรวจสอบ SUPABASE_SERVICE_ROLE_KEY ถูกต้อง
- ดู console.log ว่ามี error หรือไม่

### ปัญหา: ข้อมูลไม่ลบ
- ตรวจสอบ RLS policies
- ใช้ service_role key (ไม่ใช่ anon key)
- เรียก cleanup API ด้วยตนเอง

### ปัญหา: Countdown ไม่แสดง
- ตรวจสอบ Frontend code
- ดู Network tab ว่า API ส่ง remainingSeconds กลับมาหรือไม่
- ตรวจสอบ useState hooks

## 📚 ไฟล์ที่เกี่ยวข้อง

- `create-failed-login-table.sql` - SQL สำหรับสร้างตาราง
- `lib/server/failedLoginAttempts.ts` - Functions สำหรับจัดการ database
- `app/api/auth/login/route.ts` - Login API พร้อม delay
- `app/login/page.tsx` - Login form พร้อม countdown timer
- `app/api/cron/cleanup-failed-logins/route.ts` - Cleanup cron job

## ✅ Checklist

- [ ] รัน SQL script ใน Supabase
- [ ] ตรวจสอบ environment variables
- [ ] Restart development server
- [ ] ทดสอบ login ผิด
- [ ] ทดสอบ login สำเร็จ
- [ ] ตั้งค่า cron job (optional)
- [ ] Monitor database size
