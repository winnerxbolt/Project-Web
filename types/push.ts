export interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  isActive: boolean
  subscribedAt: string
  lastUsed?: string
}

export interface PushNotification {
  id: string
  userId?: string // undefined = send to all
  title: string
  body: string
  icon?: string
  image?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
  actions?: PushAction[]
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  vibrate?: number[]
  status: 'pending' | 'sent' | 'failed'
  sentAt?: string
  clickedAt?: string
  error?: string
  createdAt: string
}

export interface PushAction {
  action: string
  title: string
  icon?: string
}

export interface PushSettings {
  isEnabled: boolean
  vapidPublicKey: string
  vapidPrivateKey: string
  notifications: {
    bookingConfirmation: boolean
    paymentReminder: boolean
    checkInReminder: boolean
    checkOutReminder: boolean
    promotions: boolean
    specialOffers: boolean
    priceDrops: boolean
    roomAvailability: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm format
    endTime: string
  }
}

export interface PushCampaign {
  id: string
  name: string
  title: string
  body: string
  image?: string
  targetAudience: 'all' | 'members' | 'tier' | 'custom'
  tierFilter?: string[]
  customUserIds?: string[]
  scheduledFor?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  stats: {
    targeted: number
    sent: number
    delivered: number
    clicked: number
    failed: number
  }
  createdAt: string
}
