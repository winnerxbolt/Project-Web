'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DynamicPriceBreakdown from '@/components/DynamicPriceBreakdown'
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaCreditCard, 
  FaQrcode, 
  FaUniversity, 
  FaUpload,
  FaSpinner,
  FaClock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaTicketAlt
} from 'react-icons/fa'

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
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card' | 'bank_transfer'>('promptpay')
  const [slipImage, setSlipImage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Dynamic pricing
  const [dynamicPrice, setDynamicPrice] = useState<number>(0)
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [])

  const loadBooking = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      // Validate array
      let bookingsArray: Booking[] = [];
      if (Array.isArray(data)) {
        bookingsArray = data;
      } else if (data.success && Array.isArray(data.bookings)) {
        bookingsArray = data.bookings;
      }
      
      const found = bookingsArray.find((b: Booking) => b.id === Number(resolvedParams.id));
      if (found) {
        setBooking(found)
      } else {
        setMessage({ type: 'error', text: 'ไม่พบรายการจอง' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // In real app, upload to cloud storage and get URL
      // For now, we'll use a placeholder
      const reader = new FileReader()
      reader.onloadend = () => {
        setSlipImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !booking) {
      setCouponMessage({ type: 'error', text: 'กรุณากรอกรหัสคูปอง' })
      return
    }

    setIsValidatingCoupon(true)
    setCouponMessage(null)

    try {
      const response = await fetch(
        `/api/coupons?action=validate&code=${encodeURIComponent(couponCode)}&userId=guest&bookingAmount=${booking.total}&roomId=${booking.roomId}&checkInDate=${booking.checkIn}`
      )

      const result = await response.json()

      if (result.valid) {
        setAppliedCoupon(result.coupon)
        setDiscount(result.discount || 0)
        setCouponMessage({ type: 'success', text: `✅ ใช้คูปองสำเร็จ! ส่วนลด ${formatPrice(result.discount || 0)}` })
      } else {
        setCouponMessage({ type: 'error', text: result.message || 'รหัสคูปองไม่ถูกต้อง' })
        setAppliedCoupon(null)
        setDiscount(0)
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการตรวจสอบคูปอง' })
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    setCouponMessage(null)
  }

  const handlePayment = async () => {
    if (!booking) return

    if (paymentMethod === 'bank_transfer' && !slipImage) {
      setMessage({ type: 'error', text: 'กรุณาอัพโหลดสลิปการโอนเงิน' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const finalAmount = booking.total - discount

      // Create payment record
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          method: paymentMethod,
          amount: finalAmount,
          slipImage: slipImage || null,
          couponId: appliedCoupon?.id || null,
          discount: discount
        })
      })

      const paymentData = await paymentRes.json()

      if (paymentData.success) {
        // Increment coupon usage count if coupon was used
        if (appliedCoupon) {
          await fetch('/api/coupons', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ couponId: appliedCoupon.id })
          })
        }

        setMessage({ 
          type: 'success', 
          text: '✅ ส่งข้อมูลการชำระเงินเรียบร้อย รอการยืนยันจากแอดมิน' 
        })
        
        setTimeout(() => {
          router.push(`/payment-success/${booking.id}`)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + paymentData.error })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการชำระเงิน' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-pool-light mx-auto mb-4" />
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl text-red-600 mb-4">ไม่พบรายการจอง</p>
          <Link href="/rooms" className="text-pool-light hover:underline">
            กลับไปหน้ารายการห้องพัก
          </Link>
        </div>
      </div>
    )
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/rooms" 
            className="flex items-center gap-2 text-gray-700 hover:text-pool-light transition"
          >
            <FaArrowLeft />
            <span className="font-medium">กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">ชำระเงิน</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <FaCheckCircle className="text-3xl text-green-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">รายละเอียดการจอง</h2>
                  <p className="text-sm text-gray-500">หมายเลขจอง: #{booking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaHome className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">ห้องพัก</p>
                      <p className="text-lg font-bold text-gray-800">{booking.roomName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaUser className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">ชื่อผู้จอง</p>
                      <p className="text-lg font-semibold text-gray-800">{booking.guestName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">อีเมล</p>
                      <p className="text-base text-gray-800">{booking.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaPhone className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">เบอร์โทร</p>
                      <p className="text-base text-gray-800">{booking.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(booking.checkIn)}</p>
                      <p className="text-xs text-gray-500">เวลา 14:00 น.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(booking.checkOut)}</p>
                      <p className="text-xs text-gray-500">เวลา 12:00 น.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaClock className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">จำนวนคืน</p>
                      <p className="text-2xl font-bold text-pool-dark">{nights} คืน</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaUsers className="text-xl text-pool-light mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">จำนวนผู้เข้าพัก</p>
                      <p className="text-lg font-semibold text-gray-800">{booking.guests} คน</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <FaTicketAlt className="text-3xl text-orange-500" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">มีคูปองส่วนลด?</h3>
                  <p className="text-sm text-gray-600">ใส่รหัสคูปองเพื่อรับส่วนลดพิเศษ</p>
                </div>
              </div>

              {couponMessage && (
                <div className={`mb-4 p-4 rounded-xl border-2 ${
                  couponMessage.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  {couponMessage.text}
                </div>
              )}

              {!appliedCoupon ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ใส่รหัสคูปอง (เช่น SUMMER2024)"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase text-lg font-semibold"
                    disabled={isValidatingCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isValidatingCoupon ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        ตรวจสอบ...
                      </>
                    ) : (
                      'ใช้คูปอง'
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 border-2 border-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-2xl text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{appliedCoupon.code}</p>
                        <p className="text-sm text-gray-600">{appliedCoupon.description}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ส่วนลด {formatPrice(discount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaCreditCard className="text-pool-light" />
                เลือกวิธีชำระเงิน
              </h3>

              {/* Online Payment CTA */}
              <div className="mb-6 bg-gradient-to-r from-pool-light to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaQrcode className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">💳 ชำระเงินออนไลน์ (แนะนำ)</h4>
                    <p className="text-sm text-white/90 mb-4">
                      ชำระเงินทันที ผ่าน PromptPay QR, บัตรเครดิต, TrueMoney หรือ Alipay<br />
                      ✅ ยืนยันการจองอัตโนมัติภายใน 5-10 วินาที • ไม่ต้องรอ Admin ตรวจสอบ
                    </p>
                    <button
                      onClick={() => router.push(`/checkout-online/${booking.id}`)}
                      className="w-full sm:w-auto px-6 py-3 bg-white text-pool-light rounded-lg hover:bg-gray-100 transition-all font-bold shadow-md flex items-center justify-center gap-2"
                    >
                      <FaCreditCard />
                      เริ่มชำระเงินออนไลน์
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 font-medium">หรือชำระด้วยวิธีอื่น</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="space-y-4">
                {/* PromptPay */}
                <div
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'promptpay'
                      ? 'border-pool-light bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-pool-light hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      paymentMethod === 'promptpay' ? 'bg-pool-light' : 'bg-gray-200'
                    }`}>
                      <FaQrcode className={`text-2xl ${
                        paymentMethod === 'promptpay' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">PromptPay QR Code</h4>
                      <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking</p>
                    </div>
                    {paymentMethod === 'promptpay' && (
                      <FaCheckCircle className="text-2xl text-pool-light" />
                    )}
                  </div>
                </div>

                {/* Credit/Debit Card */}
                <div
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-pool-light bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-pool-light hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      paymentMethod === 'credit_card' ? 'bg-pool-light' : 'bg-gray-200'
                    }`}>
                      <FaCreditCard className={`text-2xl ${
                        paymentMethod === 'credit_card' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">บัตรเครดิต/เดบิต</h4>
                      <p className="text-sm text-gray-600">ชำระด้วย Visa, Mastercard, JCB</p>
                    </div>
                    {paymentMethod === 'credit_card' && (
                      <FaCheckCircle className="text-2xl text-pool-light" />
                    )}
                  </div>
                </div>

                {/* Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-pool-light bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-pool-light hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      paymentMethod === 'bank_transfer' ? 'bg-pool-light' : 'bg-gray-200'
                    }`}>
                      <FaUniversity className={`text-2xl ${
                        paymentMethod === 'bank_transfer' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">โอนเงินธนาคาร</h4>
                      <p className="text-sm text-gray-600">โอนเงินผ่านบัญชีธนาคารและอัพโหลดสลิป</p>
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <FaCheckCircle className="text-2xl text-pool-light" />
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                {paymentMethod === 'promptpay' && (
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">สแกน QR Code เพื่อชำระเงิน</h4>
                    <div className="bg-white p-6 rounded-xl inline-block shadow-lg">
                      <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <FaQrcode className="text-6xl text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">QR Code PromptPay</p>
                          <p className="text-xs text-gray-400 mt-2">จำนวนเงิน: {formatPrice(booking.total)}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      กรุณาสแกน QR Code ด้วยแอพธนาคารของคุณ
                    </p>
                  </div>
                )}

                {paymentMethod === 'credit_card' && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">กรอกข้อมูลบัตร</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          หมายเลขบัตร
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pool-light focus:border-transparent text-gray-800"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            วันหมดอายุ
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pool-light focus:border-transparent text-gray-800"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pool-light focus:border-transparent text-gray-800"
                            maxLength={3}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อบนบัตร
                        </label>
                        <input
                          type="text"
                          placeholder="CARDHOLDER NAME"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pool-light focus:border-transparent text-gray-800 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลบัญชีธนาคาร</h4>
                    <div className="bg-white p-6 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ธนาคาร:</span>
                        <span className="font-bold text-gray-800">ธนาคารกสิกรไทย</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ชื่อบัญชี:</span>
                        <span className="font-bold text-gray-800">WINNERBOY RESORT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">เลขที่บัญชี:</span>
                        <span className="font-bold text-gray-800 text-lg">123-4-56789-0</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-600">จำนวนเงิน:</span>
                        <span className="font-bold text-green-600 text-xl">{formatPrice(booking.total - discount)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">ราคาเดิม:</span>
                          <span className="text-gray-400 line-through">{formatPrice(booking.total)}</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Slip */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        อัพโหลดสลิปการโอนเงิน *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pool-light transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="slip-upload"
                        />
                        <label htmlFor="slip-upload" className="cursor-pointer">
                          {slipImage ? (
                            <div>
                              <Image 
                                src={slipImage} 
                                alt="Slip" 
                                width={200}
                                height={200}
                                className="mx-auto rounded-lg mb-2"
                              />
                              <p className="text-sm text-green-600 font-medium">✓ อัพโหลดสลิปเรียบร้อย</p>
                            </div>
                          ) : (
                            <div>
                              <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">คลิกเพื่ออัพโหลดสลิป</p>
                              <p className="text-xs text-gray-400 mt-1">รองรับไฟล์: JPG, PNG (สูงสุด 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            {booking.roomId && booking.checkIn && booking.checkOut && (
              <div className="sticky top-24">
                <DynamicPriceBreakdown
                  roomId={parseInt(booking.roomId)}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  guests={booking.guests}
                  rooms={1}
                  onPriceCalculated={(price) => setDynamicPrice(price)}
                />
              </div>
            )}

            {/* Fallback if no roomId */}
            {!booking.roomId && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-24">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">สรุปราคา</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>ค่าห้องพัก ({nights} คืน)</span>
                    <span className="font-semibold">{formatPrice(booking.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>จำนวนผู้เข้าพัก</span>
                    <span className="font-semibold">{booking.guests} คน</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>ค่าบริการ</span>
                    <span className="font-semibold text-green-600">ฟรี</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-orange-600 bg-orange-50 p-3 rounded-lg -mx-2">
                      <span className="flex items-center gap-2">
                        <FaTicketAlt />
                        ส่วนลด ({appliedCoupon?.code})
                      </span>
                      <span className="font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">ยอดรวมทั้งหมด</span>
                    <div className="text-right">
                      {discount > 0 && (
                        <div className="text-sm text-gray-400 line-through mb-1">
                          {formatPrice(booking.total)}
                        </div>
                      )}
                      <span className="text-3xl font-bold text-green-600">
                        {formatPrice(booking.total - discount)}
                      </span>
                      {discount > 0 && (
                        <div className="text-xs text-green-600 font-semibold mt-1">
                          ประหยัด {formatPrice(discount)}!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isSubmitting || (paymentMethod === 'bank_transfer' && !slipImage)}
                  className="w-full py-4 bg-gradient-to-r from-pool-light to-pool-dark text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      ยืนยันการชำระเงิน
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    🔒 การชำระเงินปลอดภัย 100%<br/>
                    ข้อมูลของคุณได้รับการเข้ารหัส
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
