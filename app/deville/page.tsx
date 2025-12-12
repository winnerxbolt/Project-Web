'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import DevilleAccommodations from '@/components/DevilleAccommodations'
import Footer from '@/components/Footer'
import { FaArrowLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function DevillePage() {
  const router = useRouter()
  const [showRawData, setShowRawData] = useState(false)
  const [rawData, setRawData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncStats, setSyncStats] = useState<any>(null)

  const fetchRawData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/deville/accommodations')
      const data = await response.json()
      setRawData(data)
      setShowRawData(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSyncStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/deville/sync')
      const data = await response.json()
      setSyncStats(data.stats)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncNow = async () => {
    if (!confirm('คุณต้องการซิงค์ข้อมูลจาก Deville ไปยัง rooms.json ใช่ไหม?')) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/deville/accommodations?sync=true')
      const data = await response.json()
      if (data.success) {
        alert(`✅ ซิงค์สำเร็จ!\n\nบ้านพักจาก Deville: ${data.devilleRooms} บ้าน\nบ้านพักทั้งหมด: ${data.totalRooms} บ้าน`)
        getSyncStats()
      } else {
        alert('❌ ซิงค์ล้มเหลว: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('❌ เกิดข้อผิดพลาด')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-20">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back Button */}
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition-colors"
              >
                <FaArrowLeft />
                <span>กลับหน้าแอดมิน</span>
              </button>

              <h1 className="text-5xl font-black mb-4">
                🏡 Deville Central Integration
              </h1>
            <p className="text-xl text-blue-100 mb-6">
              บ้านพักจากระบบ Deville Central API - เชื่อมต่อและซิงค์ข้อมูลอัตโนมัติ
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={fetchRawData}
                disabled={loading}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-bold disabled:opacity-50 shadow-lg"
              >
                {loading ? '⏳ กำลังโหลด...' : '📊 ดูข้อมูล Raw JSON'}
              </button>
              
              <button
                onClick={syncNow}
                disabled={loading}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-bold disabled:opacity-50 shadow-lg"
              >
                {loading ? '⏳ กำลังซิงค์...' : '🔄 ซิงค์ไปยัง rooms.json'}
              </button>
              
              <button
                onClick={getSyncStats}
                disabled={loading}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-bold disabled:opacity-50 shadow-lg"
              >
                {loading ? '⏳ กำลังโหลด...' : '📈 ดูสถิติ Sync'}
              </button>
              
              {showRawData && (
                <button
                  onClick={() => setShowRawData(false)}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all font-bold"
                >
                  ✕ ปิด
                </button>
              )}
            </div>

            {/* Sync Stats */}
            {syncStats && (
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">📊 สถิติการซิงค์</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{syncStats.total}</p>
                    <p className="text-sm text-blue-100">บ้านพักทั้งหมด</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{syncStats.local}</p>
                    <p className="text-sm text-blue-100">บ้านพักในระบบ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{syncStats.deville}</p>
                    <p className="text-sm text-blue-100">จาก Deville</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Raw Data Display */}
        {showRawData && rawData && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  📋 Raw API Response
                </h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2))
                    alert('คัดลอกข้อมูลแล้ว!')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm"
                >
                  📋 Copy JSON
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-auto max-h-96 font-mono text-sm">
                <pre>{JSON.stringify(rawData, null, 2)}</pre>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
                <p className="text-sm text-blue-900">
                  <strong>📌 API Endpoint:</strong> <code className="bg-white px-2 py-1 rounded">/api/deville/accommodations</code>
                </p>
                <p className="text-sm text-blue-900">
                  <strong>🔗 Sync Endpoint:</strong> <code className="bg-white px-2 py-1 rounded">/api/deville/accommodations?sync=true</code>
                </p>
                <p className="text-sm text-blue-900">
                  <strong>🔑 Bearer Token:</strong> <code className="bg-white px-2 py-1 rounded text-xs">UmV9Hj4PLz...plVYc</code>
                </p>
                <p className="text-sm text-blue-900">
                  <strong>🌐 External API:</strong> <code className="bg-white px-2 py-1 rounded text-xs">https://deville-central.com/api/houses/accommodations</code>
                </p>
                <p className="text-sm text-blue-900">
                  <strong>💾 Storage:</strong> <code className="bg-white px-2 py-1 rounded">data/rooms.json</code> (ID 1000+)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Accommodations Display */}
        <DevilleAccommodations />
      </div>

      <Footer />
    </main>
    </ProtectedRoute>
  )
}
