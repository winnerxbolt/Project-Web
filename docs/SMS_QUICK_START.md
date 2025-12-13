# 🚀 SMS System - Quick Start Guide

## ⚡ เริ่มใช้งานใน 5 นาที!

### Step 1: Install Dependencies (Optional)

```bash
# For Twilio (if using)
npm install twilio

# For Chart.js (for analytics charts)
npm install chart.js react-chartjs-2

# Or install all at once
npm install twilio chart.js react-chartjs-2
```

**Note**: System works with test provider without any dependencies!

---

### Step 2: Access Admin Dashboard

1. Start your Next.js server:
```bash
npm run dev
```

2. Open browser and go to:
```
http://localhost:3000/admin/sms
```

3. You should see the beautiful SMS dashboard! 🎉

---

### Step 3: Send Your First SMS

#### Option A: Using Admin UI (Easiest)

1. Click **"Dashboard"** tab
2. Click **"Send SMS"** button
3. Enter:
   - **Phone**: `+66812345678` (your test number)
   - **Template**: Select "Booking Confirmation"
   - **Variables**:
     - guestName: `ทดสอบ`
     - bookingId: `123`
     - roomName: `Deluxe Villa`
     - checkIn: `15 ธ.ค. 2025`
     - checkOut: `17 ธ.ค. 2025`
     - total: `10,000`
4. Click **"Send"**
5. Check console log - you'll see:
   ```
   [TEST] SMS to +66812345678: สวัสดีค่ะคุณ...
   ```

#### Option B: Using Code

Create a test file or API route:

```typescript
// app/api/test-sms/route.ts
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/server/smsService'

export async function GET() {
  const result = await sendSMS({
    to: '+66812345678',
    templateId: 'tmpl_booking_confirmation',
    variables: {
      guestName: 'คุณทดสอบ',
      bookingId: '123',
      roomName: 'Deluxe Pool Villa',
      checkIn: '15 ธ.ค. 2025',
      checkOut: '17 ธ.ค. 2025',
      total: '10,000'
    },
    priority: 'high'
  })
  
  return NextResponse.json(result)
}
```

Then visit: `http://localhost:3000/api/test-sms`

---

### Step 4: Test Automatic Triggers

#### Create a Booking (Auto-sends SMS)

1. Go to your booking page
2. Fill in guest details including **phone number**
3. Submit booking
4. Check console - you should see:
   ```
   ✅ Booking confirmation SMS sent to: +66812345678
   ```
5. Go to Admin → SMS → Messages to see the sent message!

#### Confirm a Payment (Auto-sends SMS)

1. Go to Admin → Payments
2. Find a pending payment
3. Click "Confirm"
4. SMS automatically sent!

---

### Step 5: Configure Real SMS Provider

#### For ThaiBulkSMS (Recommended for Thailand)

1. Sign up at [thaibulksms.com](https://www.thaibulksms.com)
2. Get your API Key and Secret Key
3. Edit `data/sms-providers.json`:

```json
{
  "provider": "thaibulksms",
  "isActive": true,
  "isPrimary": true,
  "credentials": {
    "apiKey": "YOUR_API_KEY_HERE",
    "secretKey": "YOUR_SECRET_KEY_HERE",
    "senderId": "WINNERBOY"
  }
}
```

4. Test connection in Admin → SMS → Settings

#### For Twilio (International)

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get Account SID, Auth Token, and buy a phone number
3. Install Twilio:
   ```bash
   npm install twilio
   ```
4. Edit `data/sms-providers.json`:

```json
{
  "provider": "twilio",
  "isActive": true,
  "isPrimary": true,
  "credentials": {
    "accountSid": "YOUR_ACCOUNT_SID",
    "authToken": "YOUR_AUTH_TOKEN",
    "fromNumber": "+1234567890"
  }
}
```

5. Update `lib/server/smsService.ts` line 39:

```typescript
// Uncomment these lines for production Twilio:
const twilio = require('twilio')
const client = twilio(this.accountSid, this.authToken)
return await client.messages.create({
  body: message,
  from: this.fromNumber,
  to: to,
  ...options
})
```

---

## 🎨 Customize Templates

### Edit Existing Template

1. Go to Admin → SMS → Templates
2. Click "Edit" on any template
3. Modify the content
4. Use `{{variableName}}` for dynamic content
5. Save

### Create New Template

1. Click "Create Template"
2. Fill in:
   - **Name**: My Custom Template
   - **Category**: booking/payment/reminder/marketing
   - **Content**: 
     ```
     สวัสดีค่ะคุณ {{name}} 🎉
     
     {{message}}
     
     ติดต่อเรา: {{phone}}
     ```
3. Variables are auto-detected!
4. Save

### Use Custom Template

```typescript
await sendSMS({
  to: '+66812345678',
  templateId: 'your_template_id',
  variables: {
    name: 'John',
    message: 'Your custom message',
    phone: '02-XXX-XXXX'
  }
})
```

---

## 📊 View Analytics

1. Go to Admin → SMS → Analytics
2. See beautiful charts:
   - 📈 Timeline: Message trends over 7 days
   - 🥧 Provider Distribution: Which provider used most
   - 📊 Template Performance: Best templates
   - 💰 Cost Tracking: Total spending

---

## ⚙️ Configure Settings

1. Go to Admin → SMS → Settings
2. Adjust:
   - **Rate Limits**: Max messages per hour/day
   - **Retry Policy**: How many retries for failed messages
   - **Quiet Hours**: Don't send during sleep time (22:00-08:00)
   - **Opt-out Keywords**: STOP, UNSUBSCRIBE, ยกเลิก
   - **Blacklist**: Block certain numbers

---

## 🧪 Testing Checklist

- [ ] Access admin dashboard at `/admin/sms`
- [ ] Send test SMS using "Send SMS" button
- [ ] Create a booking with phone number → verify SMS sent
- [ ] Confirm a payment → verify SMS sent
- [ ] Check Messages tab → see sent messages
- [ ] Check Templates tab → see 8 pre-built templates
- [ ] Check Analytics tab → see charts
- [ ] Edit a template → save and test
- [ ] Create custom template → test sending

---

## 🎯 Common Use Cases

### 1. Manual SMS to Customer

```typescript
await sendSMS({
  to: '+66812345678',
  message: 'คุณลูกค้าที่เคารพ มีโปรโมชั่นพิเศษ...',
  priority: 'normal'
})
```

### 2. Bulk Marketing Campaign

```typescript
import { sendBulkSMS } from '@/lib/server/smsService'

await sendBulkSMS({
  templateId: 'tmpl_special_offer',
  recipients: [
    { to: '+66812345678', variables: { name: 'John' } },
    { to: '+66887654321', variables: { name: 'Jane' } }
  ],
  campaignId: 'summer_sale'
})
```

### 3. Scheduled Reminder

```typescript
await sendSMS({
  to: '+66812345678',
  templateId: 'tmpl_checkin_reminder',
  variables: { guestName: 'John', roomName: 'Villa A' },
  scheduledFor: '2025-12-14T14:00:00.000Z'  // Send tomorrow
})
```

### 4. Emergency Alert

```typescript
await sendSMS({
  to: ['+66812345678', '+66887654321'],  // Multiple recipients
  templateId: 'tmpl_emergency_alert',
  variables: {
    alertMessage: 'Weather warning',
    emergencyContact: '02-XXX-XXXX'
  },
  priority: 'urgent'
})
```

---

## 🚨 Troubleshooting

### Problem: SMS not sending

**Solution**:
1. Check provider is active: `data/sms-providers.json`
2. Check phone number format: Must be `+66xxxxxxxxx`
3. Check console for errors
4. Use test provider first: Set `"isPrimary": true` for test provider

### Problem: Template not found

**Solution**:
1. Check template ID in `data/sms-templates.json`
2. Verify template has `"isActive": true`
3. Check spelling of template ID

### Problem: Charts not showing

**Solution**:
1. Install chart dependencies:
   ```bash
   npm install chart.js react-chartjs-2
   ```
2. Restart server: `npm run dev`
3. Refresh browser

### Problem: Variables not working

**Solution**:
1. Check variable names match exactly: `{{guestName}}` not `{{guest_name}}`
2. Ensure all required variables are provided
3. Check template content has correct `{{variable}}` syntax

---

## 📱 Phone Number Format

Always use **E.164 format**:

✅ **Correct**:
- `+66812345678` (Thailand)
- `+1234567890` (USA)
- `+85212345678` (Hong Kong)

❌ **Wrong**:
- `0812345678` (Missing country code)
- `66812345678` (Missing +)
- `081-234-5678` (Has dashes)

The system auto-converts Thai numbers:
- Input: `0812345678` → Output: `+66812345678`

---

## 💡 Pro Tips

1. **Start with Test Provider** - Test everything before using real SMS
2. **Check Logs** - Always check console logs for debugging
3. **Monitor Analytics** - Review delivery rates daily
4. **Optimize Templates** - Keep messages under 160 chars (1 segment = cheaper)
5. **Use Scheduling** - Send reminders automatically
6. **Segment Audiences** - Marketing only to opted-in users
7. **A/B Test** - Try different message styles
8. **Track Costs** - Monitor spending in analytics

---

## 📚 Next Steps

1. ✅ **Read Full Guide**: `SMS_NOTIFICATION_GUIDE.md`
2. ✅ **Customize Templates**: Make them match your brand
3. ✅ **Configure Real Provider**: ThaiBulkSMS or Twilio
4. ✅ **Test with Bookings**: Try real workflow
5. ✅ **Monitor Analytics**: Check performance
6. ✅ **Create Campaigns**: Start marketing

---

## 🎉 You're Ready!

Your SMS system is now fully operational! 🚀

**What you can do**:
- ✅ Send SMS from admin panel
- ✅ Auto-send booking confirmations
- ✅ Auto-send payment alerts
- ✅ Schedule check-in reminders
- ✅ Create marketing campaigns
- ✅ Track delivery & costs
- ✅ View beautiful analytics

**Need Help?**
- 📖 Full Guide: `SMS_NOTIFICATION_GUIDE.md`
- 📖 Summary: `SMS_IMPLEMENTATION_SUMMARY.md`
- 💻 Code: `lib/server/smsService.ts`
- 🎨 UI: `app/admin/sms/page.tsx`

---

**Happy SMS Sending! 📱🎊**
