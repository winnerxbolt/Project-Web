'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FaUserShield, FaSearch, FaCrown, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import Navbar from '@/components/Navbar'
import AdminCard from '@/components/AdminCard'
import AdminButton from '@/components/AdminButton'

export default function AdminManagementPage() {
  const { user, isAdmin, promoteToAdmin } = useAuth()
  const [searchEmail, setSearchEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user || !isAdmin()) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pool-light via-white to-tropical-mint/20 pt-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border-2 border-red-200 shadow-xl">
            <div className="text-6xl mb-6">🚫</div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="text-gray-600 text-lg">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      </main>
    )
  }

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!searchEmail) {
      setError('กรุณากรอกอีเมลผู้ใช้')
      setLoading(false)
      return
    }

    const success = await promoteToAdmin(searchEmail)
    
    if (success) {
      setMessage(`เพิ่มสิทธิ์ Admin ให้กับ ${searchEmail} สำเร็จ!`)
      setSearchEmail('')
      setTimeout(() => setMessage(''), 5000)
    } else {
      setError('ไม่พบผู้ใช้หรือเกิดข้อผิดพลาด')
    }
    
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-pool-light via-white to-tropical-mint/20 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header with gradient */}
          <div className="mb-12 text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-luxury-gold/20 rounded-full blur-3xl animate-float" />
            <div className="absolute top-10 right-1/4 w-24 h-24 bg-pool-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-4 bg-gradient-to-r from-luxury-gold to-luxury-bronze text-white px-6 py-3 rounded-full shadow-luxury">
                <FaCrown className="text-3xl" />
                <span className="text-xl font-bold">Admin Panel</span>
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pool-dark via-pool-blue to-tropical-green mb-4">
                จัดการสิทธิ์ผู้ดูแลระบบ
              </h1>
              <p className="text-xl text-gray-600">เพิ่มหรือจัดการสิทธิ์ Admin ให้กับผู้ใช้งาน</p>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <AdminCard variant="glass" className="mb-6 border-green-300">
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-4xl text-green-600" />
                <div>
                  <h3 className="font-bold text-green-800 text-lg">สำเร็จ!</h3>
                  <p className="text-green-700">{message}</p>
                </div>
              </div>
            </AdminCard>
          )}

          {error && (
            <AdminCard variant="glass" className="mb-6 border-red-300">
              <div className="flex items-center gap-4">
                <FaExclamationTriangle className="text-4xl text-red-600" />
                <div>
                  <h3 className="font-bold text-red-800 text-lg">เกิดข้อผิดพลาด!</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </AdminCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <AdminCard variant="glass" hover={false}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-pool-blue to-pool-dark rounded-xl">
                    <FaUserShield className="text-3xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">เพิ่มสิทธิ์ Admin</h2>
                </div>
                
                <form onSubmit={handlePromoteUser} className="space-y-6">
                  <div>
                    <label className="block text-gray-800 font-bold mb-3 text-lg">
                      🔍 อีเมลผู้ใช้
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full p-4 pl-12 border-2 border-pool-light/50 rounded-2xl focus:ring-4 focus:ring-pool-blue/30 focus:border-pool-blue outline-none transition-all duration-300 text-gray-900 text-lg font-medium"
                        placeholder="example@email.com"
                        required
                      />
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pool-blue text-xl" />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 ml-1">
                      💡 กรอกอีเมลของผู้ใช้ที่ต้องการเพิ่มสิทธิ์ Admin
                    </p>
                  </div>

                  <AdminButton
                    type="submit"
                    variant="luxury"
                    size="lg"
                    fullWidth
                    loading={loading}
                    icon={<FaCrown />}
                  >
                    เพิ่มสิทธิ์ Admin
                  </AdminButton>
                </form>
              </AdminCard>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Current Admin Info */}
              <AdminCard variant="gradient">
                <div className="text-center">
                  <div className="text-5xl mb-3">👑</div>
                  <h3 className="font-bold text-xl mb-2">Admin ปัจจุบัน</h3>
                  <p className="text-white/90 font-medium">{user.name}</p>
                  <p className="text-white/75 text-sm mt-1">{user.email}</p>
                </div>
              </AdminCard>

              {/* Info Box */}
              <AdminCard variant="glass" hover={false}>
                <h3 className="font-bold text-pool-dark mb-4 text-lg flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span>
                  หมายเหตุสำคัญ
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-pool-blue text-lg">✓</span>
                    <span>เฉพาะ Admin เท่านั้นที่สามารถเพิ่มสิทธิ์ให้ผู้อื่นได้</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tropical-green text-lg">✓</span>
                    <span>ผู้ใช้ที่ได้รับสิทธิ์ Admin จะสามารถเข้าถึง Admin Mode ได้</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-luxury-gold text-lg">✓</span>
                    <span>ใช้ความระมัดระวังในการให้สิทธิ์ Admin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 text-lg">⚠</span>
                    <span>Admin มีสิทธิ์เต็มในการจัดการระบบ</span>
                  </li>
                </ul>
              </AdminCard>

              {/* Quick Stats */}
              <AdminCard variant="glass" hover={false}>
                <h3 className="font-bold text-pool-dark mb-4 text-lg flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  สิทธิ์ที่ Admin มี
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: '🏠', text: 'จัดการบ้านพัก', color: 'text-pool-blue' },
                    { icon: '📅', text: 'จัดการการจอง', color: 'text-tropical-green' },
                    { icon: '👥', text: 'จัดการผู้ใช้', color: 'text-luxury-gold' },
                    { icon: '📊', text: 'ดูสถิติและรายงาน', color: 'text-tropical-orange' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                      <span className="text-2xl">{item.icon}</span>
                      <span className={`font-medium ${item.color}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
