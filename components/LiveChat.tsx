'use client'

import { useState, useEffect, useRef } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaRobot, FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa'
import { SiLine } from 'react-icons/si'

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

interface LiveChatProps {
  userId: string
  userName: string
  userEmail: string
}

export default function LiveChat({ userId, userName, userEmail }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [roomId, setRoomId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout>()

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?userId=${userId}`)
      const data = await response.json()
      setMessages(data)

      if (data.length > 0) {
        setRoomId(data[0].roomId)
        
        // Count unread admin messages
        const unread = data.filter((msg: ChatMessage) => 
          msg.isAdmin && msg.status !== 'read'
        ).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomId || undefined,
          userId,
          userName,
          userEmail,
          message: newMessage,
          isAdmin: false,
        }),
      })

      const data = await response.json()
      
      // Add user message
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
      }

      // Add auto-reply if exists
      if (data.autoReply) {
        setTimeout(() => {
          setMessages((prev) => [...prev, data.autoReply])
        }, 500)
      }

      if (!roomId && data.message) {
        setRoomId(data.message.roomId)
      }

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark messages as read when opening chat
  const markAsRead = async () => {
    if (!roomId) return

    try {
      await fetch(`/api/chat?roomId=${roomId}&action=markAsRead`, {
        method: 'PATCH',
      })
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch initial messages
  useEffect(() => {
    if (userId) {
      fetchMessages()
    }
  }, [userId])

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen) {
      markAsRead()
      pollIntervalRef.current = setInterval(fetchMessages, 3000)
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isOpen])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-6 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group border-4 border-white ring-4 ring-blue-300/50 hover:ring-blue-400"
        style={{
          width: '70px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isOpen ? (
          <FaTimes className="text-3xl" />
        ) : (
          <div className="relative">
            <FaComments className="text-3xl animate-bounce" />
            {unreadCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center animate-pulse border-2 border-white shadow-lg">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed top-[170px] right-6 z-[9998] w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up border-4 border-blue-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <FaComments className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">แชทกับเรา</h3>
                  <p className="text-xs text-white/80">พร้อมให้บริการตลอด 24 ชั่วโมง</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-3">
              <a
                href="https://wa.me/66123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp
              </a>
              <a
                href="https://line.me/ti/p/@poolvilla"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-400 hover:bg-green-500 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
              >
                <SiLine className="text-lg" />
                LINE
              </a>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="font-semibold">ยินดีต้อนรับ!</p>
                <p className="text-sm">มีคำถามอะไรถามเราได้เลยครับ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        msg.isAdmin
                          ? 'bg-white text-gray-800 shadow-md'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      }`}
                    >
                      {msg.isAdmin && (
                        <div className="flex items-center gap-2 mb-1">
                          {msg.userName.includes('ระบบ') ? (
                            <FaRobot className="text-sm text-purple-600" />
                          ) : (
                            <FaUser className="text-sm text-blue-600" />
                          )}
                          <span className="text-xs font-bold text-gray-600">{msg.userName}</span>
                        </div>
                      )}
                      <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-gray-400' : 'text-white/70'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        button:hover .animate-bounce {
          animation: float 1s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
