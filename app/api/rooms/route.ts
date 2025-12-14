import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { containsProfanity } from '@/lib/profanityFilter'
import { verifySecureToken } from '@/lib/security/jwt'
import { cookies } from 'next/headers'

// GET - Fetch all rooms
export async function GET() {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .order('rating', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rooms' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, rooms })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST - Create a new room (Admin only)
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifySecureToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, price, description, guests, beds, size, image, amenities, location } = body

    // Validate required fields
    if (!name || !price || !description || !guests) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for profanity
    if (containsProfanity(name)) {
      return NextResponse.json(
        { success: false, error: 'ชื่อห้องมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }
    if (containsProfanity(description)) {
      return NextResponse.json(
        { success: false, error: 'คำอธิบายมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }
    if (location && containsProfanity(location)) {
      return NextResponse.json(
        { success: false, error: 'ที่ตั้งมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }

    const { data: newRoom, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        name,
        price: Number(price),
        description,
        guests: Number(guests),
        beds: beds ? Number(beds) : 1,
        bedrooms: beds ? Number(beds) : 1,
        bathrooms: 1,
        size: size ? Number(size) : 30,
        image: image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074',
        images: image ? [image] : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074'],
        rating: 0,
        reviews: 0,
        amenities: amenities || ['WiFi', 'TV', 'แอร์'],
        location: location || 'กรุงเทพ',
        available: true,
        wifi: true,
        air_conditioning: true
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create room' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, room: newRoom })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing room (Admin only)
export async function PUT(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifySecureToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, price, description, guests, beds, size, image, amenities, location, available } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check for profanity in updated fields
    if (name && containsProfanity(name)) {
      return NextResponse.json(
        { success: false, error: 'ชื่อห้องมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }
    if (description && containsProfanity(description)) {
      return NextResponse.json(
        { success: false, error: 'คำอธิบายมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }
    if (location && containsProfanity(location)) {
      return NextResponse.json(
        { success: false, error: 'ที่ตั้งมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (price !== undefined) updates.price = Number(price)
    if (description !== undefined) updates.description = description
    if (guests !== undefined) updates.guests = Number(guests)
    if (beds !== undefined) {
      updates.beds = Number(beds)
      updates.bedrooms = Number(beds)
    }
    if (size !== undefined) updates.size = Number(size)
    if (image !== undefined) updates.image = image
    if (amenities !== undefined) updates.amenities = amenities
    if (location !== undefined) updates.location = location
    if (available !== undefined) updates.available = available

    const { data: updatedRoom, error } = await supabaseAdmin
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update room' },
        { status: 500 }
      )
    }

    if (!updatedRoom) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
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
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifySecureToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete room' },
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
