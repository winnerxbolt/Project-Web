import { NextRequest, NextResponse } from 'next/server'
import { verifyOmisePayment } from '@/lib/server/paymentGateway'
import { readJson, writeJson } from '@/lib/server/db'
import { sendPaymentReceipt } from '@/lib/server/emailService'

const PAYMENT_INTENTS_FILE = 'data/payment-intents.json'
const BOOKINGS_FILE = 'data/bookings.json'
const PAYMENTS_FILE = 'data/payments.json'

/**
 * POST /api/payment/webhook/omise
 * Webhook สำหรับรับ notification จาก Omise
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 Omise Webhook received:', body.key)

    // Verify webhook signature (TODO: Implement in production)
    // const signature = request.headers.get('x-omise-signature')
    // TODO: Verify signature to ensure request is from Omise
    
    // Handle different event types
    if (body.key.startsWith('charge')) {
      const chargeId = body.data.id
      const paymentIntent = await verifyOmisePayment(chargeId)

      if (!paymentIntent) {
        console.error('❌ Payment intent not found for charge:', chargeId)
        return NextResponse.json({ received: true })
      }

      // อัพเดท Payment Intent
      const paymentIntents = (await readJson<any[]>(PAYMENT_INTENTS_FILE)) || []
      const index = paymentIntents.findIndex(p => p.id === paymentIntent.id)
      if (index !== -1) {
        paymentIntents[index] = paymentIntent
        await writeJson(PAYMENT_INTENTS_FILE, paymentIntents)
      }

      // ถ้าชำระเงินสำเร็จ → Auto-confirm booking
      if (paymentIntent.status === 'succeeded') {
        await confirmBooking(paymentIntent.bookingId, paymentIntent)
      }

      // ถ้าชำระเงินล้มเหลว → Update booking status
      if (paymentIntent.status === 'failed') {
        await failBooking(paymentIntent.bookingId, paymentIntent.errorMessage)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Omise webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * ยืนยัน Booking อัตโนมัติเมื่อชำระเงินสำเร็จ
 */
async function confirmBooking(bookingId: number, paymentIntent: any) {
  try {
    const bookings = (await readJson<any[]>(BOOKINGS_FILE)) || []
    const bookingIndex = bookings.findIndex(b => b.id === bookingId)

    if (bookingIndex === -1) {
      console.error('❌ Booking not found:', bookingId)
      return
    }

    const booking = bookings[bookingIndex]

    // อัพเดท booking status
    booking.status = 'confirmed'
    booking.confirmedAt = new Date().toISOString()
    booking.paymentMethod = 'online_payment'
    booking.paymentProvider = paymentIntent.provider
    booking.paymentIntentId = paymentIntent.id
    booking.paidAmount = paymentIntent.amount
    booking.updatedAt = new Date().toISOString()

    await writeJson(BOOKINGS_FILE, bookings)

    // บันทึกลง payments
    const payments = (await readJson<any[]>(PAYMENTS_FILE)) || []
    const payment = {
      id: payments.length > 0 ? Math.max(...payments.map((p: any) => p.id)) + 1 : 1,
      bookingId,
      method: paymentIntent.paymentMethod,
      provider: paymentIntent.provider,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'confirmed',
      transactionId: paymentIntent.chargeId,
      receiptUrl: paymentIntent.receiptUrl,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    }
    payments.push(payment)
    await writeJson(PAYMENTS_FILE, payments)

    console.log(`✅ Booking #${bookingId} auto-confirmed! Payment: ${paymentIntent.amount} ${paymentIntent.currency}`)

    // Send payment receipt email
    if (booking.email) {
      try {
        await sendPaymentReceipt(payment, booking)
        console.log('✅ Payment receipt email sent to:', booking.email)
      } catch (emailError) {
        console.error('❌ Failed to send payment receipt email:', emailError)
      }
    }

    // TODO: ส่ง SMS confirmation
    // TODO: อัพเดท calendar

  } catch (error) {
    console.error('Error confirming booking:', error)
  }
}

/**
 * Update booking status เมื่อชำระเงินล้มเหลว
 */
async function failBooking(bookingId: number, errorMessage?: string) {
  try {
    const bookings = (await readJson<any[]>(BOOKINGS_FILE)) || []
    const bookingIndex = bookings.findIndex(b => b.id === bookingId)

    if (bookingIndex === -1) {
      return
    }

    bookings[bookingIndex].status = 'pending'
    bookings[bookingIndex].paymentError = errorMessage
    bookings[bookingIndex].updatedAt = new Date().toISOString()

    await writeJson(BOOKINGS_FILE, bookings)

    console.log(`❌ Booking #${bookingId} payment failed: ${errorMessage}`)
  } catch (error) {
    console.error('Error failing booking:', error)
  }
}
