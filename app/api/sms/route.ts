import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, sendBulkSMS, SMSService } from '@/lib/server/smsService'
import fs from 'fs/promises'
import path from 'path'
import type { SMSMessage } from '@/types/sms'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get all SMS messages with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const bookingId = searchParams.get('bookingId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const filePath = path.join(DATA_DIR, 'sms-messages.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let messages: SMSMessage[] = JSON.parse(data)
    
    // Filter
    if (status) {
      messages = messages.filter(m => m.status === status)
    }
    if (provider) {
      messages = messages.filter(m => m.provider === provider)
    }
    if (bookingId) {
      messages = messages.filter(m => m.bookingId === parseInt(bookingId))
    }
    
    // Sort by newest first
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Paginate
    const total = messages.length
    messages = messages.slice(offset, offset + limit)
    
    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load SMS messages'
    }, { status: 500 })
  }
}

// POST - Send SMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.to) {
      return NextResponse.json({
        success: false,
        error: 'Recipient phone number is required'
      }, { status: 400 })
    }
    
    // Check if bulk send
    if (Array.isArray(body.to) && body.to.length > 1) {
      if (!body.templateId) {
        return NextResponse.json({
          success: false,
          error: 'Template ID is required for bulk sending'
        }, { status: 400 })
      }
      
      const result = await sendBulkSMS({
        templateId: body.templateId,
        recipients: body.to.map((phone: string) => ({
          to: phone,
          variables: body.variables,
          metadata: body.metadata
        })),
        provider: body.provider,
        priority: body.priority,
        scheduledFor: body.scheduledFor,
        campaignId: body.campaignId
      })
      
      return NextResponse.json(result)
    }
    
    // Single SMS
    const result = await sendSMS({
      to: Array.isArray(body.to) ? body.to[0] : body.to,
      templateId: body.templateId,
      message: body.message,
      variables: body.variables,
      provider: body.provider,
      priority: body.priority,
      scheduledFor: body.scheduledFor,
      bookingId: body.bookingId,
      userId: body.userId,
      metadata: body.metadata
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send SMS'
    }, { status: 500 })
  }
}

// PUT - Update SMS status (for webhooks or manual updates)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Message ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-messages.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const messages: SMSMessage[] = JSON.parse(data)
    
    const index = messages.findIndex(m => m.id === body.id)
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 })
    }
    
    // Update message
    const message = messages[index]
    if (body.status) message.status = body.status
    if (body.deliveredAt) message.deliveredAt = body.deliveredAt
    if (body.failedAt) message.failedAt = body.failedAt
    if (body.errorMessage) message.errorMessage = body.errorMessage
    if (body.providerStatus) message.providerStatus = body.providerStatus
    
    message.updatedAt = new Date().toISOString()
    messages[index] = message
    
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2))
    
    return NextResponse.json({
      success: true,
      message
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update SMS'
    }, { status: 500 })
  }
}

// DELETE - Delete SMS message
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Message ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-messages.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let messages: SMSMessage[] = JSON.parse(data)
    
    const initialLength = messages.length
    messages = messages.filter(m => m.id !== id)
    
    if (messages.length === initialLength) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 })
    }
    
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'SMS deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete SMS'
    }, { status: 500 })
  }
}
