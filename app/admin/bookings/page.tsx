'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaBan, FaPrint, FaArrowLeft, FaSearch, FaMoneyBillWave } from 'react-icons/fa'

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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  total: number
  slipImage: string | null
  createdAt: string
  cancelReason?: string
  refundAmount?: number
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [refundAmount, setRefundAmount] = useState(0)

  useEffect(() => {
    loadBookings()
    // ตรวจสอบและอัปเดตสถานะทุก 5 นาที
    const interval = setInterval(() => {
      autoUpdateExpiredBookings()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, filter, searchTerm])

  const autoUpdateExpiredBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      if (data.success) {
        const now = new Date()
        
        let updated = false
        const updatedBookings = await Promise.all(
          data.bookings.map(async (booking: Booking) => {
            // ถ้าสถานะเป็น confirmed และถึงวันเช็คเอาท์ + เวลา 12:00 น. แล้ว
            if (booking.status === 'confirmed') {
              const checkOutDate = new Date(booking.checkOut)
              // ตั้งเวลาเช็คเอาท์เป็น 12:00 น. (เที่ยงของวันเช็คเอาท์)
              checkOutDate.setHours(12, 0, 0, 0)
              
              // ถ้าเวลาปัจจุบันผ่าน 12:00 น. ของวันเช็คเอาท์แล้ว
              if (now >= checkOutDate) {
                // อัปเดตสถานะเป็น completed
                try {
                  const updateRes = await fetch('/api/bookings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: booking.id,
                      status: 'completed'
                    })
                  })
                  
                  if (updateRes.ok) {
                    updated = true
                    return { ...booking, status: 'completed' }
                  }
                } catch (error) {
                  console.error('Error updating booking:', error)
                }
              }
            }
            return booking
          })
        )
        
        if (updated) {
          setBookings(updatedBookings)
        }
      }
    } catch (error) {
      console.error('Error auto-updating bookings:', error)
    }
  }

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      if (data.success) {
        setBookings(data.bookings || [])
        // เรียกใช้ฟังก์ชันตรวจสอบทันทีเมื่อโหลดข้อมูล
        setTimeout(() => autoUpdateExpiredBookings(), 1000)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
      showMessage('error', 'ไม่สามารถโหลดข้อมูลการจองได้')
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.status === filter)
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toString().includes(searchTerm)
      )
    }

    setFilteredBookings(filtered)
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleApprove = async (booking: Booking) => {
    if (!confirm(`ยืนยันการอนุมัติการจอง #${booking.id} ของคุณ ${booking.guestName}?`)) {
      return
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          status: 'confirmed'
        })
      })

      const data = await res.json()
      if (data.success) {
        showMessage('success', '✅ อนุมัติการจองสำเร็จ')
        await loadBookings()
      } else {
        showMessage('error', 'ไม่สามารถอนุมัติการจองได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาด')
    }
  }

  const handleComplete = async (booking: Booking) => {
    if (!confirm(`ยืนยันว่าการจอง #${booking.id} เสร็จสิ้นแล้ว (Check-out แล้ว)?`)) {
      return
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          status: 'completed'
        })
      })

      const data = await res.json()
      if (data.success) {
        showMessage('success', '✅ ทำรายการเสร็จสิ้น')
        await loadBookings()
      } else {
        showMessage('error', 'ไม่สามารถอัพเดตสถานะได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาด')
    }
  }

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setRefundAmount(booking.total)
    setCancelReason('')
    setShowCancelDialog(true)
  }

  const handleCancel = async () => {
    if (!selectedBooking) return

    if (!cancelReason.trim()) {
      showMessage('error', 'กรุณาระบุเหตุผลในการยกเลิก')
      return
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: 'cancelled',
          cancelReason,
          refundAmount
        })
      })

      const data = await res.json()
      if (data.success) {
        showMessage('success', '✅ ยกเลิกการจองสำเร็จ')
        setShowCancelDialog(false)
        await loadBookings()
      } else {
        showMessage('error', 'ไม่สามารถยกเลิกการจองได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาด')
    }
  }

  const handlePrint = (booking: Booking) => {
    // เปิดหน้าพิมพ์ใบจอง
    window.open(`/admin/bookings/print/${booking.id}`, '_blank')
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <FaClock />, label: 'รอชำระ' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: <FaCheckCircle />, label: 'ยืนยันแล้ว' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FaCheckCircle />, label: 'เสร็จสิ้น' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <FaBan />, label: 'ยกเลิก' }
    }
    const badge = badges[status as keyof typeof badges] || badges.pending
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    )
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-800 text-2xl font-bold">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pool-blue/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-luxury-gold/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6 flex gap-3">
          <Link href="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-all">
              <FaArrowLeft />
              <span className="font-medium">กลับไป Admin</span>
            </button>
          </Link>
          <Link href="/admin/bookings/calendar">
            <button className="flex items-center gap-2 px-4 py-2 bg-pool-light hover:bg-pool-dark text-white rounded-lg shadow-md transition-all">
              <FaCalendarAlt />
              <span className="font-medium">ดูปฏิทิน</span>
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-4 mb-4 bg-white rounded-3xl px-8 py-6 shadow-2xl border-2 border-pool-blue/20">
            <FaCalendarAlt className="text-5xl text-pool-light" />
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-800">จัดการการจอง</h1>
              <p className="text-gray-600 mt-1">ดูและจัดการรายการจองทั้งหมด</p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-5 rounded-xl shadow-lg border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
              <span className="font-bold">{message.text}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
            <div className="text-gray-600 text-sm mb-1">ทั้งหมด</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 shadow-md border-2 border-yellow-200">
            <div className="text-yellow-700 text-sm mb-1">รอชำระ</div>
            <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-md border-2 border-green-200">
            <div className="text-green-700 text-sm mb-1">ยืนยันแล้ว</div>
            <div className="text-3xl font-bold text-green-800">{stats.confirmed}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-md border-2 border-blue-200">
            <div className="text-blue-700 text-sm mb-1">เสร็จสิ้น</div>
            <div className="text-3xl font-bold text-blue-800">{stats.completed}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-md border-2 border-red-200">
            <div className="text-red-700 text-sm mb-1">ยกเลิก</div>
            <div className="text-3xl font-bold text-red-800">{stats.cancelled}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้จอง, ห้องพัก, หมายเลขจอง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pool-light focus:outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === status
                      ? 'bg-pool-light text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' && 'ทั้งหมด'}
                  {status === 'pending' && 'รอชำระ'}
                  {status === 'confirmed' && 'ยืนยันแล้ว'}
                  {status === 'completed' && 'เสร็จสิ้น'}
                  {status === 'cancelled' && 'ยกเลิก'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-200">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบรายการจอง</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-2xl transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {booking.roomName}
                        </h3>
                        <p className="text-gray-600">จองโดย: {booking.guestName}</p>
                        <p className="text-sm text-gray-500">หมายเลขจอง: #{booking.id}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Check-in</p>
                        <p className="font-bold text-gray-800">{formatDate(booking.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-bold text-gray-800">{formatDate(booking.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">จำนวนผู้เข้าพัก</p>
                        <p className="font-bold text-gray-800">{booking.guests} คน</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ราคารวม</p>
                        <p className="font-bold text-green-600 text-xl">{formatPrice(booking.total)}</p>
                      </div>
                    </div>

                    {booking.email && (
                      <p className="text-sm text-gray-600">Email: {booking.email}</p>
                    )}
                    {booking.phone && (
                      <p className="text-sm text-gray-600">โทร: {booking.phone}</p>
                    )}
                    {booking.cancelReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700">
                          <strong>เหตุผลที่ยกเลิก:</strong> {booking.cancelReason}
                        </p>
                        {booking.refundAmount && booking.refundAmount > 0 && (
                          <p className="text-sm text-red-700 mt-1">
                            <strong>คืนเงิน:</strong> {formatPrice(booking.refundAmount)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(booking)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle />
                        อนุมัติการจอง
                      </button>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(booking)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle />
                        เสร็จสิ้น
                      </button>
                    )}

                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => openCancelDialog(booking)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaBan />
                        ยกเลิกการจอง
                      </button>
                    )}

                    <button
                      onClick={() => handlePrint(booking)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <FaPrint />
                      พิมพ์ใบจอง
                    </button>

                    {booking.slipImage && (
                      <a
                        href={booking.slipImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaMoneyBillWave />
                        ดูหลักฐานชำระเงิน
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scaleIn border-4 border-gray-200">
            <div className="px-8 py-6 rounded-t-3xl bg-gradient-to-r from-red-500 to-red-600">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaBan />
                ยกเลิกการจอง
              </h3>
            </div>

            <div className="px-8 py-6">
              <p className="text-gray-700 mb-4">
                การจอง #{selectedBooking.id} - {selectedBooking.roomName}
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  เหตุผลในการยกเลิก *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-800"
                  rows={4}
                  placeholder="ระบุเหตุผล..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  จำนวนเงินคืน
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-800"
                  min="0"
                  max={selectedBooking.total}
                />
                <p className="text-sm text-gray-500 mt-1">
                  ราคาเต็ม: {formatPrice(selectedBooking.total)}
                </p>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 rounded-b-3xl flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
              >
                ปิด
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
              >
                ยืนยันยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
