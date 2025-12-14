import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = supabase.from('date_change_requests').select('*')

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

    // Sort by created date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data: requests, error } = await query

    if (error) throw error

    return NextResponse.json({ requests: requests || [] })
  } catch (error) {
    console.error('Error fetching date change requests:', error)
    return NextResponse.json({ error: 'Failed to fetch date change requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      bookingId, 
      userId, 
      insuranceId,
      originalCheckIn, 
      originalCheckOut,
      requestedCheckIn,
      requestedCheckOut,
      reason 
    } = body

    if (!bookingId || !userId || !requestedCheckIn || !requestedCheckOut) {
      return NextResponse.json({ 
        error: 'Booking ID, User ID, and requested dates are required' 
      }, { status: 400 })
    }

    // Check if there's insurance coverage
    let coveredByInsurance = false
    let insuranceCoverage = 0

    if (insuranceId) {
      const { data: insurance } = await supabase
        .from('booking_insurance')
        .select('*, insurance_plans(*)')
        .eq('id', insuranceId)
        .eq('status', 'active')
        .single()

      if (insurance && insurance.insurance_plans) {
        const plan = insurance.insurance_plans

        if (plan?.coverage?.modification?.enabled) {
          // Count existing change requests for this booking
          const { count } = await supabase
            .from('date_change_requests')
            .select('*', { count: 'exact', head: true })
            .eq('booking_id', bookingId)
            .neq('status', 'rejected')

          if ((count || 0) < plan.coverage.modification.freeChanges) {
            coveredByInsurance = true
            insuranceCoverage = plan.coverage.modification.feeAfterFree
          }
        }
      }
    }

    const changeFee = coveredByInsurance ? 0 : 500 // Default fee
    const priceDifference = 0 // Calculate based on room rates

    const newRequest = {
      booking_id: bookingId,
      insurance_id: insuranceId,
      user_id: userId,
      original_check_in: originalCheckIn || '',
      original_check_out: originalCheckOut || '',
      requested_check_in: requestedCheckIn,
      requested_check_out: requestedCheckOut,
      status: 'pending',
      reason,
      change_fee: changeFee,
      price_difference: priceDifference,
      total_cost: changeFee + priceDifference,
      currency: 'THB',
      covered_by_insurance: coveredByInsurance,
      insurance_coverage: insuranceCoverage,
      metadata: {},
    }

    const { data: dateChangeRequest, error } = await supabaseAdmin
      .from('date_change_requests')
      .insert(newRequest)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      message: 'Date change request submitted successfully',
      request: dateChangeRequest
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting date change request:', error)
    return NextResponse.json({ error: 'Failed to submit date change request' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, approvalNotes, rejectionReason, processedBy } = body

    if (!id) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 })
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
    }

    if (status) updates.status = status
    if (approvalNotes) updates.approval_notes = approvalNotes
    if (rejectionReason) updates.rejection_reason = rejectionReason
    if (processedBy) updates.processed_by = processedBy

    const { data: dateChangeRequest, error } = await supabaseAdmin
      .from('date_change_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ 
      message: 'Date change request updated successfully',
      request: dateChangeRequest
    })
  } catch (error) {
    console.error('Error updating date change request:', error)
    return NextResponse.json({ error: 'Failed to update date change request' }, { status: 500 })
  }
}
