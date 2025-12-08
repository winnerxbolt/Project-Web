import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { RoomGallery } from '@/types/gallery'

const GALLERY_FILE = 'data/gallery.json'

// GET - Fetch all galleries or by roomId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    const galleries: RoomGallery[] = (await readJson(GALLERY_FILE)) || []

    if (roomId) {
      const gallery = galleries.find((g) => g.roomId === parseInt(roomId))
      return NextResponse.json(gallery || null)
    }

    return NextResponse.json(galleries)
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

    const galleries: RoomGallery[] = (await readJson(GALLERY_FILE)) || []
    let gallery = galleries.find((g) => g.roomId === roomId)

    if (!gallery) {
      gallery = {
        id: galleries.length + 1,
        roomId,
        images: [],
        vrTours: [],
        videos: [],
        droneViews: [],
        updatedAt: new Date().toISOString(),
      }
      galleries.push(gallery)
    }

    // Add item based on type
    const itemId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newItem = {
      ...data,
      id: itemId,
      uploadedAt: new Date().toISOString(),
    }

    switch (type) {
      case 'image':
        gallery.images.push(newItem)
        break
      case 'vr':
        newItem.createdAt = new Date().toISOString()
        gallery.vrTours.push(newItem)
        break
      case 'video':
        gallery.videos.push(newItem)
        break
      case 'drone':
        newItem.capturedAt = new Date().toISOString()
        gallery.droneViews.push(newItem)
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    gallery.updatedAt = new Date().toISOString()

    await writeJson(GALLERY_FILE, galleries)

    return NextResponse.json({ success: true, gallery, item: newItem })
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

    const galleries: RoomGallery[] = (await readJson(GALLERY_FILE)) || []
    const gallery = galleries.find((g) => g.roomId === roomId)

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Update item based on type
    let updated = false
    switch (type) {
      case 'image':
        const imgIndex = gallery.images.findIndex((img) => img.id === itemId)
        if (imgIndex !== -1) {
          gallery.images[imgIndex] = { ...gallery.images[imgIndex], ...data }
          updated = true
        }
        break
      case 'vr':
        const vrIndex = gallery.vrTours.findIndex((vr) => vr.id === itemId)
        if (vrIndex !== -1) {
          gallery.vrTours[vrIndex] = { ...gallery.vrTours[vrIndex], ...data }
          updated = true
        }
        break
      case 'video':
        const vidIndex = gallery.videos.findIndex((vid) => vid.id === itemId)
        if (vidIndex !== -1) {
          gallery.videos[vidIndex] = { ...gallery.videos[vidIndex], ...data }
          updated = true
        }
        break
      case 'drone':
        const droneIndex = gallery.droneViews.findIndex((drone) => drone.id === itemId)
        if (droneIndex !== -1) {
          gallery.droneViews[droneIndex] = { ...gallery.droneViews[droneIndex], ...data }
          updated = true
        }
        break
    }

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    gallery.updatedAt = new Date().toISOString()
    await writeJson(GALLERY_FILE, galleries)

    return NextResponse.json({ success: true, gallery })
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

    const galleries: RoomGallery[] = (await readJson(GALLERY_FILE)) || []
    const gallery = galleries.find((g) => g.roomId === parseInt(roomId))

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Delete item based on type
    switch (type) {
      case 'image':
        gallery.images = gallery.images.filter((img) => img.id !== itemId)
        break
      case 'vr':
        gallery.vrTours = gallery.vrTours.filter((vr) => vr.id !== itemId)
        break
      case 'video':
        gallery.videos = gallery.videos.filter((vid) => vid.id !== itemId)
        break
      case 'drone':
        gallery.droneViews = gallery.droneViews.filter((drone) => drone.id !== itemId)
        break
    }

    gallery.updatedAt = new Date().toISOString()
    await writeJson(GALLERY_FILE, galleries)

    return NextResponse.json({ success: true, gallery })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 })
  }
}
