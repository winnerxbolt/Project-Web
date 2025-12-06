'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RoomCard from '@/components/RoomCard'
import { FaFilter, FaSlidersH } from 'react-icons/fa'

export default function RoomsPage() {
  const searchParams = useSearchParams()
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [filteredRooms, setFilteredRooms] = useState<any[]>([])
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: 0,
    maxPrice: 100000,
    guests: parseInt(searchParams.get('guests') || '0'),
    sortBy: 'price-asc',
    availability: 'all', // all, available, unavailable
    hasDiscount: false, // ราคาพิเศษ
  })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // เรียก auto-checkout ก่อน
        await fetch('/api/auto-checkout')
        
        const response = await fetch('/api/rooms')
        const data = await response.json()
        if (data.success) {
          setAllRooms(data.rooms)
          setFilteredRooms(data.rooms)
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  useEffect(() => {
    let filtered = allRooms.filter((room) => {
      const matchLocation = !filters.location || room.location.includes(filters.location)
      const matchPrice = room.price >= filters.minPrice && room.price <= filters.maxPrice
      const matchGuests = filters.guests === 0 || room.guests >= filters.guests
      
      // Filter by availability
      const matchAvailability = 
        filters.availability === 'all' || 
        (filters.availability === 'available' && room.available) ||
        (filters.availability === 'unavailable' && !room.available)
      
      // Filter by discount (check if room has promotion)
      const matchDiscount = !filters.hasDiscount || (room.promotion && room.promotion.trim() !== '')
      
      return matchLocation && matchPrice && matchGuests && matchAvailability && matchDiscount
    })

    // Sorting
    if (filters.sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    }

    setFilteredRooms(filtered)
  }, [filters, allRooms])

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">บ้านพัก Poolvilla ทั้งหมด</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">พบ {filteredRooms.length} บ้านพัก Poolvilla</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">ว่าง ({allRooms.filter(r => r.available).length})</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-gray-600">ไม่ว่าง ({allRooms.filter(r => !r.available).length})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">ตัวกรอง</h2>
                  <FaSlidersH className="text-primary-600" />
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    สถานที่
                  </label>
                  <input
                    type="text"
                    placeholder="ค้นหาสถานที่..."
                    className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    ช่วงราคา (บาท/คืน)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="ต่ำสุด"
                      className="w-1/2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                    />
                    <input
                      type="number"
                      placeholder="สูงสุด"
                      className="w-1/2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 100000 })}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    จำนวนผู้เข้าพัก
                  </label>
                  <select
                    className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white cursor-pointer"
                    value={filters.guests}
                    onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) })}
                  >
                    <option value="0">ไม่ระบุ</option>
                    <option value="1">1 คน</option>
                    <option value="2">2 คน</option>
                    <option value="3">3 คน</option>
                    <option value="4">4 คน</option>
                    <option value="5">5+ คน</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    สถานะห้องพัก
                  </label>
                  <select
                    className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white cursor-pointer"
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="available">ว่าง</option>
                    <option value="unavailable">ไม่ว่าง</option>
                  </select>
                </div>

                {/* Special Discount Filter */}
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                      checked={filters.hasDiscount}
                      onChange={(e) => setFilters({ ...filters, hasDiscount: e.target.checked })}
                    />
                    <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">🔥</span>
                      ราคาพิเศษเท่านั้น
                    </span>
                  </label>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    เรียงตาม
                  </label>
                  <select
                    className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white cursor-pointer"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  >
                    <option value="price-asc">ราคา: ต่ำไปสูง</option>
                    <option value="price-desc">ราคา: สูงไปต่ำ</option>
                    <option value="rating">คะแนนรีวิวสูงสุด</option>
                  </select>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => setFilters({ location: '', minPrice: 0, maxPrice: 10000, guests: 0, sortBy: 'price-asc', availability: 'all', hasDiscount: false })}
                  className="w-full py-3 text-base font-semibold border-2 border-gray-300 text-gray-800 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  รีเซ็ตตัวกรอง
                </button>
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="lg:w-3/4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full mb-4 py-3 bg-white rounded-lg shadow flex items-center justify-center space-x-2"
              >
                <FaFilter />
                <span>ตัวกรอง</span>
              </button>

              {loading ? (
                <div className="text-center py-16">
                  <p className="text-2xl text-gray-500">กำลังโหลด...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-2xl text-gray-500">ไม่พบห้องพักที่ค้นหา</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
