import { NextRequest, NextResponse } from 'next/server'
import { readJson } from '@/lib/server/db'
import emailTemplates from '@/lib/email-templates'

/**
 * GET /api/email/preview?templateId=xxx
 * Preview email template with sample data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Get template info
    const templates = await readJson('data/email-templates.json')
    const template = templates.find((t: any) => t.id === templateId)

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Get HTML generator function
    const templateFunction = (emailTemplates as any)[
      templateId.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())
    ]

    if (!templateFunction) {
      return NextResponse.json(
        { success: false, error: 'Template generator not found' },
        { status: 404 }
      )
    }

    // Sample data for preview
    const sampleData: Record<string, any> = {
      guestName: 'คุณสมชาย ใจดี',
      bookingId: '12345',
      roomName: 'Luxury Pool Villa - Seaview',
      checkIn: '15 มกราคม 2568',
      checkOut: '17 มกราคม 2568',
      guests: 4,
      total: '15,000',
      nights: 2,
      paymentId: 'PAY-67890',
      amount: '15,000',
      paymentMethod: 'PromptPay',
      paidAt: '10 มกราคม 2568 14:30 น.',
      checkInTime: '14:00',
      address: '123/45 หาดจอมเทียน พัทยา ชลบุรี 20150',
      phone: '0xx-xxx-xxxx',
      resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=sample-token`,
      resetToken: 'sample-token-12345',
      expiresIn: '1 ชั่วโมง',
      supportEmail: 'support@poolvillapattaya.com',
      name: 'คุณสมชาย',
      email: 'somchai@example.com',
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://poolvillapattaya.com',
    }

    // Generate HTML
    const html = templateFunction()
    
    // Replace variables with sample data
    let previewHtml = html
    for (const [key, value] of Object.entries(sampleData)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      previewHtml = previewHtml.replace(regex, String(value))
    }

    // Return HTML for preview
    return new NextResponse(previewHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error: any) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
