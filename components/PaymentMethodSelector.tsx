'use client'

import { useState } from 'react'
import { FaCreditCard, FaQrcode, FaMobileAlt, FaUniversity, FaGlobe } from 'react-icons/fa'
import { SiAlipay } from 'react-icons/si'

type PaymentProvider = 'omise' | 'stripe' | 'manual'
type PaymentMethod = 'credit_card' | 'promptpay' | 'truemoney' | 'alipay' | 'bank_transfer' | 'manual'

interface PaymentMethodSelectorProps {
  amount: number
  currency: string
  onSelect: (provider: PaymentProvider, method: PaymentMethod) => void
  loading?: boolean
}

export default function PaymentMethodSelector({ 
  amount, 
  currency, 
  onSelect,
  loading = false 
}: PaymentMethodSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('omise')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('promptpay')

  const handleConfirm = () => {
    onSelect(selectedProvider, selectedMethod)
  }

  const formatAmount = (amt: number, curr: string) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: curr,
    }).format(amt)
  }

  // Payment methods available for each provider
  const omiseMethods = [
    {
      id: 'promptpay' as PaymentMethod,
      name: 'PromptPay QR',
      icon: <FaQrcode className="text-3xl" />,
      description: 'สแกน QR Code ชำระผ่านแอปธนาคาร',
      fee: '0฿',
      recommended: true,
    },
    {
      id: 'truemoney' as PaymentMethod,
      name: 'TrueMoney Wallet',
      icon: <FaMobileAlt className="text-3xl" />,
      description: 'ชำระผ่าน TrueMoney Wallet',
      fee: '0฿',
      recommended: false,
    },
    {
      id: 'credit_card' as PaymentMethod,
      name: 'บัตรเครดิต/เดบิต',
      icon: <FaCreditCard className="text-3xl" />,
      description: 'Visa, Mastercard, JCB',
      fee: '2.9%',
      recommended: false,
    },
    {
      id: 'alipay' as PaymentMethod,
      name: 'Alipay',
      icon: <SiAlipay className="text-3xl" />,
      description: 'สำหรับลูกค้าจีน',
      fee: '2.9%',
      recommended: false,
    },
  ]

  const stripeMethods = [
    {
      id: 'credit_card' as PaymentMethod,
      name: 'International Cards',
      icon: <FaGlobe className="text-3xl" />,
      description: 'Visa, Mastercard, Amex',
      fee: '3.4% + $0.30',
      recommended: false,
    },
  ]

  const manualMethods = [
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'โอนเงินธนาคาร',
      icon: <FaUniversity className="text-3xl" />,
      description: 'อัพโหลดสลิปโอนเงิน',
      fee: '0฿',
      recommended: false,
    },
  ]

  const currentMethods = selectedProvider === 'omise' 
    ? omiseMethods 
    : selectedProvider === 'stripe' 
    ? stripeMethods 
    : manualMethods

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">เลือกช่องทางชำระเงิน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setSelectedProvider('omise')
              setSelectedMethod('promptpay')
            }}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedProvider === 'omise'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 hover:border-green-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🇹🇭</div>
              <div className="font-bold text-gray-900">Omise</div>
              <div className="text-xs text-gray-600">PromptPay, TrueMoney</div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedProvider('stripe')
              setSelectedMethod('credit_card')
            }}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedProvider === 'stripe'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-bold text-gray-900">Stripe</div>
              <div className="text-xs text-gray-600">International Cards</div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedProvider('manual')
              setSelectedMethod('bank_transfer')
            }}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedProvider === 'manual'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏦</div>
              <div className="font-bold text-gray-900">Manual</div>
              <div className="text-xs text-gray-600">โอนเงินธนาคาร</div>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">เลือกวิธีชำระเงิน</h3>
        <div className="space-y-3">
          {currentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              disabled={loading}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-4">
                <div className="text-blue-600">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-gray-900">{method.name}</div>
                    {method.recommended && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                        แนะนำ
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">ค่าธรรมเนียม</div>
                  <div className="font-bold text-gray-900">{method.fee}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-semibold">ยอดชำระ</span>
          <span className="text-3xl font-black text-gray-900">
            {formatAmount(amount, currency)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          ชำระผ่าน {currentMethods.find(m => m.id === selectedMethod)?.name}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังประมวลผล...
          </span>
        ) : (
          'ดำเนินการชำระเงิน'
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1 mb-1">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">การชำระเงินปลอดภัย 100%</span>
        </div>
        <div>
          ข้อมูลการชำระเงินของคุณได้รับการเข้ารหัสและปกป้องด้วย SSL/TLS
        </div>
      </div>
    </div>
  )
}
