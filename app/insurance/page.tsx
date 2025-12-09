'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaShieldAlt, FaCheckCircle, FaTimesCircle, FaStar,
  FaMoneyBillWave, FaCalendarAlt, FaPhone, FaClock,
  FaFileContract, FaHeart, FaRegHeart, FaInfoCircle
} from 'react-icons/fa'
import { InsurancePlan } from '@/types/insurance'

export default function InsurancePlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [comparePlans, setComparePlans] = useState<string[]>([])

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/insurance/plans?activeOnly=true')
      const data = await res.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCompare = (planId: string) => {
    if (comparePlans.includes(planId)) {
      setComparePlans(comparePlans.filter(id => id !== planId))
    } else if (comparePlans.length < 3) {
      setComparePlans([...comparePlans, planId])
    } else {
      alert('สามารถเปรียบเทียบได้สูงสุด 3 แผน')
    }
  }

  const getPlanGradient = (type: string) => {
    const gradients: Record<string, string> = {
      basic: 'from-gray-500 to-gray-600',
      standard: 'from-blue-500 to-blue-600',
      premium: 'from-purple-500 to-purple-600',
      platinum: 'from-yellow-400 to-yellow-600',
    }
    return gradients[type] || gradients.basic
  }

  const getPlanIcon = (type: string) => {
    const icons: Record<string, string> = {
      basic: '🛡️',
      standard: '🛡️✨',
      premium: '💎',
      platinum: '👑',
    }
    return icons[type] || icons.basic
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดแผนประกัน...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 blur-3xl -z-10"></div>
          <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
            <p className="text-white font-bold text-sm">🛡️ PROTECT YOUR BOOKING</p>
          </div>
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            ประกันการจองที่ใช่สำหรับคุณ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            เลือกความคุ้มครองที่เหมาะสมกับแผนการเดินทางของคุณ 
            <br />พร้อมบริการระดับมืออาชีพ 24/7
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🛡️', label: 'ความคุ้มครอง', value: '100%' },
            { icon: '⚡', label: 'เคลมเร็ว', value: '24 ชม.' },
            { icon: '💯', label: 'อนุมัติเคลม', value: '95%' },
            { icon: '🏆', label: 'ลูกค้าพึงพอใจ', value: '4.9/5' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Compare Mode Toggle */}
        {comparePlans.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all font-bold flex items-center gap-3"
            >
              <FaFileContract />
              เปรียบเทียบ ({comparePlans.length})
            </button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative group ${
                plan.type === 'premium' ? 'lg:scale-105 z-10' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.type === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <FaStar /> แนะนำ
                  </div>
                </div>
              )}

              <div 
                className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 ${
                  selectedPlan === plan.id 
                    ? 'border-purple-500 ring-4 ring-purple-200' 
                    : 'border-transparent hover:border-purple-200'
                }`}
                style={{
                  transform: selectedPlan === plan.id ? 'translateY(-8px)' : 'translateY(0)',
                }}
              >
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-br ${getPlanGradient(plan.type)} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 text-9xl opacity-10">
                    {getPlanIcon(plan.type)}
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">
                      {plan.type}
                    </p>
                    <h3 className="text-3xl font-extrabold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold">{plan.price}</span>
                      <span className="text-xl opacity-75">฿</span>
                    </div>
                    <p className="text-sm opacity-90 mt-2">{plan.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 space-y-4">
                  {plan.features.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                  
                  {plan.features.length > 5 && (
                    <p className="text-sm text-purple-600 font-semibold">
                      + อีก {plan.features.length - 5} สิทธิประโยชน์
                    </p>
                  )}
                </div>

                {/* Coverage Highlights */}
                <div className="px-6 pb-6 space-y-2">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-600">คืนเงิน</span>
                      <span className="text-xl font-extrabold text-blue-600">
                        {plan.coverage.cancellation.refundPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600">เปลี่ยนวันฟรี</span>
                      <span className="text-xl font-extrabold text-purple-600">
                        {plan.coverage.modification.freeChanges === 999 ? '∞' : plan.coverage.modification.freeChanges}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id)
                      // Navigate to booking page with insurance
                      router.push(`/rooms?insurance=${plan.id}`)
                    }}
                    className={`w-full py-4 rounded-xl font-bold transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                      selectedPlan === plan.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-purple-100 hover:to-pink-100'
                    }`}
                  >
                    {selectedPlan === plan.id ? '✓ เลือกแผนนี้' : 'เลือกแผนนี้'}
                  </button>

                  <button
                    onClick={() => toggleCompare(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      comparePlans.includes(plan.id)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {comparePlans.includes(plan.id) ? (
                      <><FaHeart className="inline mr-2" /> กำลังเปรียบเทียบ</>
                    ) : (
                      <><FaRegHeart className="inline mr-2" /> เปรียบเทียบ</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl mb-16">
          <h2 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ทำไมต้องเลือกประกันจากเรา?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'เคลมเร็วภายใน 24 ชม.',
                desc: 'ระบบอัตโนมัติประมวลผลและอนุมัติเคลมแบบเรียลไทม์',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: '🛡️',
                title: 'ความคุ้มครองครอบคลุม',
                desc: 'คุ้มครองทุกเหตุการณ์ ตั้งแต่การยกเลิกไปจนถึงภัยธรรมชาติ',
                color: 'from-blue-500 to-purple-500'
              },
              {
                icon: '💎',
                title: 'บริการระดับพรีเมียม',
                desc: 'ทีมงานมืออาชีพพร้อมให้บริการ 24/7 ทุกช่องทาง',
                color: 'from-purple-500 to-pink-500'
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-5xl shadow-xl group-hover:shadow-2xl`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4">พร้อมจองพร้อมความมั่นใจ</h2>
            <p className="text-xl mb-8 opacity-90">
              เริ่มต้นวันหยุดที่ปลอดภัยกับประกันการจองของเรา
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/rooms')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
              >
                เริ่มจองเลย
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all"
              >
                ติดต่อสอบถาม
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
