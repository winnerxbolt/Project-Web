'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import SocialLogin from '@/components/SocialLogin'
import { FaHome, FaClock } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isDelayed, setIsDelayed] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1)
        if (remainingSeconds - 1 === 0) {
          setIsDelayed(false)
          setError('')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [remainingSeconds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (isDelayed && remainingSeconds > 0) {
      setError(`กรุณารอ ${remainingSeconds} วินาที ก่อนลองอีกครั้ง`)
      return
    }
    
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)
    const success = await login(email.trim(), password)
    setLoading(false)
    
    if (success) {
      setRemainingSeconds(0)
      setIsDelayed(false)
      router.push('/')
    } else {
      // ตรวจสอบว่ามี delay หรือไม่
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (response.status === 429 && data.remainingSeconds) {
          setRemainingSeconds(data.remainingSeconds)
          setIsDelayed(true)
          setError(`❌ รหัสผ่านไม่ถูกต้อง กรุณารอ ${data.remainingSeconds} วินาที ก่อนลองอีกครั้ง`)
        } else {
          setRemainingSeconds(30)
          setIsDelayed(true)
          setError('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณารอ 30 วินาที ก่อนลองอีกครั้ง')
        }
      } catch (err) {
        setRemainingSeconds(30)
        setIsDelayed(true)
        setError('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณารอ 30 วินาที ก่อนลองอีกครั้ง')
      }
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
              disabled={isDelayed && remainingSeconds > 0}
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
              disabled={isDelayed && remainingSeconds > 0}
            />
          </div>

          {/* Countdown Timer */}
          {isDelayed && remainingSeconds > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <FaClock className="text-red-600 text-xl animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">กรุณารอก่อนลองอีกครั้ง</p>
                <p className="text-xs text-red-600">เหลือเวลา: <span className="font-bold text-lg">{remainingSeconds}</span> วินาที</p>
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

          <div className="flex items-center justify-between">
            <button 
              type="submit" 
              disabled={loading || (isDelayed && remainingSeconds > 0)} 
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : isDelayed && remainingSeconds > 0 ? `รอ ${remainingSeconds}s` : 'เข้าสู่ระบบ'}
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