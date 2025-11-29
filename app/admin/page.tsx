'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { FaHotel, FaCalendarCheck, FaDollarSign, FaUsers, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

interface Booking {
  id: number
  roomName: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled'
  total: number
}

interface Room {
  id: number
  name: string
  price: number
  available: boolean
  beds: number
  guests: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'rooms'>('dashboard')

  // Sample data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      roomName: 'Deluxe Suite',
      guestName: 'สมชาย ใจดี',
      checkIn: '2025-11-30',
      checkOut: '2025-12-02',
      guests: 2,
      status: 'confirmed',
      total: 5000,
    },
    {
      id: 2,
      roomName: 'Executive Room',
      guestName: 'สมหญิง สวยงาม',
      checkIn: '2025-12-01',
      checkOut: '2025-12-03',
      guests: 1,
      status: 'pending',
      total: 3600,
    },
  ])

  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: 'Deluxe Suite', price: 2500, available: true, beds: 2, guests: 4 },
    { id: 2, name: 'Executive Room', price: 1800, available: true, beds: 1, guests: 2 },
    { id: 3, name: 'Family Room', price: 3200, available: false, beds: 3, guests: 6 },
  ])

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.available).length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
    revenue: bookings.reduce((sum, b) => sum + b.total, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'ยืนยันแล้ว'
      case 'pending':
        return 'รอดำเนินการ'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">แอดมิน Dashboard</h1>
            <p className="text-gray-600">จัดการระบบจองห้องพักและห้องพัก</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === 'bookings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              การจอง
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === 'rooms'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              จัดการห้องพัก
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">ห้องพักทั้งหมด</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaHotel className="text-2xl text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">ห้องว่าง</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.availableRooms}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCalendarCheck className="text-2xl text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">การจองทั้งหมด</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaUsers className="text-2xl text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">รายได้</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ฿{stats.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <FaDollarSign className="text-2xl text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">การจองล่าสุด</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ชื่อผู้จอง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ห้องพัก
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          วันที่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          สถานะ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ยอดรวม
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{booking.guestName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{booking.roomName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.checkIn} ถึง {booking.checkOut}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            ฿{booking.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">จัดการการจอง</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
                    <option value="">ทั้งหมด</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ชื่อผู้จอง
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ห้องพัก
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        เช็คอิน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        เช็คเอาท์
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ผู้เข้าพัก
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ยอดรวม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">#{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {booking.guestName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.roomName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.checkIn}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.checkOut}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.guests} คน</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          ฿{booking.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <FaEdit />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">จัดการห้องพัก</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                  <FaPlus />
                  <span>เพิ่มห้องพักใหม่</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                        <p className="text-2xl font-bold text-primary-600">
                          ฿{room.price.toLocaleString()}
                          <span className="text-sm text-gray-500 font-normal">/คืน</span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          room.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {room.available ? 'ว่าง' : 'ไม่ว่าง'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>เตียง: {room.beds}</p>
                      <p>รองรับผู้เข้าพัก: {room.guests} คน</p>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition">
                        แก้ไข
                      </button>
                      <button className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
