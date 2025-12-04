import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')
const roomsFilePath = path.join(process.cwd(), 'data', 'rooms.json')
const calendarFilePath = path.join(process.cwd(), 'data', 'bookingCalendar.json')

interface Booking {
  id: number
  roomId: number | null
  roomName: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
  total: number
  slipImage: string | null
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt?: string
}

interface Room {
  id: number
  name: string
  available: boolean
  [key: string]: any
}

interface CalendarDay {
  roomId: number
  date: string
  status: string
  hasSpecialDiscount?: boolean
  note?: string
}

export async function processAutoCheckout() {
  try {
    console.log('🔄 Running auto-checkout process...')
    
    // อ่านข้อมูล bookings
    const bookingsData = await readFile(bookingsFilePath, 'utf-8')
    const bookings: Booking[] = JSON.parse(bookingsData)
    
    // อ่านข้อมูล rooms
    const roomsData = await readFile(roomsFilePath, 'utf-8')
    const rooms: Room[] = JSON.parse(roomsData)
    
    // อ่านข้อมูล calendar
    const calendarData = await readFile(calendarFilePath, 'utf-8')
    let calendar: CalendarDay[] = JSON.parse(calendarData)
    
    // วันที่ปัจจุบัน (local time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayString = formatLocalDate(today)
    
    let hasChanges = false
    
    // ตรวจสอบแต่ละ booking
    for (const booking of bookings) {
      if (booking.status === 'confirmed' && booking.checkOut && booking.roomId) {
        const checkOutDate = new Date(booking.checkOut)
        checkOutDate.setHours(0, 0, 0, 0)
        
        // ถ้าถึงหรือเกินวันเช็คเอาต์แล้ว
        if (today >= checkOutDate) {
          console.log(`✅ Auto-checkout: Booking #${booking.id} (${booking.guestName}) - Room ${booking.roomName}`)
          
          // 1. อัปเดตสถานะ booking เป็น 'completed'
          booking.status = 'completed'
          booking.updatedAt = new Date().toISOString()
          
          // 2. อัปเดตสถานะห้องเป็น available
          const roomIndex = rooms.findIndex(r => r.id === booking.roomId)
          if (roomIndex !== -1) {
            rooms[roomIndex].available = true
            console.log(`  📍 Room ${rooms[roomIndex].name} is now available`)
          }
          
          // 3. ลบสถานะจากปฏิทิน (วันที่ checkOut เป็นต้นไป)
          calendar = calendar.filter(day => {
            if (day.roomId === booking.roomId) {
              const dayDate = new Date(day.date)
              dayDate.setHours(0, 0, 0, 0)
              
              // ลบวันที่ >= checkOut และเป็นวันจองของลูกค้าคนนี้
              if (dayDate >= checkOutDate && (day.status === 'booked' || day.status === 'pending')) {
                console.log(`  🗓️  Cleared calendar: ${day.date}`)
                return false // ลบออก
              }
            }
            return true // เก็บไว้
          })
          
          hasChanges = true
        }
      }
    }
    
    // บันทึกข้อมูลที่เปลี่ยนแปลง
    if (hasChanges) {
      await writeFile(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf-8')
      await writeFile(roomsFilePath, JSON.stringify(rooms, null, 2), 'utf-8')
      await writeFile(calendarFilePath, JSON.stringify(calendar, null, 2), 'utf-8')
      console.log('✅ Auto-checkout completed successfully!')
      return { success: true, message: 'Auto-checkout processed' }
    } else {
      console.log('ℹ️  No bookings need auto-checkout')
      return { success: true, message: 'No changes needed' }
    }
    
  } catch (error) {
    console.error('❌ Error in auto-checkout:', error)
    return { success: false, error: 'Auto-checkout failed' }
  }
}

// Helper: แปลง Date เป็น YYYY-MM-DD (local time)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
