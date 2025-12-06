'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { FaCheckCircle, FaPrint, FaTimes } from 'react-icons/fa'

interface Booking {
  id: number
  roomId: string | null
  roomName: string
  guestName: string
  email: string | null
  phone: string | null
  checkIn: string
  checkOut: string
  guests: number
  status: string
  total: number
  createdAt: string
  cancelReason?: string
  refundAmount?: number
}

export default function PrintBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [])

  const loadBooking = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      if (data.success) {
        const found = data.bookings.find((b: Booking) => b.id === Number(resolvedParams.id))
        setBooking(found || null)
        setEditedBooking(found || null)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editedBooking) return
    
    setIsSaving(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedBooking)
      })
      
      const data = await res.json()
      if (data.success) {
        setBooking(editedBooking)
        setIsEditing(false)
        alert('บันทึกข้อมูลสำเร็จ')
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditChange = (field: keyof Booking, value: any) => {
    if (editedBooking) {
      setEditedBooking({ ...editedBooking, [field]: value })
    }
  }

  const handlePrint = () => {
    window.print()
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

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-800">กำลังโหลด...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FaTimes className="text-6xl text-red-500 mb-4" />
        <div className="text-2xl font-bold text-gray-800">ไม่พบรายการจอง</div>
      </div>
    )
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <FaTimes />
            ปิดหน้าต่าง
          </button>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  แก้ไขข้อมูล
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-2 bg-pool-light hover:bg-pool-dark text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-md"
                >
                  <FaPrint />
                  พิมพ์
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditedBooking(booking)
                    setIsEditing(false)
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
                  disabled={isSaving}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-2xl p-12 print:shadow-none print:border-2 print:border-gray-300">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-4 border-pool-light">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">ใบยืนยันการจอง</h1>
            <p className="text-xl text-pool-dark font-semibold">WINNERBOY Poolvilla</p>
            <p className="text-gray-600 mt-2">รีสอร์ทสำหรับครอบครัว พร้อมสระว่ายน้ำส่วนตัว</p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            {booking.status === 'confirmed' && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-full text-lg font-bold border-2 border-green-300">
                <FaCheckCircle className="text-2xl" />
                ยืนยันการจองแล้ว
              </div>
            )}
            {booking.status === 'completed' && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-full text-lg font-bold border-2 border-blue-300">
                <FaCheckCircle className="text-2xl" />
                เสร็จสิ้น
              </div>
            )}
            {booking.status === 'pending' && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-full text-lg font-bold border-2 border-yellow-300">
                รอการยืนยัน
              </div>
            )}
            {booking.status === 'cancelled' && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-full text-lg font-bold border-2 border-red-300">
                <FaTimes className="text-2xl" />
                ยกเลิกการจอง
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
                ข้อมูลการจอง
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">หมายเลขจอง</p>
                  <p className="text-xl font-bold text-gray-800">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">วันที่จอง</p>
                  <p className="font-bold text-gray-800">{formatDate(booking.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ห้องพัก</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBooking?.roomName || ''}
                      onChange={(e) => handleEditChange('roomName', e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-bold text-gray-800">{booking.roomName}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">จำนวนผู้เข้าพัก</p>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      value={editedBooking?.guests || 1}
                      onChange={(e) => handleEditChange('guests', parseInt(e.target.value))}
                      className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-bold text-gray-800">{booking.guests} คน</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
                ข้อมูลผู้จอง
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">ชื่อผู้จอง</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBooking?.guestName || ''}
                      onChange={(e) => handleEditChange('guestName', e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-bold text-gray-800">{booking.guestName}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">อีเมล</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedBooking?.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-bold text-gray-800">{booking.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedBooking?.phone || ''}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-bold text-gray-800">{booking.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="bg-pool-light/10 rounded-xl p-6 mb-8 border-2 border-pool-light/30">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">รายละเอียดการเข้าพัก</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedBooking?.checkIn.split('T')[0] || ''}
                    onChange={(e) => handleEditChange('checkIn', e.target.value)}
                    className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 text-center focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xl font-bold text-gray-800">{formatDate(booking.checkIn)}</p>
                )}
                <p className="text-sm text-gray-500">เวลา 14:00 น.</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">จำนวนคืน</p>
                <p className="text-3xl font-bold text-pool-dark">
                  {editedBooking ? calculateNights(editedBooking.checkIn, editedBooking.checkOut) : nights}
                </p>
                <p className="text-sm text-gray-500">คืน</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedBooking?.checkOut.split('T')[0] || ''}
                    onChange={(e) => handleEditChange('checkOut', e.target.value)}
                    className="w-full p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 text-center focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xl font-bold text-gray-800">{formatDate(booking.checkOut)}</p>
                )}
                <p className="text-sm text-gray-500">เวลา 12:00 น.</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">สรุปค่าใช้จ่าย</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>ค่าห้องพัก ({editedBooking ? calculateNights(editedBooking.checkIn, editedBooking.checkOut) : nights} คืน)</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedBooking?.total || 0}
                    onChange={(e) => handleEditChange('total', parseFloat(e.target.value))}
                    className="w-32 p-2 border-2 border-blue-300 rounded-lg font-bold text-gray-800 text-right focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-bold">{formatPrice(booking.total)}</span>
                )}
              </div>
              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between text-2xl font-bold text-gray-800">
                  <span>ยอดรวมทั้งหมด</span>
                  <span className="text-green-600">{formatPrice(editedBooking?.total || booking.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Info */}
          {booking.status === 'cancelled' && booking.cancelReason && (
            <div className="bg-red-50 rounded-xl p-6 mb-8 border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-700 mb-3">ข้อมูลการยกเลิก</h2>
              <p className="text-gray-700 mb-2">
                <strong>เหตุผล:</strong> {booking.cancelReason}
              </p>
              {booking.refundAmount && booking.refundAmount > 0 && (
                <p className="text-gray-700">
                  <strong>จำนวนเงินคืน:</strong> {formatPrice(booking.refundAmount)}
                </p>
              )}
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">เงื่อนไขการจอง</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• เวลา Check-in: 14:00 น. / Check-out: 12:00 น.</li>
              <li>• กรุณานำเอกสารยืนยันตัวตนมาแสดงในวันเข้าพัก</li>
              <li>• การยกเลิกหรือเปลี่ยนแปลงการจองภายใน 7 วันก่อนวันเข้าพัก จะไม่คืนเงิน</li>
              <li>• สามารถยกเลิกได้ฟรีหากแจ้งล่วงหน้าอย่างน้อย 7 วัน</li>
              <li>• ห้ามนำสัตว์เลี้ยงเข้าพักในห้อง</li>
              <li>• ห้ามสูบบุหรี่ในห้องพัก</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-6 border-t-2 border-gray-200">
            <p className="text-gray-600 mb-2">
              หากมีข้อสงสัย กรุณาติดต่อ: <strong>099-XXX-XXXX</strong>
            </p>
            <p className="text-sm text-gray-500">
              ขอบคุณที่ใช้บริการ WINNERBOY Poolvilla
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
