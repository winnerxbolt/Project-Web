import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');

interface Notification {
  id: string;
  type: 'booking' | 'status' | 'checkin_reminder' | 'promotion' | 'video' | 'announcement';
  title: string;
  message: string;
  recipientType: 'admin' | 'user' | 'all';
  recipientId?: string;
  bookingId?: string;
  videoId?: string;
  couponCode?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('web' | 'email' | 'line' | 'sms')[];
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
  metadata?: {
    reason?: string;
    discount?: string;
    imageUrl?: string;
    actionUrl?: string;
  };
}

function readNotifications(): Notification[] {
  try {
    const data = fs.readFileSync(notificationsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeNotifications(notifications: Notification[]) {
  fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));
}

// GET - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const recipientType = searchParams.get('recipientType');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');

    let notifications = readNotifications();

    // Filter by recipient
    if (recipientType === 'admin') {
      notifications = notifications.filter(n => n.recipientType === 'admin' || n.recipientType === 'all');
    } else if (userId) {
      notifications = notifications.filter(
        n => n.recipientType === 'all' || 
           (n.recipientType === 'user' && n.recipientId === userId)
      );
    }

    // Filter by type
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    // Filter by read status
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead);
    }

    // Sort by created date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const notifications = readNotifications();

    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: body.type,
      title: body.title,
      message: body.message,
      recipientType: body.recipientType || 'user',
      recipientId: body.recipientId,
      bookingId: body.bookingId,
      videoId: body.videoId,
      couponCode: body.couponCode,
      priority: body.priority || 'normal',
      channels: body.channels || ['web'],
      isRead: false,
      createdAt: new Date().toISOString(),
      scheduledFor: body.scheduledFor,
      metadata: body.metadata,
    };

    notifications.push(newNotification);
    writeNotifications(notifications);

    // Here you would integrate with email/LINE/SMS services
    await sendNotification(newNotification);

    return NextResponse.json({ success: true, notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PUT - Mark as read or update
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, action, isRead, userId } = body;

    const notifications = readNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);

    if (index === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (action === 'markAsRead') {
      notifications[index].isRead = isRead !== undefined ? isRead : true;
    } else if (action === 'markAllAsRead') {
      notifications.forEach(n => {
        if (userId) {
          if (n.recipientType === 'all' || (n.recipientType === 'user' && n.recipientId === userId)) {
            n.isRead = true;
          }
        } else {
          n.isRead = true;
        }
      });
    }

    writeNotifications(notifications);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const notifications = readNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);

    writeNotifications(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}

// Helper function to send notifications via different channels
async function sendNotification(notification: Notification) {
  const { channels, title, message } = notification;

  for (const channel of channels) {
    try {
      switch (channel) {
        case 'email':
          // Integration with email service (SendGrid, AWS SES, etc.)
          console.log(`Sending email: ${title} - ${message}`);
          // await sendEmail(notification);
          break;
        
        case 'line':
          // Integration with LINE Notify or LINE Messaging API
          console.log(`Sending LINE: ${title} - ${message}`);
          // await sendLineNotification(notification);
          break;
        
        case 'sms':
          // Integration with SMS service (Twilio, AWS SNS, etc.)
          console.log(`Sending SMS: ${title} - ${message}`);
          // await sendSMS(notification);
          break;
        
        case 'web':
          // Web notification is handled by the frontend
          console.log(`Web notification created: ${title}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }
}
