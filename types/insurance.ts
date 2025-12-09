// Booking Insurance Types

export type InsurancePlanType = 'basic' | 'standard' | 'premium' | 'platinum'
export type InsuranceStatus = 'active' | 'expired' | 'claimed' | 'cancelled' | 'pending'
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'paid'
export type RefundType = 'full' | 'partial' | 'none'
export type CancellationReason = 'customer_request' | 'emergency' | 'illness' | 'weather' | 'travel_restriction' | 'other'

// Insurance Plan
export interface InsurancePlan {
  id: string
  name: string
  type: InsurancePlanType
  price: number
  currency: string
  description: string
  features: string[]
  coverage: {
    cancellation: {
      enabled: boolean
      refundPercentage: number
      daysBeforeCheckIn: number
      description: string
    }
    modification: {
      enabled: boolean
      freeChanges: number
      feeAfterFree: number
      description: string
    }
    travel: {
      enabled: boolean
      medicalCoverage: number
      accidentCoverage: number
      luggageCoverage: number
      description: string
    }
    weatherDisruption: {
      enabled: boolean
      coverage: number
      description: string
    }
    emergencySupport: {
      enabled: boolean
      hotline247: boolean
      description: string
    }
  }
  conditions: string[]
  excludes: string[]
  maxClaimAmount: number
  validityDays: number
  isActive: boolean
  displayOrder: number
  usageCount?: number
  createdAt: string
  updatedAt: string
}

// Booking Insurance
export interface BookingInsurance {
  id: string
  bookingId: string
  planId: string
  planName: string
  planType: InsurancePlanType
  userId: string
  userName: string
  userEmail: string
  
  // Coverage Details
  coverageAmount: number
  premium: number
  currency: string
  
  // Status
  status: InsuranceStatus
  purchaseDate: string
  startDate: string
  endDate: string
  
  // Booking Details
  bookingDetails: {
    roomName: string
    checkIn: string
    checkOut: string
    totalAmount: number
    guests: number
  }
  
  // Claims
  claims: InsuranceClaim[]
  
  // Documents
  policyNumber: string
  certificateUrl?: string
  termsAccepted: boolean
  termsAcceptedAt: string
  
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Insurance Claim
export interface InsuranceClaim {
  id: string
  insuranceId: string
  bookingId: string
  claimType: 'cancellation' | 'modification' | 'medical' | 'travel' | 'weather' | 'other'
  reason: CancellationReason
  reasonDetails: string
  
  // Claim Details
  claimAmount: number
  approvedAmount: number
  currency: string
  
  status: ClaimStatus
  submittedDate: string
  processedDate?: string
  paidDate?: string
  
  // Documents
  documents: {
    type: 'medical' | 'police_report' | 'flight_cancellation' | 'weather_report' | 'receipt' | 'other'
    url: string
    fileName: string
    uploadedAt: string
  }[]
  
  // Processing
  reviewedBy?: string
  reviewerNotes?: string
  rejectionReason?: string
  
  // Refund Details
  refundType: RefundType
  refundPercentage: number
  refundAmount: number
  refundMethod?: 'original_payment' | 'bank_transfer' | 'credit'
  refundReference?: string
  
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Cancellation Policy
export interface CancellationPolicy {
  id: string
  name: string
  description: string
  isDefault: boolean
  
  rules: {
    daysBeforeCheckIn: number
    refundPercentage: number
    description: string
  }[]
  
  conditions: string[]
  isActive: boolean
  applicableRoomTypes?: string[]
  createdAt: string
  updatedAt: string
}

// Date Change Request
export interface DateChangeRequest {
  id: string
  bookingId: string
  insuranceId?: string
  userId: string
  
  // Original Booking
  originalCheckIn: string
  originalCheckOut: string
  
  // Requested Dates
  requestedCheckIn: string
  requestedCheckOut: string
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  reason?: string
  
  // Fees
  changeFee: number
  priceDifference: number
  totalCost: number
  currency: string
  
  // Insurance Coverage
  coveredByInsurance: boolean
  insuranceCoverage: number
  
  // Processing
  processedBy?: string
  processedAt?: string
  approvalNotes?: string
  rejectionReason?: string
  
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Insurance Statistics
export interface InsuranceStats {
  totalPolicies: number
  activePolicies: number
  expiredPolicies: number
  claimedPolicies: number
  
  totalPremium: number
  totalClaims: number
  totalPaid: number
  
  claimsByType: Record<string, number>
  claimsByStatus: Record<ClaimStatus, number>
  
  averageClaimAmount: number
  averageProcessingTime: number // in days
  claimApprovalRate: number // percentage
  
  topReasons: {
    reason: string
    count: number
  }[]
  
  monthlyStats: {
    month: string
    policies: number
    claims: number
    revenue: number
  }[]
}

// Insurance Settings
export interface InsuranceSettings {
  enabled: boolean
  requireInsuranceForBookings: boolean
  defaultPlanId?: string
  
  cancellationPolicies: {
    enabled: boolean
    defaultPolicyId: string
  }
  
  dateChanges: {
    enabled: boolean
    maxChangesAllowed: number
    feePercentage: number
    requireApproval: boolean
  }
  
  claims: {
    autoApproveUnder: number
    requireDocuments: boolean
    processingTimeDays: number
  }
  
  notifications: {
    emailOnPurchase: boolean
    emailOnClaim: boolean
    emailOnApproval: boolean
    smsAlerts: boolean
  }
  
  support: {
    hotline: string
    email: string
    hours: string
  }
  
  updatedAt: string
  updatedBy: string
}
