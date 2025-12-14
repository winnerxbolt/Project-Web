import { NextRequest, NextResponse } from 'next/server'
import { verifyOmisePayment } from '@/lib/server/paymentGateway'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPaymentReceipt } from '@/lib/server/emailService'

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
      await supabaseAdmin
        .from('payment_intents')
        .upsert(paymentIntent)

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
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      console.error('❌ Booking not found:', bookingId)
      return
    }

    // อัพเดท booking status
    await supabaseAdmin
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

    // บันทึกลง payments
    const payment = {
      booking_id: bookingId,
      method: paymentIntent.paymentMethod,
      provider: paymentIntent.provider,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'confirmed',
      transaction_id: paymentIntent.chargeId,
      receipt_url: paymentIntent.receiptUrl,
      confirmed_at: new Date().toISOString(),
    }
    
    const { data: insertedPayment } = await supabaseAdmin
      .from('payments')
      .insert(payment)
      .select()
      .single()

    console.log(`✅ Booking #${bookingId} auto-confirmed! Payment: ${paymentIntent.amount} ${paymentIntent.currency}`)

    // Send payment receipt email
    if (booking.email) {
      try {
        await sendPaymentReceipt(insertedPayment, booking)
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
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'pending',
        payment_error: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    console.log(`❌ Booking #${bookingId} payment failed: ${errorMessage}`)
  } catch (error) {
    console.error('Error failing booking:', error)
  }
}
