import { NextResponse } from 'next/server'
import { emailService } from '@/lib/server/emailService'

/**
 * POST /api/email/process-queue
 * Process email queue (can be called by cron job)
 */
export async function POST(request: Request) {
  try {
    // Optional: Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await emailService.processQueue()

    return NextResponse.json({
      success: true,
      ...result,
      message: `Processed ${result.processed} emails, ${result.failed} failed`,
    })

  } catch (error: any) {
    console.error('Queue processing error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/process-queue
 * Get queue status
 */
export async function GET() {
  try {
    const { readJson } = await import('@/lib/server/db')
    const queue = await readJson('data/email-queue.json').catch(() => [])

    const pending = queue.filter((item: any) => item.status === 'pending').length
    const sent = queue.filter((item: any) => item.status === 'sent').length
    const failed = queue.filter((item: any) => item.status === 'failed').length

    return NextResponse.json({
      success: true,
      queue: {
        total: queue.length,
        pending,
        sent,
        failed,
      },
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
