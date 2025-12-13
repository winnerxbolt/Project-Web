# 👨‍👩‍👧‍👦 Group Booking System - Complete Guide
## ระบบจองหมู่คณะครบวงจร

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Features](#features)
3. [Customer Journey](#customer-journey)
4. [Admin Management](#admin-management)
5. [API Endpoints](#api-endpoints)
6. [Data Structure](#data-structure)
7. [Discount System](#discount-system)
8. [Corporate Clients](#corporate-clients)

---

## 🎯 System Overview

ระบบ Group Booking เป็นระบบจองหมู่คณะที่ครบครันสำหรับการจอง 3 ห้องขึ้นไป พร้อมระบบส่วนลดอัตโนมัติ การจัดการลูกค้าองค์กร และใบเสนอราคาแบบมืออาชีพ

### Key Features
- ✅ จองหลายห้องพร้อมกัน (3+ rooms)
- ✅ ส่วนลดแบบเทียร์อัตโนมัติ (10% - 25%)
- ✅ ระบบใบเสนอราคา (Quote System)
- ✅ จัดการลูกค้าองค์กร (Corporate Clients)
- ✅ ระบบผ่อนชำระ (Installment)
- ✅ Multi-currency รองรับ 5 ภาษา
- ✅ รายงานและสถิติแบบ Real-time

---

## 🌟 Features

### 1. Multiple Room Booking
- จองหลายห้องในคราวเดียว
- เลือกจำนวนผู้เข้าพักแต่ละห้อง
- ระบุความต้องการพิเศษ (adjacent rooms, floor preference, etc.)

### 2. Automatic Group Discount
**Discount Tiers:**
- 3-5 rooms: **10% discount** 🎁
- 6-10 rooms: **15% discount** 🎁
- 11-20 rooms: **20% discount** 🎁
- 21+ rooms: **25% discount** 🎁

### 3. Quote System
- สร้างใบเสนอราคาอัตโนมัติ
- แนบ PDF พร้อมรายละเอียดครบถ้วน
- กำหนดวันหมดอายุของ quote
- Custom message สำหรับแต่ละกรุ๊ป

### 4. Corporate Client Management
- จัดเก็บข้อมูลบริษัท
- ข้อมูลผู้ติดต่อหลายคน
- สัญญาพิเศษ (special rates, credit terms)
- ประวัติการจองทั้งหมด
- Invoice management

### 5. Flexible Payment Options
- **Full Payment**: ชำระเต็มจำนวน
- **Deposit + Balance**: มัดจำ 30% + ชำระก่อนเข้าพัก
- **Installment**: ผ่อนชำระหลายงวด

### 6. Group Types
- 👨‍👩‍👧‍👦 **Family**: ครอบครัว
- 💼 **Corporate**: องค์กร/บริษัท
- 💒 **Wedding**: งานแต่งงาน
- 🎉 **Friends**: เพื่อนฝูง
- 🎓 **Educational**: สถาบันการศึกษา
- 👥 **Other**: อื่นๆ

---

## 🚀 Customer Journey

### Step 1: Group Information
1. เลือกประเภทกรุ๊ป (Family, Corporate, Wedding, etc.)
2. กรอกชื่อกรุ๊ป
3. ระบุจำนวนห้องและผู้เข้าพัก (ประมาณการ)
4. ความต้องการพิเศษ (optional)

### Step 2: Contact Information
1. ชื่อผู้ติดต่อ
2. อีเมล
3. เบอร์โทรศัพท์
4. ข้อมูลบริษัท (สำหรับ Corporate)

### Step 3: Select Dates
1. วันเช็คอิน / เช็คเอาท์
2. ตัวเลือกวันยืดหยุ่น (±3 days)
3. แสดงส่วนลดที่จะได้รับ

### Step 4: Room Selection
1. เลือกห้องแต่ละแบบ
2. ระบุจำนวนห้องต่อแบบ
3. ดูราคารวมและส่วนลด Real-time

### Step 5: Review and Submit
1. ตรวจสอบข้อมูลทั้งหมด
2. ยืนยันส่งคำขอจอง
3. รับอีเมลยืนยันทันที

---

## 🎛️ Admin Management

### Dashboard Overview
Path: `/admin/group-bookings`

**4 Main Tabs:**
1. **Group Bookings**: จัดการคำขอจองทั้งหมด
2. **Discount Settings**: ตั้งค่าส่วนลดและเงื่อนไข
3. **Corporate Clients**: จัดการลูกค้าองค์กร
4. **Statistics**: รายงานและสถิติ

### Group Bookings Tab

**Filter Options:**
- All Status
- Pending (รอดำเนินการ)
- Quoted (ส่งใบเสนอราคาแล้ว)
- Confirmed (ยืนยันแล้ว)
- Cancelled (ยกเลิก)
- Completed (เสร็จสิ้น)

**Quick Actions:**
- 👁️ **View Details**: ดูรายละเอียดเต็ม
- 📄 **Send Quote**: ส่งใบเสนอราคา
- ✅ **Confirm**: ยืนยันการจอง
- ❌ **Cancel**: ยกเลิกการจอง
- 🗑️ **Delete**: ลบคำขอ

### Booking Detail Page
Path: `/admin/group-bookings/[id]`

**Sections:**
1. **Group Details**: ข้อมูลกรุ๊ป
2. **Contact Information**: ข้อมูลผู้ติดต่อ
3. **Room Selection**: รายการห้องที่เลือก
4. **Pricing Summary**: สรุปราคา
5. **Internal Notes**: บันทึกภายใน (ไม่แสดงให้ลูกค้า)
6. **Timeline**: ประวัติการดำเนินการ

### Discount Settings

**Configurable Options:**
- Tier levels (จำนวนห้อง → % ส่วนลด)
- Minimum nights requirement
- Valid group types
- Seasonal multiplier
- Weekday/Weekend only
- Additional benefits (free breakfast, late checkout, etc.)
- Auto-approval threshold
- Notification emails

### Corporate Clients

**Client Information:**
- Company name & Tax ID
- Industry
- Primary & Alternative contacts
- Billing address
- Contract details (special rates, credit terms, minimum rooms)
- Booking history & statistics
- Preferences & special requests

---

## 🔌 API Endpoints

### 1. Group Bookings

#### GET `/api/group-bookings`
Get all group bookings with optional filters

**Query Parameters:**
- `status`: pending | quoted | confirmed | cancelled | completed
- `type`: family | corporate | wedding | friends | educational | other

**Response:**
```json
[
  {
    "id": "GB1234567890",
    "status": "pending",
    "groupDetails": { ... },
    "contactPerson": { ... },
    "dates": { ... },
    "rooms": [ ... ],
    "pricing": { ... }
  }
]
```

#### POST `/api/group-bookings`
Create new group booking request

**Request Body:**
```json
{
  "contactPerson": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+66812345678"
  },
  "groupDetails": {
    "type": "family",
    "groupName": "Smith Family Reunion",
    "numberOfRooms": 5,
    "totalGuests": 12
  },
  "dates": {
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "nights": 5
  },
  "rooms": [ ... ],
  "pricing": { ... }
}
```

#### PUT `/api/group-bookings`
Update existing booking

#### DELETE `/api/group-bookings?id={id}`
Delete booking

### 2. Calculate Price

#### POST `/api/group-bookings/calculate-price`
Calculate total price with group discount

**Request Body:**
```json
{
  "rooms": [
    { "roomId": "1", "quantity": 3 }
  ],
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "groupType": "family",
  "numberOfRooms": 3
}
```

**Response:**
```json
{
  "subtotal": 45000,
  "groupDiscountPercentage": 10,
  "groupDiscountAmount": 4500,
  "taxAmount": 2835,
  "totalAmount": 43335,
  "depositRequired": 13000,
  "nights": 5,
  "roomDetails": [ ... ],
  "currency": "THB"
}
```

### 3. Discount Settings

#### GET `/api/group-bookings/discount-settings`
Get all discount settings

#### POST `/api/group-bookings/discount-settings`
Create new discount setting

#### PUT `/api/group-bookings/discount-settings`
Update discount setting

#### DELETE `/api/group-bookings/discount-settings?id={id}`
Delete discount setting

### 4. Corporate Clients

#### GET `/api/corporate-clients`
Get all corporate clients

**Query Parameters:**
- `status`: active | inactive | suspended

#### POST `/api/corporate-clients`
Create new corporate client

#### PUT `/api/corporate-clients`
Update corporate client

#### DELETE `/api/corporate-clients?id={id}`
Delete corporate client

---

## 📊 Data Structure

### GroupBookingRequest
```typescript
interface GroupBookingRequest {
  id: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'quoted' | 'confirmed' | 'cancelled' | 'completed'
  
  contactPerson: {
    name: string
    email: string
    phone: string
    company?: string
    position?: string
  }
  
  groupDetails: {
    type: GroupType
    groupName: string
    numberOfRooms: number
    totalGuests: number
    adultsPerRoom: number[]
    childrenPerRoom: number[]
    specialRequests?: string
  }
  
  dates: {
    checkIn: string
    checkOut: string
    nights: number
    flexibleDates: boolean
  }
  
  rooms: GroupBookingRoom[]
  
  pricing: {
    subtotal: number
    groupDiscount: number
    groupDiscountPercentage: number
    taxAmount: number
    totalAmount: number
    depositRequired: number
    currency: string
  }
}
```

---

## 💰 Discount System

### How It Works

1. **Automatic Calculation**: ส่วนลดคำนวณอัตโนมัติตามจำนวนห้อง
2. **Tiered Discounts**: ยิ่งจองเยอะ ส่วนลดยิ่งมาก
3. **Configurable**: Admin ปรับเปลี่ยนเทียร์และเปอร์เซ็นต์ได้
4. **Conditional**: ตั้งเงื่อนไข (min nights, group types, seasons)

### Example Calculation

**Booking:**
- 8 rooms × 5 nights
- Base price: 3,000 THB/night/room
- Subtotal: 8 × 5 × 3,000 = 120,000 THB

**Discount (8 rooms = 15%):**
- Discount: 120,000 × 15% = 18,000 THB
- After discount: 102,000 THB

**Tax (7%):**
- Tax: 102,000 × 7% = 7,140 THB

**Total: 109,140 THB**
**Deposit (30%): 32,742 THB**

---

## 🏢 Corporate Clients

### Benefits
- Special contracted rates
- Credit payment terms
- Priority booking
- Dedicated account manager
- Flexible cancellation
- Volume-based discounts

### Contract Features
- Minimum rooms per year commitment
- Fixed discount percentage
- Credit terms (Net 30, Net 60, etc.)
- Special amenities included
- Preferred room types
- Custom invoicing

---

## 📈 Statistics & Reports

### Available Metrics
- Total requests vs confirmed bookings
- Conversion rate (pending → confirmed)
- Total revenue from group bookings
- Average group size
- Average rooms per booking
- Average discount given
- Top group types by count & revenue
- Monthly/Quarterly/Yearly trends

### Export Options
- PDF reports
- Excel spreadsheets
- CSV data export
- Custom date ranges

---

## 🎨 UX/UI Design Philosophy

### Color Scheme
- **Primary**: Indigo-Purple gradient (trust & luxury)
- **Success**: Green (confirmed bookings)
- **Warning**: Yellow (pending actions)
- **Danger**: Red (cancellations)
- **Info**: Blue (quotes & information)

### Design Elements
- 🎯 **Gradient backgrounds**: Modern & eye-catching
- 🌈 **Color-coded status**: Easy recognition
- 💫 **Smooth animations**: Professional feel
- 📱 **Fully responsive**: Works on all devices
- ♿ **Accessible**: WCAG compliant

### Icons & Emojis
- 👨‍👩‍👧‍👦 Family groups
- 💼 Corporate clients
- 💒 Weddings
- 🎉 Social events
- 🎓 Educational groups
- 💰 Pricing & discounts
- 📊 Statistics & reports

---

## 🔐 Security & Privacy

### Data Protection
- All booking data encrypted
- Secure API endpoints
- GDPR compliant
- PCI DSS ready for payments
- Internal notes hidden from customers

### Access Control
- Admin-only dashboard access
- Role-based permissions
- Audit trail for all actions
- Secure file uploads

---

## 🚀 Future Enhancements

### Planned Features
1. **Automated Quote PDF Generation**
2. **Email Template System**
3. **SMS Notifications**
4. **Contract Management**
5. **Payment Gateway Integration**
6. **Advanced Analytics Dashboard**
7. **Mobile App**
8. **WhatsApp Integration**
9. **Virtual Tour Integration**
10. **Loyalty Program for Corporate Clients**

---

## 📞 Support

For technical support or questions:
- **Email**: support@poolvilla.com
- **Phone**: 038-123-456
- **Admin Dashboard**: Contact system administrator

---

## 📝 Changelog

### Version 1.0.0 (December 2025)
- ✅ Initial release
- ✅ Group booking request system
- ✅ Automatic discount calculation
- ✅ Admin management dashboard
- ✅ Corporate client management
- ✅ Multi-language support (5 languages)
- ✅ Statistics & reporting
- ✅ Mobile responsive design

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
