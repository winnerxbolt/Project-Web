import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { AnalyticsReport, BookingStats, OccupancyRate, PopularRoom, CustomerStats, RevenueData, MonthlyRevenue, DailyRevenue } from '@/types/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const roomId = searchParams.get('roomId')

    // Read data from Supabase
    const { data: bookings } = await supabase.from('bookings').select('*')
    const { data: rooms } = await supabase.from('rooms').select('*')
    const { data: reviews } = await supabase.from('reviews').select('*')

    // Filter bookings by date range
    let filteredBookings = bookings || []
    if (startDate && endDate) {
      filteredBookings = filteredBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.check_in)
        return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate)
      })
    }

    // Filter by room if specified
    if (roomId) {
      filteredBookings = filteredBookings.filter((b: any) => b.room_id === parseInt(roomId))
    }

    // Calculate Booking Stats
    const bookingStats: BookingStats = {
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + (b.total || 0), 0),
      pendingBookings: filteredBookings.filter((b) => b.status === 'pending').length,
      confirmedBookings: filteredBookings.filter((b) => b.status === 'confirmed').length,
      completedBookings: filteredBookings.filter((b) => b.status === 'completed').length,
      cancelledBookings: filteredBookings.filter((b) => b.status === 'cancelled').length,
      averageBookingValue: 0,
      revenueGrowth: 0,
    }

    if (bookingStats.totalBookings > 0) {
      bookingStats.averageBookingValue = bookingStats.totalRevenue / bookingStats.totalBookings
    }

    // Calculate Occupancy Rates
    const occupancyRates: OccupancyRate[] = (rooms || []).map((room: any) => {
      const roomBookings = filteredBookings.filter((b: any) => b.room_id === room.id && b.status !== 'cancelled')
      const bookedDays = roomBookings.reduce((sum: number, b: any) => {
        const checkIn = new Date(b.check_in)
        const checkOut = new Date(b.check_out)
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)

      const totalDays = startDate && endDate
        ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 365

      const revenue = roomBookings.reduce((sum, b) => sum + (b.total || 0), 0)

      return {
        roomId: room.id,
        roomName: room.name,
        totalDays,
        bookedDays,
        occupancyRate: totalDays > 0 ? (bookedDays / totalDays) * 100 : 0,
        revenue,
      }
    })

    // Calculate Popular Rooms
    const roomBookingCounts = new Map<number, { count: number; revenue: number }>()
    filteredBookings.forEach((booking: any) => {
      if (booking.status !== 'cancelled') {
        const current = roomBookingCounts.get(booking.room_id) || { count: 0, revenue: 0 }
        roomBookingCounts.set(booking.room_id, {
          count: current.count + 1,
          revenue: current.revenue + (booking.total || 0),
        })
      }
    })

    const popularRooms: PopularRoom[] = Array.from(roomBookingCounts.entries())
      .map(([roomId, stats]) => {
        const room = (rooms || []).find((r: any) => r.id === roomId)
        const roomReviews = (reviews || []).filter((r: any) => r.room_id === roomId)
        const avgRating = roomReviews.length > 0
          ? roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length
          : 0

        return {
          id: roomId,
          name: room?.name || 'Unknown',
          bookingCount: stats.count,
          revenue: stats.revenue,
          averageRating: avgRating,
          image: room?.image || room?.images?.[0],
        }
      })
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10)

    // Calculate Customer Stats
    const thaiCustomers = filteredBookings.filter((b: any) => {
      const name = b.guest_name?.toLowerCase() || ''
      const email = b.email?.toLowerCase() || ''
      // Simple detection - can be improved
      return !email.includes('gmail') || name.match(/[\u0E00-\u0E7F]/)
    }).length

    const foreignCustomers = filteredBookings.length - thaiCustomers

    const customerStats: CustomerStats = {
      thai: thaiCustomers,
      foreign: foreignCustomers,
      total: filteredBookings.length,
      thaiPercentage: filteredBookings.length > 0 ? (thaiCustomers / filteredBookings.length) * 100 : 0,
      foreignPercentage: filteredBookings.length > 0 ? (foreignCustomers / filteredBookings.length) * 100 : 0,
      topNationalities: [
        { country: 'Thailand', count: thaiCustomers, percentage: filteredBookings.length > 0 ? (thaiCustomers / filteredBookings.length) * 100 : 0 },
        { country: 'Others', count: foreignCustomers, percentage: filteredBookings.length > 0 ? (foreignCustomers / filteredBookings.length) * 100 : 0 },
      ],
    }

    // Calculate Revenue Data (Last 30 days or date range)
    const revenueByDate = new Map<string, { revenue: number; bookings: number }>()
    filteredBookings.forEach((booking: any) => {
      if (booking.status !== 'cancelled') {
        const date = new Date(booking.check_in).toISOString().split('T')[0]
        const current = revenueByDate.get(date) || { revenue: 0, bookings: 0 }
        revenueByDate.set(date, {
          revenue: current.revenue + (booking.total || 0),
          bookings: current.bookings + 1,
        })
      }
    })

    const revenueData: RevenueData[] = Array.from(revenueByDate.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate Monthly Revenue
    const revenueByMonth = new Map<string, { revenue: number; bookings: number; year: number }>()
    filteredBookings.forEach((booking: any) => {
      if (booking.status !== 'cancelled') {
        const date = new Date(booking.check_in)
        const month = date.toLocaleString('th-TH', { month: 'long' })
        const year = date.getFullYear()
        const key = `${year}-${month}`
        const current = revenueByMonth.get(key) || { revenue: 0, bookings: 0, year }
        revenueByMonth.set(key, {
          revenue: current.revenue + (booking.total || 0),
          bookings: current.bookings + 1,
          year,
        })
      }
    })

    const monthlyRevenue: MonthlyRevenue[] = Array.from(revenueByMonth.entries())
      .map(([key, data]) => ({
        month: key.split('-')[1],
        revenue: data.revenue,
        bookings: data.bookings,
        year: data.year,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        return months.indexOf(a.month) - months.indexOf(b.month)
      })

    // Calculate Daily Revenue
    const revenueByDay = new Map<string, { revenue: number; bookings: number; dayOfWeek: string }>()
    filteredBookings.forEach((booking: any) => {
      if (booking.status !== 'cancelled') {
        const date = new Date(booking.check_in)
        const dayOfWeek = date.toLocaleString('th-TH', { weekday: 'long' })
        const current = revenueByDay.get(dayOfWeek) || { revenue: 0, bookings: 0, dayOfWeek }
        revenueByDay.set(dayOfWeek, {
          revenue: current.revenue + (booking.total || 0),
          bookings: current.bookings + 1,
          dayOfWeek,
        })
      }
    })

    const dailyRevenue: DailyRevenue[] = Array.from(revenueByDay.entries()).map(([day, data]) => ({
      date: day,
      revenue: data.revenue,
      bookings: data.bookings,
      dayOfWeek: data.dayOfWeek,
    }))

    // Prepare response
    const report: AnalyticsReport = {
      bookingStats,
      occupancyRates,
      popularRooms,
      customerStats,
      revenueData,
      monthlyRevenue,
      dailyRevenue,
      filters: {
        startDate: startDate || '',
        endDate: endDate || '',
        roomId: roomId ? parseInt(roomId) : undefined,
      },
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Error generating analytics report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate analytics report' },
      { status: 500 }
    )
  }
}
