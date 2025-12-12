'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHotel, FaMapMarkerAlt, FaBed, FaUsers, FaSpinner, FaStar } from 'react-icons/fa'

interface Room {
  id: number
  name: string
  description: string
  location: string
  price: number
  guests: number
  beds?: number
  bedrooms?: number
  bathrooms?: number
  image?: string
  images?: string[]
  available: boolean
  rating?: number
  reviews?: number
  amenities?: string[]
  devilleId?: string | number
}

export default function DevilleAccommodations() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    // ซิงค์อัตโนมัติเมื่อโหลดหน้า
    fetchAccommodations()
  }, [])

  const fetchAccommodations = async () => {
    try {
      setLoading(true)
      setError('')
      setSyncMessage('')

      // เรียก API พร้อม sync=true เพื่อบันทึกไปยัง rooms.json อัตโนมัติ
      const url = '/api/deville/accommodations?sync=true'
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setRooms(result.data || [])
        if (result.synced) {
          setSyncMessage(`✅ ซิงค์อัตโนมัติสำเร็จ! เพิ่มบ้านพัก ${result.devilleRooms} บ้านเข้าสู่ระบบ Rooms แล้ว`)
          setTimeout(() => setSyncMessage(''), 5000)
        }
      } else {
        setError(result.message || 'ไม่สามารถดึงข้อมูลบ้านพักได้')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600">กำลังโหลดข้อมูลบ้านพัก...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAccommodations()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaHotel className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">ยังไม่มีข้อมูลบ้านพัก</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            🏡 บ้านพักจาก Deville Central
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            บ้านพักคุณภาพจากพันธมิตรของเรา พร้อมจองได้ทันที
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              มีให้เลือก {rooms.length} บ้าน
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
              🔄 ซิงค์อัตโนมัติเข้า Rooms
            </div>
          </div>
          {syncMessage && (
            <div className="mt-4 inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-bold shadow-lg animate-pulse">
              {syncMessage}
            </div>
          )}
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                {room.image || room.images?.[0] ? (
                  <img
                    src={room.image || room.images?.[0]}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-24 h-24 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg></div>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaHotel className="text-6xl text-gray-300" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {room.available && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ✓ ว่าง
                    </div>
                  )}
                  {room.devilleId && (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Deville
                    </div>
                  )}
                </div>

                {/* Rating */}
                {room.rating && (
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="font-bold text-sm">{room.rating}</span>
                    {room.reviews && (
                      <span className="text-gray-600 text-xs">({room.reviews})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {room.name}
                </h3>

                {room.location && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <FaMapMarkerAlt className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{room.location}</span>
                  </div>
                )}

                {room.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>
                )}

                {/* Details */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-blue-600" />
                    <span>{room.guests} คน</span>
                  </div>
                  {(room.beds || room.bedrooms) && (
                    <div className="flex items-center gap-1">
                      <FaBed className="text-purple-600" />
                      <span>{room.beds || room.bedrooms} เตียง</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-end justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">ราคาเริ่มต้น</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      ฿{room.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">ต่อคืน</p>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                    จองเลย →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="text-center mt-12 flex gap-4 justify-center">
          <button
            onClick={fetchAccommodations}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg disabled:opacity-50"
          >
            {loading ? '🔄 กำลังซิงค์...' : '🔄 รีเฟรชและซิงค์ข้อมูล'}
          </button>
          <Link
            href="/rooms"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-lg"
          >
            ดูบ้านพักทั้งหมดใน Rooms →
          </Link>
        </div>
      </div>
    </section>
  )
}
