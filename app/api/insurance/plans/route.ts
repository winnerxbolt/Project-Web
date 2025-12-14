import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let query = supabase.from('insurance_plans').select('*')

    // Filter by type
    if (type) {
      query = query.eq('type', type)
    }

    // Filter active only
    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    // Sort by display order
    query = query.order('display_order', { ascending: true })

    const { data: plans, error } = await query

    if (error) throw error

    return NextResponse.json({ plans: plans || [] })
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

    const { count } = await supabase
      .from('insurance_plans')
      .select('*', { count: 'exact', head: true })

    const newPlan = {
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
      max_claim_amount: maxClaimAmount || 0,
      validity_days: validityDays || 365,
      is_active: true,
      display_order: (count || 0) + 1,
    }

    const { data: plan, error } = await supabaseAdmin
      .from('insurance_plans')
      .insert(newPlan)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      message: 'Insurance plan created successfully',
      plan
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

    const { data: plan, error } = await supabaseAdmin
      .from('insurance_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ 
      message: 'Insurance plan updated successfully',
      plan
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

    const { error } = await supabaseAdmin
      .from('insurance_plans')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Insurance plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting insurance plan:', error)
    return NextResponse.json({ error: 'Failed to delete insurance plan' }, { status: 500 })
  }
}
