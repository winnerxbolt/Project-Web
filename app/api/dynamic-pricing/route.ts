import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DynamicPricingRule } from '@/types/dynamic-pricing'

const DATA_FILE = path.join(process.cwd(), 'data', 'dynamic-pricing-rules.json')

// GET - Get all rules
export async function GET(req: NextRequest) {
  try {
    let rules: DynamicPricingRule[] = []
    
    if (fs.existsSync(DATA_FILE)) {
      rules = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    // Filter by type
    if (type) {
      rules = rules.filter(r => r.type === type)
    }

    // Filter by active status
    if (active === 'true') {
      rules = rules.filter(r => r.isActive)
    }

    return NextResponse.json({ success: true, rules })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

// POST - Create new rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    let rules: DynamicPricingRule[] = []
    if (fs.existsSync(DATA_FILE)) {
      rules = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }

    const newRule: DynamicPricingRule = {
      id: `rule-${Date.now()}`,
      name: body.name,
      nameEn: body.nameEn || body.name,
      nameTh: body.nameTh || body.name,
      description: body.description,
      type: body.type,
      isActive: body.isActive ?? true,
      priority: body.priority || 5,
      startDate: body.startDate,
      endDate: body.endDate,
      daysOfWeek: body.daysOfWeek,
      timeSlot: body.timeSlot,
      strategy: body.strategy,
      value: body.value,
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      conditions: body.conditions,
      roomIds: body.roomIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy
    }

    rules.push(newRule)
    fs.writeFileSync(DATA_FILE, JSON.stringify(rules, null, 2))

    return NextResponse.json({ success: true, rule: newRule })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}

// PATCH - Update rule
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Rule ID required' },
        { status: 400 }
      )
    }

    let rules: DynamicPricingRule[] = []
    if (fs.existsSync(DATA_FILE)) {
      rules = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }

    const index = rules.findIndex(r => r.id === id)
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    rules[index] = {
      ...rules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(rules, null, 2))

    return NextResponse.json({ success: true, rule: rules[index] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update rule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete rule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Rule ID required' },
        { status: 400 }
      )
    }

    let rules: DynamicPricingRule[] = []
    if (fs.existsSync(DATA_FILE)) {
      rules = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }

    const filteredRules = rules.filter(r => r.id !== id)
    
    if (filteredRules.length === rules.length) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(filteredRules, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete rule' },
      { status: 500 }
    )
  }
}
