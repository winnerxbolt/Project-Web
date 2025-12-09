'use client'

import { useState } from 'react'
import { FaEnvelope, FaCheckCircle, FaSpinner } from 'react-icons/fa'

interface EmailSubscribeFormProps {
  inline?: boolean
  className?: string
}

export default function EmailSubscribeForm({ inline = false, className = '' }: EmailSubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/email/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          tags: ['newsletter'],
          source: 'website',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setSuccess(true)
      setEmail('')
      setName('')

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  if (inline) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="flex-1 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมลของคุณ"
            required
            disabled={loading || success}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || success}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                กำลังส่ง...
              </>
            ) : success ? (
              <>
                <FaCheckCircle />
                สำเร็จ!
              </>
            ) : (
              <>
                <FaEnvelope />
                สมัครรับข่าวสาร
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </form>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-block p-3 bg-white/20 rounded-full mb-4">
          <FaEnvelope className="text-3xl" />
        </div>
        
        <h3 className="text-2xl font-bold mb-2">
          รับข่าวสารและโปรโมชั่นพิเศษ
        </h3>
        <p className="text-purple-100 mb-6">
          สมัครรับ Newsletter เพื่อรับส่วนลดพิเศษและข่าวสารล่าสุดจากเรา
        </p>

        {success ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6">
            <FaCheckCircle className="text-5xl mx-auto mb-3" />
            <h4 className="text-xl font-bold mb-2">สมัครสมาชิกสำเร็จ!</h4>
            <p className="text-purple-100">
              ขอบคุณที่สมัครรับข่าวสาร เราจะส่งโปรโมชั่นพิเศษให้คุณทางอีเมล
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ (ไม่บังคับ)"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none disabled:bg-gray-200"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                required
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none disabled:bg-gray-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    สมัครเลย
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-white/20 backdrop-blur-lg rounded-lg p-3">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <p className="text-xs text-purple-100">
              เราเคารพความเป็นส่วนตัวของคุณ สามารถยกเลิกการรับข่าวสารได้ตลอดเวลา
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
