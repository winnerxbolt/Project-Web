import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { EmailSubscriber, EmailCampaign, EmailTemplate } from '@/types/email'

const SUBSCRIBERS_FILE = 'email-subscribers.json'
const CAMPAIGNS_FILE = 'email-campaigns.json'
const TEMPLATES_FILE = 'email-templates.json'

// This endpoint should be called by a cron job daily
export async function GET() {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    const subscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []
    const templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []
    const campaigns = await readJson<EmailCampaign[]>(CAMPAIGNS_FILE) || []

    const results = {
      birthdayEmails: 0,
      anniversaryEmails: 0,
      inactiveUserEmails: 0,
      scheduledCampaigns: 0,
    }

    // 1. Check for birthdays
    const birthdayTemplate = templates.find(t => t.type === 'birthday' && t.status === 'active')
    if (birthdayTemplate) {
      const birthdaySubscribers = subscribers.filter(sub => {
        if (sub.status !== 'active' || !sub.metadata?.lastBookingDate) return false
        
        // Check if birthday is today (assuming we store birthday in metadata)
        const birthday = sub.metadata.lastBookingDate // This should be birthday field
        const birthdayDate = new Date(birthday)
        return birthdayDate.getMonth() === today.getMonth() && 
               birthdayDate.getDate() === today.getDate()
      })

      if (birthdaySubscribers.length > 0) {
        // Create automated birthday campaign
        const birthdayCampaign: EmailCampaign = {
          id: `auto-birthday-${Date.now()}`,
          name: `วันเกิด ${todayStr}`,
          subject: '🎂 สุขสันต์วันเกิด! รับส่วนลดพิเศษ 20%',
          templateId: birthdayTemplate.id,
          type: 'automated',
          status: 'scheduled',
          recipients: {
            type: 'custom',
            customEmails: birthdaySubscribers.map(s => s.email),
            totalCount: birthdaySubscribers.length,
          },
          scheduledAt: new Date().toISOString(),
          automationRules: {
            trigger: 'birthday',
            daysBefore: 0,
          },
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          createdBy: 'system-automated',
        }

        campaigns.push(birthdayCampaign)
        results.birthdayEmails = birthdaySubscribers.length

        // TODO: Actually send the emails
        // await sendCampaign(birthdayCampaign.id)
      }
    }

    // 2. Check for booking anniversaries
    const anniversaryTemplate = templates.find(t => t.type === 'anniversary' && t.status === 'active')
    if (anniversaryTemplate) {
      const anniversarySubscribers = subscribers.filter(sub => {
        if (sub.status !== 'active' || !sub.metadata?.lastBookingDate) return false
        
        const lastBooking = new Date(sub.metadata.lastBookingDate)
        const yearAgo = new Date(today)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        
        // Check if last booking was exactly 1 year ago
        return lastBooking.getMonth() === yearAgo.getMonth() && 
               lastBooking.getDate() === yearAgo.getDate() &&
               lastBooking.getFullYear() === yearAgo.getFullYear()
      })

      if (anniversarySubscribers.length > 0) {
        const anniversaryCampaign: EmailCampaign = {
          id: `auto-anniversary-${Date.now()}`,
          name: `ครบรอบการจอง ${todayStr}`,
          subject: '🎉 ครบรอบ 1 ปี! รับส่วนลดพิเศษเพื่อคุณ',
          templateId: anniversaryTemplate.id,
          type: 'automated',
          status: 'scheduled',
          recipients: {
            type: 'custom',
            customEmails: anniversarySubscribers.map(s => s.email),
            totalCount: anniversarySubscribers.length,
          },
          scheduledAt: new Date().toISOString(),
          automationRules: {
            trigger: 'booking_anniversary',
            daysBefore: 0,
          },
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          createdBy: 'system-automated',
        }

        campaigns.push(anniversaryCampaign)
        results.anniversaryEmails = anniversarySubscribers.length
      }
    }

    // 3. Check for inactive users (no booking in 6 months)
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const inactiveSubscribers = subscribers.filter(sub => {
      if (sub.status !== 'active' || !sub.metadata?.lastBookingDate) return false
      
      const lastBooking = new Date(sub.metadata.lastBookingDate)
      return lastBooking < sixMonthsAgo
    })

    if (inactiveSubscribers.length > 0) {
      const inactiveTemplate = templates.find(t => t.type === 'promotion' && t.status === 'active')
      
      if (inactiveTemplate) {
        const inactiveCampaign: EmailCampaign = {
          id: `auto-inactive-${Date.now()}`,
          name: `รีแอคทีฟผู้ใช้ไม่ active ${todayStr}`,
          subject: '😊 คิดถึงคุณ! รับส่วนลด 30% สำหรับการจองครั้งถัดไป',
          templateId: inactiveTemplate.id,
          type: 'automated',
          status: 'scheduled',
          recipients: {
            type: 'custom',
            customEmails: inactiveSubscribers.map(s => s.email),
            totalCount: inactiveSubscribers.length,
          },
          scheduledAt: new Date().toISOString(),
          automationRules: {
            trigger: 'inactive_user',
            daysAfter: 180,
          },
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          createdBy: 'system-automated',
        }

        campaigns.push(inactiveCampaign)
        results.inactiveUserEmails = inactiveSubscribers.length
      }
    }

    // 4. Check for scheduled campaigns that should be sent today
    const scheduledCampaigns = campaigns.filter(c => {
      if (c.status !== 'scheduled' || !c.scheduledAt) return false
      
      const scheduledDate = new Date(c.scheduledAt).toISOString().split('T')[0]
      return scheduledDate === todayStr
    })

    results.scheduledCampaigns = scheduledCampaigns.length

    // Save updated campaigns
    await writeJson(CAMPAIGNS_FILE, campaigns)

    return NextResponse.json({
      success: true,
      date: todayStr,
      results,
      message: `Automated email check completed. ${results.birthdayEmails + results.anniversaryEmails + results.inactiveUserEmails + results.scheduledCampaigns} campaigns created/scheduled.`
    })
  } catch (error) {
    console.error('Error in automated emails:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process automated emails' 
    }, { status: 500 })
  }
}
