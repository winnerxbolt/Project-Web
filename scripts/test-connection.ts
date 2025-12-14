// Test Supabase connection and data
// Load environment variables
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffkzqihfaqscqnkhstnv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing!')
  console.error('Make sure .env.local file exists with the correct key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')
  console.log('URL:', supabaseUrl)
  console.log('Service Key:', supabaseServiceKey.substring(0, 20) + '...\n')

  try {
    // Test 1: Check rooms table
    console.log('📦 Test 1: Fetching rooms...')
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(5)
    
    if (roomsError) {
      console.error('❌ Rooms error:', roomsError)
    } else {
      console.log(`✅ Found ${rooms?.length || 0} rooms`)
      if (rooms && rooms.length > 0) {
        console.log('   Sample:', rooms[0].name)
      }
    }

    // Test 2: Check bookings table
    console.log('\n📦 Test 2: Fetching bookings...')
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5)
    
    if (bookingsError) {
      console.error('❌ Bookings error:', bookingsError)
    } else {
      console.log(`✅ Found ${bookings?.length || 0} bookings`)
      if (bookings && bookings.length > 0) {
        console.log('   Sample:', bookings[0].guest_name)
      }
    }

    // Test 3: Check reviews table
    console.log('\n📦 Test 3: Fetching reviews...')
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(5)
    
    if (reviewsError) {
      console.error('❌ Reviews error:', reviewsError)
    } else {
      console.log(`✅ Found ${reviews?.length || 0} reviews`)
    }

    // Test 4: Check articles table
    console.log('\n📦 Test 4: Fetching articles...')
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(5)
    
    if (articlesError) {
      console.error('❌ Articles error:', articlesError)
    } else {
      console.log(`✅ Found ${articles?.length || 0} articles`)
    }

    // Test 5: Try to insert a test booking
    console.log('\n📦 Test 5: Testing INSERT operation...')
    const testBooking = {
      room_id: 1,
      room_name: 'Test Room',
      guest_name: 'Test Guest',
      guest_email: 'test@example.com',
      guest_phone: '0800000000',
      check_in: new Date().toISOString(),
      check_out: new Date(Date.now() + 86400000).toISOString(),
      guests: 2,
      total: 1000,
      status: 'pending'
    }

    const { data: insertedBooking, error: insertError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()
    
    if (insertError) {
      console.error('❌ Insert error:', insertError)
    } else {
      console.log('✅ Successfully inserted test booking:', insertedBooking?.[0]?.id)
      
      // Clean up - delete the test booking
      if (insertedBooking && insertedBooking[0]) {
        await supabase
          .from('bookings')
          .delete()
          .eq('id', insertedBooking[0].id)
        console.log('✅ Cleaned up test booking')
      }
    }

    console.log('\n✅ Connection test completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()
