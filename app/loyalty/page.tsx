'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import {
  FaStar, FaGift, FaHistory, FaCrown,
  FaTicketAlt
} from 'react-icons/fa'
import type { LoyaltyMember, LoyaltyTierConfig, RedemptionItem, PointsTransaction } from '@/types/loyalty'

export default function LoyaltyPage() {
  const { user } = useAuth()
  const [member, setMember] = useState<LoyaltyMember | null>(null)
  const [tiers, setTiers] = useState<LoyaltyTierConfig[]>([])
  const [catalog, setCatalog] = useState<RedemptionItem[]>([])
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user?.email) return

    try {
      // Load member data
      const memberRes = await fetch(`/api/loyalty?userId=${user.email}`)
      const memberData = await memberRes.json()
      if (memberData.success) {
        setMember(memberData.member)
      }

      // Load tiers
      const tiersRes = await fetch('/data/loyalty-tiers.json')
      const tiersData = await tiersRes.json()
      setTiers(tiersData)

      // Load catalog
      const catalogRes = await fetch(`/api/loyalty/redeem?userId=${user.email}`)
      const catalogData = await catalogRes.json()
      if (catalogData.success) {
        setCatalog(catalogData.items)
      }

      // Load transactions
      const txnRes = await fetch('/data/points-transactions.json')
      const txnData = await txnRes.json()
      const userTxns = txnData.filter((t: PointsTransaction) => t.userId === user.email)
      setTransactions(userTxns.sort((a: PointsTransaction, b: PointsTransaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10))
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (itemId: string) => {
    if (!user?.email || !member) return

    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          itemId
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setMember(data.member)
        loadData()
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: data.error })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              กรุณาเข้าสู่ระบบ
            </h1>
            <p className="text-gray-600">
              เข้าสู่ระบบเพื่อดูคะแนนสะสมและแลกของรางวัล
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const currentTier = tiers.find(t => t.tier === member?.tier)
  const nextTier = tiers.find(t => t.minPoints > (member?.lifetimePoints || 0))
  
  const categories = [
    { id: 'all', name: 'ทั้งหมด', icon: FaGift },
    { id: 'discount', name: 'ส่วนลด', icon: FaTicketAlt },
    { id: 'upgrade', name: 'อัพเกรด', icon: FaCrown },
    { id: 'experience', name: 'ประสบการณ์', icon: FaStar },
    { id: 'gift', name: 'ของขวัญ', icon: FaGift }
  ]

  const filteredCatalog = selectedCategory === 'all' 
    ? catalog 
    : catalog.filter(item => item.category === selectedCategory)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mb-2">
              🎁 Loyalty Program
            </h1>
            <p className="text-xl text-gray-600">สะสมคะแนน แลกรางวัล รับสิทธิพิเศษ</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Member Card */}
          <div className="mb-8">
            <div 
              className="rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${currentTier?.color}dd, ${currentTier?.color})`
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm opacity-90 mb-1">สมาชิก {currentTier?.nameLocal}</div>
                    <div className="text-3xl font-black">{user.name}</div>
                  </div>
                  <div className="text-6xl">{currentTier?.icon}</div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm opacity-90 mb-1">คะแนนที่ใช้ได้</div>
                    <div className="text-4xl font-black">{member?.points.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90 mb-1">คะแนนสะสมตลอดการ</div>
                    <div className="text-2xl font-bold">{member?.lifetimePoints.toLocaleString()}</div>
                  </div>
                </div>

                {nextTier && (
                  <div>
                    <div className="flex justify-between text-sm opacity-90 mb-2">
                      <span>ความคืบหน้า ไปยัง {nextTier.nameLocal}</span>
                      <span>{Math.round(member?.tierProgress || 0)}%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${member?.tierProgress || 0}%` }}
                      />
                    </div>
                    <div className="text-sm opacity-90 mt-2">
                      อีก {(nextTier.minPoints - (member?.lifetimePoints || 0)).toLocaleString()} คะแนน
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              สิทธิประโยชน์ของคุณ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTier?.benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl">{benefit.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{benefit.title}</div>
                    <div className="text-sm text-gray-600">{benefit.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <cat.icon />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Redemption Catalog */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaGift className="text-pink-600" />
              แลกของรางวัล
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-6xl">
                    {item.category === 'discount' && '🎫'}
                    {item.category === 'upgrade' && '⬆️'}
                    {item.category === 'experience' && '✨'}
                    {item.category === 'amenity' && '🏨'}
                    {item.category === 'gift' && '🎁'}
                  </div>
                  <div className="p-6">
                    {item.minTier && (
                      <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mb-2">
                        {tiers.find(t => t.tier === item.minTier)?.nameLocal} ขึ้นไป
                      </div>
                    )}
                    <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-black text-purple-600">
                        {item.pointsCost.toLocaleString()} คะแนน
                      </div>
                      <button
                        onClick={() => handleRedeem(item.id)}
                        disabled={!member || member.points < item.pointsCost}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${
                          member && member.points >= item.pointsCost
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        แลก
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      คงเหลือ {item.stock} ชิ้น
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaHistory className="text-blue-600" />
              ประวัติการใช้คะแนน
            </h2>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ยังไม่มีประวัติ</p>
              ) : (
                transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold">{txn.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(txn.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      txn.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.type === 'earn' ? '+' : ''}{txn.points.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
