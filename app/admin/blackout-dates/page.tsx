'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import BlackoutModal from '@/components/BlackoutModal'
import HolidayModal from '@/components/HolidayModal'
import MaintenanceModal from '@/components/MaintenanceModal'
import SeasonalModal from '@/components/SeasonalModal'
import {
  FaCalendarAlt, FaTools, FaChartLine, FaPlus, FaEdit, FaTrash,
  FaBan, FaGift, FaSun,
  FaSearch, FaArrowLeft
} from 'react-icons/fa'
import { BlackoutDate, HolidayDate, MaintenanceSchedule, SeasonalPricing } from '@/types/blackout'

export default function BlackoutDatesAdmin() {
  const [activeTab, setActiveTab] = useState<'blackout' | 'holidays' | 'maintenance' | 'seasonal'>('blackout')
  const [loading, setLoading] = useState(true)

  // Data states
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([])
  const [holidays, setHolidays] = useState<HolidayDate[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>([])

  // Modal states
  const [showBlackoutModal, setShowBlackoutModal] = useState(false)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showSeasonalModal, setShowSeasonalModal] = useState(false)

  // Selected items
  const [selectedBlackout, setSelectedBlackout] = useState<BlackoutDate | null>(null)
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayDate | null>(null)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceSchedule | null>(null)
  const [selectedSeasonal, setSelectedSeasonal] = useState<SeasonalPricing | null>(null)

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [blackoutRes, holidayRes, maintenanceRes, seasonalRes] = await Promise.all([
        fetch('/api/blackout-dates'),
        fetch('/api/holidays'),
        fetch('/api/maintenance'),
        fetch('/api/seasonal-pricing'),
      ])

      const [blackout, holiday, maintenance, seasonal] = await Promise.all([
        blackoutRes.json(),
        holidayRes.json(),
        maintenanceRes.json(),
        seasonalRes.json(),
      ])

      setBlackoutDates(blackout.blackoutDates || [])
      setHolidays(holiday.holidays || [])
      setMaintenanceSchedules(maintenance.schedules || [])
      setSeasonalPricing(seasonal.pricing || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.active}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${styles[priority] || styles.medium}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  const stats = {
    totalBlackouts: blackoutDates.filter((bd) => bd.status === 'active').length,
    upcomingHolidays: holidays.filter((h) => new Date(h.date) > new Date()).length,
    activeMaintenance: maintenanceSchedules.filter((m) => m.status === 'in_progress').length,
    activeSeasons: seasonalPricing.filter((sp) => sp.isActive).length,
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="/admin"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white p-3 rounded-xl transition-all border border-white/30 hover:scale-105"
                >
                  <FaArrowLeft className="text-xl" />
                </a>
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                    <FaCalendarAlt className="text-5xl" />
                    จัดการวันหยุด & ราคาตามฤดูกาล
                  </h1>
                  <p className="text-purple-100">Blackout Dates & Seasonal Pricing Management</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 rounded-lg p-3">
                    <FaBan className="text-2xl text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-100">Blackout Dates</p>
                    <p className="text-2xl font-bold text-white">{stats.totalBlackouts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 rounded-lg p-3">
                    <FaGift className="text-2xl text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-100">Upcoming Holidays</p>
                    <p className="text-2xl font-bold text-white">{stats.upcomingHolidays}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 rounded-lg p-3">
                    <FaTools className="text-2xl text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-100">Active Maintenance</p>
                    <p className="text-2xl font-bold text-white">{stats.activeMaintenance}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-lg p-3">
                    <FaChartLine className="text-2xl text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-100">Active Seasons</p>
                    <p className="text-2xl font-bold text-white">{stats.activeSeasons}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('blackout')}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'blackout'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaBan />
                Blackout Dates
              </button>
              <button
                onClick={() => setActiveTab('holidays')}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'holidays'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaGift />
                Holidays
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'maintenance'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaTools />
                Maintenance
              </button>
              <button
                onClick={() => setActiveTab('seasonal')}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'seasonal'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaSun />
                Seasonal Pricing
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Search & Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="flex gap-3">
                {activeTab === 'blackout' && (
                  <button
                    onClick={() => {
                      setSelectedBlackout(null)
                      setShowBlackoutModal(true)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <FaPlus />
                    สร้าง Blackout Date
                  </button>
                )}
                {activeTab === 'holidays' && (
                  <button
                    onClick={() => {
                      setSelectedHoliday(null)
                      setShowHolidayModal(true)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <FaPlus />
                    เพิ่มวันหยุด
                  </button>
                )}
                {activeTab === 'maintenance' && (
                  <button
                    onClick={() => {
                      setSelectedMaintenance(null)
                      setShowMaintenanceModal(true)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <FaPlus />
                    จัดตารางซ่อมบำรุง
                  </button>
                )}
                {activeTab === 'seasonal' && (
                  <button
                    onClick={() => {
                      setSelectedSeasonal(null)
                      setShowSeasonalModal(true)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <FaPlus />
                    สร้างราคาตามฤดูกาล
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Blackout Dates Tab */}
                {activeTab === 'blackout' && (
                  <div className="space-y-4">
                    {blackoutDates.length === 0 ? (
                      <div className="text-center py-20">
                        <FaBan className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">ยังไม่มี Blackout Dates</p>
                      </div>
                    ) : (
                      blackoutDates.map((blackout) => (
                        <div
                          key={blackout.id}
                          className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200 hover:border-red-400 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: blackout.color }}
                                />
                                <h3 className="text-xl font-bold text-gray-900">{blackout.title}</h3>
                                {getStatusBadge(blackout.status)}
                              </div>
                              <p className="text-gray-600 mb-4">{blackout.description}</p>
                              
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">เริ่ม</p>
                                  <p className="font-semibold">{new Date(blackout.startDate).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">สิ้นสุด</p>
                                  <p className="font-semibold">{new Date(blackout.endDate).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">อนุญาตจอง</p>
                                  <p className="font-semibold">{blackout.allowBooking ? '✅ ได้' : '❌ ไม่ได้'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Priority</p>
                                  <p className="font-semibold">{blackout.priority}</p>
                                </div>
                              </div>

                              {blackout.priceAdjustment?.enabled && (
                                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                                  <p className="text-sm font-semibold text-yellow-800">
                                    💰 ปรับราคา: {blackout.priceAdjustment.strategy === 'percentage' ? `${blackout.priceAdjustment.value}%` : `${blackout.priceAdjustment.value} บาท`}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedBlackout(blackout)
                                  setShowBlackoutModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('ต้องการลบ Blackout Date นี้?')) return
                                  await fetch(`/api/blackout-dates?id=${blackout.id}`, { method: 'DELETE' })
                                  loadData()
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Holidays Tab */}
                {activeTab === 'holidays' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {holidays.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <FaGift className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">ยังไม่มีวันหยุด</p>
                      </div>
                    ) : (
                      holidays.map((holiday) => (
                        <div
                          key={holiday.id}
                          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{holiday.emoji}</span>
                              <div>
                                <h3 className="font-bold text-gray-900">{holiday.nameTh}</h3>
                                <p className="text-xs text-gray-500">{holiday.nameEn}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setSelectedHoliday(holiday)
                                  setShowHolidayModal(true)
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('ต้องการลบวันหยุดนี้?')) return
                                  await fetch(`/api/holidays?id=${holiday.id}`, { method: 'DELETE' })
                                  loadData()
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">วันที่:</span>
                              <span className="font-semibold">{new Date(holiday.date).toLocaleDateString('th-TH')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">ราคาเพิ่ม:</span>
                              <span className="font-bold text-orange-600">x{holiday.priceMultiplier}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">พักขั้นต่ำ:</span>
                              <span className="font-semibold">{holiday.minStayRequired} คืน</span>
                            </div>
                          </div>

                          {holiday.description && (
                            <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-yellow-200">
                              {holiday.description}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Maintenance Tab */}
                {activeTab === 'maintenance' && (
                  <div className="space-y-4">
                    {maintenanceSchedules.length === 0 ? (
                      <div className="text-center py-20">
                        <FaTools className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">ยังไม่มีตารางซ่อมบำรุง</p>
                      </div>
                    ) : (
                      maintenanceSchedules.map((maintenance) => (
                        <div
                          key={maintenance.id}
                          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FaTools className="text-orange-600" />
                                <h3 className="text-xl font-bold text-gray-900">{maintenance.title}</h3>
                                {getStatusBadge(maintenance.status)}
                                {getPriorityBadge(maintenance.priority)}
                              </div>
                              <p className="text-gray-600 mb-4">{maintenance.description}</p>
                              
                              <div className="grid grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500">เริ่ม</p>
                                  <p className="font-semibold">{new Date(maintenance.startDate).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">สิ้นสุด</p>
                                  <p className="font-semibold">{new Date(maintenance.endDate).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">ระยะเวลา</p>
                                  <p className="font-semibold">{maintenance.estimatedDuration} ชม.</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">ส่งผล</p>
                                  <p className="font-semibold">{maintenance.affectsBooking ? '⚠️ ส่งผล' : '✅ ไม่ส่งผล'}</p>
                                </div>
                              </div>

                              {maintenance.status === 'in_progress' && (
                                <div className="bg-white rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold">ความคืบหน้า</span>
                                    <span className="text-sm font-bold text-orange-600">{maintenance.completionPercentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                                      style={{ width: `${maintenance.completionPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMaintenance(maintenance)
                                  setShowMaintenanceModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('ต้องการลบตารางนี้?')) return
                                  await fetch(`/api/maintenance?id=${maintenance.id}`, { method: 'DELETE' })
                                  loadData()
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Seasonal Pricing Tab */}
                {activeTab === 'seasonal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seasonalPricing.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <FaSun className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">ยังไม่มีราคาตามฤดูกาล</p>
                      </div>
                    ) : (
                      seasonalPricing.map((season) => (
                        <div
                          key={season.id}
                          className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 transition-all"
                          style={{ borderColor: season.color + '40', background: `linear-gradient(135deg, ${season.color}15, ${season.color}05)` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{season.seasonNameTh}</h3>
                                {season.isActive && (
                                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{season.badge}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setSelectedSeasonal(season)
                                  setShowSeasonalModal(true)
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('ต้องการลบ Seasonal Pricing นี้?')) return
                                  await fetch(`/api/seasonal-pricing?id=${season.id}`, { method: 'DELETE' })
                                  loadData()
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{season.description}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">ระยะเวลา:</span>
                              <span className="font-semibold">
                                {new Date(season.startDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} - {new Date(season.endDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">ปรับราคา:</span>
                              <span className={`font-bold ${season.baseAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {season.baseAdjustment > 0 ? '+' : ''}{season.baseAdjustment}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">พักขั้นต่ำ:</span>
                              <span className="font-semibold">{season.minimumStay} คืน</span>
                            </div>
                          </div>

                          {season.tags && season.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {season.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white text-xs rounded-full text-gray-700">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Blackout Modal */}
      <BlackoutModal
        isOpen={showBlackoutModal}
        onClose={() => {
          setShowBlackoutModal(false)
          setSelectedBlackout(null)
        }}
        onSave={loadData}
        blackout={selectedBlackout}
      />

      {/* Holiday Modal */}
      <HolidayModal
        isOpen={showHolidayModal}
        onClose={() => {
          setShowHolidayModal(false)
          setSelectedHoliday(null)
        }}
        onSave={loadData}
        holiday={selectedHoliday}
      />

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => {
          setShowMaintenanceModal(false)
          setSelectedMaintenance(null)
        }}
        onSave={loadData}
        maintenance={selectedMaintenance}
      />

      {/* Seasonal Modal */}
      <SeasonalModal
        isOpen={showSeasonalModal}
        onClose={() => {
          setShowSeasonalModal(false)
          setSelectedSeasonal(null)
        }}
        onSave={loadData}
        seasonal={selectedSeasonal}
      />
    </ProtectedRoute>
  )
}
