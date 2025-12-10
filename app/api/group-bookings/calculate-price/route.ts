import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
const roomsPath = path.join(process.cwd(), 'data', 'rooms.json')
const discountSettingsPath = path.join(process.cwd(), 'data', 'group-discount-settings.json')

// Calculate group booking price
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rooms, checkIn, checkOut, numberOfRooms } = body
    
    // Read rooms data
    const roomsData = JSON.parse(fs.readFileSync(roomsPath, 'utf-8'))
    
    // Read discount settings
    let discountSettings = []
    if (fs.existsSync(discountSettingsPath)) {
      discountSettings = JSON.parse(fs.readFileSync(discountSettingsPath, 'utf-8'))
    }
    
    // Calculate nights
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate subtotal
    let subtotal = 0
    const roomDetails = rooms.map((room: any) => {
      const roomData = roomsData.find((r: any) => r.id === room.roomId)
      if (!roomData) return null
      
      const roomTotal = roomData.price * room.quantity * nights
      subtotal += roomTotal
      
      return {
        roomId: room.roomId,
        roomName: roomData.name,
        roomType: roomData.type,
        quantity: room.quantity,
        pricePerNight: roomData.price,
        totalPrice: roomTotal,
        adults: room.adults || 2,
        children: room.children || 0
      }
    }).filter(Boolean)
    
    // Apply group discount
    let groupDiscountPercentage = 0
    let groupDiscountAmount = 0
    
    const enabledSettings = discountSettings.find((s: any) => s.enabled)
    if (enabledSettings && numberOfRooms >= 3) {
      // Find applicable tier
      const tier = enabledSettings.tiers.find((t: any) => {
        if (t.maxRooms) {
          return numberOfRooms >= t.minRooms && numberOfRooms <= t.maxRooms
        }
        return numberOfRooms >= t.minRooms
      })
      
      if (tier) {
        groupDiscountPercentage = tier.discountPercentage
        groupDiscountAmount = (subtotal * groupDiscountPercentage) / 100
      }
    }
    
    // Calculate tax (7%)
    const taxableAmount = subtotal - groupDiscountAmount
    const taxAmount = taxableAmount * 0.07
    
    // Calculate total
    const totalAmount = taxableAmount + taxAmount
    
    // Calculate deposit (30%)
    const depositRequired = totalAmount * 0.3
    
    return NextResponse.json({
      subtotal,
      groupDiscountPercentage,
      groupDiscountAmount,
      taxAmount,
      totalAmount,
      depositRequired,
      nights,
      roomDetails,
      currency: 'THB'
    })
  } catch (error) {
    console.error('Error calculating group price:', error)
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 })
  }
}
