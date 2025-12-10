'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUsers, FaBuilding, FaChartLine, FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaFileInvoice, FaCheck, FaTimes, FaEnvelope } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'
import type { GroupBookingRequest, GroupBookingStats, GroupType } from '@/types/groupBooking'

export default function AdminGroupBookingsPage() {
  const router = useRouter()
  const { formatPrice } = useLanguage()
  const [activeTab, setActiveTab] = useState<'bookings' | 'discounts' | 'corporate' | 'stats'>('bookings')
  const [bookings, setBookings] = useState<GroupBookingRequest[]>([])
  const [filteredBookings, setFilteredBookings] = useState<GroupBookingRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<GroupBookingStats | null>(null)

  useEffect(() => {
    fetchBookings()
    fetchStats()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter))
    }
  }, [statusFilter, bookings])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/group-bookings')
      const data = await res.json()
      setBookings(data)
      setFilteredBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    // Calculate stats from bookings
    const res = await fetch('/api/group-bookings')
    const data: GroupBookingRequest[] = await res.json()
    
    const confirmedBookings = data.filter(b => b.status === 'confirmed')
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0)
    const totalRooms = data.reduce((sum, b) => sum + b.groupDetails.numberOfRooms, 0)
    
    const groupTypes: any = {}
    data.forEach(b => {
      const type = b.groupDetails.type
      if (!groupTypes[type]) {
        groupTypes[type] = { type, count: 0, revenue: 0 }
      }
      groupTypes[type].count++
      if (b.status === 'confirmed') {
        groupTypes[type].revenue += b.pricing.totalAmount
      }
    })
    
    const statsData: GroupBookingStats = {
      period: 'All Time',
      totalRequests: data.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: data.filter(b => b.status === 'cancelled').length,
      totalRevenue,
      averageGroupSize: data.length > 0 ? data.reduce((sum, b) => sum + b.groupDetails.totalGuests, 0) / data.length : 0,
      averageRoomsPerBooking: data.length > 0 ? totalRooms / data.length : 0,
      topGroupTypes: Object.values(groupTypes).sort((a: any, b: any) => b.count - a.count).slice(0, 5) as { type: GroupType; count: number; revenue: number; }[],
      conversionRate: data.length > 0 ? (confirmedBookings.length / data.length) * 100 : 0,
      averageDiscountGiven: confirmedBookings.length > 0 ? confirmedBookings.reduce((sum, b) => sum + b.pricing.groupDiscountPercentage, 0) / confirmedBookings.length : 0
    }
    
    setStats(statsData)
  }

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const booking = bookings.find(b => b.id === id)
      if (!booking) return
      
      await fetch('/api/group-bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, status })
      })
      
      fetchBookings()
      fetchStats()
    } catch (error) {
      console.error('Error updating booking:', error)
    }
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group booking?')) return
    
    try {
      await fetch(`/api/group-bookings?id=${id}`, { method: 'DELETE' })
      fetchBookings()
      fetchStats()
    } catch (error) {
      console.error('Error deleting booking:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'quoted': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦'
      case 'corporate': return '💼'
      case 'wedding': return '💒'
      case 'friends': return '🎉'
      case 'educational': return '🎓'
      default: return '👥'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Admin</span>
          </button>
          
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <FaUsers className="text-5xl" />
                  Group Booking Management
                </h1>
                <p className="text-blue-100 text-lg">จัดการจองหมู่คณะและลูกค้าองค์กร</p>
              </div>
              <button
                onClick={() => router.push('/group-booking')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2"
              >
                <FaPlus /> New Group Booking
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Group Bookings
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === 'discounts'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💰 Discount Settings
            </button>
            <button
              onClick={() => setActiveTab('corporate')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === 'corporate'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaBuilding className="inline mr-2" />
              Corporate Clients
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Statistics
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Total Requests</span>
                <FaUsers className="text-3xl text-blue-200" />
              </div>
              <p className="text-4xl font-bold">{stats.totalRequests}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100">Confirmed</span>
                <FaCheck className="text-3xl text-green-200" />
              </div>
              <p className="text-4xl font-bold">{stats.confirmedBookings}</p>
              <p className="text-sm text-green-100 mt-1">{stats.conversionRate.toFixed(1)}% conversion</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100">Total Revenue</span>
                <span className="text-3xl">💰</span>
              </div>
              <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100">Avg. Discount</span>
                <span className="text-3xl">🎁</span>
              </div>
              <p className="text-4xl font-bold">{stats.averageDiscountGiven.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
              <span className="font-bold text-gray-700">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="quoted">Quoted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <span className="text-gray-500">({filteredBookings.length} bookings)</span>
            </div>

            {/* Bookings List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading group bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No group bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{getTypeIcon(booking.groupDetails.type)}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{booking.groupDetails.groupName}</h3>
                            <p className="text-gray-500">#{booking.id}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">Contact</p>
                            <p className="font-bold text-gray-900">{booking.contactPerson.name}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <FaEnvelope className="text-xs" /> {booking.contactPerson.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Rooms & Guests</p>
                            <p className="font-bold text-gray-900">{booking.groupDetails.numberOfRooms} Rooms</p>
                            <p className="text-sm text-gray-600">{booking.groupDetails.totalGuests} Guests</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Check-in / Check-out</p>
                            <p className="font-bold text-gray-900">{new Date(booking.dates.checkIn).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{booking.dates.nights} nights</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-bold text-2xl text-indigo-600">{formatPrice(booking.pricing.totalAmount)}</p>
                            {booking.pricing.groupDiscountPercentage > 0 && (
                              <p className="text-sm text-green-600">-{booking.pricing.groupDiscountPercentage}% discount</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
                      <button
                        onClick={() => router.push(`/admin/group-bookings/${booking.id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <FaEye /> View Details
                      </button>
                      
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'quoted')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <FaFileInvoice /> Send Quote
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <FaCheck /> Confirm
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'quoted' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <FaCheck /> Confirm
                        </button>
                      )}
                      
                      {(booking.status === 'pending' || booking.status === 'quoted') && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discounts' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Group Discount Settings</h2>
              <button
                onClick={() => router.push('/admin/group-bookings/discount-settings')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FaEdit /> Edit Settings
              </button>
            </div>
            <p className="text-center text-gray-500 py-12">Configure group discount tiers and benefits</p>
          </div>
        )}

        {activeTab === 'corporate' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Corporate Clients</h2>
              <button
                onClick={() => router.push('/admin/corporate-clients/new')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FaPlus /> Add Corporate Client
              </button>
            </div>
            <p className="text-center text-gray-500 py-12">Manage corporate accounts and contracts</p>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Average Group Size</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.averageGroupSize.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">guests per booking</p>
                </div>
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Average Rooms</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.averageRoomsPerBooking.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">rooms per booking</p>
                </div>
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Conversion Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">pending to confirmed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Group Types</h2>
              <div className="space-y-3">
                {stats.topGroupTypes.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-2xl">{getTypeIcon(type.type)}</span>
                      <span className="font-bold text-gray-900 capitalize">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{type.count} bookings</p>
                      <p className="text-sm text-gray-500">{formatPrice(type.revenue)} revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
