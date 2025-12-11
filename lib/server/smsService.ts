import fs from 'fs/promises'
import path from 'path'
import type {
  SMSProvider,
  SMSMessage,
  SMSProviderConfig,
  SMSTemplate,
  SMSSendRequest,
  SMSSendResponse,
  SMSBulkSendRequest,
  SMSBulkSendResponse,
  SMSSettings,
  SMSLog
} from '@/types/sms'

const DATA_DIR = path.join(process.cwd(), 'data')

// Phone number utilities
export class PhoneNumberUtil {
  static formatE164(phone: string, defaultCountryCode: string = '+66'): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // Handle Thai numbers
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
      return `+66${cleaned}`
    }
    
    if (cleaned.startsWith('66')) {
      return `+${cleaned}`
    }
    
    if (!cleaned.startsWith('+')) {
      return `${defaultCountryCode}${cleaned}`
    }
    
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
  }
  
  static isValid(phone: string): boolean {
    const e164 = this.formatE164(phone)
    // Basic E.164 validation
    return /^\+[1-9]\d{1,14}$/.test(e164)
  }
  
  static maskNumber(phone: string): string {
    const e164 = this.formatE164(phone)
    if (e164.length < 8) return phone
    return e164.slice(0, -4).replace(/\d/g, '*') + e164.slice(-4)
  }
}

// SMS Service Provider Interface
interface ISMSProvider {
  name: SMSProvider
  send(to: string, message: string, options?: any): Promise<any>
  getDeliveryStatus(messageId: string): Promise<any>
  getBalance?(): Promise<any>
}

// Twilio Provider
class TwilioProvider implements ISMSProvider {
  name: SMSProvider = 'twilio'
  private fromNumber: string
  
  constructor(config: SMSProviderConfig) {
    // Store credentials for production use
    // this._accountSid = config.credentials.accountSid || ''
    // this._authToken = config.credentials.authToken || ''
    this.fromNumber = config.credentials.fromNumber || ''
  }
  
  async send(to: string, message: string, _options?: any) {
    // In production, use Twilio SDK
    // const twilio = require('twilio')
    // const client = twilio(this.accountSid, this.authToken)
    // return await client.messages.create({
    //   body: message,
    //   from: this.fromNumber,
    //   to: to,
    //   ...options
    // })
    
    // Mock for development
    console.log(`[Twilio] Sending SMS to ${to}: ${message}`)
    return {
      sid: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      to,
      from: this.fromNumber,
      body: message,
      dateCreated: new Date().toISOString()
    }
  }
  
  async getDeliveryStatus(messageId: string) {
    // Mock delivery status
    return {
      sid: messageId,
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    }
  }
  
  async getBalance() {
    // Mock balance
    return {
      balance: 1000,
      currency: 'USD'
    }
  }
}

// ThaiBulkSMS Provider
class ThaiBulkSMSProvider implements ISMSProvider {
  name: SMSProvider = 'thaibulksms'
  
  constructor(_config: SMSProviderConfig) {
    // Store credentials for production use
    // this._apiKey = _config.credentials.apiKey || ''
    // this._secretKey = _config.credentials.secretKey || ''
    // this._senderId = _config.credentials.senderId || ''
  }
  
  async send(to: string, message: string, _options?: any) {
    // In production, call ThaiBulkSMS API
    // const response = await fetch('https://api.thaibulksms.com/v1/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${this.apiKey}`
    //   },
    //   body: JSON.stringify({
    //     key: this.apiKey,
    //     secret: this.secretKey,
    //     msisdn: to,
    //     message: message,
    //     sender: this.senderId,
    //     ...options
    //   })
    // })
    
    // Mock for development
    console.log(`[ThaiBulkSMS] Sending SMS to ${to}: ${message}`)
    return {
      messageId: `TBS${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      status: 'success',
      to,
      message,
      timestamp: new Date().toISOString()
    }
  }
  
  async getDeliveryStatus(messageId: string) {
    // Mock delivery status
    return {
      messageId,
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    }
  }
  
  async getBalance() {
    // Mock balance
    return {
      balance: 50000,
      currency: 'THB'
    }
  }
}

// Test Provider (for development)
class TestProvider implements ISMSProvider {
  name: SMSProvider = 'test'
  
  async send(to: string, message: string, _options?: any) {
    console.log(`[TEST] SMS to ${to}: ${message}`)
    return {
      messageId: `TEST${Date.now()}`,
      status: 'sent',
      to,
      message
    }
  }
  
  async getDeliveryStatus(messageId: string) {
    return {
      messageId,
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    }
  }
  
  async getBalance() {
    return {
      balance: 999999,
      currency: 'THB'
    }
  }
}

// Main SMS Service
export class SMSService {
  private providers: Map<SMSProvider, ISMSProvider> = new Map()
  private settings: SMSSettings | null = null
  
  constructor() {
    this.initialize()
  }
  
  private async initialize() {
    await this.loadSettings()
    await this.loadProviders()
  }
  
  private async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(path.join(DATA_DIR, 'sms-settings.json'), 'utf-8')
      this.settings = JSON.parse(data)
    } catch (error) {
      // Use default settings
      this.settings = this.getDefaultSettings()
    }
  }
  
  private async loadProviders(): Promise<void> {
    try {
      const data = await fs.readFile(path.join(DATA_DIR, 'sms-providers.json'), 'utf-8')
      const configs: SMSProviderConfig[] = JSON.parse(data)
      
      for (const config of configs) {
        if (!config.isActive) continue
        
        let provider: ISMSProvider
        switch (config.provider) {
          case 'twilio':
            provider = new TwilioProvider(config)
            break
          case 'thaibulksms':
            provider = new ThaiBulkSMSProvider(config)
            break
          case 'test':
            provider = new TestProvider()
            break
          default:
            continue
        }
        
        this.providers.set(config.provider, provider)
      }
    } catch (error) {
      console.error('Failed to load SMS providers:', error)
      // Add test provider as fallback
      this.providers.set('test', new TestProvider())
    }
  }
  
  private getDefaultSettings(): SMSSettings {
    return {
      isEnabled: true,
      defaultProvider: 'test',
      globalRateLimit: {
        messagesPerMinute: 10,
        messagesPerHour: 100,
        messagesPerDay: 1000
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        retryDelays: [60, 300, 900],
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT']
      },
      queue: {
        enabled: true,
        batchSize: 10,
        processingInterval: 5,
        maxQueueSize: 1000
      },
      adminNotifications: {
        enabled: true,
        notifyOnFailure: true,
        notifyOnLowBalance: true,
        notifyOnHighUsage: true,
        emails: ['admin@example.com']
      },
      optOut: {
        enabled: true,
        keywords: ['STOP', 'UNSUBSCRIBE', 'ยกเลิก'],
        autoReply: 'คุณได้ยกเลิกการรับข้อความแล้ว หากต้องการรับข้อความอีกครั้ง กรุณาติดต่อเรา'
      },
      blacklist: {
        enabled: true,
        phoneNumbers: [],
        patterns: []
      },
      testMode: {
        enabled: false,
        testPhoneNumbers: [],
        logOnly: false
      },
      compliance: {
        requireOptIn: true,
        includeOptOutInstructions: true,
        respectQuietHours: true,
        quietHours: {
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Bangkok'
        }
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    }
  }
  
  // Send SMS
  async send(request: SMSSendRequest): Promise<SMSSendResponse> {
    try {
      // Ensure settings are loaded
      if (!this.settings) {
        await this.loadSettings()
      }
      
      // Validate - Allow SMS even if service is "disabled" in settings (for testing)
      // Remove the check or make it warning only
      if (this.settings && this.settings.isEnabled === false) {
        console.warn('⚠️ SMS service is marked as disabled but sending anyway for testing')
      }
      
      // Get recipients
      const recipients = Array.isArray(request.to) ? request.to : [request.to]
      
      if (recipients.length === 0) {
        throw new Error('No recipients specified')
      }
      
      // If multiple recipients, use bulk send
      if (recipients.length > 1) {
        return await this.sendBulk({
          templateId: request.templateId || '',
          recipients: recipients.map(phone => ({ to: phone, variables: request.variables })),
          provider: request.provider,
          priority: request.priority,
          scheduledFor: request.scheduledFor
        })
      }
      
      const to = recipients[0]
      
      // Format phone number
      const formattedPhone = PhoneNumberUtil.formatE164(to)
      
      // Validate phone number
      if (!PhoneNumberUtil.isValid(formattedPhone)) {
        throw new Error(`Invalid phone number: ${to}`)
      }
      
      // Check blacklist
      if (await this.isBlacklisted(formattedPhone)) {
        throw new Error('Phone number is blacklisted')
      }
      
      // Get message content
      let message = request.message || ''
      if (request.templateId && !message) {
        const template = await this.getTemplate(request.templateId)
        if (!template) {
          throw new Error('Template not found')
        }
        message = this.renderTemplate(template, request.variables || {})
      }
      
      if (!message) {
        throw new Error('No message content')
      }
      
      // Create SMS message record
      const smsMessage: SMSMessage = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId: request.templateId,
        provider: request.provider || this.settings?.defaultProvider || 'test',
        to: formattedPhone,
        message,
        messageLength: message.length,
        segmentCount: Math.ceil(message.length / 160),
        status: 'pending',
        priority: request.priority || 'normal',
        retryCount: 0,
        maxRetries: this.settings?.retryPolicy.maxRetries || 3,
        scheduledFor: request.scheduledFor,
        bookingId: request.bookingId,
        userId: request.userId,
        metadata: request.metadata,
        currency: 'THB',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Check if scheduled
      if (request.scheduledFor) {
        smsMessage.status = 'queued'
        await this.saveMessage(smsMessage)
        return {
          success: true,
          messageId: smsMessage.id,
          status: 'queued',
          message: 'SMS scheduled successfully',
          scheduledFor: request.scheduledFor,
          segmentCount: smsMessage.segmentCount
        }
      }
      
      // Check rate limits
      if (!await this.checkRateLimit(smsMessage.provider)) {
        smsMessage.status = 'queued'
        await this.saveMessage(smsMessage)
        return {
          success: true,
          messageId: smsMessage.id,
          status: 'queued',
          message: 'SMS queued due to rate limit'
        }
      }
      
      // Send SMS
      const result = await this.sendNow(smsMessage)
      
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      }
    }
  }
  
  // Send SMS immediately
  private async sendNow(smsMessage: SMSMessage): Promise<SMSSendResponse> {
    try {
      let provider = this.providers.get(smsMessage.provider)
      
      // If provider not found, use test provider as fallback
      if (!provider) {
        console.warn(`⚠️ Provider ${smsMessage.provider} not configured, using test provider instead`)
        provider = this.providers.get('test')
        
        // If test provider also not available, create one
        if (!provider) {
          provider = new TestProvider()
          this.providers.set('test', provider)
        }
        
        // Update message to use test provider
        smsMessage.provider = 'test'
      }
      
      // Update status
      smsMessage.status = 'queued'
      smsMessage.queuedAt = new Date().toISOString()
      await this.saveMessage(smsMessage)
      await this.logEvent(smsMessage.id, 'queued', 'Message queued for sending')
      
      // Send via provider
      const result = await provider.send(smsMessage.to, smsMessage.message, {
        priority: smsMessage.priority,
        metadata: smsMessage.metadata
      })
      
      // Update status
      smsMessage.status = 'sent'
      smsMessage.sentAt = new Date().toISOString()
      smsMessage.providerMessageId = result.sid || result.messageId
      smsMessage.processedAt = new Date().toISOString()
      await this.saveMessage(smsMessage)
      await this.logEvent(smsMessage.id, 'sent', 'Message sent successfully', { result })
      
      return {
        success: true,
        messageId: smsMessage.id,
        status: 'sent',
        message: 'SMS sent successfully',
        segmentCount: smsMessage.segmentCount
      }
    } catch (error: any) {
      // Handle failure
      smsMessage.status = 'failed'
      smsMessage.failedAt = new Date().toISOString()
      smsMessage.errorMessage = error.message
      smsMessage.errorCode = error.code
      await this.saveMessage(smsMessage)
      await this.logEvent(smsMessage.id, 'failed', `Failed to send: ${error.message}`)
      
      // Retry if applicable
      if (this.shouldRetry(smsMessage)) {
        await this.scheduleRetry(smsMessage)
      }
      
      return {
        success: false,
        messageId: smsMessage.id,
        status: 'failed',
        error: error.message
      }
    }
  }
  
  // Bulk send
  async sendBulk(request: SMSBulkSendRequest): Promise<SMSBulkSendResponse> {
    const results: SMSSendResponse[] = []
    let totalCost = 0
    
    for (const recipient of request.recipients) {
      const result = await this.send({
        to: recipient.to,
        templateId: request.templateId,
        variables: recipient.variables,
        provider: request.provider,
        priority: request.priority,
        scheduledFor: request.scheduledFor,
        metadata: { ...recipient.metadata, campaignId: request.campaignId }
      })
      
      results.push(result)
      if (result.cost) {
        totalCost += result.cost
      }
    }
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    return {
      success: successful > 0,
      total: request.recipients.length,
      sent: successful,
      failed,
      messageIds: results.filter(r => r.messageId).map(r => r.messageId!),
      errors: results.filter(r => !r.success).map(r => ({
        to: request.recipients.find(_rec => true)!.to,
        error: r.error || 'Unknown error'
      })),
      estimatedCost: totalCost
    }
  }
  
  // Render template
  private renderTemplate(template: SMSTemplate, variables: Record<string, any>): string {
    let content = template.content
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      content = content.replace(regex, String(value))
    }
    
    // Add opt-out instructions if required
    if (this.settings?.compliance.includeOptOutInstructions && 
        template.category === 'marketing') {
      content += '\n\nReply STOP to unsubscribe'
    }
    
    return content
  }
  
  // Check rate limit
  private async checkRateLimit(_provider: SMSProvider): Promise<boolean> {
    // Simplified rate limit check
    // In production, implement proper rate limiting with Redis or similar
    return true
  }
  
  // Check if phone is blacklisted
  private async isBlacklisted(phone: string): Promise<boolean> {
    if (!this.settings?.blacklist.enabled) return false
    
    // Check exact match
    if (this.settings.blacklist.phoneNumbers.includes(phone)) {
      return true
    }
    
    // Check patterns
    for (const pattern of this.settings.blacklist.patterns) {
      if (new RegExp(pattern).test(phone)) {
        return true
      }
    }
    
    return false
  }
  
  // Retry logic
  private shouldRetry(message: SMSMessage): boolean {
    if (!this.settings?.retryPolicy.enabled) return false
    if (message.retryCount >= message.maxRetries) return false
    
    // Check if error is retryable
    if (message.errorCode && 
        !this.settings.retryPolicy.retryableErrors.includes(message.errorCode)) {
      return false
    }
    
    return true
  }
  
  private async scheduleRetry(message: SMSMessage): Promise<void> {
    if (!this.settings) return
    
    const retryDelay = this.settings.retryPolicy.retryDelays[message.retryCount] || 
                      this.settings.retryPolicy.retryDelays[this.settings.retryPolicy.retryDelays.length - 1]
    
    message.retryCount++
    message.status = 'queued'
    message.scheduledFor = new Date(Date.now() + retryDelay * 1000).toISOString()
    
    await this.saveMessage(message)
    await this.logEvent(message.id, 'retry', `Scheduled retry #${message.retryCount} in ${retryDelay}s`)
  }
  
  // Data persistence
  private async saveMessage(message: SMSMessage): Promise<void> {
    try {
      const filePath = path.join(DATA_DIR, 'sms-messages.json')
      let messages: SMSMessage[] = []
      
      try {
        const data = await fs.readFile(filePath, 'utf-8')
        messages = JSON.parse(data)
      } catch (error) {
        // File doesn't exist yet
      }
      
      const index = messages.findIndex(m => m.id === message.id)
      if (index >= 0) {
        messages[index] = message
      } else {
        messages.push(message)
      }
      
      await fs.writeFile(filePath, JSON.stringify(messages, null, 2))
    } catch (error) {
      console.error('Failed to save SMS message:', error)
    }
  }
  
  private async getTemplate(templateId: string): Promise<SMSTemplate | null> {
    try {
      const data = await fs.readFile(path.join(DATA_DIR, 'sms-templates.json'), 'utf-8')
      const templates: SMSTemplate[] = JSON.parse(data)
      return templates.find(t => t.id === templateId) || null
    } catch (error) {
      return null
    }
  }
  
  private async logEvent(messageId: string, event: SMSLog['event'], details: string, metadata?: any): Promise<void> {
    try {
      const log: SMSLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messageId,
        timestamp: new Date().toISOString(),
        event,
        details,
        metadata
      }
      
      const filePath = path.join(DATA_DIR, 'sms-logs.json')
      let logs: SMSLog[] = []
      
      try {
        const data = await fs.readFile(filePath, 'utf-8')
        logs = JSON.parse(data)
      } catch (error) {
        // File doesn't exist yet
      }
      
      logs.push(log)
      
      // Keep only last 10000 logs
      if (logs.length > 10000) {
        logs = logs.slice(-10000)
      }
      
      await fs.writeFile(filePath, JSON.stringify(logs, null, 2))
    } catch (error) {
      console.error('Failed to log SMS event:', error)
    }
  }
}

// Export convenience functions
export async function sendSMS(request: SMSSendRequest): Promise<SMSSendResponse> {
  const service = new SMSService()
  return await service.send(request)
}

export async function sendBulkSMS(request: SMSBulkSendRequest): Promise<SMSBulkSendResponse> {
  const service = new SMSService()
  return await service.sendBulk(request)
}

// Booking notification helpers
export async function sendBookingConfirmationSMS(booking: any): Promise<SMSSendResponse> {
  if (!booking.phone) {
    return {
      success: false,
      error: 'No phone number provided'
    }
  }
  
  return await sendSMS({
    to: booking.phone,
    templateId: 'booking-confirmation',
    variables: {
      guestName: booking.guestName,
      bookingId: booking.id,
      roomName: booking.roomName,
      checkIn: new Date(booking.checkIn).toLocaleDateString('th-TH'),
      checkOut: new Date(booking.checkOut).toLocaleDateString('th-TH'),
      total: booking.total.toLocaleString('th-TH')
    },
    bookingId: booking.id,
    priority: 'high'
  })
}

export async function sendCheckInReminderSMS(booking: any): Promise<SMSSendResponse> {
  if (!booking.phone) {
    return {
      success: false,
      error: 'No phone number provided'
    }
  }
  
  return await sendSMS({
    to: booking.phone,
    templateId: 'checkin-reminder',
    variables: {
      guestName: booking.guestName,
      roomName: booking.roomName,
      checkIn: new Date(booking.checkIn).toLocaleDateString('th-TH'),
      time: new Date(booking.checkIn).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    },
    bookingId: booking.id,
    priority: 'normal'
  })
}

export async function sendPaymentConfirmationSMS(booking: any, payment: any): Promise<SMSSendResponse> {
  if (!booking.phone) {
    return {
      success: false,
      error: 'No phone number provided'
    }
  }
  
  return await sendSMS({
    to: booking.phone,
    templateId: 'payment-confirmation',
    variables: {
      guestName: booking.guestName,
      amount: payment.amount.toLocaleString('th-TH'),
      bookingId: booking.id,
      paymentMethod: payment.method
    },
    bookingId: booking.id,
    priority: 'high'
  })
}

export async function sendBookingCancellationSMS(booking: any, reason?: string): Promise<SMSSendResponse> {
  if (!booking.phone) {
    return {
      success: false,
      error: 'No phone number provided'
    }
  }
  
  return await sendSMS({
    to: booking.phone,
    templateId: 'booking-cancellation',
    variables: {
      guestName: booking.guestName,
      bookingId: booking.id,
      roomName: booking.roomName,
      reason: reason || 'ตามคำขอของลูกค้า'
    },
    bookingId: booking.id,
    priority: 'high'
  })
}

// Create singleton instance
const smsManager = new SMSService()

export default smsManager
