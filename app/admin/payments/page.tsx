'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaSearch,
  FaMoneyBillWave,
  FaQrcode,
  FaCreditCard,
  FaUniversity,
  FaEye
} from 'react-icons/fa'

interface Payment {
  id: number
  bookingId: number
  method: 'promptpay' | 'credit_card' | 'bank_transfer'
  amount: number
  status: 'pending' | 'confirmed' | 'failed'
  slipImage: string | null
  createdAt: string
  confirmedAt: string | null
  confirmedBy: string | null
}

interface Booking {
  id: number
  roomName: string
  guestName: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  total: number
}

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showSlipModal, setShowSlipModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, filter, searchTerm])

  const loadData = async () => {
    try {
      const [paymentsRes, bookingsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/bookings')
      ])
      
      const paymentsData = await paymentsRes.json()
      const bookingsData = await bookingsRes.json()
      
      if (paymentsData.success) {
        setPayments(paymentsData.payments || [])
      }
      if (bookingsData.success) {
        setBookings(bookingsData.bookings || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      showMessage('error', 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    if (filter !== 'all') {
      filtered = filtered.filter(p => p.status === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(p => {
        const booking = bookings.find(b => b.id === p.bookingId)
        return (
          p.id.toString().includes(searchTerm) ||
          p.bookingId.toString().includes(searchTerm) ||
          booking?.guestName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setFilteredPayments(filtered)
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleConfirmPayment = async (payment: Payment) => {
    if (!confirm(`ยืนยันการชำระเงิน #${payment.id}?`)) return

    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payment.id,
          status: 'confirmed',
          confirmedBy: 'Admin'
        })
      })

      const data = await res.json()
      if (data.success) {
        showMessage('success', '✅ ยืนยันการชำระเงินสำเร็จ')
        await loadData()
      } else {
        showMessage('error', 'ไม่สามารถยืนยันการชำระเงินได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาด')
    }
  }

  const handleRejectPayment = async (payment: Payment) => {
    if (!confirm(`ปฏิเสธการชำระเงิน #${payment.id}?`)) return

    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payment.id,
          status: 'failed',
          confirmedBy: 'Admin'
        })
      })

      const data = await res.json()
      if (data.success) {
        showMessage('success', 'ปฏิเสธการชำระเงินแล้ว')
        await loadData()
      } else {
        showMessage('error', 'ไม่สามารถปฏิเสธการชำระเงินได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาด')
    }
  }

  const getBooking = (bookingId: number) => {
    return bookings.find(b => b.id === bookingId)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'promptpay': return <FaQrcode />
      case 'credit_card': return <FaCreditCard />
      case 'bank_transfer': return <FaUniversity />
      default: return <FaMoneyBillWave />
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'promptpay': return 'PromptPay'
      case 'credit_card': return 'บัตรเครดิต/เดบิต'
      case 'bank_transfer': return 'โอนเงินธนาคาร'
      default: return method
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price)
  }

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-bold text-gray-800">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-gray-700 hover:text-pool-light transition"
          >
            <FaArrowLeft />
            <span className="font-medium">กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">จัดการการชำระเงิน</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaMoneyBillWave className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">รอตรวจสอบ</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FaClock className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">ยืนยันแล้ว</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">ปฏิเสธ</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <FaTimesCircle className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pool-light to-pool-dark rounded-xl shadow-md p-6 text-white">
            <p className="text-sm mb-1 opacity-90">รายได้รวม</p>
            <p className="text-2xl font-bold">{formatPrice(stats.totalAmount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-pool-light text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ทั้งหมด ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                รอตรวจสอบ ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'confirmed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ยืนยันแล้ว ({stats.confirmed})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ปฏิเสธ ({stats.failed})
              </button>
            </div>

            <div className="relative w-full md:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pool-light focus:border-transparent w-full md:w-64 text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">ไม่พบรายการชำระเงิน</p>
            </div>
          ) : (
            filteredPayments.map(payment => {
              const booking = getBooking(payment.bookingId)
              return (
                <div key={payment.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Payment Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">
                                การชำระเงิน #{payment.id}
                              </h3>
                              {payment.status === 'pending' && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                  รอตรวจสอบ
                                </span>
                              )}
                              {payment.status === 'confirmed' && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <FaCheckCircle /> ยืนยันแล้ว
                                </span>
                              )}
                              {payment.status === 'failed' && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <FaTimesCircle /> ปฏิเสธ
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              หมายเลขจอง: #{payment.bookingId} | {formatDate(payment.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-green-600">
                              {formatPrice(payment.amount)}
                            </p>
                          </div>
                        </div>

                        {booking && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">ชื่อผู้จอง</p>
                              <p className="font-semibold text-gray-800">{booking.guestName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">ห้องพัก</p>
                              <p className="font-semibold text-gray-800">{booking.roomName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">ติดต่อ</p>
                              <p className="font-semibold text-gray-800">{booking.phone}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                            {getMethodIcon(payment.method)}
                            <span className="font-medium">{getMethodName(payment.method)}</span>
                          </div>
                        </div>

                        {payment.confirmedAt && (
                          <p className="text-sm text-gray-500 mt-3">
                            ยืนยันเมื่อ: {formatDate(payment.confirmedAt)} โดย {payment.confirmedBy}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-3 justify-end">
                        {payment.slipImage && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowSlipModal(true)
                            }}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
                          >
                            <FaEye />
                            ดูสลิป
                          </button>
                        )}
                        
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(payment)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
                            >
                              <FaCheckCircle />
                              ยืนยัน
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
                            >
                              <FaTimesCircle />
                              ปฏิเสธ
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Slip Modal */}
      {showSlipModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">สลิปการโอนเงิน</h3>
              <button
                onClick={() => setShowSlipModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              {selectedPayment.slipImage && (
                <div className="relative w-full h-[600px]">
                  <Image
                    src={selectedPayment.slipImage}
                    alt="Payment Slip"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>จำนวนเงิน:</strong> {formatPrice(selectedPayment.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>วิธีชำระ:</strong> {getMethodName(selectedPayment.method)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>วันที่:</strong> {formatDate(selectedPayment.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
