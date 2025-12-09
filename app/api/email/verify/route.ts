import { NextResponse } from 'next/server'
import { verifyEmailConnection } from '@/lib/server/emailService'

export async function GET() {
  try {
    const result = await verifyEmailConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMTP connection verified successfully! ✅',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.FROM_EMAIL,
          fromName: process.env.FROM_NAME,
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.simulated ? 'SMTP not configured - running in simulation mode' : 'SMTP connection failed',
        config: {
          host: process.env.SMTP_HOST || 'Not set',
          port: process.env.SMTP_PORT || 'Not set',
          user: process.env.SMTP_USER || 'Not set',
        }
      }, { status: result.simulated ? 200 : 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to verify SMTP connection'
    }, { status: 500 })
  }
}
