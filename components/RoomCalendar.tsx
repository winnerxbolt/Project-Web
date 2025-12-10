'use client'

import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaFire, FaCalendarAlt } from 'react-icons/fa'

interface CalendarDay {
  roomId: number
  date: string
  status: 'available' | 'booked' | 'pending' | 'holiday' | 'maintenance' | 'blackout'
  hasSpecialDiscount?: boolean
  note?: string
  discountAmount?: number
  discountReason?: string
  priceMultiplier?: number
  seasonalAdjustment?: number
  isBlackout?: boolean
  blackoutReason?: string
}

interface RoomCalendarProps {
  roomId: number
  roomName: string
}

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const thaiDaysFull = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

export default function RoomCalendar({ roomId, roomName }: RoomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const thaiYear = year + 543

  useEffect(() => {
    fetchCalendarData()
  }, [roomId, year, month])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/calendar?roomId=${roomId}&year=${year}&month=${month + 1}`
      )
      const data = await response.json()
      if (data.success) {
        setCalendarData(data.calendar)
      }
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayStatus = (date: Date): CalendarDay | null => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    return calendarData.find(day => day.date === dateString) || null
  }

  const getStatusColor = (status: string, isToday: boolean): string => {
    const baseClasses = 'transition-all duration-200 cursor-pointer'
    switch (status) {
      case 'booked':
        return `${baseClasses} bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md hover:shadow-lg ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`
      case 'pending':
        return `${baseClasses} bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-800 shadow-md hover:shadow-lg ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`
      case 'holiday':
        return `${baseClasses} bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-lg ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`
      case 'maintenance':
        return `${baseClasses} bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-md hover:shadow-lg ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`
      case 'blackout':
        return `${baseClasses} bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-md hover:shadow-lg ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`
      default:
        return `${baseClasses} bg-white hover:bg-blue-50 text-gray-800 border border-gray-200 hover:border-blue-300 ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''}`
    }
  }

  const getDaysInMonth = (): (Date | null)[] => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth()

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <FaCalendarAlt className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{roomName}</h2>
            <p className="text-xs text-gray-500">ปฏิทินการจอง</p>
          </div>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          วันนี้
        </button>
      </div>
      
      {/* Month Navigation */}
      <div className="bg-white rounded-xl shadow-md p-3 mb-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="เดือนก่อนหน้า"
          >
            <FaChevronLeft className="text-gray-600 group-hover:text-blue-600 transition" />
          </button>
          
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-800">
              {thaiMonths[month]} {thaiYear}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="เดือนถัดไป"
          >
            <FaChevronRight className="text-gray-600 group-hover:text-blue-600 transition" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
          {thaiDays.map((day, index) => (
            <div
              key={index}
              className={`text-center py-2 font-bold text-sm ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
              title={thaiDaysFull[index]}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
          {days.map((date, index) => {
            if (!date) {
              return (
                <div 
                  key={`empty-${index}`} 
                  className="aspect-square rounded-lg bg-gray-100"
                />
              )
            }

            const dayStatus = getDayStatus(date)
            const status = dayStatus?.status || 'available'
            const hasDiscount = dayStatus?.hasSpecialDiscount || false
            const isToday = 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            const isWeekend = date.getDay() === 0 || date.getDay() === 6

            return (
              <div
                key={index}
                className={`aspect-square rounded-lg ${getStatusColor(status, isToday)} relative overflow-visible group`}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Date Number */}
                <div className="absolute top-1 left-1.5 text-sm font-bold">
                  {date.getDate()}
                </div>
                
                {/* Status Indicator Dot */}
                {status !== 'available' && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
                  </div>
                )}

                {/* Special Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-1 right-1">
                    <FaFire className="text-orange-500 text-xs drop-shadow-lg animate-pulse" />
                  </div>
                )}

                {/* Weekend Badge */}
                {isWeekend && status === 'available' && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  </div>
                )}

                {/* Hover Tooltip */}
                {hoveredDate?.getTime() === date.getTime() && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg flex flex-col items-center justify-center p-2 z-50 animate-fadeIn">
                    <span className="text-xs font-bold text-white text-center leading-tight">
                      {status === 'available' ? '🟢 ว่าง' : 
                       status === 'booked' ? '🔴 จองแล้ว' : 
                       status === 'pending' ? '🟡 รอโอนเงิน' :
                       status === 'holiday' ? '🟢 วันหยุด' : '🟠 ปรับปรุง'}
                    </span>
                    {hasDiscount && dayStatus?.discountReason && (
                      <div className="mt-1.5 text-center border-t border-gray-500 pt-1.5 w-full">
                        <div className="flex items-center justify-center gap-1">
                          <FaFire className="text-orange-400 text-xs" />
                          <span className="text-xs font-bold text-orange-300">
                            ลด ฿{dayStatus.discountAmount?.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-200 leading-tight block mt-0.5">
                          {dayStatus.discountReason}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Compact Legend */}
      <div className="mt-4 bg-white rounded-xl shadow-md p-3 border border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
            <span className="text-gray-700 font-medium">จองแล้ว</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-sm"></div>
            <span className="text-gray-700 font-medium">รอโอน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-600 shadow-sm"></div>
            <span className="text-gray-700 font-medium">วันหยุด</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm"></div>
            <span className="text-gray-700 font-medium">ซ่อมแซม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaFire className="text-orange-500 text-sm" />
            <span className="text-gray-700 font-medium">ราคาพิเศษ</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      )}
    </div>
  )
}
