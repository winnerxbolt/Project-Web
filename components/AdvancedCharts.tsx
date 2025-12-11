'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea, FaCalendar } from 'react-icons/fa'

interface ChartData {
  revenueData: Array<{ date: string; revenue: number; bookings: number }>
  roomBookings: Array<{ name: string; bookings: number; revenue: number }>
  bookingStatus: Array<{ name: string; value: number; color: string }>
  occupancyRate: Array<{ date: string; rate: number; capacity: number }>
}

interface AdvancedChartsProps {
  data?: ChartData
  period?: '7days' | '30days' | '90days' | 'year'
}

const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#A855F7',
  pink: '#EC4899',
  cyan: '#06B6D4'
}

const DEFAULT_DATA: ChartData = {
  revenueData: [
    { date: '1 ม.ค.', revenue: 45000, bookings: 12 },
    { date: '2 ม.ค.', revenue: 52000, bookings: 15 },
    { date: '3 ม.ค.', revenue: 48000, bookings: 13 },
    { date: '4 ม.ค.', revenue: 61000, bookings: 18 },
    { date: '5 ม.ค.', revenue: 55000, bookings: 16 },
    { date: '6 ม.ค.', revenue: 67000, bookings: 20 },
    { date: '7 ม.ค.', revenue: 72000, bookings: 22 }
  ],
  roomBookings: [
    { name: 'Deluxe Pool Villa', bookings: 45, revenue: 225000 },
    { name: 'Premium Suite', bookings: 38, revenue: 190000 },
    { name: 'Luxury Villa', bookings: 52, revenue: 312000 },
    { name: 'Garden View', bookings: 28, revenue: 112000 },
    { name: 'Ocean View', bookings: 35, revenue: 175000 }
  ],
  bookingStatus: [
    { name: 'ยืนยันแล้ว', value: 65, color: COLORS.success },
    { name: 'รอชำระเงิน', value: 20, color: COLORS.warning },
    { name: 'เช็คอินแล้ว', value: 10, color: COLORS.primary },
    { name: 'ยกเลิก', value: 5, color: COLORS.danger }
  ],
  occupancyRate: [
    { date: 'จ.', rate: 75, capacity: 100 },
    { date: 'อ.', rate: 82, capacity: 100 },
    { date: 'พ.', rate: 68, capacity: 100 },
    { date: 'พฤ.', rate: 90, capacity: 100 },
    { date: 'ศ.', rate: 95, capacity: 100 },
    { date: 'ส.', rate: 98, capacity: 100 },
    { date: 'อา.', rate: 92, capacity: 100 }
  ]
}

export default function AdvancedCharts({ data = DEFAULT_DATA, period = '7days' }: AdvancedChartsProps) {
  const [activeChart, setActiveChart] = useState<'revenue' | 'rooms' | 'status' | 'occupancy'>('revenue')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
              {entry.name === 'revenue' && ' ฿'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderPieLabel = (entry: any) => {
    return `${entry.name} (${entry.value}%)`
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Analytics Dashboard
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
              <FaCalendar className="inline mr-2" />
              {period === '7days' && '7 วัน'}
              {period === '30days' && '30 วัน'}
              {period === '90days' && '90 วัน'}
              {period === 'year' && '1 ปี'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveChart('revenue')}
            className={`p-4 rounded-xl transition-all ${
              activeChart === 'revenue'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaChartLine className="text-2xl mx-auto mb-2" />
            <div className="text-sm font-semibold">รายได้</div>
          </button>

          <button
            onClick={() => setActiveChart('rooms')}
            className={`p-4 rounded-xl transition-all ${
              activeChart === 'rooms'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaChartBar className="text-2xl mx-auto mb-2" />
            <div className="text-sm font-semibold">ห้องพัก</div>
          </button>

          <button
            onClick={() => setActiveChart('status')}
            className={`p-4 rounded-xl transition-all ${
              activeChart === 'status'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaChartPie className="text-2xl mx-auto mb-2" />
            <div className="text-sm font-semibold">สถานะ</div>
          </button>

          <button
            onClick={() => setActiveChart('occupancy')}
            className={`p-4 rounded-xl transition-all ${
              activeChart === 'occupancy'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaChartArea className="text-2xl mx-auto mb-2" />
            <div className="text-sm font-semibold">เข้าพัก</div>
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      {activeChart === 'revenue' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
            รายได้และการจอง
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 5 }}
                activeDot={{ r: 8 }}
                name="รายได้ (฿)"
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke={COLORS.secondary}
                strokeWidth={3}
                dot={{ fill: COLORS.secondary, r: 5 }}
                activeDot={{ r: 8 }}
                name="จำนวนการจอง"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Room Bookings Chart */}
      {activeChart === 'rooms' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-teal-600 rounded-full" />
            การจองตามประเภทห้อง
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.roomBookings}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-15} textAnchor="end" height={100} />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="bookings" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="จำนวนการจอง" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Booking Status Pie Chart */}
      {activeChart === 'status' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
            สถานะการจอง
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.bookingStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.bookingStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col justify-center space-y-3">
              {data.bookingStatus.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.value}% ของทั้งหมด</div>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Rate Area Chart */}
      {activeChart === 'occupancy' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-600 to-red-600 rounded-full" />
            อัตราการเข้าพัก
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.occupancyRate}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={COLORS.warning}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#occupancyGradient)"
                name="อัตราการเข้าพัก (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
