'use client'

import { useState, useEffect, memo, useCallback } from 'react'
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

interface DynamicPriceInfo {
  finalPrice: number
  basePrice: number
  discount: number
  hasDiscount: boolean
  hasIncrease: boolean
  badges: string[]
}

function RoomCard({ room }: { room: Room }) {
  const { formatPrice, t } = useLanguage()
  const displayImage = (room.images && room.images.length > 0) ? room.images[0] : room.image
  const imageCount = room.images?.length || 1
  
  const [dynamicPrice, setDynamicPrice] = useState<DynamicPriceInfo | null>(null)

  const fetchDynamicPrice = useCallback(async () => {
    try {
      // เช็คว่า Dynamic Pricing เปิดอยู่หรือไม่
      const settingsRes = await fetch('/api/dynamic-pricing-toggle')
      const settingsData = await settingsRes.json()
      
      if (!settingsData.enabled) {
        // ถ้าปิด Dynamic Pricing ให้ใช้ราคาปกติ
        setDynamicPrice({
          finalPrice: room.price,
          basePrice: room.price,
          discount: 0,
          hasDiscount: false,
          hasIncrease: false,
          badges: []
        })
        return
      }
      
      // ถ้าเปิดอยู่ ให้คำนวณราคาปกติ
      const checkIn = new Date()
      checkIn.setDate(checkIn.getDate() + 7) // 7 days from now
      const checkOut = new Date(checkIn)
      checkOut.setDate(checkOut.getDate() + 1) // 1 night

      const response = await fetch('/api/calculate-dynamic-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          guests: 2,
          rooms: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        const pricePerNight = data.finalPrice / data.totalNights
        const discount = ((room.price - pricePerNight) / room.price) * 100
        
        const badges: string[] = []
        if (data.breakdown.earlyBirdDiscount > 0) badges.push('⏰ Early Bird')
        if (data.breakdown.lastMinuteDiscount > 0) badges.push('⚡ Last Minute')
        if (data.breakdown.demandAdjustment < 0) badges.push('📉 Low Demand')
        if (data.breakdown.demandAdjustment > room.price * 0.2) badges.push('🔥 High Demand')

        setDynamicPrice({
          finalPrice: pricePerNight,
          basePrice: room.price,
          discount: Math.round(discount),
          hasDiscount: pricePerNight < room.price,
          hasIncrease: pricePerNight > room.price,
          badges
        })
      }
    } catch (error) {
      console.error('Error fetching dynamic price:', error)
    }
  }, [room.id, room.price])

  useEffect(() => {
    fetchDynamicPrice()
  }, [fetchDynamicPrice])

  const displayPrice = dynamicPrice?.finalPrice || room.price

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
        
        {/* Dynamic Price Badge */}
        <div className="absolute top-4 right-4">
          {dynamicPrice?.hasDiscount && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-1 animate-pulse">
              🎉 ลด {dynamicPrice.discount}%
            </div>
          )}
          {dynamicPrice?.hasIncrease && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-1">
              🔥 High Demand
            </div>
          )}
          <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {formatPrice(displayPrice)}{t('rooms.pernight')}
          </div>
          {dynamicPrice?.hasDiscount && (
            <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-0.5 rounded-full text-center mt-1">
              <span className="line-through">{formatPrice(room.price)}</span>
            </div>
          )}
        </div>

        {/* Special Deal Badges */}
        {dynamicPrice?.badges && dynamicPrice.badges.length > 0 && (
          <div className="absolute top-4 left-4 space-y-1">
            {dynamicPrice.badges.map((badge, idx) => (
              <div key={idx} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                {badge}
              </div>
            ))}
          </div>
        )}
        
        {/* Availability Badge */}
        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
          room.available 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {room.available ? '✓ Available' : '✕ Unavailable'}
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

export default memo(RoomCard)
