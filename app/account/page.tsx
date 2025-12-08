'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaCheckCircle,
  FaCalendarAlt,
  FaHeart,
  FaStar,
  FaMoneyBillWave,
  FaCrown,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaChartLine,
  FaTrophy,
  FaBell,
  FaGift,
  FaCamera,
  FaTimes,
} from 'react-icons/fa'
import { containsProfanity } from '@/lib/profanityFilter'

export default function AccountPage() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const router = useRouter()
  
  const [activeSection, setActiveSection] = useState<'dashboard' | 'profile' | 'bookings' | 'wishlist' | 'points' | 'payments' | 'security'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    wishlistCount: 0,
    points: 0,
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setName(user.name)
    setEmail(user.email)
    fetchMemberData()
  }, [user])

  const fetchMemberData = async () => {
    try {
      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings')
      const bookingsData = await bookingsRes.json()
      const userBookings = bookingsData.success
        ? bookingsData.bookings.filter((b: any) => b.email === user?.email)
        : []

      // Fetch wishlist
      const wishlistRes = await fetch(`/api/member/wishlist?userId=${user?.id}`)
      const wishlistData = await wishlistRes.json()

      // Fetch points
      const pointsRes = await fetch(`/api/points?userId=${user?.id}&action=summary`)
      const pointsData = await pointsRes.json()

      const totalSpent = userBookings.reduce((sum: number, b: any) => sum + (b.total || 0), 0)

      setStats({
        totalBookings: userBookings.length,
        totalSpent,
        wishlistCount: Array.isArray(wishlistData) ? wishlistData.length : 0,
        points: pointsData.totalPoints || 0,
        tier: pointsData.tier || 'bronze',
      })

      setRecentBookings(userBookings.slice(0, 5))
      setWishlist(Array.isArray(wishlistData) ? wishlistData : [])
    } catch (error) {
      console.error('Error fetching member data:', error)
    }
  }

  if (!user) {
    return null
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (containsProfanity(name)) {
      setError('ชื่อมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setLoading(false)
      return
    }

    const success = await updateProfile(name, email)
    
    if (success) {
      setMessage('✅ อัปเดตข้อมูลสำเร็จ!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setError('เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
    }
    
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      setLoading(false)
      return
    }

    const success = await changePassword(currentPassword, newPassword)
    
    if (success) {
      setMessage('✅ เปลี่ยนรหัสผ่านสำเร็จ!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setError('รหัสผ่านปัจจุบันไม่ถูกต้อง')
    }
    
    setLoading(false)
  }

  const getTierInfo = (tier: string) => {
    const tiers = {
      bronze: { icon: '🥉', name: 'Bronze', color: 'from-orange-600 to-yellow-700', bg: 'from-orange-50 to-yellow-50' },
      silver: { icon: '🥈', name: 'Silver', color: 'from-gray-400 to-gray-600', bg: 'from-gray-50 to-slate-50' },
      gold: { icon: '🥇', name: 'Gold', color: 'from-yellow-500 to-yellow-600', bg: 'from-yellow-50 to-amber-50' },
      platinum: { icon: '💎', name: 'Platinum', color: 'from-purple-500 to-indigo-600', bg: 'from-purple-50 to-indigo-50' },
    }
    return tiers[tier as keyof typeof tiers] || tiers.bronze
  }

  const tierInfo = getTierInfo(stats.tier)

  const menuItems = [
    { id: 'dashboard', icon: FaChartLine, label: 'ภาพรวม', color: 'text-blue-600', bgHover: 'hover:bg-blue-50' },
    { id: 'profile', icon: FaUser, label: 'ข้อมูลส่วนตัว', color: 'text-purple-600', bgHover: 'hover:bg-purple-50' },
    { id: 'bookings', icon: FaCalendarAlt, label: 'ประวัติการจอง', color: 'text-green-600', bgHover: 'hover:bg-green-50' },
    { id: 'wishlist', icon: FaHeart, label: 'รายการโปรด', color: 'text-pink-600', bgHover: 'hover:bg-pink-50' },
    { id: 'points', icon: FaStar, label: 'คะแนนสะสม', color: 'text-yellow-600', bgHover: 'hover:bg-yellow-50' },
    { id: 'payments', icon: FaMoneyBillWave, label: 'ประวัติการชำระเงิน', color: 'text-emerald-600', bgHover: 'hover:bg-emerald-50' },
    { id: 'security', icon: FaLock, label: 'ความปลอดภัย', color: 'text-red-600', bgHover: 'hover:bg-red-50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-white min-h-screen shadow-2xl transition-all duration-300 fixed z-40`}>
          {/* User Profile Card */}
          {sidebarOpen && (
            <div className={`bg-gradient-to-br ${tierInfo.bg} p-6 border-b-4 border-gradient-to-r ${tierInfo.color}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-50 transition-all">
                    <FaCamera className="text-sm" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>
              <div className={`bg-gradient-to-r ${tierInfo.color} text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tierInfo.icon}</span>
                  <span className="font-bold text-lg">{tierInfo.name}</span>
                </div>
                <span className="font-bold text-2xl">{stats.points}</span>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl mb-2 transition-all group ${
                  activeSection === item.id
                    ? `bg-gradient-to-r ${tierInfo.color} text-white shadow-lg scale-105`
                    : `${item.bgHover} text-gray-700`
                }`}
              >
                <item.icon className={`text-2xl ${activeSection === item.id ? 'text-white' : item.color} group-hover:scale-110 transition-transform`} />
                {sidebarOpen && <span className="font-semibold">{item.label}</span>}
              </button>
            ))}
            
            <div className="border-t my-4"></div>
            
            <Link
              href="/"
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl mb-2 hover:bg-gray-100 text-gray-700 transition-all"
            >
              <FaHome className="text-2xl text-gray-600" />
              {sidebarOpen && <span className="font-semibold">หน้าแรก</span>}
            </Link>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-red-50 text-red-600 transition-all"
            >
              <FaSignOutAlt className="text-2xl" />
              {sidebarOpen && <span className="font-semibold">ออกจากระบบ</span>}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-80' : 'ml-20'} transition-all duration-300 p-8`}>
          {/* Messages */}
          {message && (
            <div className="mb-6 bg-green-50 border-2 border-green-300 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg animate-bounce">
              <FaCheckCircle className="text-2xl" />
              <span className="font-semibold text-lg">{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg">
              <FaTimes className="text-2xl" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">
                สวัสดี, <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">{user.name}</span>! 👋
              </h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border-l-8 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <FaCalendarAlt className="text-5xl text-blue-600" />
                    <div className="text-right">
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">การจอง</p>
                      <p className="text-6xl font-black text-gray-900">{stats.totalBookings}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('bookings')}
                    className="text-blue-600 font-bold hover:text-blue-700 transition-all"
                  >
                    ดูรายละเอียด →
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border-l-8 border-pink-500">
                  <div className="flex items-center justify-between mb-4">
                    <FaHeart className="text-5xl text-pink-600" />
                    <div className="text-right">
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">รายการโปรด</p>
                      <p className="text-6xl font-black text-gray-900">{stats.wishlistCount}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('wishlist')}
                    className="text-pink-600 font-bold hover:text-pink-700 transition-all"
                  >
                    ดูรายละเอียด →
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border-l-8 border-purple-500">
                  <div className="flex items-center justify-between mb-4">
                    <FaStar className="text-5xl text-purple-600" />
                    <div className="text-right">
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">คะแนน</p>
                      <p className="text-5xl font-black text-gray-900">{stats.points}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('points')}
                    className="text-purple-600 font-bold hover:text-purple-700 transition-all"
                  >
                    ใช้คะแนน →
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border-l-8 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <FaMoneyBillWave className="text-5xl text-green-600" />
                    <div className="text-right">
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">ยอดใช้จ่าย</p>
                      <p className="text-4xl font-black text-gray-900">฿{stats.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('payments')}
                    className="text-green-600 font-bold hover:text-green-700 transition-all"
                  >
                    ดูรายละเอียด →
                  </button>
                </div>
              </div>

              {/* Recent Bookings */}
              {recentBookings.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <FaHistory className="text-blue-600" />
                    การจองล่าสุด
                  </h2>
                  <div className="space-y-4">
                    {recentBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl hover:shadow-lg transition-all border-l-4 border-blue-500"
                      >
                        <div>
                          <h3 className="font-black text-xl text-gray-900">{booking.roomName}</h3>
                          <p className="text-gray-600">
                            {new Date(booking.checkIn).toLocaleDateString('th-TH')} - {new Date(booking.checkOut).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-gray-900">฿{booking.total.toLocaleString()}</p>
                          <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status === 'confirmed' ? '✓ ยืนยันแล้ว' :
                             booking.status === 'pending' ? '⏳ รอยืนยัน' :
                             booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">แก้ไขข้อมูลส่วนตัว</h1>
              <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-3xl">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 flex items-center gap-3 text-lg">
                      <FaUser className="text-2xl text-blue-600" />
                      ชื่อ
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900 text-lg font-semibold"
                      placeholder="ชื่อของคุณ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-3 flex items-center gap-3 text-lg">
                      <FaEnvelope className="text-2xl text-blue-600" />
                      อีเมล
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900 text-lg font-semibold"
                      placeholder="อีเมลของคุณ"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-xl hover:shadow-2xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">เปลี่ยนรหัสผ่าน</h1>
              <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-3xl">
                <form onSubmit={handleChangePassword} className="space-y-8">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 flex items-center gap-3 text-lg">
                      <FaLock className="text-2xl text-red-600" />
                      รหัสผ่านปัจจุบัน
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-red-300 focus:border-red-500 text-gray-900 text-lg"
                      placeholder="กรอกรหัสผ่านเดิม"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-3 flex items-center gap-3 text-lg">
                      <FaLock className="text-2xl text-green-600" />
                      รหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-gray-900 text-lg"
                      placeholder="กรอกรหัสผ่านใหม่"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-3 flex items-center gap-3 text-lg">
                      <FaCheckCircle className="text-2xl text-green-600" />
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-gray-900 text-lg"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-black text-xl hover:shadow-2xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'กำลังบันทึก...' : '🔐 เปลี่ยนรหัสผ่าน'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Bookings Section */}
          {activeSection === 'bookings' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">ประวัติการจอง</h1>
              {recentBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
                  <FaCalendarAlt className="text-8xl text-gray-300 mx-auto mb-6" />
                  <p className="text-2xl font-bold text-gray-600">ยังไม่มีประวัติการจอง</p>
                  <Link
                    href="/rooms"
                    className="inline-block mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    เริ่มจองเลย →
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border-l-8 border-blue-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-black text-2xl text-gray-900">{booking.roomName}</h3>
                          <p className="text-gray-600 text-lg">
                            📅 {new Date(booking.checkIn).toLocaleDateString('th-TH')} - {new Date(booking.checkOut).toLocaleDateString('th-TH')}
                          </p>
                          <p className="text-gray-600">👥 {booking.guests} คน</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black text-gray-900">฿{booking.total.toLocaleString()}</p>
                          <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status === 'confirmed' ? '✓ ยืนยันแล้ว' :
                             booking.status === 'pending' ? '⏳ รอยืนยัน' :
                             booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Section */}
          {activeSection === 'wishlist' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">รายการโปรด ❤️</h1>
              {wishlist.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
                  <FaHeart className="text-8xl text-gray-300 mx-auto mb-6" />
                  <p className="text-2xl font-bold text-gray-600">ยังไม่มีรายการโปรด</p>
                  <Link
                    href="/rooms"
                    className="inline-block mt-6 px-8 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    เลือกห้องพัก →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlist.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                    >
                      <h3 className="font-black text-xl text-gray-900 mb-2">{item.roomName}</h3>
                      <p className="text-3xl font-black text-gray-900 mb-4">฿{item.price.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                          จองเลย
                        </button>
                        <button className="px-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Points Section */}
          {activeSection === 'points' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">คะแนนสะสม ⭐</h1>
              <div className={`bg-gradient-to-br ${tierInfo.bg} rounded-3xl p-12 shadow-2xl mb-8 border-8 border-gradient-to-r ${tierInfo.color}`}>
                <div className="text-center">
                  <span className="text-8xl mb-4 inline-block">{tierInfo.icon}</span>
                  <h2 className="text-4xl font-black text-gray-900 mb-2">สมาชิกระดับ {tierInfo.name}</h2>
                  <p className="text-6xl font-black text-gray-900">{stats.points.toLocaleString()} <span className="text-3xl">คะแนน</span></p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-black text-gray-900 mb-4">วิธีรับคะแนน</h3>
                <ul className="space-y-3 text-gray-700 text-lg">
                  <li>✅ จอง 1 คืน = 100 คะแนน</li>
                  <li>✅ เขียนรีวิว = 50 คะแนน</li>
                  <li>✅ แชร์รีวิว = 30 คะแนน</li>
                </ul>
              </div>
            </div>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-8">ประวัติการชำระเงิน 💰</h1>
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-center py-16">
                  <FaMoneyBillWave className="text-8xl text-gray-300 mx-auto mb-6" />
                  <p className="text-2xl font-bold text-gray-600">ยังไม่มีประวัติการชำระเงิน</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
