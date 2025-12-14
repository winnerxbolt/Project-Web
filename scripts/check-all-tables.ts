// Check ALL database tables and their columns
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const tables = [
  'users',
  'rooms', 
  'bookings',
  'reviews',
  'articles',
  'videos',
  'coupons',
  'seasonal_pricing',
  'insurance_plans',
  'booking_insurances',
  'chat_messages',
  'notifications',
  'email_campaigns',
  'email_subscribers',
  'social_shares',
  'gallery_images',
  'gallery_videos',
  'gallery_vr_tours',
  'gallery_drone_shots'
]

async function checkAllTables() {
  console.log('🔍 Checking ALL database tables...\n')
  console.log('='.repeat(60))

  for (const tableName of tables) {
    console.log(`\n📋 Table: ${tableName}`)
    console.log('-'.repeat(60))
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`❌ Error: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      if (error.code === '42P01') {
        console.log(`   ⚠️  Table "${tableName}" does NOT exist!`)
      }
    } else if (data && data.length > 0) {
      console.log(`✅ Exists with data (${data.length} sample)`)
      console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`)
    } else {
      console.log(`✅ Exists but EMPTY`)
      // Try to get structure by checking error on insert
      const { error: structError } = await supabase
        .from(tableName)
        .insert({})
        .select()
      
      if (structError) {
        console.log(`   Structure check: ${structError.message}`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Table check completed!')
}

checkAllTables()
