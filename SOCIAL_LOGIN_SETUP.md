# Social Media Integration - Setup Guide

## 🔐 Google OAuth Setup

### 1. สร้าง Google Cloud Project
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มีอยู่
3. เปิดใช้งาน **Google+ API**

### 2. สร้าง OAuth 2.0 Credentials
1. ไปที่ **APIs & Services** → **Credentials**
2. คลิก **Create Credentials** → **OAuth client ID**
3. เลือก **Application type: Web application**
4. ตั้งค่า:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (สำหรับ development)
     - `https://yourdomain.com` (สำหรับ production)
   
   - **Authorized redirect URIs:**
     - `http://localhost:3000` (สำหรับ development)
     - `https://yourdomain.com` (สำหรับ production)

5. คัดลอก **Client ID** และ **Client Secret**

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 📘 Facebook Login Setup

### 1. สร้าง Facebook App
1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. คลิก **My Apps** → **Create App**
3. เลือก **Consumer** use case
4. ตั้งชื่อแอพและเลือก App Contact Email

### 2. เพิ่ม Facebook Login
1. ในแดชบอร์ดของแอพ เลือก **Add Product**
2. เลือก **Facebook Login** → **Set Up**
3. เลือก **Web** platform

### 3. ตั้งค่า OAuth Redirect URIs
1. ไปที่ **Facebook Login** → **Settings**
2. เพิ่ม **Valid OAuth Redirect URIs:**
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
3. เซฟการตั้งค่า

### 4. ตั้งค่า App Domains
1. ไปที่ **Settings** → **Basic**
2. เพิ่ม **App Domains:**
   - `localhost` (development)
   - `yourdomain.com` (production)

### 5. เปลี่ยนโหมดเป็น Live
1. ที่ด้านบนสุดของแดชบอร์ด เปลี่ยนจาก **Development** เป็น **Live**
2. ต้องกรอกข้อมูล Privacy Policy และ Terms of Service URL

### 6. ตั้งค่า Environment Variables
เพิ่มใน `.env.local`:
```env
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

---

## 📝 การใช้งาน

### ไฟล์ที่เกี่ยวข้อง:
- `components/SocialLogin.tsx` - UI component สำหรับปุ่ม social login
- `app/api/auth/social-login/route.ts` - API endpoint สำหรับจัดการ social authentication
- `contexts/AuthContext.tsx` - Authentication context with `loginWithUser()` method

### Features:
- ✅ **Google One Tap** - Auto-prompt for easy login
- ✅ **Facebook Login Dialog** - Standard Facebook OAuth flow
- ✅ **Automatic Account Creation** - สร้าง user account อัตโนมัติ
- ✅ **Account Merging** - Merge accounts ถ้า email ซ้ำ
- ✅ **Profile Pictures** - ดึงรูปโปรไฟล์จาก social accounts
- ✅ **Error Handling** - แสดง error messages แบบ user-friendly

### การทดสอบ:
1. รัน `npm run dev`
2. ไปที่หน้า Login/Register
3. คลิกปุ่ม "ดำเนินการต่อด้วย Google" หรือ "ดำเนินการต่อด้วย Facebook"
4. ยืนยันตัวตนใน popup window
5. ระบบจะ redirect กลับมาพร้อม login สำเร็จ

---

## 🔒 Security Notes

### สำคัญ:
1. ❗ **ห้าม commit `.env.local`** ลง git
2. ✅ ใช้ `NEXT_PUBLIC_` prefix เฉพาะค่าที่ปลอดภัยสำหรับ client-side
3. ✅ เก็บ secrets (Client Secret, App Secret) ไว้ใน environment variables ฝั่ง server เท่านั้น
4. ✅ Enable HTTPS ใน production
5. ✅ ตรวจสอบ redirect URIs ให้ถูกต้อง

### Production Checklist:
- [ ] Update authorized domains ใน Google Console
- [ ] Update app domains ใน Facebook Settings
- [ ] เปลี่ยน Facebook app เป็น Live mode
- [ ] ตั้งค่า environment variables ใน hosting platform
- [ ] ทดสอบ social login บน production URL
- [ ] เพิ่ม Privacy Policy และ Terms of Service URLs

---

## 🐛 Troubleshooting

### Google Login Issues:
- **"Invalid client ID"** → ตรวจสอบ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` ใน .env.local
- **"Unauthorized origin"** → เพิ่ม URL ใน Authorized JavaScript origins
- **"Redirect URI mismatch"** → เพิ่ม URL ใน Authorized redirect URIs

### Facebook Login Issues:
- **"App Not Setup"** → ตรวจสอบว่า Facebook Login ถูกเพิ่มใน Products แล้ว
- **"URL Blocked"** → เพิ่ม domain ใน Valid OAuth Redirect URIs
- **"Can't Load URL"** → ตรวจสอบ App Domains ใน Basic Settings
- **Development mode** → เปลี่ยนเป็น Live mode หลังตั้งค่าเสร็จ

### General Issues:
- Clear browser cache และ cookies
- ตรวจสอบ console errors ใน browser DevTools
- ตรวจสอบว่า SDK scripts โหลดสำเร็จ
- ลอง incognito/private mode

---

## 📚 Additional Resources

- [Google Identity Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
