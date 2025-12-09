import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { DateChangeRequest, BookingInsurance, InsurancePlan } from '@/types/insurance'

const REQUESTS_FILE = 'date-change-requests.json'
const INSURANCES_FILE = 'booking-insurances.json'
const PLANS_FILE = 'insurance-plans.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let requests = await readJson<DateChangeRequest[]>(REQUESTS_FILE) || []

    // Filter by booking ID
    if (bookingId) {
      requests = requests.filter(r => r.bookingId === bookingId)
    }

    // Filter by user ID
    if (userId) {
      requests = requests.filter(r => r.userId === userId)
    }

    // Filter by status
    if (status) {
      requests = requests.filter(r => r.status === status)
    }

    // Sort by created date (newest first)
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ requests })
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

    const requests = await readJson<DateChangeRequest[]>(REQUESTS_FILE) || []

    // Check if there's insurance coverage
    let coveredByInsurance = false
    let insuranceCoverage = 0

    if (insuranceId) {
      const insurances = await readJson<BookingInsurance[]>(INSURANCES_FILE) || []
      const insurance = insurances.find(i => i.id === insuranceId && i.status === 'active')

      if (insurance) {
        const plans = await readJson<InsurancePlan[]>(PLANS_FILE) || []
        const plan = plans.find(p => p.id === insurance.planId)

        if (plan?.coverage.modification.enabled) {
          // Count existing change requests for this booking
          const existingChanges = requests.filter(
            r => r.bookingId === bookingId && r.status !== 'rejected'
          ).length

          if (existingChanges < plan.coverage.modification.freeChanges) {
            coveredByInsurance = true
            insuranceCoverage = plan.coverage.modification.feeAfterFree
          }
        }
      }
    }

    const changeFee = coveredByInsurance ? 0 : 500 // Default fee
    const priceDifference = 0 // Calculate based on room rates

    const newRequest: DateChangeRequest = {
      id: `dcr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      insuranceId,
      userId,
      originalCheckIn: originalCheckIn || '',
      originalCheckOut: originalCheckOut || '',
      requestedCheckIn,
      requestedCheckOut,
      status: 'pending',
      reason,
      changeFee,
      priceDifference,
      totalCost: changeFee + priceDifference,
      currency: 'THB',
      coveredByInsurance,
      insuranceCoverage,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    requests.push(newRequest)
    await writeJson(REQUESTS_FILE, requests)

    return NextResponse.json({ 
      message: 'Date change request submitted successfully',
      request: newRequest
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

    const requests = await readJson<DateChangeRequest[]>(REQUESTS_FILE) || []
    const index = requests.findIndex(r => r.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    requests[index] = {
      ...requests[index],
      status: status || requests[index].status,
      approvalNotes,
      rejectionReason,
      processedBy,
      processedAt: now,
      updatedAt: now,
    }

    await writeJson(REQUESTS_FILE, requests)

    return NextResponse.json({ 
      message: 'Date change request updated successfully',
      request: requests[index]
    })
  } catch (error) {
    console.error('Error updating date change request:', error)
    return NextResponse.json({ error: 'Failed to update date change request' }, { status: 500 })
  }
}
