import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { EmailSubscriber } from '@/types/email'

const SUBSCRIBERS_FILE = 'email-subscribers.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')

    let subscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []

    // Filter by status
    if (status) {
      subscribers = subscribers.filter(s => s.status === status)
    }

    // Filter by tag
    if (tag) {
      subscribers = subscribers.filter(s => s.tags.includes(tag))
    }

    // Calculate stats
    const stats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.status === 'active').length,
      unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
      bounced: subscribers.filter(s => s.status === 'bounced').length,
    }

    return NextResponse.json({ subscribers, stats })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, phone, tags = [], source = 'website' } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const subscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []

    // Check if already subscribed
    const existingIndex = subscribers.findIndex(s => s.email.toLowerCase() === email.toLowerCase())
    
    if (existingIndex !== -1) {
      const existing = subscribers[existingIndex]
      
      // If previously unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        subscribers[existingIndex] = {
          ...existing,
          status: 'active',
          name: name || existing.name,
          phone: phone || existing.phone,
          tags: [...new Set([...existing.tags, ...tags])],
          subscribedAt: new Date().toISOString(),
          unsubscribedAt: undefined,
        }
        
        await writeJson(SUBSCRIBERS_FILE, subscribers)
        return NextResponse.json({ 
          message: 'Subscription reactivated successfully',
          subscriber: subscribers[existingIndex]
        })
      }
      
      return NextResponse.json({ 
        error: 'Email already subscribed',
        subscriber: existing
      }, { status: 400 })
    }

    // Create new subscriber
    const newSubscriber: EmailSubscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name,
      phone,
      status: 'active',
      tags,
      preferences: {
        newsletter: true,
        promotions: true,
        booking_updates: true,
        special_events: true,
      },
      source,
      subscribedAt: new Date().toISOString(),
    }

    subscribers.push(newSubscriber)
    await writeJson(SUBSCRIBERS_FILE, subscribers)

    return NextResponse.json({ 
      message: 'Subscribed successfully',
      subscriber: newSubscriber
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating subscriber:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, email, ...updates } = body

    const subscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []
    const index = subscribers.findIndex(s => 
      s.id === id || s.email.toLowerCase() === email?.toLowerCase()
    )

    if (index === -1) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    subscribers[index] = {
      ...subscribers[index],
      ...updates,
    }

    await writeJson(SUBSCRIBERS_FILE, subscribers)

    return NextResponse.json({ 
      message: 'Subscriber updated successfully',
      subscriber: subscribers[index]
    })
  } catch (error) {
    console.error('Error updating subscriber:', error)
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id && !email) {
      return NextResponse.json({ error: 'ID or email required' }, { status: 400 })
    }

    const subscribers = await readJson<EmailSubscriber[]>(SUBSCRIBERS_FILE) || []
    const filtered = subscribers.filter(s => 
      s.id !== id && s.email.toLowerCase() !== email?.toLowerCase()
    )

    if (filtered.length === subscribers.length) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    await writeJson(SUBSCRIBERS_FILE, filtered)

    return NextResponse.json({ message: 'Subscriber deleted successfully' })
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
