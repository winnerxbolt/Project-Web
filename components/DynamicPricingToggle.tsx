'use client'

import { useState, useEffect } from 'react'
import { FaBolt, FaSpinner } from 'react-icons/fa'

export default function DynamicPricingToggle() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/dynamic-pricing-toggle')
      const data = await res.json()
      if (data.success) {
        setEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePricing = async () => {
    setUpdating(true)
    try {
      const res = await fetch('/api/dynamic-pricing-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      })
      
      const data = await res.json()
      if (data.success) {
        setEnabled(data.enabled)
        alert(data.message)
      }
    } catch (error) {
      console.error('Error toggling:', error)
      alert('เกิดข้อผิดพลาด')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="px-5 py-4 font-semibold rounded-xl bg-gray-200 flex items-center gap-3 text-gray-500">
        <FaSpinner className="text-2xl animate-spin" />
        <span>กำลังโหลด...</span>
      </div>
    )
  }

  return (
    <button
      onClick={togglePricing}
      disabled={updating}
      className={`px-5 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 hover:shadow-xl hover:scale-105 ${
        enabled
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {updating ? (
        <FaSpinner className="text-2xl animate-spin" />
      ) : (
        <FaBolt className="text-2xl" />
      )}
      <span>
        💰 Dynamic Pricing: {enabled ? '✅ เปิด' : '❌ ปิด'}
      </span>
    </button>
  )
}
