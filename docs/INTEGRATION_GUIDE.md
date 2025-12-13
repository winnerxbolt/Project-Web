# 🔗 Blackout Dates Integration Guide

## ✅ สิ่งที่เพิ่มเติม (New Features)

### 1. 📝 Modal Components สำหรับแก้ไข (3 Modals)

#### ✨ HolidayModal.tsx
**Location:** `components/HolidayModal.tsx`

**Features:**
- ✏️ แก้ไข/สร้างวันหยุดใหม่
- 🎨 Form สมบูรณ์: ชื่อไทย/อังกฤษ, วันที่เริ่ม/สิ้นสุด, ประเภท, ราคาเพิ่ม, พักขั้นต่ำ, Emoji, สี
- 🔄 รองรับ Recurring (ซ้ำทุกปี)
- 🎯 Integration กับ API `/api/holidays`

**การใช้งาน:**
```tsx
import HolidayModal from '@/components/HolidayModal'

<HolidayModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={loadData}
  holiday={selectedHoliday} // null = สร้างใหม่, object = แก้ไข
/>
```

#### 🔧 MaintenanceModal.tsx
**Location:** `components/MaintenanceModal.tsx`

**Features:**
- 🛠️ สร้าง/แก้ไขตารางซ่อมบำรุง
- 📋 Form ครบถ้วน: หัวข้อ, ประเภท, Priority, วันที่, ระยะเวลา, ค่าใช้จ่าย
- 👷 มอบหมายพนักงาน/ผู้รับเหมา
- 📊 Progress Bar (ความคืบหน้า 0-100%)
- 📧 **Email Notification**: ส่งอีเมลแจ้งลูกค้าอัตโนมัติ
- 🎯 Integration กับ API `/api/maintenance` และ `/api/maintenance/notify`

**การใช้งาน:**
```tsx
import MaintenanceModal from '@/components/MaintenanceModal'

<MaintenanceModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={loadData}
  maintenance={selectedMaintenance}
/>
```

#### 🌸 SeasonalModal.tsx
**Location:** `components/SeasonalModal.tsx`

**Features:**
- 🗓️ สร้าง/แก้ไขราคาตามฤดูกาล
- 💰 ตั้งค่า: ชื่อฤดูกาล, ช่วงวันที่, วิธีปรับราคา (%, บาท, ตัวคูณ)
- 🎁 Early Bird Discount (ส่วนลดจองล่วงหน้า)
- 📅 Long Stay Discount (ส่วนลดพักยาว - หลายระดับ)
- 🏷️ Tags, Badge, Priority
- 🎯 Integration กับ API `/api/seasonal-pricing`

**การใช้งาน:**
```tsx
import SeasonalModal from '@/components/SeasonalModal'

<SeasonalModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={loadData}
  seasonal={selectedSeasonal}
/>
```

---

### 2. 📧 Email Notification System

#### API Endpoint: `/api/maintenance/notify`

**Features:**
- 🔍 ค้นหาการจองที่ได้รับผลกระทบอัตโนมัติ
- 📧 ส่งอีเมลแจ้งเตือนลูกค้าทุกคนที่มีการจองในช่วงซ่อมบำรุง
- 📝 Log การส่งอีเมลทุกครั้งใน `data/email-logs.json`
- 🎨 Template อีเมลภาษาไทยสวยงาม

**POST Request:**
```typescript
await fetch('/api/maintenance/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    maintenanceId: 'maintenance-001',
    title: 'ซ่อมระบบสระว่ายน้ำ',
    startDate: '2025-12-15',
    endDate: '2025-12-17',
    message: 'ขออภัยในความไม่สะดวก สระว่ายน้ำจะปิดให้บริการ'
  })
})
```

**Response:**
```json
{
  "success": true,
  "message": "ส่งอีเมลแจ้งเตือนสำเร็จ",
  "notificationsSent": 3,
  "affectedBookings": 3,
  "notifications": [
    {
      "to": "customer@example.com",
      "subject": "⚠️ การแจ้งเตือน: ซ่อมระบบสระว่ายน้ำ",
      "guestName": "สมชาย ใจดี",
      "bookingId": "BOOK-001"
    }
  ]
}
```

**Email Template:**
```
เรียน คุณสมชาย ใจดี

เราขอแจ้งให้ทราบเกี่ยวกับการซ่อมบำรุงที่อาจส่งผลกระทบต่อการเข้าพักของคุณ:

📋 รายละเอียด:
ขออภัยในความไม่สะดวก สระว่ายน้ำจะปิดให้บริการ

📅 ช่วงเวลา:
วันที่: 15 ธันวาคม พ.ศ. 2568
ถึงวันที่: 17 ธันวาคม พ.ศ. 2568

📌 การจองของคุณ:
หมายเลขจอง: BOOK-001
Check-in: 14 ธันวาคม พ.ศ. 2568
Check-out: 18 ธันวาคม พ.ศ. 2568
ห้อง: Pool Villa Deluxe

เราขออภัยในความไม่สะดวก หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือใด ๆ 
กรุณาติดต่อเราได้ที่:
📞 โทร: 02-XXX-XXXX
📧 อีเมล: support@poolvillabooking.com

ขอขอบคุณสำหรับความเข้าใจของท่าน

ด้วยความเคารพ
ทีมงาน Pool Villa Booking
```

**GET Email Logs:**
```typescript
const res = await fetch('/api/maintenance/notify')
const data = await res.json()
console.log(data.logs) // ประวัติการส่งอีเมลทั้งหมด
```

---

### 3. 🏨 Integration กับระบบจองห้อง

#### Updated Files:

##### 📅 `components/RoomCalendar.tsx`
**Changes:**
- เพิ่ม status ใหม่: `'blackout'`
- เพิ่ม properties: `priceMultiplier`, `seasonalAdjustment`, `isBlackout`, `blackoutReason`
- สี Gradient ใหม่สำหรับแต่ละ status:
  - 🔴 Booked: Red gradient
  - 🟡 Pending: Yellow gradient
  - 🟠 Holiday: Yellow-Orange gradient (เปลี่ยนจาก Green)
  - 🔶 Maintenance: Orange-Red gradient
  - ⚫ Blackout: Gray gradient (ใหม่)

**Display Logic:**
```tsx
case 'holiday':
  return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
case 'maintenance':
  return 'bg-gradient-to-br from-orange-400 to-red-600 text-white'
case 'blackout':
  return 'bg-gradient-to-br from-gray-600 to-gray-800 text-white'
```

##### 🔌 `app/api/calendar/route.ts`
**Major Update:**

**New Function: `checkBlackoutStatus()`**
ตรวจสอบวันที่กับ 4 ระบบ:
1. **Holidays** - จาก `data/holidays.json`
2. **Maintenance** - จาก `data/maintenance-schedule.json`
3. **Blackout Dates** - จาก `data/blackout-dates.json`
4. **Seasonal Pricing** - จาก `data/seasonal-pricing.json`

**Flow:**
```
GET /api/calendar?roomId=1&year=2025&month=12
  ↓
สร้าง Calendar ทุกวันในเดือน (1-31)
  ↓
แต่ละวัน → checkBlackoutStatus()
  ↓
ผสานข้อมูล: Booking + Blackout + Holiday + Maintenance + Seasonal
  ↓
Return enriched calendar with:
  - status (booked/pending/holiday/maintenance/blackout/available)
  - priceMultiplier (ถ้ามี holiday multiplier)
  - seasonalAdjustment (ถ้าอยู่ในฤดูกาล)
  - isBlackout (ไม่สามารถจองได้)
  - note (ข้อความแสดงผล)
```

**Priority Logic:**
1. ถ้ามีการจอง (booked/pending) → เก็บ status นี้ไว้
2. ถ้าไม่มีการจอง:
   - Holiday → status = 'holiday'
   - Maintenance + affectsBooking → status = 'maintenance'
   - Blackout + !allowBooking → status = 'blackout'
   - Seasonal Pricing → เพิ่ม seasonalAdjustment แต่ status = 'available'

**Example Response:**
```json
{
  "success": true,
  "calendar": [
    {
      "roomId": 1,
      "date": "2025-12-25",
      "status": "holiday",
      "note": "🎉 Christmas Day",
      "priceMultiplier": 1.8,
      "seasonalAdjustment": 50
    },
    {
      "roomId": 1,
      "date": "2025-12-26",
      "status": "maintenance",
      "isBlackout": true,
      "blackoutReason": "🔧 ซ่อมระบบสระว่ายน้ำ",
      "note": "สระว่ายน้ำปิดให้บริการ"
    },
    {
      "roomId": 1,
      "date": "2025-12-15",
      "status": "available",
      "seasonalAdjustment": 50,
      "note": "🔥 High Season",
      "hasSpecialDiscount": false
    }
  ]
}
```

---

### 4. 🎨 Admin Dashboard Updates

**File:** `app/admin/blackout-dates/page.tsx`

**Changes:**
- Import ทั้งหมด 4 Modals:
  ```tsx
  import BlackoutModal from '@/components/BlackoutModal'
  import HolidayModal from '@/components/HolidayModal'
  import MaintenanceModal from '@/components/MaintenanceModal'
  import SeasonalModal from '@/components/SeasonalModal'
  ```

- เพิ่ม Modal States:
  ```tsx
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showSeasonalModal, setShowSeasonalModal] = useState(false)
  ```

- Render ทั้งหมด 4 Modals ที่ท้ายหน้า
- ปุ่มสร้างใหม่แต่ละ Tab เชื่อมกับ Modal ที่ถูกต้อง

---

## 📊 System Flow

### ขั้นตอนการทำงานทั้งระบบ:

```
1. Admin Dashboard
   ↓
2. สร้าง/แก้ไข (ผ่าน Modal)
   - Holiday → HolidayModal → POST /api/holidays
   - Maintenance → MaintenanceModal → POST /api/maintenance + notify
   - Seasonal → SeasonalModal → POST /api/seasonal-pricing
   - Blackout → BlackoutModal → POST /api/blackout-dates
   ↓
3. บันทึกใน Data Files
   - data/holidays.json
   - data/maintenance-schedule.json
   - data/seasonal-pricing.json
   - data/blackout-dates.json
   ↓
4. Customer View Calendar
   - /rooms/[id] → RoomCalendar component
   - GET /api/calendar?roomId=X&year=Y&month=Z
   ↓
5. API ประมวลผล
   - checkBlackoutStatus() ตรวจสอบทุกวัน
   - ผสาน: Bookings + Holidays + Maintenance + Blackouts + Seasonal
   ↓
6. แสดงผลบน Calendar
   - สีตาม status (red/yellow/orange/gray)
   - แสดงราคา multiplier/adjustment
   - แสดง note/badge
   - Block การจองถ้า isBlackout = true
```

---

## 🚀 การใช้งานในระบบจริง

### Scenario 1: สร้างวันหยุดใหม่

```typescript
// 1. Admin กดปุ่ม "เพิ่มวันหยุด"
<button onClick={() => {
  setSelectedHoliday(null)
  setShowHolidayModal(true)
}}>
  เพิ่มวันหยุด
</button>

// 2. HolidayModal เปิด
// 3. Admin กรอกข้อมูล:
//    - ชื่อ: วันสงกรานต์
//    - วันที่: 2026-04-13 ถึง 2026-04-15
//    - ราคาเพิ่ม: 2.5 (คูณ 2.5 เท่า)
//    - พักขั้นต่ำ: 3 คืน
//    - Emoji: 💦
//    - ซ้ำทุกปี: ✅

// 4. Submit → POST /api/holidays
// 5. บันทึกใน data/holidays.json
// 6. Calendar อัพเดตอัตโนมัติ
//    - วันที่ 13-15 เมษายน แสดงสีเหลือง-ส้ม
//    - แสดง "💦 วันสงกรานต์"
//    - ราคาคูณ 2.5 เท่า
```

### Scenario 2: ตั้งตารางซ่อมบำรุง + ส่งอีเมล

```typescript
// 1. Admin สร้างตารางซ่อมบำรุง
// 2. MaintenanceModal:
//    - หัวข้อ: ทาสีภายนอก
//    - วันที่: 2025-12-20 ถึง 2025-12-22
//    - ส่งผลต่อการจอง: ✅
//    - แจ้งเตือนลูกค้า: ✅
//    - ข้อความ: "ขออภัย จะมีเสียงดังบ้าง"

// 3. Submit → 
//    a) POST /api/maintenance
//    b) POST /api/maintenance/notify (automatic)

// 4. ระบบทำงาน:
//    - ค้นหาการจองที่ overlap กับ 20-22 ธ.ค.
//    - พบ 2 การจอง: BOOK-101, BOOK-102
//    - ส่งอีเมลถึง 2 ลูกค้า
//    - Log ใน data/email-logs.json

// 5. Calendar อัพเดต:
//    - วันที่ 20-22 ธ.ค. แสดงสีส้ม-แดง
//    - แสดง "🔧 ทาสีภายนอก"
//    - ถ้า partialClosure = false → block การจอง
```

### Scenario 3: ลูกค้าจองห้อง

```typescript
// 1. ลูกค้าเข้าหน้า /rooms/1
// 2. RoomCalendar แสดง:
//    GET /api/calendar?roomId=1&year=2025&month=12

// 3. API Response:
{
  "calendar": [
    { "date": "2025-12-13", "status": "holiday", "priceMultiplier": 2.0 },
    { "date": "2025-12-14", "status": "booked" },
    { "date": "2025-12-15", "status": "maintenance", "isBlackout": true },
    { "date": "2025-12-16", "status": "available", "seasonalAdjustment": 50 }
  ]
}

// 4. Calendar Display:
//    13 ธ.ค.: สีเหลือง-ส้ม, ราคา +100%, จองได้
//    14 ธ.ค.: สีแดง, จองแล้ว
//    15 ธ.ค.: สีส้ม-แดง, ไม่สามารถจองได้
//    16 ธ.ค.: สีขาว-ฟ้า, ราคา +50%, จองได้

// 5. Click วันที่ 15:
//    → แสดง Modal: "🔧 ทาสีภายนอก - ไม่สามารถจองได้"
```

---

## 🎯 Features Summary

| Feature | Status | Component | API |
|---------|--------|-----------|-----|
| 📝 Holiday Modal | ✅ | `HolidayModal.tsx` | `/api/holidays` |
| 🔧 Maintenance Modal | ✅ | `MaintenanceModal.tsx` | `/api/maintenance` |
| 🌸 Seasonal Modal | ✅ | `SeasonalModal.tsx` | `/api/seasonal-pricing` |
| 📧 Email Notifications | ✅ | `MaintenanceModal.tsx` | `/api/maintenance/notify` |
| 📅 Calendar Integration | ✅ | `RoomCalendar.tsx` | `/api/calendar` |
| 🎨 Color Coding | ✅ | All components | - |
| 🔍 Auto-Detection | ✅ | `checkBlackoutStatus()` | `/api/calendar` |
| 📊 Email Logging | ✅ | `email-logs.json` | `/api/maintenance/notify` |

---

## 💡 Tips & Best Practices

### 1. Email Notifications
- ✅ **ตั้ง "แจ้งเตือนลูกค้า"** เมื่อซ่อมบำรุงส่งผลต่อการจอง
- ✅ เขียน **Guest Message ชัดเจน** ว่ามีผลกระทบอย่างไร
- ✅ ตั้ง **Partial Closure** ถ้าเปิดให้จองได้แต่มีข้อจำกัด
- ⚠️ ระบบจะส่งอีเมลแค่ครั้งเดียว (เมื่อสร้าง/แก้ไข)

### 2. Calendar Display
- 🎨 Calendar จะแสดง **Priority สูงสุดก่อน**:
  1. Booked/Pending (เก็บไว้เสมอ)
  2. Holiday
  3. Maintenance
  4. Blackout
  5. Seasonal (แสดงพร้อมกับ status อื่น)

### 3. Production Setup
- 📧 **เปลี่ยน Email Service**: แก้ใน `/api/maintenance/notify/route.ts`
  ```typescript
  // Production: ใช้ SendGrid, AWS SES, หรือ Nodemailer
  import { sendEmail } from '@/lib/email'
  await sendEmail(emailContent)
  ```

- 🔔 **เพิ่ม Notification ตัวอื่น**:
  - SMS notification
  - LINE notification
  - Push notification

### 4. Testing
```bash
# 1. สร้างวันหยุด
# → ไปหน้า /admin/blackout-dates → Tab "Holidays" → เพิ่มวันหยุด

# 2. ตรวจสอบ Calendar
# → ไปหน้า /rooms/1 → ดู RoomCalendar มีสีเหลือง-ส้มหรือไม่

# 3. สร้าง Maintenance + อีเมล
# → Tab "Maintenance" → เปิด "แจ้งเตือนลูกค้า" → Submit

# 4. ตรวจสอบ Logs
# → GET /api/maintenance/notify หรือดู data/email-logs.json
```

---

## 📞 Support

ถ้ามีปัญหาหรือต้องการเพิ่มฟีเจอร์:
- 📝 Documentation: `/BLACKOUT_DATES_GUIDE.md`
- 🔧 Integration Guide: This file
- 💬 Contact: ติดต่อผ่านระบบ

---

**Version:** 2.0  
**Last Updated:** December 10, 2025  
**Status:** ✅ Production Ready
