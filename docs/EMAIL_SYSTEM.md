# 📧 Email System Documentation

## Overview

ระบบอีเมลที่ทันสมัยและครบครัน รองรับหลาย provider พร้อม automatic failover, retry mechanism, และ beautiful HTML templates

## ✨ Features

- ✅ **Multi-Provider Support**: SendGrid, Gmail SMTP, AWS SES, Development Mode
- ✅ **Automatic Failover**: เปลี่ยน provider อัตโนมัติเมื่อส่งไม่สำเร็จ
- ✅ **Retry Mechanism**: ลองส่งใหม่ 3 ครั้งก่อนยอมแพ้
- ✅ **Email Queue**: จัดคิวอีเมลสำหรับส่งในภายหลัง
- ✅ **Beautiful Templates**: 5 เทมเพลต HTML สวยงาม responsive
- ✅ **Complete Logging**: บันทึกทุกการส่งอีเมลพร้อม error tracking
- ✅ **Development Mode**: ทดสอบโดยไม่ต้องส่งอีเมลจริง
- ✅ **Admin Dashboard**: หน้าจัดการอีเมลแบบครบวงจร

## 📁 File Structure

```
lib/
├── server/
│   └── emailService.ts           # Email service core
├── email-templates/
    ├── base-template.ts          # HTML wrapper template
    └── index.ts                  # 5 email templates

app/api/email/
├── send/route.ts                 # ส่งอีเมล
├── test/route.ts                 # ทดสอบ provider
├── preview/route.ts              # ดูตัวอย่างเทมเพลต
├── logs/route.ts                 # ดูประวัติการส่ง
└── process-queue/route.ts        # ประมวลผลคิว

app/admin/email/
└── page.tsx                      # Admin dashboard

app/api/cron/
└── send-checkin-reminders/route.ts  # Cron job

data/
├── email-templates.json          # Template metadata
├── email-logs.json              # Email logs
└── email-queue.json             # Email queue

vercel.json                       # Cron job configuration
```

## 🚀 Quick Start

### 1. Environment Variables

```bash
# .env.local

# Email Provider Selection
EMAIL_PROVIDER=development  # development | gmail | sendgrid | ses

# SendGrid (Optional)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# Gmail SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS SES (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx

# Email Configuration
SMTP_FROM=noreply@poolvillapattaya.com
SMTP_FROM_NAME=Poolvilla Pattaya
SMTP_REPLY_TO=info@poolvillapattaya.com

# Cron Secret (for webhook security)
CRON_SECRET=your-random-secret-key
```

### 2. Provider Setup

#### Gmail SMTP (Easiest - Recommended for Testing)

1. ไปที่ Google Account → Security
2. เปิด 2-Step Verification
3. สร้าง App Password: https://myaccount.google.com/apppasswords
4. ใส่ App Password ใน `SMTP_PASSWORD`

```env
EMAIL_PROVIDER=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop
```

#### SendGrid (Best for Production)

1. สมัครที่ https://sendgrid.com (Free 100 emails/day)
2. สร้าง API Key: Settings → API Keys
3. ใส่ API Key ใน `SENDGRID_API_KEY`

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
```

#### Development Mode (No Setup Required)

```env
EMAIL_PROVIDER=development
```

- อีเมลจะแสดงใน console แทนการส่งจริง
- เหมาะสำหรับ local development

### 3. Test Email System

```bash
# Test email provider
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"gmail"}'

# Preview email template
curl http://localhost:3000/api/email/preview?templateId=booking-confirmation

# Send test email
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "Hello World"
  }'
```

## 📧 Email Templates

### 1. Booking Confirmation (`booking-confirmation`)

ส่งทันทีหลังจากสร้าง booking

```typescript
import { sendBookingConfirmation } from '@/lib/server/emailService'

await sendBookingConfirmation({
  id: 123,
  guestName: 'John Doe',
  email: 'john@example.com',
  roomName: 'Luxury Pool Villa',
  checkIn: '2025-01-15',
  checkOut: '2025-01-17',
  guests: 2,
  total: 5000,
})
```

### 2. Payment Receipt (`payment-receipt`)

ส่งหลังชำระเงินสำเร็จ

```typescript
import { sendPaymentReceipt } from '@/lib/server/emailService'

await sendPaymentReceipt(payment, booking)
```

### 3. Check-in Reminder (`checkin-reminder`)

ส่ง 24 ชั่วโมงก่อน check-in (auto via cron job)

```typescript
import { sendCheckInReminder } from '@/lib/server/emailService'

await sendCheckInReminder(booking)
```

### 4. Password Reset (`password-reset`)

ส่งเมื่อผู้ใช้ลืมรหัสผ่าน

```typescript
import { sendPasswordResetEmail } from '@/lib/server/emailService'

await sendPasswordResetEmail('user@example.com', 'reset-token-123', 'https://...')
```

### 5. Welcome Email (`welcome`)

ส่งเมื่อสมัครสมาชิกใหม่

```typescript
import { sendWelcomeEmail } from '@/lib/server/emailService'

await sendWelcomeEmail('John Doe', 'john@example.com')
```

## 🔧 Advanced Usage

### Custom Email with Template

```typescript
import { EmailService } from '@/lib/server/emailService'

const emailService = new EmailService()

await emailService.sendWithTemplate(
  'customer@example.com',
  'booking-confirmation',
  {
    guestName: 'John Doe',
    bookingId: '12345',
    roomName: 'Luxury Villa',
    checkIn: '2025-01-15',
    checkOut: '2025-01-17',
    guests: 2,
    nights: 2,
    total: '5,000',
  }
)
```

### Queue Email for Later

```typescript
import { EmailService } from '@/lib/server/emailService'

const emailService = new EmailService()

// ส่งพรุ่งนี้เวลา 14:00
const sendAt = new Date()
sendAt.setDate(sendAt.getDate() + 1)
sendAt.setHours(14, 0, 0, 0)

await emailService.queueEmail(
  {
    to: 'customer@example.com',
    subject: 'Check-in Reminder',
    html: '<p>Your check-in is tomorrow!</p>',
  },
  sendAt
)
```

### Send with Attachments

```typescript
await emailService.send({
  to: 'customer@example.com',
  subject: 'Your Receipt',
  text: 'Please find your receipt attached',
  attachments: [
    {
      filename: 'receipt.pdf',
      path: '/path/to/receipt.pdf',
    },
  ],
})
```

## 🔄 Automatic Email Flows

### 1. Booking Flow

```
User creates booking
    ↓
📧 Booking Confirmation Email (instant)
    ↓
User pays online
    ↓
💳 Payment Receipt Email (instant)
    ↓
24 hours before check-in
    ↓
⏰ Check-in Reminder Email (cron job)
```

### 2. Password Reset Flow

```
User clicks "Forgot Password"
    ↓
System generates reset token
    ↓
🔒 Password Reset Email (instant)
    ↓
User clicks link and resets password
```

## ⚙️ Cron Jobs

### Check-in Reminder (Daily at 14:00)

```json
{
  "path": "/api/cron/send-checkin-reminders",
  "schedule": "0 14 * * *"
}
```

- ส่งให้ผู้เข้าพักที่จะ check-in พรุ่งนี้
- ตรวจสอบ bookings ที่ status = 'confirmed'
- ส่ง email พร้อมข้อมูล check-in

### Queue Processing (Every 5 minutes)

```json
{
  "path": "/api/email/process-queue",
  "schedule": "*/5 * * * *"
}
```

- ประมวลผลอีเมลที่จัดคิวไว้
- Retry อีเมลที่ส่งล้มเหลว (สูงสุด 3 ครั้ง)
- ลบอีเมลที่ส่งสำเร็จออกจากคิว

## 📊 Admin Dashboard

เข้าถึงได้ที่: `/admin/email`

### Features

1. **Email Stats**
   - Total emails sent
   - Success rate
   - Failed count
   - Queue status

2. **Provider Testing**
   - Test SendGrid connection
   - Test Gmail SMTP connection
   - Test AWS SES connection
   - View test results

3. **Email Logs**
   - View all sent emails
   - Filter by status (sent/failed/queued)
   - See error messages
   - Track attempts

4. **Queue Management**
   - View pending emails
   - Process queue manually
   - See scheduled send times

5. **Template Preview**
   - Preview all templates
   - See sample data
   - Test email rendering

## 🐛 Troubleshooting

### Gmail: "Authentication Failed"

**Problem**: SMTP authentication error

**Solution**:
1. Enable 2-Step Verification
2. Generate App Password (not your Gmail password)
3. Use App Password in `SMTP_PASSWORD`

### SendGrid: "API Key Invalid"

**Problem**: Invalid API key or expired

**Solution**:
1. Check API key in SendGrid dashboard
2. Regenerate if needed
3. Update `.env.local`

### Emails Not Sending

**Problem**: Emails stuck in queue

**Solution**:
1. Check `EMAIL_PROVIDER` in `.env.local`
2. Test provider: `POST /api/email/test`
3. Check logs: `GET /api/email/logs`
4. Process queue: `POST /api/email/process-queue`

### Development Mode Not Working

**Problem**: No console output

**Solution**:
```env
EMAIL_PROVIDER=development
```
Then restart server and check terminal

## 🔐 Security Best Practices

1. **Never commit `.env.local`**
   - Add to `.gitignore`
   - Use environment variables on Vercel

2. **Use App Passwords**
   - Don't use real Gmail password
   - Generate App Password for SMTP

3. **Rotate API Keys**
   - Change SendGrid API key every 90 days
   - Rotate AWS credentials regularly

4. **Protect Cron Endpoints**
   - Set `CRON_SECRET` in environment
   - Verify secret in cron handlers

5. **Rate Limiting**
   - SendGrid Free: 100 emails/day
   - Gmail: 500 emails/day
   - Plan accordingly

## 📈 Production Checklist

- [ ] Configure production email provider (SendGrid recommended)
- [ ] Set up custom domain for email sending
- [ ] Configure SPF, DKIM, DMARC records
- [ ] Set `SMTP_FROM` to your domain
- [ ] Test all email templates
- [ ] Set up email monitoring
- [ ] Configure Vercel Cron jobs
- [ ] Set `CRON_SECRET` for security
- [ ] Test webhook endpoints
- [ ] Monitor email logs daily
- [ ] Set up alerts for failed emails

## 🎨 Customizing Templates

### Edit Template Content

1. Open `lib/email-templates/index.ts`
2. Find template function (e.g., `bookingConfirmationTemplate`)
3. Edit HTML content
4. Save and restart server
5. Preview at `/api/email/preview?templateId=xxx`

### Edit Template Styles

1. Open `lib/email-templates/base-template.ts`
2. Edit CSS in `<style>` tag
3. Test in multiple email clients
4. Consider email client compatibility

### Add New Template

1. Add to `lib/email-templates/index.ts`:
```typescript
export function myNewTemplate(variables: any): string {
  return baseTemplate(
    'My Subject',
    `<div>${variables.content}</div>`
  )
}
```

2. Add to `data/email-templates.json`:
```json
{
  "id": "my-new-template",
  "name": "My New Template",
  "subject": "My Subject",
  "variables": ["content"],
  "category": "custom",
  "enabled": true
}
```

3. Preview at `/api/email/preview?templateId=my-new-template`

## 📞 Support

- **Documentation**: This file
- **Code**: `lib/server/emailService.ts`
- **Admin**: `/admin/email`
- **Logs**: `data/email-logs.json`

---

## ROI Impact: 🔥🔥🔥🔥

- **Customer Satisfaction**: ลูกค้าได้รับข้อมูลทันที
- **Professional Image**: อีเมลสวยงาม เป็นมืออาชีพ
- **Automation**: ประหยัดเวลาส่งอีเมลด้วยตัวเอง
- **Reliability**: Multi-provider failover ป้องกันอีเมลไม่ถึง
- **Tracking**: ดูประวัติการส่งได้ทั้งหมด

**สำเร็จแล้ว! 🎉**
