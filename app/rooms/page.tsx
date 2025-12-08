'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RoomCard from '@/components/RoomCard'
import { 
  FaFilter, 
  FaSlidersH, 
  FaSearch,
  FaTimes,
  FaSortAmountDown,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUsers,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaParking,
  FaSwimmingPool,
  FaUtensils,
  FaStar,
  FaFire,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa'

export default function RoomsPage() {
  const searchParams = useSearchParams()
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [filteredRooms, setFilteredRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    guests: true,
    amenities: true,
    availability: true
  })

  const [filters, setFilters] = useState({
    searchTerm: '',
    location: searchParams.get('location') || '',
    minPrice: 0,
    maxPrice: 100000,
    guests: parseInt(searchParams.get('guests') || '0'),
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    sortBy: 'recommended',
    availability: 'all',
    hasPromotion: false,
    amenities: {
      wifi: false,
      parking: false,
      pool: false,
      kitchen: false,
      tv: false,
      ac: false
    }
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allRooms])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      if (data.success) {
        setAllRooms(data.rooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    let filtered = [...allRooms]

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(room => 
        room.name?.toLowerCase().includes(term) ||
        room.description?.toLowerCase().includes(term) ||
        room.location?.toLowerCase().includes(term)
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(room => 
        room.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Price filter
    filtered = filtered.filter(room => 
      room.price >= filters.minPrice && room.price <= filters.maxPrice
    )

    // Guests filter
    if (filters.guests > 0) {
      filtered = filtered.filter(room => room.guests >= filters.guests)
    }

    // Availability filter
    if (filters.availability === 'available') {
      filtered = filtered.filter(room => room.available)
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(room => !room.available)
    }

    // Check date availability
    if (filters.checkIn && filters.checkOut) {
      const availableRooms = await Promise.all(
        filtered.map(async (room) => {
          try {
            const res = await fetch(
              `/api/check-availability?roomId=${room.id}&startDate=${filters.checkIn}&endDate=${filters.checkOut}`
            )
            const data = await res.json()
            return data.available ? room : null
          } catch (error) {
            return room
          }
        })
      )
      filtered = availableRooms.filter(room => room !== null)
    }

    // Promotion filter
    if (filters.hasPromotion) {
      filtered = filtered.filter(room => room.promotion && room.promotion.trim() !== '')
    }

    // Amenities filter
    if (filters.amenities.wifi) {
      filtered = filtered.filter(room => 
        room.wifi || room.amenities?.some((a: string) => a.toLowerCase().includes('wifi'))
      )
    }
    if (filters.amenities.parking) {
      filtered = filtered.filter(room => 
        room.parking || room.amenities?.some((a: string) => a.toLowerCase().includes('จอดรถ') || a.toLowerCase().includes('parking'))
      )
    }
    if (filters.amenities.pool) {
      filtered = filtered.filter(room => 
        room.pool || room.amenities?.some((a: string) => a.toLowerCase().includes('สระว่ายน้ำ') || a.toLowerCase().includes('pool'))
      )
    }
    if (filters.amenities.kitchen) {
      filtered = filtered.filter(room => 
        room.kitchen || room.amenities?.some((a: string) => a.toLowerCase().includes('ครัว') || a.toLowerCase().includes('kitchen'))
      )
    }
    if (filters.amenities.tv) {
      filtered = filtered.filter(room => 
        room.amenities?.some((a: string) => a.toLowerCase().includes('tv') || a.toLowerCase().includes('ทีวี'))
      )
    }
    if (filters.amenities.ac) {
      filtered = filtered.filter(room => 
        room.amenities?.some((a: string) => a.toLowerCase().includes('แอร์') || a.toLowerCase().includes('air'))
      )
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'popular':
        filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        break
      case 'recommended':
      default:
        filtered.sort((a, b) => {
          const scoreA = (a.rating || 0) * (a.reviews || 0)
          const scoreB = (b.rating || 0) * (b.reviews || 0)
          return scoreB - scoreA
        })
        break
    }

    setFilteredRooms(filtered)
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      location: '',
      minPrice: 0,
      maxPrice: 100000,
      guests: 0,
      checkIn: '',
      checkOut: '',
      sortBy: 'recommended',
      availability: 'all',
      hasPromotion: false,
      amenities: {
        wifi: false,
        parking: false,
        pool: false,
        kitchen: false,
        tv: false,
        ac: false
      }
    })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const activeFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.location) count++
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++
    if (filters.guests > 0) count++
    if (filters.checkIn && filters.checkOut) count++
    if (filters.availability !== 'all') count++
    if (filters.hasPromotion) count++
    if (Object.values(filters.amenities).some(v => v)) count++
    return count
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pool-light border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Search Section */}
          <div className="mb-8 bg-gradient-to-r from-pool-light to-pool-dark rounded-3xl shadow-2xl p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
              <FaSearch className="animate-pulse" />
              ค้นหาบ้านพัก Poolvilla
            </h1>
            <p className="text-lg mb-6 opacity-90">
              ค้นพบที่พักในฝันของคุณ พร้อมสระว่ายน้ำส่วนตัว
            </p>
            
            {/* Main Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, สถานที่..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl border-2 border-gray-200 focus:border-pool-light focus:ring-2 focus:ring-pool-light/30 outline-none transition"
                  />
                </div>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl border-2 border-gray-200 focus:border-pool-light focus:ring-2 focus:ring-pool-light/30 outline-none transition"
                  />
                </div>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                    min={filters.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl border-2 border-gray-200 focus:border-pool-light focus:ring-2 focus:ring-pool-light/30 outline-none transition"
                  />
                </div>

                <div className="relative">
                  <FaUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filters.guests}
                    onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl border-2 border-gray-200 focus:border-pool-light focus:ring-2 focus:ring-pool-light/30 outline-none transition appearance-none"
                  >
                    <option value="0">จำนวนคน</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} คน</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-gradient-to-r from-pool-light to-pool-dark text-white px-4 py-2 rounded-full">
                  {filteredRooms.length}
                </span>
                <span>บ้านพักที่พบ</span>
              </h2>
              {activeFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-2 font-medium"
                >
                  <FaTimes />
                  ล้างตัวกรอง ({activeFiltersCount()})
                </button>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-6 py-3 bg-white border-2 border-pool-light text-pool-dark rounded-xl font-bold hover:bg-pool-light hover:text-white transition shadow-md"
              >
                <FaFilter />
                ตัวกรอง
                {activeFiltersCount() > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount()}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <FaSortAmountDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pool-dark pointer-events-none" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="pl-12 pr-8 py-3 bg-white border-2 border-pool-light text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition appearance-none cursor-pointer shadow-md min-w-[200px]"
                >
                  <option value="recommended">แนะนำ</option>
                  <option value="price-asc">ราคา: ต่ำ → สูง</option>
                  <option value="price-desc">ราคา: สูง → ต่ำ</option>
                  <option value="rating">คะแนนรีวิว</option>
                  <option value="popular">ความนิยม</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-24 border-2 border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FaSlidersH className="text-pool-light" />
                    ตัวกรอง
                  </h3>
                  {showMobileFilters && (
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between mb-3 text-left"
                  >
                    <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-500" />
                      ช่วงราคา
                    </span>
                    {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  
                  {expandedSections.price && (
                    <div className="space-y-3 pl-8">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">ต่ำสุด</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 text-gray-800 border-2 border-gray-200 rounded-lg focus:border-pool-light focus:ring-2 focus:ring-pool-light/30 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">สูงสุด</label>
                          <input
                            type="number"
                            placeholder="100000"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 100000 })}
                            className="w-full px-3 py-2 text-gray-800 border-2 border-gray-200 rounded-lg focus:border-pool-light focus:ring-2 focus:ring-pool-light/30 outline-none"
                          />
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-600 bg-blue-50 py-2 rounded-lg">
                        ฿{filters.minPrice.toLocaleString()} - ฿{filters.maxPrice.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Guests Filter */}
                <div className="mb-6">
                  <button
                    onClick={() => toggleSection('guests')}
                    className="w-full flex items-center justify-between mb-3 text-left"
                  >
                    <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaUsers className="text-blue-500" />
                      จำนวนผู้เข้าพัก
                    </span>
                    {expandedSections.guests ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  
                  {expandedSections.guests && (
                    <div className="grid grid-cols-5 gap-2 pl-8">
                      {[0, 2, 4, 6, 8].map(num => (
                        <button
                          key={num}
                          onClick={() => setFilters({ ...filters, guests: num })}
                          className={`py-2 px-3 rounded-lg font-bold transition ${
                            filters.guests === num
                              ? 'bg-pool-light text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {num === 0 ? 'ทั้งหมด' : `${num}+`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amenities Filter */}
                <div className="mb-6">
                  <button
                    onClick={() => toggleSection('amenities')}
                    className="w-full flex items-center justify-between mb-3 text-left"
                  >
                    <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      สิ่งอำนวยความสะดวก
                    </span>
                    {expandedSections.amenities ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  
                  {expandedSections.amenities && (
                    <div className="space-y-3 pl-8">
                      {[
                        { key: 'wifi', icon: FaWifi, label: 'WiFi', color: 'text-blue-500' },
                        { key: 'pool', icon: FaSwimmingPool, label: 'สระว่ายน้ำ', color: 'text-cyan-500' },
                        { key: 'parking', icon: FaParking, label: 'ที่จอดรถ', color: 'text-gray-500' },
                        { key: 'kitchen', icon: FaUtensils, label: 'ครัว', color: 'text-orange-500' },
                        { key: 'tv', icon: FaTv, label: 'ทีวี', color: 'text-purple-500' },
                        { key: 'ac', icon: FaSnowflake, label: 'เครื่องปรับอากาศ', color: 'text-blue-400' },
                      ].map(({ key, icon: Icon, label, color }) => (
                        <label
                          key={key}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                            filters.amenities[key as keyof typeof filters.amenities]
                              ? 'bg-blue-50 border-2 border-pool-light'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={filters.amenities[key as keyof typeof filters.amenities]}
                            onChange={(e) => setFilters({
                              ...filters,
                              amenities: { ...filters.amenities, [key]: e.target.checked }
                            })}
                            className="w-5 h-5 text-pool-light rounded focus:ring-pool-light"
                          />
                          <Icon className={`text-xl ${color}`} />
                          <span className="text-gray-800 font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <button
                    onClick={() => toggleSection('availability')}
                    className="w-full flex items-center justify-between mb-3 text-left"
                  >
                    <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-500" />
                      สถานะห้องพัก
                    </span>
                    {expandedSections.availability ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  
                  {expandedSections.availability && (
                    <div className="space-y-2 pl-8">
                      {[
                        { value: 'all', label: 'ทั้งหมด', color: 'bg-gray-500' },
                        { value: 'available', label: 'ว่าง', color: 'bg-green-500' },
                        { value: 'unavailable', label: 'ไม่ว่าง', color: 'bg-red-500' }
                      ].map(({ value, label, color }) => (
                        <button
                          key={value}
                          onClick={() => setFilters({ ...filters, availability: value })}
                          className={`w-full py-3 px-4 rounded-lg font-bold transition flex items-center gap-3 ${
                            filters.availability === value
                              ? 'bg-pool-light text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${color}`}></span>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Special Offers */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl cursor-pointer border-2 border-orange-200 hover:border-orange-300 transition">
                    <input
                      type="checkbox"
                      checked={filters.hasPromotion}
                      onChange={(e) => setFilters({ ...filters, hasPromotion: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <FaFire className="text-2xl text-orange-500 animate-pulse" />
                    <span className="text-gray-800 font-bold">โปรโมชั่นพิเศษ</span>
                  </label>
                </div>

                {/* Clear Filters Button */}
                {activeFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <FaTimes />
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="flex-1">
              {filteredRooms.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบบ้านพักที่ตรงกับเงื่อนไข</h3>
                  <p className="text-gray-600 mb-6">ลองปรับเปลี่ยนตัวกรองหรือค้นหาใหม่อีกครั้ง</p>
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-pool-light text-white rounded-xl font-bold hover:bg-pool-dark transition"
                  >
                    ล้างตัวกรอง
                  </button>
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
