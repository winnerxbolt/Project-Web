'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaStar, FaCalendar, FaUser, FaPen, FaWifi, FaMapMarkerAlt } from 'react-icons/fa'

interface Review {
  id: string
  customerName: string
  reviewText: string
  date: string
  ratings: {
    overall: number
    cleanliness: number
    staff: number
    amenities: number
    location: number
  }
  villaName: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/reviews')
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      
      const processedReviews = (Array.isArray(data.reviews) ? data.reviews : []).map((review: Review) => ({
        ...review,
        ratings: {
          overall: review.ratings?.overall ?? 0,
          cleanliness: review.ratings?.cleanliness ?? 0,
          staff: review.ratings?.staff ?? 0,
          amenities: review.ratings?.amenities ?? 0,
          location: review.ratings?.location ?? 0
        }
      }))
      
      setReviews(processedReviews)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดรีวิวได้')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดรีวิว...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchReviews}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⭐ รีวิวจากลูกค้า
          </h1>
          <p className="text-gray-600">
            ประสบการณ์จริงจากผู้ใช้บริการ Pool Villa
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/reviews/videos"
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            🎬 ดูวิดีโอรีวิว
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">ยังไม่มีรีวิว</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {review.customerName || 'ไม่ระบุชื่อ'}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FaCalendar className="text-xs" />
                        <span>
                          {review.date ? new Date(review.date).toLocaleDateString('th-TH') : 'ไม่พบวันที่'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.ratings?.overall ?? 0)}
                    <span className="font-bold text-lg text-blue-600">
                      {review.ratings?.overall ?? '-'}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {review.reviewText || 'ไม่มีความคิดเห็น'}
                </p>

                {/* Detailed Ratings */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 flex items-center gap-1">
                      <FaPen className="text-xs" /> ความสะอาด
                    </span>
                    <span className="font-semibold text-blue-600">
                      {review.ratings?.cleanliness ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 flex items-center gap-1">
                      <FaUser className="text-xs" /> พนักงาน
                    </span>
                    <span className="font-semibold text-green-600">
                      {review.ratings?.staff ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 flex items-center gap-1">
                      <FaWifi className="text-xs" /> สิ่งอำนวยความสะดวก
                    </span>
                    <span className="font-semibold text-purple-600">
                      {review.ratings?.amenities ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" /> ทำเลที่ตั้ง
                    </span>
                    <span className="font-semibold text-red-600">
                      {review.ratings?.location ?? '-'}
                    </span>
                  </div>
                </div>

                {/* Villa Name */}
                {review.villaName && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Villa: <span className="font-semibold text-gray-700">{review.villaName}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}