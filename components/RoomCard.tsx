'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaBed, FaUsers, FaExpand, FaStar } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'

interface Room {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
  beds: number
  guests: number
  size: number
  rating: number
  reviews: number
  amenities: string[]
  available: boolean
}

export default function RoomCard({ room }: { room: Room }) {
  const { formatPrice, t } = useLanguage()
  const displayImage = (room.images && room.images.length > 0) ? room.images[0] : room.image
  const imageCount = room.images?.length || 1

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
      {/* Room Image */}
      <div className="relative h-48 overflow-hidden group">
        <Image
          src={displayImage}
          alt={room.name}
          fill
          className="object-cover group-hover:scale-110 transition duration-300"
        />
        {/* Image Count Badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
            📷 {imageCount}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {formatPrice(room.price)}{t('rooms.pernight')}
        </div>
        {/* Availability Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
          room.available 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {room.available ? '✓' : '✕'}
        </div>
      </div>

      {/* Room Details */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{room.name}</h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="font-semibold text-gray-900">{room.rating}</span>
          <span className="text-gray-500 text-sm ml-1">({room.reviews} รีวิว)</span>
        </div>

        {/* Room Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <FaBed className="mr-1" />
            <span>{room.beds} เตียง</span>
          </div>
          <div className="flex items-center">
            <FaUsers className="mr-1" />
            <span>{room.guests} คน</span>
          </div>
          <div className="flex items-center">
            <FaExpand className="mr-1" />
            <span>{room.size} ตร.ม.</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Book Button */}
        <Link
          href={`/rooms/${room.id}`}
          className="block w-full text-center py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </div>
  )
}
