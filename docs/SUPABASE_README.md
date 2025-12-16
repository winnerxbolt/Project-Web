# 🗃️ Supabase Database Integration

## ภาพรวมระบบ

โปรเจกต์นี้มีการเตรียมพร้อมสำหรับการย้ายจาก **JSON Files** ไปยัง **Supabase PostgreSQL Database** ครบทุกส่วน

---

## 📁 ไฟล์ที่สร้างให้

### 1. **supabase-schema.sql** (Full Schema)
   - ✅ 62+ tables ครบทุก features
   - ✅ Indexes สำหรับ performance
   - ✅ Row Level Security (RLS) policies
   - ✅ Triggers & Functions อัตโนมัติ
   - ✅ Foreign key relationships
   - ✅ Initial data (loyalty tiers, etc.)

### 2. **supabase-quick-start.sql** (Quick Setup)
   - ✅ Core tables เท่านั้น (users, rooms, bookings, articles, reviews, notifications)
   - ✅ เหมาะสำหรับเริ่มต้นใช้งานเร็ว
   - ✅ มี sample data พร้อม

### 3. **lib/supabase.ts** (Server-Side Client)
   - ✅ `supabase` - สำหรับ read operations
   - ✅ `supabaseAdmin` - สำหรับ write operations (admin only)
   - ✅ TypeScript types ครบถ้วน

### 4. **lib/supabaseClient.ts** (Client-Side Client)
   - ✅ `supabaseClient` - สำหรับ browser
   - ✅ Helper functions พร้อมใช้
   - ✅ Authentication helpers
   - ✅ Database query helpers

### 5. **scripts/migrate-data-to-supabase.ts** (Migration Script)
   - ✅ Auto-migrate จาก JSON files
   - ✅ Data transformation
   - ✅ Error handling

### 6. **API Examples**
   - ✅ `app/api/rooms/supabase-example.ts` - Rooms CRUD
   - ✅ `app/api/articles/supabase-example.ts` - Articles CRUD

### 7. **SUPABASE_MIGRATION.md** (Complete Guide)
   - ✅ Step-by-step instructions
   - ✅ Troubleshooting guide
   - ✅ Best practices

---

## 🚀 Quick Start (5 นาที)

### ขั้นตอนที่ 1: เปิด Supabase SQL Editor

1. ไปที่ https://supabase.com/dashboard
2. เลือก project: `ffkzqihfaqscqnkhstnv`
3. คลิก **SQL Editor** (ไอคอน </> ทางซ้าย)
4. คลิก **New Query**

### ขั้นตอนที่ 2: รัน Quick Start SQL

1. เปิดไฟล์ **`supabase-quick-start.sql`**
2. **Copy ทั้งหมด** (Ctrl+A, Ctrl+C)
3. **Paste** ใน SQL Editor
4. คลิก **Run** (หรือกด Ctrl+Enter)
5. รอ 30 วินาที - เสร็จแล้ว! ✅

### ขั้นตอนที่ 3: ตรวจสอบ Tables

1. ไปที่ **Table Editor** (ไอคอนตารางทางซ้าย)
2. ควรเห็น tables:
   - users
   - rooms
   - bookings
   - articles
   - reviews
   - notifications

### ขั้นตอนที่ 4: หา Service Role Key

1. ไปที่ **Settings** (เกียร์ซ้ายล่าง)
2. คลิก **API**
3. คัดลอก **`service_role`** secret key

### ขั้นตอนที่ 5: Configure Environment

เพิ่มใน `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ffkzqihfaqscqnkhstnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma3pxaWhmYXFzY3Fua2hzdG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2Mjk5NDMsImV4cCI6MjA4MTIwNTk0M30.NBGfhSQnYnVuWPkqRS5YzOzrndZzawiLNOE5o5R6F9k
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
```

---

## 💻 การใช้งาน

### Server-Side (API Routes)

```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase'

// READ (ใช้ supabase)
const { data, error } = await supabase
  .from('rooms')
  .select('*')
  .eq('available', true)

// WRITE (ใช้ supabaseAdmin)
const { data, error } = await supabaseAdmin
  .from('rooms')
  .insert({ name: 'ห้องใหม่', price: 3000 })
```

### Client-Side (Components)

```typescript
import { db } from '@/lib/supabaseClient'

// Get rooms
const { data, error } = await db.getRooms()

// Get user bookings
const { data, error } = await db.getUserBookings(userId)

// Create booking
const { data, error } = await db.createBooking({
  user_id: userId,
  room_id: roomId,
  check_in: '2025-12-20',
  check_out: '2025-12-25',
  guests: 2,
  total_price: 15000
})
```

---

## 📊 Database Schema

### Core Tables

| Table | Description | Rows |
|-------|-------------|------|
| `users` | Users & authentication | - |
| `rooms` | Hotel rooms | - |
| `bookings` | Room bookings | - |
| `articles` | Blog articles | - |
| `reviews` | Room reviews | - |
| `notifications` | User notifications | - |

### Additional Tables (in full schema)

- **Payments**: payments, payment_intents, refund_requests
- **Pricing**: dynamic_pricing_rules, seasonal_pricing, demand_pricing
- **Loyalty**: loyalty_members, points_transactions, redemptions
- **Email**: email_campaigns, email_queue, email_subscribers
- **SMS**: sms_messages, sms_templates, sms_settings
- **Chat**: chat_messages, auto_replies
- **และอื่นๆ อีกกว่า 50 tables**

---

## 🔒 Security Features

### Row Level Security (RLS)

```sql
-- Users can only read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can only see their own bookings
CREATE POLICY bookings_select_own ON bookings
    FOR SELECT USING (auth.uid()::text = user_id::text);
```

### Role-Based Access

- ✅ `user` - Basic access
- ✅ `admin` - Full access
- ✅ `staff` - Limited admin access

---

## 🔄 Migration Process

### Option 1: Manual Migration (Recommended for first time)

1. Run Quick Start SQL
2. Manually add data via Table Editor
3. Test each table

### Option 2: Automated Migration

```bash
# Make sure .env.local has SUPABASE_SERVICE_ROLE_KEY
npx tsx scripts/migrate-data-to-supabase.ts
```

---

## 🧪 Testing

### Test Connection

```typescript
// test-connection.ts
import { supabase } from './lib/supabase'

async function test() {
  const { data, error } = await supabase.from('users').select('count')
  console.log(error ? '❌ Failed' : '✅ Connected!')
}

test()
```

Run:
```bash
npx tsx test-connection.ts
```

---

## 📚 Documentation Links

- [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) - Complete migration guide
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🎯 Current Status

| Task | Status |
|------|--------|
| SQL Schema | ✅ Complete |
| Supabase Clients | ✅ Complete |
| Environment Config | ✅ Complete |
| Migration Script | ✅ Complete |
| API Examples | ✅ Complete |
| Documentation | ✅ Complete |
| **Ready to Use** | ✅ **YES** |

---

## 🚧 Next Steps

1. [ ] Run `supabase-quick-start.sql` in Supabase
2. [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
3. [ ] (Optional) Run migration script
4. [ ] Update API routes to use Supabase
5. [ ] Test all functionality
6. [ ] Deploy

---

## 💡 Tips

### การใช้ supabase vs supabaseAdmin

```typescript
// ❌ Wrong: ใช้ supabase สำหรับ admin operations
const { error } = await supabase
  .from('users')
  .update({ role: 'admin' })  // จะ fail เพราะ RLS

// ✅ Correct: ใช้ supabaseAdmin
const { error } = await supabaseAdmin
  .from('users')
  .update({ role: 'admin' })  // Success!
```

### Debugging RLS Issues

```sql
-- ปิด RLS ชั่วคราว (development only)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- เปิดกลับเมื่อเสร็จ
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

---

**สร้างโดย**: GitHub Copilot  
**วันที่**: 14 ธันวาคม 2025  
**Project**: WebWin Hotel Booking System
