import { NextResponse } from 'next/server'
import { cleanupExpiredTokens } from '@/lib/server/passwordReset'

/**
 * GET /api/cron/cleanup-reset-tokens
 * ลบ password reset tokens ที่หมดอายุ
 * ควรรันทุก 1 ชั่วโมง
 */
export async function GET(request: Request) {
  try {
    // ตรวจสอบ CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ลบ tokens ที่หมดอายุ
    await cleanupExpiredTokens()

    console.log('✅ Cleaned up expired password reset tokens')

    return NextResponse.json({
      success: true,
      message: 'Expired password reset tokens cleaned up successfully'
    })
  } catch (error) {
    console.error('Cleanup reset tokens error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup tokens' },
      { status: 500 }
    )
  }
}
