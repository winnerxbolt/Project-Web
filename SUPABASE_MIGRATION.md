# 🚀 Supabase Migration Guide

## คู่มือการย้ายระบบจาก JSON Files ไปยัง Supabase Database

---

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [ขั้นตอนที่ 1: Setup Supabase](#ขั้นตอนที่-1-setup-supabase)
3. [ขั้นตอนที่ 2: Run SQL Schema](#ขั้นตอนที่-2-run-sql-schema)
4. [ขั้นตอนที่ 3: Configure Environment](#ขั้นตอนที่-3-configure-environment)
5. [ขั้นตอนที่ 4: Migrate Data](#ขั้นตอนที่-4-migrate-data)
6. [ขั้นตอนที่ 5: Update APIs](#ขั้นตอนที่-5-update-apis)
7. [ขั้นตอนที่ 6: Testing](#ขั้นตอนที่-6-testing)
8. [การใช้งาน Supabase](#การใช้งาน-supabase)
9. [Troubleshooting](#troubleshooting)

---

## ภาพรวม

โปรเจกต์นี้มีการย้ายระบบฐานข้อมูลทั้งหมดจาก JSON files (62 ไฟล์) ไปยัง **Supabase PostgreSQL Database**

### ✅ สิ่งที่ได้รับ

- ✅ **Schema SQL** ครบทุก tables (62+ tables)
- ✅ **Supabase Client Libraries** (server & client-side)
- ✅ **Environment Configuration** พร้อม credentials
- ✅ **Row Level Security (RLS)** policies
- ✅ **Indexes** สำหรับ performance
- ✅ **Triggers & Functions** อัตโนมัติ
- ✅ **TypeScript Types** สำหรับ type safety

### 📁 ไฟล์ที่สร้างใหม่

```
Project-WebWin/
├── supabase-schema.sql          # SQL schema ทั้งหมด (รันใน Supabase)
├── lib/
│   ├── supabase.ts              # Server-side client
│   └── supabaseClient.ts        # Client-side client
└── .env.local.example           # Environment variables template
```

---

## ขั้นตอนที่ 1: Setup Supabase

### 1.1 เข้าสู่ Supabase Dashboard

1. ไปที่ [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login เข้าสู่โปรเจกต์ของคุณ
3. Project URL: `https://ffkzqihfaqscqnkhstnv.supabase.co`

### 1.2 เตรียม API Keys

คุณมี API keys แล้ว:

- **Project URL**: `https://ffkzqihfaqscqnkhstnv.supabase.co`
- **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (มีอยู่แล้ว)
- **Service Role Key**: ต้องหาจาก Settings > API

### 1.3 หา Service Role Key

1. ไปที่ **Settings** (เกียร์ซ้ายล่าง)
2. คลิก **API**
3. คัดลอก **`service_role`** key (🔴 เก็บเป็นความลับ)

---

## ขั้นตอนที่ 2: Run SQL Schema

### 2.1 เปิด SQL Editor ใน Supabase

1. ไปที่ **SQL Editor** (ไอคอน </> ทางซ้าย)
2. คลิก **New Query**

### 2.2 Copy Schema SQL

1. เปิดไฟล์ `supabase-schema.sql` ในโปรเจกต์
2. **Copy ทั้งหมด** (Ctrl+A, Ctrl+C)
3. **Paste** ลงใน SQL Editor ของ Supabase
4. คลิก **Run** (หรือกด Ctrl+Enter)

### 2.3 รอให้ Script รันเสร็จ

- ⏱️ อาจใช้เวลา 1-2 นาที
- ✅ ถ้าสำเร็จจะขึ้น "Success"
- ❌ ถ้ามี error ดูที่ [Troubleshooting](#troubleshooting)

### 2.4 ตรวจสอบ Tables

1. ไปที่ **Table Editor** (ไอคอนตารางทางซ้าย)
2. ควรเห็นทุก tables:
   - users
   - rooms
   - bookings
   - articles
   - reviews
   - payments
   - ... และอื่นๆ อีกกว่า 60 tables

---

## ขั้นตอนที่ 3: Configure Environment

### 3.1 สร้าง .env.local

```bash
# Copy template
cp .env.local.example .env.local
```

### 3.2 เพิ่ม Supabase Credentials

เปิดไฟล์ `.env.local` และเพิ่ม:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ffkzqihfaqscqnkhstnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma3pxaWhmYXFzY3Fua2hzdG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2Mjk5NDMsImV4cCI6MjA4MTIwNTk0M30.NBGfhSQnYnVuWPkqRS5YzOzrndZzawiLNOE5o5R6F9k
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY_HERE>
```

### 3.3 เก็บ Secret Keys อื่นๆ

```env
# Existing Secrets (เก็บไว้)
JWT_SECRET=your_jwt_secret_here
JWT_SECRET_SECONDARY=your_jwt_secret_secondary_here
AES_SECRET=your_aes_secret_here
PASSWORD_PEPPER=your_password_pepper_here
```

---

## ขั้นตอนที่ 4: Migrate Data

### 4.1 สร้าง Migration Script (ถ้าต้องการ)

```typescript
// scripts/migrate-to-supabase.ts
import { supabaseAdmin } from '../lib/supabase'
import usersData from '../data/users.json'
import roomsData from '../data/rooms.json'
import articlesData from '../data/articles.json'

async function migrateData() {
  console.log('🚀 Starting migration...')

  // Migrate Users
  const { error: usersError } = await supabaseAdmin
    .from('users')
    .insert(usersData)
  
  if (usersError) {
    console.error('❌ Users migration failed:', usersError)
  } else {
    console.log('✅ Users migrated')
  }

  // Migrate Rooms
  const { error: roomsError } = await supabaseAdmin
    .from('rooms')
    .insert(roomsData)
  
  if (roomsError) {
    console.error('❌ Rooms migration failed:', roomsError)
  } else {
    console.log('✅ Rooms migrated')
  }

  // Migrate Articles
  const { error: articlesError } = await supabaseAdmin
    .from('articles')
    .insert(articlesData)
  
  if (articlesError) {
    console.error('❌ Articles migration failed:', articlesError)
  } else {
    console.log('✅ Articles migrated')
  }

  console.log('🎉 Migration completed!')
}

migrateData()
```

### 4.2 รัน Migration

```bash
npx tsx scripts/migrate-to-supabase.ts
```

### 4.3 Migration ด้วย Supabase Dashboard (ทางเลือก)

1. ไปที่ **Table Editor**
2. เลือก table (เช่น `users`)
3. คลิก **Insert** > **Insert row**
4. หรือใช้ SQL Editor:

```sql
-- Example: Insert users
INSERT INTO users (id, email, name, hash, role, created_at)
VALUES 
  ('501cf967-7be2-43b9-a765-73166f06177a', 'wave.wavekung@hotmail.com', 'Winnerboy', 'hashed_password', 'admin', NOW());
```

---

## ขั้นตอนที่ 5: Update APIs

### 5.1 ตัวอย่างการใช้งาน Supabase ใน API Routes

#### **ก่อน (JSON Files)**

```typescript
// app/api/rooms/route.ts
import roomsData from '@/data/rooms.json'

export async function GET() {
  return Response.json(roomsData)
}
```

#### **หลัง (Supabase)**

```typescript
// app/api/rooms/route.ts
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('available', true)
    .order('rating', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
```

### 5.2 Update Authentication APIs

#### Login API

```typescript
// app/api/auth/login/route.ts
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword } from '@/lib/security/encryption'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // Get user from Supabase
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Verify password
  const isValid = await verifyPassword(password, user.hash, user.salt)

  if (!isValid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Create session (existing JWT logic)
  // ...
}
```

### 5.3 Update Articles API

```typescript
// app/api/articles/route.ts
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const published = searchParams.get('published') === 'true'

  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (published) {
    query = query.eq('published', true)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(req: Request) {
  const article = await req.json()

  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
```

---

## ขั้นตอนที่ 6: Testing

### 6.1 ทดสอบการเชื่อมต่อ

```typescript
// test-connection.ts
import { supabase } from './lib/supabase'

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')

  if (error) {
    console.error('❌ Connection failed:', error)
  } else {
    console.log('✅ Connected to Supabase!')
    console.log('Users count:', data)
  }
}

testConnection()
```

### 6.2 รันเทสต์

```bash
npx tsx test-connection.ts
```

---

## การใช้งาน Supabase

### Server-Side (API Routes)

```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Read operations (ใช้ supabase)
const { data } = await supabase.from('rooms').select('*')

// Write operations (ใช้ supabaseAdmin)
const { data } = await supabaseAdmin.from('users').insert({ ... })
```

### Client-Side (Components)

```typescript
import { supabaseClient, db } from '@/lib/supabaseClient'

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

## Troubleshooting

### ❌ Error: "relation already exists"

**สาเหน่**ตอ: Schema ถูกรันไปแล้ว

**แก้ไข**:
1. ไปที่ SQL Editor
2. รันคำสั่ง Drop tables:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

3. รัน `supabase-schema.sql` อีกครั้ง

---

### ❌ Error: "permission denied for table"

**สาเหตุ**: ใช้ anon key แทน service role key

**แก้ไข**:
- ใช้ `supabaseAdmin` สำหรับ write operations
- ตรวจสอบว่า `SUPABASE_SERVICE_ROLE_KEY` ถูกต้อง

---

### ❌ Error: "new row violates row-level security policy"

**สาเหตุ**: RLS policies ขัดขวาง

**แก้ไข**:
1. ปิด RLS ชั่วคราว (ในขณะ migrate):

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- ... ทุก tables
```

2. Migrate data
3. เปิด RLS กลับ:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ... ทุก tables
```

---

### ❌ Error: "JWT expired" หรือ "invalid JWT"

**สาเหตุ**: JWT token หมดอายุหรือไม่ถูกต้อง

**แก้ไข**:
- ใช้ **service_role** key แทน anon key
- ตรวจสอบ environment variables

---

## 🎯 สรุป

### ✅ Checklist

- [ ] Run `supabase-schema.sql` ใน Supabase SQL Editor
- [ ] เพิ่ม Supabase credentials ใน `.env.local`
- [ ] ติดตั้ง `@supabase/supabase-js` (`npm install` แล้ว)
- [ ] Migrate ข้อมูลจาก JSON files (ถ้าต้องการ)
- [ ] Update API routes ให้ใช้ Supabase
- [ ] ทดสอบการเชื่อมต่อ
- [ ] ทดสอบ CRUD operations
- [ ] Deploy เมื่อพร้อม

### 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🚀 Next Steps

1. **Migrate Data**: ย้ายข้อมูลจาก JSON files
2. **Update APIs**: แปลง API routes ทั้งหมด
3. **Test**: ทดสอบทุก features
4. **Deploy**: Deploy production

---

**สร้างโดย**: GitHub Copilot  
**วันที่**: 14 ธันวาคม 2025  
**Project**: WebWin Hotel Booking System
