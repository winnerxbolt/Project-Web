import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { SMSOptInStatus } from '@/types/sms'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get opt-in status for a phone number
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phoneNumber = searchParams.get('phoneNumber')
    
    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-opt-in.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const optIns: SMSOptInStatus[] = JSON.parse(data)
    
    const optIn = optIns.find(o => o.phoneNumber === phoneNumber)
    
    return NextResponse.json({
      success: true,
      optIn: optIn || null
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get opt-in status'
    }, { status: 500 })
  }
}

// POST - Opt in to SMS notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, userId, preferences } = body
    
    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-opt-in.json')
    let optIns: SMSOptInStatus[] = []
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      optIns = JSON.parse(data)
    } catch (error) {
      // File doesn't exist yet
    }
    
    // Check if already exists
    const existingIndex = optIns.findIndex(o => o.phoneNumber === phoneNumber)
    
    const optIn: SMSOptInStatus = {
      phoneNumber,
      userId,
      status: 'opted-in',
      preferences: preferences || {
        bookingUpdates: true,
        paymentReminders: true,
        checkInReminders: true,
        specialOffers: false,
        emergencyAlerts: true
      },
      optedInAt: new Date().toISOString(),
      totalMessagesReceived: existingIndex >= 0 ? optIns[existingIndex].totalMessagesReceived : 0,
      verified: false,
      createdAt: existingIndex >= 0 ? optIns[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      optIns[existingIndex] = optIn
    } else {
      optIns.push(optIn)
    }
    
    await fs.writeFile(filePath, JSON.stringify(optIns, null, 2))
    
    return NextResponse.json({
      success: true,
      optIn
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to opt in'
    }, { status: 500 })
  }
}

// PUT - Update preferences or opt out
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, status, preferences, reason } = body
    
    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-opt-in.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const optIns: SMSOptInStatus[] = JSON.parse(data)
    
    const index = optIns.findIndex(o => o.phoneNumber === phoneNumber)
    
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Phone number not found'
      }, { status: 404 })
    }
    
    const optIn = optIns[index]
    
    if (status) {
      optIn.status = status
      if (status === 'opted-out') {
        optIn.optedOutAt = new Date().toISOString()
        optIn.optOutReason = reason
      }
    }
    
    if (preferences) {
      optIn.preferences = { ...optIn.preferences, ...preferences }
    }
    
    optIn.updatedAt = new Date().toISOString()
    optIns[index] = optIn
    
    await fs.writeFile(filePath, JSON.stringify(optIns, null, 2))
    
    return NextResponse.json({
      success: true,
      optIn
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update opt-in'
    }, { status: 500 })
  }
}

// DELETE - Remove opt-in record
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phoneNumber = searchParams.get('phoneNumber')
    
    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-opt-in.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let optIns: SMSOptInStatus[] = JSON.parse(data)
    
    const initialLength = optIns.length
    optIns = optIns.filter(o => o.phoneNumber !== phoneNumber)
    
    if (optIns.length === initialLength) {
      return NextResponse.json({
        success: false,
        error: 'Phone number not found'
      }, { status: 404 })
    }
    
    await fs.writeFile(filePath, JSON.stringify(optIns, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Opt-in record deleted'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete opt-in'
    }, { status: 500 })
  }
}
