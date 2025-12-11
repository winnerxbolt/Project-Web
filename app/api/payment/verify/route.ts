import { NextRequest, NextResponse } from 'next/server'
import { verifyOmisePayment, verifyStripePayment } from '@/lib/server/paymentGateway'
import { addSecurityHeaders } from '@/lib/security/headers'

/**
 * GET /api/payment/verify?paymentIntentId=xxx&provider=omise
 * ตรวจสอบสถานะการชำระเงิน
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('paymentIntentId')
    const provider = searchParams.get('provider') as 'omise' | 'stripe'

    if (!paymentIntentId || !provider) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Missing required parameters' },
          { status: 400 }
        )
      )
    }

    let paymentIntent
    if (provider === 'omise') {
      paymentIntent = await verifyOmisePayment(paymentIntentId)
    } else if (provider === 'stripe') {
      paymentIntent = await verifyStripePayment(paymentIntentId)
    } else {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid provider' },
          { status: 400 }
        )
      )
    }

    if (!paymentIntent) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Payment intent not found' },
          { status: 404 }
        )
      )
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        paymentIntent,
      })
    )
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return addSecurityHeaders(
      NextResponse.json(
        { error: error.message || 'An error occurred' },
        { status: 500 }
      )
    )
  }
}
