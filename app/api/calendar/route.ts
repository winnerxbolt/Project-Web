import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { containsProfanity } from '@/lib/profanityFilter'
import fs from 'fs'
import path from 'path'

interface CalendarDay {
  roomId: number
  date: string // YYYY-MM-DD
  status: 'available' | 'booked' | 'pending' | 'holiday' | 'maintenance' | 'blackout'
  hasSpecialDiscount?: boolean
  discountAmount?: number // จำนวนเงินที่ลด
  discountReason?: string // เหตุผลการลด
  note?: string
  priceMultiplier?: number
  seasonalAdjustment?: number
  isBlackout?: boolean
  blackoutReason?: string
}

const CALENDAR_FILE = 'data/bookingCalendar.json'

// Helper function to check if date is blackout/holiday/maintenance
const checkBlackoutStatus = (date: string, roomId: number): Partial<CalendarDay> => {
  const result: Partial<CalendarDay> = {}
  
  try {
    // Check holidays
    const holidaysPath = path.join(process.cwd(), 'data', 'holidays.json')
    if (fs.existsSync(holidaysPath)) {
      const holidays = JSON.parse(fs.readFileSync(holidaysPath, 'utf-8'))
      const holiday = holidays.find((h: any) => h.date === date && h.isActive)
      if (holiday) {
        result.status = 'holiday'
        result.priceMultiplier = holiday.priceMultiplier
        result.note = `🎉 ${holiday.nameTh || holiday.name}`
        return result
      }
    }

    // Check maintenance
    const maintenancePath = path.join(process.cwd(), 'data', 'maintenance-schedule.json')
    if (fs.existsSync(maintenancePath)) {
      const maintenance = JSON.parse(fs.readFileSync(maintenancePath, 'utf-8'))
      const maint = maintenance.find((m: any) => {
        const dateObj = new Date(date)
        const startDate = new Date(m.startDate)
        const endDate = new Date(m.endDate)
        return dateObj >= startDate && dateObj <= endDate && 
               m.status !== 'cancelled' && 
               m.affectsBooking
      })
      if (maint) {
        result.status = 'maintenance'
        result.isBlackout = !maint.partialClosure
        result.blackoutReason = `🔧 ${maint.title}`
        result.note = maint.guestMessage || 'กำลังซ่อมบำรุง'
        return result
      }
    }

    // Check blackout dates
    const blackoutPath = path.join(process.cwd(), 'data', 'blackout-dates.json')
    if (fs.existsSync(blackoutPath)) {
      const blackouts = JSON.parse(fs.readFileSync(blackoutPath, 'utf-8'))
      const blackout = blackouts.find((b: any) => {
        const dateObj = new Date(date)
        const startDate = new Date(b.startDate)
        const endDate = new Date(b.endDate)
        return dateObj >= startDate && dateObj <= endDate && 
               b.status === 'active' &&
               (!b.roomIds || b.roomIds.length === 0 || b.roomIds.includes(roomId))
      })
      if (blackout) {
        result.status = blackout.allowBooking ? 'available' : 'blackout'
        result.isBlackout = !blackout.allowBooking
        result.blackoutReason = blackout.title
        result.note = blackout.description
        if (blackout.priceAdjustment?.enabled) {
          result.priceMultiplier = blackout.priceAdjustment.value
        }
        return result
      }
    }

    // Check seasonal pricing
    const seasonalPath = path.join(process.cwd(), 'data', 'seasonal-pricing.json')
    if (fs.existsSync(seasonalPath)) {
      const seasons = JSON.parse(fs.readFileSync(seasonalPath, 'utf-8'))
      const season = seasons.find((s: any) => {
        const dateObj = new Date(date)
        const startDate = new Date(s.startDate)
        const endDate = new Date(s.endDate)
        return dateObj >= startDate && dateObj <= endDate && s.isActive
      })
      if (season) {
        result.seasonalAdjustment = season.baseAdjustment
        result.hasSpecialDiscount = season.baseAdjustment < 0
        if (season.badge) {
          result.note = season.badge
        }
      }
    }

  } catch (error) {
    console.error('Error checking blackout status:', error)
  }
  
  return result
}

// GET - ดึงข้อมูลปฏิทินตามห้องและเดือน
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    
    let calendar = await readJson<CalendarDay[]>(CALENDAR_FILE) || []
    
    // Filter by roomId if provided
    if (roomId) {
      calendar = calendar.filter(day => day.roomId === parseInt(roomId))
    }
    
    // Filter by year and month if provided
    if (year && month) {
      const targetYearMonth = `${year}-${month.padStart(2, '0')}`
      calendar = calendar.filter(day => day.date.startsWith(targetYearMonth))
      
      // For each day in the month, check blackout/holiday/maintenance status
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
      const enrichedCalendar: CalendarDay[] = []
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const existingDay = calendar.find(d => d.date === dateStr)
        const blackoutStatus = checkBlackoutStatus(dateStr, parseInt(roomId || '0'))
        
        if (existingDay) {
          // Merge existing with blackout status
          enrichedCalendar.push({
            ...existingDay,
            ...blackoutStatus,
            // Keep booked/pending status if already set
            status: existingDay.status === 'booked' || existingDay.status === 'pending' 
              ? existingDay.status 
              : blackoutStatus.status || existingDay.status
          })
        } else if (Object.keys(blackoutStatus).length > 0) {
          // Create new day with blackout status
          enrichedCalendar.push({
            roomId: parseInt(roomId || '0'),
            date: dateStr,
            status: blackoutStatus.status || 'available',
            ...blackoutStatus
          })
        }
      }
      
      calendar = enrichedCalendar
    }
    
    return NextResponse.json({ success: true, calendar })
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถดึงข้อมูลปฏิทินได้' }, { status: 500 })
  }
}

// POST - สร้าง/อัปเดตสถานะวันในปฏิทิน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, date, status, hasSpecialDiscount, discountAmount, discountReason, note } = body
    
    if (!roomId || !date || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'กรุณาระบุ roomId, date และ status' 
      }, { status: 400 })
    }

    // Check for profanity in discount reason and note
    if (discountReason && containsProfanity(discountReason)) {
      return NextResponse.json({ 
        success: false, 
        error: 'เหตุผลการลดราคามีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' 
      }, { status: 400 })
    }
    if (note && containsProfanity(note)) {
      return NextResponse.json({ 
        success: false, 
        error: 'หมายเหตุมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' 
      }, { status: 400 })
    }
    
    let calendar = await readJson<CalendarDay[]>(CALENDAR_FILE) || []
    
    // หาว่ามีวันนี้อยู่แล้วหรือไม่
    const existingIndex = calendar.findIndex(
      day => day.roomId === roomId && day.date === date
    )
    
    const calendarDay: CalendarDay = {
      roomId,
      date,
      status,
      hasSpecialDiscount: hasSpecialDiscount || false,
      discountAmount: discountAmount || undefined,
      discountReason: discountReason || undefined,
      note: note || ''
    }
    
    if (existingIndex >= 0) {
      // อัปเดตวันที่มีอยู่
      calendar[existingIndex] = calendarDay
    } else {
      // เพิ่มวันใหม่
      calendar.push(calendarDay)
    }
    
    await writeJson(CALENDAR_FILE, calendar)
    
    return NextResponse.json({ success: true, calendar: calendarDay })
  } catch (error) {
    console.error('Error updating calendar:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถอัปเดตปฏิทินได้' }, { status: 500 })
  }
}

// PUT - อัปเดตหลายวันพร้อมกัน (สำหรับการจองช่วงวันที่)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, startDate, endDate, status, note } = body
    
    if (!roomId || !startDate || !endDate || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'กรุณาระบุ roomId, startDate, endDate และ status' 
      }, { status: 400 })
    }
    
    let calendar = await readJson<CalendarDay[]>(CALENDAR_FILE) || []
    
    // สร้างรายการวันที่ทั้งหมดในช่วง
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: string[] = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }
    
    // อัปเดตแต่ละวัน
    dates.forEach(date => {
      const existingIndex = calendar.findIndex(
        day => day.roomId === roomId && day.date === date
      )
      
      const calendarDay: CalendarDay = {
        roomId,
        date,
        status,
        note: note || ''
      }
      
      if (existingIndex >= 0) {
        calendar[existingIndex] = calendarDay
      } else {
        calendar.push(calendarDay)
      }
    })
    
    await writeJson(CALENDAR_FILE, calendar)
    
    return NextResponse.json({ success: true, updatedDates: dates })
  } catch (error) {
    console.error('Error updating calendar range:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถอัปเดตปฏิทินได้' }, { status: 500 })
  }
}

// DELETE - ลบสถานะวัน (กลับเป็น available)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, date, startDate, endDate } = body
    
    let calendar = await readJson<CalendarDay[]>(CALENDAR_FILE) || []
    
    // ถ้าส่ง startDate และ endDate มา = ลบช่วงวันที่
    if (roomId && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const dates: string[] = []
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }
      
      // ลบทุกวันในช่วง
      calendar = calendar.filter(
        day => !(day.roomId === roomId && dates.includes(day.date))
      )
      
      await writeJson(CALENDAR_FILE, calendar)
      return NextResponse.json({ success: true, deletedDates: dates })
    }
    
    // ถ้าส่งเฉพาะ date = ลบวันเดียว
    if (roomId && date) {
      calendar = calendar.filter(
        day => !(day.roomId === roomId && day.date === date)
      )
      
      await writeJson(CALENDAR_FILE, calendar)
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'กรุณาระบุ roomId และ date หรือ startDate/endDate' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error deleting calendar day:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถลบข้อมูลปฏิทินได้' }, { status: 500 })
  }
}
