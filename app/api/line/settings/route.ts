import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'line-settings.json')

// GET - Get LINE settings
export async function GET() {
  try {
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8')
    const settings = JSON.parse(settingsData)

    // Don't expose sensitive data
    const publicSettings = {
      enabled: settings.enabled,
      webhookUrl: settings.webhookUrl,
      autoReply: settings.autoReply,
      notificationTypes: settings.notificationTypes,
      templates: settings.templates,
      updatedAt: settings.updatedAt
    }

    return NextResponse.json(publicSettings)
  } catch (error) {
    console.error('Get Settings Error:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

// PUT - Update LINE settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Load current settings
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8')
    const currentSettings = JSON.parse(settingsData)

    // Update settings
    const updatedSettings = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString()
    }

    // If channelAccessToken is provided, validate it
    if (body.channelAccessToken) {
      const isValid = await validateLineToken(body.channelAccessToken)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid LINE Channel Access Token' },
          { status: 400 }
        )
      }
    }

    // Save settings
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        enabled: updatedSettings.enabled,
        webhookUrl: updatedSettings.webhookUrl,
        autoReply: updatedSettings.autoReply,
        notificationTypes: updatedSettings.notificationTypes
      }
    })

  } catch (error) {
    console.error('Update Settings Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// POST - Test LINE connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelAccessToken, testUserId } = body

    if (!channelAccessToken) {
      return NextResponse.json(
        { error: 'Channel Access Token is required' },
        { status: 400 }
      )
    }

    // Test 1: Validate token
    const isValid = await validateLineToken(channelAccessToken)
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Channel Access Token',
          tests: {
            tokenValidation: false,
            messageDelivery: false
          }
        },
        { status: 400 }
      )
    }

    // Test 2: Send test message (if testUserId provided)
    let messageDelivered = null
    if (testUserId) {
      messageDelivered = await sendTestMessage(channelAccessToken, testUserId)
    }

    return NextResponse.json({
      success: true,
      message: 'LINE connection test successful',
      tests: {
        tokenValidation: true,
        messageDelivery: messageDelivered
      }
    })

  } catch (error) {
    console.error('Test Connection Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Connection test failed',
        details: String(error)
      },
      { status: 500 }
    )
  }
}

// Validate LINE token
async function validateLineToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.line.me/v2/bot/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// Send test message
async function sendTestMessage(token: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: '✅ ทดสอบการเชื่อมต่อ LINE สำเร็จ!\n\nระบบ LINE Notification ทำงานปกติ 🎉'
          }
        ]
      })
    })
    return response.ok
  } catch (error) {
    return false
  }
}
