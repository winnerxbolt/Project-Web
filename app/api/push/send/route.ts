import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { PushNotification, PushSubscription } from '@/types/push'

const DATA_DIR = path.join(process.cwd(), 'data')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'push-notifications.json')
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push-subscriptions.json')

// POST - Send push notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      title,
      body: messageBody,
      icon,
      image,
      badge,
      tag,
      data,
      actions,
      requireInteraction,
      silent
    } = body

    // Load subscriptions
    const subsData = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8')
    const subscriptions: PushSubscription[] = JSON.parse(subsData)

    // Filter active subscriptions
    let targetSubs = subscriptions.filter(s => s.isActive)
    if (userId) {
      targetSubs = targetSubs.filter(s => s.userId === userId)
    }

    // Create notification record
    const notification: PushNotification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      body: messageBody,
      icon: icon || '/icon-192x192.png',
      image,
      badge: badge || '/badge-72x72.png',
      tag,
      data,
      actions,
      requireInteraction: requireInteraction || false,
      silent: silent || false,
      timestamp: Date.now(),
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    // Save notification
    const notifsData = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8')
    const notifications: PushNotification[] = JSON.parse(notifsData)
    notifications.push(notification)
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))

    // ใน production จะใช้ web-push library ส่งจริง
    // const webpush = require('web-push')
    // await Promise.all(targetSubs.map(sub => 
    //   webpush.sendNotification(sub, JSON.stringify(notification))
    // ))

    return NextResponse.json({
      success: true,
      notification,
      sent: targetSubs.length,
      message: `Sent to ${targetSubs.length} device(s)`
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send notification'
    }, { status: 500 })
  }
}

// GET - Get notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8')
    let notifications: PushNotification[] = JSON.parse(data)

    if (userId) {
      notifications = notifications.filter(n => n.userId === userId || !n.userId)
    }

    // Sort by date desc
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, limit),
      total: notifications.length
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 })
  }
}
