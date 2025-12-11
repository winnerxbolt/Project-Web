import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { CancellationPolicy } from '@/types/refund'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get cancellation policies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')
    
    const filePath = path.join(DATA_DIR, 'cancellation-policies.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let policies: CancellationPolicy[] = JSON.parse(data)
    
    // Filter
    if (type) {
      policies = policies.filter(p => p.type === type)
    }
    if (isActive !== null) {
      policies = policies.filter(p => p.isActive === (isActive === 'true'))
    }
    
    return NextResponse.json({
      success: true,
      policies
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load policies'
    }, { status: 500 })
  }
}

// POST - Create cancellation policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.type) {
      return NextResponse.json({
        success: false,
        error: 'Name and type are required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'cancellation-policies.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const policies: CancellationPolicy[] = JSON.parse(data)
    
    const newPolicy: CancellationPolicy = {
      id: body.id || `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      type: body.type,
      description: body.description || '',
      rules: body.rules || [],
      conditions: body.conditions || {
        refundDeposit: true,
        refundProcessingFee: true,
        allowPartialRefund: true,
        minimumRefundAmount: 100,
        maxRefundDays: 14,
        requireApproval: false,
        autoApproveUnder: 10000
      },
      terms: body.terms || [],
      exceptions: body.exceptions || [],
      isActive: body.isActive !== false,
      isDefault: body.isDefault || false,
      applicableRooms: body.applicableRooms || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || 'admin'
    }
    
    policies.push(newPolicy)
    await fs.writeFile(filePath, JSON.stringify(policies, null, 2))
    
    return NextResponse.json({
      success: true,
      policy: newPolicy
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create policy'
    }, { status: 500 })
  }
}

// PUT - Update cancellation policy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'cancellation-policies.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const policies: CancellationPolicy[] = JSON.parse(data)
    
    const index = policies.findIndex(p => p.id === body.id)
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }
    
    const policy = policies[index]
    
    // Update fields
    if (body.name) policy.name = body.name
    if (body.description !== undefined) policy.description = body.description
    if (body.rules) policy.rules = body.rules
    if (body.conditions) policy.conditions = { ...policy.conditions, ...body.conditions }
    if (body.terms) policy.terms = body.terms
    if (body.exceptions) policy.exceptions = body.exceptions
    if (body.isActive !== undefined) policy.isActive = body.isActive
    if (body.isDefault !== undefined) policy.isDefault = body.isDefault
    if (body.applicableRooms) policy.applicableRooms = body.applicableRooms
    
    policy.updatedAt = new Date().toISOString()
    policies[index] = policy
    
    await fs.writeFile(filePath, JSON.stringify(policies, null, 2))
    
    return NextResponse.json({
      success: true,
      policy
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update policy'
    }, { status: 500 })
  }
}

// DELETE - Delete cancellation policy
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'cancellation-policies.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let policies: CancellationPolicy[] = JSON.parse(data)
    
    const initialLength = policies.length
    policies = policies.filter(p => p.id !== id)
    
    if (policies.length === initialLength) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }
    
    await fs.writeFile(filePath, JSON.stringify(policies, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete policy'
    }, { status: 500 })
  }
}
