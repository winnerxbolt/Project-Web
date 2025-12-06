'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaHome } from 'react-icons/fa'

interface Booking {
  id: number
  roomName: string
  guestName: string
  checkIn: string
  checkOut: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  total: number
}

interface Room {
  id: number
  name: string
}

interface CalendarDay {
  date: Date
  bookings: Booking[]
  isCurrentMonth: boolean
}

export default function BookingCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  useEffect(() => {
    loadRooms()
    loadBookings()
  }, [])

  useEffect(() => {
    generateCalendar()
  }, [currentDate, bookings, selectedRoomId])

  const loadRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      
      if (data.success) {
        setRooms(data.rooms || []);
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoomId(data.rooms[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        bookings: getBookingsForDate(date),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        bookings: getBookingsForDate(date),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        bookings: getBookingsForDate(date),
        isCurrentMonth: false
      });
    }

    setCalendarDays(days);
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    // สร้าง date string ในรูปแบบ YYYY-MM-DD โดยใช้ timezone ท้องถิ่น
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    let filteredBookings = bookings.filter(booking => {
      // แปลง booking dates เป็น YYYY-MM-DD
      const checkIn = booking.checkIn.split('T')[0];
      const checkOut = booking.checkOut.split('T')[0];
      return dateStr >= checkIn && dateStr <= checkOut;
    });

    // Filter by selected room if specified
    if (selectedRoomId !== null) {
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      if (selectedRoom) {
        filteredBookings = filteredBookings.filter(b => b.roomName === selectedRoom.name);
      }
    }

    return filteredBookings;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'รอชำระ',
      confirmed: 'ยืนยันแล้ว',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก'
    }
    return labels[status as keyof typeof labels] || status
  }

  const today = new Date().toDateString()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pool-blue/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-luxury-gold/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6 flex gap-4">
          <Link href="/admin/bookings">
            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-all">
              <FaArrowLeft />
              <span className="font-medium">กลับไปจัดการจอง</span>
            </button>
          </Link>
          <Link href="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-all">
              <FaArrowLeft />
              <span className="font-medium">กลับไป Admin</span>
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-4 mb-4 bg-white rounded-3xl px-8 py-6 shadow-2xl border-2 border-pool-blue/20">
            <FaCalendarAlt className="text-5xl text-pool-light" />
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-800">ปฏิทินการจอง</h1>
              <p className="text-gray-600 mt-1">แสดงการจองทั้งหมดในปฏิทิน</p>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={previousMonth}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                <FaChevronLeft className="text-xl" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800">{formatMonthYear()}</h2>
              <button
                onClick={nextMonth}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                <FaChevronRight className="text-xl" />
              </button>
            </div>

            {/* Room Selector */}
            <div className="flex items-center gap-3">
              <FaHome className="text-xl text-pool-light" />
              <select
                value={selectedRoomId || ''}
                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-pool-light focus:outline-none text-gray-800 font-medium bg-white"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">สถานะ:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-gray-700 font-medium">รอชำระ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-700 font-medium">ยืนยันแล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-700 font-medium">เสร็จสิ้น</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-700 font-medium">ยกเลิก</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day, index) => (
              <div key={index} className="text-center font-bold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isToday = day.date.toDateString() === today
              const hasBookings = day.bookings.length > 0

              return (
                <div
                  key={index}
                  onClick={() => hasBookings && setSelectedDay(day)}
                  className={`
                    min-h-[100px] p-2 rounded-xl border-2 transition-all cursor-pointer
                    ${!day.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'}
                    ${isToday ? 'border-pool-light ring-2 ring-pool-light' : 'border-gray-200'}
                    ${hasBookings ? 'hover:shadow-lg hover:border-pool-light' : ''}
                  `}
                >
                  <div className={`text-right text-sm font-bold mb-1 ${
                    isToday ? 'text-pool-dark' : day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </div>

                  {/* Booking dots */}
                  {hasBookings && (
                    <div className="space-y-1">
                      {day.bookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className={`w-full h-2 rounded-full ${getStatusColor(booking.status)}`}
                          title={`${booking.roomName} - ${booking.guestName}`}
                        />
                      ))}
                      {day.bookings.length > 3 && (
                        <div className="text-xs text-gray-600 font-bold text-center">
                          +{day.bookings.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transform animate-scaleIn border-4 border-gray-200">
            <div className="sticky top-0 px-8 py-6 rounded-t-3xl bg-gradient-to-r from-pool-light to-pool-dark">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {formatDate(selectedDay.date)}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                >
                  <FaArrowLeft />
                </button>
              </div>
              <p className="text-white/80 mt-1">
                {selectedDay.bookings.length} รายการจอง
              </p>
            </div>

            <div className="px-8 py-6 space-y-4">
              {selectedDay.bookings.map((booking) => (
                <div key={booking.id} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{booking.roomName}</h4>
                      <p className="text-gray-600">{booking.guestName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Check-in</p>
                      <p className="font-bold text-gray-800">{formatDate(new Date(booking.checkIn))}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Check-out</p>
                      <p className="font-bold text-gray-800">{formatDate(new Date(booking.checkOut))}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ราคารวม</span>
                      <span className="text-xl font-bold text-green-600">{formatPrice(booking.total)}</span>
                    </div>
                  </div>

                  <Link href={`/admin/bookings`}>
                    <button className="mt-3 w-full px-4 py-2 bg-pool-light hover:bg-pool-dark text-white rounded-lg font-medium transition-all">
                      ดูรายละเอียด
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
