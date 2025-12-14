import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Get seasonal pricing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const active = searchParams.get('active')

    let query = supabase.from('seasonal_pricing').select('*')

    // Filter active only
    if (active === 'true') {
      query = query.eq('is_active', true)
    }

    // Filter by specific date
    if (date) {
      query = query.lte('start_date', date).gte('end_date', date)
    }

    // Sort by priority
    query = query.order('priority', { ascending: false })

    const { data: pricing, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ pricing: pricing || [] })
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

    const { data: newPricing, error } = await supabaseAdmin
      .from('seasonal_pricing')
      .insert({
        season_name: body.seasonName,
        season_name_th: body.seasonNameTh || body.seasonName,
        season_name_en: body.seasonNameEn || body.seasonName,
        description: body.description || '',
        start_date: body.startDate,
        end_date: body.endDate,
        is_recurring: body.isRecurring ?? false,
        strategy: body.strategy || 'percentage',
        base_adjustment: body.baseAdjustment || 0,
        room_pricing: body.roomPricing || [],
        minimum_stay: body.minimumStay || 1,
        advance_booking_required: body.advanceBookingRequired || 0,
        cancellation_policy: body.cancellationPolicy,
        weekend_multiplier: body.weekendMultiplier,
        long_stay_discount: body.longStayDiscount || [],
        color: body.color || '#4ECDC4',
        badge: body.badge,
        tags: body.tags || [],
        max_bookings_per_day: body.maxBookingsPerDay,
        enable_early_bird: body.enableEarlyBird ?? false,
        early_bird_discount: body.earlyBirdDiscount,
        early_bird_days: body.earlyBirdDays,
        is_active: body.isActive ?? true,
        priority: body.priority || 5
      })
      .select()
      .single()

    if (error) {
      throw error
    }

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

    // Convert camelCase to snake_case for Supabase
    const dbUpdates: any = {}
    if (updates.seasonName !== undefined) dbUpdates.season_name = updates.seasonName
    if (updates.seasonNameTh !== undefined) dbUpdates.season_name_th = updates.seasonNameTh
    if (updates.seasonNameEn !== undefined) dbUpdates.season_name_en = updates.seasonNameEn
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring
    if (updates.strategy !== undefined) dbUpdates.strategy = updates.strategy
    if (updates.baseAdjustment !== undefined) dbUpdates.base_adjustment = updates.baseAdjustment
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority
    dbUpdates.updated_at = new Date().toISOString()

    const { data: updatedPricing, error } = await supabaseAdmin
      .from('seasonal_pricing')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Seasonal pricing not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ 
      pricing: updatedPricing,
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

    const { error } = await supabaseAdmin
      .from('seasonal_pricing')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Seasonal pricing deleted successfully' })
  } catch (error) {
    console.error('Error deleting seasonal pricing:', error)
    return NextResponse.json(
      { error: 'Failed to delete seasonal pricing' },
      { status: 500 }
    )
  }
}
