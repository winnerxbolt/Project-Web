import { NextResponse } from 'next/server'
import { processAutoCheckout } from '@/lib/server/autoCheckout'

// GET - เรียกใช้ระบบ auto-checkout
export async function GET() {
  try {
    const result = await processAutoCheckout()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process auto-checkout' },
      { status: 500 }
    )
  }
}
