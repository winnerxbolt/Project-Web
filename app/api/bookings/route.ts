import { NextResponse } from 'next/server'
import { containsProfanity } from '@/lib/profanityFilter'
import { sendBookingConfirmation } from '@/lib/server/emailService'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all bookings
export async function GET() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, bookings: bookings || [] })
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

    const { data: newBooking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        room_id: roomId || null,
        room_name: roomName,
        guest_name: guestName,
        check_in: checkIn,
        check_out: checkOut,
        guests: Number(guests),
        status: status || 'pending',
        total: Number(total),
        slip_image: slipImage || null,
        email: email || null,
        phone: phone || null
      })
      .select()
      .single()
    
    if (error || !newBooking) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save booking' },
        { status: 500 }
      )
    }

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

    // Send booking confirmation email
    if (email) {
      try {
        await sendBookingConfirmation(newBooking)
        console.log('✅ Booking confirmation email sent to:', email)
      } catch (emailError) {
        console.error('❌ Failed to send booking confirmation email:', emailError)
        // Don't fail the booking if email fails
      }
    }

    // Send booking confirmation SMS
    if (phone) {
      try {
        const { sendBookingConfirmationSMS } = await import('@/lib/server/smsService')
        await sendBookingConfirmationSMS(newBooking)
        console.log('✅ Booking confirmation SMS sent to:', phone)
      } catch (smsError) {
        console.error('❌ Failed to send booking confirmation SMS:', smsError)
        // Don't fail the booking if SMS fails
      }
    }
    
    return NextResponse.json({ success: true, booking: newBooking })
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
    const { id, roomName, guestName, checkIn, checkOut, guests, total, email, phone, slipImage, status, cancelReason, refundAmount } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (roomName !== undefined) updates.room_name = roomName
    if (guestName !== undefined) updates.guest_name = guestName
    if (checkIn !== undefined) updates.check_in = checkIn
    if (checkOut !== undefined) updates.check_out = checkOut
    if (guests !== undefined) updates.guests = Number(guests)
    if (total !== undefined) updates.total = Number(total)
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (slipImage !== undefined) updates.slip_image = slipImage
    if (status !== undefined) updates.status = status
    if (cancelReason !== undefined) updates.cancel_reason = cancelReason
    if (refundAmount !== undefined) updates.refund_amount = Number(refundAmount)
    updates.updated_at = new Date().toISOString()

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }
      // อัปเดตสถานะปฏิทินเมื่อยืนยันการจอง
      if (status === 'confirmed') {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: updatedBooking.room_id,
              startDate: updatedBooking.check_in,
              endDate: updatedBooking.check_out,
              status: 'booked',
              note: `จองโดย ${updatedBooking.guest_name}`
            })
          })
        } catch (error) {
          console.error('Error updating calendar:', error)
        }

        // Send confirmation SMS
        if (updatedBooking.phone) {
          try {
            const { sendBookingConfirmationSMS } = await import('@/lib/server/smsService')
            await sendBookingConfirmationSMS(updatedBooking)
            console.log('✅ Booking confirmation SMS sent')
          } catch (smsError) {
            console.error('❌ Failed to send confirmation SMS:', smsError)
          }
        }
      }

      // Send cancellation SMS
      if (status === 'cancelled' && updatedBooking.phone) {
        try {
          const { sendBookingCancellationSMS } = await import('@/lib/server/smsService')
          await sendBookingCancellationSMS(updatedBooking, cancelReason)
          console.log('✅ Cancellation SMS sent')
        } catch (smsError) {
          console.error('❌ Failed to send cancellation SMS:', smsError)
        }
      }
      
      return NextResponse.json({ success: true, booking: updatedBooking })
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

    // Get booking before deleting for calendar cleanup
    const { data: bookingToDelete } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()
    
    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
        { status: 500 }
      )
    }

    // ลบสถานะออกจากปฏิทินด้วย
    if (bookingToDelete?.room_id && bookingToDelete.check_in && bookingToDelete.check_out) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: bookingToDelete.room_id,
            startDate: bookingToDelete.check_in,
            endDate: bookingToDelete.check_out
          })
        })
      } catch (error) {
        console.error('Error clearing calendar:', error)
      }
    }
    
    return NextResponse.json({ success: true, message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
