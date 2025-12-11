'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  FaUndo, FaCheckCircle, FaTimesCircle,
  FaSearch, FaEye, FaCheck, FaTimes, FaComment, FaFileAlt,
  FaHistory, FaUser, FaCalendarAlt, FaPhone, FaEnvelope,
  FaChevronDown, FaChevronUp, FaPaperPlane, FaSpinner,
  FaChevronLeft, FaChevronRight, FaExclamationTriangle
} from 'react-icons/fa'
import ProtectedRoute from '@/components/ProtectedRoute'
import type { RefundRequest, RefundStatus, RefundReason } from '@/types/refund'

type TabType = 'all' | 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'

export default function AdminRefundsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [requests, setRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'priority'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/refunds?limit=50'
      if (activeTab !== 'all') {
        url += `&status=${activeTab}`
      }
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleApprove = async (request: RefundRequest, finalAmount?: number, notes?: string) => {
    try {
      const res = await fetch('/api/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: request.id,
          action: 'approve',
          finalAmount: finalAmount || request.calculatedAmount,
          notes,
          approvedBy: 'admin'
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Refund approved successfully!')
        setShowApproveModal(false)
        setSelectedRequest(null)
        loadData()
      } else {
        showMessage('error', data.error || 'Failed to approve refund')
      }
    } catch (error) {
      showMessage('error', 'Failed to approve refund')
    }
  }

  const handleReject = async (request: RefundRequest, reason: string) => {
    try {
      const res = await fetch('/api/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: request.id,
          action: 'reject',
          reason,
          rejectedBy: 'admin'
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Refund rejected')
        setShowRejectModal(false)
        setSelectedRequest(null)
        loadData()
      } else {
        showMessage('error', data.error || 'Failed to reject refund')
      }
    } catch (error) {
      showMessage('error', 'Failed to reject refund')
    }
  }

  const handleProcess = async (request: RefundRequest) => {
    try {
      const res = await fetch('/api/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: request.id,
          action: 'process',
          notes: 'Processing refund payment',
          processedBy: 'admin'
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Refund processing started')
        loadData()
      }
    } catch (error) {
      showMessage('error', 'Failed to process refund')
    }
  }

  const handleComplete = async (request: RefundRequest) => {
    try {
      const res = await fetch('/api/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: request.id,
          action: 'complete'
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Refund completed!')
        loadData()
      }
    } catch (error) {
      showMessage('error', 'Failed to complete refund')
    }
  }

  const getStatusBadge = (status: RefundStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      reviewing: 'bg-blue-100 text-blue-700 border-blue-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      processing: 'bg-purple-100 text-purple-700 border-purple-300',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-300'
    }
    return colors[status] || colors.pending
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      normal: 'bg-blue-500 text-white',
      low: 'bg-gray-500 text-white'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReasonLabel = (reason: RefundReason) => {
    const labels: Record<RefundReason, string> = {
      personal: 'เหตุผลส่วนตัว',
      emergency: 'เหตุฉุกเฉิน',
      weather: 'สภาพอากาศ',
      property_issue: 'ปัญหาที่พัก',
      service_issue: 'ปัญหาการบริการ',
      duplicate: 'จองซ้ำ',
      price_change: 'ราคาเปลี่ยน',
      other: 'อื่นๆ'
    }
    return labels[reason] || reason
  }

  // Memoized filtered and sorted requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter(req => {
        if (!debouncedSearch) return true
        const search = debouncedSearch.toLowerCase()
        return (
          req.guestName.toLowerCase().includes(search) ||
          req.guestEmail.toLowerCase().includes(search) ||
          req.id.includes(search) ||
          req.bookingId.toString().includes(search)
        )
      })
      .sort((a, b) => {
        let comparison = 0
        if (sortBy === 'date') {
          comparison = new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
        } else if (sortBy === 'amount') {
          comparison = b.requestedAmount - a.requestedAmount
        } else if (sortBy === 'priority') {
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return sortOrder === 'asc' ? -comparison : comparison
      })
  }, [requests, debouncedSearch, sortBy, sortOrder])

  // Memoized stats
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalAmount: requests.reduce((sum, r) => sum + r.requestedAmount, 0),
    approvedAmount: requests.filter(r => ['approved', 'completed'].includes(r.status)).reduce((sum, r) => sum + r.finalAmount, 0)
  }), [requests])

  // Paginated requests
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredRequests.slice(startIndex, endIndex)
  }, [filteredRequests, currentPage])

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Simplified Background */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <FaUndo className="text-4xl text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900">💰 Refund Management</h1>
                  <p className="text-gray-600 text-lg">จัดการคำขอคืนเงินและนโยบายการยกเลิก</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-lg"
              >
                <FaTimes className="text-xl" /> ย้อนกลับ
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-gray-500">
                <p className="text-xs text-gray-600 mb-1">ทั้งหมด</p>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-yellow-500">
                <p className="text-xs text-yellow-600 mb-1">รอดำเนินการ</p>
                <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500">
                <p className="text-xs text-green-600 mb-1">อนุมัติ</p>
                <p className="text-2xl font-black text-green-600">{stats.approved}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-500">
                <p className="text-xs text-purple-600 mb-1">กำลังโอน</p>
                <p className="text-2xl font-black text-purple-600">{stats.processing}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-emerald-500">
                <p className="text-xs text-emerald-600 mb-1">เสร็จสิ้น</p>
                <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-red-500">
                <p className="text-xs text-red-600 mb-1">ปฏิเสธ</p>
                <p className="text-2xl font-black text-red-600">{stats.rejected}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500">
                <p className="text-xs text-blue-600 mb-1">ยอดรวม</p>
                <p className="text-lg font-black text-blue-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-indigo-500">
                <p className="text-xs text-indigo-600 mb-1">คืนแล้ว</p>
                <p className="text-lg font-black text-indigo-600">{formatCurrency(stats.approvedAmount)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-lg">
              {[
                { id: 'all', label: 'ทั้งหมด', count: stats.total },
                { id: 'pending', label: 'รอดำเนินการ', count: stats.pending },
                { id: 'approved', label: 'อนุมัติ', count: stats.approved },
                { id: 'processing', label: 'กำลังโอน', count: stats.processing },
                { id: 'completed', label: 'เสร็จสิ้น', count: stats.completed },
                { id: 'rejected', label: 'ปฏิเสธ', count: stats.rejected }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType)
                    setCurrentPage(1)
                  }}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-75">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาด้วยชื่อ, อีเมล, เลขที่จอง..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 bg-white font-bold"
                >
                  <option value="date">เรียงตามวันที่</option>
                  <option value="amount">เรียงตามจำนวนเงิน</option>
                  <option value="priority">เรียงตามความสำคัญ</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  {sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
            </div>
          </div>

          {/* Refund Requests List */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
              <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
              <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-xl">ไม่พบคำขอคืนเงิน</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <FaUser className="text-2xl text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-black text-gray-900">{request.guestName}</h3>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityBadge(request.priority)}`}>
                                {request.priority.toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <FaEnvelope className="text-blue-500" />
                                <span>{request.guestEmail}</span>
                              </div>
                              {request.guestPhone && (
                                <div className="flex items-center gap-1">
                                  <FaPhone className="text-green-500" />
                                  <span>{request.guestPhone}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaCalendarAlt className="text-purple-500" />
                              <span>วันที่ขอคืนเงิน: {formatDate(request.requestDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600 mb-1">เลขที่จอง</p>
                            <p className="text-lg font-black text-blue-700">#{request.bookingId}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-green-600 mb-1">จำนวนเงินที่ขอ</p>
                            <p className="text-lg font-black text-green-700">{formatCurrency(request.requestedAmount)}</p>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-3">
                            <p className="text-xs text-purple-600 mb-1">จำนวนที่คำนวณได้</p>
                            <p className="text-lg font-black text-purple-700">{formatCurrency(request.calculatedAmount)}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FaComment className="text-gray-600" />
                            <span className="text-sm font-bold text-gray-700">เหตุผล: {getReasonLabel(request.reason)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{request.reasonDetail}</p>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-2 min-w-[200px]">
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetailModal(true)
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                        >
                          <FaEye /> ดูรายละเอียด
                        </button>

                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowApproveModal(true)
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                            >
                              <FaCheck /> อนุมัติ
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowRejectModal(true)
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
                            >
                              <FaTimes /> ปฏิเสธ
                            </button>
                          </>
                        )}

                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleProcess(request)}
                            className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition flex items-center justify-center gap-2"
                          >
                            <FaPaperPlane /> เริ่มโอนเงิน
                          </button>
                        )}

                        {request.status === 'processing' && (
                          <button
                            onClick={() => handleComplete(request)}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                          >
                            <FaCheckCircle /> โอนเรียบร้อย
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-3 rounded-xl font-bold transition ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-blue-500 hover:text-white shadow-lg'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-12 h-12 rounded-xl font-bold transition ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-xl font-bold transition ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-blue-500 hover:text-white shadow-lg'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals - Only render when needed */}
        {showDetailModal && selectedRequest && (
          <DetailModal
            request={selectedRequest}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedRequest(null)
            }}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getReasonLabel={getReasonLabel}
          />
        )}

        {showApproveModal && selectedRequest && (
          <ApproveModal
            request={selectedRequest}
            onApprove={handleApprove}
            onClose={() => {
              setShowApproveModal(false)
              setSelectedRequest(null)
            }}
            formatCurrency={formatCurrency}
          />
        )}

        {showRejectModal && selectedRequest && (
          <RejectModal
            request={selectedRequest}
            onReject={handleReject}
            onClose={() => {
              setShowRejectModal(false)
              setSelectedRequest(null)
            }}
          />
        )}

        {/* Success/Error Message Toast */}
        {message && (
          <div className={`fixed bottom-8 right-8 z-50 p-6 rounded-2xl shadow-2xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {message.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
            <span className="font-bold text-lg">{message.text}</span>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

// Detail Modal Component
function DetailModal({ 
  request, 
  onClose, 
  formatCurrency, 
  formatDate,
  getReasonLabel 
}: {
  request: RefundRequest
  onClose: () => void
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  getReasonLabel: (reason: RefundReason) => string
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black mb-2">รายละเอียดคำขอคืนเงิน</h2>
              <p className="text-blue-100">Request ID: {request.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Guest Info */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">ข้อมูลผู้จอง</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ชื่อ</p>
                <p className="text-lg font-bold text-gray-900">{request.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                <p className="text-lg font-bold text-gray-900">{request.guestEmail}</p>
              </div>
              {request.guestPhone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">เบอร์โทร</p>
                  <p className="text-lg font-bold text-gray-900">{request.guestPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">ข้อมูลการจอง</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-600 mb-1">เลขที่จอง</p>
                <p className="text-lg font-black text-blue-700">#{request.bookingId}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 mb-1">วันเช็คอิน</p>
                <p className="text-lg font-bold text-gray-900">{new Date(request.checkInDate).toLocaleDateString('th-TH')}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 mb-1">วันเช็คเอาท์</p>
                <p className="text-lg font-bold text-gray-900">{new Date(request.checkOutDate).toLocaleDateString('th-TH')}</p>
              </div>
            </div>
          </div>

          {/* Amount Info */}
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">ข้อมูลเงิน</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">จำนวนที่ชำระ</span>
                <span className="text-xl font-bold">{formatCurrency(request.originalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">จำนวนที่ขอคืน</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(request.requestedAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">จำนวนที่คำนวณได้</span>
                <span className="text-xl font-bold text-purple-600">{formatCurrency(request.calculatedAmount)}</span>
              </div>
              {request.finalAmount > 0 && (
                <div className="flex justify-between items-center pt-3 border-t-2 border-green-200">
                  <span className="text-lg font-bold text-green-700">จำนวนที่อนุมัติ</span>
                  <span className="text-2xl font-black text-green-600">{formatCurrency(request.finalAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Details */}
          <div className="bg-purple-50 rounded-2xl p-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">รายละเอียดคำขอ</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">เหตุผลการขอคืนเงิน</p>
                <p className="text-lg font-bold text-gray-900">{getReasonLabel(request.reason)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">รายละเอียด</p>
                <p className="text-gray-900 bg-white rounded-xl p-4">{request.reasonDetail}</p>
              </div>
              {request.policyType && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">นโยบายที่ใช้</p>
                  <p className="text-lg font-bold text-purple-600">{request.policyType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bank Info */}
          {(request.bankDetails || request.promptPayNumber) && (
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">ข้อมูลการโอนเงิน</h3>
              <div className="space-y-3">
                {request.bankDetails && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">เลขที่บัญชี</p>
                      <p className="text-lg font-bold text-gray-900">{request.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ธนาคาร</p>
                      <p className="text-lg font-bold text-gray-900">{request.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ชื่อบัญชี</p>
                      <p className="text-lg font-bold text-gray-900">{request.bankDetails.accountName}</p>
                    </div>
                  </>
                )}
                {request.promptPayNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">PromptPay</p>
                    <p className="text-lg font-bold text-gray-900">{request.promptPayNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          {request.timeline && request.timeline.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <FaHistory /> ประวัติการดำเนินการ
              </h3>
              <div className="space-y-3">
                {request.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{event.status}</p>
                      <p className="text-sm text-gray-600">{formatDate(event.timestamp)}</p>
                      {event.note && <p className="text-sm text-gray-700 mt-1">{event.note}</p>}
                      {event.by && <p className="text-xs text-gray-500 mt-1">โดย: {event.by}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Approve Modal Component
function ApproveModal({ 
  request, 
  onApprove, 
  onClose,
  formatCurrency 
}: { 
  request: RefundRequest
  onApprove: (request: RefundRequest, finalAmount?: number, notes?: string) => void
  onClose: () => void
  formatCurrency: (amount: number) => string
}) {
  const [finalAmount, setFinalAmount] = useState(request.calculatedAmount.toString())
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">อนุมัติคำขอคืนเงิน</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">ข้อมูลการคืนเงิน</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวนที่ขอคืน</span>
                <span className="font-bold">{formatCurrency(request.requestedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวนที่คำนวณได้</span>
                <span className="font-bold text-blue-600">{formatCurrency(request.calculatedAmount)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              จำนวนเงินที่อนุมัติ (THB)
            </label>
            <input
              type="number"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
              placeholder="เช่น เหตุผลในการปรับจำนวนเงิน..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onApprove(request, parseFloat(finalAmount), notes)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition"
            >
              <FaCheck className="inline mr-2" />
              อนุมัติคำขอ
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reject Modal Component
function RejectModal({ 
  request, 
  onReject, 
  onClose 
}: { 
  request: RefundRequest
  onReject: (request: RefundRequest, reason: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">ปฏิเสธคำขอคืนเงิน</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50 rounded-2xl p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-2xl flex-shrink-0 mt-1" />
            <p className="text-red-700">
              กรุณาระบุเหตุผลในการปฏิเสธคำขอคืนเงิน เพื่อให้ลูกค้าเข้าใจสถานการณ์
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              เหตุผลในการปฏิเสธ *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
              placeholder="เช่น การจองไม่สามารถยกเลิกได้เนื่องจากใกล้วันเช็คอินเกินกำหนด..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (reason.trim()) {
                  onReject(request, reason)
                }
              }}
              disabled={!reason.trim()}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition ${
                reason.trim()
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaTimes className="inline mr-2" />
              ปฏิเสธคำขอ
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
