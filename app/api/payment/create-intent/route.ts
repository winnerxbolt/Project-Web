import { NextResponse } from 'next/server'
import { createOmisePayment, createStripePayment, PaymentMethod } from '@/lib/server/paymentGateway'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { checkMutationRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'
import { addSecurityHeaders, getRateLimitHeaders } from '@/lib/security/headers'

/**
 * POST /api/payment/create-intent
 * สร้าง Payment Intent สำหรับชำระเงิน
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = checkMutationRateLimit(clientId)
    
    if (rateLimit.limited) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
      const rateLimitHeaders = getRateLimitHeaders(30, rateLimit.remaining, rateLimit.resetTime)
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return addSecurityHeaders(response)
    }

    const body = await request.json()
    const { 
      bookingId, 
      amount, 
      currency = 'THB', 
      provider = 'omise',
      paymentMethod = 'credit_card',
      customerEmail,
      customerName
    } = body

    // Validation
    if (!bookingId || !amount || !customerEmail || !customerName) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      )
    }

    if (amount <= 0) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid amount' },
          { status: 400 }
        )
      )
    }

    // ตรวจสอบว่า booking มีจริง
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      )
    }

    // เช็คว่า booking ยังไม่ได้ชำระเงิน
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Booking already paid' },
          { status: 400 }
        )
      )
    }

    // สร้าง Payment Intent ตาม provider
    let result
    if (provider === 'omise') {
      result = await createOmisePayment(
        amount,
        currency,
        bookingId,
        customerEmail,
        customerName,
        paymentMethod as PaymentMethod
      )
    } else if (provider === 'stripe') {
      result = await createStripePayment(
        amount,
        currency,
        bookingId,
        customerEmail,
        customerName
      )
    } else {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid payment provider' },
          { status: 400 }
        )
      )
    }

    if (!result.success) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: result.error || 'Payment creation failed' },
          { status: 500 }
        )
      )
    }

    // บันทึก Payment Intent
    await supabaseAdmin
      .from('payment_intents')
      .insert(result.paymentIntent)

    // อัพเดท booking status เป็น processing
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'processing',
        payment_intent_id: result.paymentIntent?.id,
        payment_provider: provider,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    console.log(`✅ Payment intent created: ${result.paymentIntent?.id} for booking #${bookingId}`)

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        paymentIntent: result.paymentIntent,
        requiresAction: result.requiresAction,
        actionUrl: result.actionUrl,
        qrCode: result.qrCode,
      })
    )
  } catch (error: any) {
    console.error('Create payment intent error:', error)
    return addSecurityHeaders(
      NextResponse.json(
        { error: error.message || 'An error occurred' },
        { status: 500 }
      )
    )
  }
}

/**
 * GET /api/payment/create-intent?bookingId=123
 * ดึงข้อมูล Payment Intent
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Booking ID required' },
          { status: 400 }
        )
      )
    }

    const { data: paymentIntent } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('booking_id', parseInt(bookingId))
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        paymentIntent: paymentIntent || null,
      })
    )
  } catch (error: any) {
    console.error('Get payment intent error:', error)
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'An error occurred' },
        { status: 500 }
      )
    )
  }
}
