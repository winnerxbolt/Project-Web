import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { ETicket } from '@/types/ticket'
import { TicketGenerator } from '@/lib/ticketGenerator'

const DATA_DIR = path.join(process.cwd(), 'data')
const TICKETS_FILE = path.join(DATA_DIR, 'e-tickets.json')
const TEMPLATES_FILE = path.join(DATA_DIR, 'ticket-templates.json')

// GET - ดึง E-Tickets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')
    const ticketNumber = searchParams.get('ticketNumber')
    const status = searchParams.get('status')

    const data = await fs.readFile(TICKETS_FILE, 'utf-8')
    let tickets: ETicket[] = JSON.parse(data)

    // Filter
    if (bookingId) {
      tickets = tickets.filter(t => t.bookingId === bookingId)
    }
    if (ticketNumber) {
      tickets = tickets.filter(t => t.ticketNumber === ticketNumber)
    }
    if (status) {
      tickets = tickets.filter(t => t.status === status)
    }

    return NextResponse.json({
      success: true,
      tickets
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tickets'
    }, { status: 500 })
  }
}

// POST - สร้าง E-Ticket ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingId,
      guestName,
      guestEmail,
      guestPhone,
      roomName,
      roomImage,
      checkIn,
      checkOut,
      nights,
      totalAmount,
      specialInstructions,
      amenities,
      checkInTime,
      checkOutTime,
      numberOfGuests,
      templateId
    } = body

    // Load templates
    const templatesData = await fs.readFile(TEMPLATES_FILE, 'utf-8')
    const templates = JSON.parse(templatesData)
    const template = templates.find((t: any) => t.id === templateId) || templates[0]

    // Generate ticket
    const generator = new TicketGenerator(template)
    const ticketNumber = generator.generateTicketNumber()
    const barcodeNumber = generator.generateBarcodeNumber()

    // Generate QR code and barcode
    const qrData = JSON.stringify({
      ticketNumber,
      bookingId,
      guestName,
      checkIn
    })
    const qrCode = await generator.generateQRCode(qrData)
    const barcode = await generator.generateBarcode(barcodeNumber)

    // Create ticket
    const newTicket: ETicket = {
      id: `ticket-${Date.now()}`,
      bookingId,
      ticketNumber,
      qrCode,
      barcode,
      guestName,
      guestEmail,
      guestPhone,
      roomName,
      roomImage,
      checkIn,
      checkOut,
      nights,
      totalAmount,
      status: 'active',
      generatedAt: new Date().toISOString(),
      validUntil: checkOut,
      specialInstructions,
      amenities,
      checkInTime: checkInTime || '14:00',
      checkOutTime: checkOutTime || '11:00',
      numberOfGuests
    }

    // Save
    const data = await fs.readFile(TICKETS_FILE, 'utf-8')
    const tickets: ETicket[] = JSON.parse(data)
    tickets.push(newTicket)
    await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2))

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'E-Ticket สร้างสำเร็จ'
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create ticket'
    }, { status: 500 })
  }
}

// PUT - อัปเดตสถานะ E-Ticket
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketNumber, status } = body

    const data = await fs.readFile(TICKETS_FILE, 'utf-8')
    const tickets: ETicket[] = JSON.parse(data)

    const ticketIndex = tickets.findIndex(t => t.ticketNumber === ticketNumber)
    if (ticketIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Ticket not found'
      }, { status: 404 })
    }

    tickets[ticketIndex].status = status
    await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2))

    return NextResponse.json({
      success: true,
      ticket: tickets[ticketIndex],
      message: 'อัปเดตสถานะสำเร็จ'
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update ticket'
    }, { status: 500 })
  }
}
