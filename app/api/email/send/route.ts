import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { EmailCampaign, EmailSubscriber, EmailTemplate } from '@/types/email'
import { sendEmail as sendEmailService, replaceVariables } from '@/lib/server/emailService'

const CAMPAIGNS_FILE = 'email-campaigns.json'
const SUBSCRIBERS_FILE = 'email-subscribers.json'
const TEMPLATES_FILE = 'email-templates.json'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignId, testEmail } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    // Load campaign
    const campaigns = await readJson<EmailCampaign[]>(CAMPAIGNS_FILE) || []
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId)
    
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const campaign = campaigns[campaignIndex]

    // Load template
    const templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []
    const template = templates.find(t => t.id === campaign.templateId)
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // If test email, send to one address only
    if (testEmail) {
      const variables = {
        customer_name: 'Test User',
        hotel_name: 'Pool Villa Pattaya',
        discount: '20',
        coupon_code: 'TEST20',
        valid_until: '31 ธันวาคม 2025',
      }

      const subject = replaceVariables(campaign.subject, variables)
      const html = replaceVariables(template.htmlContent, variables)
      const text = replaceVariables(template.textContent || '', variables)

      // Send test email using nodemailer
      await sendEmailService({
        to: testEmail,
        subject,
        html,
        text,
      })

      return NextResponse.json({ 
        message: 'Test email sent successfully',
        recipient: testEmail
      })
    }

    // Check if campaign can be sent
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return NextResponse.json({ 
        error: 'Campaign has already been sent or is currently sending' 
      }, { status: 400 })
    }

    // Update campaign status to sending
    campaigns[campaignIndex].status = 'sending'
    await writeJson(CAMPAIGNS_FILE, campaigns)

    // Load subscribers
    const allSubscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []
    
    // Filter recipients based on campaign settings
    let recipients: EmailSubscriber[] = []

    if (campaign.recipients.type === 'all') {
      recipients = allSubscribers.filter(s => s.status === 'active')
    } else if (campaign.recipients.type === 'segment') {
      recipients = allSubscribers.filter(s => 
        s.status === 'active' && 
        campaign.recipients.tags?.some(tag => s.tags.includes(tag))
      )
      
      // Exclude tags
      if (campaign.recipients.excludeTags?.length) {
        recipients = recipients.filter(s =>
          !campaign.recipients.excludeTags?.some(tag => s.tags.includes(tag))
        )
      }
    } else if (campaign.recipients.type === 'custom') {
      const customEmails = campaign.recipients.customEmails || []
      recipients = allSubscribers.filter(s => 
        s.status === 'active' && 
        customEmails.includes(s.email)
      )
    }

    // Check if there are any recipients
    if (recipients.length === 0) {
      // Rollback campaign status
      campaigns[campaignIndex].status = 'draft'
      await writeJson(CAMPAIGNS_FILE, campaigns)
      
      return NextResponse.json({ 
        error: 'ไม่พบผู้รับอีเมล กรุณาเพิ่ม Subscribers หรือเปลี่ยนประเภทผู้รับ',
        details: {
          totalSubscribers: allSubscribers.length,
          activeSubscribers: allSubscribers.filter(s => s.status === 'active').length,
          recipientType: campaign.recipients.type,
        }
      }, { status: 400 })
    }

    // Send emails
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const subscriber of recipients) {
      try {
        const variables = {
          customer_name: subscriber.name || 'ลูกค้าที่เคารพ',
          customer_email: subscriber.email,
          hotel_name: 'Pool Villa Pattaya',
          discount: '20',
          coupon_code: 'SPECIAL20',
          valid_until: '31 ธันวาคม 2025',
        }

        const subject = replaceVariables(campaign.subject, variables)
        const html = replaceVariables(template.htmlContent, variables)
        const text = replaceVariables(template.textContent || '', variables)

        // Send email using nodemailer
        await sendEmailService({
          to: subscriber.email,
          subject,
          html,
          text,
        })
        sent++

        // Update subscriber last email sent
        const subIndex = allSubscribers.findIndex(s => s.id === subscriber.id)
        if (subIndex !== -1) {
          allSubscribers[subIndex].lastEmailSent = new Date().toISOString()
        }
      } catch (error) {
        failed++
        errors.push(`Failed to send to ${subscriber.email}: ${error}`)
        console.error(`Error sending to ${subscriber.email}:`, error)
      }
    }

    // Update campaign stats and status
    campaigns[campaignIndex].stats.sent = sent
    campaigns[campaignIndex].stats.failed = failed
    campaigns[campaignIndex].stats.delivered = sent // In production, track actual delivery
    campaigns[campaignIndex].status = 'sent'
    campaigns[campaignIndex].sentAt = new Date().toISOString()

    // Update template usage count
    const templateIndex = templates.findIndex(t => t.id === campaign.templateId)
    if (templateIndex !== -1) {
      templates[templateIndex].usageCount++
      await writeJson(TEMPLATES_FILE, templates)
    }

    // Save updated data
    await writeJson(CAMPAIGNS_FILE, campaigns)
    await writeJson(SUBSCRIBERS_FILE, allSubscribers)

    return NextResponse.json({ 
      message: 'Campaign sent successfully',
      stats: {
        total: recipients.length,
        sent,
        failed,
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error sending campaign:', error)
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการส่ง Campaign',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
