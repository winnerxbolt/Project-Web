'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    setLoading(false)
    const data = await res.json()
    if (!res.ok) {
      setError(data?.error || 'เกิดข้อผิดพลาด')
      return
    }
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <section className="max-w-md mx-auto p-6 bg-white rounded shadow">
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

        <h1 className="text-2xl font-semibold text-black mb-4">สมัครสมาชิก</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ" className="w-full p-2 text-black border rounded" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" type="email" className="w-full p-2 text-black border rounded" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" type="password" className="w-full p-2 text-black border rounded" required />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-between">
            <button disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded">
              {loading ? 'กำลังบันทึก...' : 'สมัครสมาชิก'}
            </button>
            <Link href="/login" className="text-sm text-primary-600">เข้าสู่ระบบ</Link>
          </div>
        </form>
      </section>
    </main>
  )
}