// Test ALL APIs after conversion
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testAllAPIs() {
  console.log('🧪 Testing ALL API Connections...\n')
  console.log('='.repeat(70))

  // First, get a real user_id from users table
  const { data: users } = await supabase.from('users').select('id').limit(1)
  const testUserId = users?.[0]?.id || null

  const tests = [
    { name: 'Videos', table: 'videos', testInsert: { video_url: 'https://youtube.com/test', title: 'Test Video', active: true } },
    { name: 'Notifications', table: 'notifications', testInsert: { title: 'Test', message: 'Test message', type: 'test' } },
    { name: 'Wishlist', table: 'wishlist', testInsert: testUserId ? { user_id: testUserId, room_id: 1 } : null },
    { name: 'FAQ', table: 'faq', testInsert: { question: 'Test?', answer: 'Test answer', active: true } },
    { name: 'Locations', table: 'locations', testInsert: { name: 'Test Location', province: 'Test' } },
    { name: 'Group Bookings', table: 'group_bookings', testInsert: { 
      group_name: 'Test Group',
      total_rooms: 5,
      total_guests: 10,
      check_in: '2025-12-20',
      check_out: '2025-12-22',
      total_price: 50000,
      contact_name: 'Test',
      contact_email: 'test@test.com'
    }},
    { name: 'Dynamic Pricing', table: 'dynamic_pricing_rules', testInsert: { 
      name: 'Test Rule',
      rule_type: 'occupancy',
      conditions: { min: 0.5 },
      price_adjustment: 1.2,
      adjustment_type: 'percentage',
      active: true
    }},
    { name: 'Gallery Images', table: 'gallery_images', testInsert: { image_url: 'https://test.com/image.jpg', room_id: 1 } },
    { name: 'Gallery Videos', table: 'gallery_videos', testInsert: { video_url: 'https://test.com/video.mp4', room_id: 1 } },
    { name: 'Gallery VR', table: 'gallery_vr_tours', testInsert: { tour_url: 'https://test.com/vr', room_id: 1 } },
    { name: 'Gallery Drone', table: 'gallery_drone_shots', testInsert: { media_url: 'https://test.com/drone.jpg', room_id: 1 } },
    { name: 'Bookings', table: 'bookings', testInsert: {
      room_id: 1,
      room_name: 'Test Room',
      check_in: '2025-12-20',
      check_out: '2025-12-22',
      guests: 2,
      total: 5000,
      total_price: 5000,
      status: 'pending',
      guest_name: 'Test Guest',
      guest_email: 'test@test.com',
      guest_phone: '0800000000'
    }},
    { name: 'Reviews', table: 'reviews', testInsert: testUserId ? {
      room_id: 1,
      user_id: testUserId,
      rating: 5,
      comment: 'Test review'
    } : null },
    { name: 'Articles', table: 'articles', testInsert: {
      id: `test-${Date.now()}`,
      title: 'Test Article',
      content: 'Test content',
      published: true
    }}
  ]

  let successCount = 0
  let failCount = 0
  const insertedIds: { table: string; id: any }[] = []

  for (const test of tests) {
    // Skip test if testInsert is null (no user available)
    if (test.testInsert === null) {
      console.log(`\n📋 Testing: ${test.name}`)
      console.log('-'.repeat(70))
      console.log('   ⏭️  SKIPPED: No user available for foreign key')
      continue
    }

    console.log(`\n📋 Testing: ${test.name}`)
    console.log('-'.repeat(70))

    try {
      // Test READ
      console.log('   📖 Testing READ...')
      const { data: readData, error: readError } = await supabase
        .from(test.table)
        .select('*')
        .limit(1)

      if (readError && readError.code === 'PGRST116') {
        console.log(`   ✅ READ OK (empty table)`)
      } else if (readError) {
        console.log(`   ❌ READ FAILED: ${readError.message}`)
        failCount++
        continue
      } else {
        console.log(`   ✅ READ OK (${readData?.length || 0} rows)`)
      }

      // Test INSERT
      console.log('   📝 Testing INSERT...')
      const { data: insertData, error: insertError } = await supabase
        .from(test.table)
        .insert(test.testInsert)
        .select()
        .single()

      if (insertError) {
        console.log(`   ⚠️  INSERT FAILED: ${insertError.message}`)
        console.log(`      Code: ${insertError.code}`)
        if (insertError.details) console.log(`      Details: ${insertError.details}`)
        failCount++
      } else {
        console.log(`   ✅ INSERT OK`)
        insertedIds.push({ table: test.table, id: insertData.id })
        successCount++
      }

    } catch (error: any) {
      console.log(`   ❌ UNEXPECTED ERROR: ${error.message}`)
      failCount++
    }
  }

  // Cleanup: Delete test data
  console.log('\n' + '='.repeat(70))
  console.log('🧹 Cleaning up test data...\n')

  for (const item of insertedIds) {
    try {
      await supabase.from(item.table).delete().eq('id', item.id)
      console.log(`   ✅ Deleted from ${item.table}`)
    } catch (error) {
      console.log(`   ⚠️  Failed to delete from ${item.table}`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('\n📊 TEST SUMMARY:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📈 Success Rate: ${Math.round((successCount / (successCount + failCount)) * 100)}%`)
  console.log('\n' + '='.repeat(70))

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Database is ready!')
    console.log('\n✨ Next steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Test adding videos in admin mode')
    console.log('   3. Test all CRUD operations')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
    console.log('   Run the FINAL-DATABASE-FIX.sql file first!')
  }
}

testAllAPIs()
