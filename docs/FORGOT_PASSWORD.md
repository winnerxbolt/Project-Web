# 🔐 ระบบ Forgot Password / Reset Password

ระบบลืมรหัสผ่านที่ปลอดภัยและใช้งานง่าย พร้อมการป้องกันการโจมตีแบบต่างๆ

## 📋 คุณสมบัติ

### ✅ ความปลอดภัย
- ✨ **Token-based Reset**: ใช้ token แบบสุ่ม 64 ตัวอักษร (crypto.randomBytes)
- ⏰ **Token Expiration**: Token หมดอายุภายใน 1 ชั่วโมง
- 🔒 **Single-use Tokens**: Token ใช้ได้เพียงครั้งเดียว
- 🚫 **Email Enumeration Prevention**: ไม่เปิดเผยว่า email มีอยู่ในระบบหรือไม่
- 🛡️ **Rate Limiting**: จำกัดการขอ reset (30 requests/15min)
- ✅ **Password Strength Validation**: ตรวจสอบความแข็งแรงของรหัสผ่าน
- 🧹 **Auto Cleanup**: ลบ tokens ที่หมดอายุอัตโนมัติทุก 1 ชั่วโมง

### 🎨 UX/UI Features
- 📱 **Responsive Design**: ใช้งานได้ดีทุกขนาดหน้าจอ
- 🔍 **Password Strength Indicator**: แสดงความแข็งแรงของรหัสผ่านแบบ real-time
- 👁️ **Toggle Password Visibility**: สลับแสดง/ซ่อนรหัสผ่าน
- ✓ **Password Match Indicator**: แสดงสถานะการตรงกันของรหัสผ่าน
- 💬 **Clear Error Messages**: ข้อความ error ที่ชัดเจนและเป็นมิตร
- ⚡ **Loading States**: แสดงสถานะ loading ขณะประมวลผล
- 🎯 **Auto Redirect**: นำไปหน้า login อัตโนมัติหลังรีเซ็ตสำเร็จ

## 🚀 การใช้งาน

### 1. ผู้ใช้ลืมรหัสผ่าน

1. คลิกลิงก์ "ลืมรหัสผ่าน?" ในหน้า login
2. กรอกอีเมลที่ใช้ลงทะเบียน
3. กดปุ่ม "ส่งลิงก์รีเซ็ตรหัสผ่าน"
4. ระบบจะส่งข้อความยืนยัน (แม้อีเมลจะไม่มีในระบบก็ตาม)

### 2. รับ Reset Link

**Development Mode:**
- ลิงก์จะแสดงบนหน้าจอทันที
- สามารถคลิกเพื่อไปยังหน้ารีเซ็ตรหัสผ่าน

**Production Mode:**
- ลิงก์จะถูกส่งไปยังอีเมล (ต้องตั้งค่า SMTP)
- ตรวจสอบอีเมลภายใน 5-10 นาที

### 3. รีเซ็ตรหัสผ่าน

1. คลิกลิงก์รีเซ็ตจากอีเมล
2. ตั้งรหัสผ่านใหม่ (ต้องผ่านเงื่อนไข)
   - อย่างน้อย 8 ตัวอักษร
   - มีตัวพิมพ์ใหญ่
   - มีตัวพิมพ์เล็ก
   - มีตัวเลข
3. ยืนยันรหัสผ่าน
4. กดปุ่ม "รีเซ็ตรหัสผ่าน"
5. ระบบจะนำไปหน้า login อัตโนมัติ

## 📁 โครงสร้างไฟล์

```
Project-WebWin/
├── lib/server/
│   └── passwordReset.ts          # ฟังก์ชันจัดการ reset tokens
├── app/
│   ├── forgot-password/
│   │   └── page.tsx              # หน้าขอ reset link
│   ├── reset-password/
│   │   └── page.tsx              # หน้าตั้งรหัสผ่านใหม่
│   └── api/
│       ├── auth/
│       │   ├── forgot-password/
│       │   │   └── route.ts      # API ส่ง reset link
│       │   └── reset-password/
│       │       └── route.ts      # API เปลี่ยนรหัสผ่าน
│       └── cron/
│           └── cleanup-reset-tokens/
│               └── route.ts      # Cron job ลบ tokens เก่า
└── data/
    └── password-reset-tokens.json # เก็บ reset tokens
```

## 🔧 API Endpoints

### POST `/api/auth/forgot-password`

ส่งลิงก์รีเซ็ตรหัสผ่าน

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent.",
  "resetLink": "http://localhost:3000/reset-password?token=..." // เฉพาะ dev mode
}
```

**Error Responses:**
- `400`: Invalid email format
- `429`: Too many requests (rate limited)
- `500`: Server error

### POST `/api/auth/reset-password`

เปลี่ยนรหัสผ่านด้วย reset token

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "NewSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Responses:**
- `400`: Invalid token, expired token, หรือรหัสผ่านไม่ผ่านเงื่อนไข
- `404`: User not found
- `429`: Too many requests
- `500`: Server error

### GET `/api/cron/cleanup-reset-tokens`

ลบ reset tokens ที่หมดอายุ (Cron job)

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Expired password reset tokens cleaned up successfully"
}
```

## 🔐 ความปลอดภัย

### Token Management

```typescript
// Token Structure
{
  token: string        // 64 chars hex (crypto.randomBytes(32))
  userId: string       // User ID
  email: string        // User email
  createdAt: string    // ISO timestamp
  expiresAt: string    // ISO timestamp (createdAt + 1 hour)
  used: boolean        // Single-use flag
}
```

### Security Measures

1. **Secure Token Generation**
   ```typescript
   const token = crypto.randomBytes(32).toString('hex')
   // 64 characters, 256 bits of entropy
   ```

2. **Token Expiration**
   - TTL: 1 hour (configurable)
   - Auto cleanup via cron job

3. **Single-use Tokens**
   - Token marked as used after password reset
   - Cannot be reused even before expiration

4. **Email Enumeration Prevention**
   - Same response whether email exists or not
   - Prevents attackers from discovering valid emails

5. **Rate Limiting**
   - 30 requests per 15 minutes per IP
   - Prevents brute force attacks

6. **Password Validation**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, and numbers
   - Optional: Special characters for stronger passwords

## ⚙️ Configuration

### Environment Variables

```env
# Required
CRON_SECRET=your_cron_secret_here

# Optional (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

### Cron Schedule

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-reset-tokens",
      "schedule": "0 * * * *"  // ทุก 1 ชั่วโมง
    }
  ]
}
```

## 📧 Email Integration (TODO)

ปัจจุบันระบบแสดงลิงก์ในหน้าจอ (development mode) แต่ควรส่ง email ใน production:

```typescript
// TODO: Implement in lib/server/email.ts
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
) {
  // ใช้ nodemailer หรือ SendGrid
  const transporter = nodemailer.createTransport({...})
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: '🔐 รีเซ็ตรหัสผ่านของคุณ',
    html: `
      <h2>สวัสดี ${name}</h2>
      <p>คุณได้ขอรีเซ็ตรหัสผ่าน</p>
      <p>คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>
    `
  })
}
```

## 🧪 การทดสอบ

### Manual Testing

1. **Test Forgot Password Flow**
   ```bash
   # 1. ไปที่ http://localhost:3000/login
   # 2. คลิก "ลืมรหัสผ่าน?"
   # 3. กรอก email: admin@poolvilla.com
   # 4. ดูลิงก์รีเซ็ตในหน้าจอ
   ```

2. **Test Reset Password Flow**
   ```bash
   # 1. คลิกลิงก์รีเซ็ต
   # 2. ตั้งรหัสผ่านใหม่: Test123456
   # 3. ยืนยันรหัสผ่าน
   # 4. ควรนำไปหน้า login
   # 5. ทดสอบ login ด้วยรหัสผ่านใหม่
   ```

3. **Test Token Expiration**
   ```bash
   # 1. สร้าง reset token
   # 2. รอ 1 ชั่วโมง (หรือแก้ TOKEN_TTL_MS ใน passwordReset.ts)
   # 3. พยายามใช้ token -> ควรได้ "Invalid or expired token"
   ```

4. **Test Rate Limiting**
   ```bash
   # ส่งคำขอ forgot password 31 ครั้งติดต่อกัน
   # ครั้งที่ 31 ควรได้ 429 Too Many Requests
   ```

## 📊 Monitoring

### Logs to Monitor

```typescript
// Success logs
✅ Password reset successful for user: user@example.com

// Security logs
🔐 PASSWORD RESET REQUEST
User: John Doe
Email: john@example.com
Reset Link: http://...
Token expires in: 1 hour

// Cleanup logs
✅ Cleaned up expired password reset tokens

// Error logs
⚠️ Password reset requested for non-existent email: fake@email.com
```

## 🐛 Troubleshooting

### Token ไม่ทำงาน

1. ตรวจสอบว่า token ยังไม่หมดอายุ (< 1 ชั่วโมง)
2. ตรวจสอบว่า token ยังไม่ถูกใช้ (`used: false`)
3. ตรวจสอบ console logs สำหรับ errors

### ไม่ได้รับ Reset Link

1. **Development Mode**: ลิงก์จะแสดงบนหน้าจอ
2. **Production Mode**: ตรวจสอบ email spam folder
3. ตรวจสอบการตั้งค่า SMTP

### Rate Limited

รอ 15 นาทีหรือ clear rate limit store:
```typescript
// ใน lib/security/rateLimit.ts
// ลบข้อมูล rate limit ของ IP นั้น
```

## 🚀 Deployment Checklist

- [ ] ตั้งค่า `CRON_SECRET` ใน environment variables
- [ ] ตั้งค่า SMTP สำหรับส่ง email
- [ ] ตรวจสอบ cron job ทำงานบน Vercel
- [ ] ทดสอบ forgot password flow
- [ ] ทดสอบ reset password flow
- [ ] ทดสอบ token expiration
- [ ] ตั้งค่า email template ให้สวยงาม
- [ ] เพิ่ม logging สำหรับ monitoring

## 📚 เทคโนโลยีที่ใช้

- **Next.js 16**: App Router + Server Actions
- **TypeScript**: Type safety
- **Node.js crypto**: Secure token generation
- **Rate Limiting**: DDoS protection
- **Tailwind CSS**: Responsive UI
- **React Hooks**: State management

## 🎯 Future Improvements

1. **Email Integration**
   - Implement SMTP email sending
   - Beautiful email templates
   - Multi-language email support

2. **Enhanced Security**
   - CAPTCHA on forgot password
   - 2FA requirement before reset
   - SMS verification option

3. **Better UX**
   - Magic link login (passwordless)
   - Password history (prevent reuse)
   - Security questions

4. **Analytics**
   - Track reset success rate
   - Monitor suspicious patterns
   - Alert on multiple failed attempts

## 📄 License

Same as main project
