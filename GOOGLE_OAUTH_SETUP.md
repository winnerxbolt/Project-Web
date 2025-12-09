# 🔐 คู่มือสร้าง Google OAuth Client ID (5 นาที)

## ขั้นตอนที่ 1: เข้า Google Cloud Console

1. ไปที่: **https://console.cloud.google.com/**
2. Login ด้วย Google Account ของคุณ
3. ถ้ายังไม่มี Project ให้กด **"Select a project"** → **"NEW PROJECT"**
   - Project name: `WebWin Hotel` (หรือชื่ออะไรก็ได้)
   - กด **Create**

---

## ขั้นตอนที่ 2: เปิดใช้งาน Google+ API

1. ในเมนูด้านซ้าย เลือก **"APIs & Services"** → **"Library"**
2. ค้นหา **"Google+ API"**
3. กดเลือก แล้วกด **"ENABLE"**

---

## ขั้นตอนที่ 3: กำหนดค่า OAuth Consent Screen

1. ไปที่ **"APIs & Services"** → **"OAuth consent screen"**
2. เลือก **"External"** → กด **Create**
3. กรอกข้อมูล:
   - **App name:** `WebWin Hotel`
   - **User support email:** อีเมลของคุณ
   - **Developer contact information:** อีเมลของคุณ
4. กด **"Save and Continue"** ทุกหน้าจนเสร็จ

---

## ขั้นตอนที่ 4: สร้าง OAuth 2.0 Client ID

1. ไปที่ **"APIs & Services"** → **"Credentials"**
2. กด **"+ CREATE CREDENTIALS"** → เลือก **"OAuth client ID"**
3. เลือก **Application type:** `Web application`
4. กรอกข้อมูล:

### ตั้งชื่อ:
```
WebWin Hotel - OAuth Client
```

### Authorized JavaScript origins (เพิ่มทั้งหมดนี้):
```
http://localhost:3000
https://localhost:3000
http://127.0.0.1:3000
https://your-domain.com
https://www.your-domain.com
```

### Authorized redirect URIs (เพิ่มทั้งหมดนี้):
```
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/api/auth/callback/google
https://localhost:3000
https://localhost:3000/login
https://localhost:3000/register
https://your-domain.com/login
https://your-domain.com/register
https://your-domain.com/api/auth/callback/google
```

5. กด **"CREATE"**

---

## ขั้นตอนที่ 5: คัดลอก Client ID และ Secret

หลังจากสร้างเสร็จ จะมี Popup ขึ้นมา:

1. **คัดลอก Client ID** (จะยาวประมาณ 72 ตัวอักษร)
   - ตัวอย่าง: `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

2. **คัดลอก Client Secret** (จะยาวประมาณ 24-35 ตัวอักษร)
   - ตัวอย่าง: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz`

---

## ขั้นตอนที่ 6: อัพเดตไฟล์ .env.local

เปิดไฟล์ `.env.local` แล้ววาง Client ID และ Secret ที่คัดลอกมา:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# Facebook App Configuration  
NEXT_PUBLIC_FACEBOOK_APP_ID=1591848798840804
FACEBOOK_APP_SECRET=e08f67b1cffe219e2e72aa051e094820
```

---

## ขั้นตอนที่ 7: Restart Dev Server

1. กด `Ctrl+C` ใน Terminal เพื่อหยุด server
2. รันคำสั่ง:
   ```bash
   npm run dev
   ```
3. เปิดเบราว์เซอร์ที่ `http://localhost:3000/login`
4. กดปุ่ม **"ดำเนินการต่อด้วย Google"**

---

## 🎉 เสร็จสิ้น!

Google Login ควรใช้งานได้แล้ว!

### 🔍 แก้ปัญหาเพิ่มเติม

**ถ้ายังขึ้น Error "origin not allowed":**
1. รอ 2-5 นาที (Google ต้องใช้เวลาอัพเดต)
2. ลองใช้ Incognito mode
3. Clear browser cache
4. ตรวจสอบว่า Authorized JavaScript origins มี `http://localhost:3000` แล้ว

**ถ้ายังใช้ไม่ได้:**
1. ตรวจสอบว่า copy Client ID ถูกต้อง (ไม่มีช่องว่างหน้าหลัง)
2. ตรวจสอบว่า restart dev server แล้ว
3. ดูใน Browser Console (F12) มี error อะไรอีกไหม

---

## 📞 ติดต่อสอบถาม

ถ้ามีปัญหาตรงไหน ส่ง screenshot หน้าจอมาได้เลยครับ!
