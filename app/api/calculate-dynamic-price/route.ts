import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
  PriceCalculationRequest,
  PriceCalculationResult,
  AppliedPricingRule,
  DemandLevel,
  DynamicPricingRule,
  DemandPricing,
  DynamicPricingSettings
} from '@/types/dynamic-pricing'

const RULES_PATH = path.join(process.cwd(), 'data', 'dynamic-pricing-rules.json')
const DEMAND_PATH = path.join(process.cwd(), 'data', 'demand-pricing.json')
const SETTINGS_PATH = path.join(process.cwd(), 'data', 'dynamic-pricing-settings.json')
const BOOKINGS_PATH = path.join(process.cwd(), 'data', 'bookings.json')
const ROOMS_PATH = path.join(process.cwd(), 'data', 'rooms.json')
const HOLIDAYS_PATH = path.join(process.cwd(), 'data', 'holidays.json')
// const SEASONAL_PATH = path.join(process.cwd(), 'data', 'seasonal-pricing.json')

// Helper: Load JSON file
const loadJSON = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error)
  }
  return []
}

// Helper: Calculate demand level
const calculateDemandLevel = (checkIn: string, checkOut: string, roomId?: number): DemandLevel => {
  const bookings = loadJSON(BOOKINGS_PATH)
  const rooms = loadJSON(ROOMS_PATH)
  
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  
  // Count overlapping bookings
  const overlappingBookings = bookings.filter((booking: any) => {
    if (booking.status === 'cancelled') return false
    if (roomId && booking.roomId !== roomId) return false
    
    const bookingStart = new Date(booking.checkIn)
    const bookingEnd = new Date(booking.checkOut)
    
    return bookingStart <= checkOutDate && bookingEnd >= checkInDate
  })
  
  const totalRooms = roomId ? 1 : rooms.length
  const bookingRate = (overlappingBookings.length / totalRooms) * 100
  
  // Determine demand level
  if (bookingRate >= 95) return 'very_high'
  if (bookingRate >= 80) return 'high'
  if (bookingRate >= 60) return 'medium'
  if (bookingRate >= 40) return 'low'
  return 'very_low'
}

// Helper: Check if date is weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

// Helper: Check if date is holiday
const isHoliday = (date: Date): any => {
  const holidays = loadJSON(HOLIDAYS_PATH)
  const dateStr = date.toISOString().split('T')[0]
  
  return holidays.find((h: any) => {
    if (!h.isActive) return false
    const holidayDate = h.date
    return holidayDate === dateStr
  })
}

// Helper: Get seasonal pricing - currently unused but kept for future use
// const getSeasonalPricing = (date: Date): any => {
//   const seasons = loadJSON(SEASONAL_PATH)
//   
//   return seasons.find((s: any) => {
//     if (!s.isActive) return false
//     const startDate = new Date(s.startDate)
//     const endDate = new Date(s.endDate)
//     return date >= startDate && date <= endDate
//   })
// }

// Helper: Calculate days in advance
const getDaysInAdvance = (checkIn: string): number => {
  const now = new Date()
  const checkInDate = new Date(checkIn)
  const diffTime = checkInDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Main calculation function
export async function POST(req: NextRequest) {
  try {
    const body: PriceCalculationRequest = await req.json()
    const { roomId, checkIn, checkOut, guests = 2 } = body

    // Validation
    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Load data
    const settings: DynamicPricingSettings = loadJSON(SETTINGS_PATH) || { enabled: true }
    const demandPricing: DemandPricing[] = loadJSON(DEMAND_PATH)
    const rules: DynamicPricingRule[] = loadJSON(RULES_PATH)
    const roomsData = loadJSON(ROOMS_PATH)

    // Find room
    const room = roomsData.find((r: any) => r.id === roomId)
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    const basePricePerNight = room.price || 0
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Initialize breakdown
    const appliedRules: AppliedPricingRule[] = []
    let currentPrice = basePricePerNight
    
    const breakdown = {
      basePricePerNight,
      subtotal: basePricePerNight * nights,
      appliedRules: [] as AppliedPricingRule[],
      demandAdjustment: 0,
      seasonalAdjustment: 0,
      weekendAdjustment: 0,
      occupancyAdjustment: 0,
      earlyBirdDiscount: 0,
      lastMinuteDiscount: 0,
      groupDiscount: 0,
      promoDiscount: 0,
      totalAdjustments: 0,
      totalDiscounts: 0,
      taxes: 0
    }

    // STEP 1: Calculate demand-based pricing
    if (settings.enabled) {
      const demandLevel = calculateDemandLevel(checkIn, checkOut, roomId)
      const demandRule = demandPricing.find(d => d.demandLevel === demandLevel && d.isActive)
      
      if (demandRule) {
        const adjustment = basePricePerNight * (demandRule.multiplier - 1)
        breakdown.demandAdjustment = adjustment * nights
        currentPrice = basePricePerNight * demandRule.multiplier
        
        appliedRules.push({
          ruleId: demandRule.id,
          ruleName: demandRule.name,
          type: 'demand',
          adjustment: adjustment * nights,
          percentage: (demandRule.multiplier - 1) * 100,
          description: `${demandRule.icon} ${demandRule.description}`,
          color: demandRule.color
        })
      }
    }

    // STEP 2: Apply dynamic pricing rules (sorted by priority)
    const activeRules = rules
      .filter(r => r.isActive)
      .sort((a, b) => b.priority - a.priority)

    for (const rule of activeRules) {
      let shouldApply = false
      
      // Check room-specific rules
      if (rule.roomIds && rule.roomIds.length > 0 && !rule.roomIds.includes(roomId)) {
        continue
      }

      // Check date range
      if (rule.startDate && rule.endDate) {
        const ruleStart = new Date(rule.startDate)
        const ruleEnd = new Date(rule.endDate)
        if (checkInDate >= ruleStart && checkOutDate <= ruleEnd) {
          shouldApply = true
        }
      } else {
        shouldApply = true
      }

      // Check conditions
      if (rule.conditions) {
        const cond = rule.conditions
        
        if (cond.minBookingDays && nights < cond.minBookingDays) shouldApply = false
        if (cond.maxBookingDays && nights > cond.maxBookingDays) shouldApply = false
        if (cond.minOccupancy && guests < cond.minOccupancy) shouldApply = false
        if (cond.maxOccupancy && guests > cond.maxOccupancy) shouldApply = false
        
        const daysInAdvance = getDaysInAdvance(checkIn)
        if (cond.minAdvanceBooking && daysInAdvance < cond.minAdvanceBooking) shouldApply = false
        if (cond.maxAdvanceBooking && daysInAdvance > cond.maxAdvanceBooking) shouldApply = false
      }

      if (shouldApply) {
        let adjustment = 0
        
        if (rule.strategy === 'percentage') {
          adjustment = currentPrice * (rule.value / 100) * nights
        } else if (rule.strategy === 'fixed_amount') {
          adjustment = rule.value * nights
        } else if (rule.strategy === 'multiplier') {
          adjustment = currentPrice * (rule.value - 1) * nights
        }

        // Apply min/max constraints
        if (rule.minPrice && currentPrice + (adjustment / nights) < rule.minPrice) {
          adjustment = (rule.minPrice - currentPrice) * nights
        }
        if (rule.maxPrice && currentPrice + (adjustment / nights) > rule.maxPrice) {
          adjustment = (rule.maxPrice - currentPrice) * nights
        }

        // Categorize adjustment
        if (rule.type === 'weekend') {
          breakdown.weekendAdjustment += adjustment
        } else if (rule.type === 'seasonal' || rule.type === 'holiday') {
          breakdown.seasonalAdjustment += adjustment
        } else if (rule.type === 'early_bird') {
          breakdown.earlyBirdDiscount += Math.abs(adjustment)
        } else if (rule.type === 'last_minute') {
          breakdown.lastMinuteDiscount += Math.abs(adjustment)
        } else if (rule.type === 'occupancy') {
          breakdown.occupancyAdjustment += adjustment
        }

        currentPrice += adjustment / nights

        appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.nameTh || rule.name,
          type: rule.type,
          adjustment,
          percentage: rule.strategy === 'percentage' ? rule.value : undefined,
          description: rule.description || rule.nameTh || rule.name
        })
      }
    }

    // STEP 3: Check for weekend pricing (day-by-day)
    let weekendNights = 0
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate)
      currentDate.setDate(currentDate.getDate() + i)
      if (isWeekend(currentDate)) weekendNights++
    }
    
    if (weekendNights > 0 && breakdown.weekendAdjustment === 0) {
      const weekendMultiplier = 1.2 // 20% increase
      const weekendAdjustment = basePricePerNight * (weekendMultiplier - 1) * weekendNights
      breakdown.weekendAdjustment = weekendAdjustment
      
      appliedRules.push({
        ruleId: 'weekend-auto',
        ruleName: 'Weekend Surcharge',
        type: 'weekend',
        adjustment: weekendAdjustment,
        percentage: 20,
        description: `🏖️ ค่าธรรมเนียมวันหยุดสุดสัปดาห์ (${weekendNights} คืน)`,
        color: '#F59E0B'
      })
    }

    // STEP 4: Check holidays
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate)
      currentDate.setDate(currentDate.getDate() + i)
      const holiday = isHoliday(currentDate)
      
      if (holiday && holiday.priceMultiplier) {
        const holidayAdjustment = basePricePerNight * (holiday.priceMultiplier - 1)
        breakdown.seasonalAdjustment += holidayAdjustment
        
        appliedRules.push({
          ruleId: holiday.id,
          ruleName: holiday.nameTh || holiday.name,
          type: 'holiday',
          adjustment: holidayAdjustment,
          percentage: (holiday.priceMultiplier - 1) * 100,
          description: `${holiday.emoji || '🎉'} ${holiday.nameTh || holiday.name}`,
          color: holiday.color || '#EF4444'
        })
      }
    }

    // STEP 5: Group discount (occupancy-based)
    if (guests >= 4) {
      const groupDiscount = currentPrice * nights * 0.1 // 10% off for 4+ guests
      breakdown.groupDiscount = groupDiscount
      
      appliedRules.push({
        ruleId: 'group-discount',
        ruleName: 'Group Discount',
        type: 'group_size',
        adjustment: -groupDiscount,
        percentage: -10,
        description: `👥 ส่วนลดกลุ่ม (${guests} คน)`,
        color: '#10B981'
      })
    }

    // Calculate totals
    breakdown.appliedRules = appliedRules
    breakdown.totalAdjustments = 
      breakdown.demandAdjustment + 
      breakdown.seasonalAdjustment + 
      breakdown.weekendAdjustment + 
      breakdown.occupancyAdjustment
    
    breakdown.totalDiscounts = 
      breakdown.earlyBirdDiscount + 
      breakdown.lastMinuteDiscount + 
      breakdown.groupDiscount + 
      breakdown.promoDiscount

    const subtotalAfterAdjustments = breakdown.subtotal + breakdown.totalAdjustments - breakdown.totalDiscounts
    breakdown.taxes = subtotalAfterAdjustments * 0.07 // 7% VAT
    
    const finalPrice = Math.max(
      subtotalAfterAdjustments + breakdown.taxes,
      settings.minPriceFloor || 0
    )

    // Build result
    const result: PriceCalculationResult = {
      success: true,
      basePrice: basePricePerNight,
      finalPrice: Math.round(finalPrice),
      totalNights: nights,
      breakdown
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error calculating dynamic price:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate price' },
      { status: 500 }
    )
  }
}
