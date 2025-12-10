import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { HolidayDate } from '@/types/blackout'

const DATA_FILE = 'data/holidays.json'

// GET - Get all holidays or filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const type = searchParams.get('type')
    const month = searchParams.get('month')

    let holidays: HolidayDate[] = await readJson(DATA_FILE) || []

    // Filter by year
    if (year) {
      holidays = holidays.filter((h) => h.year === parseInt(year))
    }

    // Filter by type
    if (type) {
      holidays = holidays.filter((h) => h.type === type)
    }

    // Filter by month
    if (month) {
      holidays = holidays.filter((h) => {
        const holidayMonth = new Date(h.date).getMonth() + 1
        return holidayMonth === parseInt(month)
      })
    }

    // Filter active only
    holidays = holidays.filter((h) => h.isActive)

    // Sort by date
    holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ holidays })
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    )
  }
}

// POST - Create new holiday
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const holidays: HolidayDate[] = await readJson(DATA_FILE) || []

    const newHoliday: HolidayDate = {
      id: `holiday-${Date.now()}`,
      name: body.name,
      nameEn: body.nameEn || body.name,
      nameTh: body.nameTh || body.name,
      date: body.date,
      endDate: body.endDate,
      type: body.type || 'public',
      country: body.country || 'TH',
      isRecurring: body.isRecurring ?? false,
      priceMultiplier: body.priceMultiplier || 1.0,
      minStayRequired: body.minStayRequired || 1,
      color: body.color || '#FFD700',
      emoji: body.emoji || '🎉',
      description: body.description,
      isActive: body.isActive ?? true,
      year: new Date(body.date).getFullYear(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    holidays.push(newHoliday)
    await writeJson(DATA_FILE, holidays)

    return NextResponse.json({ 
      holiday: newHoliday,
      message: 'Holiday created successfully'
    })
  } catch (error) {
    console.error('Error creating holiday:', error)
    return NextResponse.json(
      { error: 'Failed to create holiday' },
      { status: 500 }
    )
  }
}

// PATCH - Update holiday
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      )
    }

    let holidays: HolidayDate[] = await readJson(DATA_FILE) || []
    const index = holidays.findIndex((h) => h.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      )
    }

    holidays[index] = {
      ...holidays[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(DATA_FILE, holidays)

    return NextResponse.json({ 
      holiday: holidays[index],
      message: 'Holiday updated successfully'
    })
  } catch (error) {
    console.error('Error updating holiday:', error)
    return NextResponse.json(
      { error: 'Failed to update holiday' },
      { status: 500 }
    )
  }
}

// DELETE - Delete holiday
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

    let holidays: HolidayDate[] = await readJson(DATA_FILE) || []
    const filteredHolidays = holidays.filter((h) => h.id !== id)

    if (filteredHolidays.length === holidays.length) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      )
    }

    await writeJson(DATA_FILE, filteredHolidays)

    return NextResponse.json({ message: 'Holiday deleted successfully' })
  } catch (error) {
    console.error('Error deleting holiday:', error)
    return NextResponse.json(
      { error: 'Failed to delete holiday' },
      { status: 500 }
    )
  }
}
