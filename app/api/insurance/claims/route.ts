import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { InsuranceClaim, BookingInsurance } from '@/types/insurance'

const CLAIMS_FILE = 'insurance-claims.json'
const INSURANCES_FILE = 'booking-insurances.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const insuranceId = searchParams.get('insuranceId')
    const status = searchParams.get('status')

    let claims = await readJson<InsuranceClaim[]>(CLAIMS_FILE) || []

    // Filter by insurance ID
    if (insuranceId) {
      claims = claims.filter(c => c.insuranceId === insuranceId)
    }

    // Filter by status
    if (status) {
      claims = claims.filter(c => c.status === status)
    }

    // Sort by submitted date (newest first)
    claims.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())

    return NextResponse.json({ claims })
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
    const insurances = await readJson<BookingInsurance[]>(INSURANCES_FILE) || []
    const insurance = insurances.find(i => i.id === insuranceId)

    if (!insurance) {
      return NextResponse.json({ error: 'Insurance not found' }, { status: 404 })
    }

    if (insurance.status !== 'active') {
      return NextResponse.json({ error: 'Insurance is not active' }, { status: 400 })
    }

    const claims = await readJson<InsuranceClaim[]>(CLAIMS_FILE) || []

    const newClaim: InsuranceClaim = {
      id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      insuranceId,
      bookingId,
      claimType,
      reason,
      reasonDetails: reasonDetails || '',
      claimAmount: claimAmount || 0,
      approvedAmount: 0,
      currency: insurance.currency,
      status: 'pending',
      submittedDate: new Date().toISOString(),
      documents: documents || [],
      refundType: 'none',
      refundPercentage: 0,
      refundAmount: 0,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    claims.push(newClaim)
    await writeJson(CLAIMS_FILE, claims)

    // Update insurance status
    const insIndex = insurances.findIndex(i => i.id === insuranceId)
    if (insIndex !== -1) {
      insurances[insIndex].claims.push(newClaim)
      insurances[insIndex].status = 'claimed'
      insurances[insIndex].updatedAt = new Date().toISOString()
      await writeJson(INSURANCES_FILE, insurances)
    }

    return NextResponse.json({ 
      message: 'Claim submitted successfully',
      claim: newClaim
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

    const claims = await readJson<InsuranceClaim[]>(CLAIMS_FILE) || []
    const index = claims.findIndex(c => c.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    claims[index] = {
      ...claims[index],
      status: status || claims[index].status,
      approvedAmount: approvedAmount !== undefined ? approvedAmount : claims[index].approvedAmount,
      reviewerNotes,
      rejectionReason,
      processedDate: status === 'approved' || status === 'rejected' ? now : claims[index].processedDate,
      paidDate: status === 'paid' ? now : claims[index].paidDate,
      updatedAt: now,
    }

    // Calculate refund
    if (status === 'approved' && approvedAmount) {
      claims[index].refundAmount = approvedAmount
      claims[index].refundPercentage = (approvedAmount / claims[index].claimAmount) * 100
      claims[index].refundType = approvedAmount >= claims[index].claimAmount ? 'full' : 'partial'
    }

    await writeJson(CLAIMS_FILE, claims)

    return NextResponse.json({ 
      message: 'Claim updated successfully',
      claim: claims[index]
    })
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}
