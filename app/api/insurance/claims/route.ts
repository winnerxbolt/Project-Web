import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const insuranceId = searchParams.get('insuranceId')
    const status = searchParams.get('status')

    let query = supabase.from('insurance_claims').select('*').order('submitted_date', { ascending: false })

    // Filter by insurance ID
    if (insuranceId) {
      query = query.eq('insurance_id', insuranceId)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    const { data: claims, error } = await query

    if (error) throw error

    return NextResponse.json({ claims: claims || [] })
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      insuranceId, 
      bookingId, 
      claimType, 
      reason, 
      reasonDetails, 
      claimAmount,
      documents 
    } = body

    if (!insuranceId || !bookingId || !claimType || !reason) {
      return NextResponse.json({ 
        error: 'Insurance ID, Booking ID, claim type, and reason are required' 
      }, { status: 400 })
    }

    // Verify insurance exists
    const { data: insurance, error: insError } = await supabase
      .from('booking_insurance')
      .select('*')
      .eq('id', insuranceId)
      .single()

    if (insError || !insurance) {
      return NextResponse.json({ error: 'Insurance not found' }, { status: 404 })
    }

    if (insurance.status !== 'active') {
      return NextResponse.json({ error: 'Insurance is not active' }, { status: 400 })
    }

    const newClaim = {
      insurance_id: insuranceId,
      booking_id: bookingId,
      claim_type: claimType,
      reason,
      reason_details: reasonDetails || '',
      claim_amount: claimAmount || 0,
      approved_amount: 0,
      currency: insurance.currency,
      status: 'pending',
      submitted_date: new Date().toISOString(),
      documents: documents || [],
      refund_type: 'none',
      refund_percentage: 0,
      refund_amount: 0,
      metadata: {},
    }

    const { data: claim, error } = await supabaseAdmin
      .from('insurance_claims')
      .insert(newClaim)
      .select()
      .single()

    if (error) throw error

    // Update insurance status
    await supabaseAdmin
      .from('booking_insurance')
      .update({ 
        status: 'claimed',
        updated_at: new Date().toISOString()
      })
      .eq('id', insuranceId)

    return NextResponse.json({ 
      message: 'Claim submitted successfully',
      claim
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting claim:', error)
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, approvedAmount, reviewerNotes, rejectionReason } = body

    if (!id) {
      return NextResponse.json({ error: 'Claim ID required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    const updates: any = {
      updated_at: now,
    }

    if (status) {
      updates.status = status
      if (status === 'approved' || status === 'rejected') {
        updates.processed_date = now
      }
      if (status === 'paid') {
        updates.paid_date = now
      }
    }

    if (approvedAmount !== undefined) updates.approved_amount = approvedAmount
    if (reviewerNotes) updates.reviewer_notes = reviewerNotes
    if (rejectionReason) updates.rejection_reason = rejectionReason

    // Calculate refund
    if (status === 'approved' && approvedAmount) {
      const { data: claim } = await supabase
        .from('insurance_claims')
        .select('claim_amount')
        .eq('id', id)
        .single()

      if (claim) {
        updates.refund_amount = approvedAmount
        updates.refund_percentage = (approvedAmount / claim.claim_amount) * 100
        updates.refund_type = approvedAmount >= claim.claim_amount ? 'full' : 'partial'
      }
    }

    const { data: updatedClaim, error } = await supabaseAdmin
      .from('insurance_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ 
      message: 'Claim updated successfully',
      claim: updatedClaim
    })
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}
