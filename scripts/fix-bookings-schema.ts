// Run SQL migration to fix bookings table
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixBookingsSchema() {
  console.log('🔧 Testing bookings table schema...\n')

  try {
    // Test by trying to insert with new columns
    console.log('🧪 Testing insert with all required columns...\n')
    
    const testData = {
      room_id: 1,
      room_name: 'Test Room',
      check_in: '2025-12-20',
      check_out: '2025-12-21',
      guests: 2,
      total: 3000,
      total_price: 3000,
      status: 'pending',
      guest_name: 'Test Guest',
      guest_email: 'test@example.com',
      guest_phone: '0800000000',
      slip_image: 'test.jpg'
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(testData)
      .select()

    if (error) {
      console.error('❌ Test insert failed:', error.message)
      console.log('   Code:', error.code)
      console.log('   Details:', error.details)
      console.log('\n⚠️  Missing columns detected!')
      console.log('\n📋 You need to add these columns in Supabase Dashboard:')
      console.log('\n1. Go to: https://supabase.com/dashboard/project/ffkzqihfaqscqnkhstnv/editor')
      console.log('2. Click on "bookings" table')
      console.log('3. Add these columns:\n')
      
      if (error.message.includes('room_name')) {
        console.log('   ✏️  room_name (type: text)')
      }
      if (error.message.includes('slip_image')) {
        console.log('   ✏️  slip_image (type: text)')
      }
      if (error.message.includes('total') && !error.message.includes('total_price')) {
        console.log('   ✏️  total (type: numeric)')
      }
      if (error.message.includes('phone')) {
        console.log('   ✏️  phone (type: text)')
      }
      
      console.log('\n📝 Or run this SQL in SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/ffkzqihfaqscqnkhstnv/sql/new\n')
      console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_name VARCHAR(255);')
      console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slip_image TEXT;')
      console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2);')
      
    } else {
      console.log('✅ Test insert successful!')
      console.log('   Booking ID:', data[0].id)
      console.log('   Room Name:', data[0].room_name)
      console.log('   Total:', data[0].total)
      
      // Clean up test data
      await supabase.from('bookings').delete().eq('id', data[0].id)
      console.log('\n✅ Cleaned up test data')
      console.log('\n🎉 Bookings table schema is correct!')
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

fixBookingsSchema()
