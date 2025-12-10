import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DemandPricing } from '@/types/dynamic-pricing'

const DATA_FILE = path.join(process.cwd(), 'data', 'demand-pricing.json')

// GET - Get all demand levels
export async function GET(_req: NextRequest) {
  try {
    let levels: DemandPricing[] = []
    
    if (fs.existsSync(DATA_FILE)) {
      levels = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }

    return NextResponse.json({ success: true, levels })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch demand pricing' },
      { status: 500 }
    )
  }
}

// PATCH - Update demand level
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID required' },
        { status: 400 }
      )
    }

    let levels: DemandPricing[] = []
    if (fs.existsSync(DATA_FILE)) {
      levels = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }

    const index = levels.findIndex(l => l.id === id)
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Demand level not found' },
        { status: 404 }
      )
    }

    levels[index] = {
      ...levels[index],
      ...updates
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(levels, null, 2))

    return NextResponse.json({ success: true, level: levels[index] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update demand level' },
      { status: 500 }
    )
  }
}
