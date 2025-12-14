// scripts/migrate-data-to-supabase.ts
// Script สำหรับ migrate ข้อมูลจาก JSON files ไปยัง Supabase

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'

// Supabase Configuration
const supabaseUrl = 'https://ffkzqihfaqscqnkhstnv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to read JSON file
function readJsonFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename)
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

// Migrate Users
async function migrateUsers() {
  console.log('\n📋 Migrating users...')
  const users = readJsonFile('users.json')
  
  if (users.length === 0) {
    console.log('⚠️  No users to migrate')
    return
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(users, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('❌ Users migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} users`)
  }
}

// Migrate Rooms
async function migrateRooms() {
  console.log('\n🏠 Migrating rooms...')
  const rooms = readJsonFile('rooms.json')
  
  if (rooms.length === 0) {
    console.log('⚠️  No rooms to migrate')
    return
  }

  // Transform rooms data to match Supabase schema
  const transformedRooms = rooms.map((room: any) => ({
    id: room.id,
    name: room.name,
    price: parseFloat(room.price),
    description: room.description || '',
    guests: parseInt(room.guests) || 1,
    beds: parseInt(room.beds) || 1,
    bedrooms: parseInt(room.bedrooms) || 1,
    bathrooms: parseInt(room.bathrooms) || 1,
    size: room.size ? parseFloat(room.size) : null,
    image: room.image || '/logo.png',
    images: room.images || [room.image || '/logo.png'],
    rating: parseFloat(room.rating) || 0,
    reviews: parseInt(room.reviews) || 0,
    amenities: room.amenities || [],
    location: room.location || 'พัทยา ชลบุรี',
    available: room.available !== false,
    kitchen: room.kitchen || false,
    parking: room.parking || false,
    pool: room.pool || false,
    wifi: room.wifi !== false,
    air_conditioning: room.air_conditioning !== false,
    pet_friendly: room.pet_friendly || false,
    smoking_allowed: room.smoking_allowed || false
  }))

  const { data, error } = await supabase
    .from('rooms')
    .upsert(transformedRooms, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('❌ Rooms migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} rooms`)
  }
}

// Migrate Bookings
async function migrateBookings() {
  console.log('\n📅 Migrating bookings...')
  const bookings = readJsonFile('bookings.json')
  
  if (bookings.length === 0) {
    console.log('⚠️  No bookings to migrate')
    return
  }

  const { data, error } = await supabase
    .from('bookings')
    .upsert(bookings, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('❌ Bookings migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} bookings`)
  }
}

// Migrate Articles
async function migrateArticles() {
  console.log('\n📝 Migrating articles...')
  const articles = readJsonFile('articles.json')
  
  if (articles.length === 0) {
    console.log('⚠️  No articles to migrate')
    return
  }

  const { data, error } = await supabase
    .from('articles')
    .upsert(articles, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('❌ Articles migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} articles`)
  }
}

// Migrate Reviews
async function migrateReviews() {
  console.log('\n⭐ Migrating reviews...')
  const reviews = readJsonFile('reviews.json')
  
  if (reviews.length === 0) {
    console.log('⚠️  No reviews to migrate')
    return
  }

  const { data, error } = await supabase
    .from('reviews')
    .upsert(reviews, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('❌ Reviews migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} reviews`)
  }
}

// Migrate Coupons
async function migrateCoupons() {
  console.log('\n🎟️  Migrating coupons...')
  const coupons = readJsonFile('coupons.json')
  
  if (coupons.length === 0) {
    console.log('⚠️  No coupons to migrate')
    return
  }

  const { data, error } = await supabase
    .from('coupons')
    .upsert(coupons, { onConflict: 'code' })
    .select()

  if (error) {
    console.error('❌ Coupons migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} coupons`)
  }
}

// Migrate Notifications
async function migrateNotifications() {
  console.log('\n🔔 Migrating notifications...')
  const notifications = readJsonFile('notifications.json')
  
  if (notifications.length === 0) {
    console.log('⚠️  No notifications to migrate')
    return
  }

  const { data, error } = await supabase
    .from('notifications')
    .upsert(notifications, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('❌ Notifications migration failed:', error.message)
  } else {
    console.log(`✅ Migrated ${data.length} notifications`)
  }
}

// Main migration function
async function main() {
  console.log('🚀 Starting Supabase data migration...')
  console.log('=' .repeat(50))

  try {
    // Migrate core data
    await migrateUsers()
    await migrateRooms()
    await migrateBookings()
    await migrateArticles()
    await migrateReviews()
    await migrateCoupons()
    await migrateNotifications()

    console.log('\n' + '='.repeat(50))
    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Next steps:')
    console.log('1. Go to Supabase Dashboard > Table Editor')
    console.log('2. Verify all data is migrated correctly')
    console.log('3. Update API routes to use Supabase')
    console.log('4. Test all functionality')
    console.log('5. Deploy when ready')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
main()

// ========================================
// Usage:
// 1. Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local
// 2. Run: npx tsx scripts/migrate-data-to-supabase.ts
// ========================================
