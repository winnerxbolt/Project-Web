'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaStar, FaHome } from 'react-icons/fa'

interface Review {
  id: number
  roomId: number
  roomName: string
  guestName: string
  email?: string
  rating: number
  comment: string
  date: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number>(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews')
        const data = await res.json()
        if (data.success) {
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const filteredReviews = filterRating > 0 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">รีวิวจากผู้เข้าพัก</h1>
            <p className="text-xl text-gray-600">ประสบการณ์จริงจากผู้ที่เคยใช้บริการ</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">กำลังโหลด...</p>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Average Rating */}
                  <div className="text-center md:border-r border-gray-200">
                    <div className="text-6xl font-bold text-primary-600 mb-2">{averageRating}</div>
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-2xl ${
                            i < Math.round(parseFloat(averageRating)) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">จาก {reviews.length} รีวิว</p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {ratingCounts.map(({ rating, count }) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-12">{rating} ดาว</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-yellow-400 h-3 rounded-full transition-all"
                            style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="mb-6 flex items-center gap-4">
                <span className="text-gray-700 font-medium">กรองตามคะแนน:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterRating(0)}
                    className={`px-4 py-2 rounded-lg transition ${
                      filterRating === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(rating)}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-1 ${
                        filterRating === rating
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {rating} <FaStar className="text-yellow-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              {filteredReviews.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
                  <p className="text-gray-500 text-lg">ยังไม่มีรีวิว</p>
                  <p className="text-gray-400 mt-2">ไปเขียนรีวิวหลังจากเข้าพักได้เลย!</p>
                  <Link
                    href="/rooms"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <FaHome />
                    ดูห้องพัก
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{review.guestName}</h3>
                          <p className="text-sm text-primary-600">{review.roomName}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          <span className="font-semibold text-gray-900">{review.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-3">{review.comment}</p>
                      
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
