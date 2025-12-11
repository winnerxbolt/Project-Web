import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { SMSTemplate } from '@/types/sms'

const DATA_DIR = path.join(process.cwd(), 'data')

// GET - Get all templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    
    const filePath = path.join(DATA_DIR, 'sms-templates.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let templates: SMSTemplate[] = JSON.parse(data)
    
    // Filter
    if (category) {
      templates = templates.filter(t => t.category === category)
    }
    if (isActive !== null) {
      templates = templates.filter(t => t.isActive === (isActive === 'true'))
    }
    
    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load templates'
    }, { status: 500 })
  }
}

// POST - Create template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    if (!body.name || !body.content || !body.category) {
      return NextResponse.json({
        success: false,
        error: 'Name, content, and category are required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-templates.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const templates: SMSTemplate[] = JSON.parse(data)
    
    // Extract variables from content
    const variableRegex = /{{([^}]+)}}/g
    const variables: string[] = []
    let match
    while ((match = variableRegex.exec(body.content)) !== null) {
      const varName = match[1].trim()
      if (!variables.includes(varName)) {
        variables.push(varName)
      }
    }
    
    const newTemplate: SMSTemplate = {
      id: body.id || `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      category: body.category,
      subject: body.subject || body.name,
      content: body.content,
      variables,
      provider: body.provider || 'thaibulksms',
      isActive: body.isActive !== false,
      language: body.language || 'th',
      sendImmediately: body.sendImmediately !== false,
      scheduleOffset: body.scheduleOffset,
      sendOnWeekdays: body.sendOnWeekdays !== false,
      sendOnWeekends: body.sendOnWeekends !== false,
      allowedHours: body.allowedHours,
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      deliveryRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || 'admin'
    }
    
    templates.push(newTemplate)
    await fs.writeFile(filePath, JSON.stringify(templates, null, 2))
    
    return NextResponse.json({
      success: true,
      template: newTemplate
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create template'
    }, { status: 500 })
  }
}

// PUT - Update template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-templates.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const templates: SMSTemplate[] = JSON.parse(data)
    
    const index = templates.findIndex(t => t.id === body.id)
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 })
    }
    
    // Update fields
    const template = templates[index]
    if (body.name) template.name = body.name
    if (body.subject) template.subject = body.subject
    if (body.content) {
      template.content = body.content
      
      // Re-extract variables
      const variableRegex = /{{([^}]+)}}/g
      const variables: string[] = []
      let match
      while ((match = variableRegex.exec(body.content)) !== null) {
        const varName = match[1].trim()
        if (!variables.includes(varName)) {
          variables.push(varName)
        }
      }
      template.variables = variables
    }
    if (body.category) template.category = body.category
    if (body.provider) template.provider = body.provider
    if (body.isActive !== undefined) template.isActive = body.isActive
    if (body.language) template.language = body.language
    if (body.sendImmediately !== undefined) template.sendImmediately = body.sendImmediately
    if (body.scheduleOffset) template.scheduleOffset = body.scheduleOffset
    if (body.sendOnWeekdays !== undefined) template.sendOnWeekdays = body.sendOnWeekdays
    if (body.sendOnWeekends !== undefined) template.sendOnWeekends = body.sendOnWeekends
    if (body.allowedHours) template.allowedHours = body.allowedHours
    
    template.updatedAt = new Date().toISOString()
    templates[index] = template
    
    await fs.writeFile(filePath, JSON.stringify(templates, null, 2))
    
    return NextResponse.json({
      success: true,
      template
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update template'
    }, { status: 500 })
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 })
    }
    
    const filePath = path.join(DATA_DIR, 'sms-templates.json')
    const data = await fs.readFile(filePath, 'utf-8')
    let templates: SMSTemplate[] = JSON.parse(data)
    
    const initialLength = templates.length
    templates = templates.filter(t => t.id !== id)
    
    if (templates.length === initialLength) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 })
    }
    
    await fs.writeFile(filePath, JSON.stringify(templates, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete template'
    }, { status: 500 })
  }
}
