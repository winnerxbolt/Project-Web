import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { PushSubscription } from '@/types/push'

const DATA_DIR = path.join(process.cwd(), 'data')
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push-subscriptions.json')

// GET - ดึง subscriptions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8')
    let subscriptions: PushSubscription[] = JSON.parse(data)

    if (userId) {
      subscriptions = subscriptions.filter(s => s.userId === userId && s.isActive)
    }

    return NextResponse.json({
      success: true,
      subscriptions
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch subscriptions'
    }, { status: 500 })
  }
}

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subscription, userAgent, deviceType } = body

    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8')
    const subscriptions: PushSubscription[] = JSON.parse(data)

    // Check if already subscribed
    const existing = subscriptions.find(
      s => s.endpoint === subscription.endpoint && s.userId === userId
    )

    if (existing) {
      existing.isActive = true
      existing.lastUsed = new Date().toISOString()
      await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2))
      
      return NextResponse.json({
        success: true,
        subscription: existing,
        message: 'Subscription updated'
      })
    }

    // Create new subscription
    const newSubscription: PushSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      userAgent,
      deviceType,
      isActive: true,
      subscribedAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }

    subscriptions.push(newSubscription)
    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2))

    return NextResponse.json({
      success: true,
      subscription: newSubscription,
      message: 'Successfully subscribed to push notifications'
    })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to subscribe'
    }, { status: 500 })
  }
}

// DELETE - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: 'Endpoint required'
      }, { status: 400 })
    }

    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8')
    const subscriptions: PushSubscription[] = JSON.parse(data)

    const index = subscriptions.findIndex(s => s.endpoint === endpoint)
    if (index !== -1) {
      subscriptions[index].isActive = false
      await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2))
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully'
    })
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to unsubscribe'
    }, { status: 500 })
  }
}
