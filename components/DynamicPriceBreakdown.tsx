'use client'

import { useState, useEffect } from 'react'
import { FaFire, FaSnowflake, FaCalendar, FaBolt, FaUsers } from 'react-icons/fa'

interface PriceBreakdownProps {
  roomId: number
  checkIn: string
  checkOut: string
  guests: number
  rooms?: number
  onPriceCalculated?: (totalPrice: number) => void
}

export default function DynamicPriceBreakdown({ 
  roomId, 
  checkIn, 
  checkOut, 
  guests, 
  rooms = 1,
  onPriceCalculated 
}: PriceBreakdownProps) {
  const [priceData, setPriceData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (checkIn && checkOut && roomId) {
      fetchPrice()
    }
  }, [roomId, checkIn, checkOut, guests, rooms])

  const fetchPrice = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calculate-dynamic-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          checkIn,
          checkOut,
          guests,
          rooms
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPriceData(data)
        if (onPriceCalculated) {
          onPriceCalculated(data.finalPrice)
        }
      }
    } catch (error) {
      console.error('Error fetching price:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!priceData) {
    return null
  }

  const { breakdown, basePrice, finalPrice, totalNights, appliedRules } = priceData
  const totalSavings = breakdown.totalDiscounts || 0
  const hasSavings = totalSavings > 0
  const hasIncrease = finalPrice > (basePrice * totalNights)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">💰 Price Breakdown</h3>
        <p className="text-purple-100">Powered by Dynamic Pricing AI</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Base Price */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div>
            <p className="text-gray-600">Base Price</p>
            <p className="text-sm text-gray-500">{basePrice.toLocaleString()}฿ × {totalNights} night{totalNights > 1 ? 's' : ''}</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {(basePrice * totalNights).toLocaleString()}฿
          </p>
        </div>

        {/* Applied Rules */}
        {appliedRules && appliedRules.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">📊 Applied Pricing Rules:</p>
            {appliedRules.map((rule: any, idx: number) => (
              <div 
                key={idx} 
                className="flex justify-between items-center text-sm py-2 px-3 rounded-lg"
                style={{ backgroundColor: `${rule.color}15` }}
              >
                <div className="flex items-center gap-2">
                  <span>{rule.description}</span>
                  {rule.percentage && (
                    <span className="text-xs text-gray-500">({rule.percentage > 0 ? '+' : ''}{rule.percentage}%)</span>
                  )}
                </div>
                <span 
                  className="font-semibold"
                  style={{ color: rule.color }}
                >
                  {rule.adjustment > 0 ? '+' : ''}{rule.adjustment.toLocaleString()}฿
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Breakdown Details */}
        <div className="space-y-2 border-t border-gray-200 pt-3">
          {breakdown.demandAdjustment !== 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                {breakdown.demandAdjustment > 0 ? <FaFire className="text-red-500" /> : <FaSnowflake className="text-blue-500" />}
                Demand Adjustment
              </span>
              <span className={breakdown.demandAdjustment > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {breakdown.demandAdjustment > 0 ? '+' : ''}{breakdown.demandAdjustment.toLocaleString()}฿
              </span>
            </div>
          )}

          {breakdown.seasonalAdjustment !== 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <FaCalendar className="text-green-500" />
                Seasonal Adjustment
              </span>
              <span className={breakdown.seasonalAdjustment > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {breakdown.seasonalAdjustment > 0 ? '+' : ''}{breakdown.seasonalAdjustment.toLocaleString()}฿
              </span>
            </div>
          )}

          {breakdown.weekendAdjustment !== 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                🏖️ Weekend Surcharge
              </span>
              <span className="text-red-600 font-semibold">
                +{breakdown.weekendAdjustment.toLocaleString()}฿
              </span>
            </div>
          )}

          {breakdown.earlyBirdDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                ⏰ Early Bird Discount
              </span>
              <span className="text-green-600 font-semibold">
                -{breakdown.earlyBirdDiscount.toLocaleString()}฿
              </span>
            </div>
          )}

          {breakdown.lastMinuteDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <FaBolt className="text-yellow-500" />
                Last Minute Deal
              </span>
              <span className="text-green-600 font-semibold">
                -{breakdown.lastMinuteDiscount.toLocaleString()}฿
              </span>
            </div>
          )}

          {breakdown.groupDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <FaUsers className="text-blue-500" />
                Group Discount
              </span>
              <span className="text-green-600 font-semibold">
                -{breakdown.groupDiscount.toLocaleString()}฿
              </span>
            </div>
          )}

          {breakdown.promoDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                🎁 Promo Code
              </span>
              <span className="text-green-600 font-semibold">
                -{breakdown.promoDiscount.toLocaleString()}฿
              </span>
            </div>
          )}
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center py-2 border-t border-gray-200">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-900">
            {breakdown.subtotal.toLocaleString()}฿
          </span>
        </div>

        {/* VAT */}
        {breakdown.taxes > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">VAT (7%)</span>
            <span className="text-gray-900">
              +{breakdown.taxes.toLocaleString()}฿
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
          <div>
            <p className="text-xl font-bold text-gray-900">Total Price</p>
            {hasSavings && (
              <p className="text-sm text-green-600 font-semibold">
                💰 You save {totalSavings.toLocaleString()}฿!
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">
              {finalPrice.toLocaleString()}฿
            </p>
            <p className="text-sm text-gray-500">
              {Math.round(finalPrice / totalNights).toLocaleString()}฿ per night
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {hasSavings && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold text-lg">
              🎉 Special Deal Alert!
            </p>
            <p className="text-green-600 text-sm mt-1">
              You're saving {Math.round((totalSavings / (basePrice * totalNights)) * 100)}% compared to regular price
            </p>
          </div>
        )}

        {/* High Demand Warning */}
        {hasIncrease && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-4 text-center">
            <p className="text-red-700 font-bold text-lg">
              🔥 High Demand Period
            </p>
            <p className="text-red-600 text-sm mt-1">
              This is a popular time! Book now before prices increase further.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
