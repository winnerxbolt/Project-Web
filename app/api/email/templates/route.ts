import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { EmailTemplate } from '@/types/email'

const TEMPLATES_FILE = 'email-templates.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    let templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []

    // Filter by type
    if (type) {
      templates = templates.filter(t => t.type === type)
    }

    // Filter by category
    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    // Filter by status
    if (status) {
      templates = templates.filter(t => t.status === status)
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, subject, previewText, type, category, htmlContent, textContent, variables } = body

    // Validation
    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ 
        error: 'Name, subject, and HTML content are required' 
      }, { status: 400 })
    }

    const templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []

    // Create new template
    const newTemplate: EmailTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      subject,
      previewText,
      type: type || 'custom',
      category: category || 'marketing',
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      variables: variables || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    }

    templates.push(newTemplate)
    await writeJson(TEMPLATES_FILE, templates)

    return NextResponse.json({ 
      message: 'Template created successfully',
      template: newTemplate
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []
    const index = templates.findIndex(t => t.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(TEMPLATES_FILE, templates)

    return NextResponse.json({ 
      message: 'Template updated successfully',
      template: templates[index]
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const templates = await readJson<EmailTemplate[]>(TEMPLATES_FILE) || []
    const filtered = templates.filter(t => t.id !== id)

    if (filtered.length === templates.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await writeJson(TEMPLATES_FILE, filtered)

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
