import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { SMSSettings, SMSProviderConfig } from '@/types/sms'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get SMS settings
export async function GET(_request: NextRequest) {
  try {
    const settingsPath = path.join(DATA_DIR, 'sms-settings.json')
    const providersPath = path.join(DATA_DIR, 'sms-providers.json')
    
    const settingsData = await fs.readFile(settingsPath, 'utf-8')
    const providersData = await fs.readFile(providersPath, 'utf-8')
    
    const settings: SMSSettings = JSON.parse(settingsData)
    const providers: SMSProviderConfig[] = JSON.parse(providersData)
    
    return NextResponse.json({
      success: true,
      settings,
      providers
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load settings'
    }, { status: 500 })
  }
}

// PUT - Update SMS settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle simplified settings update from UI
    if (body.defaultProvider || body.providers) {
      const settingsPath = path.join(DATA_DIR, 'sms-settings.json')
      const providersPath = path.join(DATA_DIR, 'sms-providers.json')
      
      // Update settings file if defaultProvider is provided
      if (body.defaultProvider) {
        const settingsData = await fs.readFile(settingsPath, 'utf-8')
        const settings: SMSSettings = JSON.parse(settingsData)
        settings.defaultProvider = body.defaultProvider
        settings.updatedAt = new Date().toISOString()
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
      }
      
      // Update provider credentials if provided
      if (body.providers) {
        const providersData = await fs.readFile(providersPath, 'utf-8')
        const providers: SMSProviderConfig[] = JSON.parse(providersData)
        
        // Update Twilio credentials
        if (body.providers.twilio) {
          const twilioIndex = providers.findIndex(p => p.provider === 'twilio')
          if (twilioIndex !== -1) {
            providers[twilioIndex].credentials = {
              ...providers[twilioIndex].credentials,
              accountSid: body.providers.twilio.accountSid || providers[twilioIndex].credentials.accountSid,
              authToken: body.providers.twilio.authToken || providers[twilioIndex].credentials.authToken,
              fromNumber: body.providers.twilio.fromNumber || providers[twilioIndex].credentials.fromNumber
            }
            // Activate Twilio if credentials provided
            if (body.providers.twilio.accountSid && body.providers.twilio.authToken) {
              providers[twilioIndex].isActive = true
            }
            providers[twilioIndex].updatedAt = new Date().toISOString()
          }
        }
        
        await fs.writeFile(providersPath, JSON.stringify(providers, null, 2))
      }
      
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully'
      })
    }
    
    // Handle full settings update
    const { settings, providers } = body
    
    if (settings) {
      const settingsPath = path.join(DATA_DIR, 'sms-settings.json')
      settings.updatedAt = new Date().toISOString()
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
    }
    
    if (providers) {
      const providersPath = path.join(DATA_DIR, 'sms-providers.json')
      await fs.writeFile(providersPath, JSON.stringify(providers, null, 2))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update settings'
    }, { status: 500 })
  }
}

// POST - Test SMS provider connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, phoneNumber } = body
    
    if (!provider || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Provider and phone number are required'
      }, { status: 400 })
    }
    
    // Send test SMS
    const { sendSMS } = await import('@/lib/server/smsService')
    const result = await sendSMS({
      to: phoneNumber,
      message: `🧪 Test SMS from WINNERBOY Pool Villa\n\nThis is a test message to verify your SMS provider configuration.\n\nProvider: ${provider.toUpperCase()}\nTime: ${new Date().toLocaleString('th-TH')}`,
      provider: provider as any,
      priority: 'high'
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test SMS'
    }, { status: 500 })
  }
}
