import { NextRequest, NextResponse } from 'next/server'
import { verifyStripePayment } from '@/lib/server/paymentGateway'
import { supabaseAdmin } from '@/lib/supabase'

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

      // อัพเดท Payment Intent to database
      await supabaseAdmin
        .from('payment_intents')
        .upsert({
          id: paymentIntent.id,
          booking_id: paymentIntent.bookingId,
          provider: paymentIntent.provider,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
        })

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
    // Update booking
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        payment_method: 'online_payment',
        payment_provider: paymentIntent.provider,
        payment_intent_id: paymentIntent.id,
        paid_amount: paymentIntent.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    // Create payment record
    await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: bookingId,
        method: paymentIntent.paymentMethod,
        provider: paymentIntent.provider,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'confirmed',
        transaction_id: paymentIntent.chargeId,
        confirmed_at: new Date().toISOString(),
      })

    console.log(`✅ Booking #${bookingId} auto-confirmed via Stripe!`)
  } catch (error) {
    console.error('Error confirming booking:', error)
  }
}

async function failBooking(bookingId: number, errorMessage?: string) {
  try {
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'pending',
        payment_error: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    console.log(`❌ Booking #${bookingId} payment failed via Stripe`)
  } catch (error) {
    console.error('Error failing booking:', error)
  }
}
