import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { containsProfanity } from '@/lib/profanityFilter'

const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')

// Helper function to read bookings
async function getBookings() {
  try {
    const data = await readFile(bookingsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading bookings:', error)
    return []
  }
}

// Helper function to write bookings
async function saveBookings(bookings: any[]) {
  try {
    await writeFile(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error saving bookings:', error)
    return false
  }
}

// GET - Fetch all bookings
export async function GET() {
  try {
    const bookings = await getBookings()
    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, roomName, guestName, checkIn, checkOut, guests, total, email, phone, slipImage, status } = body

    // Validate required fields
    if (!roomName || !guestName || !checkIn || !checkOut || !guests || !total) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for profanity
    if (containsProfanity(guestName)) {
      return NextResponse.json(
        { success: false, error: 'ชื่อผู้เข้าพักมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }
    if (email && containsProfanity(email)) {
      return NextResponse.json(
        { success: false, error: 'อีเมลมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }

    const bookings = await getBookings()
    
    // Generate new ID
    const newId = bookings.length > 0 ? Math.max(...bookings.map((b: any) => b.id)) + 1 : 1

    const newBooking = {
      id: newId,
      roomId: roomId || null,
      roomName,
      guestName,
      checkIn,
      checkOut,
      guests: Number(guests),
      status: status || 'pending',
      total: Number(total),
      slipImage: slipImage || null,
      email: email || null,
      phone: phone || null,
      createdAt: new Date().toISOString()
    }

    bookings.push(newBooking)
    const saved = await saveBookings(bookings)

    if (saved) {
      // อัปเดตสถานะปฏิทินเป็น pending เมื่อมีการจอง
      if (roomId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: roomId,
              startDate: checkIn,
              endDate: checkOut,
              status: 'pending',
              note: `จองโดย ${guestName} (รอยืนยัน)`
            })
          })
        } catch (error) {
          console.error('Error updating calendar:', error)
        }
      }
      
      return NextResponse.json({ success: true, booking: newBooking })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save booking' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing booking
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, roomName, guestName, checkIn, checkOut, guests, total, email, phone, slipImage, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const bookings = await getBookings()
    const bookingIndex = bookings.findIndex((b: any) => b.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking data
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      roomName: roomName || bookings[bookingIndex].roomName,
      guestName: guestName || bookings[bookingIndex].guestName,
      checkIn: checkIn || bookings[bookingIndex].checkIn,
      checkOut: checkOut || bookings[bookingIndex].checkOut,
      guests: guests !== undefined ? Number(guests) : bookings[bookingIndex].guests,
      total: total !== undefined ? Number(total) : bookings[bookingIndex].total,
      email: email !== undefined ? email : bookings[bookingIndex].email,
      phone: phone !== undefined ? phone : bookings[bookingIndex].phone,
      slipImage: slipImage !== undefined ? slipImage : bookings[bookingIndex].slipImage,
      status: status || bookings[bookingIndex].status,
      updatedAt: new Date().toISOString()
    }

    const saved = await saveBookings(bookings)

    if (saved) {
      // อัปเดตสถานะปฏิทินเมื่อยืนยันการจอง
      if (status === 'confirmed') {
        const booking = bookings[bookingIndex]
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: booking.roomId,
              startDate: booking.checkIn,
              endDate: booking.checkOut,
              status: 'booked',
              note: `จองโดย ${booking.guestName}`
            })
          })
        } catch (error) {
          console.error('Error updating calendar:', error)
        }
      }
      
      return NextResponse.json({ success: true, booking: bookings[bookingIndex] })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const bookings = await getBookings()
    
    // หา booking ที่จะลบ
    const bookingToDelete = bookings.find((b: any) => b.id === Number(id))
    
    if (!bookingToDelete) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    const filteredBookings = bookings.filter((b: any) => b.id !== Number(id))
    const saved = await saveBookings(filteredBookings)

    if (saved) {
      // ลบสถานะออกจากปฏิทินด้วย
      if (bookingToDelete.roomId && bookingToDelete.checkIn && bookingToDelete.checkOut) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: bookingToDelete.roomId,
              startDate: bookingToDelete.checkIn,
              endDate: bookingToDelete.checkOut
            })
          })
        } catch (error) {
          console.error('Error clearing calendar:', error)
        }
      }
      
      return NextResponse.json({ success: true, message: 'Booking deleted successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
