import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const roomsFilePath = path.join(process.cwd(), 'data', 'rooms.json')

// Helper function to read rooms
async function getRooms() {
  try {
    const data = await readFile(roomsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading rooms:', error)
    return []
  }
}

// Helper function to write rooms
async function saveRooms(rooms: any[]) {
  try {
    await writeFile(roomsFilePath, JSON.stringify(rooms, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error saving rooms:', error)
    return false
  }
}

// GET - Fetch all rooms
export async function GET() {
  try {
    const rooms = await getRooms()
    return NextResponse.json({ success: true, rooms })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST - Create a new room
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, description, guests, beds, size, image, amenities, location } = body

    // Validate required fields
    if (!name || !price || !description || !guests) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const rooms = await getRooms()
    
    // Generate new ID
    const newId = rooms.length > 0 ? Math.max(...rooms.map((r: any) => r.id)) + 1 : 1

    const newRoom = {
      id: newId,
      name,
      price: Number(price),
      description,
      guests: Number(guests),
      beds: beds ? Number(beds) : 1,
      size: size ? Number(size) : 30,
      image: image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074',
      rating: 0,
      reviews: 0,
      amenities: amenities || ['WiFi', 'TV', 'แอร์'],
      location: location || 'กรุงเทพ',
      available: true
    }

    rooms.push(newRoom)
    const saved = await saveRooms(rooms)

    if (saved) {
      return NextResponse.json({ success: true, room: newRoom })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save room' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing room
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, price, description, guests, beds, size, image, amenities, location, available } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const rooms = await getRooms()
    const roomIndex = rooms.findIndex((r: any) => r.id === id)

    if (roomIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Update room data
    rooms[roomIndex] = {
      ...rooms[roomIndex],
      name: name || rooms[roomIndex].name,
      price: price !== undefined ? Number(price) : rooms[roomIndex].price,
      description: description || rooms[roomIndex].description,
      guests: guests !== undefined ? Number(guests) : rooms[roomIndex].guests,
      beds: beds !== undefined ? Number(beds) : rooms[roomIndex].beds,
      size: size !== undefined ? Number(size) : rooms[roomIndex].size,
      image: image || rooms[roomIndex].image,
      amenities: amenities || rooms[roomIndex].amenities,
      location: location || rooms[roomIndex].location,
      available: available !== undefined ? available : rooms[roomIndex].available
    }

    const saved = await saveRooms(rooms)

    if (saved) {
      return NextResponse.json({ success: true, room: rooms[roomIndex] })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update room' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a room
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const rooms = await getRooms()
    const filteredRooms = rooms.filter((r: any) => r.id !== Number(id))

    if (filteredRooms.length === rooms.length) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    const saved = await saveRooms(filteredRooms)

    if (saved) {
      return NextResponse.json({ success: true, message: 'Room deleted successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete room' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
