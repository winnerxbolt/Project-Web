'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGift,
  FaVideo,
  FaCalendar,
  FaEnvelope,
  FaTimes,
  FaCheck,
  FaTicketAlt,
  FaStar,
  FaCreditCard,
  FaMobileAlt,
  FaBellSlash
} from 'react-icons/fa'

interface Notification {
  id: string
  type: 'booking' | 'status' | 'checkin_reminder' | 'promotion' | 'video' | 'announcement' | 'ticket' | 'loyalty' | 'payment' | 'sms' | 'push'
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channels: string[]
  isRead: boolean
  createdAt: string
  metadata?: {
    reason?: string
    discount?: string
    imageUrl?: string
    actionUrl?: string
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?userId=guest&unreadOnly=false')
      const data = await response.json()
      setNotifications(data.slice(0, 10)) // Show last 10 notifications
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          action: 'markAsRead',
          isRead: true
        })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markAllAsRead',
          userId: 'guest'
        })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FaCalendar className="text-blue-600" />
      case 'ticket':
        return <FaTicketAlt className="text-purple-600" />
      case 'loyalty':
        return <FaStar className="text-yellow-600" />
      case 'payment':
        return <FaCreditCard className="text-green-600" />
      case 'sms':
        return <FaMobileAlt className="text-pink-600" />
      case 'push':
        return <FaBell className="text-indigo-600" />
      case 'promotion':
        return <FaGift className="text-purple-600" />
      case 'video':
        return <FaVideo className="text-red-600" />
      case 'announcement':
        return <FaExclamationTriangle className="text-orange-600" />
      default:
        return <FaBell className="text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500'
      case 'high':
        return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500'
      case 'normal':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500'
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'เมื่อสักครู่'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} วันที่แล้ว`
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative">
      {/* Bell Button - Enhanced */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 text-gray-600 hover:text-gray-900 transition-all hover:bg-gray-100 rounded-full group"
        aria-label="Notifications"
      >
        <FaBell className="text-2xl group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - Enhanced UI */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Header - Improved gradient */}
            <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaBell className="text-xl" />
                  <h3 className="font-bold text-lg">การแจ้งเตือน</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="hover:bg-white/20 p-1 rounded-lg transition-all"
                >
                  <FaTimes />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  <FaCheck className="text-xs" />
                  <span>อ่านทั้งหมด</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
                  <FaBellSlash className="text-6xl mb-4 opacity-50" />
                  <p className="text-lg font-semibold">ไม่มีการแจ้งเตือน</p>
                  <p className="text-sm text-center mt-1">คุณจะเห็นการแจ้งเตือนที่นี่</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-all cursor-pointer ${
                        !notification.isRead ? getPriorityColor(notification.priority) : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id)
                        }
                        if (notification.metadata?.actionUrl) {
                          window.location.href = notification.metadata.actionUrl
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{getTimeAgo(notification.createdAt)}</span>
                            {notification.priority === 'urgent' && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                                ด่วน!
                              </span>
                            )}
                            {notification.priority === 'high' && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                                สำคัญ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Link
                  href="/notifications"
                  className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 hover:bg-white rounded-lg transition-all"
                  onClick={() => setShowDropdown(false)}
                >
                  ดูทั้งหมด →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
