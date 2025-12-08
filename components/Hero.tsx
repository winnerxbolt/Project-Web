'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaSearch } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import PoolButton from './PoolButton'

interface Stats {
  totalRooms: number
  totalReviews: number
  totalBookings: number
  averageRating: number
  satisfactionRate: number
}

export default function Hero() {
  const router = useRouter()
  const { t } = useLanguage()
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
  })
  
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    totalReviews: 0,
    totalBookings: 0,
    averageRating: 0,
    satisfactionRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // ดึงข้อมูลสถิติจาก API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    
    // อัพเดทสถิติทุก 5 นาที (ลดการเรียก API)
    const interval = setInterval(fetchStats, 300000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to rooms page with search params
    const params = new URLSearchParams({
      location: searchData.location,
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: searchData.guests,
    })
    router.push(`/rooms?${params.toString()}`)
  }, [searchData, router])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Optimized Background */}
      <div className="absolute inset-0">
        {/* Main Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(https://img2.pic.in.th/pic/20250727104645_1224da2197.jpg)',
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-pool-dark/60 via-pool-blue/40 to-tropical-green/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 pb-20">
        {/* Title with Gradient */}
        <div className="mb-6 space-y-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pool-light to-tropical-mint drop-shadow-2xl animate-float font-display">
            POOLVILLA
          </h1>
          <p className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
            🏝️ PATTAYA 🌊
          </p>
        </div>

        <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
          {t('hero.subtitle')}
        </p>

        {/* Search Box with New Design */}
        <form
          onSubmit={handleSearch}
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-float p-6 md:p-8 max-w-6xl mx-auto border-2 border-white/50 overflow-hidden group"
        >
          {/* Decorative Corner Waves */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-pool-light/30 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-tropical-mint/30 to-transparent rounded-tr-full" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Location */}
            <div className="relative group">
              <label className="flex items-center text-base font-bold text-gray-800 mb-3 gap-2">
                <span className="text-2xl">📍</span>
                {t('rooms.checkin')}
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-pool-blue text-xl" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="w-full pl-12 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-pool-light/50 rounded-2xl focus:ring-4 focus:ring-pool-blue/30 focus:border-pool-blue outline-none transition-all duration-300 hover:border-pool-accent"
                  value={searchData.location}
                  onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="relative">
              <label className="flex items-center text-base font-bold text-gray-800 mb-3 gap-2">
                <span className="text-2xl">📅</span>
                {t('rooms.checkin')}
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-tropical-green text-xl" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-4 text-base text-gray-900 bg-white border-2 border-tropical-mint/50 rounded-2xl focus:ring-4 focus:ring-tropical-green/30 focus:border-tropical-green outline-none transition-all duration-300 hover:border-tropical-mint"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="relative">
              <label className="flex items-center text-base font-bold text-gray-800 mb-3 gap-2">
                <span className="text-2xl">📆</span>
                {t('rooms.checkout')}
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-tropical-orange text-xl" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-4 text-base text-gray-900 bg-white border-2 border-tropical-yellow/50 rounded-2xl focus:ring-4 focus:ring-tropical-orange/30 focus:border-tropical-orange outline-none transition-all duration-300 hover:border-tropical-yellow"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                />
              </div>
            </div>

            {/* Guests */}
            <div className="relative">
              <label className="flex items-center text-base font-bold text-gray-800 mb-3 gap-2">
                <span className="text-2xl">👥</span>
                {t('rooms.guests')}
              </label>
              <div className="relative">
                <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold text-xl" />
                <select
                  className="w-full pl-12 pr-4 py-4 text-base text-gray-900 bg-white border-2 border-luxury-gold/50 rounded-2xl focus:ring-4 focus:ring-luxury-gold/30 focus:border-luxury-gold outline-none transition-all duration-300 hover:border-luxury-gold cursor-pointer appearance-none"
                  value={searchData.guests}
                  onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                >
                  <option value="1">1 {t('rooms.guests')}</option>
                  <option value="2">2 {t('rooms.guests')}</option>
                  <option value="3">3 {t('rooms.guests')}</option>
                  <option value="4">4 {t('rooms.guests')}</option>
                  <option value="5">5 {t('rooms.guests')}</option>
                  <option value="6">6+ {t('rooms.guests')}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <PoolButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon={<FaSearch className="text-2xl" />}
          >
            <span className="text-xl font-bold">🔍 ค้นหาที่พักในฝัน</span>
          </PoolButton>
        </form>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { 
              icon: '🏠', 
              label: 'Pool Villa', 
              value: isLoading ? '...' : `${stats.totalRooms}+`,
              gradient: 'from-pool-blue to-pool-dark'
            },
            { 
              icon: '⭐', 
              label: 'รีวิว 5 ดาว', 
              value: isLoading ? '...' : `${stats.totalReviews}+`,
              gradient: 'from-tropical-green to-tropical-lime'
            },
            { 
              icon: '🎯', 
              label: 'การจอง', 
              value: isLoading ? '...' : `${stats.totalBookings}+`,
              gradient: 'from-tropical-orange to-luxury-gold'
            },
            { 
              icon: '😊', 
              label: 'ลูกค้าพึงพอใจ', 
              value: isLoading ? '...' : `${stats.satisfactionRate}%`,
              gradient: 'from-luxury-gold to-luxury-bronze'
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border-2 border-gray-300 shadow-2xl hover:scale-105 hover:shadow-pool transition-all duration-300 group cursor-pointer"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className={`text-4xl font-black mb-2 ${
                stat.gradient === 'from-pool-blue to-pool-dark' ? 'text-pool-blue' :
                stat.gradient === 'from-tropical-green to-tropical-lime' ? 'text-tropical-green' :
                stat.gradient === 'from-tropical-orange to-luxury-gold' ? 'text-tropical-orange' :
                'text-luxury-gold'
              } ${isLoading ? 'animate-pulse' : ''}`}>
                {stat.value}
              </div>
              <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-2 h-3 bg-white rounded-full animate-wave" />
        </div>
      </div>
    </section>
  )
}
