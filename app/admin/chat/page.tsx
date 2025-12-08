'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaComments,
  FaPaperPlane,
  FaSearch,
  FaCheckCircle,
  FaCircle,
  FaArrowLeft,
  FaTrash,
  FaUsers,
  FaClock,
  FaEnvelope,
  FaUser,
} from 'react-icons/fa'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

interface ChatMessage {
  id: string
  roomId: string
  userId: string
  userName: string
  userEmail: string
  message: string
  isAdmin: boolean
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

interface ChatRoom {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: 'active' | 'resolved' | 'waiting'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  createdAt: string
}

export default function AdminChatPage() {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout>()

  // Fetch chat rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/chat?getRooms=true')
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  // Fetch messages for selected room
  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat?roomId=${roomId}`)
      const data = await response.json()
      setMessages(data)

      // Mark as read
      await fetch(`/api/chat?roomId=${roomId}&action=markAsRead`, {
        method: 'PATCH',
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          userId: 'admin',
          userName: 'Admin',
          userEmail: 'admin@poolvilla.com',
          message: newMessage,
          isAdmin: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data.message || data])
        setNewMessage('')
        fetchRooms()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showError('เกิดข้อผิดพลาดในการส่งข้อความ')
    } finally {
      setLoading(false)
    }
  }

  // Delete room
  const deleteRoom = async (roomId: string) => {
    if (!confirm('ยืนยันการลบแชทนี้?')) return

    try {
      const response = await fetch(`/api/chat?roomId=${roomId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        success('ลบแชทสำเร็จ')
        fetchRooms()
        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      showError('เกิดข้อผิดพลาดในการลบแชท')
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms()
  }, [])

  // Poll for updates
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchRooms()
      if (selectedRoom) {
        fetchMessages(selectedRoom.id)
      }
    }, 3000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [selectedRoom])

  // Handle room selection
  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room)
    fetchMessages(room.id)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
    }
  }

  const filteredRooms = rooms.filter((room) =>
    room.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: rooms.length,
    active: rooms.filter((r) => r.unreadCount > 0).length,
    totalUnread: rooms.reduce((sum, r) => sum + r.unreadCount, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <FaArrowLeft />
            <span>กลับหน้าแอดมิน</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-4">
              <FaComments className="text-4xl" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">ระบบแชท Live Chat</h1>
              <p className="text-gray-600 font-medium">จัดการการสนทนากับลูกค้า</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">ห้องแชททั้งหมด</p>
                  <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                </div>
                <FaUsers className="text-4xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">ห้องที่มีข้อความใหม่</p>
                  <p className="text-3xl font-black text-gray-900">{stats.active}</p>
                </div>
                <FaCircle className="text-4xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">ข้อความที่ยังไม่อ่าน</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalUnread}</p>
                </div>
                <FaEnvelope className="text-4xl text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Rooms List */}
            <div className="border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="flex-1 overflow-y-auto">
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FaComments className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p>ยังไม่มีแชท</p>
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => selectRoom(room)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                        selectedRoom?.id === room.id ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                            {room.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{room.userName}</p>
                            <p className="text-xs text-gray-500">{room.userEmail}</p>
                          </div>
                        </div>
                        {room.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">{room.lastMessage}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {formatTime(room.lastMessageTime)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRoom(room.id)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="md:col-span-2 flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {selectedRoom.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{selectedRoom.userName}</p>
                        <p className="text-sm text-white/80">{selectedRoom.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p>ยังไม่มีข้อความ</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                msg.isAdmin
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-white text-gray-800 shadow-md'
                              }`}
                            >
                              {!msg.isAdmin && (
                                <div className="flex items-center gap-2 mb-1">
                                  <FaUser className="text-sm text-blue-600" />
                                  <span className="text-xs font-bold text-gray-600">{msg.userName}</span>
                                </div>
                              )}
                              <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                              <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                        disabled={loading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaPaperPlane />
                        ส่ง
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FaComments className="text-8xl text-gray-200 mx-auto mb-4" />
                    <p className="text-lg font-semibold">เลือกห้องแชทเพื่อเริ่มสนทนา</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}
