import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { CorporateClient } from '@/types/groupBooking'

const filePath = path.join(process.cwd(), 'data', 'corporate-clients.json')

// Helper to read data
function readClients(): CorporateClient[] {
  if (!fs.existsSync(filePath)) {
    return []
  }
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

// Helper to write data
function writeClients(clients: CorporateClient[]) {
  fs.writeFileSync(filePath, JSON.stringify(clients, null, 2))
}

// GET - Get all corporate clients
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let clients = readClients()
    
    if (status) {
      clients = clients.filter(c => c.status === status)
    }
    
    // Sort by company name
    clients.sort((a, b) => a.companyName.localeCompare(b.companyName))
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching corporate clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

// POST - Create new corporate client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clients = readClients()
    
    const newClient: CorporateClient = {
      id: `CC${Date.now()}`,
      companyName: body.companyName,
      taxId: body.taxId,
      industry: body.industry,
      primaryContact: body.primaryContact,
      alternativeContacts: body.alternativeContacts || [],
      billingAddress: body.billingAddress,
      contract: body.contract,
      totalBookings: 0,
      totalRevenue: 0,
      totalRoomNights: 0,
      preferences: body.preferences || {},
      status: body.status || 'active',
      notes: body.notes || ''
    }
    
    clients.push(newClient)
    writeClients(clients)
    
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error creating corporate client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

// PUT - Update corporate client
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const clients = readClients()
    
    const index = clients.findIndex(c => c.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    clients[index] = { ...clients[index], ...body }
    writeClients(clients)
    
    return NextResponse.json(clients[index])
  } catch (error) {
    console.error('Error updating corporate client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

// DELETE - Delete corporate client
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    let clients = readClients()
    clients = clients.filter(c => c.id !== id)
    
    writeClients(clients)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting corporate client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
