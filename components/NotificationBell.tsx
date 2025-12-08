'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'react-icons/fa';

interface Notification {
  id: string;
  type: 'booking' | 'status' | 'checkin_reminder' | 'promotion' | 'video' | 'announcement';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: string[];
  isRead: boolean;
  createdAt: string;
  metadata?: {
    reason?: string;
    discount?: string;
    imageUrl?: string;
    actionUrl?: string;
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?userId=guest&unreadOnly=false');
      const data = await response.json();
      setNotifications(data.slice(0, 10)); // Show last 10 notifications
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          action: 'markAsRead',
          isRead: true,
        }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markAllAsRead',
          userId: 'guest',
        }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FaCalendar className="text-blue-600" />;
      case 'promotion':
        return <FaGift className="text-purple-600" />;
      case 'video':
        return <FaVideo className="text-red-600" />;
      case 'announcement':
        return <FaExclamationTriangle className="text-orange-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'high':
        return 'bg-orange-50 border-l-4 border-orange-500';
      case 'normal':
        return 'bg-blue-50 border-l-4 border-blue-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col border-2 border-gray-200">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBell className="text-xl" />
                  <h3 className="font-bold text-lg">การแจ้งเตือน</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-2 text-sm text-white/90 hover:text-white flex items-center gap-1"
                >
                  <FaCheck className="text-xs" />
                  <span>ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FaBell className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-blue-50' : ''
                      } ${getPriorityColor(notif.priority)}`}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        if (notif.metadata?.actionUrl) {
                          window.location.href = notif.metadata.actionUrl;
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-bold text-sm ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notif.createdAt).toLocaleDateString('th-TH', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {notif.priority === 'urgent' && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                                🚨 ด่วน
                              </span>
                            )}
                            {notif.priority === 'high' && (
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                                ⚠️ สำคัญ
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
              <div className="p-3 border-t bg-gray-50 rounded-b-2xl">
                <Link
                  href="/notifications"
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  onClick={() => setShowDropdown(false)}
                >
                  ดูการแจ้งเตือนทั้งหมด →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
