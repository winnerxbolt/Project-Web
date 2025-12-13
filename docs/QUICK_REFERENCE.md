# 🚀 Quick Reference Card - ระบบใหม่ทั้งหมด

## 🎫 E-Ticket API

### สร้าง Ticket
```bash
POST /api/tickets
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

### ดึง Tickets
```bash
GET /api/tickets                        # All tickets
GET /api/tickets?bookingId=12345       # By booking
GET /api/tickets?status=active         # By status
```

### อัปเดตสถานะ
```bash
PUT /api/tickets
{
  "ticketId": "TKT-2025-0001",
  "status": "used"  // active | used | cancelled | expired
}
```

---

## 🎁 Loyalty API

### เพิ่มคะแนน
```bash
POST /api/loyalty
{
  "userId": "user@example.com",
  "points": 200,
  "description": "จากการจอง #12345",
  "referenceId": "12345"
}
```

### ดูข้อมูลสมาชิก
```bash
GET /api/loyalty?userId=user@example.com
```

### แลกคะแนน
```bash
POST /api/loyalty/redeem
{
  "userId": "user@example.com",
  "itemId": "discount-10",
  "pointsCost": 500
}
```

### Tier Requirements
| Tier | Min Points | Multiplier | Color |
|------|-----------|------------|-------|
| Bronze | 0 | 1.0x | #CD7F32 |
| Silver | 1,000 | 1.2x | #C0C0C0 |
| Gold | 5,000 | 1.5x | #FFD700 |
| Platinum | 15,000 | 2.0x | #E5E4E2 |
| Diamond | 50,000 | 3.0x | #B9F2FF |

---

## 🔔 Push Notifications API

### Subscribe
```bash
POST /api/push/subscribe
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

### ส่งการแจ้งเตือน
```bash
POST /api/push/send
{
  "userId": "user@example.com",  // optional, omit to broadcast
  "title": "🎉 จองสำเร็จ!",
  "body": "การจองของคุณถูกยืนยันแล้ว",
  "icon": "/icons/icon-192x192.png",
  "badge": "/icons/icon-72x72.png",
  "data": {
    "url": "/bookings/12345",
    "bookingId": "12345"
  }
}
```

### Unsubscribe
```bash
DELETE /api/push/subscribe
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

---

## 📊 Chart Data Format

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

## 🔗 Integration Code

### หลังการจองสำเร็จ:

```typescript
// 1. สร้าง E-Ticket
const ticketResponse = await fetch('/api/tickets', {
  method: 'POST',
  body: JSON.stringify({
    bookingId: booking.id,
    guestName: booking.guestName,
    // ... other fields
  })
})

// 2. เพิ่มคะแนน Loyalty
const points = Math.floor(booking.total / 100)
await fetch('/api/loyalty', {
  method: 'POST',
  body: JSON.stringify({
    userId: booking.guestEmail,
    points: points,
    description: `จากการจอง #${booking.id}`
  })
})

// 3. ส่ง Push Notification
await fetch('/api/push/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: booking.guestEmail,
    title: '🎉 จองสำเร็จ!',
    body: `ห้อง ${booking.roomName} ของคุณถูกยืนยันแล้ว`
  })
})
```

---

## 🎨 UI Components

### E-Ticket Admin Page
```
/admin/tickets
- Statistics cards (Total, Active, Used, Expired)
- Search & filter
- View ticket modal with QR/Barcode
- Mark as Used / Cancel
```

### Loyalty Page
```
/loyalty
- Member card with tier color
- Progress bar to next tier
- Redemption catalog
- Transaction history
```

### Push Notification Manager
```tsx
import PushNotificationManager from '@/components/PushNotificationManager'

<PushNotificationManager userId={user.email} />
```

### Advanced Charts
```tsx
import AdvancedCharts from '@/components/AdvancedCharts'

<AdvancedCharts data={chartData} period="30days" />
```

### Notification Bell
```tsx
import NotificationBell from '@/components/NotificationBell'

<NotificationBell />  // In Navbar
```

---

## 🌐 Page Routes

| Route | Description |
|-------|-------------|
| `/admin/tickets` | E-Ticket management |
| `/loyalty` | Loyalty program (user) |
| `/payment-success/[id]` | Payment success with integrations |
| `/admin/stats` | Analytics with charts |
| `/` | Home with Push subscription |

---

## 🔐 Environment Variables

```env
# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

Generate keys:
```bash
npx web-push generate-vapid-keys
```

---

## 📁 Data Files

```
data/
├── e-tickets.json               # E-Ticket records
├── ticket-templates.json        # Template configs
├── loyalty-members.json         # Member records
├── loyalty-tiers.json          # Tier configs
├── loyalty-transactions.json   # Transaction history
├── redemption-catalog.json     # Reward items
├── push-subscriptions.json     # Push subscriptions
├── push-notifications.json     # Notification history
├── push-settings.json          # Push settings
└── push-campaigns.json         # Campaign management
```

---

## 🐛 Common Issues

### E-Ticket ไม่แสดง
```bash
# Check API
curl http://localhost:3000/api/tickets

# Check data file
cat data/e-tickets.json
```

### Loyalty Points ไม่เพิ่ม
```bash
# Check member
curl http://localhost:3000/api/loyalty?userId=test@example.com

# Check transaction file
cat data/loyalty-transactions.json
```

### Push ไม่ทำงาน
1. ตรวจสอบ Browser support (Chrome/Edge/Firefox)
2. ต้องเป็น HTTPS หรือ localhost
3. ตรวจสอบ Permission: `Notification.permission`
4. ตรวจสอบ Service Worker ลงทะเบียนแล้ว

### Charts ไม่แสดง
```bash
# Check package
npm list recharts

# Check console errors
# Check data format
```

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install jspdf qrcode jsbarcode web-push recharts

# Run dev server
npm run dev

# Build for production
npm run build

# Start production
npm start

# Check errors
npm run type-check
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## 🎯 Testing URLs

```
Local Development:
http://localhost:3000

Admin Pages:
http://localhost:3000/admin/tickets
http://localhost:3000/admin/stats

User Pages:
http://localhost:3000/loyalty
http://localhost:3000/payment-success/[id]

API Endpoints:
http://localhost:3000/api/tickets
http://localhost:3000/api/loyalty
http://localhost:3000/api/push/send
```

---

## 📞 Support

**Documentation:**
- NEW_SYSTEMS_COMPLETE_GUIDE.md - Full guide
- QUICK_START_TESTING.md - Testing guide
- IMPLEMENTATION_SUMMARY.md - Summary
- README.md - Main README

**Need Help?**
1. Check Console Logs
2. Check Network Tab
3. Check Data Files
4. Read Documentation

---

**Last Updated:** January 2025  
**Version:** 3.0.0  
**Status:** ✅ Ready to Use
