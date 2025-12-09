// Email Marketing Types

export interface EmailSubscriber {
  id: string
  email: string
  name?: string
  phone?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  tags: string[]
  preferences: {
    newsletter: boolean
    promotions: boolean
    booking_updates: boolean
    special_events: boolean
  }
  source: 'website' | 'booking' | 'manual' | 'import'
  subscribedAt: string
  unsubscribedAt?: string
  lastEmailSent?: string
  metadata?: {
    totalBookings?: number
    totalSpent?: number
    lastBookingDate?: string
  }
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  previewText?: string
  type: 'newsletter' | 'promotion' | 'booking_confirmation' | 'birthday' | 'anniversary' | 'custom'
  category: 'marketing' | 'transactional' | 'automated'
  htmlContent: string
  textContent?: string
  variables: string[] // e.g., ['name', 'room_name', 'discount_code']
  thumbnail?: string
  status: 'draft' | 'active' | 'archived'
  createdAt: string
  updatedAt: string
  usageCount: number
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  templateId: string
  type: 'immediate' | 'scheduled' | 'automated'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  
  // Recipients
  recipients: {
    type: 'all' | 'segment' | 'custom'
    tags?: string[]
    customEmails?: string[]
    excludeTags?: string[]
    totalCount: number
  }
  
  // Scheduling
  scheduledAt?: string
  sentAt?: string
  
  // Automation rules (for automated campaigns)
  automationRules?: {
    trigger: 'birthday' | 'anniversary' | 'booking_anniversary' | 'inactive_user' | 'custom'
    daysBefore?: number
    daysAfter?: number
    conditions?: any
  }
  
  // Stats
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
    failed: number
  }
  
  createdAt: string
  createdBy: string
}

export interface EmailStats {
  campaignId: string
  date: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  revenue?: number
}

export interface EmailLog {
  id: string
  campaignId: string
  subscriberId: string
  email: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  subject: string
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  bouncedAt?: string
  errorMessage?: string
  metadata?: any
}

export interface EmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  replyToEmail: string
  
  // Sending limits
  dailyLimit: number
  hourlyLimit: number
  
  // Features
  enableTracking: boolean
  enableUnsubscribeLink: boolean
  
  // Templates
  unsubscribeFooter: string
  defaultFooter: string
}

export interface EmailPreview {
  subject: string
  previewText: string
  html: string
  text: string
  variables: Record<string, string>
}
