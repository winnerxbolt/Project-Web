'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import { FaComments, FaPaperPlane, FaHome } from 'react-icons/fa'

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  created_at: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (rating === 0) {
      setError('กรุณาให้คะแนน')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, rating, comment }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาด')
        return
      }

      setSuccess('ส่งรีวิวสำเร็จ! ขอบคุณสำหรับรีวิวของคุณ')
      
      // Reset form
      setName('')
      setEmail('')
      setRating(0)
      setComment('')

      // Refresh reviews
      fetchReviews()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการส่งรีวิว')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <main className="min-h-screen bg-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-black hover:text-blackfont-medium transition group"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaComments className="text-5xl text-ocean-600" />
            <h1 className="text-4xl font-bold text-gray-800">รีวิวจากลูกค้า</h1>
          </div>
          <p className="text-gray-600 text-lg">แบ่งปันประสบการณ์ของคุณกับเรา</p>
          
          {/* Average Rating */}
          {reviews.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="text-5xl font-bold text-primary-600">{averageRating}</div>
              <div>
                <StarRating rating={parseFloat(averageRating)} readonly size="lg" />
                <p className="text-gray-600 mt-1">จาก {reviews.length} รีวิว</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Review Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">เขียนรีวิว</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">ชื่อ</label>
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
                <label className="block text-gray-700 font-medium mb-2">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  placeholder="อีเมลของคุณ"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">คะแนน</label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">ความคิดเห็น</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-black"
                  rows={5}
                  placeholder="แบ่งปันประสบการณ์ของคุณ..."
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-ocean-500 to-primary-500 text-white py-3 rounded-lg font-semibold hover:from-ocean-600 hover:to-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                <FaPaperPlane />
                {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              รีวิวล่าสุด ({reviews.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">กำลังโหลด...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">ยังไม่มีรีวิว</p>
                <p className="text-gray-400 mt-2">เป็นคนแรกที่เขียนรีวิว!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
