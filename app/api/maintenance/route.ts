import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { MaintenanceSchedule } from '@/types/blackout'

const DATA_FILE = 'data/maintenance-schedule.json'

// GET - Get maintenance schedules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')
    const upcoming = searchParams.get('upcoming')

    let schedules: MaintenanceSchedule[] = await readJson(DATA_FILE) || []

    // Filter by status
    if (status) {
      schedules = schedules.filter((s) => s.status === status)
    }

    // Filter by room
    if (roomId) {
      schedules = schedules.filter((s) => s.roomIds.includes(roomId))
    }

    // Get upcoming only
    if (upcoming === 'true') {
      const now = new Date()
      schedules = schedules.filter((s) => new Date(s.startDate) >= now)
    }

    // Sort by start date
    schedules.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    )
  }
}

// POST - Create maintenance schedule
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const schedules: MaintenanceSchedule[] = await readJson(DATA_FILE) || []

    const newSchedule: MaintenanceSchedule = {
      id: `maintenance-${Date.now()}`,
      title: body.title,
      description: body.description || '',
      type: body.type || 'routine',
      priority: body.priority || 'medium',
      startDate: body.startDate,
      endDate: body.endDate,
      estimatedDuration: body.estimatedDuration || 0,
      roomIds: body.roomIds || [],
      locationIds: body.locationIds || [],
      facilities: body.facilities || [],
      affectsBooking: body.affectsBooking ?? true,
      partialClosure: body.partialClosure ?? false,
      alternativeAvailable: body.alternativeAvailable ?? false,
      assignedTo: body.assignedTo || [],
      contractor: body.contractor,
      cost: body.cost,
      status: body.status || 'scheduled',
      completionPercentage: 0,
      notifyGuests: body.notifyGuests ?? true,
      notificationSent: false,
      guestMessage: body.guestMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    schedules.push(newSchedule)
    await writeJson(DATA_FILE, schedules)

    return NextResponse.json({ 
      schedule: newSchedule,
      message: 'Maintenance schedule created successfully'
    })
  } catch (error) {
    console.error('Error creating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    )
  }
}

// PATCH - Update maintenance schedule
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    let schedules: MaintenanceSchedule[] = await readJson(DATA_FILE) || []
    const index = schedules.findIndex((s) => s.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Maintenance schedule not found' },
        { status: 404 }
      )
    }

    schedules[index] = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.status === 'completed' && { completedAt: new Date().toISOString() }),
    }

    await writeJson(DATA_FILE, schedules)

    return NextResponse.json({ 
      schedule: schedules[index],
      message: 'Maintenance schedule updated successfully'
    })
  } catch (error) {
    console.error('Error updating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance schedule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete maintenance schedule
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

    let schedules: MaintenanceSchedule[] = await readJson(DATA_FILE) || []
    const filteredSchedules = schedules.filter((s) => s.id !== id)

    if (filteredSchedules.length === schedules.length) {
      return NextResponse.json(
        { error: 'Maintenance schedule not found' },
        { status: 404 }
      )
    }

    await writeJson(DATA_FILE, filteredSchedules)

    return NextResponse.json({ message: 'Maintenance schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance schedule' },
      { status: 500 }
    )
  }
}
