import { NextRequest, NextResponse } from 'next/server'
import { readJson } from '@/lib/server/db'

interface CalendarDay {
  roomId: number
  date: string
  status: 'available' | 'booked' | 'pending' | 'holiday' | 'maintenance'
  hasSpecialDiscount?: boolean
  discountAmount?: number
  discountReason?: string
  note?: string
}

const CALENDAR_FILE = 'data/bookingCalendar.json'

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

    const calendar = await readJson<CalendarDay[]>(CALENDAR_FILE) || []

    // สร้างรายการวันที่ทั้งหมดในช่วง
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    // ตรวจสอบแต่ละวัน
    const unavailableDates: string[] = []
    const discounts: { date: string; amount: number; reason: string }[] = []
    let totalDiscount = 0

    for (const date of dates) {
      const dayStatus = calendar.find(
        day => day.roomId === parseInt(roomId) && day.date === date
      )

      if (dayStatus) {
        // ตรวจสอบว่าวันนี้จองได้หรือไม่
        if (dayStatus.status === 'booked' || 
            dayStatus.status === 'pending' || 
            dayStatus.status === 'maintenance' || 
            dayStatus.status === 'holiday') {
          unavailableDates.push(date)
        }

        // เก็บข้อมูลส่วนลด
        if (dayStatus.hasSpecialDiscount && dayStatus.discountAmount) {
          discounts.push({
            date,
            amount: dayStatus.discountAmount,
            reason: dayStatus.discountReason || 'ไม่ระบุ'
          })
          totalDiscount += dayStatus.discountAmount
        }
      }
    }

    return NextResponse.json({
      success: true,
      available: unavailableDates.length === 0,
      unavailableDates,
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
