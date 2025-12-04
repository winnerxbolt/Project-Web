'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import RoomCalendar from '@/components/RoomCalendar'
import { FaCalendarAlt, FaFire, FaTools, FaUmbrellaBeach } from 'react-icons/fa'

interface Room {
  id: number
  name: string
}

interface CalendarDay {
  roomId: number
  date: string
  status: 'available' | 'booked' | 'pending' | 'holiday' | 'maintenance'
  hasSpecialDiscount?: boolean
  note?: string
}

export default function AdminCalendarPage() {
  const { user, isAdmin } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<CalendarDay['status']>('available')
  const [hasDiscount, setHasDiscount] = useState(false)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user || !isAdmin()) {
      window.location.href = '/login'
      return
    }
    fetchRooms()
  }, [user])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      if (data.success) {
        setRooms(data.rooms)
        if (data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const handleUpdateDay = async () => {
    if (!selectedRoom || !selectedDate) {
      setMessage('กรุณาเลือกห้องและวันที่')
      return
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          date: selectedDate,
          status: selectedStatus,
          hasSpecialDiscount: hasDiscount,
          note: note
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessage('✅ อัปเดตสถานะสำเร็จ!')
        // Clear form
        setSelectedDate('')
        setNote('')
        setHasDiscount(false)
        // Refresh calendar
        window.location.reload()
      } else {
        setMessage('❌ เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ เกิดข้อผิดพลาดในการอัปเดต')
      console.error('Error updating calendar:', error)
    }
  }

  const handleBulkUpdate = async () => {
    if (!selectedRoom || !selectedDate) {
      setMessage('กรุณาเลือกห้องและช่วงวันที่')
      return
    }

    const dates = selectedDate.split(' to ')
    if (dates.length !== 2) {
      setMessage('กรุณาเลือกช่วงวันที่ (ใช้ to คั่น)')
      return
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          startDate: dates[0],
          endDate: dates[1],
          status: selectedStatus,
          note: note
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessage(`✅ อัปเดต ${data.updatedDates.length} วันสำเร็จ!`)
        setSelectedDate('')
        setNote('')
        window.location.reload()
      } else {
        setMessage('❌ เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ เกิดข้อผิดพลาดในการอัปเดต')
      console.error('Error bulk updating calendar:', error)
    }
  }

  if (!user || !isAdmin()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600" />
            จัดการปฏิทินจองห้องพัก
          </h1>

          {/* Room Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกห้องพัก
            </label>
            <select
              value={selectedRoom || ''}
              onChange={(e) => setSelectedRoom(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Update Form */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่ (YYYY-MM-DD หรือ YYYY-MM-DD to YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="2024-12-25 หรือ 2024-12-25 to 2024-12-31"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CalendarDay['status'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">ว่าง (Available)</option>
                <option value="booked">ติดจองแล้ว (Booked)</option>
                <option value="pending">จองแล้วแต่ยังไม่โอนเงิน (Pending)</option>
                <option value="holiday">วันหยุดยาว-นักขัตฤกษ์ (Holiday)</option>
                <option value="maintenance">ปรับปรุง-ซ่อมแซม (Maintenance)</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <FaFire className="text-orange-600" />
              <span className="text-sm font-medium text-gray-700">
                ติดสติ๊กเกอร์ราคาพิเศษ (Special Discount)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleUpdateDay}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              อัปเดตวันเดียว
            </button>
            <button
              onClick={handleBulkUpdate}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              อัปเดตหลายวัน (Range)
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Calendar Display */}
        {selectedRoom && (
          <div className="mb-8">
            <RoomCalendar
              roomId={selectedRoom}
              roomName={rooms.find(r => r.id === selectedRoom)?.name || ''}
            />
          </div>
        )}

        {/* Quick Status Icons Guide */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">คำแนะนำการใช้งาน</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-blue-600 mt-1" />
              <div>
                <strong>อัปเดตวันเดียว:</strong> ใส่วันที่ในรูปแบบ 2024-12-25
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-indigo-600 mt-1" />
              <div>
                <strong>อัปเดตหลายวัน:</strong> ใส่ช่วงวันที่ 2024-12-25 to 2024-12-31
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaFire className="text-orange-600 mt-1" />
              <div>
                <strong>สติ๊กเกอร์ลดราคา:</strong> ติ๊กช่องเพื่อแสดงไอคอนไฟ 🔥
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaTools className="text-gray-600 mt-1" />
              <div>
                <strong>Auto Update:</strong> ระบบอัปเดตอัตโนมัติเมื่อ Admin ยืนยันการจอง
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
