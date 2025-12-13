# 💰 Dynamic Pricing System - Complete Guide

## 🎯 Overview

ระบบ **Dynamic Pricing** เป็นระบบปรับราคาห้องพักอัตโนมัติแบบ Real-time ที่ช่วยเพิ่มรายได้และ Occupancy Rate โดยการวิเคราะห์ Demand, วันหยุด, ฤดูกาล, และพฤติกรรมการจอง

### ✨ Features หลัก

| Feature | Description | Status |
|---------|-------------|--------|
| 📈 **Demand-Based Pricing** | ปรับราคาตาม Booking Rate อัตโนมัติ | ✅ Active |
| 🗓️ **Seasonal Pricing** | ราคาตามฤดูกาล (High/Low/Shoulder Season) | ✅ Active |
| 🎉 **Holiday Pricing** | ราคาพิเศษในวันหยุดนักขัตฤกษ์ | ✅ Active |
| 🏖️ **Weekend Surcharge** | เพิ่มราคาวันหยุดสุดสัปดาห์ | ✅ Active |
| ⏰ **Early Bird Discount** | ส่วนลดสำหรับจองล่วงหน้า | ✅ Active |
| ⚡ **Last Minute Deals** | ส่วนลดจองแบบ Last Minute | ✅ Active |
| 👥 **Group Discount** | ส่วนลดตามจำนวนคน | ✅ Active |
| 🎯 **Priority System** | ระบบ Priority 1-10 สำหรับกฎ | ✅ Active |
| 📊 **Real-time Calculation** | คำนวณราคาแบบ Real-time ทุกครั้ง | ✅ Active |

---

## 📁 File Structure

```
types/
  └── dynamic-pricing.ts          # Type definitions ทั้งหมด

data/
  ├── dynamic-pricing-rules.json   # กฎการปรับราคาที่สร้างเอง
  ├── demand-pricing.json          # 5 ระดับ Demand (Very Low ถึง Very High)
  ├── demand-history.json          # ประวัติ Demand สำหรับ Analytics
  └── dynamic-pricing-settings.json # ตั้งค่าระบบ

app/
  ├── admin/
  │   └── dynamic-pricing/
  │       └── page.tsx             # Admin Dashboard
  └── api/
      ├── dynamic-pricing/
      │   └── route.ts             # CRUD Rules API
      ├── demand-pricing/
      │   └── route.ts             # Demand Levels API
      └── calculate-dynamic-price/
          └── route.ts             # Price Calculation Engine
```

---

## 🚀 Quick Start

### 1. เข้า Admin Dashboard

```
URL: /admin/dynamic-pricing
```

คุณจะเห็น:
- **Overview Tab**: สรุประบบและ Quick Actions
- **Pricing Rules Tab**: จัดการกฎทั้งหมด
- **Demand Pricing Tab**: ตั้งค่า Demand Levels (5 ระดับ)
- **Analytics Tab**: วิเคราะห์ผลการดำเนินงาน

### 2. ตั้งค่า Demand Pricing (เริ่มต้น)

ระบบมี 5 ระดับ Demand พร้อมใช้งาน:

| Level | Icon | Multiplier | Booking Rate | สี |
|-------|------|------------|--------------|-----|
| Very Low | 📉 | x0.7 (-30%) | 0-20% | เขียว |
| Low | 📊 | x0.85 (-15%) | 20-40% | น้ำเงิน |
| Medium | 📈 | x1.0 (0%) | 40-60% | ส้ม |
| High | 🔥 | x1.3 (+30%) | 60-80% | แดง |
| Very High | 🚀 | x1.6 (+60%) | 80-100% | แดงเข้ม |

**ตัวอย่าง:**
- ห้องราคา 5,000฿
- Booking Rate = 85% → Very High Demand
- ราคาใหม่ = 5,000 × 1.6 = **8,000฿** (+60%)

---

## 📊 Dynamic Pricing Rules

### Types of Rules

#### 1. 📈 **Demand Rules**
ปรับราคาตาม Booking Rate อัตโนมัติ

```typescript
{
  type: 'demand',
  strategy: 'multiplier',
  value: 1.3, // x1.3 = +30%
  conditions: {
    occupancyRate: { min: 80, max: 100 }
  }
}
```

#### 2. 🗓️ **Seasonal Rules**
ราคาตามฤดูกาล

```typescript
{
  type: 'seasonal',
  startDate: '2025-11-01',
  endDate: '2026-02-28',
  strategy: 'percentage',
  value: 50, // +50%
  name: 'High Season'
}
```

#### 3. 🎉 **Holiday Rules**
วันหยุดพิเศษ (เชื่อมกับ holidays.json)

```typescript
{
  type: 'holiday',
  strategy: 'multiplier',
  value: 2.0, // x2.0 = +100%
  daysOfWeek: ['friday', 'saturday', 'sunday']
}
```

#### 4. ⏰ **Early Bird Discount**
ส่วนลดจองล่วงหน้า

```typescript
{
  type: 'early_bird',
  strategy: 'percentage',
  value: -15, // -15%
  conditions: {
    minAdvanceBooking: 60 // 60 วันล่วงหน้า
  }
}
```

#### 5. ⚡ **Last Minute Discount**
ส่วนลดจองแบบ Last Minute

```typescript
{
  type: 'last_minute',
  strategy: 'percentage',
  value: -20, // -20%
  conditions: {
    maxAdvanceBooking: 3 // จองภายใน 3 วัน
  }
}
```

#### 6. 👥 **Group Discount**
ส่วนลดตามจำนวนคน

```typescript
{
  type: 'group_size',
  strategy: 'percentage',
  value: -10, // -10%
  conditions: {
    minOccupancy: 4 // 4 คนขึ้นไป
  }
}
```

#### 7. 🏖️ **Weekend Surcharge**
เพิ่มราคาวันหยุดสุดสัปดาห์

```typescript
{
  type: 'weekend',
  strategy: 'percentage',
  value: 20, // +20%
  daysOfWeek: ['friday', 'saturday', 'sunday']
}
```

---

## 🔧 API Reference

### 1. Calculate Dynamic Price

**Endpoint:** `POST /api/calculate-dynamic-price`

**Request Body:**
```json
{
  "roomId": 1,
  "checkIn": "2025-12-25",
  "checkOut": "2025-12-28",
  "guests": 2,
  "rooms": 1
}
```

**Response:**
```json
{
  "success": true,
  "basePrice": 5000,
  "finalPrice": 18900,
  "totalNights": 3,
  "breakdown": {
    "basePricePerNight": 5000,
    "subtotal": 15000,
    "appliedRules": [
      {
        "ruleId": "demand-very-high",
        "ruleName": "Very High Demand",
        "type": "demand",
        "adjustment": 4500,
        "percentage": 60,
        "description": "🚀 ความต้องการสูงมาก",
        "color": "#DC2626"
      },
      {
        "ruleId": "holiday-christmas",
        "ruleName": "Christmas Day",
        "type": "holiday",
        "adjustment": 5000,
        "percentage": 100,
        "description": "🎄 Christmas Day",
        "color": "#EF4444"
      },
      {
        "ruleId": "weekend-auto",
        "ruleName": "Weekend Surcharge",
        "type": "weekend",
        "adjustment": 600,
        "percentage": 20,
        "description": "🏖️ ค่าธรรมเนียมวันหยุดสุดสัปดาห์",
        "color": "#F59E0B"
      }
    ],
    "demandAdjustment": 4500,
    "seasonalAdjustment": 5000,
    "weekendAdjustment": 600,
    "occupancyAdjustment": 0,
    "earlyBirdDiscount": 0,
    "lastMinuteDiscount": 0,
    "groupDiscount": 0,
    "promoDiscount": 0,
    "totalAdjustments": 10100,
    "totalDiscounts": 0,
    "taxes": 1750
  }
}
```

### 2. Manage Rules

**GET** `/api/dynamic-pricing`
- Query: `?type=demand&active=true`
- Returns: List of rules

**POST** `/api/dynamic-pricing`
- Body: Rule object
- Returns: Created rule

**PATCH** `/api/dynamic-pricing`
- Body: `{ id, ...updates }`
- Returns: Updated rule

**DELETE** `/api/dynamic-pricing?id=xxx`
- Returns: Success status

### 3. Demand Pricing

**GET** `/api/demand-pricing`
- Returns: All 5 demand levels

**PATCH** `/api/demand-pricing`
- Body: `{ id, multiplier, thresholds, ... }`
- Returns: Updated level

---

## 💡 Calculation Formula

### Step-by-Step Calculation

```
1. Base Price
   ฿5,000 / night × 3 nights = ฿15,000

2. Demand Adjustment (Very High = x1.6)
   ฿5,000 × 0.6 × 3 = +฿9,000

3. Holiday Multiplier (Christmas = x2.0)
   ฿5,000 × 1.0 × 1 = +฿5,000

4. Weekend Surcharge (+20%)
   ฿5,000 × 0.2 × 2 = +฿2,000

5. Subtotal
   ฿15,000 + ฿9,000 + ฿5,000 + ฿2,000 = ฿31,000

6. Apply Discounts
   - Early Bird (-15%): -฿2,250
   - Group Discount (-10%): -฿3,100
   Subtotal after discounts: ฿25,650

7. Add VAT (7%)
   ฿25,650 × 0.07 = +฿1,795

8. Final Price
   ฿27,445
```

---

## 🎯 Priority System

กฎที่มี Priority สูงกว่าจะถูกนำมาใช้ก่อน (1-10, 10 = สูงสุด)

**ตัวอย่าง:**

| Rule | Priority | Action |
|------|----------|--------|
| Flash Sale -50% | 10 | ✅ Applied |
| High Demand +30% | 8 | ✅ Applied |
| Weekend +20% | 6 | ✅ Applied |
| Early Bird -15% | 5 | ✅ Applied |
| Low Season -20% | 3 | ❌ Skipped (Flash Sale ดีกว่า) |

---

## 📈 Real-World Scenarios

### Scenario 1: High Demand + Christmas

```
Room: Pool Villa Deluxe (฿5,000/night)
Dates: Dec 24-27, 2025 (3 nights)
Guests: 2

Calculation:
- Base: ฿15,000
- Demand (High): +฿4,500 (+30%)
- Christmas: +฿5,000 (+100%)
- Weekend (2 nights): +฿2,000 (+20%)
- VAT: +฿1,855
━━━━━━━━━━━━━━━━━━━━━━━━
Final: ฿28,355
```

### Scenario 2: Early Bird + Low Season

```
Room: Pool Villa Standard (฿3,000/night)
Dates: Jun 15-20, 2026 (5 nights)
Guests: 4
Booked: 90 days in advance

Calculation:
- Base: ฿15,000
- Low Season: -฿4,500 (-30%)
- Early Bird (90 days): -฿2,250 (-15%)
- Group Discount (4 ppl): -฿1,500 (-10%)
- VAT: +฿4,725
━━━━━━━━━━━━━━━━━━━━━━━━
Final: ฿11,475
Savings: ฿6,525 (36%)
```

### Scenario 3: Last Minute + Very Low Demand

```
Room: Pool Villa Premium (฿8,000/night)
Dates: Tomorrow-Day After (2 nights)
Guests: 2

Calculation:
- Base: ฿16,000
- Very Low Demand: -฿4,800 (-30%)
- Last Minute: -฿3,200 (-20%)
- VAT: +฿560
━━━━━━━━━━━━━━━━━━━━━━━━
Final: ฿8,560
Savings: ฿9,440 (52%)
```

---

## 🎨 UI/UX Design

### Admin Dashboard

#### Header Section
- **Gradient Background**: Indigo → Purple → Pink
- **Animated Elements**: Pulse effect on stats
- **Glassmorphism Cards**: Frosted glass effect with backdrop blur
- **Stats**: Total Rules, Active Rules, Avg Increase, Revenue Impact

#### Tabs
1. **Overview**: ระบบทำงานอย่างไร + Quick Actions
2. **Pricing Rules**: แสดงและจัดการกฎทั้งหมด
3. **Demand Pricing**: แสดง 5 ระดับ Demand พร้อมแก้ไข
4. **Analytics**: กราฟและสถิติ (Coming Soon)

#### Color Coding

| Type | Colors | Icon |
|------|--------|------|
| Demand | Red gradient | 🔥 |
| Seasonal | Green gradient | 🌸 |
| Holiday | Yellow gradient | 🎉 |
| Weekend | Blue gradient | 🏖️ |
| Early Bird | Yellow | ⏰ |
| Last Minute | Orange | ⚡ |
| Group | Green | 👥 |

---

## 🔗 Integration Guide

### 1. แสดงราคา Real-time ใน RoomCard

```typescript
// components/RoomCard.tsx
const [dynamicPrice, setDynamicPrice] = useState<number | null>(null)

useEffect(() => {
  fetchDynamicPrice()
}, [])

const fetchDynamicPrice = async () => {
  const res = await fetch('/api/calculate-dynamic-price', {
    method: 'POST',
    body: JSON.stringify({
      roomId: room.id,
      checkIn: '2025-12-25',
      checkOut: '2025-12-28',
      guests: 2
    })
  })
  const data = await res.json()
  setDynamicPrice(data.finalPrice)
}
```

### 2. แสดง Price Breakdown ในหน้า Checkout

```typescript
<div className="bg-white rounded-xl p-6 shadow-lg">
  <h3 className="text-xl font-bold mb-4">Price Breakdown</h3>
  
  <div className="space-y-2">
    <div className="flex justify-between">
      <span>Base Price (3 nights)</span>
      <span>฿15,000</span>
    </div>
    
    {appliedRules.map(rule => (
      <div key={rule.ruleId} className="flex justify-between text-sm">
        <span>{rule.description}</span>
        <span className={rule.adjustment > 0 ? 'text-red-600' : 'text-green-600'}>
          {rule.adjustment > 0 ? '+' : ''}฿{Math.abs(rule.adjustment)}
        </span>
      </div>
    ))}
    
    <div className="border-t pt-2 flex justify-between font-bold">
      <span>Total</span>
      <span>฿{finalPrice}</span>
    </div>
  </div>
</div>
```

### 3. Calendar Integration

```typescript
// แสดงราคาแต่ละวันบน Calendar
const getDayPrice = async (date: string) => {
  const res = await fetch('/api/calculate-dynamic-price', {
    method: 'POST',
    body: JSON.stringify({
      roomId: selectedRoom,
      checkIn: date,
      checkOut: nextDay(date),
      guests: 2
    })
  })
  const data = await res.json()
  return data.finalPrice / data.totalNights
}
```

---

## ⚙️ Advanced Settings

### ไฟล์: `dynamic-pricing-settings.json`

```json
{
  "enabled": true,                  // เปิด/ปิดระบบ
  "autoPricingEnabled": true,       // ปรับราคาอัตโนมัติ
  "updateFrequency": 60,            // อัพเดตทุก 60 นาที
  "maxPriceIncrease": 60,           // เพิ่มได้สูงสุด 60%
  "maxPriceDecrease": 40,           // ลดได้สูงสุด 40%
  "minPriceFloor": 1000,            // ราคาต่ำสุดเด็ดขาด
  "demandCalculation": {
    "bookingRateWeight": 0.7,       // น้ำหนัก Booking Rate
    "searchVolumeWeight": 0.3,      // น้ำหนัก Search Volume
    "timeWindowHours": 24           // ช่วงเวลาคำนวณ
  },
  "notifyOnHighDemand": true,       // แจ้งเตือนเมื่อ Demand สูง
  "notifyOnLowDemand": true,        // แจ้งเตือนเมื่อ Demand ต่ำ
  "notifyOnPriceChange": false,     // แจ้งเตือนเมื่อราคาเปลี่ยน
  "enableMLPredictions": false,     // ใช้ ML ทำนาย (Future)
  "enableCompetitorPricing": false, // เปรียบเทียบคู่แข่ง (Future)
  "enableWeatherImpact": false      // ผลกระทบสภาพอากาศ (Future)
}
```

---

## 📱 Mobile Responsive

ระบบรองรับการแสดงผลบนมือถือ:
- **Admin Dashboard**: Grid ปรับเป็น 1 column
- **Price Breakdown**: Stack แนวตั้ง
- **Charts**: ขนาดปรับตามหน้าจอ
- **Touch-friendly**: ปุ่มขนาดใหญ่สำหรับ touch

---

## 🔐 Security

- ✅ **Admin-only**: ต้องล็อกอินเป็น Admin เท่านั้น
- ✅ **API Protection**: ตรวจสอบสิทธิ์ทุก request
- ✅ **Input Validation**: ตรวจสอบข้อมูลทุกครั้ง
- ✅ **Rate Limiting**: จำกัดจำนวน request
- ✅ **Audit Log**: บันทึกการเปลี่ยนแปลงทั้งหมด

---

## 🚀 Performance Optimization

- **Caching**: Cache ราคาที่คำนวณแล้ว 5 นาที
- **Lazy Loading**: โหลด Components ตามต้องการ
- **Debouncing**: ลดจำนวน API calls
- **CDN**: รูปภาพผ่าน CDN
- **Compression**: Compress JSON responses

---

## 📊 Analytics & Reports

### KPIs ที่ติดตาม

1. **Revenue Metrics**
   - Total Revenue
   - Revenue per Available Room (RevPAR)
   - Average Daily Rate (ADR)
   - Revenue Growth %

2. **Occupancy Metrics**
   - Occupancy Rate %
   - Days Booked / Total Days
   - Average Length of Stay

3. **Pricing Metrics**
   - Average Price Increase %
   - Most Profitable Rules
   - Discount Impact
   - Conversion Rate by Price Level

4. **Demand Metrics**
   - Demand Distribution (Very Low to Very High)
   - Peak Demand Periods
   - Low Demand Periods
   - Search-to-Booking Ratio

---

## 🎯 Best Practices

### DO ✅
- ✅ ตั้ง Priority ให้สมเหตุสมผล
- ✅ ใช้ Early Bird เพื่อดึงดูดการจองล่วงหน้า
- ✅ ตั้ง `minPriceFloor` เพื่อป้องกันราคาต่ำเกินไป
- ✅ ทดสอบกฎใหม่ใน Low Season ก่อน
- ✅ Monitor Analytics ทุกสัปดาห์
- ✅ ปรับ Demand Thresholds ตามฤดูกาล

### DON'T ❌
- ❌ อย่าเพิ่มราคาเกิน 100% ในครั้งเดียว
- ❌ อย่าสร้างกฎที่ขัดแย้งกัน
- ❌ อย่าลืมทดสอบก่อน Deploy
- ❌ อย่าตั้งส่วนลดมากกว่า 50%
- ❌ อย่าเปลี่ยนราคาบ่อยเกินไป (สับสน)

---

## 🆘 Troubleshooting

### ปัญหา: ราคาไม่เปลี่ยน
**วิธีแก้:**
1. ตรวจสอบ `enabled: true` ใน settings
2. ตรวจสอบ Priority ของกฎ
3. ตรวจสอบ Date Range
4. Clear cache

### ปัญหา: ราคาสูงเกินไป
**วิธีแก้:**
1. ตรวจสอบ `maxPriceIncrease` ใน settings
2. ลด Priority ของกฎที่เพิ่มราคา
3. ตั้ง `maxPrice` ใน Rule

### ปัญหา: ส่วนลดไม่ทำงาน
**วิธีแก้:**
1. ตรวจสอบ Conditions (minAdvanceBooking, minOccupancy)
2. ตรวจสอบ Priority (ต้องสูงกว่ากฎที่เพิ่มราคา)
3. ตรวจสอบ Room IDs

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Machine Learning Predictions
- [ ] Competitor Price Comparison
- [ ] Weather Impact Analysis
- [ ] A/B Testing Rules
- [ ] Revenue Optimization AI

### Phase 3
- [ ] Mobile App
- [ ] Push Notifications
- [ ] Advanced Analytics Dashboard
- [ ] Custom Reports
- [ ] Multi-property Support

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
- 📧 Email: support@poolvillabooking.com
- 💬 Live Chat: /admin/chat
- 📖 Documentation: /docs/dynamic-pricing

---

**Version:** 1.0  
**Last Updated:** December 10, 2025  
**Status:** ✅ Production Ready
