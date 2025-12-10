// ========================================
// GROUP BOOKING SYSTEM - TYPE DEFINITIONS
// ระบบจองหมู่คณะ - ประเภทข้อมูล
// ========================================

export type GroupType = 'family' | 'corporate' | 'wedding' | 'friends' | 'educational' | 'other'
export type GroupStatus = 'pending' | 'quoted' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentMethod = 'full' | 'deposit' | 'installment'
export type DiscountType = 'percentage' | 'fixed' | 'tiered'

// Group Booking Request
export interface GroupBookingRequest {
  id: string
  createdAt: string
  updatedAt: string
  status: GroupStatus
  
  // Contact Information
  contactPerson: {
    name: string
    email: string
    phone: string
    company?: string
    position?: string
  }
  
  // Group Details
  groupDetails: {
    type: GroupType
    groupName: string
    numberOfRooms: number
    totalGuests: number
    adultsPerRoom: number[]
    childrenPerRoom: number[]
    specialRequests?: string
  }
  
  // Booking Dates
  dates: {
    checkIn: string
    checkOut: string
    nights: number
    flexibleDates: boolean
    alternativeDates?: string[]
  }
  
  // Room Selection
  rooms: GroupBookingRoom[]
  
  // Pricing
  pricing: {
    subtotal: number
    groupDiscount: number
    groupDiscountPercentage: number
    additionalDiscounts: {
      name: string
      amount: number
      type: DiscountType
    }[]
    taxAmount: number
    totalAmount: number
    depositRequired: number
    currency: string
  }
  
  // Quote Information
  quote?: {
    quoteId: string
    issuedAt: string
    validUntil: string
    quotedBy: string
    quotePdfUrl?: string
    customMessage?: string
  }
  
  // Payment Information
  payment?: {
    method: PaymentMethod
    installmentPlan?: {
      numberOfPayments: number
      payments: {
        dueDate: string
        amount: number
        paid: boolean
        paidAt?: string
      }[]
    }
    depositPaid: boolean
    depositPaidAt?: string
    fullPaid: boolean
    fullPaidAt?: string
  }
  
  // Additional Services
  additionalServices?: {
    id: string
    name: string
    description: string
    price: number
    quantity: number
  }[]
  
  // Notes and Communication
  notes?: string
  internalNotes?: string
  communicationHistory: {
    timestamp: string
    type: 'email' | 'phone' | 'chat' | 'note'
    message: string
    by: string
  }[]
}

// Group Booking Room
export interface GroupBookingRoom {
  roomId: string
  roomName: string
  roomType: string
  quantity: number
  pricePerNight: number
  discountedPrice: number
  totalPrice: number
  adults: number
  children: number
  preferences?: {
    floor?: string
    view?: string
    adjacentRooms?: boolean
    connectingRooms?: boolean
  }
}

// Group Discount Settings
export interface GroupDiscountSettings {
  id: string
  name: string
  enabled: boolean
  
  // Tiered Discounts
  tiers: {
    minRooms: number
    maxRooms?: number
    discountPercentage: number
    description: string
  }[]
  
  // Special Conditions
  conditions: {
    minNights?: number
    validGroupTypes?: GroupType[]
    seasonalMultiplier?: number
    weekdayOnly?: boolean
    weekendOnly?: boolean
  }
  
  // Additional Benefits
  benefits: {
    freeBreakfast?: boolean
    freeTransfer?: boolean
    lateCheckout?: boolean
    earlyCheckin?: boolean
    customBenefits?: string[]
  }
  
  // Admin Settings
  requiresApproval: boolean
  autoApproveUnder: number // Auto-approve if under X rooms
  notifyEmails: string[]
}

// Group Quote Template
export interface GroupQuoteTemplate {
  id: string
  name: string
  language: 'th' | 'en' | 'cn' | 'ru' | 'kr'
  
  // Header
  header: {
    logoUrl: string
    companyName: string
    companyAddress: string
    contactInfo: string
  }
  
  // Content Sections
  content: {
    introduction: string
    termsAndConditions: string
    cancellationPolicy: string
    paymentTerms: string
    additionalNotes: string
  }
  
  // Styling
  styling: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    showPriceBreakdown: boolean
    showRoomImages: boolean
  }
  
  // Footer
  footer: {
    thankyouMessage: string
    contactPerson: string
    signature?: string
  }
}

// Group Booking Statistics
export interface GroupBookingStats {
  period: string
  totalRequests: number
  confirmedBookings: number
  cancelledBookings: number
  totalRevenue: number
  averageGroupSize: number
  averageRoomsPerBooking: number
  topGroupTypes: {
    type: GroupType
    count: number
    revenue: number
  }[]
  conversionRate: number
  averageDiscountGiven: number
}

// Corporate Client
export interface CorporateClient {
  id: string
  companyName: string
  taxId?: string
  industry: string
  
  // Contact Information
  primaryContact: {
    name: string
    position: string
    email: string
    phone: string
  }
  
  alternativeContacts: {
    name: string
    position: string
    email: string
    phone: string
  }[]
  
  // Billing Information
  billingAddress: {
    address: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  
  // Contract Details
  contract?: {
    contractId: string
    startDate: string
    endDate: string
    specialRates: boolean
    creditTerms?: number // Days
    discountPercentage: number
    minimumRoomsPerYear?: number
  }
  
  // Booking History
  totalBookings: number
  totalRevenue: number
  totalRoomNights: number
  lastBookingDate?: string
  
  // Preferences
  preferences: {
    invoiceEmail?: string
    preferredRoomTypes?: string[]
    specialRequests?: string[]
  }
  
  // Status
  status: 'active' | 'inactive' | 'suspended'
  notes?: string
}

// Group Booking Email Templates
export interface GroupBookingEmailTemplate {
  id: string
  name: string
  type: 'quote_request' | 'quote_sent' | 'confirmed' | 'reminder' | 'cancelled'
  subject: string
  body: string
  variables: string[] // e.g., {{groupName}}, {{totalAmount}}, etc.
  attachQuote: boolean
  language: 'th' | 'en' | 'cn' | 'ru' | 'kr'
}
