# 💾 Auto Backup System - Complete Guide
## ระบบสำรองข้อมูลอัตโนมัติ

---

## 📋 Overview

ระบบ Auto Backup ที่ทำงานอัตโนมัติตาม schedule พร้อมจัดการไฟล์ข้อมูลทั้งหมดของเว็บไซต์

---

## ✅ Files Being Backed Up (24 ไฟล์)

### 1. User & Authentication (2 ไฟล์)
- `users.json` - ข้อมูลผู้ใช้งาน
- `sessions.json` - Session การเข้าสู่ระบบ

### 2. Booking & Reservations (4 ไฟล์)
- `bookings.json` - การจองห้องพัก
- `bookingCalendar.json` - ปฏิทินการจอง
- `group-bookings.json` - จองหมู่คณะ
- `rooms.json` - ข้อมูลห้องพัก

### 3. Payment & Financial (3 ไฟล์)
- `payments.json` - ประวัติการชำระเงิน
- `coupons.json` - คูปองส่วนลด
- `points.json` - แต้มสะสม

### 4. Customer Management (3 ไฟล์)
- `reviews.json` - รีวิวลูกค้า
- `wishlist.json` - รายการโปรด
- `notifications.json` - การแจ้งเตือน

### 5. Group Booking System (3 ไฟล์)
- `group-discount-settings.json` - ตั้งค่าส่วนลดกรุ๊ป
- `corporate-clients.json` - ลูกค้าองค์กร
- `group-quote-templates.json` - เทมเพลตใบเสนอราคา

### 6. Dynamic Pricing (4 ไฟล์)
- `dynamic-pricing-settings.json` - ตั้งค่าราคาไดนามิก
- `demand-pricing-rules.json` - กฎราคาตามอุปสงค์
- `seasonal-pricing.json` - ราคาตามฤดูกาล
- `blackout-dates.json` - วันที่ปิดรับจอง

### 7. Content & Communication (5 ไฟล์)
- `videos.json` - วิดีโอ Poolvilla
- `chat-messages.json` - ข้อความแชท
- `faq.json` - คำถามที่พบบ่อย
- `auto-replies.json` - ข้อความตอบกลับอัตโนมัติ
- `locations.json` - ข้อมูลสถานที่

### 8. System Configuration (1 ไฟล์)
- `backup-config.json` - การตั้งค่า backup

---

## 🚀 Features

### 1. Auto Backup Schedule
- **Daily**: ทุกวัน เวลา 02:00 น.
- **Weekly**: ทุก 7 วัน
- **Monthly**: ทุกเดือน
- **Custom**: กำหนดเองทุก X วัน

### 2. Manual Backup
- สำรองข้อมูลทันทีได้ทุกเมื่อ
- เลือกไฟล์ที่ต้องการ backup
- แสดงสถานะ real-time

### 3. Selective Backup
- เลือกได้ว่าจะ backup ไฟล์ไหนบ้าง
- ประหยัดพื้นที่จัดเก็บ
- Backup เฉพาะข้อมูลสำคัญ

### 4. Auto Delete Old Backups
- ลบ backup เก่าอัตโนมัติ
- เก็บเฉพาะ backup ล่าสุด
- ประหยัดพื้นที่

### 5. Restore System
- กู้คืนข้อมูลจาก backup ใดก็ได้
- แสดงรายการ backup ทั้งหมด
- ตรวจสอบว่าไฟล์ยังมีอยู่จริง

---

## 📂 Backup Structure

```
backups/
├── 2025-12/
│   ├── backup-day10_02-00/
│   │   ├── users.json
│   │   ├── sessions.json
│   │   ├── bookings.json
│   │   ├── rooms.json
│   │   ├── payments.json
│   │   ├── group-bookings.json
│   │   └── ... (24 files total)
│   └── backup-day11_02-00/
│       └── ...
└── 2025-11/
    └── ...
```

---

## 🔌 API Endpoints

### 1. GET `/api/backup`
ดึงรายการ backup ทั้งหมด

**Response:**
```json
{
  "success": true,
  "backups": [
    {
      "name": "backup-day10_02-00",
      "month": "2025-12",
      "date": "2025-12-10T02:00:00.000Z",
      "size": 1024000,
      "exists": true
    }
  ]
}
```

### 2. GET `/api/backup?action=config`
ดึงการตั้งค่า backup

**Response:**
```json
{
  "success": true,
  "config": {
    "enabled": true,
    "schedule": "daily",
    "backupTime": "02:00",
    "selectedFiles": ["users.json", "bookings.json"],
    "autoDelete": true,
    "lastBackup": "2025-12-10T02:00:00.000Z"
  },
  "availableFiles": ["users.json", "sessions.json", ...]
}
```

### 3. POST `/api/backup`
สร้าง backup ใหม่ (Manual)

**Request Body:**
```json
{
  "selectedFiles": ["users.json", "bookings.json"],
  "autoDelete": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ สำรองข้อมูลสำเร็จ",
  "backupName": "backup-day10_14-30",
  "files": ["users.json", "bookings.json"]
}
```

### 4. POST `/api/backup` (Restore)
กู้คืนข้อมูล

**Request Body:**
```json
{
  "action": "restore",
  "backupName": "backup-day10_02-00",
  "month": "2025-12"
}
```

### 5. POST `/api/backup` (Save Config)
บันทึกการตั้งค่า

**Request Body:**
```json
{
  "action": "saveConfig",
  "config": {
    "enabled": true,
    "schedule": "daily",
    "backupTime": "02:00",
    "selectedFiles": [...],
    "autoDelete": true
  }
}
```

### 6. POST `/api/backup/auto`
Auto backup endpoint (เรียกจาก Vercel Cron)

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Auto backup completed",
  "backupName": "backup-day10_02-00",
  "files": [...]
}
```

### 7. GET `/api/backup/auto`
ตรวจสอบสถานะ auto backup

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "schedule": "daily",
  "backupTime": "02:00",
  "lastBackup": "2025-12-10T02:00:00.000Z",
  "nextBackup": "2025-12-11T02:00:00.000Z",
  "selectedFiles": [...],
  "autoDelete": true
}
```

---

## ⚙️ Configuration

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/backup/auto",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Environment Variables
```env
CRON_SECRET=your-secret-key-here
NODE_ENV=production
```

---

## 🔄 How Auto Backup Works

### 1. Vercel Cron Triggers
- Vercel เรียก `/api/backup/auto` ตาม schedule
- ส่ง Authorization header พร้อม secret

### 2. Check Configuration
- อ่านการตั้งค่าจาก `backup-config.json`
- ตรวจสอบว่า enabled หรือไม่
- ตรวจสอบไฟล์ที่เลือก

### 3. Create Backup
- สร้างโฟลเดอร์ตามเดือน (YYYY-MM)
- สร้าง subfolder ตามวันและเวลา
- คัดลอกไฟล์ที่เลือกไว้

### 4. Auto Delete (Optional)
- ถ้าเปิดใช้งาน auto delete
- ลบ backup เก่าออก
- เก็บเฉพาะ backup ล่าสุด

### 5. Update Config
- บันทึกเวลา backup ล่าสุด
- เพิ่มประวัติ backup ใหม่
- อัพเดต backup history

---

## 📊 Admin Dashboard

### Path: `/admin/backup`

**Features:**
1. **Configuration Panel**
   - เปิด/ปิด auto backup
   - เลือก schedule (daily/weekly/monthly/custom)
   - กำหนดเวลา backup
   - เลือกไฟล์ที่ต้องการ
   - เปิด/ปิด auto delete

2. **Status Panel**
   - แสดงสถานะปัจจุบัน
   - ความถี่การ backup
   - จำนวนไฟล์ที่เลือก
   - จำนวน backup ทั้งหมด
   - เวลา backup ล่าสุด

3. **Actions**
   - Manual backup ทันที
   - ลบ backup ทั้งหมด
   - Test auto backup

4. **Backup List**
   - รายการ backup แยกตามเดือน
   - แสดงวันที่และขนาด
   - ปุ่มกู้คืนข้อมูล
   - ปุ่มลบแต่ละรายการ

---

## 🛡️ Security

### 1. Authorization
- ใช้ CRON_SECRET ป้องกันการเรียกจากภายนอก
- ตรวจสอบ Authorization header

### 2. File Validation
- ตรวจสอบว่าไฟล์อยู่ใน AVAILABLE_FILES
- ป้องกันการ access ไฟล์อื่น

### 3. Path Validation
- ใช้ path.join() ป้องกัน path traversal
- จำกัด access เฉพาะ data directory

---

## 📈 Best Practices

### 1. Backup Frequency
- **Production**: Daily backup แนะนำ
- **Development**: Weekly หรือ Manual
- **High Traffic**: Multiple backups per day

### 2. Storage Management
- เปิด auto delete ใน production
- เก็บ backup ล่าสุดไว้เสมอ
- Download backup สำคัญไว้ที่อื่น

### 3. File Selection
- Backup ไฟล์สำคัญทั้งหมด (recommended)
- ไม่ควร backup backup-config.json เพียงอย่างเดียว
- รวม dynamic pricing และ group booking data

### 4. Testing
- ทดสอบ restore อย่างน้อยเดือนละครั้ง
- ทดสอบ manual backup หลังแก้ไข config
- ตรวจสอบ backup ว่ามีไฟล์ครบ

---

## 🔧 Troubleshooting

### ปัญหา: Auto Backup ไม่ทำงาน
**แก้ไข:**
1. ตรวจสอบ `enabled: true` ใน config
2. ตรวจสอบ Vercel Cron settings
3. ตรวจสอบ CRON_SECRET
4. ดู Vercel logs

### ปัญหา: ไฟล์บางไฟล์ไม่ถูก backup
**แก้ไข:**
1. ตรวจสอบว่าเลือกไฟล์ใน selectedFiles
2. ตรวจสอบว่าไฟล์มีอยู่จริงใน data/
3. ตรวจสอบ file permissions

### ปัญหา: Restore ไม่สำเร็จ
**แก้ไข:**
1. ตรวจสอบว่า backup exists: true
2. ตรวจสอบ backup path
3. ตรวจสอบว่าไฟล์ไม่ corrupt

### ปัญหา: พื้นที่เต็ม
**แก้ไข:**
1. เปิด autoDelete
2. ลบ backup เก่าทิ้ง
3. ลดจำนวนไฟล์ที่ backup

---

## 📝 Changelog

### Version 2.0 (December 2025)
- ✅ เพิ่มไฟล์ backup จาก 3 เป็น 24 ไฟล์
- ✅ รองรับ Group Booking data
- ✅ รองรับ Dynamic Pricing data
- ✅ เพิ่ม Auto backup endpoint
- ✅ เพิ่ม Vercel Cron integration
- ✅ ปรับปรุง UI/UX
- ✅ เพิ่ม Test auto backup feature
- ✅ แสดงสถานะ backup real-time

### Version 1.0 (November 2025)
- Initial release
- Basic backup functionality
- 3 files support

---

## 🎯 Future Enhancements

1. **Cloud Storage Integration**
   - AWS S3 backup
   - Google Drive backup
   - Dropbox backup

2. **Backup Compression**
   - ZIP compression
   - Reduce storage usage
   - Faster downloads

3. **Incremental Backup**
   - Backup เฉพาะไฟล์ที่เปลี่ยนแปลง
   - ประหยัดเวลาและพื้นที่

4. **Backup Encryption**
   - Encrypt backup files
   - Password protection

5. **Email Notifications**
   - แจ้งเตือนเมื่อ backup สำเร็จ
   - แจ้งเตือนเมื่อ backup ล้มเหลว

6. **Backup Verification**
   - ตรวจสอบ integrity ของ backup
   - Verify ว่าไฟล์ไม่ corrupt

---

## 📞 Support

**Admin Dashboard:** `/admin/backup`

**API Endpoints:**
- `/api/backup` - Main backup API
- `/api/backup/auto` - Auto backup (Cron)

**Documentation:** `BACKUP_SYSTEM_GUIDE.md`

---

**Built with ❤️ for Poolvilla Pattaya**
