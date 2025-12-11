import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { SMSAnalytics, SMSMessage, SMSTemplate } from '@/types/sms'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get SMS analytics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'week'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Load messages
    const messagesData = await fs.readFile(path.join(DATA_DIR, 'sms-messages.json'), 'utf-8')
    const allMessages: SMSMessage[] = JSON.parse(messagesData)
    
    // Load templates
    const templatesData = await fs.readFile(path.join(DATA_DIR, 'sms-templates.json'), 'utf-8')
    const templates: SMSTemplate[] = JSON.parse(templatesData)
    
    // Filter messages by date range
    let messages = allMessages
    let start: Date, end: Date
    
    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      end = new Date()
      switch (period) {
        case 'today':
          start = new Date()
          start.setHours(0, 0, 0, 0)
          break
        case 'week':
          start = new Date()
          start.setDate(start.getDate() - 7)
          break
        case 'month':
          start = new Date()
          start.setMonth(start.getMonth() - 1)
          break
        case 'year':
          start = new Date()
          start.setFullYear(start.getFullYear() - 1)
          break
        default:
          start = new Date()
          start.setDate(start.getDate() - 7)
      }
    }
    
    messages = messages.filter(m => {
      const createdAt = new Date(m.createdAt)
      return createdAt >= start && createdAt <= end
    })
    
    // Calculate overview
    const totalSent = messages.filter(m => ['sent', 'delivered'].includes(m.status)).length
    const totalDelivered = messages.filter(m => m.status === 'delivered').length
    const totalFailed = messages.filter(m => m.status === 'failed').length
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
    
    const deliveredMessages = messages.filter(m => m.deliveredAt)
    const averageDeliveryTime = deliveredMessages.length > 0
      ? deliveredMessages.reduce((sum, m) => {
          const sent = new Date(m.sentAt!).getTime()
          const delivered = new Date(m.deliveredAt!).getTime()
          return sum + (delivered - sent) / 1000
        }, 0) / deliveredMessages.length
      : 0
    
    const totalCost = messages.reduce((sum, m) => sum + (m.cost || 0), 0)
    const averageCostPerMessage = totalSent > 0 ? totalCost / totalSent : 0
    
    // By provider
    const providers = Array.from(new Set(messages.map(m => m.provider)))
    const byProvider = providers.map(provider => {
      const providerMessages = messages.filter(m => m.provider === provider)
      const sent = providerMessages.filter(m => ['sent', 'delivered'].includes(m.status)).length
      const delivered = providerMessages.filter(m => m.status === 'delivered').length
      const failed = providerMessages.filter(m => m.status === 'failed').length
      const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
      
      const deliveredMsgs = providerMessages.filter(m => m.deliveredAt)
      const avgDeliveryTime = deliveredMsgs.length > 0
        ? deliveredMsgs.reduce((sum, m) => {
            const sentTime = new Date(m.sentAt!).getTime()
            const deliveredTime = new Date(m.deliveredAt!).getTime()
            return sum + (deliveredTime - sentTime) / 1000
          }, 0) / deliveredMsgs.length
        : 0
      
      const cost = providerMessages.reduce((sum, m) => sum + (m.cost || 0), 0)
      
      return {
        provider,
        sent,
        delivered,
        failed,
        deliveryRate,
        averageDeliveryTime: avgDeliveryTime,
        cost
      }
    })
    
    // By template
    const templateIds = Array.from(new Set(messages.filter(m => m.templateId).map(m => m.templateId!)))
    const byTemplate = templateIds.map(templateId => {
      const template = templates.find(t => t.id === templateId)
      const templateMessages = messages.filter(m => m.templateId === templateId)
      const sent = templateMessages.filter(m => ['sent', 'delivered'].includes(m.status)).length
      const delivered = templateMessages.filter(m => m.status === 'delivered').length
      const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
      
      return {
        templateId,
        templateName: template?.name || 'Unknown',
        sent,
        delivered,
        deliveryRate
      }
    })
    
    // By category
    const categoryMap = new Map<string, SMSMessage[]>()
    messages.forEach(m => {
      if (m.templateId) {
        const template = templates.find(t => t.id === m.templateId)
        if (template) {
          const existing = categoryMap.get(template.category) || []
          existing.push(m)
          categoryMap.set(template.category, existing)
        }
      }
    })
    
    const byCategory = Array.from(categoryMap.entries()).map(([category, msgs]) => {
      const sent = msgs.filter(m => ['sent', 'delivered'].includes(m.status)).length
      const delivered = msgs.filter(m => m.status === 'delivered').length
      const cost = msgs.reduce((sum, m) => sum + (m.cost || 0), 0)
      
      return {
        category: category as any,
        sent,
        delivered,
        cost
      }
    })
    
    // Timeline
    const timeline: { date: string; sent: number; delivered: number; failed: number; cost: number }[] = []
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayMessages = messages.filter(m => {
        const msgDate = new Date(m.createdAt).toISOString().split('T')[0]
        return msgDate === dateStr
      })
      
      timeline.push({
        date: dateStr,
        sent: dayMessages.filter(m => ['sent', 'delivered'].includes(m.status)).length,
        delivered: dayMessages.filter(m => m.status === 'delivered').length,
        failed: dayMessages.filter(m => m.status === 'failed').length,
        cost: dayMessages.reduce((sum, m) => sum + (m.cost || 0), 0)
      })
    }
    
    // Top recipients
    const recipientMap = new Map<string, { count: number; lastMessageAt: string; name?: string }>()
    messages.forEach(m => {
      const existing = recipientMap.get(m.to) || { count: 0, lastMessageAt: m.createdAt, name: m.toName }
      existing.count++
      if (new Date(m.createdAt) > new Date(existing.lastMessageAt)) {
        existing.lastMessageAt = m.createdAt
        if (m.toName) existing.name = m.toName
      }
      recipientMap.set(m.to, existing)
    })
    
    const topRecipients = Array.from(recipientMap.entries())
      .map(([phone, data]) => ({
        phoneNumber: phone,
        name: data.name,
        messageCount: data.count,
        lastMessageAt: data.lastMessageAt
      }))
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 10)
    
    // Failure reasons
    const failureReasonMap = new Map<string, number>()
    messages.filter(m => m.status === 'failed' && m.errorMessage).forEach(m => {
      const reason = m.errorMessage!
      failureReasonMap.set(reason, (failureReasonMap.get(reason) || 0) + 1)
    })
    
    const failureReasons = Array.from(failureReasonMap.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalFailed > 0 ? (count / totalFailed) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
    
    const analytics: SMSAnalytics = {
      period: period as any,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      overview: {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate,
        averageDeliveryTime,
        totalCost,
        averageCostPerMessage
      },
      byProvider,
      byTemplate,
      byCategory,
      timeline,
      topRecipients,
      failureReasons
    }
    
    return NextResponse.json({
      success: true,
      analytics
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate analytics'
    }, { status: 500 })
  }
}
