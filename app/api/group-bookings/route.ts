import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { GroupBookingRequest } from '@/types/groupBooking'

const filePath = path.join(process.cwd(), 'data', 'group-bookings.json')

// Helper to read data
function readGroupBookings(): GroupBookingRequest[] {
  if (!fs.existsSync(filePath)) {
    return []
  }
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

// Helper to write data
function writeGroupBookings(bookings: GroupBookingRequest[]) {
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2))
}

// GET - Get all group bookings or filter by status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    let bookings = readGroupBookings()
    
    // Filter by status
    if (status) {
      bookings = bookings.filter(b => b.status === status)
    }
    
    // Filter by type
    if (type) {
      bookings = bookings.filter(b => b.groupDetails.type === type)
    }
    
    // Sort by createdAt (newest first)
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching group bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch group bookings' }, { status: 500 })
  }
}

// POST - Create new group booking request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const bookings = readGroupBookings()
    
    const newBooking: GroupBookingRequest = {
      id: `GB${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      contactPerson: body.contactPerson,
      groupDetails: body.groupDetails,
      dates: body.dates,
      rooms: body.rooms,
      pricing: body.pricing,
      additionalServices: body.additionalServices || [],
      notes: body.notes || '',
      internalNotes: '',
      communicationHistory: [
        {
          timestamp: new Date().toISOString(),
          type: 'note',
          message: 'Group booking request created',
          by: 'System'
        }
      ]
    }
    
    bookings.push(newBooking)
    writeGroupBookings(bookings)
    
    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error('Error creating group booking:', error)
    return NextResponse.json({ error: 'Failed to create group booking' }, { status: 500 })
  }
}

// PUT - Update group booking
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const bookings = readGroupBookings()
    
    const index = bookings.findIndex(b => b.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Group booking not found' }, { status: 404 })
    }
    
    bookings[index] = {
      ...bookings[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    writeGroupBookings(bookings)
    
    return NextResponse.json(bookings[index])
  } catch (error) {
    console.error('Error updating group booking:', error)
    return NextResponse.json({ error: 'Failed to update group booking' }, { status: 500 })
  }
}

// DELETE - Delete group booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    let bookings = readGroupBookings()
    bookings = bookings.filter(b => b.id !== id)
    
    writeGroupBookings(bookings)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group booking:', error)
    return NextResponse.json({ error: 'Failed to delete group booking' }, { status: 500 })
  }
}
