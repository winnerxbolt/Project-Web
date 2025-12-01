'use client'

import { FaStar, FaRegStar } from 'react-icons/fa'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]} 
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
            transition-transform
            ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}
          `}
        >
          {value <= rating ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
    </div>
  )
}
