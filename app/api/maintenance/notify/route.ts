import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BOOKINGS_PATH = path.join(process.cwd(), 'data', 'bookings.json')

// This API sends email notifications to guests affected by maintenance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { maintenanceId, title, startDate, endDate, message } = body

    // Load bookings to find affected guests
    let bookings: any[] = []
    if (fs.existsSync(BOOKINGS_PATH)) {
      const data = fs.readFileSync(BOOKINGS_PATH, 'utf-8')
      bookings = JSON.parse(data)
    }

    // Find bookings that overlap with maintenance period
    const affectedBookings = bookings.filter((booking: any) => {
      if (!booking.checkIn || !booking.checkOut) return false
      
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      const maintStart = new Date(startDate)
      const maintEnd = new Date(endDate)

      // Check for overlap
      return bookingStart <= maintEnd && bookingEnd >= maintStart
    })

    // In a real application, you would send actual emails here
    // For now, we'll simulate email sending and log the notifications
    const notifications = []

    for (const booking of affectedBookings) {
      const emailContent = {
        to: booking.email,
        subject: `⚠️ การแจ้งเตือน: ${title}`,
        body: `
เรียน คุณ${booking.firstName} ${booking.lastName}

เราขอแจ้งให้ทราบเกี่ยวกับการซ่อมบำรุงที่อาจส่งผลกระทบต่อการเข้าพักของคุณ:

📋 รายละเอียด:
${message || 'มีการซ่อมบำรุงในช่วงเวลาที่คุณเข้าพัก'}

📅 ช่วงเวลา:
วันที่: ${new Date(startDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
ถึงวันที่: ${new Date(endDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}

📌 การจองของคุณ:
หมายเลขจอง: ${booking.id}
Check-in: ${new Date(booking.checkIn).toLocaleDateString('th-TH', { dateStyle: 'long' })}
Check-out: ${new Date(booking.checkOut).toLocaleDateString('th-TH', { dateStyle: 'long' })}
ห้อง: ${booking.roomName || 'N/A'}

เราขออภัยในความไม่สะดวก หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือใด ๆ 
กรุณาติดต่อเราได้ที่:
📞 โทร: 02-XXX-XXXX
📧 อีเมล: support@poolvillabooking.com

ขอขอบคุณสำหรับความเข้าใจของท่าน

ด้วยความเคารพ
ทีมงาน Pool Villa Booking
        `,
        sentAt: new Date().toISOString(),
        bookingId: booking.id,
        guestName: `${booking.firstName} ${booking.lastName}`,
      }

      notifications.push(emailContent)

      // In production, use a service like SendGrid, AWS SES, or Nodemailer:
      // await sendEmail(emailContent)
      
      console.log(`📧 Email notification sent to: ${booking.email}`)
      console.log(`Subject: ${emailContent.subject}`)
    }

    // Log notifications for debugging
    const logPath = path.join(process.cwd(), 'data', 'email-logs.json')
    let logs: any[] = []
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf-8')
      logs = JSON.parse(data)
    }

    logs.push({
      maintenanceId,
      timestamp: new Date().toISOString(),
      notificationsSent: notifications.length,
      notifications,
    })

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2))

    return NextResponse.json({
      success: true,
      message: `ส่งอีเมลแจ้งเตือนสำเร็จ`,
      notificationsSent: notifications.length,
      affectedBookings: affectedBookings.length,
      notifications: notifications.map(n => ({
        to: n.to,
        subject: n.subject,
        guestName: n.guestName,
        bookingId: n.bookingId,
      })),
    })

  } catch (error) {
    console.error('Error sending maintenance notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve email logs
export async function GET(_req: NextRequest) {
  try {
    const logPath = path.join(process.cwd(), 'data', 'email-logs.json')
    
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: [] })
    }

    const data = fs.readFileSync(logPath, 'utf-8')
    const logs = JSON.parse(data)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error retrieving email logs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    )
  }
}
