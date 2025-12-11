import type { ETicket, TicketTemplate } from '@/types/ticket'

// ใน production ใช้ library jsPDF และ qrcode
// npm install jspdf qrcode jsbarcode

export class TicketGenerator {
  private template: TicketTemplate

  constructor(template: TicketTemplate) {
    this.template = template
  }

  async generatePDF(ticket: ETicket): Promise<string> {
    // ใน production จะใช้ jsPDF สร้าง PDF จริง
    // ตอนนี้ return mock base64
    
    const pdfData = {
      ticket,
      template: this.template,
      generatedAt: new Date().toISOString()
    }

    // Mock PDF base64
    return `data:application/pdf;base64,${btoa(JSON.stringify(pdfData))}`
  }

  async generateQRCode(data: string): Promise<string> {
    // ใน production ใช้ library qrcode
    // const QRCode = require('qrcode')
    // return await QRCode.toDataURL(data)
    
    // Mock QR Code SVG
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="white"/>
        <text x="50" y="50" text-anchor="middle" font-size="8" fill="black">QR: ${data.slice(0, 10)}</text>
      </svg>
    `)}`
  }

  async generateBarcode(code: string): Promise<string> {
    // ใน production ใช้ library jsbarcode
    // const JsBarcode = require('jsbarcode')
    
    // Mock Barcode SVG
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50">
        <rect width="200" height="50" fill="white"/>
        <text x="100" y="30" text-anchor="middle" font-size="12" fill="black">${code}</text>
      </svg>
    `)}`
  }

  generateTicketNumber(): string {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `TKT${year}${month}${day}${random}`
  }

  generateBarcodeNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return timestamp + random
  }
}

// HTML Template สำหรับ E-Ticket (ใช้แสดงในหน้าเว็บ)
export function generateTicketHTML(ticket: ETicket, template: TicketTemplate): string {
  const { primaryColor, secondaryColor } = template

  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Ticket - ${ticket.ticketNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ticket-container {
          max-width: 800px;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .ticket-header {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          padding: 40px;
          color: white;
          text-align: center;
        }
        .ticket-header h1 {
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: 800;
        }
        .ticket-number {
          font-size: 18px;
          opacity: 0.9;
          letter-spacing: 2px;
          font-weight: 600;
        }
        .ticket-body {
          padding: 40px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .section-content {
          font-size: 24px;
          color: #1a1a1a;
          font-weight: 700;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 30px;
        }
        .info-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }
        .info-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .info-value {
          font-size: 18px;
          color: #1a1a1a;
          font-weight: 700;
        }
        .qr-section {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 30px;
          background: #f8f9fa;
          border-radius: 16px;
          margin: 30px 0;
        }
        .qr-code {
          text-align: center;
        }
        .qr-code img {
          width: 150px;
          height: 150px;
          border: 4px solid white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .qr-label {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }
        .barcode {
          text-align: center;
        }
        .barcode img {
          width: 200px;
          height: auto;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .status-active {
          background: #d4edda;
          color: #155724;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .footer-note {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
        }
        @media print {
          body { background: white; padding: 0; }
          .ticket-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="ticket-header">
          <h1>🏖️ Poolvilla E-Ticket</h1>
          <div class="ticket-number">${ticket.ticketNumber}</div>
        </div>

        <div class="ticket-body">
          <div class="section">
            <span class="status-badge status-${ticket.status}">${ticket.status.toUpperCase()}</span>
          </div>

          <div class="section">
            <div class="section-title">ผู้เข้าพัก</div>
            <div class="section-content">${ticket.guestName}</div>
          </div>

          <div class="section">
            <div class="section-title">ห้องพัก</div>
            <div class="section-content">${ticket.roomName}</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">วันเช็คอิน</div>
              <div class="info-value">${new Date(ticket.checkIn).toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
              ${ticket.checkInTime ? `<div style="margin-top: 5px; font-size: 14px; color: #666;">เวลา ${ticket.checkInTime} น.</div>` : ''}
            </div>
            <div class="info-item">
              <div class="info-label">วันเช็คเอาท์</div>
              <div class="info-value">${new Date(ticket.checkOut).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
              ${ticket.checkOutTime ? `<div style="margin-top: 5px; font-size: 14px; color: #666;">เวลา ${ticket.checkOutTime} น.</div>` : ''}
            </div>
            <div class="info-item">
              <div class="info-label">จำนวนคืน</div>
              <div class="info-value">${ticket.nights} คืน</div>
            </div>
            <div class="info-item">
              <div class="info-label">ยอดรวม</div>
              <div class="info-value">฿${ticket.totalAmount.toLocaleString()}</div>
            </div>
          </div>

          ${ticket.numberOfGuests ? `
            <div class="info-item" style="margin-bottom: 20px;">
              <div class="info-label">จำนวนผู้เข้าพัก</div>
              <div class="info-value">${ticket.numberOfGuests} ท่าน</div>
            </div>
          ` : ''}

          ${ticket.amenities && ticket.amenities.length > 0 ? `
            <div class="section">
              <div class="section-title">สิ่งอำนวยความสะดวก</div>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                ${ticket.amenities.map(amenity => `
                  <span style="padding: 6px 12px; background: #e9ecef; border-radius: 20px; font-size: 14px;">
                    ${amenity}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${ticket.specialInstructions ? `
            <div class="section">
              <div class="section-title">คำแนะนำพิเศษ</div>
              <div style="padding: 15px; background: #fff3cd; border-radius: 8px; margin-top: 10px;">
                ${ticket.specialInstructions}
              </div>
            </div>
          ` : ''}

          <div class="qr-section">
            <div class="qr-code">
              <img src="${ticket.qrCode}" alt="QR Code" />
              <div class="qr-label">สแกน QR Code เพื่อเช็คอิน</div>
            </div>
            <div class="barcode">
              <img src="${ticket.barcode}" alt="Barcode" />
              <div class="qr-label">Booking ID: ${ticket.bookingId}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div><strong>ติดต่อเรา:</strong> 02-XXX-XXXX | info@poolvilla.com</div>
          <div class="footer-note">
            กรุณานำ E-Ticket นี้มาแสดงเมื่อเช็คอิน<br>
            สามารถพิมพ์หรือแสดงจากมือถือได้
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export default TicketGenerator
