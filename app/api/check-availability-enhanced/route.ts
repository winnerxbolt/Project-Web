import { NextResponse } from 'next/server'
import { readJson } from '@/lib/server/db'
import { BlackoutDate, HolidayDate, MaintenanceSchedule, SeasonalPricing, AvailabilityCheckResult } from '@/types/blackout'

// Enhanced availability check with pricing calculations
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { checkIn, checkOut, roomId, locationId } = body

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Load all relevant data
    const blackoutDates: BlackoutDate[] = await readJson('data/blackout-dates.json') || []
    const holidays: HolidayDate[] = await readJson('data/holidays.json') || []
    const maintenanceSchedules: MaintenanceSchedule[] = await readJson('data/maintenance-schedule.json') || []
    const seasonalPricing: SeasonalPricing[] = await readJson('data/seasonal-pricing.json') || []
    const rooms = await readJson('data/rooms.json')

    // Find room
    const room = roomId ? rooms.find((r: any) => r.id === roomId) : null
    const basePrice = room?.price || 0

    // Check blackout dates
    const affectingBlackouts = blackoutDates.filter((bd) => {
      if (bd.status !== 'active') return false
      
      const bdStart = new Date(bd.startDate)
      const bdEnd = new Date(bd.endDate)
      
      // Check if dates overlap
      if (!(checkInDate <= bdEnd && checkOutDate >= bdStart)) return false
      
      // Check if room is affected
      if (bd.roomIds.length > 0 && roomId && !bd.roomIds.includes(roomId)) return false
      if (bd.locationIds.length > 0 && locationId && !bd.locationIds.includes(locationId)) return false
      
      return true
    })

    // Check holidays
    const affectingHolidays = holidays.filter((h) => {
      if (!h.isActive) return false
      
      const holidayStart = new Date(h.date)
      const holidayEnd = h.endDate ? new Date(h.endDate) : holidayStart
      
      return checkInDate <= holidayEnd && checkOutDate >= holidayStart
    })

    // Check maintenance
    const affectingMaintenance = maintenanceSchedules.filter((m) => {
      if (!m.affectsBooking) return false
      if (m.status === 'cancelled' || m.status === 'completed') return false
      
      const maintStart = new Date(m.startDate)
      const maintEnd = new Date(m.endDate)
      
      // Check if dates overlap
      if (!(checkInDate <= maintEnd && checkOutDate >= maintStart)) return false
      
      // Check if room is affected
      if (m.roomIds.length > 0 && roomId && !m.roomIds.includes(roomId)) return false
      
      return true
    })

    // Check if booking is blocked
    const hasBlockingBlackout = affectingBlackouts.some((bd) => !bd.allowBooking)
    const hasBlockingMaintenance = affectingMaintenance.some((m) => !m.partialClosure)

    if (hasBlockingBlackout || hasBlockingMaintenance) {
      const reason = hasBlockingBlackout 
        ? affectingBlackouts.find((bd) => !bd.allowBooking)?.title || 'วันที่ไม่เปิดให้บริการ'
        : 'กำลังปิดซ่อมบำรุง'

      return NextResponse.json({
        available: false,
        reason,
        blackoutDates: affectingBlackouts,
        holidays: affectingHolidays,
        maintenanceSchedules: affectingMaintenance,
        pricing: {
          basePrice,
          adjustedPrice: 0,
          adjustments: [],
          totalAdjustment: 0,
        },
      })
    }

    // Calculate pricing adjustments
    let adjustedPrice = basePrice
    const adjustments: any[] = []
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Apply holiday pricing
    affectingHolidays.forEach((holiday) => {
      const increase = basePrice * (holiday.priceMultiplier - 1)
      adjustments.push({
        type: 'holiday',
        name: holiday.nameTh,
        amount: increase,
        reason: `${holiday.emoji} ${holiday.nameTh} (+${((holiday.priceMultiplier - 1) * 100).toFixed(0)}%)`,
      })
      adjustedPrice += increase
    })

    // Apply seasonal pricing
    const activeSeason = seasonalPricing
      .filter((sp) => sp.isActive)
      .find((sp) => {
        const seasonStart = new Date(sp.startDate)
        const seasonEnd = new Date(sp.endDate)
        return checkInDate <= seasonEnd && checkOutDate >= seasonStart
      })

    if (activeSeason) {
      let seasonAdjustment = 0
      
      if (activeSeason.strategy === 'percentage') {
        seasonAdjustment = basePrice * (activeSeason.baseAdjustment / 100)
      } else if (activeSeason.strategy === 'fixed_amount') {
        seasonAdjustment = activeSeason.baseAdjustment
      } else if (activeSeason.strategy === 'multiplier') {
        seasonAdjustment = basePrice * (activeSeason.baseAdjustment - 1)
      }

      // Apply weekend multiplier
      if (activeSeason.weekendMultiplier) {
        const weekend = [0, 5, 6] // Sun, Fri, Sat
        if (weekend.includes(checkInDate.getDay())) {
          seasonAdjustment *= activeSeason.weekendMultiplier
        }
      }

      adjustments.push({
        type: 'seasonal',
        name: activeSeason.seasonNameTh,
        amount: seasonAdjustment,
        reason: `${activeSeason.badge || activeSeason.seasonNameTh}`,
      })
      adjustedPrice += seasonAdjustment

      // Apply early bird discount
      if (activeSeason.enableEarlyBird && activeSeason.earlyBirdDays) {
        const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilCheckIn >= activeSeason.earlyBirdDays) {
          const discount = -(adjustedPrice * ((activeSeason.earlyBirdDiscount || 0) / 100))
          adjustments.push({
            type: 'early_bird',
            name: 'Early Bird Discount',
            amount: discount,
            reason: `จองล่วงหน้า ${daysUntilCheckIn} วัน (-${activeSeason.earlyBirdDiscount}%)`,
          })
          adjustedPrice += discount
        }
      }

      // Apply long stay discount
      if (activeSeason.longStayDiscount && activeSeason.longStayDiscount.length > 0) {
        const applicableDiscount = [...activeSeason.longStayDiscount]
          .sort((a, b) => b.nights - a.nights)
          .find((d) => nights >= d.nights)

        if (applicableDiscount) {
          const discount = -(adjustedPrice * (applicableDiscount.discount / 100))
          adjustments.push({
            type: 'long_stay',
            name: 'Long Stay Discount',
            amount: discount,
            reason: `พักยาว ${nights} คืน (-${applicableDiscount.discount}%)`,
          })
          adjustedPrice += discount
        }
      }
    }

    // Apply blackout price adjustments
    affectingBlackouts.forEach((bd) => {
      if (bd.priceAdjustment?.enabled) {
        let bdAdjustment = 0
        
        if (bd.priceAdjustment.strategy === 'percentage') {
          bdAdjustment = basePrice * (bd.priceAdjustment.value / 100)
        } else if (bd.priceAdjustment.strategy === 'fixed_amount') {
          bdAdjustment = bd.priceAdjustment.value
        } else if (bd.priceAdjustment.strategy === 'multiplier') {
          bdAdjustment = basePrice * (bd.priceAdjustment.value - 1)
        }

        adjustments.push({
          type: 'blackout',
          name: bd.title,
          amount: bdAdjustment,
          reason: bd.description,
        })
        adjustedPrice += bdAdjustment
      }
    })

    // Calculate total adjustment
    const totalAdjustment = adjustedPrice - basePrice

    // Get restrictions
    const restrictions: any = {}
    
    // Minimum stay from holidays
    affectingHolidays.forEach((h) => {
      if (h.minStayRequired > (restrictions.minimumStay || 0)) {
        restrictions.minimumStay = h.minStayRequired
      }
    })

    // Restrictions from seasonal pricing
    if (activeSeason) {
      if (activeSeason.minimumStay > (restrictions.minimumStay || 0)) {
        restrictions.minimumStay = activeSeason.minimumStay
      }
      if (activeSeason.advanceBookingRequired > (restrictions.advanceBookingRequired || 0)) {
        restrictions.advanceBookingRequired = activeSeason.advanceBookingRequired
      }
    }

    // Restrictions from blackouts
    affectingBlackouts.forEach((bd) => {
      if (bd.minimumStay && bd.minimumStay > (restrictions.minimumStay || 0)) {
        restrictions.minimumStay = bd.minimumStay
      }
      if (bd.maximumStay && (!restrictions.maximumStay || bd.maximumStay < restrictions.maximumStay)) {
        restrictions.maximumStay = bd.maximumStay
      }
      if (bd.advanceBookingDays && bd.advanceBookingDays > (restrictions.advanceBookingRequired || 0)) {
        restrictions.advanceBookingRequired = bd.advanceBookingDays
      }
    })

    // Check if restrictions are met
    if (restrictions.minimumStay && nights < restrictions.minimumStay) {
      return NextResponse.json({
        available: false,
        reason: `ต้องจองขั้นต่ำ ${restrictions.minimumStay} คืน`,
        blackoutDates: affectingBlackouts,
        holidays: affectingHolidays,
        maintenanceSchedules: affectingMaintenance,
        restrictions,
        pricing: {
          basePrice,
          adjustedPrice,
          adjustments,
          totalAdjustment,
        },
      })
    }

    if (restrictions.advanceBookingRequired) {
      const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilCheckIn < restrictions.advanceBookingRequired) {
        return NextResponse.json({
          available: false,
          reason: `ต้องจองล่วงหน้าอย่างน้อย ${restrictions.advanceBookingRequired} วัน`,
          blackoutDates: affectingBlackouts,
          holidays: affectingHolidays,
          maintenanceSchedules: affectingMaintenance,
          restrictions,
          pricing: {
            basePrice,
            adjustedPrice,
            adjustments,
            totalAdjustment,
          },
        })
      }
    }

    const result: AvailabilityCheckResult = {
      available: true,
      blackoutDates: affectingBlackouts,
      holidays: affectingHolidays,
      maintenanceSchedules: affectingMaintenance,
      pricing: {
        basePrice,
        adjustedPrice: Math.max(0, adjustedPrice),
        adjustments,
        totalAdjustment,
      },
      restrictions,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
