import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { containsProfanity } from '@/lib/profanityFilter'

interface Review {
  id: number
  roomId: number
  roomName: string
  guestName: string
  email?: string
  rating: number
  comment: string
  date: string
}

const REVIEWS_FILE = 'data/reviews.json'
const ROOMS_FILE = 'data/rooms.json'

// GET - ดึงรีวิวทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    const reviews = await readJson<Review[]>(REVIEWS_FILE) || []
    
    // Filter by roomId if provided
    if (roomId) {
      const filteredReviews = reviews.filter(r => r.roomId === parseInt(roomId))
      return NextResponse.json({ success: true, reviews: filteredReviews })
    }
    
    return NextResponse.json({ success: true, reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถดึงข้อมูลรีวิวได้' }, { status: 500 })
  }
}

// POST - สร้างรีวิวใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, roomName, guestName, email, rating, comment } = body

    // Validate input
    if (!roomId || !roomName || !guestName || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'คะแนนต้องอยู่ระหว่าง 1-5' }, { status: 400 })
    }

    // Check for profanity
    if (containsProfanity(guestName)) {
      return NextResponse.json({ success: false, error: 'ชื่อมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' }, { status: 400 })
    }
    if (containsProfanity(comment)) {
      return NextResponse.json({ success: false, error: 'ความคิดเห็นมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' }, { status: 400 })
    }

    // Read existing reviews
    const reviews = await readJson<Review[]>(REVIEWS_FILE) || []

    // Create new review
    const newReview: Review = {
      id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      roomId: parseInt(roomId),
      roomName,
      guestName,
      email,
      rating: parseInt(rating),
      comment,
      date: new Date().toISOString()
    }

    reviews.push(newReview)
    await writeJson(REVIEWS_FILE, reviews)

    // Update room rating
    await updateRoomRating(parseInt(roomId))

    return NextResponse.json({ success: true, review: newReview }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถสร้างรีวิวได้' }, { status: 500 })
  }
}

// DELETE - ลบรีวิว
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID รีวิว' }, { status: 400 })
    }

    const reviews = await readJson<Review[]>(REVIEWS_FILE) || []
    const reviewToDelete = reviews.find(r => r.id === parseInt(id))
    
    if (!reviewToDelete) {
      return NextResponse.json({ success: false, error: 'ไม่พบรีวิว' }, { status: 404 })
    }

    const updatedReviews = reviews.filter(r => r.id !== parseInt(id))
    await writeJson(REVIEWS_FILE, updatedReviews)

    // Update room rating after deletion
    await updateRoomRating(reviewToDelete.roomId)

    return NextResponse.json({ success: true, message: 'ลบรีวิวสำเร็จ' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ success: false, error: 'ไม่สามารถลบรีวิวได้' }, { status: 500 })
  }
}

// Helper function to update room rating
async function updateRoomRating(roomId: number) {
  try {
    const reviews = await readJson<Review[]>(REVIEWS_FILE) || []
    const rooms = await readJson<any[]>(ROOMS_FILE) || []
    
    const roomReviews = reviews.filter(r => r.roomId === roomId)
    const room = rooms.find(r => r.id === roomId)
    
    if (room) {
      if (roomReviews.length > 0) {
        const avgRating = roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length
        room.rating = Math.round(avgRating * 10) / 10 // Round to 1 decimal
        room.reviews = roomReviews.length
      } else {
        room.rating = 0
        room.reviews = 0
      }
      
      await writeJson(ROOMS_FILE, rooms)
    }
  } catch (error) {
    console.error('Error updating room rating:', error)
  }
}
