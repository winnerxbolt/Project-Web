'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FaUserShield, FaSearch } from 'react-icons/fa'

export default function AdminManagementPage() {
  const { user, isAdmin, promoteToAdmin } = useAuth()
  const [searchEmail, setSearchEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user || !isAdmin()) {
    return (
      <main className="min-h-screen bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
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
    <main className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaUserShield className="text-4xl text-ocean-600" />
            <h1 className="text-4xl font-bold text-gray-800">จัดการสิทธิ์ Admin</h1>
          </div>
          <p className="text-gray-600">เพิ่มสิทธิ์ Admin ให้กับผู้ใช้</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มสิทธิ์ Admin</h2>
          
          <form onSubmit={handlePromoteUser} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                อีเมลผู้ใช้
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="example@email.com"
                  required
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                กรอกอีเมลของผู้ใช้ที่ต้องการเพิ่มสิทธิ์ Admin
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 bg-gradient-to-r from-ocean-500 to-primary-500 text-white rounded-lg font-semibold hover:from-ocean-600 hover:to-primary-600 transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
            >
              <FaUserShield />
              {loading ? 'กำลังดำเนินการ...' : 'เพิ่มสิทธิ์ Admin'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">หมายเหตุ:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>เฉพาะ Admin เท่านั้นที่สามารถเพิ่มสิทธิ์ให้ผู้อื่นได้</li>
              <li>ผู้ใช้ที่ได้รับสิทธิ์ Admin จะสามารถเข้าถึง Admin Mode ได้</li>
              <li>ใช้ความระมัดระวังในการให้สิทธิ์ Admin</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
