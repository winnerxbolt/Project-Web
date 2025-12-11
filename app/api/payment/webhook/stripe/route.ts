import { NextRequest, NextResponse } from 'next/server'
import { verifyStripePayment } from '@/lib/server/paymentGateway'
import { readJson, writeJson } from '@/lib/server/db'

const PAYMENT_INTENTS_FILE = 'data/payment-intents.json'
const BOOKINGS_FILE = 'data/bookings.json'
const PAYMENTS_FILE = 'data/payments.json'

/**
 * POST /api/payment/webhook/stripe
 * Webhook สำหรับรับ notification จาก Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 Stripe Webhook received:', body.type)

    // Verify webhook signature (TODO: Implement in production)
    // const signature = request.headers.get('stripe-signature')
    // TODO: Verify signature with Stripe.webhooks.constructEvent() for production

    // Handle different event types
    if (body.type === 'payment_intent.succeeded') {
      const paymentIntentId = body.data.object.id
      const paymentIntent = await verifyStripePayment(paymentIntentId)

      if (!paymentIntent) {
        console.error('❌ Payment intent not found:', paymentIntentId)
        return NextResponse.json({ received: true })
      }

      // อัพเดท Payment Intent
      const paymentIntents = (await readJson<any[]>(PAYMENT_INTENTS_FILE)) || []
      const index = paymentIntents.findIndex(p => p.id === paymentIntent.id)
      if (index !== -1) {
        paymentIntents[index] = paymentIntent
        await writeJson(PAYMENT_INTENTS_FILE, paymentIntents)
      }

      // Auto-confirm booking
      await confirmBooking(paymentIntent.bookingId, paymentIntent)
    }

    if (body.type === 'payment_intent.payment_failed') {
      const paymentIntentId = body.data.object.id
      const paymentIntent = await verifyStripePayment(paymentIntentId)

      if (paymentIntent) {
        await failBooking(paymentIntent.bookingId, paymentIntent.errorMessage)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function confirmBooking(bookingId: number, paymentIntent: any) {
  try {
    const bookings = (await readJson<any[]>(BOOKINGS_FILE)) || []
    const bookingIndex = bookings.findIndex(b => b.id === bookingId)

    if (bookingIndex === -1) {
      console.error('❌ Booking not found:', bookingId)
      return
    }

    const booking = bookings[bookingIndex]

    booking.status = 'confirmed'
    booking.confirmedAt = new Date().toISOString()
    booking.paymentMethod = 'online_payment'
    booking.paymentProvider = paymentIntent.provider
    booking.paymentIntentId = paymentIntent.id
    booking.paidAmount = paymentIntent.amount
    booking.updatedAt = new Date().toISOString()

    await writeJson(BOOKINGS_FILE, bookings)

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
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    }
    payments.push(payment)
    await writeJson(PAYMENTS_FILE, payments)

    console.log(`✅ Booking #${bookingId} auto-confirmed via Stripe!`)
  } catch (error) {
    console.error('Error confirming booking:', error)
  }
}

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

    console.log(`❌ Booking #${bookingId} payment failed via Stripe`)
  } catch (error) {
    console.error('Error failing booking:', error)
  }
}
