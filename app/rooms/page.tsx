'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RoomCard from '@/components/RoomCard'
import { FaFilter, FaSlidersH } from 'react-icons/fa'

// Sample room data
const allRooms = [
  {
    id: 1,
    name: 'Deluxe Suite',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074',
    beds: 2,
    guests: 4,
    size: 45,
    rating: 4.8,
    reviews: 128,
    amenities: ['WiFi', 'TV', 'แอร์', 'มินิบาร์'],
    location: 'กรุงเทพ',
  },
  {
    id: 2,
    name: 'Executive Room',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070',
    beds: 1,
    guests: 2,
    size: 35,
    rating: 4.6,
    reviews: 95,
    amenities: ['WiFi', 'TV', 'แอร์', 'โต๊ะทำงาน'],
    location: 'กรุงเทพ',
  },
  {
    id: 3,
    name: 'Family Room',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
    beds: 3,
    guests: 6,
    size: 60,
    rating: 4.9,
    reviews: 156,
    amenities: ['WiFi', 'TV', 'แอร์', 'ครัวขนาด', 'เครื่องซักผ้า'],
    location: 'ภูเก็ต',
  },
  {
    id: 4,
    name: 'Standard Room',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070',
    beds: 1,
    guests: 2,
    size: 25,
    rating: 4.4,
    reviews: 73,
    amenities: ['WiFi', 'TV', 'แอร์'],
    location: 'เชียงใหม่',
  },
  {
    id: 5,
    name: 'Presidential Suite',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
    beds: 3,
    guests: 6,
    size: 120,
    rating: 5.0,
    reviews: 89,
    amenities: ['WiFi', 'TV', 'แอร์', 'มินิบาร์', 'ครัว', 'ระเบียง'],
    location: 'ภูเก็ต',
  },
  {
    id: 6,
    name: 'Studio Apartment',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070',
    beds: 1,
    guests: 2,
    size: 30,
    rating: 4.5,
    reviews: 64,
    amenities: ['WiFi', 'TV', 'แอร์', 'ครัวขนาดเล็ก'],
    location: 'กรุงเทพ',
  },
]

export default function RoomsPage() {
  const searchParams = useSearchParams()
  const [filteredRooms, setFilteredRooms] = useState(allRooms)
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: 0,
    maxPrice: 10000,
    guests: parseInt(searchParams.get('guests') || '0'),
    sortBy: 'price-asc',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = allRooms.filter((room) => {
      const matchLocation = !filters.location || room.location.includes(filters.location)
      const matchPrice = room.price >= filters.minPrice && room.price <= filters.maxPrice
      const matchGuests = filters.guests === 0 || room.guests >= filters.guests
      return matchLocation && matchPrice && matchGuests
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
  }, [filters])

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ห้องพักทั้งหมด</h1>
            <p className="text-gray-600">พบ {filteredRooms.length} ห้องพัก</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานที่
                  </label>
                  <input
                    type="text"
                    placeholder="ค้นหาสถานที่..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ช่วงราคา (บาท/คืน)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ต่ำสุด"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                    />
                    <input
                      type="number"
                      placeholder="สูงสุด"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 10000 })}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนผู้เข้าพัก
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เรียงตาม
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                  onClick={() => setFilters({ location: '', minPrice: 0, maxPrice: 10000, guests: 0, sortBy: 'price-asc' })}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
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

              {filteredRooms.length === 0 ? (
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
