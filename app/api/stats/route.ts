import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get rooms count
    const { count: totalRooms } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })

    // Get reviews count and data
    const { data: reviews, count: totalReviews } = await supabase
      .from('reviews')
      .select('rating', { count: 'exact' })

    // Get bookings count (only confirmed/completed)
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['confirmed', 'completed'])

    // คำนวณคะแนนเฉลี่ย
    let averageRating = 0
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
      averageRating = Math.round((totalRating / reviews.length) * 10) / 10
    }

    // คำนวณเปอร์เซ็นต์ความพึงพอใจ (รีวิว 4-5 ดาว)
    let satisfactionRate = 0
    if (reviews && reviews.length > 0) {
      const goodReviews = reviews.filter(r => (r.rating || 0) >= 4).length
      satisfactionRate = Math.round((goodReviews / reviews.length) * 100)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRooms: totalRooms || 0,
        totalReviews: totalReviews || 0,
        totalBookings: totalBookings || 0,
        averageRating,
        satisfactionRate
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
