// scripts/migrate-to-supabase.ts
// Script สำหรับย้ายข้อมูลจาก JSON files ไปยัง Supabase

// Load environment variables from .env.local
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Import Supabase client directly (bypass lib/supabase.ts cache)
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')

// Create Supabase client with env vars loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'SET' : 'NOT SET')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function loadJSON(filename: string) {
  try {
    const filePath = path.join(dataDir, filename)
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log(`⚠️  File ${filename} not found or empty, skipping...`)
    return []
  }
}

// Helper function to convert non-UUID strings to UUID
function toUUID(id: string): string {
  // Check if already valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(id)) {
    return id
  }
  
  // Convert string to UUID using crypto hashing
  const crypto = require('crypto')
  const hash = crypto.createHash('md5').update(id).digest('hex')
  
  // Format as UUID v4
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20), // Variant
    hash.substring(20, 32)
  ].join('-')
}

async function migrateUsers() {
  console.log('\n📦 Migrating users...')
  const users = await loadJSON('users.json')
  
  if (users.length === 0) {
    console.log('   ⚠️  No users to migrate')
    return
  }

  for (const user of users) {
    const userId = toUUID(user.id) // Convert to UUID
    
    const { error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: user.email,
        name: user.name,
        hash: user.hash,
        salt: user.salt || null,
        role: user.role || 'user',
        phone: user.phone || null,
        picture: user.picture || null,
        social_provider: user.socialProvider || null,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.log(`   ❌ Error migrating user ${user.email}:`, error.message)
    } else {
      console.log(`   ✅ Migrated user: ${user.email}`)
    }
  }
}

async function migrateRooms() {
  console.log('\n📦 Migrating rooms...')
  const rooms = await loadJSON('rooms.json')
  
  if (rooms.length === 0) {
    console.log('   ⚠️  No rooms to migrate')
    return
  }

  for (const room of rooms) {
    const { error } = await supabaseAdmin
      .from('rooms')
      .upsert({
        id: room.id,
        name: room.name,
        price: room.price,
        description: room.description || '',
        guests: room.guests || 1,
        beds: room.beds || 1,
        bedrooms: room.bedrooms || 1,
        bathrooms: room.bathrooms || 1,
        size: room.size || null,
        image: room.image || '/logo.png',
        images: room.images || [room.image || '/logo.png'],
        rating: room.rating || 0,
        reviews: room.reviews || 0,
        amenities: room.amenities || [],
        location: room.location || 'พัทยา ชลบุรี',
        available: room.available !== false,
        kitchen: room.kitchen || false,
        parking: room.parking || false,
        pool: room.pool || false,
        wifi: room.wifi !== false,
        air_conditioning: room.airConditioning !== false,
        created_at: room.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.log(`   ❌ Error migrating room ${room.name}:`, error.message)
    } else {
      console.log(`   ✅ Migrated room: ${room.name}`)
    }
  }
}

async function migrateArticles() {
  console.log('\n📦 Migrating articles...')
  const articles = await loadJSON('articles.json')
  
  if (articles.length === 0) {
    console.log('   ⚠️  No articles to migrate')
    return
  }

  for (const article of articles) {
    const authorId = article.authorId ? toUUID(article.authorId) : null
    
    const { error } = await supabaseAdmin
      .from('articles')
      .upsert({
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || article.content.substring(0, 150),
        author: article.author || 'Admin',
        author_id: authorId,
        cover_image: article.coverImage || null,
        category: article.category || 'general',
        tags: article.tags || [],
        published: article.published !== false,
        views: article.views || 0,
        created_at: article.createdAt || new Date().toISOString(),
        updated_at: article.updatedAt || new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.log(`   ❌ Error migrating article ${article.title}:`, error.message)
    } else {
      console.log(`   ✅ Migrated article: ${article.title}`)
    }
  }
}

async function migrateBookings() {
  console.log('\n📦 Migrating bookings...')
  const bookings = await loadJSON('bookings.json')
  
  if (bookings.length === 0) {
    console.log('   ⚠️  No bookings to migrate')
    return
  }

  for (const booking of bookings) {
    const bookingId = toUUID(booking.id)
    const userId = booking.userId ? toUUID(booking.userId) : null
    
    const { error } = await supabaseAdmin
      .from('bookings')
      .upsert({
        id: bookingId,
        user_id: userId,
        room_id: booking.roomId,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests: booking.guests,
        total_price: booking.totalPrice,
        status: booking.status || 'pending',
        payment_status: booking.paymentStatus || 'pending',
        payment_method: booking.paymentMethod || null,
        guest_name: booking.guestName || null,
        guest_email: booking.guestEmail || null,
        guest_phone: booking.guestPhone || null,
        created_at: booking.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.log(`   ❌ Error migrating booking ${booking.id}:`, error.message)
    } else {
      console.log(`   ✅ Migrated booking: ${booking.id}`)
    }
  }
}

async function migrateReviews() {
  console.log('\n📦 Migrating reviews...')
  const reviews = await loadJSON('reviews.json')
  
  if (reviews.length === 0) {
    console.log('   ⚠️  No reviews to migrate')
    return
  }

  for (const review of reviews) {
    const bookingId = review.bookingId ? toUUID(review.bookingId) : null
    const userId = toUUID(review.userId)
    
    const { error } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id: bookingId,
        room_id: review.roomId,
        user_id: userId,
        rating: review.rating,
        title: review.title || null,
        comment: review.comment || null,
        verified: review.verified || false,
        created_at: review.createdAt || new Date().toISOString()
      })

    if (error && !error.message.includes('duplicate')) {
      console.log(`   ❌ Error migrating review:`, error.message)
    } else if (!error) {
      console.log(`   ✅ Migrated review`)
    }
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...')
  console.log('=' .repeat(50))

  try {
    // Test connection
    const { error } = await supabaseAdmin.from('users').select('count').limit(1)
    if (error) {
      console.log('❌ Cannot connect to Supabase:', error.message)
      console.log('\nPlease check:')
      console.log('1. SUPABASE_SERVICE_ROLE_KEY is set in .env.local')
      console.log('2. SQL schema has been run in Supabase')
      process.exit(1)
    }
    console.log('✅ Connected to Supabase successfully!')

    // Migrate in order
    await migrateUsers()
    await migrateRooms()
    await migrateArticles()
    await migrateBookings()
    await migrateReviews()

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Check your Supabase dashboard to verify data')
    console.log('2. Update API routes to use Supabase')
    console.log('3. Test the application')
  } catch (error: any) {
    console.log('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main()
