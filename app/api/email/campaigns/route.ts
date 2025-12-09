import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { EmailCampaign, EmailSubscriber, EmailTemplate } from '@/types/email'

const CAMPAIGNS_FILE = 'email-campaigns.json'
const SUBSCRIBERS_FILE = 'email-subscribers.json'
const TEMPLATES_FILE = 'email-templates.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let campaigns = await readJson<EmailCampaign[]>(CAMPAIGNS_FILE) || []

    // Filter by status
    if (status) {
      campaigns = campaigns.filter(c => c.status === status)
    }

    // Filter by type
    if (type) {
      campaigns = campaigns.filter(c => c.type === type)
    }

    // Sort by created date (newest first)
    campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, subject, templateId, type, recipients, scheduledAt, automationRules } = body

    // Validation
    if (!name || !subject || !templateId) {
      return NextResponse.json({ 
        error: 'Name, subject, and template ID are required' 
      }, { status: 400 })
    }

    // Verify template exists
    const templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []
    const template = templates.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Calculate recipient count
    const subscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []
    let recipientCount = 0

    if (recipients.type === 'all') {
      recipientCount = subscribers.filter(s => s.status === 'active').length
    } else if (recipients.type === 'segment') {
      recipientCount = subscribers.filter(s => 
        s.status === 'active' && 
        recipients.tags?.some((tag: string) => s.tags.includes(tag))
      ).length
    } else if (recipients.type === 'custom') {
      recipientCount = recipients.customEmails?.length || 0
    }

    const campaigns = await readJson<EmailCampaign[]>(CAMPAIGNS_FILE) || []

    // Create new campaign
    const newCampaign: EmailCampaign = {
      id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      subject,
      templateId,
      type: type || 'immediate',
      status: scheduledAt ? 'scheduled' : 'draft',
      recipients: {
        ...recipients,
        totalCount: recipientCount,
      },
      scheduledAt,
      automationRules,
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
      createdBy: 'admin', // TODO: Get from session
    }

    campaigns.push(newCampaign)
    await writeJson(CAMPAIGNS_FILE, campaigns)

    return NextResponse.json({ 
      message: 'Campaign created successfully',
      campaign: newCampaign
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    const campaigns = await readJson<EmailCampaign[]>(CAMPAIGNS_FILE) || []
    const index = campaigns.findIndex(c => c.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    campaigns[index] = {
      ...campaigns[index],
      ...updates,
    }

    await writeJson(CAMPAIGNS_FILE, campaigns)

    return NextResponse.json({ 
      message: 'Campaign updated successfully',
      campaign: campaigns[index]
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    const campaigns = await readJson<EmailCampaign[]>(CAMPAIGNS_FILE) || []
    const campaign = campaigns.find(c => c.id === id)

    // Don't allow deletion of sending/sent campaigns
    if (campaign && ['sending', 'sent'].includes(campaign.status)) {
      return NextResponse.json({ 
        error: 'Cannot delete campaigns that are sending or have been sent' 
      }, { status: 400 })
    }

    const filtered = campaigns.filter(c => c.id !== id)

    if (filtered.length === campaigns.length) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    await writeJson(CAMPAIGNS_FILE, filtered)

    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
