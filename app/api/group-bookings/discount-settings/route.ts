import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { GroupDiscountSettings } from '@/types/groupBooking'

const filePath = path.join(process.cwd(), 'data', 'group-discount-settings.json')

// Helper to read data
function readSettings(): GroupDiscountSettings[] {
  if (!fs.existsSync(filePath)) {
    return []
  }
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

// Helper to write data
function writeSettings(settings: GroupDiscountSettings[]) {
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2))
}

// GET - Get all discount settings
export async function GET() {
  try {
    const settings = readSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching discount settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST - Create new discount setting
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const settings = readSettings()
    
    const newSetting: GroupDiscountSettings = {
      id: `GDS${Date.now()}`,
      ...body
    }
    
    settings.push(newSetting)
    writeSettings(settings)
    
    return NextResponse.json(newSetting, { status: 201 })
  } catch (error) {
    console.error('Error creating discount setting:', error)
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
  }
}

// PUT - Update discount setting
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const settings = readSettings()
    
    const index = settings.findIndex(s => s.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    
    settings[index] = { ...settings[index], ...body }
    writeSettings(settings)
    
    return NextResponse.json(settings[index])
  } catch (error) {
    console.error('Error updating discount setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

// DELETE - Delete discount setting
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    let settings = readSettings()
    settings = settings.filter(s => s.id !== id)
    
    writeSettings(settings)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting discount setting:', error)
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
  }
}
