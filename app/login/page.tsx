'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import SocialLogin from '@/components/SocialLogin'
import { FaHome } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)
    const success = await login(email.trim(), password)
    setLoading(false)
    
    if (success) {
      router.push('/')
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <section className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        {/* Home Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
          >
            <FaHome className="text-xl" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">อีเมล</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="example@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">รหัสผ่าน</label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="รหัสผ่าน"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-60">
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            <Link href="/register" className="text-sm text-primary-600 hover:underline">ยังไม่เป็นสมาชิก? สมัครเลย</Link>
          </div>
        </form>

        {/* Social Login */}
        <SocialLogin mode="login" onSuccess={() => router.push('/')} className="mt-6" />
      </section>
    </main>
  )
}