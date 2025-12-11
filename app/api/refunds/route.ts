import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { RefundRequest, RefundStatus } from '@/types/refund'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get refund requests with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as RefundStatus | null
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const filePath = path.join(DATA_DIR, 'refund-requests.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let requests: RefundRequest[] = JSON.parse(data)
    
    // Filter
    if (status) {
      requests = requests.filter(r => r.status === status)
    }
    if (bookingId) {
      requests = requests.filter(r => r.bookingId === parseInt(bookingId))
    }
    if (userId) {
      requests = requests.filter(r => r.userId === userId)
    }
    
    // Sort by newest first
    requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    
    // Paginate
    const total = requests.length
    requests = requests.slice(offset, offset + limit)
    
    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load refund requests'
    }, { status: 500 })
  }
}

// POST - Create refund request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.bookingId || !body.userId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID and User ID are required'
      }, { status: 400 })
    }
    
    // Load booking data to verify
    const bookingsPath = path.join(DATA_DIR, 'bookings.json')
    const bookingsData = await fs.readFile(bookingsPath, 'utf-8')
    const bookings = JSON.parse(bookingsData)
    const booking = bookings.find((b: any) => b.id === body.bookingId)
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }
    
    // Check if already has refund request
    const refundsPath = path.join(DATA_DIR, 'refund-requests.json')
    const refundsData = await fs.readFile(refundsPath, 'utf-8')
    const existingRefunds: RefundRequest[] = JSON.parse(refundsData)
    
    const existingRequest = existingRefunds.find(r => 
      r.bookingId === body.bookingId && 
      !['rejected', 'cancelled', 'completed'].includes(r.status)
    )
    
    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'Refund request already exists for this booking'
      }, { status: 400 })
    }
    
    // Calculate refund amount
    const calculation = await calculateRefund(
      booking.totalPrice,
      booking.checkIn,
      body.policyId || 'policy_flexible'
    )
    
    // Create refund request
    const newRequest: RefundRequest = {
      id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: body.bookingId,
      userId: body.userId,
      
      guestName: booking.guestName || body.guestName,
      guestEmail: booking.email || body.guestEmail,
      guestPhone: booking.phone || body.guestPhone,
      roomName: booking.roomName || body.roomName,
      checkInDate: booking.checkIn,
      checkOutDate: booking.checkOut,
      originalAmount: booking.totalPrice,
      paidAmount: booking.totalPrice,
      
      requestedAmount: body.requestedAmount || calculation.calculation.netRefund,
      calculatedAmount: calculation.calculation.netRefund,
      finalAmount: 0,
      refundPercentage: calculation.appliedRule.refundPercentage,
      deductionAmount: calculation.calculation.deductionAmount,
      
      reason: body.reason || 'personal',
      reasonDetail: body.reasonDetail || '',
      requestDate: new Date().toISOString(),
      cancellationDate: body.cancellationDate || new Date().toISOString(),
      
      policyId: body.policyId || 'policy_flexible',
      policyName: body.policyName || 'Flexible',
      policyType: body.policyType || 'flexible',
      
      status: 'pending',
      priority: calculatePriority(calculation.calculation.netRefund, booking.checkIn),
      
      refundMethod: body.refundMethod || 'bank_transfer',
      bankDetails: body.bankDetails,
      promptPayNumber: body.promptPayNumber,
      
      attachments: body.attachments || [],
      messages: [],
      timeline: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: 'Refund request submitted'
      }],
      
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      metadata: body.metadata,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Check auto-approval
    const settingsPath = path.join(DATA_DIR, 'refund-settings.json')
    const settingsData = await fs.readFile(settingsPath, 'utf-8')
    const settings = JSON.parse(settingsData)
    
    if (settings.autoApproval.enabled && 
        newRequest.calculatedAmount <= settings.autoApproval.maxAmount) {
      newRequest.status = 'approved'
      newRequest.approvedBy = 'system'
      newRequest.approvedAt = new Date().toISOString()
      newRequest.approvalNotes = 'Auto-approved (under threshold)'
      newRequest.finalAmount = newRequest.calculatedAmount
      newRequest.timeline.push({
        status: 'approved',
        timestamp: new Date().toISOString(),
        note: 'Auto-approved by system'
      })
    }
    
    existingRefunds.push(newRequest)
    await fs.writeFile(refundsPath, JSON.stringify(existingRefunds, null, 2))
    
    return NextResponse.json({
      success: true,
      request: newRequest,
      message: newRequest.status === 'approved' 
        ? 'Refund request approved automatically'
        : 'Refund request submitted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create refund request'
    }, { status: 500 })
  }
}

// PUT - Update refund request (approve, reject, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Refund request ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'refund-requests.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const requests: RefundRequest[] = JSON.parse(data)
    
    const index = requests.findIndex(r => r.id === body.id)
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Refund request not found'
      }, { status: 404 })
    }
    
    const refund = requests[index]
    
    // Update based on action
    if (body.action === 'approve') {
      refund.status = 'approved'
      refund.approvedBy = body.approvedBy || 'admin'
      refund.approvedAt = new Date().toISOString()
      refund.approvalNotes = body.notes
      refund.finalAmount = body.finalAmount || refund.calculatedAmount
      refund.timeline.push({
        status: 'approved',
        timestamp: new Date().toISOString(),
        note: body.notes || 'Approved by admin',
        by: body.approvedBy
      })
    } else if (body.action === 'reject') {
      refund.status = 'rejected'
      refund.rejectedBy = body.rejectedBy || 'admin'
      refund.rejectedAt = new Date().toISOString()
      refund.rejectionReason = body.reason || 'Not eligible'
      refund.timeline.push({
        status: 'rejected',
        timestamp: new Date().toISOString(),
        note: body.reason || 'Rejected by admin',
        by: body.rejectedBy
      })
    } else if (body.action === 'process') {
      refund.status = 'processing'
      refund.processedBy = body.processedBy || 'admin'
      refund.processedAt = new Date().toISOString()
      refund.processingNotes = body.notes
      refund.timeline.push({
        status: 'processing',
        timestamp: new Date().toISOString(),
        note: body.notes || 'Processing refund',
        by: body.processedBy
      })
    } else if (body.action === 'complete') {
      refund.status = 'completed'
      refund.completedAt = new Date().toISOString()
      refund.timeline.push({
        status: 'completed',
        timestamp: new Date().toISOString(),
        note: 'Refund completed'
      })
    } else if (body.action === 'cancel') {
      refund.status = 'cancelled'
      refund.timeline.push({
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        note: body.reason || 'Cancelled by user'
      })
    }
    
    // Add message if provided
    if (body.message) {
      refund.messages.push({
        id: `msg_${Date.now()}`,
        from: body.from || 'admin',
        message: body.message,
        timestamp: new Date().toISOString()
      })
    }
    
    refund.updatedAt = new Date().toISOString()
    requests[index] = refund
    
    await fs.writeFile(filePath, JSON.stringify(requests, null, 2))
    
    return NextResponse.json({
      success: true,
      request: refund,
      message: `Refund request ${body.action}d successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update refund request'
    }, { status: 500 })
  }
}

// Helper function to calculate refund
async function calculateRefund(bookingAmount: number, checkInDate: string, policyId: string) {
  const policiesPath = path.join(DATA_DIR, 'cancellation-policies.json')
  const policiesData = await fs.readFile(policiesPath, 'utf-8')
  const policies = JSON.parse(policiesData)
  
  const policy = policies.find((p: any) => p.id === policyId) || policies[0]
  
  const checkIn = new Date(checkInDate)
  const now = new Date()
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // Find applicable rule
  let applicableRule = policy.rules[policy.rules.length - 1]
  for (const rule of policy.rules) {
    if (daysUntilCheckIn >= rule.daysBeforeCheckIn) {
      applicableRule = rule
      break
    }
  }
  
  const refundableAmount = (bookingAmount * applicableRule.refundPercentage) / 100
  const deduction = applicableRule.deductionAmount || 0
  const netRefund = Math.max(0, refundableAmount - deduction)
  
  return {
    bookingAmount,
    daysUntilCheckIn,
    policyRules: policy.rules,
    calculation: {
      baseAmount: bookingAmount,
      refundPercentage: applicableRule.refundPercentage,
      refundableAmount,
      deductionAmount: deduction,
      finalRefund: netRefund,
      processingFee: 0,
      netRefund
    },
    breakdown: [
      {
        description: 'Booking Amount',
        amount: bookingAmount,
        type: 'addition' as const
      },
      {
        description: `Refund (${applicableRule.refundPercentage}%)`,
        amount: refundableAmount,
        type: 'addition' as const
      },
      ...(deduction > 0 ? [{
        description: 'Deduction',
        amount: deduction,
        type: 'deduction' as const
      }] : [])
    ],
    appliedRule: {
      daysBeforeCheckIn: applicableRule.daysBeforeCheckIn,
      refundPercentage: applicableRule.refundPercentage,
      description: `Cancel ${applicableRule.daysBeforeCheckIn}+ days before: ${applicableRule.refundPercentage}% refund`
    }
  }
}

// Helper to calculate priority
function calculatePriority(amount: number, checkInDate: string): 'low' | 'normal' | 'high' | 'urgent' {
  const daysUntilCheckIn = Math.ceil((new Date(checkInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilCheckIn < 1) return 'urgent'
  if (amount > 50000 || daysUntilCheckIn < 3) return 'high'
  if (amount > 20000 || daysUntilCheckIn < 7) return 'normal'
  return 'low'
}
