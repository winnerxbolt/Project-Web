# 💳 Online Payment Gateway Documentation

## Overview

ระบบชำระเงินออนไลน์ที่รองรับหลายช่องทาง พร้อม Auto-confirmation และ Real-time Status Tracking

**Providers:**
- 🇹🇭 **Omise**: PromptPay QR, Credit Card, TrueMoney, Alipay (สำหรับลูกค้าไทย)
- 🌍 **Stripe**: Credit/Debit Card (สำหรับลูกค้าต่างชาติ)
- 🏦 **Manual**: Bank Transfer (สำรอง)

**Key Features:**
- ⚡ Instant Payment Confirmation (5-10 วินาที)
- 🤖 Auto-booking Confirmation via Webhooks
- 📱 PromptPay QR Code Scanning
- 💳 Credit Card Processing with 3D Secure
- 🔄 Real-time Status Polling
- 🔒 Secure Payment Processing
- 📊 Payment History Tracking

---

## Architecture

### File Structure

```
lib/server/
  └── paymentGateway.ts          # Core payment library (Omise + Stripe)

app/api/payment/
  ├── create-intent/route.ts     # POST: Create payment intent
  ├── verify/route.ts            # GET: Check payment status
  └── webhook/
      ├── omise/route.ts         # POST: Omise webhook receiver
      └── stripe/route.ts        # POST: Stripe webhook receiver

app/checkout-online/[id]/
  └── page.tsx                   # Online checkout UI

components/
  ├── PaymentMethodSelector.tsx  # Payment method selection UI
  └── PaymentStatus.tsx          # Real-time status tracker with QR

data/
  └── payment-intents.json       # Payment intent records
```

### Payment Flow

```
1. User selects room → Booking created
2. User clicks "Pay Online" → Redirects to /checkout-online/[bookingId]
3. PaymentMethodSelector → User chooses provider & method
4. Create Payment Intent (API: /api/payment/create-intent)
   ├── Omise → Returns charge_id + QR code (for PromptPay)
   └── Stripe → Returns payment_intent_id + client_secret
5. PaymentStatus Component:
   ├── Display QR Code (PromptPay) or Redirect (Card)
   ├── Auto-poll status every 5 seconds
   └── Show countdown timer (5 minutes)
6. User completes payment
7. Provider sends webhook → Auto-confirm booking
8. Status changes to 'succeeded' → Redirect to success page
```

---

## Setup Instructions

### 1. Get API Keys

#### Omise (Thailand)
1. Go to [https://dashboard.omise.co/](https://dashboard.omise.co/)
2. Sign up / Login
3. Navigate to **Keys** section
4. Copy:
   - **Public Key** (starts with `pkey_test_` or `pkey_live_`)
   - **Secret Key** (starts with `skey_test_` or `skey_live_`)

#### Stripe (International)
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up / Login
3. Navigate to **Developers → API Keys**
4. Copy:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Application URL (required for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Omise Keys
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_xxxxx
OMISE_SECRET_KEY=skey_test_xxxxx

# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Webhook Secrets (configure later)
OMISE_WEBHOOK_SECRET=
STRIPE_WEBHOOK_SECRET=
```

### 3. Configure Webhooks

#### For Development (Using ngrok)

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start Next.js server:
   ```bash
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

#### Omise Webhook Configuration

1. Go to [https://dashboard.omise.co/test/webhooks](https://dashboard.omise.co/test/webhooks)
2. Click **+ Add Webhook**
3. Enter:
   - **URL**: `https://your-domain.com/api/payment/webhook/omise`
   - **Events**: Select `charge.complete`, `charge.failed`
4. Click **Create**
5. Copy the **Webhook Secret** → Add to `.env.local` as `OMISE_WEBHOOK_SECRET`

#### Stripe Webhook Configuration

1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **+ Add endpoint**
3. Enter:
   - **Endpoint URL**: `https://your-domain.com/api/payment/webhook/stripe`
   - **Events**: Select `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Click **Add endpoint**
5. Click **Reveal** to see **Signing Secret** → Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Restart Server

```bash
npm run dev
```

---

## Testing

### Test Cards

#### Omise Test Cards

| Card Number         | Result  | Description                |
|---------------------|---------|----------------------------|
| 4242 4242 4242 4242 | Success | Visa                       |
| 5555 5555 5555 4444 | Success | Mastercard                 |
| 4000 0000 0000 0002 | Failed  | Generic decline            |

**CVV**: Any 3 digits  
**Expiry**: Any future date

#### Stripe Test Cards

| Card Number         | Result  | Description                |
|---------------------|---------|----------------------------|
| 4242 4242 4242 4242 | Success | Visa                       |
| 5555 5555 5555 4444 | Success | Mastercard                 |
| 4000 0000 0000 0002 | Failed  | Card declined              |
| 4000 0025 0000 3155 | Success | Requires 3D Secure         |

**CVV**: Any 3 digits  
**Expiry**: Any future date  
**Postal Code**: Any 5 digits

#### PromptPay Test (Omise)

1. Select **PromptPay** payment method
2. QR Code will be displayed
3. In Omise test mode:
   - Go to [https://dashboard.omise.co/test/charges](https://dashboard.omise.co/test/charges)
   - Find your charge
   - Click **Mark as paid** to simulate payment
4. Webhook will fire → Booking auto-confirmed

### Testing Flow

1. Create a booking
2. Go to `/checkout-online/[bookingId]`
3. Select payment method:
   - **PromptPay**: See QR Code → Mark as paid in Omise dashboard
   - **Credit Card**: Enter test card → Submit
4. Watch real-time status updates
5. Verify booking status changed to `confirmed`
6. Check `data/payments.json` for payment record

---

## API Reference

### POST `/api/payment/create-intent`

Create a payment intent for a booking.

**Request Body:**
```json
{
  "bookingId": "string",
  "amount": "number",
  "provider": "omise" | "stripe" | "manual",
  "paymentMethod": "promptpay" | "credit_card" | "truemoney" | "alipay" | "bank_transfer",
  "returnUrl": "string" (optional, for card payments)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "string",
    "provider": "string",
    "amount": "number",
    "status": "pending",
    "chargeId": "string" (Omise),
    "qrCodeUrl": "string" (PromptPay),
    "clientSecret": "string" (Stripe),
    "authorizeUri": "string" (Omise card redirect)
  }
}
```

### GET `/api/payment/verify?paymentIntentId=xxx&provider=omise`

Check payment status.

**Response:**
```json
{
  "success": true,
  "status": "pending" | "processing" | "succeeded" | "failed",
  "paymentData": {
    "id": "string",
    "amount": "number",
    "status": "string",
    "paid": "boolean"
  }
}
```

### POST `/api/payment/webhook/omise`

Omise webhook receiver (called by Omise servers).

**Events Handled:**
- `charge.complete` → Confirm booking
- `charge.failed` → Mark booking as failed

### POST `/api/payment/webhook/stripe`

Stripe webhook receiver (called by Stripe servers).

**Events Handled:**
- `payment_intent.succeeded` → Confirm booking
- `payment_intent.payment_failed` → Mark booking as failed

---

## Payment Methods

### PromptPay (Recommended 🌟)

**Pros:**
- ✅ Most popular in Thailand
- ✅ Instant transfer (5-10 seconds)
- ✅ Low fees (usually free for users)
- ✅ No card required
- ✅ Mobile banking app integration

**Cons:**
- ❌ Thailand only
- ❌ Requires mobile banking app

**User Flow:**
1. Select PromptPay
2. QR Code displayed
3. Open mobile banking app
4. Scan QR Code
5. Confirm payment
6. Auto-redirect to success page

**Implementation:**
```typescript
const result = await createOmisePayment({
  amount: 5000, // 5,000 THB
  currency: 'thb',
  paymentMethod: 'promptpay',
  description: 'Booking #12345',
  returnUri: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success/12345`
});

// result.qrCodeUrl: Display as QR Code
// result.chargeId: Use for status checking
```

### Credit Card

**Pros:**
- ✅ International support
- ✅ Familiar checkout flow
- ✅ 3D Secure protection

**Cons:**
- ❌ Higher fees (2.5-3.5%)
- ❌ Requires card details

**Omise (Thailand):**
```typescript
const result = await createOmisePayment({
  amount: 5000,
  currency: 'thb',
  paymentMethod: 'credit_card',
  description: 'Booking #12345',
  returnUri: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success/12345`
});

// result.authorizeUri: Redirect user here
```

**Stripe (International):**
```typescript
const result = await createStripePayment({
  amount: 5000,
  currency: 'thb',
  description: 'Booking #12345',
  metadata: { bookingId: '12345' }
});

// result.clientSecret: Use with Stripe.js
```

### TrueMoney (Thailand)

**Pros:**
- ✅ Popular in Thailand
- ✅ E-wallet payment

**Cons:**
- ❌ Thailand only
- ❌ Requires TrueMoney wallet

```typescript
const result = await createOmisePayment({
  amount: 5000,
  currency: 'thb',
  paymentMethod: 'truemoney',
  description: 'Booking #12345',
  phoneNumber: '0812345678' // User's TrueMoney number
});
```

### Alipay (International)

**Pros:**
- ✅ Popular with Chinese tourists
- ✅ Large transaction limits

**Cons:**
- ❌ Requires Alipay account

```typescript
const result = await createOmisePayment({
  amount: 5000,
  currency: 'thb',
  paymentMethod: 'alipay',
  description: 'Booking #12345',
  returnUri: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success/12345`
});
```

---

## Security

### Rate Limiting

All payment endpoints have rate limiting:
- **30 requests per 15 minutes** per IP
- Prevents brute force attacks
- Returns 429 status code when exceeded

### Input Validation

All inputs are validated:
- ✅ Amount must be positive number
- ✅ Booking ID must exist
- ✅ Provider must be valid
- ✅ Payment method must be supported

### Webhook Verification

**Omise:**
```typescript
// Verify webhook signature (coming soon)
const signature = req.headers['omise-signature'];
// TODO: Implement signature verification
```

**Stripe:**
```typescript
// Verify webhook signature
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### SSL/TLS Required

All payment operations require HTTPS:
- ✅ Development: ngrok provides HTTPS
- ✅ Production: SSL certificate required

---

## Troubleshooting

### QR Code Not Displaying

**Problem:** QR Code not showing for PromptPay payment

**Solutions:**
1. Check Omise API keys are correct
2. Verify `NEXT_PUBLIC_OMISE_PUBLIC_KEY` starts with `pkey_`
3. Check browser console for errors
4. Verify amount is valid (minimum 20 THB)

### Webhook Not Firing

**Problem:** Payment completed but booking not auto-confirmed

**Solutions:**
1. Check webhook URL is correct: `https://your-domain.com/api/payment/webhook/omise`
2. Verify webhook is configured in Omise/Stripe dashboard
3. Check server logs for webhook errors
4. For development: Use ngrok to expose localhost
5. Test webhook manually:
   ```bash
   curl -X POST https://your-domain.com/api/payment/webhook/omise \
     -H "Content-Type: application/json" \
     -d '{"id":"chrg_test_xxx","livemode":false,"object":"charge","status":"successful"}'
   ```

### Payment Stuck in "Processing"

**Problem:** Payment status never updates

**Solutions:**
1. Check payment intent ID is correct
2. Verify polling is working (check Network tab)
3. Check provider dashboard for payment status
4. Manually verify payment:
   ```bash
   GET /api/payment/verify?paymentIntentId=xxx&provider=omise
   ```

### "Invalid API Key" Error

**Problem:** 401 Unauthorized from Omise/Stripe

**Solutions:**
1. Verify API keys are correct
2. Check you're using test keys for test mode
3. Ensure no extra spaces in `.env.local`
4. Restart Next.js server after changing env vars

### 3D Secure Not Working

**Problem:** Card payment requires 3D Secure but fails

**Solutions:**
1. Ensure `returnUri` is set correctly
2. Check redirect URL is HTTPS
3. Verify 3D Secure is enabled in provider dashboard
4. Use test card that triggers 3D Secure: `4000 0025 0000 3155`

---

## Production Checklist

### Before Going Live

- [ ] Replace test API keys with live keys
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure production webhooks on Omise/Stripe
- [ ] Enable webhook signature verification
- [ ] Set up SSL certificate (Let's Encrypt or CloudFlare)
- [ ] Test all payment methods in production
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email notifications for payment success/failure
- [ ] Set up payment reconciliation process
- [ ] Create admin dashboard for payment management
- [ ] Backup payment data regularly
- [ ] Document refund process
- [ ] Set up customer support for payment issues

### Environment Variables (Production)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Live Keys (starts with pkey_live_ / skey_live_)
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Live Webhook Secrets
OMISE_WEBHOOK_SECRET=your_live_webhook_secret
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx
```

### Monitoring

**Key Metrics to Track:**
- Payment success rate
- Average payment time
- Failed payment reasons
- Refund rate
- Popular payment methods
- Revenue by provider

**Alerts:**
- Webhook failures (> 5% error rate)
- Payment API errors (> 1% error rate)
- Unusual refund activity
- Suspicious transaction patterns

---

## Fees & Limits

### Omise (Thailand)

| Payment Method | Fee                | Limit          |
|----------------|-------------------|----------------|
| PromptPay      | 0.5% (min 1 THB)  | 50,000 THB     |
| Credit Card    | 2.9% + 10 THB     | 500,000 THB    |
| TrueMoney      | 2.5%              | 30,000 THB     |
| Alipay         | 3.5%              | No limit       |

### Stripe (International)

| Payment Method | Fee                | Limit          |
|----------------|-------------------|----------------|
| Credit Card    | 2.9% + $0.30      | No limit       |
| Debit Card     | 2.9% + $0.30      | No limit       |

**Notes:**
- Fees are charged by payment provider, not your application
- Display fees to users for transparency
- Consider absorbing fees for better conversion rate

---

## Advanced Features

### Refunds

```typescript
import { refundPayment } from '@/lib/server/paymentGateway';

const result = await refundPayment({
  provider: 'omise',
  chargeId: 'chrg_test_xxx',
  amount: 5000 // Full refund, or partial amount
});

if (result.success) {
  // Update booking status
  // Send refund notification
}
```

### Payment History

All payments are stored in `data/payments.json`:

```json
{
  "id": "pay_xxx",
  "bookingId": "bk_xxx",
  "userId": "user_xxx",
  "amount": 5000,
  "currency": "thb",
  "provider": "omise",
  "paymentMethod": "promptpay",
  "status": "succeeded",
  "chargeId": "chrg_test_xxx",
  "createdAt": "2025-01-07T...",
  "paidAt": "2025-01-07T..."
}
```

### Custom Payment Flow

Create custom payment flows by using the payment library directly:

```typescript
import { 
  createOmisePayment, 
  verifyOmisePayment 
} from '@/lib/server/paymentGateway';

// 1. Create payment
const payment = await createOmisePayment({
  amount: 10000,
  currency: 'thb',
  paymentMethod: 'promptpay',
  description: 'Custom payment',
  metadata: { orderId: 'custom-123' }
});

// 2. Display QR Code
const qrCode = payment.qrCodeUrl;

// 3. Poll for status
const status = await verifyOmisePayment(payment.chargeId);

// 4. Handle result
if (status.status === 'succeeded') {
  // Process successful payment
}
```

---

## Support

### Documentation
- Omise Docs: [https://docs.opn.ooo/](https://docs.opn.ooo/)
- Stripe Docs: [https://docs.stripe.com/](https://docs.stripe.com/)

### Contact
- Omise Support: support@omise.co
- Stripe Support: [https://support.stripe.com/](https://support.stripe.com/)

### Common Issues
- Payment issues: Check provider dashboard first
- Webhook issues: Verify URL and test with curl
- API errors: Check API key and server logs

---

## Changelog

### v1.0.0 (2025-01-07)
- ✅ Initial implementation
- ✅ Omise integration (PromptPay, Credit Card, TrueMoney, Alipay)
- ✅ Stripe integration (Credit/Debit Card)
- ✅ Webhook auto-confirmation
- ✅ Real-time status tracking
- ✅ QR Code display for PromptPay
- ✅ Rate limiting protection
- ✅ Payment history tracking

### Roadmap
- [ ] Email notifications after payment
- [ ] SMS notifications for payment success
- [ ] PDF receipt generation
- [ ] Admin payment management UI
- [ ] Refund management interface
- [ ] Payment analytics dashboard
- [ ] Multi-currency support
- [ ] Subscription payments
- [ ] Split payments (deposit + balance)

---

**Questions?** Check the troubleshooting section or create an issue on GitHub.
