# 🚀 ระบบใหม่ทั้งหมด - คู่มือฉบับสมบูรณ์

## 📋 สารบัญ

1. [🎫 E-Ticket System](#e-ticket-system)
2. [🎁 Loyalty Program](#loyalty-program)
3. [🔔 Web Push Notifications](#web-push-notifications)
4. [📊 Advanced Charts](#advanced-charts)
5. [🔗 การเชื่อมต่อกับระบบ Booking](#booking-integration)
6. [🎨 UI/UX Enhancements](#ui-ux-enhancements)

---

## 🎫 E-Ticket System

### ✨ คุณสมบัติ

- **PDF Generation**: สร้าง E-Ticket แบบ PDF พร้อม QR Code และ Barcode
- **Multiple Templates**: รองรับ 3 เท็มเพลต (Modern, Classic, Minimal)
- **QR Code**: สแกนเพื่อตรวจสอบความถูกต้อง
- **Barcode**: EAN-13 format สำหรับระบบสแกนอัตโนมัติ
- **HTML Preview**: แสดงตัวอย่างก่อนดาวน์โหลด PDF

### 📁 ไฟล์ที่เกี่ยวข้อง

```
types/ticket.ts                  - TypeScript interfaces
lib/ticketGenerator.ts           - PDF/QR/Barcode generator
app/api/tickets/route.ts         - REST API endpoints
app/admin/tickets/page.tsx       - Admin management page
data/e-tickets.json              - Ticket records
data/ticket-templates.json       - Template configurations
```

### 🔌 API Endpoints

#### GET /api/tickets
ดึงรายการ E-Ticket ทั้งหมด

**Query Parameters:**
- `bookingId`: กรองตาม Booking ID
- `status`: กรองตามสถานะ (active/used/cancelled/expired)
- `guestEmail`: กรองตามอีเมลผู้จอง

**Response:**
```json
{
  "tickets": [
    {
      "id": "TKT-2025-0001",
      "ticketNumber": "TKT-2025-0001-ABCD1234",
      "bookingId": "12345",
      "guestName": "สมชาย ใจดี",
      "status": "active",
      "qrCode": "data:image/png;base64,...",
      "barcode": "data:image/png;base64,..."
    }
  ]
}
```

#### POST /api/tickets
สร้าง E-Ticket ใหม่

**Request Body:**
```json
{
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
}
```

#### PUT /api/tickets
อัปเดตสถานะ E-Ticket

**Request Body:**
```json
{
  "ticketId": "TKT-2025-0001",
  "status": "used"
}
```

### 🎨 Templates

#### 1. Modern Template
- ดีไซน์สมัย มีสีสัน
- Gradient backgrounds
- Large QR code
- Full booking details

#### 2. Classic Template
- ดีไซน์คลาสสิก เรียบง่าย
- Black & white theme
- Barcode focus
- Minimal design

#### 3. Minimal Template
- ดีไซน์มินิมอล
- Compact layout
- Essential info only
- Quick print

### 💡 การใช้งาน

#### สร้าง E-Ticket หลังจองสำเร็จ:

```typescript
const response = await fetch('/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: booking.id,
    guestName: booking.guestName,
    guestEmail: booking.email,
    // ... other fields
  })
})
```

#### ดาวน์โหลด PDF:

```typescript
import { generatePDF } from '@/lib/ticketGenerator'

const pdfBlob = await generatePDF(ticket, template)
const url = URL.createObjectURL(pdfBlob)
window.open(url, '_blank')
```

---

## 🎁 Loyalty Program

### ✨ คุณสมบัติ

- **5 Tier System**: Bronze → Silver → Gold → Platinum → Diamond
- **Points Multipliers**: แต่ละระดับได้รับคะแนนเพิ่ม
- **Automatic Tier Upgrades**: อัพเกรดอัตโนมัติเมื่อถึงคะแนน
- **Redemption Catalog**: แลกคะแนนเป็นส่วนลด/ของรางวัล
- **Transaction History**: ประวัติการสะสมและแลกคะแนน

### 📁 ไฟล์ที่เกี่ยวข้อง

```
types/loyalty.ts                      - TypeScript interfaces
app/api/loyalty/route.ts              - Member & Points API
app/api/loyalty/redeem/route.ts       - Redemption API
app/loyalty/page.tsx                  - User loyalty page
data/loyalty-members.json             - Member records
data/loyalty-tiers.json               - Tier configurations
data/redemption-catalog.json          - Rewards catalog
```

### 🏆 Tier Configuration

| Tier | Min Points | Multiplier | Color | Benefits |
|------|-----------|------------|-------|----------|
| Bronze | 0 | 1.0x | #CD7F32 | สะสมคะแนนพื้นฐาน |
| Silver | 1,000 | 1.2x | #C0C0C0 | คะแนน +20% |
| Gold | 5,000 | 1.5x | #FFD700 | คะแนน +50%, ส่วนลด 5% |
| Platinum | 15,000 | 2.0x | #E5E4E2 | คะแนน 2เท่า, ส่วนลด 10% |
| Diamond | 50,000 | 3.0x | #B9F2FF | คะแนน 3เท่า, ส่วนลด 15% |

### 🔌 API Endpoints

#### GET /api/loyalty
ดึงข้อมูลสมาชิกและคะแนน

**Query Parameters:**
- `userId`: Email/User ID

**Response:**
```json
{
  "member": {
    "userId": "user@example.com",
    "name": "สมชาย ใจดี",
    "currentTier": "gold",
    "totalPoints": 5280,
    "lifetimePoints": 8500,
    "pointsToNextTier": 9720
  },
  "transactions": [...]
}
```

#### POST /api/loyalty
เพิ่มคะแนน

**Request Body:**
```json
{
  "userId": "user@example.com",
  "points": 200,
  "description": "จากการจอง #12345",
  "referenceId": "12345"
}
```

#### POST /api/loyalty/redeem
แลกคะแนน

**Request Body:**
```json
{
  "userId": "user@example.com",
  "itemId": "discount-10",
  "pointsCost": 500
}
```

### 🎁 Redemption Catalog

#### 1. ส่วนลดห้องพัก
- ส่วนลด 10% (500 คะแนน)
- ส่วนลด 15% (800 คะแนน)
- ส่วนลด 20% (1,200 คะแนน)

#### 2. อัพเกรดห้อง
- อัพเกรดฟรี 1 คืน (1,000 คะแนน)
- อัพเกรด Premium (1,500 คะแนน)

#### 3. บริการเสริม
- Late Checkout ฟรี (300 คะแนน)
- Welcome Drink (200 คะแนน)
- Spa Voucher (2,000 คะแนน)

### 💡 การใช้งาน

#### เพิ่มคะแนนหลังชำระเงิน:

```typescript
// Calculate points: 1 point per 100 THB
const points = Math.floor(totalAmount / 100)

await fetch('/api/loyalty', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.email,
    points: points,
    description: `จากการจอง #${bookingId}`,
    referenceId: bookingId
  })
})
```

#### แลกคะแนน:

```typescript
await fetch('/api/loyalty/redeem', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.email,
    itemId: 'discount-10',
    pointsCost: 500
  })
})
```

---

## 🔔 Web Push Notifications

### ✨ คุณสมบัติ

- **Service Worker**: รองรับ offline และ background notifications
- **Push API**: ส่งการแจ้งเตือนแบบ real-time
- **Custom Actions**: ปุ่มกดในการแจ้งเตือน (ดู, ปิด, ฯลฯ)
- **Vibration Pattern**: สั่นในรูปแบบที่กำหนด
- **Click Actions**: เปิดหน้าเว็บเมื่อคลิกที่การแจ้งเตือน
- **PWA Support**: รองรับการติดตั้งเป็น Progressive Web App

### 📁 ไฟล์ที่เกี่ยวข้อง

```
types/push.ts                         - TypeScript interfaces
app/api/push/subscribe/route.ts       - Subscription API
app/api/push/send/route.ts            - Send notification API
components/PushNotificationManager.tsx - Subscription UI
components/NotificationBell.tsx        - Notification dropdown (redesigned)
public/sw.js                          - Service Worker
public/manifest.json                  - PWA manifest
data/push-subscriptions.json          - Subscription records
data/push-notifications.json          - Notification history
```

### 🔌 API Endpoints

#### POST /api/push/subscribe
Subscribe to push notifications

**Request Body:**
```json
{
  "userId": "user@example.com",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "Mozilla/5.0...",
  "deviceType": "desktop"
}
```

#### DELETE /api/push/subscribe
Unsubscribe

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

#### POST /api/push/send
Send notification

**Request Body:**
```json
{
  "userId": "user@example.com",
  "title": "🎉 จองสำเร็จ!",
  "body": "การจองของคุณถูกยืนยันแล้ว",
  "icon": "/icons/icon-192x192.png",
  "badge": "/icons/icon-72x72.png",
  "image": "/images/booking-success.jpg",
  "data": {
    "url": "/bookings/12345",
    "bookingId": "12345"
  },
  "actions": [
    { "action": "view", "title": "ดูรายละเอียด" },
    { "action": "close", "title": "ปิด" }
  ],
  "requireInteraction": true,
  "silent": false
}
```

### 🔧 Service Worker Events

#### Push Event
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    image: data.image,
    data: data.data,
    actions: data.actions,
    vibrate: [200, 100, 200]
  })
})
```

#### Notification Click
```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    clients.openWindow(event.notification.data.url)
  }
})
```

### 💡 การใช้งาน

#### 1. Subscribe to notifications:

```typescript
import PushNotificationManager from '@/components/PushNotificationManager'

// In your component
<PushNotificationManager userId={user.email} />
```

#### 2. Send notification after booking:

```typescript
await fetch('/api/push/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.email,
    title: '🎉 จองสำเร็จ!',
    body: `ห้อง ${roomName} ของคุณถูกยืนยันแล้ว`,
    data: { url: `/bookings/${bookingId}` }
  })
})
```

### 📱 Notification Types

#### 1. Booking Confirmation
- Title: "🎉 จองสำเร็จ!"
- Body: "การจองของคุณถูกยืนยันแล้ว"
- Action: "ดู E-Ticket"

#### 2. Payment Reminder
- Title: "⏰ แจ้งเตือนชำระเงิน"
- Body: "กรุณาชำระเงินภายใน 24 ชั่วโมง"
- Action: "ชำระเงิน"

#### 3. Check-in Reminder
- Title: "🏖️ พร้อมเช็คอินแล้ว!"
- Body: "พบกันวันพรุ่งนี้"
- Action: "ดูรายละเอียด"

#### 4. Promotion Alert
- Title: "🎁 โปรโมชั่นพิเศษ!"
- Body: "ลดราคา 20% สำหรับการจองในวันนี้"
- Action: "จองเลย"

---

## 📊 Advanced Charts

### ✨ คุณสมบัติ

- **4 Chart Types**: Line, Bar, Pie, Area charts
- **Interactive**: Hover tooltips, clickable legends
- **Responsive**: Auto-resize to container
- **Gradient Colors**: Beautiful gradient fills
- **Custom Tooltips**: Detailed information on hover
- **Period Filters**: 7 days, 30 days, 90 days, 1 year

### 📁 ไฟล์ที่เกี่ยวข้อง

```
components/AdvancedCharts.tsx    - Chart components
app/admin/stats/page.tsx         - Stats page with charts
```

### 📈 Chart Types

#### 1. Revenue Chart (Line)
- แสดงรายได้และจำนวนการจองตามวัน
- 2 Lines: รายได้ (บาท) และ จำนวนการจอง
- Gradient fill under lines

#### 2. Room Bookings Chart (Bar)
- แสดงจำนวนการจองแยกตามห้อง
- Gradient bars (Green to Cyan)
- X-axis: Room names
- Y-axis: Booking count

#### 3. Booking Status Chart (Pie)
- แสดงสัดส่วนสถานะการจอง
- 4 Statuses: ยืนยันแล้ว, รอชำระเงิน, เช็คอินแล้ว, ยกเลิก
- Color-coded slices
- Percentage labels

#### 4. Occupancy Rate Chart (Area)
- แสดงอัตราการเข้าพักตามวัน
- Gradient area fill (Orange to Red)
- Y-axis: Percentage (0-100%)
- X-axis: Days of week

### 💡 การใช้งาน

#### Import Component:

```typescript
import AdvancedCharts from '@/components/AdvancedCharts'

// In your page
<AdvancedCharts 
  data={chartData}
  period="30days"
/>
```

#### Data Format:

```typescript
interface ChartData {
  revenueData: Array<{
    date: string
    revenue: number
    bookings: number
  }>
  roomBookings: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  bookingStatus: Array<{
    name: string
    value: number
    color: string
  }>
  occupancyRate: Array<{
    date: string
    rate: number
    capacity: number
  }>
}
```

---

## 🔗 การเชื่อมต่อกับระบบ Booking {#booking-integration}

### 📍 Integration Points

#### 1. หลังจองสำเร็จ (After Booking Success)

**Location:** `app/payment-success/[id]/page.tsx`

**Actions:**
1. ✅ สร้าง E-Ticket
2. ✅ เพิ่มคะแนน Loyalty
3. ✅ ส่ง Push Notification

**Code:**
```typescript
useEffect(() => {
  if (booking) {
    generateETicket()     // สร้าง E-Ticket
    addLoyaltyPoints()    // เพิ่มคะแนน
    sendPushNotification() // ส่งการแจ้งเตือน
  }
}, [booking])
```

#### 2. หลังชำระเงิน (After Payment)

**Flow:**
```
Payment Success
  ↓
Generate E-Ticket (POST /api/tickets)
  ↓
Add Loyalty Points (POST /api/loyalty)
  ↓
Send Push Notification (POST /api/push/send)
  ↓
Show Success Page with Ticket + Points
```

#### 3. การแจ้งเตือนอัตโนมัติ (Automated Notifications)

**Check-in Reminder (24h before):**
```typescript
// Run via cron job
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

bookings
  .filter(b => b.checkIn === tomorrow && b.status === 'confirmed')
  .forEach(booking => {
    sendPushNotification({
      userId: booking.guestEmail,
      title: '🏖️ พร้อมเช็คอินแล้ว!',
      body: `พรุ่งนี้คือวันเช็คอิน ห้อง ${booking.roomName}`
    })
  })
```

**Check-out Reminder (morning of checkout):**
```typescript
// Run via cron job at 08:00
const today = new Date()

bookings
  .filter(b => b.checkOut === today && b.status === 'checked-in')
  .forEach(booking => {
    sendPushNotification({
      userId: booking.guestEmail,
      title: '👋 เช็คเอาท์วันนี้',
      body: 'กรุณาเช็คเอาท์ภายใน 12:00 น.'
    })
  })
```

### 🔄 Data Flow Diagram

```
Booking Created
     ↓
Payment Submitted
     ↓
Payment Confirmed (Admin/Auto)
     ↓
┌────────────────────────────────┐
│  Payment Success Page Loads    │
└────────────────────────────────┘
     ↓
┌─────┴─────┬─────────┬───────────┐
│           │         │           │
↓           ↓         ↓           ↓
E-Ticket   Loyalty   Push      Email
Generated  Points    Notif     (Existing)
           Added     Sent
     ↓           ↓         ↓           ↓
┌────────────────────────────────────┐
│   User sees success with bonuses   │
│   - E-Ticket link                  │
│   - Loyalty points earned          │
│   - Notification sent              │
└────────────────────────────────────┘
```

---

## 🎨 UI/UX Enhancements {#ui-ux-enhancements}

### 1. NotificationBell Component (Redesigned)

**Features:**
- ✨ Modern gradient design
- 🔔 Animated bell icon with pulse effect
- 📱 Responsive dropdown
- 🎨 Priority-based coloring (urgent, high, normal, low)
- 🔵 Unread indicator dots
- 📍 Icon-based notification types
- ⏰ Time ago formatting
- ✅ Mark as read functionality
- 🔗 Click to open notification URL

**Design:**
```
┌─────────────────────────────────────┐
│  🔔 การแจ้งเตือน    [5 ใหม่]  ✕    │ <- Gradient header
│  [✓ อ่านทั้งหมด]                    │
├─────────────────────────────────────┤
│  🎫 ใบจอง E-Ticket พร้อมแล้ว   •   │ <- Unread dot
│     หมายเลข: TKT-2025-0001          │
│     เมื่อ 5 นาทีที่แล้ว             │
├─────────────────────────────────────┤
│  ⭐ คะแนนสะสม +200 คะแนน           │
│     จากการจอง #12345                │
│     เมื่อ 10 นาทีที่แล้ว            │
├─────────────────────────────────────┤
│  📱 ดูทั้งหมด →                     │
└─────────────────────────────────────┘
```

### 2. Payment Success Page

**Enhancements:**
- ✨ Success animation (bouncing checkmark)
- 🎫 E-Ticket card with link
- ⭐ Loyalty points card with earned amount
- 📊 Booking summary
- 📝 Next steps guide
- 🔗 Quick action buttons

**Layout:**
```
        ✓ (animated)
   จองสำเร็จแล้ว!

┌──────────┐  ┌──────────┐
│ 🎫 Ticket│  │ ⭐ Points │
│  พร้อม   │  │ +200 คะ  │
│ [ดู]     │  │ [ดู]     │
└──────────┘  └──────────┘

┌──────────────────────────┐
│  📋 สรุปการจอง           │
│  ห้อง: Deluxe Villa      │
│  Check-in: 1 ก.พ. 2025   │
│  ยอดชำระ: 20,000 บาท     │
└──────────────────────────┘

[🏠 กลับหน้าแรก] [🖨️ พิมพ์]
```

### 3. Loyalty Page

**Design:**
- 🎴 Member card with tier color
- 📊 Progress bar to next tier
- ⭐ Points display (large, prominent)
- 🎁 Redemption catalog with filters
- 📜 Transaction history
- 🏆 Tier benefits list

### 4. Admin Tickets Page

**Features:**
- 📊 Statistics cards (Total, Active, Used, Expired)
- 🔍 Search and filter
- 📱 Responsive table
- 🎨 Status badges (color-coded)
- 👁️ View ticket modal with QR/Barcode
- ✅ Mark as used
- ❌ Cancel ticket

### 5. Advanced Charts Page

**Tabs:**
```
[📈 รายได้] [📊 ห้องพัก] [🥧 สถานะ] [📉 เข้าพัก]

┌─────────────────────────────────────┐
│  📊 Analytics Dashboard             │
│  [📅 30 วัน ▼]                      │
├─────────────────────────────────────┤
│                                     │
│   [Beautiful Interactive Chart]    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 ขั้นตอนการทดสอบ

### 1. E-Ticket System

```bash
# Test ticket generation
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "12345",
    "guestName": "Test User",
    "guestEmail": "test@example.com",
    "roomName": "Deluxe Villa",
    "checkIn": "2025-02-01",
    "checkOut": "2025-02-05",
    "nights": 4,
    "totalAmount": 20000
  }'

# Test ticket retrieval
curl http://localhost:3000/api/tickets?bookingId=12345
```

### 2. Loyalty Program

```bash
# Add points
curl -X POST http://localhost:3000/api/loyalty \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "points": 200,
    "description": "Test points"
  }'

# Get member info
curl http://localhost:3000/api/loyalty?userId=test@example.com

# Redeem points
curl -X POST http://localhost:3000/api/loyalty/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "itemId": "discount-10",
    "pointsCost": 500
  }'
```

### 3. Web Push Notifications

```bash
# Subscribe
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "subscription": {...}
  }'

# Send notification
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

### 4. End-to-End Integration Test

1. สร้างการจองใหม่ → ไปที่ `/checkout/[id]`
2. กรอกข้อมูลการชำระเงิน
3. Submit payment
4. ตรวจสอบ Payment Success Page:
   - ✅ มี E-Ticket card
   - ✅ มี Loyalty Points card
   - ✅ ได้รับ Push Notification
5. คลิก "ดู E-Ticket" → ไปที่ `/admin/tickets`
6. คลิก "ดูคะแนนสะสม" → ไปที่ `/loyalty`
7. ตรวจสอบ Notification Bell → มีการแจ้งเตือนใหม่

---

## 📦 การติดตั้ง Packages

```bash
npm install jspdf qrcode jsbarcode web-push recharts
```

### Package Details

- **jspdf**: สร้าง PDF documents
- **qrcode**: สร้าง QR codes
- **jsbarcode**: สร้าง Barcodes (EAN-13, Code128, etc.)
- **web-push**: ส่ง Web Push Notifications
- **recharts**: สร้าง Beautiful charts

---

## 🔐 Environment Variables

```env
# Web Push (Generate at https://vapidkeys.com/)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:your-email@example.com
```

---

## 🎯 สิ่งที่ยังต้องทำต่อ (Optional)

### 1. LINE Notification System
- ติดตั้ง `@line/bot-sdk`
- สร้าง LINE Bot via LINE Developers Console
- Implement webhook handler
- Create Flex Message templates
- Admin settings page

### 2. Database Migration
- ย้ายจาก JSON files ไป PostgreSQL/MySQL
- ใช้ Prisma ORM
- Set up migrations
- Update API routes

### 3. Real-time Features
- WebSocket for real-time notifications
- Live booking updates
- Real-time chart updates

### 4. Mobile App
- React Native app
- iOS/Android push notifications
- Offline E-Ticket viewing
- Mobile loyalty card

### 5. Analytics & Reporting
- Google Analytics integration
- Custom event tracking
- Revenue forecasting
- Customer segmentation

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:

1. ตรวจสอบ Console Logs
2. ดูที่ Network Tab (DevTools)
3. ตรวจสอบ Data Files ใน `/data` folder
4. Review API Response Status Codes

---

## 🎉 สรุป

ระบบทั้งหมดพร้อมใช้งานแล้ว:

✅ E-Ticket System - สร้าง PDF พร้อม QR/Barcode
✅ Loyalty Program - 5 tiers พร้อม redemption
✅ Web Push Notifications - Real-time alerts
✅ Advanced Charts - Beautiful analytics
✅ Booking Integration - Auto E-Ticket + Points
✅ UI/UX Enhancements - Modern gradient designs

**Happy Coding! 🚀**
