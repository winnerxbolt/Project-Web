'use client'

import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaFire } from 'react-icons/fa'

interface CalendarDay {
  roomId: number
  date: string
  status: 'available' | 'booked' | 'pending' | 'holiday' | 'maintenance'
  hasSpecialDiscount?: boolean
  note?: string
}

interface RoomCalendarProps {
  roomId: number
  roomName: string
}

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

export default function RoomCalendar({ roomId, roomName }: RoomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)

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
    // ใช้ local date แทน UTC เพื่อป้องกันปัญหา timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    return calendarData.find(day => day.date === dateString) || null
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'booked':
        return 'bg-red-500 text-black' // ติดจองแล้ว
      case 'pending':
        return 'bg-yellow-400 text-black' // จองแล้วแต่ยังไม่โอนเงิน
      case 'holiday':
        return 'bg-green-500 text-black' // วันหยุดยาว-นักขัตฤกษ์
      case 'maintenance':
        return 'bg-orange-500 text-black' // ปรับปรุง-ซ่อมแซม
      default:
        return 'bg-white text-black hover:bg-gray-50'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'booked':
        return 'ติดจองแล้ว'
      case 'pending':
        return 'จองแล้วแต่ยังไม่โอนเงิน'
      case 'holiday':
        return 'วันหยุดยาว-นักขัตฤกษ์'
      case 'maintenance':
        return 'ปรับปรุง-ซ่อมแซม'
      default:
        return 'ว่าง'
    }
  }

  const getDaysInMonth = (): (Date | null)[] => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // เพิ่มช่องว่างสำหรับวันก่อนหน้า
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // เพิ่มวันที่ในเดือน
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

  const days = getDaysInMonth()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{roomName}</h2>
      
      {/* Header with month/year navigation */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-red-700 rounded-lg hover:bg-red-800 transition flex items-center gap-2"
          >
            <FaChevronLeft /> Prev
          </button>
          
          <div className="text-center">
            <div className="text-sm">อัพเดทล่าสุด {new Date().toLocaleTimeString('th-TH')}</div>
            <div className="text-xl font-bold">
              {thaiMonths[month]} {thaiYear}
            </div>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-red-700 rounded-lg hover:bg-red-800 transition flex items-center gap-2"
          >
            Next <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-100">
          {thaiDays.map((day, index) => (
            <div
              key={index}
              className="text-center py-3 font-semibold text-gray-700 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="border-r border-b p-4 bg-gray-50" />
            }

            const dayStatus = getDayStatus(date)
            const status = dayStatus?.status || 'available'
            const hasDiscount = dayStatus?.hasSpecialDiscount || false
            const isToday = 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`relative border-r border-b last:border-r-0 p-4 min-h-[80px] ${getStatusColor(status)} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="font-semibold text-lg">{date.getDate()}</div>
                
                {hasDiscount && (
                  <div className="absolute top-1 right-1">
                    <FaFire className="text-orange-600 text-xl animate-pulse" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 border rounded"></div>
          <span className="text-sm text-black font-medium">ปรับปรุง-ซ่อม</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 border rounded"></div>
          <span className="text-sm text-black font-medium">จองแล้ว-ยังไม่โอน</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 border rounded"></div>
          <span className="text-sm text-black font-medium">วันหยุดยาว-นักขัตฤกษ์</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 border rounded"></div>
          <span className="text-sm text-black font-medium">ติดจองแล้ว</span>
        </div>
        <div className="flex items-center gap-2">
          <FaFire className="text-orange-600 text-xl" />
          <span className="text-sm text-black font-medium">ราคาพิเศษ</span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-500">
          กำลังโหลดข้อมูล...
        </div>
      )}
    </div>
  )
}
