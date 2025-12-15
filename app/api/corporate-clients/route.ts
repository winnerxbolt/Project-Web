import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { CorporateClient } from '@/types/groupBooking'

// GET - Get all corporate clients
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase.from('corporate_clients').select('*')
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: clients, error } = await query.order('company_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching corporate clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }
    
    return NextResponse.json(clients || [])
  } catch (error) {
    console.error('Error fetching corporate clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

// POST - Create new corporate client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newClient = {
      id: `CC${Date.now()}`,
      company_name: body.companyName,
      tax_id: body.taxId,
      industry: body.industry,
      primary_contact: body.primaryContact,
      alternative_contacts: body.alternativeContacts || [],
      billing_address: body.billingAddress,
      contract: body.contract,
      total_bookings: 0,
      total_revenue: 0,
      total_room_nights: 0,
      preferences: body.preferences || {},
      status: body.status || 'active',
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('corporate_clients')
      .insert(newClient)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating corporate client:', error)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating corporate client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

// PUT - Update corporate client
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    const { data: existing, error: fetchError } = await supabase
      .from('corporate_clients')
      .select('id')
      .eq('id', body.id)
      .single()
    
    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    const updates = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('corporate_clients')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating corporate client:', error)
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
    }
    
    return NextResponse.json(data)
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
    
    const { error } = await supabaseAdmin
      .from('corporate_clients')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting corporate client:', error)
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting corporate client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
