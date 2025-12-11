# 🚀 Quick Start: Online Payment Gateway

## การติดตั้งแบบด่วน (5 นาที)

### 1. ติดตั้ง Dependencies (ถ้ายังไม่ได้ติดตั้ง)

```bash
npm install
```

### 2. สร้างไฟล์ .env.local

คัดลอกไฟล์ตัวอย่าง:

```bash
copy .env.example .env.local
```

### 3. รับ API Keys (ฟรี - ใช้เวลา 3 นาที)

#### Omise (สำหรับลูกค้าไทย)

1. ไปที่ [https://dashboard.omise.co/register](https://dashboard.omise.co/register)
2. สมัครสมาชิก (ใช้อีเมล)
3. ไปที่ **Keys** → คัดลอก:
   - **Public Key** (pkey_test_xxx)
   - **Secret Key** (skey_test_xxx)

#### Stripe (สำหรับลูกค้าต่างชาติ)

1. ไปที่ [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. สมัครสมาชิก
3. ไปที่ **Developers → API Keys** → คัดลอก:
   - **Publishable Key** (pk_test_xxx)
   - **Secret Key** (sk_test_xxx)

### 4. ใส่ Keys ใน .env.local

แก้ไขไฟล์ `.env.local`:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Omise (Thailand)
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_xxxxx
OMISE_SECRET_KEY=skey_test_xxxxx

# Stripe (International)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 5. รันเซิร์ฟเวอร์

```bash
npm run dev
```

### 6. ทดสอบระบบ

1. เปิดเว็บไซต์: [http://localhost:3000](http://localhost:3000)
2. สร้างการจองห้องพัก
3. ไปที่หน้าชำระเงิน
4. คลิก **"เริ่มชำระเงินออนไลน์"**
5. เลือก **PromptPay** → ดู QR Code
6. ทดสอบ Payment:
   - ไปที่ [https://dashboard.omise.co/test/charges](https://dashboard.omise.co/test/charges)
   - หา Charge ที่สร้างไว้
   - คลิก **"Mark as paid"**
7. ดูสถานะอัพเดทอัตโนมัติ → การจองยืนยันแล้ว! ✅

---

## 🎯 ทดสอบ Payment Methods

### PromptPay QR (แนะนำ)

```
1. เลือก PromptPay
2. QR Code จะแสดงขึ้น
3. ในโหมดทดสอบ: ไปที่ Omise Dashboard → Mark as paid
4. ระบบจะยืนยันการจองอัตโนมัติภายใน 5 วินาที
```

### Credit Card (Omise)

```
Card Number: 4242 4242 4242 4242
CVV: 123
Expiry: 12/25
Name: TEST USER
```

### Credit Card (Stripe)

```
Card Number: 4242 4242 4242 4242
CVV: 123
Expiry: 12/25
ZIP: 12345
```

### การทดสอบที่ล้มเหลว

```
Omise: 4000 0000 0000 0002 (Card Declined)
Stripe: 4000 0000 0000 0002 (Card Declined)
```

---

## 📝 Configuration สำหรับ Production

### 1. ติดตั้ง Webhook (สำคัญมาก!)

Webhook ทำให้ระบบยืนยันการจองอัตโนมัติเมื่อลูกค้าชำระเงินเสร็จ

#### สำหรับ Development (ใช้ ngrok)

```bash
# ติดตั้ง ngrok
npm install -g ngrok

# Terminal 1: รันเซิร์ฟเวอร์
npm run dev

# Terminal 2: รัน ngrok
ngrok http 3000

# คัดลอก URL ที่ได้ (เช่น https://abc123.ngrok.io)
```

#### ตั้งค่า Webhook บน Omise

1. ไปที่ [https://dashboard.omise.co/test/webhooks](https://dashboard.omise.co/test/webhooks)
2. คลิก **+ Add Webhook**
3. กรอก URL: `https://abc123.ngrok.io/api/payment/webhook/omise`
4. เลือก Events: `charge.complete`, `charge.failed`
5. คลิก **Create**

#### ตั้งค่า Webhook บน Stripe

1. ไปที่ [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. คลิก **+ Add endpoint**
3. กรอก URL: `https://abc123.ngrok.io/api/payment/webhook/stripe`
4. เลือก Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. คลิก **Add endpoint**

### 2. ทดสอบ Webhook

```bash
# ทดสอบ Omise Webhook
curl -X POST http://localhost:3000/api/payment/webhook/omise \
  -H "Content-Type: application/json" \
  -d '{"id":"chrg_test_xxx","object":"charge","status":"successful"}'

# ทดสอบ Stripe Webhook
curl -X POST http://localhost:3000/api/payment/webhook/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test_xxx","status":"succeeded"}}}'
```

---

## 🚀 Deploy to Production

### 1. เปลี่ยนเป็น Live Keys

แก้ไข `.env.local` (หรือ Production Environment Variables):

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Omise Live Keys (เปลี่ยนจาก test → live)
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx

# Stripe Live Keys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
```

### 2. ตั้งค่า Webhook สำหรับ Production

#### Omise Production Webhook

1. ไปที่ [https://dashboard.omise.co/live/webhooks](https://dashboard.omise.co/live/webhooks)
2. URL: `https://your-domain.com/api/payment/webhook/omise`
3. Events: `charge.complete`, `charge.failed`

#### Stripe Production Webhook

1. ไปที่ [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. URL: `https://your-domain.com/api/payment/webhook/stripe`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. SSL Certificate (จำเป็น!)

Payment gateway ต้องใช้ HTTPS เท่านั้น:

**Vercel / Netlify:**
- SSL ให้ฟรีอัตโนมัติ ✅

**VPS / Custom Server:**
- ใช้ Let's Encrypt (ฟรี)
- หรือ CloudFlare SSL

### 4. ทดสอบ Production

1. สร้างการจองทดสอบ
2. ชำระเงินด้วยบัตรจริง (จำนวนเงินน้อย เช่น 20 บาท)
3. ตรวจสอบ:
   - ✅ QR Code แสดงถูกต้อง
   - ✅ Payment สำเร็จ
   - ✅ Booking ยืนยันอัตโนมัติ
   - ✅ Payment บันทึกใน payments.json
4. ทดสอบ Refund (ถ้ามี)

---

## 📊 ตรวจสอบ Transactions

### Omise Dashboard

[https://dashboard.omise.co/charges](https://dashboard.omise.co/charges)

- ดู Charge history
- ดู Payment status
- ดู Refunds
- ดู Disputes

### Stripe Dashboard

[https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)

- ดู Payment history
- ดู Refunds
- ดู Disputes
- ดู Analytics

### Local Data

Payment records บันทึกใน:

```
data/
  ├── payments.json          # Payment history
  ├── payment-intents.json   # Payment intent records
  └── bookings.json          # Booking status
```

---

## 🔥 คุณสมบัติที่พร้อมใช้งาน

✅ **PromptPay QR Code** - สแกนและจ่ายผ่าน Mobile Banking  
✅ **Credit/Debit Card** - Visa, Mastercard, JCB (Omise + Stripe)  
✅ **TrueMoney Wallet** - E-wallet payment  
✅ **Alipay** - สำหรับนักท่องเที่ยวจีน  
✅ **Auto-confirmation** - ยืนยันการจองอัตโนมัติภายใน 5-10 วินาที  
✅ **Real-time Status** - อัพเดทสถานะแบบ Real-time  
✅ **QR Code Display** - แสดง QR Code สำหรับ PromptPay  
✅ **Countdown Timer** - นับถอยหลัง 5 นาที  
✅ **Refund Support** - คืนเงินผ่าน API  
✅ **Webhook Integration** - รับ notification แบบ Real-time  
✅ **Rate Limiting** - ป้องกัน Abuse  
✅ **Security** - Input validation, HTTPS required  

---

## 📚 เอกสารเพิ่มเติม

- 📖 [คู่มือฉบับเต็ม](./PAYMENT_GATEWAY.md)
- 🔧 [API Reference](./PAYMENT_GATEWAY.md#api-reference)
- 🐛 [Troubleshooting](./PAYMENT_GATEWAY.md#troubleshooting)
- 💰 [Fees & Limits](./PAYMENT_GATEWAY.md#fees--limits)

---

## ❓ FAQ

**Q: ใช้ได้ฟรีหรือไม่?**  
A: ใช้ API ได้ฟรี แต่ต้องเสีย Fee ตามที่ Payment Provider เรียกเก็บ (Omise: 0.5-3.5%, Stripe: 2.9%)

**Q: ต้อง verify บริษัทก่อนใช้หรือไม่?**  
A: ไม่ต้อง! ใช้ Test Mode ได้ทันที สำหรับ Live Mode ต้อง verify (Omise ใช้เวลา 1-3 วัน)

**Q: รองรับการคืนเงินหรือไม่?**  
A: รองรับผ่าน API แต่ UI ยังไม่มี (จะเพิ่มใน version ถัดไป)

**Q: ปลอดภัยหรือไม่?**  
A: ปลอดภัย - ใช้ HTTPS, Rate limiting, Input validation, Webhook verification

**Q: ต้องใช้ Database หรือไม่?**  
A: ไม่ต้อง! ใช้ JSON files (data/payments.json, data/payment-intents.json)

---

## 🆘 ต้องการความช่วยเหลือ?

- 📧 Email: support@yourdomain.com
- 💬 Discord: [เข้าร่วม Community](https://discord.gg/xxx)
- 📚 Documentation: [อ่านคู่มือฉบับเต็ม](./PAYMENT_GATEWAY.md)

---

**ขอให้โชคดีกับการรับเงินออนไลน์! 💰🚀**
