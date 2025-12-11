'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  FaLine,
  FaArrowLeft,
  FaCog,
  FaUsers,
  FaEnvelope,
  FaSave,
  FaSync,
  FaBroadcastTower,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa'

interface LineSettings {
  enabled: boolean
  channelAccessToken: string
  channelSecret: string
  webhookUrl: string
  autoReply: boolean
  notificationTypes: {
    booking: boolean
    payment: boolean
    checkin: boolean
    checkout: boolean
    promotion: boolean
    reminder: boolean
  }
}

export default function LineAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'messages' | 'broadcast'>('settings')

  const [settings, setSettings] = useState<LineSettings>({
    enabled: false,
    channelAccessToken: '',
    channelSecret: '',
    webhookUrl: '',
    autoReply: true,
    notificationTypes: {
      booking: true,
      payment: true,
      checkin: true,
      checkout: true,
      promotion: true,
      reminder: true
    }
  })

  const [users, setUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [broadcastMessage, setBroadcastMessage] = useState('')

  useEffect(() => {
    loadSettings()
    loadUsers()
    loadMessages()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/line/settings')
      const data = await response.json()
      if (data.enabled !== undefined) {
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/line/users')
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/line/send?limit=50')
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/line/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ บันทึกการตั้งค่าสำเร็จ')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('ไม่สามารถบันทึกการตั้งค่าได้')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/line/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelAccessToken: settings.channelAccessToken
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ การเชื่อมต่อ LINE สำเร็จ!')
      } else {
        setError(data.error || 'การเชื่อมต่อล้มเหลว')
      }
    } catch (error) {
      setError('ไม่สามารถทดสอบการเชื่อมต่อได้')
    } finally {
      setTesting(false)
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      setError('กรุณาใส่ข้อความที่ต้องการส่ง')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/line/send', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMessage,
          type: 'text'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ส่งข้อความถึง ${data.results.success} คน`)
        setBroadcastMessage('')
        loadMessages()
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('ไม่สามารถส่งข้อความได้')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FaArrowLeft />
              <span>กลับหน้าแอดมิน</span>
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl">
                  <FaLine className="text-white text-4xl" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600">
                    LINE Notification
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">จัดการการแจ้งเตือนผ่าน LINE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl text-green-800 font-bold shadow-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl text-red-800 font-bold shadow-lg">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-tl-2xl'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaCog className="inline mr-2" />
                การตั้งค่า
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaUsers className="inline mr-2" />
                ผู้ใช้ ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaHistory className="inline mr-2" />
                ประวัติ ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab('broadcast')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'broadcast'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-tr-2xl'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaBroadcastTower className="inline mr-2" />
                ส่งข้อความ
              </button>
            </div>
          </div>

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaCog className="text-green-500" />
                การตั้งค่า LINE
              </h2>

              <div className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-bold text-gray-900">เปิดใช้งาน LINE Notification</h3>
                    <p className="text-sm text-gray-600">เปิด/ปิดการส่งการแจ้งเตือนผ่าน LINE</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      settings.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Channel Access Token */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Channel Access Token *
                  </label>
                  <input
                    type="password"
                    value={settings.channelAccessToken}
                    onChange={(e) => setSettings(prev => ({ ...prev, channelAccessToken: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500"
                    placeholder="กรอก Channel Access Token จาก LINE Developers"
                  />
                </div>

                {/* Channel Secret */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Channel Secret *
                  </label>
                  <input
                    type="password"
                    value={settings.channelSecret}
                    onChange={(e) => setSettings(prev => ({ ...prev, channelSecret: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500"
                    placeholder="กรอก Channel Secret จาก LINE Developers"
                  />
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/line/webhook`}
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/line/webhook`)
                        setMessage('✅ คัดลอก Webhook URL แล้ว')
                        setTimeout(() => setMessage(''), 2000)
                      }}
                      className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold"
                    >
                      คัดลอก
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    นำ URL นี้ไปใส่ใน LINE Developers Console → Messaging API → Webhook URL
                  </p>
                </div>

                {/* Auto Reply */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-bold text-gray-900">Auto Reply</h3>
                    <p className="text-sm text-gray-600">ตอบกลับอัตโนมัติเมื่อมีข้อความเข้ามา</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoReply: !prev.autoReply }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      settings.autoReply ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.autoReply ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Notification Types */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">ประเภทการแจ้งเตือน</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(settings.notificationTypes).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() =>
                            setSettings(prev => ({
                              ...prev,
                              notificationTypes: {
                                ...prev.notificationTypes,
                                [key]: !value
                              }
                            }))
                          }
                          className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                        />
                        <span className="font-semibold text-gray-700 capitalize">
                          {key === 'booking' && '📋 การจอง'}
                          {key === 'payment' && '💰 การชำระเงิน'}
                          {key === 'checkin' && '🏖️ เช็คอิน'}
                          {key === 'checkout' && '👋 เช็คเอาท์'}
                          {key === 'promotion' && '🎁 โปรโมชั่น'}
                          {key === 'reminder' && '⏰ การแจ้งเตือน'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    <FaSave />
                    {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={testing || !settings.channelAccessToken}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    <FaSync className={testing ? 'animate-spin' : ''} />
                    {testing ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaUsers className="text-green-500" />
                ผู้ใช้ LINE ({users.length})
              </h2>

              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaUsers className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีผู้ใช้เพิ่มบอทเป็นเพื่อน</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {user.pictureUrl && (
                        <img
                          src={user.pictureUrl}
                          alt={user.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{user.displayName}</h3>
                        <p className="text-sm text-gray-600">
                          {user.statusMessage || 'ไม่มีสถานะ'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          เพิ่มเมื่อ: {new Date(user.registeredAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      {user.isBlocked && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                          ถูกบล็อก
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaHistory className="text-green-500" />
                ประวัติการส่งข้อความ ({messages.length})
              </h2>

              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaEnvelope className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีประวัติการส่งข้อความ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {msg.status === 'sent' ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaExclamationCircle className="text-red-500" />
                          )}
                          <span className="font-bold text-gray-900">
                            {msg.type === 'text' ? '📝 ข้อความ' : msg.type === 'flex' ? '📊 Flex Message' : '🖼️ รูปภาพ'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(msg.sentAt || msg.createdAt).toLocaleString('th-TH')}
                        </span>
                      </div>
                      {msg.message && (
                        <p className="text-gray-700 text-sm">{msg.message}</p>
                      )}
                      {msg.error && (
                        <p className="text-red-600 text-sm mt-2">Error: {msg.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Broadcast Tab */}
          {activeTab === 'broadcast' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaBroadcastTower className="text-green-500" />
                ส่งข้อความถึงทุกคน
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    ข้อความ
                  </label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500"
                    placeholder="พิมพ์ข้อความที่ต้องการส่งถึงทุกคน..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    จะส่งถึง {users.filter(u => !u.isBlocked).length} คน (ยกเว้นผู้ที่บล็อก)
                  </p>
                </div>

                <button
                  onClick={handleBroadcast}
                  disabled={saving || !broadcastMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
                >
                  <FaBroadcastTower />
                  {saving ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
