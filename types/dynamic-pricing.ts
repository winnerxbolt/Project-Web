// =====================================================
// DYNAMIC PRICING SYSTEM - TYPE DEFINITIONS
// =====================================================

// Enums
export type PricingRuleType = 
  | 'demand' 
  | 'seasonal' 
  | 'holiday' 
  | 'weekend' 
  | 'time_based' 
  | 'occupancy'
  | 'early_bird'
  | 'last_minute'
  | 'group_size'

export type DemandLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
export type PricingStrategy = 'percentage' | 'fixed_amount' | 'multiplier'
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

// =====================================================
// MAIN INTERFACES
// =====================================================

export interface DynamicPricingRule {
  id: string
  name: string
  nameEn: string
  nameTh: string
  description?: string
  type: PricingRuleType
  isActive: boolean
  priority: number // 1-10, higher = applied first
  
  // Date/Time constraints
  startDate?: string
  endDate?: string
  daysOfWeek?: DayOfWeek[]
  timeSlot?: {
    startTime: string // HH:mm
    endTime: string // HH:mm
  }
  
  // Pricing configuration
  strategy: PricingStrategy
  value: number // percentage, amount, or multiplier
  minPrice?: number
  maxPrice?: number
  
  // Conditions
  conditions?: PricingConditions
  
  // Room specific
  roomIds?: number[] // empty = applies to all
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface PricingConditions {
  minBookingDays?: number
  maxBookingDays?: number
  minAdvanceBooking?: number // days in advance
  maxAdvanceBooking?: number
  minOccupancy?: number // number of guests
  maxOccupancy?: number
  minRooms?: number
  demandLevel?: DemandLevel[]
  occupancyRate?: {
    min: number // 0-100%
    max: number
  }
}

// =====================================================
// DEMAND PRICING
// =====================================================

export interface DemandPricing {
  id: string
  name: string
  demandLevel: DemandLevel
  multiplier: number // 0.5 - 3.0
  color: string
  icon: string
  description: string
  
  // Auto-calculation settings
  autoCalculate: boolean
  thresholds: {
    bookingRate: number // percentage of rooms booked
    searchVolume?: number // searches per hour
    timeWindow: number // hours to consider
  }
  
  isActive: boolean
}

// =====================================================
// SEASONAL PRICING (extends existing)
// =====================================================

export interface SeasonalMultiplier {
  id: string
  seasonName: string
  startDate: string
  endDate: string
  
  // Different multipliers for different days
  weekdayMultiplier: number
  weekendMultiplier: number
  holidayMultiplier: number
  
  // Special conditions
  earlyBirdDiscount?: {
    enabled: boolean
    days: number // book X days in advance
    discount: number // percentage
  }
  
  lastMinuteDiscount?: {
    enabled: boolean
    hours: number // book within X hours
    discount: number // percentage
  }
  
  isRecurring: boolean
  isActive: boolean
  color: string
}

// =====================================================
// TIME-BASED PRICING
// =====================================================

export interface TimeBasedPricing {
  id: string
  name: string
  type: 'early_bird' | 'last_minute' | 'flash_sale'
  
  // Timing
  advanceDays?: number // for early bird
  hoursBeforeCheckIn?: number // for last minute
  
  // Flash sale specific
  flashSale?: {
    startDateTime: string
    endDateTime: string
    limitedQuantity?: number
    soldCount: number
  }
  
  // Discount
  discountType: 'percentage' | 'fixed_amount'
  discountValue: number
  
  // Conditions
  minStayNights?: number
  maxStayNights?: number
  roomIds?: number[]
  
  isActive: boolean
  badge?: string
  emoji?: string
  color: string
}

// =====================================================
// OCCUPANCY-BASED PRICING
// =====================================================

export interface OccupancyPricing {
  id: string
  name: string
  description: string
  
  // Price per additional guest
  baseOccupancy: number // included in base price
  pricePerExtraGuest: number
  maxOccupancy: number
  
  // Group discounts
  groupDiscounts: {
    minGuests: number
    discount: number // percentage
  }[]
  
  // Room-specific
  roomIds?: number[]
  
  isActive: boolean
}

// =====================================================
// PRICE CALCULATION
// =====================================================

export interface PriceCalculationRequest {
  roomId: number
  checkIn: string
  checkOut: string
  guests: number
  rooms?: number
  promoCode?: string
}

export interface PriceCalculationResult {
  success: boolean
  basePrice: number
  finalPrice: number
  totalNights: number
  
  // Breakdown
  breakdown: {
    basePricePerNight: number
    subtotal: number
    
    // Applied rules
    appliedRules: AppliedPricingRule[]
    
    // Adjustments
    demandAdjustment: number
    seasonalAdjustment: number
    weekendAdjustment: number
    occupancyAdjustment: number
    earlyBirdDiscount: number
    lastMinuteDiscount: number
    groupDiscount: number
    promoDiscount: number
    
    // Totals
    totalAdjustments: number
    totalDiscounts: number
    taxes: number
  }
  
  // Recommendations
  savings?: {
    message: string
    amount: number
    alternativeDate?: string
  }
  
  priceHistory?: {
    date: string
    price: number
  }[]
}

export interface AppliedPricingRule {
  ruleId: string
  ruleName: string
  type: PricingRuleType
  adjustment: number // positive = increase, negative = decrease
  percentage?: number
  description: string
  color?: string
}

// =====================================================
// DEMAND ANALYTICS
// =====================================================

export interface DemandAnalytics {
  currentDemand: DemandLevel
  demandScore: number // 0-100
  
  metrics: {
    bookingRate: number // percentage
    searchVolume: number
    availableRooms: number
    totalRooms: number
    averageStayDuration: number
  }
  
  trend: 'increasing' | 'stable' | 'decreasing'
  
  forecast: {
    date: string
    predictedDemand: DemandLevel
    confidence: number
  }[]
  
  recommendations: {
    action: string
    impact: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

// =====================================================
// PRICE HISTORY
// =====================================================

export interface PriceHistory {
  roomId: number
  date: string
  basePrice: number
  finalPrice: number
  demandLevel: DemandLevel
  appliedRules: string[] // rule IDs
  bookingsMade: number
  revenue: number
}

// =====================================================
// REVENUE PROJECTION
// =====================================================

export interface RevenueProjection {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  startDate: string
  endDate: string
  
  projected: {
    revenue: number
    bookings: number
    averageRate: number
    occupancyRate: number
  }
  
  actual?: {
    revenue: number
    bookings: number
    averageRate: number
    occupancyRate: number
  }
  
  comparison: {
    previousPeriod: number // percentage change
    lastYear: number
  }
  
  breakdown: {
    date: string
    revenue: number
    bookings: number
  }[]
}

// =====================================================
// SETTINGS
// =====================================================

export interface DynamicPricingSettings {
  enabled: boolean
  
  // Auto-pricing
  autoPricingEnabled: boolean
  updateFrequency: number // minutes
  
  // Limits
  maxPriceIncrease: number // percentage
  maxPriceDecrease: number // percentage
  minPriceFloor: number // absolute minimum
  
  // Demand calculation
  demandCalculation: {
    bookingRateWeight: number // 0-1
    searchVolumeWeight: number
    timeWindowHours: number
  }
  
  // Notifications
  notifyOnHighDemand: boolean
  notifyOnLowDemand: boolean
  notifyOnPriceChange: boolean
  
  // Advanced
  enableMLPredictions: boolean
  enableCompetitorPricing: boolean
  enableWeatherImpact: boolean
}

// =====================================================
// STATISTICS
// =====================================================

export interface DynamicPricingStats {
  totalRules: number
  activeRules: number
  
  performance: {
    averageIncrease: number // percentage
    revenueGain: number // amount
    conversionRate: number
  }
  
  topPerformingRules: {
    ruleId: string
    ruleName: string
    revenueImpact: number
    timesApplied: number
  }[]
  
  demandDistribution: {
    level: DemandLevel
    percentage: number
    avgPrice: number
  }[]
}
