// Blackout Dates & Holiday Management Types

export type BlackoutType = 'holiday' | 'maintenance' | 'private_event' | 'seasonal' | 'custom'
export type BlackoutStatus = 'active' | 'scheduled' | 'expired' | 'cancelled'
export type PricingStrategy = 'percentage' | 'fixed_amount' | 'multiplier'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

// Blackout Date
export interface BlackoutDate {
  id: string
  type: BlackoutType
  title: string
  description: string
  startDate: string
  endDate: string
  status: BlackoutStatus
  
  // Affected Resources
  roomIds: string[] // Empty array = all rooms
  locationIds: string[] // Empty array = all locations
  
  // Pricing Impact
  priceAdjustment?: {
    enabled: boolean
    strategy: PricingStrategy
    value: number // percentage, fixed amount, or multiplier
    minPrice?: number
    maxPrice?: number
  }
  
  // Restrictions
  allowBooking: boolean // false = complete blackout
  minimumStay?: number // minimum nights required
  maximumStay?: number // maximum nights allowed
  advanceBookingDays?: number // how many days in advance booking required
  
  // Recurrence
  recurrence: {
    type: RecurrenceType
    interval?: number // every X days/weeks/months
    endRecurrence?: string // when to stop recurring
  }
  
  // Metadata
  color: string // for calendar display
  icon?: string
  priority: number // higher priority overrides lower
  createdBy: string
  createdAt: string
  updatedAt: string
  notes?: string
}

// Holiday Date
export interface HolidayDate {
  id: string
  name: string
  nameEn: string
  nameTh: string
  date: string
  endDate?: string // for multi-day holidays
  type: 'public' | 'religious' | 'cultural' | 'seasonal'
  country: string
  isRecurring: boolean
  
  // Pricing
  priceMultiplier: number // e.g., 1.5 = 50% increase
  minStayRequired: number
  
  // Display
  color: string
  emoji: string
  description?: string
  
  // Status
  isActive: boolean
  year: number
  createdAt: string
  updatedAt: string
}

// Maintenance Schedule
export interface MaintenanceSchedule {
  id: string
  title: string
  description: string
  type: 'routine' | 'repair' | 'renovation' | 'inspection' | 'deep_cleaning'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Timing
  startDate: string
  endDate: string
  estimatedDuration: number // in hours
  
  // Affected Areas
  roomIds: string[]
  locationIds: string[]
  facilities: string[] // pool, gym, restaurant, etc.
  
  // Impact
  affectsBooking: boolean
  partialClosure: boolean // can still book but with limitations
  alternativeAvailable: boolean
  
  // Staff Assignment
  assignedTo: string[]
  contractor?: string
  cost?: number
  
  // Status Tracking
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed'
  completionPercentage: number
  
  // Notifications
  notifyGuests: boolean
  notificationSent: boolean
  guestMessage?: string
  
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// Seasonal Pricing
export interface SeasonalPricing {
  id: string
  seasonName: string
  seasonNameTh: string
  seasonNameEn: string
  description: string
  
  // Period
  startDate: string
  endDate: string
  isRecurring: boolean
  
  // Pricing Strategy
  strategy: PricingStrategy
  baseAdjustment: number // percentage or fixed amount
  
  // Room-specific pricing
  roomPricing: {
    roomId: string
    roomName: string
    adjustment: number
    finalPrice?: number
  }[]
  
  // Conditions
  minimumStay: number
  advanceBookingRequired: number
  cancellationPolicy?: string
  
  // Special Rules
  weekendMultiplier?: number // extra multiplier for Fri-Sun
  longStayDiscount?: {
    nights: number
    discount: number
  }[]
  
  // Display
  color: string
  badge?: string // "Hot Season", "Low Season", etc.
  tags: string[]
  
  // Availability
  maxBookingsPerDay?: number
  enableEarlyBird?: boolean
  earlyBirdDiscount?: number
  earlyBirdDays?: number
  
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

// Blackout Calendar View
export interface BlackoutCalendarDay {
  date: string
  isBlackout: boolean
  blackoutReasons: string[]
  holidayName?: string
  maintenanceCount: number
  priceMultiplier: number
  availableRooms: number
  totalRooms: number
  color: string
  status: 'available' | 'limited' | 'blocked' | 'maintenance'
}

// Availability Check Result
export interface AvailabilityCheckResult {
  available: boolean
  reason?: string
  blackoutDates: BlackoutDate[]
  holidays: HolidayDate[]
  maintenanceSchedules: MaintenanceSchedule[]
  pricing: {
    basePrice: number
    adjustedPrice: number
    adjustments: {
      type: string
      name: string
      amount: number
      reason: string
    }[]
    totalAdjustment: number
  }
  restrictions: {
    minimumStay?: number
    maximumStay?: number
    advanceBookingRequired?: number
  }
  alternativeRooms?: string[]
}

// Statistics
export interface BlackoutStats {
  totalBlackoutDays: number
  upcomingHolidays: number
  activeMaintenances: number
  seasonalPricingActive: number
  averagePriceIncrease: number
  bookedDuringBlackout: number
  revenueLostToBlackout: number
  maintenanceCompleted: number
  maintenancePending: number
}

// Settings
export interface BlackoutSettings {
  autoApplyHolidays: boolean
  defaultHolidayMultiplier: number
  defaultMinimumStay: number
  allowOverrideBlackout: boolean // admin can override
  notifyGuestsBeforeMaintenance: number // days before
  showBlackoutOnPublicCalendar: boolean
  defaultMaintenanceColor: string
  defaultHolidayColor: string
  defaultSeasonalColor: string
}
