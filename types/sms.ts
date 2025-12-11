// SMS Notification System Types

export type SMSProvider = 'twilio' | 'thaibulksms' | 'test'

export type SMSStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'cancelled'

export type SMSPriority = 'low' | 'normal' | 'high' | 'urgent'

export type SMSTemplateCategory = 
  | 'booking' 
  | 'payment' 
  | 'reminder' 
  | 'marketing' 
  | 'notification'
  | 'verification'
  | 'emergency'

export interface SMSTemplate {
  id: string
  name: string
  category: SMSTemplateCategory
  subject: string
  content: string // Support {{variable}} placeholders
  variables: string[] // List of required variables
  provider: SMSProvider
  isActive: boolean
  language: 'th' | 'en' | 'zh' | 'ko'
  
  // Scheduling
  sendImmediately: boolean
  scheduleOffset?: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
    beforeAfter: 'before' | 'after'
    referencePoint: 'booking' | 'checkin' | 'checkout' | 'payment'
  }
  
  // Restrictions
  sendOnWeekdays: boolean
  sendOnWeekends: boolean
  allowedHours?: {
    start: string // HH:mm format
    end: string
  }
  
  // Analytics
  totalSent: number
  totalDelivered: number
  totalFailed: number
  deliveryRate: number
  lastUsed?: string
  
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface SMSMessage {
  id: string
  templateId?: string
  provider: SMSProvider
  
  // Recipient
  to: string // Phone number in E.164 format (+66xxxxxxxxx)
  toName?: string
  
  // Content
  message: string
  messageLength: number
  segmentCount: number // SMS segments (160 chars per segment)
  
  // Status
  status: SMSStatus
  priority: SMSPriority
  
  // Tracking
  providerMessageId?: string
  providerStatus?: string
  sentAt?: string
  deliveredAt?: string
  failedAt?: string
  errorMessage?: string
  errorCode?: string
  retryCount: number
  maxRetries: number
  
  // Scheduling
  scheduledFor?: string
  sendAfter?: string
  expiresAt?: string
  
  // Context
  bookingId?: number
  userId?: string
  campaignId?: string
  metadata?: Record<string, any>
  
  // Cost
  cost?: number
  currency: string
  
  // Queue
  queuedAt?: string
  processedAt?: string
  
  createdAt: string
  updatedAt: string
}

export interface SMSQueue {
  id: string
  messages: SMSMessage[]
  status: 'active' | 'paused' | 'stopped'
  priority: SMSPriority
  batchSize: number
  processedCount: number
  failedCount: number
  remainingCount: number
  startedAt?: string
  completedAt?: string
  pausedAt?: string
}

export interface SMSProviderConfig {
  provider: SMSProvider
  isActive: boolean
  isPrimary: boolean // Primary provider for sending
  
  // Credentials
  credentials: {
    // Twilio
    accountSid?: string
    authToken?: string
    fromNumber?: string
    
    // ThaiBulkSMS
    apiKey?: string
    secretKey?: string
    senderId?: string
  }
  
  // Limits
  rateLimit: {
    messagesPerSecond: number
    messagesPerMinute: number
    messagesPerHour: number
    messagesPerDay: number
  }
  
  // Current Usage
  usage: {
    today: number
    thisHour: number
    thisMinute: number
    lastResetAt: string
  }
  
  // Features
  features: {
    supportsUnicode: boolean
    supportsScheduling: boolean
    supportsDeliveryReports: boolean
    maxMessageLength: number
    maxSegments: number
  }
  
  // Costs
  pricing: {
    perMessage: number
    perSegment: number
    currency: string
  }
  
  // Reliability
  reliability: {
    successRate: number
    averageDeliveryTime: number // in seconds
    uptime: number // percentage
  }
  
  // Webhook
  webhookUrl?: string
  webhookSecret?: string
  
  lastTestedAt?: string
  lastSuccessAt?: string
  lastFailureAt?: string
  
  createdAt: string
  updatedAt: string
}

export interface SMSCampaign {
  id: string
  name: string
  description: string
  templateId: string
  
  // Targeting
  targetAudience: {
    type: 'all' | 'segment' | 'custom'
    segment?: 'guests' | 'members' | 'vip' | 'corporate'
    phoneNumbers?: string[]
    filters?: {
      hasBooking?: boolean
      lastBookingBefore?: string
      lastBookingAfter?: string
      totalSpent?: { min?: number, max?: number }
      optedIn: boolean
    }
  }
  
  // Schedule
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring'
    sendAt?: string
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly'
      interval: number
      daysOfWeek?: number[] // 0-6 (Sun-Sat)
      time: string // HH:mm
    }
  }
  
  // Status
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  
  // Statistics
  stats: {
    totalRecipients: number
    sent: number
    delivered: number
    failed: number
    optedOut: number
    estimatedCost: number
    actualCost: number
  }
  
  // Results
  startedAt?: string
  completedAt?: string
  
  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface SMSLog {
  id: string
  messageId: string
  timestamp: string
  event: 'created' | 'queued' | 'sent' | 'delivered' | 'failed' | 'cancelled' | 'retry'
  details: string
  metadata?: Record<string, any>
}

export interface SMSAnalytics {
  period: 'today' | 'week' | 'month' | 'year' | 'custom'
  startDate: string
  endDate: string
  
  overview: {
    totalSent: number
    totalDelivered: number
    totalFailed: number
    deliveryRate: number
    averageDeliveryTime: number // seconds
    totalCost: number
    averageCostPerMessage: number
  }
  
  byProvider: {
    provider: SMSProvider
    sent: number
    delivered: number
    failed: number
    deliveryRate: number
    averageDeliveryTime: number
    cost: number
  }[]
  
  byTemplate: {
    templateId: string
    templateName: string
    sent: number
    delivered: number
    deliveryRate: number
  }[]
  
  byCategory: {
    category: SMSTemplateCategory
    sent: number
    delivered: number
    cost: number
  }[]
  
  timeline: {
    date: string
    sent: number
    delivered: number
    failed: number
    cost: number
  }[]
  
  topRecipients: {
    phoneNumber: string
    name?: string
    messageCount: number
    lastMessageAt: string
  }[]
  
  failureReasons: {
    reason: string
    count: number
    percentage: number
  }[]
}

export interface SMSSettings {
  // Global Settings
  isEnabled: boolean
  defaultProvider: SMSProvider
  
  // Rate Limiting
  globalRateLimit: {
    messagesPerMinute: number
    messagesPerHour: number
    messagesPerDay: number
  }
  
  // Retry Policy
  retryPolicy: {
    enabled: boolean
    maxRetries: number
    retryDelays: number[] // delays in seconds [60, 300, 900]
    retryableErrors: string[]
  }
  
  // Queue Settings
  queue: {
    enabled: boolean
    batchSize: number
    processingInterval: number // seconds
    maxQueueSize: number
  }
  
  // Notifications
  adminNotifications: {
    enabled: boolean
    notifyOnFailure: boolean
    notifyOnLowBalance: boolean
    notifyOnHighUsage: boolean
    emails: string[]
  }
  
  // Opt-out
  optOut: {
    enabled: boolean
    keywords: string[] // ['STOP', 'UNSUBSCRIBE']
    autoReply: string
  }
  
  // Blacklist
  blacklist: {
    enabled: boolean
    phoneNumbers: string[]
    patterns: string[] // regex patterns
  }
  
  // Testing
  testMode: {
    enabled: boolean
    testPhoneNumbers: string[]
    logOnly: boolean
  }
  
  // Compliance
  compliance: {
    requireOptIn: boolean
    includeOptOutInstructions: boolean
    respectQuietHours: boolean
    quietHours: {
      start: string // HH:mm
      end: string
      timezone: string
    }
  }
  
  updatedAt: string
  updatedBy: string
}

export interface SMSOptInStatus {
  phoneNumber: string
  userId?: string
  status: 'opted-in' | 'opted-out' | 'pending'
  
  // Preferences
  preferences: {
    bookingUpdates: boolean
    paymentReminders: boolean
    checkInReminders: boolean
    specialOffers: boolean
    emergencyAlerts: boolean
  }
  
  // History
  optedInAt?: string
  optedOutAt?: string
  optOutReason?: string
  lastMessageAt?: string
  totalMessagesReceived: number
  
  // Verification
  verified: boolean
  verifiedAt?: string
  verificationCode?: string
  verificationExpiresAt?: string
  
  createdAt: string
  updatedAt: string
}

export interface SMSBalance {
  provider: SMSProvider
  balance: number
  currency: string
  lowBalanceThreshold: number
  isLow: boolean
  estimatedMessages: number
  lastUpdatedAt: string
  autoRecharge: {
    enabled: boolean
    threshold: number
    amount: number
  }
}

export interface SMSWebhook {
  id: string
  provider: SMSProvider
  event: 'message.sent' | 'message.delivered' | 'message.failed' | 'message.status'
  messageId: string
  payload: Record<string, any>
  receivedAt: string
  processedAt?: string
  processed: boolean
}

// Utility Types
export interface SMSSendRequest {
  to: string | string[] // Single or multiple recipients
  templateId?: string
  message?: string // If not using template
  variables?: Record<string, any> // For template variables
  provider?: SMSProvider
  priority?: SMSPriority
  scheduledFor?: string
  bookingId?: number
  userId?: string
  metadata?: Record<string, any>
}

export interface SMSSendResponse {
  success: boolean
  messageId?: string
  status?: SMSStatus
  message?: string
  error?: string
  cost?: number
  segmentCount?: number
  scheduledFor?: string
}

export interface SMSBulkSendRequest {
  templateId: string
  recipients: {
    to: string
    variables?: Record<string, any>
    metadata?: Record<string, any>
  }[]
  provider?: SMSProvider
  priority?: SMSPriority
  scheduledFor?: string
  campaignId?: string
}

export interface SMSBulkSendResponse {
  success: boolean
  total: number
  sent: number
  failed: number
  messageIds: string[]
  errors?: {
    to: string
    error: string
  }[]
  estimatedCost: number
}
