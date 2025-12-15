import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// GET - Fetch all videos
export async function GET(request: NextRequest) {
  let connection
  try {
    connection = await pool.getConnection()
    
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id,
        title,
        description,
        youtubeUrl,
        thumbnailUrl,
        viewCount,
        tags,
        isActive,
        createdAt,
        updatedAt
      FROM videos 
      ORDER BY createdAt DESC`
    )

    // Parse tags from JSON string to array
    const videos = rows.map(video => ({
      ...video,
      tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : (video.tags || []),
      viewCount: video.viewCount || 0,
      isActive: Boolean(video.isActive),
      active: Boolean(video.isActive)
    }))

    return NextResponse.json({ 
      success: true,
      videos 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch videos',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}

// POST - Create new video
export async function POST(request: NextRequest) {
  let connection
  try {
    const body = await request.json()
    const { title, description, youtubeUrl, thumbnailUrl, tags } = body

    // Validation
    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Title and YouTube URL are required' 
        },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : [])

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO videos (title, description, youtubeUrl, thumbnailUrl, tags, isActive, viewCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, true, 0, NOW(), NOW())`,
      [title, description || '', youtubeUrl, thumbnailUrl || '', tagsJson]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Video created successfully',
        videoId: result.insertId
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create video',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}

// PUT - Update video
export async function PUT(request: NextRequest) {
  let connection
  try {
    const body = await request.json()
    const { id, title, description, youtubeUrl, thumbnailUrl, tags, isActive, active } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Video ID is required' 
        },
        { status: 400 }
    )
    }

    connection = await pool.getConnection()

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : [])
    const activeStatus = isActive !== undefined ? isActive : (active !== undefined ? active : true)

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE videos 
       SET title = ?, 
           description = ?, 
           youtubeUrl = ?, 
           thumbnailUrl = ?, 
           tags = ?,
           isActive = ?,
           updatedAt = NOW()
       WHERE id = ?`,
      [title, description || '', youtubeUrl, thumbnailUrl || '', tagsJson, activeStatus, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Video not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Video updated successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update video',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}

// DELETE - Delete video
export async function DELETE(request: NextRequest) {
  let connection
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Video ID is required' 
        },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM videos WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Video not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Video deleted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete video',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}