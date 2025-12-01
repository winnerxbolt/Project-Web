import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  created_at: string
}

const REVIEWS_FILE = 'data/reviews.json'

// GET - ดึงรีวิวทั้งหมด
export async function GET() {
  try {
    const reviews = await readJson<Review[]>(REVIEWS_FILE) || []
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลรีวิวได้' }, { status: 500 })
  }
}

// POST - สร้างรีวิวใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, rating, comment } = body

    // Validate input
    if (!name || !email || !rating || !comment) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'คะแนนต้องอยู่ระหว่าง 1-5' }, { status: 400 })
    }

    // Read existing reviews
    const reviews = await readJson<Review[]>(REVIEWS_FILE) || []

    // Create new review
    const newReview: Review = {
      id: Date.now().toString(),
      name,
      email,
      rating,
      comment,
      created_at: new Date().toISOString()
    }

    // Add to array and save
    reviews.unshift(newReview) // Add to beginning
    await writeJson(REVIEWS_FILE, reviews)

    return NextResponse.json({ 
      message: 'สร้างรีวิวสำเร็จ',
      review: newReview 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'ไม่สามารถสร้างรีวิวได้' }, { status: 500 })
  }
}
