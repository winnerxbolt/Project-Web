'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import PaymentStatus from '@/components/PaymentStatus'
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaSpinner,
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaUser,
  FaEnvelope
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

type PaymentStep = 'select-method' | 'processing' | 'success' | 'error'
type PaymentProvider = 'omise' | 'stripe' | 'manual'
type PaymentMethod = 'credit_card' | 'promptpay' | 'truemoney' | 'alipay' | 'bank_transfer' | 'manual'

export default function OnlineCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<PaymentStep>('select-method')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('omise')
  const [qrCode, setQrCode] = useState<string>()
  const [actionUrl, setActionUrl] = useState<string>()
  const [error, setError] = useState('')

  useEffect(() => {
    loadBooking()
  }, [])

  const loadBooking = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      if (data.success) {
        const found = data.bookings.find((b: Booking) => b.id === Number(resolvedParams.id))
        if (found) {
          setBooking(found)
          
          // Check if already paid
          if (found.status === 'confirmed' || found.status === 'completed') {
            router.push(`/payment-success/${found.id}`)
            return
          }
        } else {
          setError('ไม่พบรายการจอง')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentMethodSelect = async (provider: PaymentProvider, method: PaymentMethod) => {
    if (!booking) return

    // ถ้าเลือก manual payment (โอนเงินธนาคาร) → ไปหน้า checkout แบบเดิม
    if (provider === 'manual') {
      router.push(`/checkout/${booking.id}`)
      return
    }

    setStep('processing')
    setPaymentProvider(provider)

    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.total,
          currency: 'THB',
          provider,
          paymentMethod: method,
          customerEmail: booking.email || 'guest@example.com',
          customerName: booking.guestName,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment creation failed')
      }

      setPaymentIntentId(data.paymentIntent.id)
      
      // PromptPay QR Code
      if (data.qrCode) {
        setQrCode(data.qrCode)
      }

      // Redirect URL (for credit card, etc)
      if (data.actionUrl) {
        setActionUrl(data.actionUrl)
        // Auto redirect after 3 seconds
        setTimeout(() => {
          window.location.href = data.actionUrl
        }, 3000)
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'เกิดข้อผิดพลาดในการชำระเงิน')
      setStep('error')
    }
  }

  const handlePaymentSuccess = () => {
    setStep('success')
    setTimeout(() => {
      router.push(`/payment-success/${booking?.id}`)
    }, 2000)
  }

  const handlePaymentFail = () => {
    setStep('error')
    setError('การชำระเงินล้มเหลว กรุณาลองใหม่อีกครั้ง')
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!booking || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'ไม่พบรายการจอง'}</h2>
          <Link 
            href="/rooms"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
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
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
            <span className="font-medium">กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">ชำระเงินออนไลน์</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
                    <FaHome className="text-xl text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">ห้องพัก</p>
                      <p className="text-lg font-bold text-gray-800">{booking.roomName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaUser className="text-xl text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">ชื่อผู้จอง</p>
                      <p className="text-lg font-bold text-gray-800">{booking.guestName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-xl text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">อีเมล</p>
                      <p className="text-base font-medium text-gray-700">{booking.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-xl text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="text-lg font-bold text-gray-800">{formatDate(booking.checkIn)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-xl text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="text-lg font-bold text-gray-800">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaUsers className="text-xl text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">จำนวนผู้เข้าพัก</p>
                      <p className="text-lg font-bold text-gray-800">{booking.guests} คน ({nights} คืน)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {step === 'select-method' && (
                <PaymentMethodSelector
                  amount={booking.total}
                  currency="THB"
                  onSelect={handlePaymentMethodSelect}
                />
              )}

              {(step === 'processing' || step === 'success') && paymentIntentId && paymentProvider !== 'manual' && (
                <PaymentStatus
                  paymentIntentId={paymentIntentId}
                  provider={paymentProvider as 'omise' | 'stripe'}
                  qrCode={qrCode}
                  actionUrl={actionUrl}
                  onSuccess={handlePaymentSuccess}
                  onFail={handlePaymentFail}
                />
              )}

              {step === 'error' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
                  <p className="text-red-600 mb-6">{error}</p>
                  <button
                    onClick={() => {
                      setStep('select-method')
                      setError('')
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
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
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">ยอดรวมทั้งหมด</span>
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(booking.total)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <FaCheckCircle />
                  <span className="font-semibold">ชำระเงินออนไลน์</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✓ ยืนยันการจองทันที</li>
                  <li>✓ ปลอดภัย 100%</li>
                  <li>✓ ไม่ต้องรอ admin verify</li>
                  <li>✓ รับ e-receipt อัตโนมัติ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
