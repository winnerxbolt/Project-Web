import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - ตรวจสอบความพร้อมของห้องในช่วงวันที่
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!roomId || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'กรุณาระบุ roomId, startDate และ endDate'
      }, { status: 400 })
    }

    // Check bookings in date range
    const { data: bookings } = await supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('room_id', roomId)
      .in('status', ['confirmed', 'pending'])
      .or(`check_in.lte.${endDate},check_out.gte.${startDate}`)

    // Create date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    // Check unavailable dates from bookings
    const unavailableDates: string[] = []
    
    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        const bookingStart = new Date(booking.check_in)
        const bookingEnd = new Date(booking.check_out)
        
        for (const date of dates) {
          const currentDate = new Date(date)
          if (currentDate >= bookingStart && currentDate < bookingEnd) {
            unavailableDates.push(date)
          }
        }
      }
    }

    // Check for special pricing/discounts
    const { data: seasonalPricing } = await supabase
      .from('seasonal_pricing')
      .select('*')
      .lte('start_date', endDate)
      .gte('end_date', startDate)
      .eq('is_active', true)

    const discounts: { date: string; amount: number; reason: string }[] = []
    let totalDiscount = 0

    if (seasonalPricing && seasonalPricing.length > 0) {
      for (const pricing of seasonalPricing) {
        const discount = pricing.base_adjustment || 0
        if (discount < 0) {
          discounts.push({
            date: pricing.start_date,
            amount: Math.abs(discount),
            reason: pricing.season_name || 'Special discount'
          })
          totalDiscount += Math.abs(discount)
        }
      }
    }

    return NextResponse.json({
      success: true,
      available: unavailableDates.length === 0,
      unavailableDates: [...new Set(unavailableDates)],
      discounts,
      totalDiscount,
      totalNights: dates.length
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบความพร้อม'
    }, { status: 500 })
  }
}
