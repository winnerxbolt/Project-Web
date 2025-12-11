/**
 * Payment Gateway Library
 * รองรับ Omise (Thailand) และ Stripe (International)
 */

export type PaymentProvider = 'omise' | 'stripe' | 'manual'

export type PaymentMethod = 
  | 'credit_card'
  | 'promptpay'
  | 'truemoney'
  | 'alipay'
  | 'bank_transfer'
  | 'manual'

export interface PaymentIntent {
  id: string
  provider: PaymentProvider
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
  paymentMethod: PaymentMethod
  bookingId: number
  customerId: string
  customerEmail: string
  customerName: string
  metadata?: Record<string, any>
  createdAt: string
  expiresAt?: string
  chargeId?: string
  receiptUrl?: string
  errorMessage?: string
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: PaymentIntent
  error?: string
  requiresAction?: boolean
  actionUrl?: string
  qrCode?: string
}

/**
 * สร้าง Payment Intent สำหรับ Omise
 */
export async function createOmisePayment(
  amount: number,
  currency: string,
  bookingId: number,
  customerEmail: string,
  customerName: string,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> {
  try {
    const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY
    const OMISE_PUBLIC_KEY = process.env.OMISE_PUBLIC_KEY

    if (!OMISE_SECRET_KEY || !OMISE_PUBLIC_KEY) {
      throw new Error('Omise API keys not configured')
    }

    // สร้าง charge ผ่าน Omise API
    const response = await fetch('https://api.omise.co/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(OMISE_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // convert to smallest unit (satang)
        currency: currency.toLowerCase(),
        description: `Booking #${bookingId} - Pool Villa`,
        metadata: {
          bookingId: bookingId.toString(),
          customerEmail,
          customerName,
        },
        return_uri: `${process.env.NEXT_PUBLIC_APP_URL}/payment-callback`,
        // Payment method specific settings
        ...(paymentMethod === 'promptpay' && {
          source: { type: 'promptpay' }
        }),
        ...(paymentMethod === 'truemoney' && {
          source: { type: 'truemoney' }
        }),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Omise payment failed')
    }

    const paymentIntent: PaymentIntent = {
      id: data.id,
      provider: 'omise',
      amount,
      currency,
      status: mapOmiseStatus(data.status),
      paymentMethod,
      bookingId,
      customerId: data.customer || '',
      customerEmail,
      customerName,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      expiresAt: data.expires_at,
      chargeId: data.id,
      receiptUrl: data.receipt_url,
    }

    // PromptPay จะมี QR Code
    if (paymentMethod === 'promptpay' && data.source?.scannable_code?.image?.download_uri) {
      return {
        success: true,
        paymentIntent,
        requiresAction: true,
        qrCode: data.source.scannable_code.image.download_uri,
      }
    }

    // Payment methods อื่นๆ ที่ต้อง redirect
    if (data.authorize_uri) {
      return {
        success: true,
        paymentIntent,
        requiresAction: true,
        actionUrl: data.authorize_uri,
      }
    }

    return {
      success: true,
      paymentIntent,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment processing failed',
    }
  }
}

/**
 * สร้าง Payment Intent สำหรับ Stripe
 */
export async function createStripePayment(
  amount: number,
  currency: string,
  bookingId: number,
  customerEmail: string,
  customerName: string
): Promise<PaymentResult> {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe API key not configured')
    }

    // สร้าง Payment Intent ผ่าน Stripe API
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: (amount * 100).toString(),
        currency: currency.toLowerCase(),
        'metadata[bookingId]': bookingId.toString(),
        'metadata[customerEmail]': customerEmail,
        'metadata[customerName]': customerName,
        description: `Booking #${bookingId} - Pool Villa`,
        receipt_email: customerEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe payment failed')
    }

    const paymentIntent: PaymentIntent = {
      id: data.id,
      provider: 'stripe',
      amount,
      currency,
      status: mapStripeStatus(data.status),
      paymentMethod: 'credit_card',
      bookingId,
      customerId: data.customer || '',
      customerEmail,
      customerName,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      chargeId: data.latest_charge,
    }

    return {
      success: true,
      paymentIntent,
      requiresAction: data.status === 'requires_action',
      actionUrl: data.next_action?.redirect_to_url?.url,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment processing failed',
    }
  }
}

/**
 * ตรวจสอบสถานะ Payment จาก Omise
 */
export async function verifyOmisePayment(chargeId: string): Promise<PaymentIntent | null> {
  try {
    const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY

    if (!OMISE_SECRET_KEY) {
      throw new Error('Omise API key not configured')
    }

    const response = await fetch(`https://api.omise.co/charges/${chargeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(OMISE_SECRET_KEY + ':').toString('base64')}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return null
    }

    return {
      id: data.id,
      provider: 'omise',
      amount: data.amount / 100,
      currency: data.currency.toUpperCase(),
      status: mapOmiseStatus(data.status),
      paymentMethod: data.source?.type || 'credit_card',
      bookingId: parseInt(data.metadata?.bookingId || '0'),
      customerId: data.customer || '',
      customerEmail: data.metadata?.customerEmail || '',
      customerName: data.metadata?.customerName || '',
      metadata: data.metadata,
      createdAt: data.created_at,
      chargeId: data.id,
      receiptUrl: data.receipt_url,
      errorMessage: data.failure_message,
    }
  } catch (error) {
    console.error('Error verifying Omise payment:', error)
    return null
  }
}

/**
 * ตรวจสอบสถานะ Payment จาก Stripe
 */
export async function verifyStripePayment(paymentIntentId: string): Promise<PaymentIntent | null> {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe API key not configured')
    }

    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return null
    }

    return {
      id: data.id,
      provider: 'stripe',
      amount: data.amount / 100,
      currency: data.currency.toUpperCase(),
      status: mapStripeStatus(data.status),
      paymentMethod: 'credit_card',
      bookingId: parseInt(data.metadata?.bookingId || '0'),
      customerId: data.customer || '',
      customerEmail: data.metadata?.customerEmail || '',
      customerName: data.metadata?.customerName || '',
      metadata: data.metadata,
      createdAt: new Date(data.created * 1000).toISOString(),
      chargeId: data.latest_charge,
      errorMessage: data.last_payment_error?.message,
    }
  } catch (error) {
    console.error('Error verifying Stripe payment:', error)
    return null
  }
}

/**
 * แปลง status จาก Omise
 */
function mapOmiseStatus(status: string): PaymentIntent['status'] {
  const statusMap: Record<string, PaymentIntent['status']> = {
    'pending': 'pending',
    'successful': 'succeeded',
    'failed': 'failed',
    'expired': 'cancelled',
  }
  return statusMap[status] || 'pending'
}

/**
 * แปลง status จาก Stripe
 */
function mapStripeStatus(status: string): PaymentIntent['status'] {
  const statusMap: Record<string, PaymentIntent['status']> = {
    'requires_payment_method': 'pending',
    'requires_confirmation': 'pending',
    'requires_action': 'processing',
    'processing': 'processing',
    'succeeded': 'succeeded',
    'canceled': 'cancelled',
  }
  return statusMap[status] || 'pending'
}

/**
 * Refund Payment
 */
export async function refundPayment(
  provider: PaymentProvider,
  chargeId: string,
  amount?: number
): Promise<{ success: boolean; error?: string; refundId?: string }> {
  try {
    if (provider === 'omise') {
      return await refundOmisePayment(chargeId, amount)
    } else if (provider === 'stripe') {
      return await refundStripePayment(chargeId, amount)
    } else {
      return { success: false, error: 'Invalid payment provider' }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function refundOmisePayment(chargeId: string, amount?: number) {
  const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY

  const response = await fetch(`https://api.omise.co/charges/${chargeId}/refunds`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(OMISE_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(amount && { amount: amount * 100 }),
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Refund failed')
  }

  return { success: true, refundId: data.id }
}

async function refundStripePayment(paymentIntentId: string, amount?: number) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

  const params = new URLSearchParams({
    payment_intent: paymentIntentId,
    ...(amount && { amount: (amount * 100).toString() }),
  })

  const response = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Refund failed')
  }

  return { success: true, refundId: data.id }
}
