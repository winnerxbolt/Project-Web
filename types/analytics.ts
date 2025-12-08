export interface BookingStats {
  totalBookings: number
  totalRevenue: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  averageBookingValue: number
  revenueGrowth: number
}

export interface OccupancyRate {
  roomId: number
  roomName: string
  totalDays: number
  bookedDays: number
  occupancyRate: number
  revenue: number
}

export interface PopularRoom {
  id: number
  name: string
  bookingCount: number
  revenue: number
  averageRating: number
  image?: string
}

export interface CustomerStats {
  thai: number
  foreign: number
  total: number
  thaiPercentage: number
  foreignPercentage: number
  topNationalities: Array<{
    country: string
    count: number
    percentage: number
  }>
}

export interface RevenueData {
  date: string
  revenue: number
  bookings: number
  label?: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  bookings: number
  year: number
}

export interface DailyRevenue extends RevenueData {
  dayOfWeek: string
}

export interface ReportFilters {
  startDate: string
  endDate: string
  roomId?: number
  status?: string
}

export interface AnalyticsReport {
  bookingStats: BookingStats
  occupancyRates: OccupancyRate[]
  popularRooms: PopularRoom[]
  customerStats: CustomerStats
  revenueData: RevenueData[]
  monthlyRevenue: MonthlyRevenue[]
  dailyRevenue: DailyRevenue[]
  filters: ReportFilters
  generatedAt: string
}
