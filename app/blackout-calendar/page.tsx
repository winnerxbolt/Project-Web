'use client'

import { useState, useEffect } from 'react'
import { FaCalendarAlt, FaInfoCircle, FaGift, FaSun, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import Navbar from '@/components/Navbar'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  holidays: any[]
  blackouts: any[]
  maintenance: any[]
  seasonalPricing: any[]
  priceMultiplier: number
  isBlackout: boolean
}

export default function BlackoutCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [holidays, setHolidays] = useState<any[]>([])
  const [, setSeasonalPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const [holidaysRes, seasonalRes] = await Promise.all([
        fetch(`/api/holidays?year=${year}&month=${month}`),
        fetch('/api/seasonal-pricing?active=true'),
      ])

      const [holidaysData, seasonalData] = await Promise.all([
        holidaysRes.json(),
        seasonalRes.json(),
      ])

      setHolidays(holidaysData.holidays || [])
      setSeasonalPricing(seasonalData.pricing || [])

      generateCalendar(holidaysData.holidays || [], seasonalData.pricing || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendar = (holidaysData: any[], seasonalData: any[]) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Find holidays on this date
      const dayHolidays = holidaysData.filter((h) => {
        const holidayStart = new Date(h.date)
        const holidayEnd = h.endDate ? new Date(h.endDate) : holidayStart
        return date >= holidayStart && date <= holidayEnd
      })

      // Find seasonal pricing
      const daySeasonal = seasonalData.filter((s) => {
        const seasonStart = new Date(s.startDate)
        const seasonEnd = new Date(s.endDate)
        return date >= seasonStart && date <= seasonEnd
      })

      // Calculate price multiplier
      let priceMultiplier = 1.0
      if (dayHolidays.length > 0) {
        priceMultiplier = Math.max(...dayHolidays.map((h: any) => h.priceMultiplier))
      }
      if (daySeasonal.length > 0) {
        const seasonAdj = daySeasonal[0].baseAdjustment / 100
        priceMultiplier += seasonAdj
      }

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        holidays: dayHolidays,
        blackouts: [],
        maintenance: [],
        seasonalPricing: daySeasonal,
        priceMultiplier,
        isBlackout: false,
      })
    }

    setCalendarDays(days)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getDayColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'bg-gray-50 text-gray-400'
    if (day.holidays.length > 0) return 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
    if (day.seasonalPricing.length > 0) {
      const season = day.seasonalPricing[0]
      if (season.baseAdjustment > 30) return 'bg-gradient-to-br from-red-100 to-pink-100'
      if (season.baseAdjustment > 0) return 'bg-gradient-to-br from-orange-100 to-yellow-100'
      if (season.baseAdjustment < 0) return 'bg-gradient-to-br from-green-100 to-teal-100'
    }
    return 'bg-white hover:bg-blue-50'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 mb-8 shadow-2xl text-center">
            <h1 className="text-5xl font-extrabold text-white mb-4 flex items-center justify-center gap-4">
              <FaCalendarAlt className="text-6xl" />
              ปฏิทินวันหยุด & ราคาพิเศษ
            </h1>
            <p className="text-xl text-purple-100">ตรวจสอบวันหยุดนักขัตฤกษ์และราคาตามฤดูกาล</p>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              คำอธิบายสี
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400"></div>
                <div>
                  <p className="font-semibold text-gray-900">วันหยุดนักขัตฤกษ์</p>
                  <p className="text-xs text-gray-600">ราคาพิเศษ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-pink-100"></div>
                <div>
                  <p className="font-semibold text-gray-900">High Season</p>
                  <p className="text-xs text-gray-600">ราคาสูง +30%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100"></div>
                <div>
                  <p className="font-semibold text-gray-900">Shoulder Season</p>
                  <p className="text-xs text-gray-600">ราคาปานกลาง</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-teal-100"></div>
                <div>
                  <p className="font-semibold text-gray-900">Low Season</p>
                  <p className="text-xs text-gray-600">ส่วนลดพิเศษ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousMonth}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <h2 className="text-3xl font-bold text-white">
                  {formatDate(currentDate)}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white"
                >
                  <FaArrowRight className="text-xl" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 bg-gray-100 border-b-2 border-gray-300">
              {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map((day) => (
                <div key={day} className="text-center py-4 font-bold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-4 border border-gray-200 min-h-[120px] transition-all hover:shadow-lg ${getDayColor(day)}`}
                  >
                    <div className="text-right mb-2">
                      <span className={`text-lg font-bold ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {day.date.getDate()}
                      </span>
                    </div>

                    {day.holidays.length > 0 && (
                      <div className="space-y-1">
                        {day.holidays.map((holiday, idx) => (
                          <div key={idx} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                            <span>{holiday.emoji}</span>
                            <span className="truncate">{holiday.nameTh.substring(0, 10)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {day.seasonalPricing.length > 0 && day.holidays.length === 0 && (
                      <div className="text-xs font-semibold text-gray-700 mt-2">
                        {day.seasonalPricing[0].badge}
                      </div>
                    )}

                    {day.priceMultiplier !== 1.0 && (
                      <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                        day.priceMultiplier > 1 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {day.priceMultiplier > 1 ? '+' : ''}{((day.priceMultiplier - 1) * 100).toFixed(0)}%
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Day Details */}
          {selectedDay && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDay(null)}>
              <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  {selectedDay.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </h3>

                {selectedDay.holidays.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaGift className="text-yellow-600" />
                      วันหยุดนักขัตฤกษ์
                    </h4>
                    {selectedDay.holidays.map((holiday, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-2 border-2 border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{holiday.emoji}</span>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{holiday.nameTh}</p>
                            <p className="text-sm text-gray-600">{holiday.nameEn}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <p className="text-xs text-gray-600">ราคาเพิ่ม</p>
                            <p className="font-bold text-orange-600">x{holiday.priceMultiplier} ({((holiday.priceMultiplier - 1) * 100).toFixed(0)}%)</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">พักขั้นต่ำ</p>
                            <p className="font-bold text-blue-600">{holiday.minStayRequired} คืน</p>
                          </div>
                        </div>
                        {holiday.description && (
                          <p className="text-sm text-gray-600 mt-2">{holiday.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedDay.seasonalPricing.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaSun className="text-green-600" />
                      ราคาตามฤดูกาล
                    </h4>
                    {selectedDay.seasonalPricing.map((season, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-lg text-gray-900">{season.seasonNameTh}</p>
                            <p className="text-sm text-gray-600">{season.badge}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full font-bold ${
                            season.baseAdjustment > 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {season.baseAdjustment > 0 ? '+' : ''}{season.baseAdjustment}%
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{season.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-600">พักขั้นต่ำ</p>
                            <p className="font-bold text-blue-600">{season.minimumStay} คืน</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">จองล่วงหน้า</p>
                            <p className="font-bold text-purple-600">{season.advanceBookingRequired} วัน</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDay.holidays.length === 0 && selectedDay.seasonalPricing.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">ไม่มีข้อมูลพิเศษสำหรับวันนี้</p>
                    <p className="text-sm text-gray-400 mt-2">ราคาปกติ</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Holidays */}
          <div className="bg-white rounded-2xl p-8 mt-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaGift className="text-yellow-600" />
              วันหยุดที่กำลังจะมาถึง
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidays
                .filter((h) => new Date(h.date) > new Date())
                .slice(0, 6)
                .map((holiday) => (
                  <div key={holiday.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{holiday.emoji}</span>
                      <div>
                        <p className="font-bold text-gray-900">{holiday.nameTh}</p>
                        <p className="text-xs text-gray-600">{new Date(holiday.date).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-600">ราคาเพิ่ม</span>
                      <span className="font-bold text-orange-600">x{holiday.priceMultiplier}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
