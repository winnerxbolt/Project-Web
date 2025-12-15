# Video Reviews Page - คู่มือการใช้งาน

## ✅ สิ่งที่แก้ไขแล้ว

### 1. **API Route** (`/app/api/videos/route.ts`)
- ✅ เพิ่ม PATCH method สำหรับ increment view count
- ✅ รองรับ GET, POST, PUT, PATCH, DELETE operations
- ✅ เชื่อมต่อกับ Supabase database
- ✅ รองรับ legacy fields สำหรับความ compatible

### 2. **Video Reviews Page** (`/app/reviews/videos/page.tsx`)
- ✅ ปรับปรุง UI ให้สวยงามและทันสมัย
- ✅ เพิ่ม Error Handling และ Loading States
- ✅ ปรับปรุง Video Player แบบ hover-to-play
- ✅ เพิ่ม Thumbnail preview ก่อนเล่นวิดีโอ
- ✅ ระบบกรอง Category ที่ดีขึ้น
- ✅ Responsive Design สำหรับทุกขนาดหน้าจอ
- ✅ Animation และ Transitions ที่ลื่นไหล
- ✅ เชื่อมต่อกับ database จริง

### 3. **Database**
- ✅ มี SQL script สำหรับเพิ่ม sample videos
- ✅ รองรับ videos table ใน Supabase

---

## 📋 วิธีใช้งาน

### **ขั้นตอนที่ 1: เพิ่มข้อมูลวิดีโอ**

1. เปิด Supabase Dashboard
2. ไปที่ SQL Editor
3. เปิดไฟล์ `insert-sample-videos.sql`
4. คัดลอกและรัน SQL ใน Supabase SQL Editor
5. ตรวจสอบว่าข้อมูลถูกเพิ่มเรียบร้อย

### **ขั้นตอนที่ 2: ทดสอบหน้าเว็บ**

```bash
# รัน development server
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่:
```
http://localhost:3000/reviews/videos
```

### **ขั้นตอนที่ 3: เพิ่มวิดีโอของคุณเอง**

คุณสามารถเพิ่มวิดีโอผ่าน Supabase หรือสร้าง Admin Panel:

```sql
INSERT INTO videos (video_url, title, description, active) VALUES
(
  'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
  'ชื่อวิดีโอของคุณ',
  'คำอธิบายวิดีโอ',
  true
);
```

---

## 🎨 Features

### **1. Video Display**
- ✅ แสดง thumbnail ก่อนเล่นวิดีโอ
- ✅ เล่นวิดีโอเมื่อ hover (desktop)
- ✅ เปิดใน YouTube ด้วยปุ่ม
- ✅ แสดง duration badge
- ✅ แสดง category badge

### **2. Category Filters**
- ทั้งหมด (All)
- 🏊 Poolvilla
- 🎉 โปรโมชั่น (Promotions)
- 🛏️ Room Tour
- 🎯 สิ่งอำนวยความสะดวก (Amenities)

### **3. Responsive Design**
- 📱 Mobile: 1 column
- 💻 Tablet: 2 columns  
- 🖥️ Desktop: 3 columns

### **4. Animations**
- Smooth hover effects
- Scale transformations
- Fade transitions
- Loading spinners

---

## 🔧 การปรับแต่ง

### **เปลี่ยนสี Theme**
แก้ไขใน `tailwind.config.ts`:
```typescript
colors: {
  'pool-blue': '#0ea5e9',
  'pool-dark': '#0c4a6e',
  // เพิ่มสีของคุณ
}
```

### **เพิ่ม Category ใหม่**
แก้ไขฟังก์ชัน `getCategoryName()` ใน `page.tsx`:
```typescript
const getCategoryName = (category: string) => {
  switch (category) {
    case 'your_category':
      return '🎨 Your Category Name'
    // ...
  }
}
```

### **ปรับจำนวน Videos ต่อแถว**
แก้ไข grid class:
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  {/* 4 columns แทน 3 */}
</div>
```

---

## 📊 Database Schema

```sql
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id INTEGER REFERENCES rooms(id),
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title VARCHAR(255),
    description TEXT,
    duration INTEGER,
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### **ปัญหา: ไม่มีวิดีโอแสดง**
1. ตรวจสอบว่ารัน SQL script แล้ว
2. ตรวจสอบ Supabase connection
3. เช็ค Console ใน Browser (F12)
4. ตรวจสอบว่า `active = true`

### **ปัญหา: YouTube ไม่แสดง**
1. ตรวจสอบ video_url format ถูกต้อง
2. URL ต้องเป็น `https://www.youtube.com/watch?v=...`
3. ตรวจสอบ CORS settings

### **ปัญหา: Thumbnail ไม่แสดง**
- Thumbnail จะ auto-generate จาก YouTube video ID
- ถ้าไม่แสดง ให้เพิ่ม thumbnail_url ด้วยตนเอง

---

## 🚀 Next Steps

1. ✅ หน้า Video Reviews พร้อมใช้งาน
2. 📝 เพิ่ม Admin Panel สำหรับจัดการวิดีโอ
3. 📊 เพิ่ม Analytics และ View Count
4. 🔍 เพิ่มระบบค้นหาวิดีโอ
5. ⭐ เพิ่มระบบ Rating/Like
6. 💬 เพิ่มระบบ Comment

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ Console Log ใน Browser
2. ตรวจสอบ Supabase Logs
3. ดู Network Tab ใน Developer Tools

**สำเร็จแล้วครับ! หน้า Video Reviews พร้อมใช้งาน** 🎉
