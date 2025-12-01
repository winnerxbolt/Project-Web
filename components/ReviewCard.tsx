'use client'

import StarRating from './StarRating'
import { FaUser } from 'react-icons/fa'

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  created_at: string
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <FaUser className="text-primary-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{review.name}</h3>
            <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
      </div>
      
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  )
}
