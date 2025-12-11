import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const paymentsFilePath = path.join(process.cwd(), 'data', 'payments.json')
const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')

// Helper functions
async function getPayments() {
  try {
    const data = await readFile(paymentsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function savePayments(payments: any[]) {
  try {
    await writeFile(paymentsFilePath, JSON.stringify(payments, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error saving payments:', error)
    return false
  }
}

async function getBookings() {
  try {
    const data = await readFile(bookingsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveBookings(bookings: any[]) {
  try {
    await writeFile(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf-8')
    return true
  } catch (error) {
    return false
  }
}

// GET - Fetch all payments or by bookingId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    
    const payments = await getPayments()
    
    if (bookingId) {
      const payment = payments.find((p: any) => p.bookingId === Number(bookingId))
      return NextResponse.json({ success: true, payment })
    }
    
    return NextResponse.json({ success: true, payments })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST - Create payment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, method, amount, slipImage } = body

    if (!bookingId || !method || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const payments = await getPayments()
    
    const newPayment = {
      id: payments.length > 0 ? Math.max(...payments.map((p: any) => p.id)) + 1 : 1,
      bookingId: Number(bookingId),
      method, // 'promptpay', 'credit_card', 'bank_transfer'
      amount: Number(amount),
      status: 'pending', // 'pending', 'confirmed', 'failed'
      slipImage: slipImage || null,
      createdAt: new Date().toISOString(),
      confirmedAt: null,
      confirmedBy: null
    }

    payments.push(newPayment)
    await savePayments(payments)

    return NextResponse.json({ success: true, payment: newPayment })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// PUT - Update payment (confirm/reject by admin)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, confirmedBy } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const payments = await getPayments()
    const paymentIndex = payments.findIndex((p: any) => p.id === Number(id))

    if (paymentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    payments[paymentIndex] = {
      ...payments[paymentIndex],
      status,
      confirmedAt: status === 'confirmed' ? new Date().toISOString() : payments[paymentIndex].confirmedAt,
      confirmedBy: confirmedBy || payments[paymentIndex].confirmedBy
    }

    await savePayments(payments)

    // If payment confirmed, update booking status
    if (status === 'confirmed') {
      const bookings = await getBookings()
      const bookingIndex = bookings.findIndex((b: any) => b.id === payments[paymentIndex].bookingId)
      
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'confirmed'
        bookings[bookingIndex].updatedAt = new Date().toISOString()
        await saveBookings(bookings)

        // Send payment confirmation SMS
        const booking = bookings[bookingIndex]
        if (booking.phone) {
          try {
            const { sendPaymentConfirmationSMS } = await import('@/lib/server/smsService')
            await sendPaymentConfirmationSMS(booking, payments[paymentIndex])
            console.log('✅ Payment confirmation SMS sent')
          } catch (smsError) {
            console.error('❌ Failed to send payment SMS:', smsError)
          }
        }
      }
    }

    return NextResponse.json({ success: true, payment: payments[paymentIndex] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
