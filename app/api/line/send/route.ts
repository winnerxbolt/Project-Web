import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'line-settings.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'line-notifications.json')
const USERS_FILE = path.join(DATA_DIR, 'line-users.json')

// POST - Send LINE message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, lineUserId, message, type = 'text', flexMessage, imageUrl } = body

    // Load settings
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8')
    const settings = JSON.parse(settingsData)

    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'LINE notifications are disabled' },
        { status: 400 }
      )
    }

    let targetLineUserId = lineUserId

    // If userId provided, find LINE User ID
    if (!targetLineUserId && userId) {
      const usersData = await fs.readFile(USERS_FILE, 'utf-8')
      const users = JSON.parse(usersData)
      const user = users.find((u: any) => u.userId === userId)
      
      if (user) {
        targetLineUserId = user.lineUserId
      } else {
        return NextResponse.json(
          { error: 'User not found or not connected to LINE' },
          { status: 404 }
        )
      }
    }

    if (!targetLineUserId) {
      return NextResponse.json(
        { error: 'LINE User ID is required' },
        { status: 400 }
      )
    }

    // Prepare message
    let lineMessage: any

    if (type === 'flex' && flexMessage) {
      lineMessage = {
        type: 'flex',
        altText: flexMessage.altText || 'Notification from Poolvilla',
        contents: flexMessage.contents
      }
    } else if (type === 'image' && imageUrl) {
      lineMessage = {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl
      }
    } else {
      lineMessage = {
        type: 'text',
        text: message
      }
    }

    // Send via LINE API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.channelAccessToken}`
      },
      body: JSON.stringify({
        to: targetLineUserId,
        messages: [lineMessage]
      })
    })

    const messageRecord = {
      id: `msg-${Date.now()}`,
      userId: userId || null,
      lineUserId: targetLineUserId,
      type,
      message: type === 'text' ? message : null,
      flexMessage: type === 'flex' ? flexMessage : null,
      imageUrl: type === 'image' ? imageUrl : null,
      status: response.ok ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
      error: response.ok ? null : await response.text(),
      createdAt: new Date().toISOString()
    }

    // Save message record
    const messagesData = await fs.readFile(MESSAGES_FILE, 'utf-8')
    const messages = JSON.parse(messagesData)
    messages.push(messageRecord)
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send LINE message', details: await response.text() },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'LINE message sent successfully',
      messageId: messageRecord.id
    })

  } catch (error) {
    console.error('Send LINE Message Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// GET - Get message history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const lineUserId = searchParams.get('lineUserId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const messagesData = await fs.readFile(MESSAGES_FILE, 'utf-8')
    let messages = JSON.parse(messagesData)

    // Filter by userId
    if (userId) {
      messages = messages.filter((m: any) => m.userId === userId)
    }

    // Filter by lineUserId
    if (lineUserId) {
      messages = messages.filter((m: any) => m.lineUserId === lineUserId)
    }

    // Filter by status
    if (status) {
      messages = messages.filter((m: any) => m.status === status)
    }

    // Sort by date (newest first)
    messages.sort((a: any, b: any) => 
      new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime()
    )

    // Limit results
    messages = messages.slice(0, limit)

    return NextResponse.json({
      messages,
      total: messages.length
    })

  } catch (error) {
    console.error('Get Messages Error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

// Broadcast message to all users
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, type = 'text', flexMessage, imageUrl, filterBlocked = true } = body

    // Load settings
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8')
    const settings = JSON.parse(settingsData)

    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'LINE notifications are disabled' },
        { status: 400 }
      )
    }

    // Load users
    const usersData = await fs.readFile(USERS_FILE, 'utf-8')
    let users = JSON.parse(usersData)

    // Filter blocked users
    if (filterBlocked) {
      users = users.filter((u: any) => !u.isBlocked)
    }

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users to send message to' },
        { status: 400 }
      )
    }

    // Prepare message
    let lineMessage: any

    if (type === 'flex' && flexMessage) {
      lineMessage = {
        type: 'flex',
        altText: flexMessage.altText || 'Broadcast from Poolvilla',
        contents: flexMessage.contents
      }
    } else if (type === 'image' && imageUrl) {
      lineMessage = {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl
      }
    } else {
      lineMessage = {
        type: 'text',
        text: message
      }
    }

    // Send to all users
    const results = []
    for (const user of users) {
      try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.channelAccessToken}`
          },
          body: JSON.stringify({
            to: user.lineUserId,
            messages: [lineMessage]
          })
        })

        results.push({
          lineUserId: user.lineUserId,
          success: response.ok,
          error: response.ok ? null : await response.text()
        })

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        results.push({
          lineUserId: user.lineUserId,
          success: false,
          error: String(error)
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Broadcast sent to ${successCount} users (${failCount} failed)`,
      results: {
        total: users.length,
        success: successCount,
        failed: failCount
      }
    })

  } catch (error) {
    console.error('Broadcast Error:', error)
    return NextResponse.json(
      { error: 'Failed to broadcast message' },
      { status: 500 }
    )
  }
}
