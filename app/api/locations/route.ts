import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const locationsFilePath = path.join(process.cwd(), 'data', 'locations.json')

// Helper to read locations
function getLocations() {
  try {
    const data = fs.readFileSync(locationsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// Helper to write locations
function saveLocations(locations: any[]) {
  fs.writeFileSync(locationsFilePath, JSON.stringify(locations, null, 2))
}

// GET - Fetch all locations or by roomId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    const locations = getLocations()

    if (roomId) {
      const location = locations.find((loc: any) => loc.roomId === parseInt(roomId))
      return NextResponse.json(location || null)
    }

    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST - Create or update location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      roomId,
      latitude,
      longitude,
      address,
      nearbyPlaces,
      directions,
      mapSettings,
    } = body

    if (!roomId || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const locations = getLocations()
    const existingIndex = locations.findIndex((loc: any) => loc.roomId === roomId)

    const locationData = {
      id: existingIndex >= 0 ? locations[existingIndex].id : Date.now(),
      roomId,
      latitude,
      longitude,
      address,
      nearbyPlaces: nearbyPlaces || [],
      directions: directions || {
        from: 'Bangkok',
        to: address || 'Pattaya',
        steps: [],
      },
      mapSettings: mapSettings || {
        zoom: 15,
        showStreetView: true,
      },
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      locations[existingIndex] = locationData
    } else {
      locations.push(locationData)
    }

    saveLocations(locations)

    return NextResponse.json({
      success: true,
      location: locationData,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save location' },
      { status: 500 }
    )
  }
}

// DELETE - Remove location
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const roomId = searchParams.get('roomId')

    if (!id && !roomId) {
      return NextResponse.json(
        { success: false, error: 'Location ID or Room ID required' },
        { status: 400 }
      )
    }

    const locations = getLocations()
    const filteredLocations = locations.filter((loc: any) => {
      if (id) return loc.id !== parseInt(id)
      if (roomId) return loc.roomId !== parseInt(roomId)
      return true
    })

    saveLocations(filteredLocations)

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
