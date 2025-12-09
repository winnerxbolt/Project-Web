import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { BookingInsurance, InsurancePlan } from '@/types/insurance'

const INSURANCES_FILE = 'booking-insurances.json'
const PLANS_FILE = 'insurance-plans.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let insurances = await readJson<BookingInsurance[]>(INSURANCES_FILE) || []

    // Filter by booking ID
    if (bookingId) {
      insurances = insurances.filter(i => i.bookingId === bookingId)
    }

    // Filter by user ID
    if (userId) {
      insurances = insurances.filter(i => i.userId === userId)
    }

    // Filter by status
    if (status) {
      insurances = insurances.filter(i => i.status === status)
    }

    // Sort by created date (newest first)
    insurances.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate stats
    const stats = {
      total: insurances.length,
      active: insurances.filter(i => i.status === 'active').length,
      expired: insurances.filter(i => i.status === 'expired').length,
      claimed: insurances.filter(i => i.status === 'claimed').length,
      totalPremium: insurances.reduce((sum, i) => sum + i.premium, 0),
    }

    return NextResponse.json({ insurances, stats })
  } catch (error) {
    console.error('Error fetching insurances:', error)
    return NextResponse.json({ error: 'Failed to fetch insurances' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, planId, userId, userName, userEmail, bookingDetails } = body

    if (!bookingId || !planId || !userId) {
      return NextResponse.json({ 
        error: 'Booking ID, Plan ID, and User ID are required' 
      }, { status: 400 })
    }

    // Load plan details
    const plans = await readJson<InsurancePlan[]>(PLANS_FILE) || []
    const plan = plans.find(p => p.id === planId)

    if (!plan) {
      return NextResponse.json({ error: 'Insurance plan not found' }, { status: 404 })
    }

    const insurances = await readJson<BookingInsurance[]>(INSURANCES_FILE) || []

    // Check if insurance already exists for this booking
    const existing = insurances.find(i => i.bookingId === bookingId)
    if (existing) {
      return NextResponse.json({ 
        error: 'Insurance already purchased for this booking' 
      }, { status: 400 })
    }

    const now = new Date()
    const endDate = new Date(now.getTime() + plan.validityDays * 24 * 60 * 60 * 1000)

    const newInsurance: BookingInsurance = {
      id: `ins-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      planId: plan.id,
      planName: plan.name,
      planType: plan.type,
      userId,
      userName: userName || '',
      userEmail: userEmail || '',
      coverageAmount: plan.maxClaimAmount,
      premium: plan.price,
      currency: plan.currency,
      status: 'active',
      purchaseDate: now.toISOString(),
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      bookingDetails: bookingDetails || {
        roomName: '',
        checkIn: '',
        checkOut: '',
        totalAmount: 0,
        guests: 1,
      },
      claims: [],
      policyNumber: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      termsAccepted: true,
      termsAcceptedAt: now.toISOString(),
      metadata: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    insurances.push(newInsurance)
    await writeJson(INSURANCES_FILE, insurances)

    return NextResponse.json({ 
      message: 'Insurance purchased successfully',
      insurance: newInsurance
    }, { status: 201 })
  } catch (error) {
    console.error('Error purchasing insurance:', error)
    return NextResponse.json({ error: 'Failed to purchase insurance' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Insurance ID required' }, { status: 400 })
    }

    const insurances = await readJson<BookingInsurance[]>(INSURANCES_FILE) || []
    const index = insurances.findIndex(i => i.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Insurance not found' }, { status: 404 })
    }

    insurances[index] = {
      ...insurances[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(INSURANCES_FILE, insurances)

    return NextResponse.json({ 
      message: 'Insurance updated successfully',
      insurance: insurances[index]
    })
  } catch (error) {
    console.error('Error updating insurance:', error)
    return NextResponse.json({ error: 'Failed to update insurance' }, { status: 500 })
  }
}
