import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface Review {
  id: string
  customerName: string
  reviewText: string
  date: string
  ratings: string | {
    overall: number
    cleanliness: number
    staff: number
    amenities: number
    location: number
  }
  villaName: string
}

// GET - Fetch all reviews
export async function GET(request: NextRequest) {
  let connection
  try {
    connection = await pool.getConnection()
    
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id,
        customerName,
        reviewText,
        date,
        ratings,
        villaName,
        createdAt
      FROM reviews 
      ORDER BY createdAt DESC`
    )

    // Parse ratings from JSON string
    const reviews = rows.map((review: RowDataPacket) => {
      let parsedRatings
      try {
        parsedRatings = typeof review.ratings === 'string' 
          ? JSON.parse(review.ratings) 
          : review.ratings
      } catch (error) {
        console.error('Error parsing ratings:', error)
        parsedRatings = {
          overall: 0,
          cleanliness: 0,
          staff: 0,
          amenities: 0,
          location: 0
        }
      }

      return {
        ...review,
        ratings: {
          overall: parsedRatings?.overall ?? 0,
          cleanliness: parsedRatings?.cleanliness ?? 0,
          staff: parsedRatings?.staff ?? 0,
          amenities: parsedRatings?.amenities ?? 0,
          location: parsedRatings?.location ?? 0
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      reviews 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  let connection
  try {
    const body = await request.json()
    const { customerName, reviewText, ratings, villaName } = body

    // Validation
    if (!customerName || !reviewText || !ratings) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields' 
        },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    const ratingsJson = JSON.stringify(ratings)

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO reviews (customerName, reviewText, date, ratings, villaName, createdAt)
       VALUES (?, ?, NOW(), ?, ?, NOW())`,
      [customerName, reviewText, ratingsJson, villaName || '']
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Review created successfully',
        reviewId: result.insertId
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create review',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}

// PUT - Update review
export async function PUT(request: NextRequest) {
  let connection
  try {
    const body = await request.json()
    const { id, customerName, reviewText, ratings, villaName } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Review ID is required' 
        },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    const ratingsJson = JSON.stringify(ratings)

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE reviews 
       SET customerName = ?, 
           reviewText = ?, 
           ratings = ?,
           villaName = ?
       WHERE id = ?`,
      [customerName, reviewText, ratingsJson, villaName || '', id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Review not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review updated successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update review',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}

// DELETE - Delete review
export async function DELETE(request: NextRequest) {
  let connection
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Review ID is required' 
        },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM reviews WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Review not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete review',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}