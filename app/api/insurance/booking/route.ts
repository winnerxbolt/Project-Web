import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = supabase.from('booking_insurance').select('*').order('created_at', { ascending: false })

    // Filter by booking ID
    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    // Filter by user ID
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    const { data: insurances, error } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      total: insurances?.length || 0,
      active: insurances?.filter(i => i.status === 'active').length || 0,
      expired: insurances?.filter(i => i.status === 'expired').length || 0,
      claimed: insurances?.filter(i => i.status === 'claimed').length || 0,
      totalPremium: insurances?.reduce((sum, i) => sum + i.premium, 0) || 0,
    }

    return NextResponse.json({ insurances: insurances || [], stats })
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
    const { data: plan, error: planError } = await supabase
      .from('insurance_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Insurance plan not found' }, { status: 404 })
    }

    // Check if insurance already exists for this booking
    const { data: existing } = await supabase
      .from('booking_insurance')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: 'Insurance already purchased for this booking' 
      }, { status: 400 })
    }

    const now = new Date()
    const endDate = new Date(now.getTime() + plan.validity_days * 24 * 60 * 60 * 1000)

    const newInsurance = {
      booking_id: bookingId,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_type: plan.type,
      user_id: userId,
      user_name: userName || '',
      user_email: userEmail || '',
      coverage_amount: plan.max_claim_amount,
      premium: plan.price,
      currency: plan.currency,
      status: 'active',
      purchase_date: now.toISOString(),
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      booking_details: bookingDetails || {
        roomName: '',
        checkIn: '',
        checkOut: '',
        totalAmount: 0,
        guests: 1,
      },
      claims: [],
      policy_number: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      terms_accepted: true,
      terms_accepted_at: now.toISOString(),
      metadata: {},
    }

    const { data: insurance, error } = await supabaseAdmin
      .from('booking_insurance')
      .insert(newInsurance)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      message: 'Insurance purchased successfully',
      insurance
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

    const { data: insurance, error } = await supabaseAdmin
      .from('booking_insurance')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Insurance not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ 
      message: 'Insurance updated successfully',
      insurance
    })
  } catch (error) {
    console.error('Error updating insurance:', error)
    return NextResponse.json({ error: 'Failed to update insurance' }, { status: 500 })
  }
}
