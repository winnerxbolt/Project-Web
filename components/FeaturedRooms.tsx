'use client'

import { useState, useEffect } from 'react'
import RoomCard from './RoomCard'

export default function FeaturedRooms() {
  const [featuredRooms, setFeaturedRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms')
        const data = await response.json()
        if (data.success) {
          // แสดงบ้านพัก 4 หลังแรก หรือทั้งหมดถ้ามีน้อยกว่า 4
          setFeaturedRooms(data.rooms.slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </section>
    )
  }

  if (featuredRooms.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ห้องพักแนะนำ</h2>
          <p className="text-xl text-gray-600">ห้องพักคุณภาพที่ได้รับความนิยมสูงสุด</p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <a
            href="/rooms"
            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
          >
            ดูห้องพักทั้งหมด
          </a>
        </div>
      </div>
    </section>
  )
}
