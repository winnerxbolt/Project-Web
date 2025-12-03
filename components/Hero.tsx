'use client'

import { useState } from 'react'
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaSearch } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to rooms page with search params
    const params = new URLSearchParams({
      location: searchData.location,
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: searchData.guests,
    })
    router.push(`/rooms?${params.toString()}`)
  }

  return (
    <section className="relative h-screen flex items-center justify-center mt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://img2.pic.in.th/pic/20250727104645_1224da2197.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
          SEARCH POOLVILLA
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12">
          จองง่าย สะดวก รวดเร็ว ด้วยระบบที่ทันสมัย
        </p>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="mr-2 text-ocean-600" />
                สถานที่
              </label>
              <input
                type="text"
                placeholder="กรุงเทพ, ภูเก็ต, เชียงใหม่..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                value={searchData.location}
                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
              />
            </div>

            {/* Check-in */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="mr-2 text-ocean-600" />
                เช็คอิน
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none text-gray-800"
                value={searchData.checkIn}
                onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
              />
            </div>

            {/* Check-out */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="mr-2 text-ocean-600" />
                เช็คเอาท์
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none text-gray-800"
                value={searchData.checkOut}
                onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
              />
            </div>

            {/* Guests */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaUsers className="mr-2 text-ocean-600" />
                ผู้เข้าพัก
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none text-gray-800"
                value={searchData.guests}
                onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
              >
                <option value="1">1 คน</option>
                <option value="2">2 คน</option>
                <option value="3">3 คน</option>
                <option value="4">4 คน</option>
                <option value="5">5+ คน</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-ocean-500 to-primary-500 text-white font-semibold rounded-lg hover:from-ocean-600 hover:to-primary-600 transition flex items-center justify-center mx-auto space-x-2 shadow-lg hover:shadow-xl"
          >
            <FaSearch />
            <span>ค้นหาบ้านพัก Poolvilla</span>
          </button>
        </form>
      </div>
    </section>
  )
}
