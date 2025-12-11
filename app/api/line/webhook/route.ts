import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'line-settings.json')
const USERS_FILE = path.join(DATA_DIR, 'line-users.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'line-notifications.json')

// Verify LINE signature
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')
  return hash === signature
}

// POST - LINE Webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 401 }
      )
    }

    // Load settings to get channel secret
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8')
    const settings = JSON.parse(settingsData)

    // Verify signature
    if (!verifySignature(body, signature, settings.channelSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const events = JSON.parse(body).events

    for (const event of events) {
      await handleLineEvent(event, settings)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LINE Webhook Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle different LINE event types
async function handleLineEvent(event: any, settings: any) {
  const { type, replyToken, source, message, postback } = event

  switch (type) {
    case 'message':
      await handleMessage(event, replyToken, source, message, settings)
      break

    case 'follow':
      await handleFollow(event, replyToken, source, settings)
      break

    case 'unfollow':
      await handleUnfollow(event, source, settings)
      break

    case 'postback':
      await handlePostback(event, replyToken, source, postback, settings)
      break

    default:
      console.log('Unhandled event type:', type)
  }
}

// Handle incoming messages
async function handleMessage(_event: any, replyToken: string, source: any, message: any, settings: any) {
  if (message.type !== 'text') return

  const text = message.text.toLowerCase().trim()

  // Auto-reply based on keywords
  if (settings.autoReply) {
    let replyMessage = null

    if (text.includes('จอง') || text.includes('book')) {
      replyMessage = {
        type: 'text',
        text: '📋 ต้องการจองห้องพักใช่ไหมคะ?\n\nกรุณาเข้าเว็บไซต์: https://your-domain.com/rooms\n\nหรือติดต่อ: 099-XXX-XXXX'
      }
    } else if (text.includes('ราคา') || text.includes('price')) {
      replyMessage = {
        type: 'text',
        text: '💰 ราคาห้องพัก:\n\n• Deluxe Pool Villa: 5,000-8,000 ฿/คืน\n• Premium Suite: 4,000-6,000 ฿/คืน\n• Luxury Villa: 6,000-10,000 ฿/คืน\n\nดูรายละเอียดเพิ่มเติม: https://your-domain.com/rooms'
      }
    } else if (text.includes('สถานที่') || text.includes('location')) {
      replyMessage = {
        type: 'location',
        title: 'Poolvilla Pattaya',
        address: 'พัทยา ชลบุรี',
        latitude: 12.9236,
        longitude: 100.8825
      }
    } else if (text.includes('ติดต่อ') || text.includes('contact')) {
      replyMessage = {
        type: 'text',
        text: '📞 ติดต่อเรา:\n\n• โทร: 099-XXX-XXXX\n• Line: @poolvilla\n• Email: info@poolvilla.com\n• เว็บไซต์: https://your-domain.com\n\nเปิดทำการ: 9:00 - 18:00 น.'
      }
    } else {
      // Default reply
      replyMessage = {
        type: 'text',
        text: '🏊 สวัสดีค่ะ! Poolvilla Pattaya ยินดีให้บริการ\n\nพิมพ์:\n• "จอง" - จองห้องพัก\n• "ราคา" - ดูราคาห้อง\n• "สถานที่" - ดูแผนที่\n• "ติดต่อ" - ข้อมูลติดต่อ'
      }
    }

    if (replyMessage) {
      await replyToLine(replyToken, [replyMessage], settings)
    }
  }

  // Save message to database
  await saveIncomingMessage(source, message)
}

// Handle follow event (user adds friend)
async function handleFollow(_event: any, replyToken: string, source: any, settings: any) {
  const userId = source.userId

  // Get user profile
  const profile = await getLineUserProfile(userId, settings)

  // Save user to database
  await saveLineUser({
    lineUserId: userId,
    displayName: profile?.displayName || 'Unknown',
    pictureUrl: profile?.pictureUrl,
    statusMessage: profile?.statusMessage,
    registeredAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isBlocked: false
  })

  // Send welcome message
  const welcomeMessage = {
    type: 'flex',
    altText: 'ยินดีต้อนรับสู่ Poolvilla Pattaya! 🏊',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://your-domain.com/images/welcome.jpg',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'ยินดีต้อนรับ! 🎉',
            weight: 'bold',
            size: 'xl',
            color: '#3B82F6'
          },
          {
            type: 'text',
            text: 'ขอบคุณที่เพิ่มเราเป็นเพื่อน',
            size: 'sm',
            color: '#6B7280',
            margin: 'md'
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '📋 บริการของเรา:',
                weight: 'bold',
                size: 'md',
                color: '#1F2937'
              },
              {
                type: 'text',
                text: '• จองห้องพักออนไลน์',
                size: 'sm',
                color: '#4B5563'
              },
              {
                type: 'text',
                text: '• รับการแจ้งเตือนการจอง',
                size: 'sm',
                color: '#4B5563'
              },
              {
                type: 'text',
                text: '• โปรโมชั่นพิเศษ',
                size: 'sm',
                color: '#4B5563'
              },
              {
                type: 'text',
                text: '• สะสมคะแนนสมาชิก',
                size: 'sm',
                color: '#4B5563'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'เริ่มจองเลย',
              uri: 'https://your-domain.com/rooms'
            }
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'message',
              label: 'ดูคำสั่งทั้งหมด',
              text: 'help'
            }
          }
        ]
      }
    }
  }

  await replyToLine(replyToken, [welcomeMessage], settings)
}

// Handle unfollow event (user blocks)
async function handleUnfollow(_event: any, source: any, _settings: any) {
  const userId = source.userId

  // Update user status
  const usersData = await fs.readFile(USERS_FILE, 'utf-8')
  const users = JSON.parse(usersData)

  const userIndex = users.findIndex((u: any) => u.lineUserId === userId)
  if (userIndex !== -1) {
    users[userIndex].isBlocked = true
    users[userIndex].lastActivity = new Date().toISOString()
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  }
}

// Handle postback event
async function handlePostback(_event: any, _replyToken: string, _source: any, postback: any, _settings: any) {
  const data = postback.data

  // Parse postback data
  const params = new URLSearchParams(data)
  const action = params.get('action')

  if (action === 'view_booking') {
    // const bookingId = params.get('bookingId')
    // Send booking details
    // Implementation depends on your booking system
  }
}

// Reply to LINE
async function replyToLine(replyToken: string, messages: any[], settings: any) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.channelAccessToken}`
      },
      body: JSON.stringify({
        replyToken,
        messages
      })
    })

    if (!response.ok) {
      console.error('LINE API Error:', await response.text())
    }
  } catch (error) {
    console.error('Failed to reply to LINE:', error)
  }
}

// Get LINE user profile
async function getLineUserProfile(userId: string, settings: any) {
  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${settings.channelAccessToken}`
      }
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to get LINE profile:', error)
  }
  return null
}

// Save LINE user
async function saveLineUser(user: any) {
  try {
    const usersData = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(usersData)

    const existingIndex = users.findIndex((u: any) => u.lineUserId === user.lineUserId)

    if (existingIndex !== -1) {
      users[existingIndex] = { ...users[existingIndex], ...user }
    } else {
      users.push({ id: `line-user-${Date.now()}`, ...user })
    }

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Failed to save LINE user:', error)
  }
}

// Save incoming message
async function saveIncomingMessage(source: any, message: any) {
  try {
    const messagesData = await fs.readFile(MESSAGES_FILE, 'utf-8')
    const messages = JSON.parse(messagesData)

    messages.push({
      id: `msg-${Date.now()}`,
      type: 'incoming',
      from: source.userId,
      message: message.text,
      receivedAt: new Date().toISOString()
    })

    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  } catch (error) {
    console.error('Failed to save message:', error)
  }
}
