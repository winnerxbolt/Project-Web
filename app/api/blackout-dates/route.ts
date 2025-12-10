import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { BlackoutDate } from '@/types/blackout'

const DATA_FILE = 'data/blackout-dates.json'

// GET - Get all blackout dates or filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')

    let blackoutDates: BlackoutDate[] = await readJson(DATA_FILE) || []

    // Filter by date range
    if (startDate && endDate) {
      blackoutDates = blackoutDates.filter((bd) => {
        const bdStart = new Date(bd.startDate)
        const bdEnd = new Date(bd.endDate)
        const filterStart = new Date(startDate)
        const filterEnd = new Date(endDate)
        
        return (bdStart <= filterEnd && bdEnd >= filterStart)
      })
    }

    // Filter by type
    if (type) {
      blackoutDates = blackoutDates.filter((bd) => bd.type === type)
    }

    // Filter by status
    if (status) {
      blackoutDates = blackoutDates.filter((bd) => bd.status === status)
    }

    // Filter by room
    if (roomId) {
      blackoutDates = blackoutDates.filter((bd) => 
        bd.roomIds.length === 0 || bd.roomIds.includes(roomId)
      )
    }

    return NextResponse.json({ blackoutDates })
  } catch (error) {
    console.error('Error fetching blackout dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blackout dates' },
      { status: 500 }
    )
  }
}

// POST - Create new blackout date
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const blackoutDates: BlackoutDate[] = await readJson(DATA_FILE) || []

    const newBlackout: BlackoutDate = {
      id: `blackout-${Date.now()}`,
      type: body.type || 'custom',
      title: body.title,
      description: body.description || '',
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status || 'active',
      roomIds: body.roomIds || [],
      locationIds: body.locationIds || [],
      priceAdjustment: body.priceAdjustment || {
        enabled: false,
        strategy: 'percentage',
        value: 0,
      },
      allowBooking: body.allowBooking ?? false,
      minimumStay: body.minimumStay,
      maximumStay: body.maximumStay,
      advanceBookingDays: body.advanceBookingDays,
      recurrence: body.recurrence || {
        type: 'none',
      },
      color: body.color || '#FF6B6B',
      icon: body.icon,
      priority: body.priority || 5,
      createdBy: body.createdBy || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: body.notes,
    }

    blackoutDates.push(newBlackout)
    await writeJson(DATA_FILE, blackoutDates)

    return NextResponse.json({ 
      blackout: newBlackout,
      message: 'Blackout date created successfully'
    })
  } catch (error) {
    console.error('Error creating blackout date:', error)
    return NextResponse.json(
      { error: 'Failed to create blackout date' },
      { status: 500 }
    )
  }
}

// PATCH - Update blackout date
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Blackout ID is required' },
        { status: 400 }
      )
    }

    let blackoutDates: BlackoutDate[] = await readJson(DATA_FILE) || []
    const index = blackoutDates.findIndex((bd) => bd.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Blackout date not found' },
        { status: 404 }
      )
    }

    blackoutDates[index] = {
      ...blackoutDates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(DATA_FILE, blackoutDates)

    return NextResponse.json({ 
      blackout: blackoutDates[index],
      message: 'Blackout date updated successfully'
    })
  } catch (error) {
    console.error('Error updating blackout date:', error)
    return NextResponse.json(
      { error: 'Failed to update blackout date' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blackout date
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    let blackoutDates: BlackoutDate[] = await readJson(DATA_FILE) || []
    const filteredBlackouts = blackoutDates.filter((bd) => bd.id !== id)

    if (filteredBlackouts.length === blackoutDates.length) {
      return NextResponse.json(
        { error: 'Blackout date not found' },
        { status: 404 }
      )
    }

    await writeJson(DATA_FILE, filteredBlackouts)

    return NextResponse.json({ message: 'Blackout date deleted successfully' })
  } catch (error) {
    console.error('Error deleting blackout date:', error)
    return NextResponse.json(
      { error: 'Failed to delete blackout date' },
      { status: 500 }
    )
  }
}
