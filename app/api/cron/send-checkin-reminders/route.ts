import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendCheckInReminder } from '@/lib/server/emailService'

/**
 * GET /api/cron/send-checkin-reminders
 * Cron job ที่ทำงานทุกวันเวลา 14:00
 * ส่ง check-in reminder email ให้กับผู้เข้าพักที่จะ check-in พรุ่งนี้
 * 
 * Vercel Cron: 0 14 * * * (ทุกวันเวลา 14:00 UTC+7)
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authorization (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // คำนวณวันที่พรุ่งนี้
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowStr = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD

    console.log(`🔍 Checking bookings for check-in on ${tomorrowStr}...`)

    // ดึง bookings ที่ confirmed และ check-in พรุ่งนี้ จาก Supabase
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .gte('check_in', tomorrowStr)
      .lt('check_in', `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate() + 1).padStart(2, '0')}`)
      .not('email', 'is', null)
    
    const tomorrowBookings = bookings || []

    console.log(`📧 Found ${tomorrowBookings.length} bookings for tomorrow`)

    let sent = 0
    let failed = 0

    // ส่ง email แต่ละ booking
    for (const booking of tomorrowBookings) {
      try {
        await sendCheckInReminder(booking)
        sent++
        console.log(`✅ Check-in reminder sent to ${booking.email} (Booking #${booking.id})`)
      } catch (error: any) {
        failed++
        console.error(`❌ Failed to send reminder for booking #${booking.id}:`, error.message)
      }
    }

    const result = {
      success: true,
      checkInDate: tomorrowStr,
      total: tomorrowBookings.length,
      sent,
      failed,
      timestamp: new Date().toISOString(),
    }

    console.log('📊 Check-in reminders result:', result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Error in check-in reminders cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Manual trigger (for testing)
 */
export async function POST(request: NextRequest) {
  return GET(request)
}
