# 📧 คู่มือตั้งค่า Gmail SMTP เพื่อส่งอีเมลจริง

## ✅ ระบบพร้อมใช้งานแล้ว!

ระบบส่งอีเมลได้ถูกติดตั้ง **nodemailer** และพร้อมส่งอีเมลจริงแล้ว!

---

## 🔧 วิธีตั้งค่า Gmail SMTP (แนะนำ)

### ขั้นตอนที่ 1: เปิดใช้งาน 2-Step Verification

1. ไปที่ **https://myaccount.google.com/security**
2. ล็อกอินด้วย Google Account ที่ต้องการใช้
3. หา **"2-Step Verification"** และกด **"Get Started"**
4. ทำตามขั้นตอนเพื่อเปิดใช้งาน 2-Step Verification

---

### ขั้นตอนที่ 2: สร้าง App Password

1. กลับไปที่ **https://myaccount.google.com/security**
2. ค้นหา **"App passwords"** (อยู่ใต้ 2-Step Verification)
3. กด **"App passwords"**
4. เลือก:
   - **App:** Mail
   - **Device:** Other (custom name)
   - ใส่ชื่อ: `Pool Villa Pattaya`
5. กด **"Generate"**
6. คัดลอก **16-digit password** ที่ได้ (จะแสดงแค่ครั้งเดียว!)

---

### ขั้นตอนที่ 3: อัพเดตไฟล์ .env.local

เปิดไฟล์ `.env.local` แล้วแก้ไข:

```env
# Email SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 16-digit App Password ที่คัดลอกมา (ไม่ต้องเว้นวรรค)
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Pool Villa Pattaya
```

**ตัวอย่าง:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=wavekung@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
FROM_EMAIL=wavekung@gmail.com
FROM_NAME=Pool Villa Pattaya
```

---

### ขั้นตอนที่ 4: Restart Dev Server

```bash
# กด Ctrl+C เพื่อหยุด server
# จากนั้นรันใหม่
npm run dev
```

---

### ขั้นตอนที่ 5: ทดสอบการส่งอีเมล

#### วิธีที่ 1: ทดสอบผ่าน API
เปิดเบราว์เซอร์ไปที่:
```
http://localhost:3000/api/email/verify
```

ถ้าสำเร็จจะแสดง:
```json
{
  "success": true,
  "message": "SMTP connection verified successfully! ✅"
}
```

#### วิธีที่ 2: ทดสอบผ่าน Admin Panel
1. ไปที่ `/admin/email-marketing`
2. ไปที่แท็บ **Campaigns**
3. เลือก Campaign ที่ต้องการ
4. กดปุ่ม 📧 (Test Email)
5. ใส่อีเมลของคุณ
6. ตรวจสอบกล่องจดหมาย

---

## 🚀 ทดสอบส่งอีเมลจริง

### 1. สร้าง Test Campaign

1. Login Admin → `/admin/email-marketing`
2. กด **"สร้าง Campaign"**
3. กรอก:
   - **Name:** Test Campaign
   - **Subject:** ทดสอบส่งอีเมล
   - **Template:** เลือก template ที่ชอบ
   - **Recipients:** Custom → ใส่อีเมลของคุณ

### 2. ส่ง Test Email

1. กดปุ่ม 📧 ข้างแคมเปญ
2. ใส่อีเมลของคุณ
3. กด OK
4. ตรวจสอบกล่องจดหมาย

### 3. ส่ง Campaign จริง

1. กดปุ่ม ✈️ (ส่ง Campaign)
2. ยืนยันการส่ง
3. ระบบจะส่งอีเมลไปทั้งหมด

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid login"
- ตรวจสอบว่าใช้ **App Password** (16 ตัวอักษร) ไม่ใช่ password ปกติ
- ตรวจสอบว่าเปิด 2-Step Verification แล้ว

### ❌ Error: "Connection timeout"
- ตรวจสอบ SMTP_PORT=587
- ตรวจสอบ SMTP_SECURE=false

### ❌ Error: "Authentication failed"
- คัดลอก App Password ใหม่
- ลบช่องว่างออกจาก App Password
- ตรวจสอบว่าอีเมลถูกต้อง

### ❌ อีเมลเข้า Spam
- เพิ่ม SPF record: `v=spf1 include:_spf.google.com ~all`
- ใช้อีเมลที่มี domain ของตัวเอง (แทน @gmail.com)
- หลีกเลี่ยงคำที่มักเข้า spam (FREE, WIN, CLICK HERE)

---

## 📊 Gmail Sending Limits

### Free Gmail Account:
- **500 อีเมล/วัน**
- 100 recipients per email

### Google Workspace (G Suite):
- **2,000 อีเมล/วัน**
- 2,000 recipients per email

**หมายเหตุ:** ถ้าส่งเกิน limit จะถูกบล็อก 24 ชั่วโมง

---

## 🌟 ทางเลือกอื่นสำหรับ Production

### 1. SendGrid (แนะนำ)
- **Free:** 100 emails/day
- **Paid:** เริ่มต้น $14.95/เดือน (40,000 emails)
- เว็บไซต์: https://sendgrid.com/

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### 2. AWS SES
- **Free tier:** 62,000 emails/เดือน (ใช้กับ EC2)
- **Paid:** $0.10 per 1,000 emails
- เว็บไซต์: https://aws.amazon.com/ses/

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key
SMTP_PASSWORD=your-aws-secret-key
```

### 3. Mailgun
- **Free:** 100 emails/day (ต้อง verify card)
- **Paid:** เริ่มต้น $35/เดือน (50,000 emails)
- เว็บไซต์: https://www.mailgun.com/

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASSWORD=your-mailgun-password
```

---

## ✅ สรุป

1. ✅ **nodemailer ติดตั้งแล้ว**
2. ✅ **Email Service สร้างแล้ว**
3. ✅ **API Routes อัพเดตแล้ว**
4. ✅ **Verify endpoint พร้อมใช้งาน**

**ขั้นตอนต่อไป:**
1. ตั้งค่า Gmail App Password
2. อัพเดต .env.local
3. Restart server
4. ทดสอบส่งอีเมล

---

## 📞 ติดปัญหา?

ถ้ามีปัญหาตรงไหน บอกได้เลยครับ! 😊

**ไฟล์สำคัญ:**
- `.env.local` - SMTP Configuration
- `lib/server/emailService.ts` - Email Service
- `app/api/email/send/route.ts` - Send Email API
- `app/api/email/verify/route.ts` - Verify SMTP API
