import { NextRequest, NextResponse } from 'next/server'
import { readJson } from '@/lib/server/db'
import { sendCheckInReminder } from '@/lib/server/emailService'

const BOOKINGS_FILE = 'data/bookings.json'

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

    // ดึง bookings ที่ confirmed และ check-in พรุ่งนี้
    const bookings = (await readJson<any[]>(BOOKINGS_FILE)) || []
    const tomorrowBookings = bookings.filter(booking => {
      if (booking.status !== 'confirmed') return false
      if (!booking.email) return false

      const checkInDate = new Date(booking.checkIn)
      checkInDate.setHours(0, 0, 0, 0)

      return checkInDate.getTime() === tomorrow.getTime()
    })

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
