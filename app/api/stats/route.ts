import { NextResponse } from 'next/server'
import { readJson } from '@/lib/server/db'

interface Review {
  id: number
  roomId: number
  roomName: string
  guestName: string
  email: string
  rating: number
  comment: string
  date: string
}

interface Room {
  id: number
  name: string
  location: string
  price: number
  images: string[]
  amenities: string[]
  capacity: number
  description?: string
}

interface Booking {
  id: number
  roomId: number
  userId: number
  guestName: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: string
  createdAt: string
}

export async function GET() {
  try {
    // อ่านข้อมูลจากไฟล์
    const rooms = await readJson<Room[]>('data/rooms.json') || []
    const reviews = await readJson<Review[]>('data/reviews.json') || []
    const bookings = await readJson<Booking[]>('data/bookings.json') || []

    // นับจำนวนบ้านพัก
    const totalRooms = rooms.length

    // นับจำนวนรีวิว
    const totalReviews = reviews.length

    // นับจำนวนการจองจริง (นับเฉพาะที่สถานะ confirmed, completed)
    const totalBookings = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'completed'
    ).length

    // คำนวณคะแนนเฉลี่ย
    let averageRating = 0
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = Math.round((totalRating / reviews.length) * 10) / 10 // ทศนิยม 1 ตำแหน่ง
    }

    // คำนวณเปอร์เซ็นต์ความพึงพอใจ (รีวิว 4-5 ดาว)
    let satisfactionRate = 0
    if (reviews.length > 0) {
      const goodReviews = reviews.filter(r => r.rating >= 4).length
      satisfactionRate = Math.round((goodReviews / reviews.length) * 100)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRooms,
        totalReviews,
        totalBookings,
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
