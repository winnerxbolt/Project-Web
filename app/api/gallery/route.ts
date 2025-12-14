import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { RoomGallery } from '@/types/gallery'

// GET - Fetch all galleries or by roomId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    let query = supabase.from('room_galleries').select('*')

    if (roomId) {
      query = query.eq('room_id', parseInt(roomId)).single()
      const { data: gallery, error } = await query
      if (error && error.code !== 'PGRST116') throw error
      return NextResponse.json(gallery || null)
    }

    const { data: galleries, error } = await query
    if (error) throw error

    return NextResponse.json(galleries || [])
  } catch (error) {
    console.error('Error fetching galleries:', error)
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
  }
}

// POST - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, type, data } = body

    // Get or create gallery for room
    let { data: gallery, error: fetchError } = await supabase
      .from('room_galleries')
      .select('*')
      .eq('room_id', roomId)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new gallery
      const { data: newGallery, error: createError } = await supabaseAdmin
        .from('room_galleries')
        .insert({
          room_id: roomId,
          images: [],
          vr_tours: [],
          videos: [],
          drone_views: [],
        })
        .select()
        .single()
      
      if (createError) throw createError
      gallery = newGallery
    }

    if (!gallery) throw new Error('Failed to get or create gallery')

    // Add item based on type
    const itemId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newItem = {
      ...data,
      id: itemId,
      uploadedAt: new Date().toISOString(),
    }

    const updates: any = {}
    switch (type) {
      case 'image':
        updates.images = [...(gallery.images || []), newItem]
        break
      case 'vr':
        newItem.createdAt = new Date().toISOString()
        updates.vr_tours = [...(gallery.vr_tours || []), newItem]
        break
      case 'video':
        updates.videos = [...(gallery.videos || []), newItem]
        break
      case 'drone':
        newItem.capturedAt = new Date().toISOString()
        updates.drone_views = [...(gallery.drone_views || []), newItem]
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const { data: updatedGallery, error: updateError } = await supabaseAdmin
      .from('room_galleries')
      .update(updates)
      .eq('id', gallery.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, gallery: updatedGallery, item: newItem })
  } catch (error) {
    console.error('Error creating gallery item:', error)
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 })
  }
}

// PUT - Update gallery item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, type, itemId, data } = body

    const { data: gallery, error: fetchError } = await supabase
      .from('room_galleries')
      .select('*')
      .eq('room_id', roomId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Update item based on type
    let updated = false
    const updates: any = {}
    
    switch (type) {
      case 'image':
        const images = gallery.images || []
        const imgIndex = images.findIndex((img: any) => img.id === itemId)
        if (imgIndex !== -1) {
          images[imgIndex] = { ...images[imgIndex], ...data }
          updates.images = images
          updated = true
        }
        break
      case 'vr':
        const vrTours = gallery.vr_tours || []
        const vrIndex = vrTours.findIndex((vr: any) => vr.id === itemId)
        if (vrIndex !== -1) {
          vrTours[vrIndex] = { ...vrTours[vrIndex], ...data }
          updates.vr_tours = vrTours
          updated = true
        }
        break
      case 'video':
        const videos = gallery.videos || []
        const vidIndex = videos.findIndex((vid: any) => vid.id === itemId)
        if (vidIndex !== -1) {
          videos[vidIndex] = { ...videos[vidIndex], ...data }
          updates.videos = videos
          updated = true
        }
        break
      case 'drone':
        const droneViews = gallery.drone_views || []
        const droneIndex = droneViews.findIndex((drone: any) => drone.id === itemId)
        if (droneIndex !== -1) {
          droneViews[droneIndex] = { ...droneViews[droneIndex], ...data }
          updates.drone_views = droneViews
          updated = true
        }
        break
    }

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const { data: updatedGallery, error: updateError } = await supabaseAdmin
      .from('room_galleries')
      .update(updates)
      .eq('id', gallery.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, gallery: updatedGallery })
  } catch (error) {
    console.error('Error updating gallery item:', error)
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 })
  }
}

// DELETE - Delete gallery item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const type = searchParams.get('type')
    const itemId = searchParams.get('itemId')

    if (!roomId || !type || !itemId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const { data: gallery, error: fetchError } = await supabase
      .from('room_galleries')
      .select('*')
      .eq('room_id', parseInt(roomId))
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Delete item based on type
    const updates: any = {}
    switch (type) {
      case 'image':
        updates.images = (gallery.images || []).filter((img: any) => img.id !== itemId)
        break
      case 'vr':
        updates.vr_tours = (gallery.vr_tours || []).filter((vr: any) => vr.id !== itemId)
        break
      case 'video':
        updates.videos = (gallery.videos || []).filter((vid: any) => vid.id !== itemId)
        break
      case 'drone':
        updates.drone_views = (gallery.drone_views || []).filter((drone: any) => drone.id !== itemId)
        break
    }

    const { data: updatedGallery, error: updateError } = await supabaseAdmin
      .from('room_galleries')
      .update(updates)
      .eq('id', gallery.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, gallery: updatedGallery })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 })
  }
}
