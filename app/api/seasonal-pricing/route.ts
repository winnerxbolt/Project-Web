import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { SeasonalPricing } from '@/types/blackout'

const DATA_FILE = 'data/seasonal-pricing.json'

// GET - Get seasonal pricing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const active = searchParams.get('active')

    let pricing: SeasonalPricing[] = await readJson(DATA_FILE) || []

    // Filter active only
    if (active === 'true') {
      pricing = pricing.filter((p) => p.isActive)
    }

    // Filter by specific date
    if (date) {
      const targetDate = new Date(date)
      pricing = pricing.filter((p) => {
        const start = new Date(p.startDate)
        const end = new Date(p.endDate)
        return targetDate >= start && targetDate <= end
      })
    }

    // Sort by priority
    pricing.sort((a, b) => b.priority - a.priority)

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error('Error fetching seasonal pricing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasonal pricing' },
      { status: 500 }
    )
  }
}

// POST - Create seasonal pricing
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pricing: SeasonalPricing[] = await readJson(DATA_FILE) || []

    const newPricing: SeasonalPricing = {
      id: `season-${Date.now()}`,
      seasonName: body.seasonName,
      seasonNameTh: body.seasonNameTh || body.seasonName,
      seasonNameEn: body.seasonNameEn || body.seasonName,
      description: body.description || '',
      startDate: body.startDate,
      endDate: body.endDate,
      isRecurring: body.isRecurring ?? false,
      strategy: body.strategy || 'percentage',
      baseAdjustment: body.baseAdjustment || 0,
      roomPricing: body.roomPricing || [],
      minimumStay: body.minimumStay || 1,
      advanceBookingRequired: body.advanceBookingRequired || 0,
      cancellationPolicy: body.cancellationPolicy,
      weekendMultiplier: body.weekendMultiplier,
      longStayDiscount: body.longStayDiscount || [],
      color: body.color || '#4ECDC4',
      badge: body.badge,
      tags: body.tags || [],
      maxBookingsPerDay: body.maxBookingsPerDay,
      enableEarlyBird: body.enableEarlyBird ?? false,
      earlyBirdDiscount: body.earlyBirdDiscount,
      earlyBirdDays: body.earlyBirdDays,
      isActive: body.isActive ?? true,
      priority: body.priority || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    pricing.push(newPricing)
    await writeJson(DATA_FILE, pricing)

    return NextResponse.json({ 
      pricing: newPricing,
      message: 'Seasonal pricing created successfully'
    })
  } catch (error) {
    console.error('Error creating seasonal pricing:', error)
    return NextResponse.json(
      { error: 'Failed to create seasonal pricing' },
      { status: 500 }
    )
  }
}

// PATCH - Update seasonal pricing
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Pricing ID is required' },
        { status: 400 }
      )
    }

    let pricing: SeasonalPricing[] = await readJson(DATA_FILE) || []
    const index = pricing.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Seasonal pricing not found' },
        { status: 404 }
      )
    }

    pricing[index] = {
      ...pricing[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(DATA_FILE, pricing)

    return NextResponse.json({ 
      pricing: pricing[index],
      message: 'Seasonal pricing updated successfully'
    })
  } catch (error) {
    console.error('Error updating seasonal pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update seasonal pricing' },
      { status: 500 }
    )
  }
}

// DELETE - Delete seasonal pricing
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    let pricing: SeasonalPricing[] = await readJson(DATA_FILE) || []
    const filteredPricing = pricing.filter((p) => p.id !== id)

    if (filteredPricing.length === pricing.length) {
      return NextResponse.json(
        { error: 'Seasonal pricing not found' },
        { status: 404 }
      )
    }

    await writeJson(DATA_FILE, filteredPricing)

    return NextResponse.json({ message: 'Seasonal pricing deleted successfully' })
  } catch (error) {
    console.error('Error deleting seasonal pricing:', error)
    return NextResponse.json(
      { error: 'Failed to delete seasonal pricing' },
      { status: 500 }
    )
  }
}
