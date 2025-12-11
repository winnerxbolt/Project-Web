'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'

interface PaymentStatusProps {
  paymentIntentId: string
  provider: 'omise' | 'stripe'
  qrCode?: string
  actionUrl?: string
  onSuccess?: () => void
  onFail?: () => void
}

export default function PaymentStatus({ 
  paymentIntentId, 
  provider,
  qrCode,
  actionUrl,
  onSuccess,
  onFail 
}: PaymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'succeeded' | 'failed'>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [checking, setChecking] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 minutes

  useEffect(() => {
    // Auto-check status every 5 seconds
    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 5000)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          clearInterval(countdownInterval)
          setStatus('failed')
          setErrorMessage('Payment timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
    }
  }, [])

  useEffect(() => {
    if (status === 'succeeded' && onSuccess) {
      onSuccess()
    }
    if (status === 'failed' && onFail) {
      onFail()
    }
  }, [status])

  const checkPaymentStatus = async () => {
    if (checking || status === 'succeeded' || status === 'failed') return

    setChecking(true)
    try {
      const res = await fetch(`/api/payment/verify?paymentIntentId=${paymentIntentId}&provider=${provider}`)
      const data = await res.json()

      if (data.paymentIntent) {
        setStatus(data.paymentIntent.status)
        if (data.paymentIntent.status === 'failed') {
          setErrorMessage(data.paymentIntent.errorMessage || 'Payment failed')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    } finally {
      setChecking(false)
    }
  }

  // Removed unused copyToClipboard function

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'succeeded') {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
          <FaCheckCircle className="text-6xl text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ชำระเงินสำเร็จ! 🎉</h2>
        <p className="text-gray-600 mb-6">การจองของคุณได้รับการยืนยันแล้ว</p>
        <div className="inline-block px-6 py-3 bg-green-500 text-white rounded-xl font-bold">
          Transaction ID: {paymentIntentId.slice(-8)}
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-red-100 rounded-full mb-6">
          <FaTimesCircle className="text-6xl text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">การชำระเงินล้มเหลว</h2>
        <p className="text-red-600 mb-6">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    )
  }

  // PromptPay QR Code Display
  if (qrCode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <FaClock className="text-4xl text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">สแกน QR Code เพื่อชำระเงิน</h2>
          <p className="text-gray-600">เปิดแอปธนาคารและสแกน QR Code ด้านล่าง</p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200 max-w-md mx-auto">
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={qrCode}
              alt="PromptPay QR Code"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">เวลาคงเหลือ</div>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatTime(countdown)}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${checking ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>{checking ? 'กำลังตรวจสอบ...' : 'รอการชำระเงิน'}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3">ขั้นตอนการชำระเงิน:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>เปิดแอปธนาคารบนมือถือของคุณ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>เลือกเมนู "สแกน QR Code" หรือ "PromptPay"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>สแกน QR Code ด้านบน</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">4.</span>
              <span>ยืนยันการชำระเงิน</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">5.</span>
              <span>รอระบบยืนยันการชำระเงินอัตโนมัติ (ประมาณ 5-10 วินาที)</span>
            </li>
          </ol>
        </div>

        <div className="text-center">
          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะการชำระเงิน'}
          </button>
        </div>
      </div>
    )
  }

  // Redirect to payment page
  if (actionUrl) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-blue-100 rounded-full mb-6 animate-pulse">
          <FaClock className="text-6xl text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">กำลังเปลี่ยนหน้าไปชำระเงิน...</h2>
        <p className="text-gray-600 mb-6">คุณจะถูกนำไปยังหน้าชำระเงินภายใน 3 วินาที</p>
        <a
          href={actionUrl}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          คลิกที่นี่หากไม่ถูกเปลี่ยนหน้าอัตโนมัติ
        </a>
      </div>
    )
  }

  // Default processing state
  return (
    <div className="text-center py-12">
      <div className="inline-block p-6 bg-blue-100 rounded-full mb-6">
        <div className="animate-spin text-6xl text-blue-500">⏳</div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">กำลังประมวลผล...</h2>
      <p className="text-gray-600">กรุณารอสักครู่</p>
    </div>
  )
}
