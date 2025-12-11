export interface LINENotification {
  id: string
  userId: string
  lineUserId?: string
  message: string
  imageUrl?: string
  stickerPackageId?: string
  stickerId?: string
  type: 'text' | 'image' | 'flex' | 'template'
  flexMessage?: LINEFlexMessage
  status: 'pending' | 'sent' | 'failed'
  sentAt?: string
  error?: string
  createdAt: string
}

export interface LINEFlexMessage {
  type: 'bubble' | 'carousel'
  hero?: {
    type: 'image'
    url: string
    size: string
    aspectRatio: string
  }
  body?: {
    type: 'box'
    layout: 'vertical' | 'horizontal'
    contents: any[]
  }
  footer?: {
    type: 'box'
    layout: 'vertical' | 'horizontal'
    contents: any[]
  }
}

export interface LINEUser {
  lineUserId: string
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
  linkedAt: string
  isActive: boolean
}

export interface LINESettings {
  channelId: string
  channelSecret: string
  channelAccessToken: string
  webhookUrl: string
  isEnabled: boolean
  notifications: {
    bookingConfirmation: boolean
    paymentReceived: boolean
    checkInReminder: boolean
    checkOutReminder: boolean
    promotions: boolean
    specialOffers: boolean
  }
}
