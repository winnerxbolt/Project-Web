'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { FaUser, FaLock, FaEnvelope, FaCheckCircle } from 'react-icons/fa'

export default function AccountPage() {
  const { user, updateProfile, changePassword } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!user) {
    router.push('/login')
    return null
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const success = await updateProfile(name, email)
    
    if (success) {
      setMessage('อัปเดตข้อมูลสำเร็จ!')
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
      setMessage('เปลี่ยนรหัสผ่านสำเร็จ!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setError('รหัสผ่านปัจจุบันไม่ถูกต้อง')
    }
    
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ตั้งค่าบัญชี</h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวและความปลอดภัยของคุณ</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-ocean-600 text-ocean-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'password'
                ? 'border-ocean-600 text-ocean-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            เปลี่ยนรหัสผ่าน
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaCheckCircle />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">แก้ไขข้อมูลส่วนตัว</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <FaUser className="text-ocean-600" />
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="ชื่อของคุณ"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-ocean-600" />
                  อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="อีเมลของคุณ"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-ocean-500 to-primary-500 text-white rounded-lg font-semibold hover:from-ocean-600 hover:to-primary-600 transition disabled:opacity-50 shadow-md"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
                <Link
                  href="/"
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">เปลี่ยนรหัสผ่าน</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <FaLock className="text-ocean-600" />
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="รหัสผ่านปัจจุบัน"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <FaLock className="text-ocean-600" />
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="รหัสผ่านใหม่"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <FaLock className="text-ocean-600" />
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-ocean-500 to-primary-500 text-white rounded-lg font-semibold hover:from-ocean-600 hover:to-primary-600 transition disabled:opacity-50 shadow-md"
                >
                  {loading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                </button>
                <Link
                  href="/"
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
