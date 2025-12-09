import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { InsurancePlan } from '@/types/insurance'

const PLANS_FILE = 'insurance-plans.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let plans = await readJson<InsurancePlan[]>(PLANS_FILE) || []

    // Filter by type
    if (type) {
      plans = plans.filter(p => p.type === type)
    }

    // Filter active only
    if (activeOnly) {
      plans = plans.filter(p => p.isActive)
    }

    // Sort by display order
    plans.sort((a, b) => a.displayOrder - b.displayOrder)

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching insurance plans:', error)
    return NextResponse.json({ error: 'Failed to fetch insurance plans' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, price, description, features, coverage, conditions, excludes, maxClaimAmount, validityDays } = body

    if (!name || !type || !price) {
      return NextResponse.json({ 
        error: 'Name, type, and price are required' 
      }, { status: 400 })
    }

    const plans = await readJson<InsurancePlan[]>(PLANS_FILE) || []

    const newPlan: InsurancePlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      price,
      currency: 'THB',
      description: description || '',
      features: features || [],
      coverage: coverage || {
        cancellation: { enabled: false, refundPercentage: 0, daysBeforeCheckIn: 0, description: '' },
        modification: { enabled: false, freeChanges: 0, feeAfterFree: 0, description: '' },
        travel: { enabled: false, medicalCoverage: 0, accidentCoverage: 0, luggageCoverage: 0, description: '' },
        weatherDisruption: { enabled: false, coverage: 0, description: '' },
        emergencySupport: { enabled: false, hotline247: false, description: '' },
      },
      conditions: conditions || [],
      excludes: excludes || [],
      maxClaimAmount: maxClaimAmount || 0,
      validityDays: validityDays || 365,
      isActive: true,
      displayOrder: plans.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    plans.push(newPlan)
    await writeJson(PLANS_FILE, plans)

    return NextResponse.json({ 
      message: 'Insurance plan created successfully',
      plan: newPlan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance plan:', error)
    return NextResponse.json({ error: 'Failed to create insurance plan' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    const plans = await readJson<InsurancePlan[]>(PLANS_FILE) || []
    const index = plans.findIndex(p => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(PLANS_FILE, plans)

    return NextResponse.json({ 
      message: 'Insurance plan updated successfully',
      plan: plans[index]
    })
  } catch (error) {
    console.error('Error updating insurance plan:', error)
    return NextResponse.json({ error: 'Failed to update insurance plan' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    const plans = await readJson<InsurancePlan[]>(PLANS_FILE) || []
    const filteredPlans = plans.filter(p => p.id !== id)

    if (filteredPlans.length === plans.length) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    await writeJson(PLANS_FILE, filteredPlans)

    return NextResponse.json({ message: 'Insurance plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting insurance plan:', error)
    return NextResponse.json({ error: 'Failed to delete insurance plan' }, { status: 500 })
  }
}
