'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  FaChartLine,
  FaArrowLeft,
  FaDollarSign,
  FaCalendarCheck,
  FaUsers,
  FaTrophy,
  FaPercentage,
  FaGlobeAsia,
  FaFilter,
  FaDownload,
  FaSync,
  FaStar,
  FaHome,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa'
import type { AnalyticsReport } from '@/types/analytics'
import AdvancedCharts from '@/components/AdvancedCharts'

export default function AdminStatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<AnalyticsReport | null>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])

    fetchRooms()
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
  }, [startDate, endDate, selectedRoom])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const fetchReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(selectedRoom && { roomId: selectedRoom.toString() }),
      })

      const response = await fetch(`/api/analytics?${params}`)
      const data = await response.json()

      if (data.success) {
        setReport(data.report)
      } else {
        setError('ไม่สามารถโหลดรายงานได้')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setError('เกิดข้อผิดพลาดในการโหลดรายงาน')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!report) return

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)

    setMessage('ส่งออกรายงานสำเร็จ!')
    setTimeout(() => setMessage(''), 3000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading && !report) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-bold">กำลังโหลดรายงาน...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl mb-6"
            >
              <FaArrowLeft />
              <span>กลับสู่หน้า Admin</span>
            </Link>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl">
                    <FaChartLine className="text-white text-4xl" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                      รายงานและสถิติ
                    </h1>
                    <p className="text-gray-600 text-lg mt-1">ภาพรวมการดำเนินงานและการวิเคราะห์ข้อมูล</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={fetchReport}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <FaSync className={loading ? 'animate-spin' : ''} />
                    <span>รีเฟรช</span>
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <FaDownload />
                    <span>ส่งออก</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl text-green-800 font-bold shadow-lg flex items-center gap-3">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <FaChartLine />
              </div>
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl text-red-800 font-bold shadow-lg">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-100">
            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <FaFilter className="text-purple-600" />
              กรองข้อมูล
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-black text-gray-900 mb-3">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg font-bold transition-all"
                />
              </div>
              <div>
                <label className="block text-base font-black text-gray-900 mb-3">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg font-bold transition-all"
                />
              </div>
              <div>
                <label className="block text-base font-black text-gray-900 mb-3">
                  ห้องพัก (ทั้งหมด)
                </label>
                <select
                  value={selectedRoom || ''}
                  onChange={(e) => setSelectedRoom(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg font-bold transition-all"
                >
                  <option value="">ทั้งหมด</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {report && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                      <FaDollarSign className="text-4xl" />
                    </div>
                    <FaArrowUp className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold opacity-90 mb-2">รายได้ทั้งหมด</h3>
                  <p className="text-4xl font-black">{formatCurrency(report.bookingStats.totalRevenue)}</p>
                  <p className="text-sm mt-2 opacity-80">
                    จาก {report.bookingStats.totalBookings} การจอง
                  </p>
                </div>

                {/* Total Bookings */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                      <FaCalendarCheck className="text-4xl" />
                    </div>
                    <FaChartBar className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold opacity-90 mb-2">จำนวนการจอง</h3>
                  <p className="text-4xl font-black">{report.bookingStats.totalBookings}</p>
                  <div className="flex gap-2 mt-2 text-sm">
                    <span className="bg-white/20 px-2 py-1 rounded">ยืนยัน: {report.bookingStats.confirmedBookings}</span>
                    <span className="bg-white/20 px-2 py-1 rounded">สำเร็จ: {report.bookingStats.completedBookings}</span>
                  </div>
                </div>

                {/* Average Booking Value */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                      <FaChartPie className="text-4xl" />
                    </div>
                    <FaStar className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold opacity-90 mb-2">มูลค่าเฉลี่ย</h3>
                  <p className="text-4xl font-black">{formatCurrency(report.bookingStats.averageBookingValue)}</p>
                  <p className="text-sm mt-2 opacity-80">ต่อการจอง</p>
                </div>

                {/* Customer Stats */}
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                      <FaUsers className="text-4xl" />
                    </div>
                    <FaGlobeAsia className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold opacity-90 mb-2">ลูกค้าทั้งหมด</h3>
                  <p className="text-4xl font-black">{report.customerStats.total}</p>
                  <div className="flex gap-2 mt-2 text-sm">
                    <span className="bg-white/20 px-2 py-1 rounded">ไทย: {report.customerStats.thai}</span>
                    <span className="bg-white/20 px-2 py-1 rounded">ต่างชาติ: {report.customerStats.foreign}</span>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <FaChartLine className="text-purple-600" />
                    แนวโน้มรายได้
                  </h3>
                  {report.revenueData.length > 0 ? (
                    <div className="space-y-3">
                      {report.revenueData.slice(-10).map((data, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="text-sm font-bold text-gray-600 w-24">
                            {new Date(data.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gradient-to-r from-purple-200 to-blue-200 rounded-full h-8 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full flex items-center justify-end pr-3 text-white text-sm font-bold transition-all duration-500"
                                style={{
                                  width: `${Math.max((data.revenue / Math.max(...report.revenueData.map((d) => d.revenue))) * 100, 10)}%`,
                                }}
                              >
                                {formatCurrency(data.revenue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">ไม่มีข้อมูล</p>
                  )}
                </div>

                {/* Customer Distribution */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <FaGlobeAsia className="text-orange-600" />
                    สัดส่วนลูกค้า
                  </h3>
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative w-64 h-64">
                      {/* Pie Chart Simulation */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((report.customerStats.thaiPercentage / 100) * 2 * Math.PI)}% ${50 - 50 * Math.cos((report.customerStats.thaiPercentage / 100) * 2 * Math.PI)}%, 50% 50%)`,
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-xl">
                          <div className="text-center">
                            <p className="text-3xl font-black text-gray-900">{report.customerStats.total}</p>
                            <p className="text-sm text-gray-600 font-bold">ลูกค้า</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded"></div>
                        <span className="font-bold text-gray-900">ลูกค้าไทย</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-blue-600">{report.customerStats.thai}</p>
                        <p className="text-sm text-gray-600">{formatPercent(report.customerStats.thaiPercentage)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-pink-600 rounded"></div>
                        <span className="font-bold text-gray-900">ลูกค้าต่างชาติ</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-orange-600">{report.customerStats.foreign}</p>
                        <p className="text-sm text-gray-600">{formatPercent(report.customerStats.foreignPercentage)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Occupancy Rates */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FaPercentage className="text-blue-600" />
                  อัตราการจองห้อง (Occupancy Rate)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.occupancyRates
                    .sort((a, b) => b.occupancyRate - a.occupancyRate)
                    .map((room) => (
                      <div
                        key={room.roomId}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-black text-lg text-gray-900 mb-1">{room.roomName}</h4>
                            <p className="text-sm text-gray-600">
                              {room.bookedDays} / {room.totalDays} วัน
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-purple-600">{formatPercent(room.occupancyRate)}</p>
                          </div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(room.occupancyRate, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-bold">รายได้:</span>
                          <span className="font-black text-green-600">{formatCurrency(room.revenue)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Popular Rooms */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  ห้องพักยอดนิยม Top 10
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.popularRooms.map((room, index) => (
                    <div
                      key={room.id}
                      className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all hover:shadow-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      {room.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-black text-lg text-gray-900 mb-1">{room.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <FaStar className="text-yellow-500" />
                          <span className="font-bold text-gray-700">{room.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {room.bookingCount} จอง
                          </span>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                            {formatCurrency(room.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Charts Section */}
              <div className="mt-8">
                <AdvancedCharts />
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
