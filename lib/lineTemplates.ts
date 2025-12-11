// LINE Flex Message Templates for different notification types

export const lineTemplates = {
  // Booking Confirmation Template
  bookingConfirmation: (booking: any) => ({
    type: 'flex',
    altText: `🎉 การจองสำเร็จ! หมายเลข #${booking.id}`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🎉 การจองสำเร็จ!',
                color: '#ffffff',
                size: 'xl',
                weight: 'bold'
              },
              {
                type: 'text',
                text: `หมายเลขจอง: #${booking.id}`,
                color: '#ffffff',
                size: 'sm',
                margin: 'md'
              }
            ]
          }
        ],
        paddingAll: '20px',
        backgroundColor: '#10B981',
        spacing: 'md',
        height: '100px',
        paddingTop: '22px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'ห้องพัก',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: booking.roomName,
                    wrap: true,
                    color: '#1F2937',
                    size: 'sm',
                    flex: 5,
                    weight: 'bold'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'ชื่อผู้จอง',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: booking.guestName,
                    wrap: true,
                    color: '#1F2937',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                margin: 'lg',
                contents: [
                  {
                    type: 'text',
                    text: 'เช็คอิน',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: booking.checkIn,
                    wrap: true,
                    color: '#1F2937',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'เช็คเอาท์',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: booking.checkOut,
                    wrap: true,
                    color: '#1F2937',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'จำนวนคืน',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: `${booking.nights} คืน`,
                    wrap: true,
                    color: '#1F2937',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                margin: 'lg',
                contents: [
                  {
                    type: 'text',
                    text: 'ยอดชำระ',
                    color: '#6B7280',
                    size: 'md',
                    flex: 2,
                    weight: 'bold'
                  },
                  {
                    type: 'text',
                    text: `${booking.total.toLocaleString()} ฿`,
                    wrap: true,
                    color: '#EF4444',
                    size: 'xl',
                    flex: 5,
                    weight: 'bold'
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียด',
              uri: `https://your-domain.com/bookings/${booking.id}`
            },
            color: '#3B82F6'
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'ดาวน์โหลด E-Ticket',
              uri: `https://your-domain.com/tickets/${booking.id}`
            }
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [],
            margin: 'sm'
          }
        ],
        flex: 0
      }
    }
  }),

  // Check-in Reminder Template
  checkinReminder: (booking: any) => ({
    type: 'flex',
    altText: `🏖️ พร้อมเช็คอินแล้ว! วันพรุ่งนี้ ${booking.checkIn}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://your-domain.com/images/checkin-hero.jpg',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🏖️ พร้อมเช็คอินแล้ว!',
            weight: 'bold',
            size: 'xl',
            color: '#3B82F6'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: `พรุ่งนี้ ${booking.checkIn}`,
                size: 'md',
                color: '#1F2937'
              },
              {
                type: 'text',
                text: `ห้อง: ${booking.roomName}`,
                size: 'sm',
                color: '#6B7280',
                margin: 'md'
              }
            ]
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '📋 สิ่งที่ต้องเตรียม:',
                weight: 'bold',
                size: 'md',
                color: '#1F2937'
              },
              {
                type: 'text',
                text: '• บัตรประชาชน หรือ Passport',
                size: 'sm',
                color: '#4B5563'
              },
              {
                type: 'text',
                text: '• ใบจอง หรือ E-Ticket',
                size: 'sm',
                color: '#4B5563'
              },
              {
                type: 'text',
                text: '• ชุดว่ายน้ำ และ ของใช้ส่วนตัว',
                size: 'sm',
                color: '#4B5563'
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '⏰ เวลาเช็คอิน: 14:00 น.',
                size: 'sm',
                color: '#6B7280'
              },
              {
                type: 'text',
                text: '📞 โทร: 099-XXX-XXXX',
                size: 'sm',
                color: '#6B7280'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'ดู E-Ticket',
              uri: `https://your-domain.com/tickets/${booking.id}`
            }
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'ดูแผนที่',
              uri: 'https://maps.google.com/?q=Poolvilla+Pattaya'
            }
          }
        ]
      }
    }
  }),

  // Promotion Alert Template
  promotionAlert: (promotion: any) => ({
    type: 'flex',
    altText: `🎁 โปรโมชั่นพิเศษ! ${promotion.title}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: promotion.imageUrl || 'https://your-domain.com/images/promo-default.jpg',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        action: {
          type: 'uri',
          uri: promotion.url || 'https://your-domain.com/rooms'
        }
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🎁 โปรโมชั่นพิเศษ',
            size: 'md',
            color: '#EF4444',
            weight: 'bold'
          },
          {
            type: 'text',
            text: promotion.title,
            weight: 'bold',
            size: 'xl',
            margin: 'md',
            color: '#1F2937'
          },
          {
            type: 'text',
            text: promotion.description,
            size: 'sm',
            color: '#6B7280',
            wrap: true,
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'ส่วนลด',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: promotion.discount,
                    wrap: true,
                    color: '#EF4444',
                    size: 'lg',
                    flex: 4,
                    weight: 'bold'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'ระยะเวลา',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: promotion.validUntil,
                    wrap: true,
                    color: '#1F2937',
                    size: 'sm',
                    flex: 4
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'โค้ด',
                    color: '#6B7280',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: promotion.code || '-',
                    wrap: true,
                    color: '#3B82F6',
                    size: 'md',
                    flex: 4,
                    weight: 'bold'
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'จองเลย',
              uri: promotion.url || 'https://your-domain.com/rooms'
            },
            color: '#EF4444'
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'ดูโปรโมชั่นทั้งหมด',
              uri: 'https://your-domain.com/promotions'
            }
          }
        ]
      }
    }
  }),

  // Simple Text Message Template
  textMessage: (message: string) => ({
    type: 'text',
    text: message
  })
}

// Helper function to send LINE notification with template
export async function sendLineNotification(
  channelAccessToken: string,
  lineUserId: string,
  templateName: keyof typeof lineTemplates,
  data: any
) {
  const template = lineTemplates[templateName]
  const message = typeof template === 'function' ? template(data) : template

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [message]
    })
  })

  return response.ok
}
