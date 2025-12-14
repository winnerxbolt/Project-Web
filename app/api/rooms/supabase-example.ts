// app/api/rooms/supabase-example.ts
// ตัวอย่างการแปลง Rooms API ให้ใช้ Supabase

import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { containsProfanity } from '@/lib/profanityFilter'

// GET - Fetch all rooms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const guests = searchParams.get('guests')

    // Start query
    let query = supabase
      .from('rooms')
      .select('*')

    // Apply filters
    if (available !== null) {
      query = query.eq('available', available === 'true')
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (guests) {
      query = query.gte('guests', parseInt(guests))
    }

    // Sort by rating
    query = query.order('rating', { ascending: false })

    const { data: rooms, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST - Create a new room (Admin only)
export async function POST(request: Request) {
  try {
    // ตรวจสอบ authentication (ใช้ existing auth system)
    // TODO: Implement admin token verification
    // const authHeader = request.headers.get('authorization')
    // ... verify admin token ...

    const body = await request.json()
    const { name, price, description, guests, beds, size, image, amenities, location } = body

    // Validate required fields
    if (!name || !price || !description || !guests) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check profanity
    if (containsProfanity(name) || containsProfanity(description)) {
      return NextResponse.json(
        { success: false, error: 'Content contains inappropriate language' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data: newRoom, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        name,
        price: parseFloat(price),
        description,
        guests: parseInt(guests),
        beds: parseInt(beds) || 1,
        bedrooms: parseInt(beds) || 1,
        bathrooms: 1,
        size: parseFloat(size) || null,
        image: image || '/logo.png',
        images: image ? [image] : ['/logo.png'],
        amenities: amenities || [],
        location: location || 'พัทยา ชลบุรี',
        available: true,
        rating: 0,
        reviews: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, room: newRoom }, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// PUT - Update a room (Admin only)
export async function PUT(request: Request) {
  try {
    // TODO: Verify admin token
    // const authHeader = request.headers.get('authorization')
    // ... verify admin token ...

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check profanity in updated fields
    if (updates.name && containsProfanity(updates.name)) {
      return NextResponse.json(
        { success: false, error: 'Name contains inappropriate language' },
        { status: 400 }
      )
    }

    if (updates.description && containsProfanity(updates.description)) {
      return NextResponse.json(
        { success: false, error: 'Description contains inappropriate language' },
        { status: 400 }
      )
    }

    // Update in Supabase
    const { data: updatedRoom, error } = await supabaseAdmin
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, room: updatedRoom })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a room (Admin only)
export async function DELETE(request: Request) {
  try {
    // TODO: Verify admin token
    // const authHeader = request.headers.get('authorization')
    // ... verify admin token ...

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Delete from Supabase
    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
