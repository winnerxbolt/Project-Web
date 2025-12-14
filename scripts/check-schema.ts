// Check Supabase schema
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkSchema() {
  console.log('🔍 Checking database schema...\n')

  // Check bookings table
  console.log('📋 Checking bookings table...')
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .limit(1)
  
  if (bookings && bookings.length > 0) {
    console.log('Columns:', Object.keys(bookings[0]))
  } else if (bookingsError) {
    console.log('Error:', bookingsError.message)
  } else {
    console.log('No data found - table might be empty')
  }

  // Check rooms table
  console.log('\n📋 Checking rooms table...')
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .limit(1)
  
  if (rooms && rooms.length > 0) {
    console.log('Columns:', Object.keys(rooms[0]))
    console.log('Sample data:', rooms[0])
  }

  // Check reviews table  
  console.log('\n📋 Checking reviews table...')
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .limit(1)
  
  if (reviews && reviews.length > 0) {
    console.log('Columns:', Object.keys(reviews[0]))
  } else if (reviewsError) {
    console.log('Error:', reviewsError.message)
  } else {
    console.log('No data found')
  }

  // Check users table
  console.log('\n📋 Checking users table...')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  if (users && users.length > 0) {
    console.log('Columns:', Object.keys(users[0]))
  } else if (usersError) {
    console.log('Error:', usersError.message)
  } else {
    console.log('No data found')
  }

  // Check articles table
  console.log('\n📋 Checking articles table...')
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('*')
    .limit(1)
  
  if (articles && articles.length > 0) {
    console.log('Columns:', Object.keys(articles[0]))
  } else if (articlesError) {
    console.log('Error:', articlesError.message)
  } else {
    console.log('No data found')
  }
}

checkSchema()
