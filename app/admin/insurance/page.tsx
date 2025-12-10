'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  FaShieldAlt, FaFileContract, FaExchangeAlt, FaChartBar,
  FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes,
  FaSearch, FaFilter, FaClock, FaCheckCircle, FaTimesCircle,
  FaMoneyBillWave, FaUsers, FaCalendarAlt, FaExclamationTriangle,
  FaDownload, FaPrint, FaEnvelope, FaBell, FaArrowLeft
} from 'react-icons/fa'
import { 
  InsurancePlan, 
  BookingInsurance, 
  InsuranceClaim, 
  DateChangeRequest,
  InsuranceStats 
} from '@/types/insurance'

type TabType = 'overview' | 'plans' | 'policies' | 'claims' | 'changes' | 'analytics'

export default function InsuranceManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [insurances, setInsurances] = useState<BookingInsurance[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [changeRequests, setChangeRequests] = useState<DateChangeRequest[]>([])
  const [stats, setStats] = useState<InsuranceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const statsRes = await fetch('/api/insurance/stats')
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }
      
      if (activeTab === 'plans' || activeTab === 'overview') {
        const plansRes = await fetch('/api/insurance/plans')
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])
      }
      
      if (activeTab === 'policies' || activeTab === 'overview') {
        const insRes = await fetch('/api/insurance/booking')
        const insData = await insRes.json()
        setInsurances(insData.insurances || [])
      }
      
      if (activeTab === 'claims' || activeTab === 'overview') {
        const claimsRes = await fetch('/api/insurance/claims')
        const claimsData = await claimsRes.json()
        setClaims(claimsData.claims || [])
      }
      
      if (activeTab === 'changes' || activeTab === 'overview') {
        const changesRes = await fetch('/api/insurance/date-change')
        const changesData = await changesRes.json()
        setChangeRequests(changesData.requests || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateClaimStatus = async (claimId: string, status: string, approvedAmount?: number) => {
    try {
      const res = await fetch('/api/insurance/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: claimId, status, approvedAmount }),
      })

      if (res.ok) {
        alert(`เคลมถูก${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}แล้ว`)
        loadData()
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  const updateChangeRequestStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch('/api/insurance/date-change', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status, processedBy: 'admin' }),
      })

      if (res.ok) {
        alert(`คำขอเปลี่ยนวันถูก${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}แล้ว`)
        loadData()
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  const getPlanBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      basic: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🛡️' },
      standard: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🛡️✨' },
      premium: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '💎' },
      platinum: { bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200', text: 'text-yellow-900', icon: '👑' },
    }
    const badge = badges[type] || badges.basic
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} inline-flex items-center gap-1`}>
        <span>{badge.icon}</span> {type.toUpperCase()}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-600',
      claimed: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-purple-100 text-purple-800',
      paid: 'bg-teal-100 text-teal-800',
      completed: 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-4">
          {/* Animated Header */}
          <div className="mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <a
                  href="/admin"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-xl transition-all shadow-lg hover:scale-105"
                >
                  <FaArrowLeft className="text-xl" />
                </a>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                  <FaShieldAlt className="text-blue-600" />
                  ระบบประกันการจอง
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                จัดการแผนประกัน นโยบาย และเคลมทั้งหมดในที่เดียว
              </p>
            </div>
          </div>

          {/* Quick Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <FaShieldAlt className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">กรมธรรม์ทั้งหมด</p>
                    <p className="text-4xl font-extrabold">{stats.totalPolicies}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-4 pt-4 border-t border-blue-400/30">
                  <span>Active: {stats.activePolicies}</span>
                  <span>Claimed: {stats.claimedPolicies}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <FaMoneyBillWave className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-green-100 text-sm font-medium">รายได้จากเบี้ย</p>
                    <p className="text-4xl font-extrabold">{(stats.totalPremium / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="text-sm mt-4 pt-4 border-t border-green-400/30">
                  <span>THB {stats.totalPremium.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <FaFileContract className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-orange-100 text-sm font-medium">เคลมทั้งหมด</p>
                    <p className="text-4xl font-extrabold">{stats.totalClaims}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-4 pt-4 border-t border-orange-400/30">
                  <span>Pending: {stats.claimsByStatus.pending}</span>
                  <span>Paid: {stats.claimsByStatus.paid}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <FaCheckCircle className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-purple-100 text-sm font-medium">อัตราอนุมัติ</p>
                    <p className="text-4xl font-extrabold">{stats.claimApprovalRate.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-sm mt-4 pt-4 border-t border-purple-400/30">
                  <span>Avg Time: {stats.averageProcessingTime.toFixed(1)} วัน</span>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'ภาพรวม', icon: FaChartBar, color: 'blue' },
                { id: 'plans', label: 'แผนประกัน', icon: FaShieldAlt, color: 'purple' },
                { id: 'policies', label: 'กรมธรรม์', icon: FaFileContract, color: 'green' },
                { id: 'claims', label: 'เคลม', icon: FaExclamationTriangle, color: 'orange' },
                { id: 'changes', label: 'เปลี่ยนวัน', icon: FaExchangeAlt, color: 'pink' },
                { id: 'analytics', label: 'วิเคราะห์', icon: FaChartBar, color: 'teal' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-5 font-bold transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="text-xl" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              {/* Search Bar */}
              {activeTab !== 'overview' && activeTab !== 'analytics' && (
                <div className="flex gap-4 mb-8">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={`ค้นหา ${activeTab}...`}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg"
                    />
                  </div>
                  
                  {activeTab === 'plans' && (
                    <button
                      onClick={() => setShowPlanModal(true)}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-3 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <FaPlus className="text-xl" />
                      สร้างแผนใหม่
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                    <p className="text-gray-600 mt-6 text-lg font-medium">กำลังโหลดข้อมูล...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Pending Actions */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                              <FaExclamationTriangle className="text-orange-600" />
                              เคลมที่รอดำเนินการ
                            </h3>
                            <span className="text-3xl font-extrabold text-orange-600">
                              {claims.filter(c => c.status === 'pending').length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {claims.filter(c => c.status === 'pending').slice(0, 3).map(claim => (
                              <div key={claim.id} className="bg-white/80 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-sm">{claim.claimType}</p>
                                  <p className="text-xs text-gray-600">{claim.reason}</p>
                                </div>
                                <span className="text-orange-600 font-bold">{claim.claimAmount.toLocaleString()} ฿</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                              <FaCalendarAlt className="text-blue-600" />
                              คำขอเปลี่ยนวันที่รอ
                            </h3>
                            <span className="text-3xl font-extrabold text-blue-600">
                              {changeRequests.filter(r => r.status === 'pending').length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {changeRequests.filter(r => r.status === 'pending').slice(0, 3).map(request => (
                              <div key={request.id} className="bg-white/80 p-3 rounded-lg">
                                <p className="font-semibold text-sm">Booking #{request.bookingId.slice(-8)}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(request.requestedCheckIn).toLocaleDateString('th-TH')} - 
                                  {new Date(request.requestedCheckOut).toLocaleDateString('th-TH')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                          <FaBell className="text-purple-600" />
                          กิจกรรมล่าสุด
                        </h3>
                        <div className="space-y-3">
                          {[...insurances].sort((a, b) => 
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          ).slice(0, 5).map(ins => (
                            <div key={ins.id} className="bg-white/80 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                  {ins.planType[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{ins.userName}</p>
                                  <p className="text-sm text-gray-600">{ins.planName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-purple-600">{ins.premium.toLocaleString()} ฿</p>
                                <p className="text-xs text-gray-500">{new Date(ins.createdAt).toLocaleDateString('th-TH')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Plans Tab */}
                  {activeTab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {plans.map((plan) => (
                        <div key={plan.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-purple-300">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {getPlanBadge(plan.type)}
                              <h3 className="text-xl font-bold text-gray-900 mt-2">{plan.name}</h3>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPlan(plan)
                                  setShowPlanModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('ต้องการลบแผนนี้?')) return
                                  try {
                                    await fetch(`/api/insurance/plans?id=${plan.id}`, { method: 'DELETE' })
                                    loadData()
                                  } catch (error) {
                                    alert('เกิดข้อผิดพลาด')
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-4xl font-extrabold text-purple-600 mb-2">
                            {plan.price.toLocaleString()} ฿
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">คืนเงิน:</span>
                              <span className="font-bold text-green-600">{plan.coverage.cancellation.refundPercentage}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">เปลี่ยนวันฟรี:</span>
                              <span className="font-bold text-blue-600">
                                {plan.coverage.modification.freeChanges === 999 ? '∞' : plan.coverage.modification.freeChanges}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">ประกันเดินทาง:</span>
                              <span className="font-bold text-purple-600">
                                {plan.coverage.travel.enabled ? `${(plan.coverage.travel.medicalCoverage / 1000).toFixed(0)}K` : '❌'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">ใช้งาน: {plan.usageCount || 0} ครั้ง</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Policies Tab */}
                  {activeTab === 'policies' && (
                    <div className="space-y-4">
                      {insurances.map((ins) => (
                        <div key={ins.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{ins.userName}</h3>
                                {getStatusBadge(ins.status)}
                              </div>
                              <p className="text-gray-600">Policy: {ins.policyNumber}</p>
                              <p className="text-sm text-gray-500">Plan: {ins.planName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-purple-600">{ins.premium.toLocaleString()} ฿</p>
                              <p className="text-xs text-gray-500">{new Date(ins.purchaseDate).toLocaleDateString('th-TH')}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Room</p>
                              <p className="font-semibold">{ins.bookingDetails.roomName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Check-in</p>
                              <p className="font-semibold">{new Date(ins.bookingDetails.checkIn).toLocaleDateString('th-TH')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Check-out</p>
                              <p className="font-semibold">{new Date(ins.bookingDetails.checkOut).toLocaleDateString('th-TH')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Claims</p>
                              <p className="font-semibold text-orange-600">{ins.claims.length}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Claims Tab */}
                  {activeTab === 'claims' && (
                    <div className="space-y-4">
                      {claims.map((claim) => (
                        <div key={claim.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{claim.claimType}</h3>
                                {getStatusBadge(claim.status)}
                              </div>
                              <p className="text-sm text-gray-600">{claim.reasonDetails}</p>
                              <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(claim.submittedDate).toLocaleDateString('th-TH')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-600">{claim.claimAmount.toLocaleString()} ฿</p>
                            </div>
                          </div>
                          
                          {claim.status === 'pending' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => updateClaimStatus(claim.id, 'approved', claim.claimAmount)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                              >
                                <FaCheck />
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => updateClaimStatus(claim.id, 'rejected')}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                              >
                                <FaTimes />
                                ปฏิเสธ
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Changes Tab */}
                  {activeTab === 'changes' && (
                    <div className="space-y-4">
                      {changeRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">Booking #{request.bookingId.slice(-8)}</h3>
                                {getStatusBadge(request.status)}
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                  <p className="text-xs text-gray-500">Original Dates</p>
                                  <p className="font-semibold">{new Date(request.originalCheckIn).toLocaleDateString('th-TH')} - {new Date(request.originalCheckOut).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Requested Dates</p>
                                  <p className="font-semibold text-blue-600">{new Date(request.requestedCheckIn).toLocaleDateString('th-TH')} - {new Date(request.requestedCheckOut).toLocaleDateString('th-TH')}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Fee: {request.changeFee.toLocaleString()} ฿</p>
                              {request.coveredByInsurance && (
                                <p className="text-xs text-green-600">✓ Covered by Insurance</p>
                              )}
                            </div>
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => updateChangeRequestStatus(request.id, 'approved')}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                              >
                                <FaCheck />
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => updateChangeRequestStatus(request.id, 'rejected')}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                              >
                                <FaTimes />
                                ปฏิเสธ
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Analytics Tab */}
                  {activeTab === 'analytics' && stats && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                          <h3 className="text-xl font-bold mb-4">Claims by Type</h3>
                          <div className="space-y-3">
                            {Object.entries(stats.claimsByType).map(([type, count]) => (
                              <div key={type} className="flex justify-between items-center">
                                <span className="text-gray-700 capitalize">{type}</span>
                                <span className="font-bold text-purple-600">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                          <h3 className="text-xl font-bold mb-4">Top Reasons</h3>
                          <div className="space-y-3">
                            {stats.topReasons.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="text-gray-700">{item.reason}</span>
                                <span className="font-bold text-orange-600">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedPlan ? 'แก้ไขแผนประกัน' : 'สร้างแผนประกันใหม่'}
              </h3>
              <button
                onClick={() => {
                  setShowPlanModal(false)
                  setSelectedPlan(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              const planData = {
                id: selectedPlan?.id,
                name: formData.get('name'),
                type: formData.get('type'),
                price: Number(formData.get('price')),
                description: formData.get('description'),
                features: (formData.get('features') as string).split('\n').filter(Boolean),
                coverage: {
                  cancellation: {
                    enabled: true,
                    refundPercentage: Number(formData.get('refundPercentage')),
                    daysBeforeCheckIn: Number(formData.get('daysBeforeCheckIn')),
                    description: formData.get('cancellationDesc'),
                  },
                  modification: {
                    enabled: true,
                    freeChanges: Number(formData.get('freeChanges')),
                    feeAfterFree: Number(formData.get('feeAfterFree')),
                    description: formData.get('modificationDesc'),
                  },
                  travel: {
                    enabled: formData.get('travelEnabled') === 'on',
                    medicalCoverage: Number(formData.get('medicalCoverage') || 0),
                    accidentCoverage: Number(formData.get('accidentCoverage') || 0),
                    luggageCoverage: Number(formData.get('luggageCoverage') || 0),
                    description: formData.get('travelDesc') || '',
                  },
                  weatherDisruption: {
                    enabled: formData.get('weatherEnabled') === 'on',
                    coverage: Number(formData.get('weatherCoverage') || 0),
                    description: formData.get('weatherDesc') || '',
                  },
                  emergencySupport: {
                    enabled: true,
                    hotline247: formData.get('hotline247') === 'on',
                    description: formData.get('supportDesc') || '',
                  },
                },
                conditions: (formData.get('conditions') as string || '').split('\n').filter(Boolean),
                excludes: (formData.get('excludes') as string || '').split('\n').filter(Boolean),
                maxClaimAmount: Number(formData.get('maxClaimAmount')),
                validityDays: Number(formData.get('validityDays')),
              }

              try {
                const url = selectedPlan ? '/api/insurance/plans' : '/api/insurance/plans'
                const method = selectedPlan ? 'PATCH' : 'POST'
                
                const res = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(planData),
                })

                if (res.ok) {
                  alert(selectedPlan ? 'แก้ไขแผนสำเร็จ!' : 'สร้างแผนสำเร็จ!')
                  setShowPlanModal(false)
                  setSelectedPlan(null)
                  loadData()
                } else {
                  const data = await res.json()
                  alert(`Error: ${data.error}`)
                }
              } catch (error) {
                alert('เกิดข้อผิดพลาด')
              }
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อแผน *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedPlan?.name}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                    placeholder="เช่น: Basic Protection"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท *</label>
                  <select
                    name="type"
                    required
                    defaultValue={selectedPlan?.type}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ราคา (บาท) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    defaultValue={selectedPlan?.price}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                    placeholder="299"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">วงเงินสูงสุด (บาท) *</label>
                  <input
                    type="number"
                    name="maxClaimAmount"
                    required
                    defaultValue={selectedPlan?.maxClaimAmount}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={selectedPlan?.description}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                  placeholder="คำอธิบายแผนประกัน..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">คุณสมบัติ (แยกบรรทัด)</label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={selectedPlan?.features.join('\n')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                  placeholder="คุณสมบัติ 1&#10;คุณสมบัติ 2&#10;คุณสมบัติ 3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">คืนเงิน (%)</label>
                  <input
                    type="number"
                    name="refundPercentage"
                    defaultValue={selectedPlan?.coverage.cancellation.refundPercentage || 50}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ยกเลิกล่วงหน้า (วัน)</label>
                  <input
                    type="number"
                    name="daysBeforeCheckIn"
                    defaultValue={selectedPlan?.coverage.cancellation.daysBeforeCheckIn || 7}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                    placeholder="7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">เปลี่ยนวันฟรี (ครั้ง)</label>
                  <input
                    type="number"
                    name="freeChanges"
                    defaultValue={selectedPlan?.coverage.modification.freeChanges || 1}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium bg-white"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="travelEnabled"
                    defaultChecked={selectedPlan?.coverage.travel.enabled}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">เปิดใช้งานประกันการเดินทาง</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  {selectedPlan ? 'บันทึกการแก้ไข' : 'สร้างแผน'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false)
                    setSelectedPlan(null)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
