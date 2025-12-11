import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/server/emailService'

/**
 * POST /api/email/test
 * Test email configuration
 */
export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    const testResult = await emailService.testConnection(provider)

    if (testResult.success) {
      // Send test email
      const result = await emailService.send({
        to: process.env.SMTP_USER || 'test@example.com',
        subject: '✅ Test Email - Poolvilla Pattaya',
        html: `
          <h1>Email Configuration Test</h1>
          <p>This is a test email from Poolvilla Pattaya.</p>
          <p><strong>Provider:</strong> ${provider || 'default'}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your email configuration is working correctly! 🎉</p>
        `,
      }, provider)

      return NextResponse.json({
        success: true,
        message: testResult.message,
        emailSent: result.success,
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: testResult.message,
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
