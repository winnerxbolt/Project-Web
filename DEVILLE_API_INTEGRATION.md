# Deville Central API Integration ✅

## 📋 สรุป

เพิ่มการเชื่อมต่อกับ **Deville Central API** เพื่อดึงข้อมูลบ้านพักมาแสดงในเว็บไซต์

---

## 🔗 API Details

**Endpoint**: `https://deville-central.com/api/houses/accommodations`  
**Method**: GET  
**Authentication**: Bearer Token  
**Token**: `UmV9Hj4PLzWhFDMDjasULWSzsJuUDLYSoiiB2uFtdoBYLEMx0wl1QVIXeR0plVYc`

---

## 📁 ไฟล์ที่สร้าง

### 1. API Route
**Path**: `/app/api/deville/accommodations/route.ts`
- ดึงข้อมูลจาก Deville Central API
- ใช้ Bearer Token สำหรับ authentication
- Return JSON response

### 2. Component
**Path**: `/components/DevilleAccommodations.tsx`
- แสดงรายการบ้านพักจาก Deville
- รองรับ loading state และ error handling
- UI สวยงามด้วย Tailwind CSS
- แสดงข้อมูล: ชื่อ, ที่อยู่, ราคา, จำนวนคน, จำนวนเตียง

### 3. Test Page
**Path**: `/app/deville/page.tsx`
- หน้าทดสอบการแสดงผล
- ดู Raw JSON data
- Copy JSON ไปใช้งานได้

### 4. Integration
**Path**: `/app/page.tsx` (Homepage)
- เพิ่ม DevilleAccommodations component
- แสดงหลังจาก FeaturedRooms

---

## 🚀 วิธีใช้งาน

### 1. ดูในหน้าแรก
```
http://localhost:3000/
```
เลื่อนลงมาจะเห็นส่วน "บ้านพักจาก Deville Central"

### 2. ดูหน้าทดสอบ
```
http://localhost:3000/deville
```
- ดูข้อมูล Raw JSON
- ทดสอบการเชื่อมต่อ API

### 3. เรียกใช้ API โดยตรง
```
http://localhost:3000/api/deville/accommodations
```

---

## 📊 Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "ชื่อบ้าน",
      "description": "รายละเอียด",
      "location": "ที่อยู่",
      "price": 5000,
      "guests": 4,
      "beds": 2,
      "image": "url",
      "available": true
    }
  ],
  "timestamp": "2025-12-12T..."
}
```

---

## 🎨 Features

- ✅ เชื่อมต่อกับ Deville Central API
- ✅ แสดงข้อมูลบ้านพักแบบ real-time
- ✅ UI สวยงามพร้อม responsive design
- ✅ Loading state และ error handling
- ✅ รีเฟรชข้อมูลได้
- ✅ แสดงสถานะว่าง/ไม่ว่าง
- ✅ ปุ่มดูรายละเอียด

---

## 🔐 Security Note

⚠️ **Bearer Token** ถูกเก็บไว้ใน API route (server-side) ไม่ถูก expose ไปที่ client  
✅ ปลอดภัย - Token ไม่แสดงใน browser

---

## 📝 To-Do (Optional)

- [ ] เพิ่มการ filter (ราคา, จำนวนคน)
- [ ] เพิ่มการ search
- [ ] เพิ่มการ sort
- [ ] เพิ่มหน้ารายละเอียดแต่ละบ้าน
- [ ] เพิ่ม pagination
- [ ] Cache ข้อมูลเพื่อลด API calls

---

**Created**: December 12, 2025  
**Status**: ✅ พร้อมใช้งาน
