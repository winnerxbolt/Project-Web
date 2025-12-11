export interface ETicket {
  id: string
  bookingId: string
  ticketNumber: string
  qrCode: string
  barcode: string
  guestName: string
  guestEmail: string
  guestPhone: string
  roomName: string
  roomImage?: string
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
  status: 'active' | 'used' | 'cancelled' | 'expired'
  generatedAt: string
  validUntil: string
  specialInstructions?: string
  amenities?: string[]
  checkInTime?: string
  checkOutTime?: string
  numberOfGuests?: number
}

export interface TicketTemplate {
  id: string
  name: string
  description: string
  template: 'modern' | 'classic' | 'luxury' | 'minimal'
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  isActive: boolean
  createdAt: string
}

export interface VoucherCode {
  code: string
  value: number
  type: 'percentage' | 'fixed'
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  applicableRooms?: number[]
}
