import { NextResponse } from 'next/server'
import { cleanupOldFailedLoginAttempts } from '@/lib/server/failedLoginAttempts'

// Cron job สำหรับทำความสะอาดข้อมูล failed login ที่เก่ากว่า 24 ชั่วโมง
export async function GET(request: Request) {
  try {
    // ตรวจสอบ authorization header (ใช้ secret key)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ทำความสะอาดข้อมูลเก่า
    await cleanupOldFailedLoginAttempts()

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully'
    })
  } catch (error) {
    console.error('Error in cleanup cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
