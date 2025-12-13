# 🚀 Quick Start - ทดสอบระบบใหม่ทั้งหมด

## 📋 สารบัญ
1. [เริ่มต้นใช้งาน](#getting-started)
2. [ทดสอบ E-Ticket](#test-eticket)
3. [ทดสอบ Loyalty Program](#test-loyalty)
4. [ทดสอบ Web Push Notifications](#test-push)
5. [ทดสอบ Advanced Charts](#test-charts)
6. [ทดสอบการเชื่อมต่อทั้งหมด](#test-integration)

---

## 🎯 เริ่มต้นใช้งาน {#getting-started}

### 1. ติดตั้ง Dependencies

```bash
cd "c:\Users\wavew\Desktop\Winnerboy\Project-WebWin"
npm install jspdf qrcode jsbarcode web-push recharts
```

### 2. สร้าง VAPID Keys สำหรับ Push Notifications

```bash
npx web-push generate-vapid-keys
```

เพิ่มใน `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. รันโปรเจค

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 🎫 ทดสอบ E-Ticket System {#test-eticket}

### API Testing

#### 1. สร้าง E-Ticket ใหม่

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "12345",
    "guestName": "สมชาย ใจดี",
    "guestEmail": "somchai@example.com",
    "guestPhone": "0812345678",
    "roomName": "Deluxe Pool Villa",
    "checkIn": "2025-02-01",
    "checkOut": "2025-02-05",
    "nights": 4,
    "totalAmount": 20000,
    "templateId": "template-modern"
  }'
```

**Expected Response:**
```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "id": "TKT-2025-0001",
    "ticketNumber": "TKT-2025-0001-ABCD1234",
    "status": "active"
  }
}
```

#### 2. ดึงรายการ E-Ticket

```bash
# All tickets
curl http://localhost:3000/api/tickets

# By booking ID
curl http://localhost:3000/api/tickets?bookingId=12345

# By status
curl http://localhost:3000/api/tickets?status=active
```

#### 3. อัปเดตสถานะ

```bash
curl -X PUT http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "TKT-2025-0001",
    "status": "used"
  }'
```

### UI Testing

1. ไปที่ [http://localhost:3000/admin/tickets](http://localhost:3000/admin/tickets)
2. ตรวจสอบว่ามี E-Ticket ที่สร้างขึ้น
3. คลิก "ดู" เพื่อดูรายละเอียด QR Code และ Barcode
4. ทดสอบ "Mark as Used"
5. ทดสอบ "Cancel"

---

## 🎁 ทดสอบ Loyalty Program {#test-loyalty}

### API Testing

#### 1. เพิ่มคะแนน

```bash
curl -X POST http://localhost:3000/api/loyalty \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "points": 200,
    "description": "จากการจอง #12345",
    "referenceId": "12345"
  }'
```

**Expected Response:**
```json
{
  "message": "Points added successfully",
  "member": {
    "userId": "test@example.com",
    "totalPoints": 200,
    "currentTier": "bronze"
  },
  "transaction": {
    "points": 200,
    "description": "จากการจอง #12345"
  }
}
```

#### 2. ดึงข้อมูลสมาชิก

```bash
curl http://localhost:3000/api/loyalty?userId=test@example.com
```

#### 3. แลกคะแนน

```bash
curl -X POST http://localhost:3000/api/loyalty/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "itemId": "discount-10",
    "pointsCost": 500
  }'
```

### UI Testing

1. ไปที่ [http://localhost:3000/loyalty](http://localhost:3000/loyalty)
2. ตรวจสอบ Member Card แสดงถูกต้อง
3. ตรวจสอบ Progress Bar ไปยัง tier ถัดไป
4. ดู Redemption Catalog
5. กรอง Category (ส่วนลด, อัพเกรด, บริการ)
6. ทดสอบแลกคะแนน
7. ดู Transaction History

### ทดสอบ Tier Upgrade

```bash
# Add enough points to upgrade to Silver (1000 points)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/loyalty \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"test@example.com\",
      \"points\": 200,
      \"description\": \"Test transaction $i\"
    }"
done

# Check member info - should be Silver now
curl http://localhost:3000/api/loyalty?userId=test@example.com
```

---

## 🔔 ทดสอบ Web Push Notifications {#test-push}

### 1. Subscribe to Notifications

1. เปิด [http://localhost:3000](http://localhost:3000)
2. ดู PushNotificationManager component
3. คลิก "เปิดการแจ้งเตือน"
4. อนุญาต Notifications ใน Browser
5. ตรวจสอบว่า subscribed สำเร็จ

### 2. ส่ง Test Notification

```bash
# Method 1: Direct API call
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "title": "🎉 ทดสอบการแจ้งเตือน",
    "body": "นี่คือการแจ้งเตือนทดสอบ",
    "icon": "/icons/icon-192x192.png",
    "badge": "/icons/icon-72x72.png",
    "data": {
      "url": "/",
      "test": true
    },
    "actions": [
      {"action": "view", "title": "ดู"},
      {"action": "close", "title": "ปิด"}
    ]
  }'
```

```bash
# Method 2: Broadcast to all
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "📢 ประกาศทดสอบ",
    "body": "ส่งถึงทุกคน"
  }'
```

### 3. ตรวจสอบ Subscriptions

```bash
curl http://localhost:3000/api/push/subscribe?userId=test@example.com
```

### 4. Unsubscribe

1. ไปที่ PushNotificationManager
2. คลิก "ปิดการแจ้งเตือน"
3. ตรวจสอบว่า unsubscribed สำเร็จ

### UI Testing

1. เปิด DevTools → Application → Service Workers
2. ตรวจสอบว่า sw.js ลงทะเบียนแล้ว
3. คลิก "Push" ใน Service Worker เพื่อส่งทดสอบ
4. ตรวจสอบ NotificationBell มีการแจ้งเตือนใหม่
5. คลิกที่การแจ้งเตือนใน NotificationBell
6. ทดสอบ "Mark as Read"
7. ทดสอบ "Mark All as Read"

---

## 📊 ทดสอบ Advanced Charts {#test-charts}

### UI Testing

1. ไปที่ [http://localhost:3000/admin/stats](http://localhost:3000/admin/stats)
2. Scroll ลงมาดู AdvancedCharts component
3. คลิกแท็บ "รายได้" - ดู Line Chart
4. คลิกแท็บ "ห้องพัก" - ดู Bar Chart
5. คลิกแท็บ "สถานะ" - ดู Pie Chart
6. คลิกแท็บ "เข้าพัก" - ดู Area Chart
7. Hover เหนือ chart เพื่อดู Tooltip
8. ตรวจสอบ Responsive (ลดขนาดหน้าจอ)

### Custom Data Testing

แก้ไข `app/admin/stats/page.tsx` และส่ง custom data:

```typescript
<AdvancedCharts 
  data={{
    revenueData: [
      { date: '1 ม.ค.', revenue: 50000, bookings: 15 },
      { date: '2 ม.ค.', revenue: 60000, bookings: 18 },
      // ... more data
    ],
    roomBookings: [...],
    bookingStatus: [...],
    occupancyRate: [...]
  }}
  period="30days"
/>
```

---

## 🔗 ทดสอบการเชื่อมต่อทั้งหมด {#test-integration}

### End-to-End Test Flow

#### 1. สร้างการจองใหม่

1. ไปที่ [http://localhost:3000/rooms](http://localhost:3000/rooms)
2. เลือกห้อง → คลิก "จองเลย"
3. กรอกข้อมูล:
   - ชื่อ: Test User
   - อีเมล: test@example.com
   - เบอร์: 0812345678
   - วันเช็คอิน: วันพรุ่งนี้
   - วันเช็คเอาท์: +3 วัน
4. คลิก "ยืนยันการจอง"

#### 2. ชำระเงิน

1. ไปที่หน้า Checkout
2. เลือกวิธีชำระเงิน
3. อัปโหลดสลิป (หรือกรอกข้อมูล)
4. คลิก "ส่งข้อมูลการชำระเงิน"

#### 3. ตรวจสอบ Payment Success Page

**ต้องเห็น:**
- ✅ Success animation (checkmark bounce)
- ✅ E-Ticket card พร้อมหมายเลข
- ✅ Loyalty Points card แสดงคะแนนที่ได้
- ✅ Booking summary
- ✅ Push notification ถูกส่ง

#### 4. ตรวจสอบ E-Ticket

1. คลิก "ดู E-Ticket" ใน Payment Success Page
2. ไปที่ `/admin/tickets`
3. ควรเห็น E-Ticket ที่สร้างขึ้น
4. คลิก "ดู" เพื่อดู QR Code และ Barcode

#### 5. ตรวจสอบ Loyalty Points

1. คลิก "ดูคะแนนสะสม"
2. ไปที่ `/loyalty`
3. ควรเห็นคะแนนเพิ่มขึ้น
4. ดู Transaction History มี record ใหม่

#### 6. ตรวจสอบ Push Notification

1. ดู Browser notification ที่มุมขวาล่าง
2. คลิก NotificationBell ในNavbar
3. ควรเห็นการแจ้งเตือน "🎉 จองสำเร็จ!"
4. คลิกที่การแจ้งเตือน → ควรไปที่ Payment Success Page

### การคำนวณคะแนน Loyalty

```
ยอดชำระ = 20,000 บาท
คะแนนที่ได้ = 20,000 / 100 = 200 คะแนน

Tier Bronze (1.0x multiplier):
  200 × 1.0 = 200 คะแนน

Tier Silver (1.2x multiplier):
  200 × 1.2 = 240 คะแนน

Tier Gold (1.5x multiplier):
  200 × 1.5 = 300 คะแนน
```

---

## 🐛 Troubleshooting

### E-Ticket ไม่แสดง

```bash
# Check if API is working
curl http://localhost:3000/api/tickets

# Check data file
cat data/e-tickets.json
```

### Loyalty Points ไม่เพิ่ม

```bash
# Check member data
curl http://localhost:3000/api/loyalty?userId=test@example.com

# Check transactions
cat data/loyalty-transactions.json
```

### Push Notification ไม่ทำงาน

1. ตรวจสอบ Browser support:
   - Chrome/Edge: ✅ รองรับ
   - Firefox: ✅ รองรับ
   - Safari: ⚠️ รองรับบางส่วน

2. ตรวจสอบ HTTPS:
   - localhost: ✅ ใช้ได้
   - Production: ต้องเป็น HTTPS

3. ตรวจสอบ Service Worker:
   ```javascript
   // In DevTools Console
   navigator.serviceWorker.getRegistration()
     .then(reg => console.log('SW:', reg))
   ```

4. ตรวจสอบ Permission:
   ```javascript
   // In DevTools Console
   console.log('Notification permission:', Notification.permission)
   ```

### Charts ไม่แสดง

1. ตรวจสอบ Recharts ติดตั้งแล้ว:
   ```bash
   npm list recharts
   ```

2. ตรวจสอบ Console errors

3. ตรวจสอบ data format ถูกต้อง

---

## 📊 Expected Test Results

### ✅ E-Ticket System
- [x] สร้าง E-Ticket ผ่าน API ✅
- [x] ดึงรายการ E-Ticket ✅
- [x] แสดง QR Code และ Barcode ✅
- [x] Mark as Used ✅
- [x] Cancel Ticket ✅
- [x] Admin management page ทำงาน ✅

### ✅ Loyalty Program
- [x] เพิ่มคะแนนผ่าน API ✅
- [x] คำนวณ tier อัตโนมัติ ✅
- [x] Tier upgrade ทำงาน ✅
- [x] Redemption ทำงาน ✅
- [x] Transaction history แสดงถูกต้อง ✅
- [x] Member card สวยงาม ✅

### ✅ Web Push Notifications
- [x] Service Worker ลงทะเบียนสำเร็จ ✅
- [x] Subscribe ทำงาน ✅
- [x] Unsubscribe ทำงาน ✅
- [x] ส่ง notification ได้ ✅
- [x] Click action ทำงาน ✅
- [x] NotificationBell แสดงถูกต้อง ✅

### ✅ Advanced Charts
- [x] Line chart ทำงาน ✅
- [x] Bar chart ทำงาน ✅
- [x] Pie chart ทำงาน ✅
- [x] Area chart ทำงาน ✅
- [x] Tooltip แสดงถูกต้อง ✅
- [x] Responsive design ✅

### ✅ Integration
- [x] E-Ticket สร้างหลังจอง ✅
- [x] Loyalty points เพิ่มหลังชำระเงิน ✅
- [x] Push notification ส่งหลังจอง ✅
- [x] ทุกระบบทำงานร่วมกัน ✅

---

## 🎉 Next Steps

หลังจากทดสอบแล้ว:

1. ✅ แก้ไข bugs (ถ้ามี)
2. ✅ ปรับ UI/UX ให้สวยขึ้น
3. ✅ เพิ่ม error handling
4. ✅ เพิ่ม loading states
5. ✅ เพิ่ม analytics tracking
6. 📝 สร้าง LINE Notification System (ถ้าต้องการ)
7. 🗄️ Migrate จาก JSON ไป Database (ถ้าต้องการ)
8. 🚀 Deploy to Production!

---

**Happy Testing! 🚀**
