'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { FaCheckCircle, FaHome, FaPrint, FaClock, FaTicketAlt, FaStar, FaBell } from 'react-icons/fa'

interface Booking {
  id: number
  roomName: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
}

export default function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [eTicketId, setETicketId] = useState<string | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [])

  useEffect(() => {
    if (booking) {
      generateETicket()
      addLoyaltyPoints()
      sendPushNotification()
    }
  }, [booking])

  const loadBooking = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      if (data.success) {
        const found = data.bookings.find((b: Booking) => b.id === Number(resolvedParams.id))
        setBooking(found || null)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const generateETicket = async () => {
    if (!booking) return

    setLoading(true)
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id.toString(),
          guestName: booking.guestName,
          guestEmail: booking.guestEmail || `guest${booking.id}@example.com`,
          guestPhone: booking.guestPhone || '0800000000',
          roomName: booking.roomName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
          totalAmount: booking.total,
          templateId: 'template-modern'
        })
      })

      const data = await response.json()
      if (data.ticketNumber) {
        setETicketId(data.ticketNumber)
      }
    } catch (error) {
      console.error('Error generating e-ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLoyaltyPoints = async () => {
    if (!booking) return

    try {
      const points = Math.floor(booking.total / 100)
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: booking.guestEmail || `guest${booking.id}@example.com`,
          points: points,
          description: `จากการจอง #${booking.id}`,
          referenceId: booking.id.toString()
        })
      })

      const data = await response.json()
      if (data.transaction) {
        setLoyaltyPoints(points)
      }
    } catch (error) {
      console.error('Error adding loyalty points:', error)
    }
  }

  const sendPushNotification = async () => {
    if (!booking) return

    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: booking.guestEmail || `guest${booking.id}@example.com`,
          title: '🎉 จองสำเร็จ!',
          body: `การจองห้อง ${booking.roomName} ของคุณถูกยืนยันแล้ว`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            url: `/payment-success/${booking.id}`,
            bookingId: booking.id.toString()
          },
          actions: [
            { action: 'view', title: 'ดู E-Ticket' },
            { action: 'close', title: 'ปิด' }
          ]
        })
      })
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price)
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-green-500 rounded-full shadow-2xl mb-6 animate-bounce">
            <FaCheckCircle className="text-7xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            ส่งข้อมูลการชำระเงินเรียบร้อย!
          </h1>
          <p className="text-xl text-gray-600">
            รอการยืนยันจากแอดมินภายใน 24 ชั่วโมง
          </p>
        </div>

        {/* Bonus Features */}
        {(eTicketId || loyaltyPoints > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {eTicketId && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <FaTicketAlt className="text-3xl mb-3" />
                <h3 className="text-lg font-bold mb-1">E-Ticket พร้อมใช้งาน</h3>
                <p className="text-sm opacity-90 mb-2">หมายเลข: {eTicketId}</p>
                <Link
                  href={`/admin/tickets`}
                  className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-100 transition-all"
                >
                  ดู E-Ticket
                </Link>
              </div>
            )}

            {loyaltyPoints > 0 && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <FaStar className="text-3xl mb-3" />
                <h3 className="text-lg font-bold mb-1">คะแนนสะสม</h3>
                <p className="text-2xl font-black mb-2">+{loyaltyPoints} คะแนน</p>
                <Link
                  href="/loyalty"
                  className="inline-block bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 transition-all"
                >
                  ดูคะแนนสะสม
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
            <FaClock className="text-2xl text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">รอการยืนยัน</h2>
              <p className="text-sm text-gray-500">หมายเลขจอง: #{booking.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">ห้องพัก</p>
              <p className="text-lg font-bold text-gray-800">{booking.roomName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ชื่อผู้จอง</p>
              <p className="text-lg font-bold text-gray-800">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Check-in</p>
              <p className="font-semibold text-gray-800">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Check-out</p>
              <p className="font-semibold text-gray-800">{formatDate(booking.checkOut)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">ยอดชำระ</span>
              <span className="text-3xl font-bold text-green-600">{formatPrice(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">ขั้นตอนต่อไป</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">1.</span>
              <span>แอดมินจะตรวจสอบการชำระเงินของคุณ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">2.</span>
              <span>คุณจะได้รับอีเมลยืนยันการจองเมื่อการชำระเงินได้รับการอนุมัติ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">3.</span>
              <span>นำเอกสารยืนยันมาแสดงในวันเช็คอิน</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/rooms"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-800 rounded-xl font-bold border-2 border-gray-200 hover:border-pool-light hover:bg-gray-50 transition shadow-md"
          >
            <FaHome />
            กลับหน้าแรก
          </Link>
          <Link
            href={`/admin/bookings/print/${booking.id}`}
            target="_blank"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-pool-light text-white rounded-xl font-bold hover:bg-pool-dark transition shadow-md"
          >
            <FaPrint />
            พิมพ์ใบจอง
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            หากมีข้อสงสัย ติดต่อ: <strong>099-XXX-XXXX</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
