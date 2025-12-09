'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FaArrowLeft, FaInstagram, FaFacebook, FaGoogle, FaLine, FaSave, FaChartBar, FaShare, FaUsers } from 'react-icons/fa'
import type { SocialConfig, SocialStats } from '@/types/social'

export default function SocialManagementPage() {
  const router = useRouter()
  const [config, setConfig] = useState<SocialConfig>({
    facebook: { appId: '', appSecret: '', pageId: '' },
    instagram: { accessToken: '', userId: '' },
    google: { clientId: '', clientSecret: '' },
    line: { channelId: '' }
  })
  const [stats, setStats] = useState<SocialStats | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'stats'>('config')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadConfig()
    loadStats()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/social/config')
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/social/share')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/social/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('บันทึกการตั้งค่าเรียบร้อยแล้ว!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Social Media Management
                </h1>
                <p className="text-gray-600 mt-1">จัดการการเชื่อมต่อ Social Media และดู Analytics</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'config'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaSave />
              ตั้งค่าการเชื่อมต่อ
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaChartBar />
              สถิติและรายงาน
            </button>
          </div>

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Instagram Config */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                    <FaInstagram className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Instagram</h3>
                    <p className="text-sm text-gray-600">เชื่อมต่อ Instagram Business Account</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                    <input
                      type="text"
                      value={config.instagram.accessToken}
                      onChange={(e) => setConfig({
                        ...config,
                        instagram: { ...config.instagram, accessToken: e.target.value }
                      })}
                      placeholder="Instagram Access Token"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                    <input
                      type="text"
                      value={config.instagram.userId}
                      onChange={(e) => setConfig({
                        ...config,
                        instagram: { ...config.instagram, userId: e.target.value }
                      })}
                      placeholder="Instagram User ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Facebook Config */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center">
                    <FaFacebook className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Facebook</h3>
                    <p className="text-sm text-gray-600">เชื่อมต่อ Facebook Page</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                    <input
                      type="text"
                      value={config.facebook.appId}
                      onChange={(e) => setConfig({
                        ...config,
                        facebook: { ...config.facebook, appId: e.target.value }
                      })}
                      placeholder="Facebook App ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">App Secret</label>
                    <input
                      type="password"
                      value={config.facebook.appSecret}
                      onChange={(e) => setConfig({
                        ...config,
                        facebook: { ...config.facebook, appSecret: e.target.value }
                      })}
                      placeholder="Facebook App Secret"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page ID</label>
                    <input
                      type="text"
                      value={config.facebook.pageId}
                      onChange={(e) => setConfig({
                        ...config,
                        facebook: { ...config.facebook, pageId: e.target.value }
                      })}
                      placeholder="Facebook Page ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Google Config */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <FaGoogle className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Google</h3>
                    <p className="text-sm text-gray-600">เชื่อมต่อ Google OAuth</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                    <input
                      type="text"
                      value={config.google.clientId}
                      onChange={(e) => setConfig({
                        ...config,
                        google: { ...config.google, clientId: e.target.value }
                      })}
                      placeholder="Google Client ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                    <input
                      type="password"
                      value={config.google.clientSecret}
                      onChange={(e) => setConfig({
                        ...config,
                        google: { ...config.google, clientSecret: e.target.value }
                      })}
                      placeholder="Google Client Secret"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* LINE Config */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00B900] flex items-center justify-center">
                    <FaLine className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">LINE</h3>
                    <p className="text-sm text-gray-600">เชื่อมต่อ LINE Official Account</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel ID</label>
                  <input
                    type="text"
                    value={config.line.channelId}
                    onChange={(e) => setConfig({
                      ...config,
                      line: { channelId: e.target.value }
                    })}
                    placeholder="LINE Channel ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </button>
              </div>

              {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
                  {message}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaShare className="text-3xl opacity-80" />
                    <span className="text-4xl font-bold">{stats.totalShares}</span>
                  </div>
                  <p className="text-purple-100">Total Shares</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaUsers className="text-3xl opacity-80" />
                    <span className="text-4xl font-bold">{stats.sharesByPlatform.length}</span>
                  </div>
                  <p className="text-pink-100">Platforms Used</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaChartBar className="text-3xl opacity-80" />
                    <span className="text-4xl font-bold">{stats.topSharedRooms.length}</span>
                  </div>
                  <p className="text-blue-100">Shared Rooms</p>
                </div>
              </div>

              {/* Shares by Platform */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Shares by Platform
                </h3>
                <div className="space-y-3">
                  {stats.sharesByPlatform.map((item) => {
                    const percentage = (item.count / stats.totalShares) * 100
                    const icons: any = {
                      facebook: { icon: FaFacebook, color: 'bg-[#1877F2]' },
                      line: { icon: FaLine, color: 'bg-[#00B900]' },
                      twitter: { icon: FaShare, color: 'bg-[#1DA1F2]' },
                      whatsapp: { icon: FaShare, color: 'bg-[#25D366]' },
                      email: { icon: FaShare, color: 'bg-purple-500' }
                    }
                    const Icon = icons[item.platform]?.icon || FaShare
                    const color = icons[item.platform]?.color || 'bg-gray-500'

                    return (
                      <div key={item.platform}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                              <Icon className="text-white text-sm" />
                            </div>
                            <span className="font-medium capitalize">{item.platform}</span>
                          </div>
                          <span className="text-gray-600">{item.count} shares</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Shared Rooms */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Top Shared Rooms
                </h3>
                <div className="space-y-3">
                  {stats.topSharedRooms.slice(0, 5).map((room, index) => (
                    <div key={room.roomId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-yellow-400 to-yellow-600' :
                        index === 1 ? 'from-gray-300 to-gray-500' :
                        index === 2 ? 'from-orange-400 to-orange-600' :
                        'from-purple-400 to-pink-600'
                      } flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{room.roomName}</p>
                        <p className="text-sm text-gray-600">Room ID: {room.roomId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{room.shares}</p>
                        <p className="text-xs text-gray-600">shares</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Shares */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recent Shares
                </h3>
                <div className="space-y-3">
                  {stats.recentShares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium">Room: {share.roomId}</p>
                        <p className="text-sm text-gray-600 capitalize">{share.platform}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(share.timestamp).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
