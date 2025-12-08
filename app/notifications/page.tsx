'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  FaArrowLeft,
  FaFilter,
  FaTrash,
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

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?userId=guest');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('ยืนยันการลบการแจ้งเตือน?')) return;

    try {
      await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FaCalendar className="text-blue-600 text-3xl" />;
      case 'promotion':
        return <FaGift className="text-purple-600 text-3xl" />;
      case 'video':
        return <FaVideo className="text-red-600 text-3xl" />;
      case 'announcement':
        return <FaExclamationTriangle className="text-orange-600 text-3xl" />;
      case 'checkin_reminder':
        return <FaCalendar className="text-green-600 text-3xl" />;
      case 'status':
        return <FaCheckCircle className="text-blue-600 text-3xl" />;
      default:
        return <FaBell className="text-gray-600 text-3xl" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">
            🚨 เร่งด่วน
          </span>
        );
      case 'high':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">
            ⚠️ สำคัญ
          </span>
        );
      case 'normal':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            📌 ปกติ
          </span>
        );
      case 'low':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
            ℹ️ ทั่วไป
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅 การจอง';
      case 'promotion':
        return '🎉 โปรโมชั่น';
      case 'video':
        return '📹 วิดีโอใหม่';
      case 'announcement':
        return '📢 ประกาศ';
      case 'checkin_reminder':
        return '⏰ เตือนเช็คอิน';
      case 'status':
        return '✅ สถานะ';
      default:
        return '🔔 แจ้งเตือน';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'unread' && !n.isRead) ||
      (filterRead === 'read' && n.isRead);
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดการแจ้งเตือน...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b-4 border-blue-600 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors font-semibold flex items-center gap-2"
          >
            <FaArrowLeft />
            <span>กลับ</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-gray-900">การแจ้งเตือน</h1>
              <p className="text-xl text-gray-600">
                ติดตามข่าวสารและการแจ้งเตือนทั้งหมดของคุณ
              </p>
              {unreadCount > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold">
                  <FaBell className="animate-bounce" />
                  <span>คุณมีการแจ้งเตือนใหม่ {unreadCount} รายการ</span>
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FaCheck />
                <span>ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">ทั้งหมด</p>
                <p className="text-4xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <FaBell className="text-5xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">ยังไม่ได้อ่าน</p>
                <p className="text-4xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <div className="relative">
                <FaBell className="text-5xl text-red-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">อ่านแล้ว</p>
                <p className="text-4xl font-bold text-gray-900">
                  {notifications.length - unreadCount}
                </p>
              </div>
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaFilter className="text-gray-600" />
            <h3 className="font-bold text-xl text-gray-900">กรองการแจ้งเตือน</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ประเภท
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
              >
                <option value="all">ทั้งหมด</option>
                <option value="announcement">📢 ประกาศ</option>
                <option value="promotion">🎉 โปรโมชั่น</option>
                <option value="video">📹 วิดีโอใหม่</option>
                <option value="booking">📅 การจอง</option>
                <option value="status">✅ สถานะ</option>
                <option value="checkin_reminder">⏰ เตือนเช็คอิน</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                สถานะการอ่าน
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
              >
                <option value="all">ทั้งหมด</option>
                <option value="unread">ยังไม่ได้อ่าน</option>
                <option value="read">อ่านแล้ว</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-lg text-center">
              <FaBell className="text-8xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ไม่มีการแจ้งเตือน
              </h3>
              <p className="text-gray-600 text-lg">
                {filterType !== 'all' || filterRead !== 'all'
                  ? 'ไม่พบการแจ้งเตือนที่ตรงตามเงื่อนไข'
                  : 'คุณยังไม่มีการแจ้งเตือนในขณะนี้'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${
                  !notif.isRead ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">{getIcon(notif.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`text-xl font-bold ${
                              !notif.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {notif.title}
                          </h3>
                          {!notif.isRead && (
                            <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                            {getTypeName(notif.type)}
                          </span>
                          {getPriorityBadge(notif.priority)}
                          <span className="text-sm text-gray-500 font-semibold">
                            {new Date(notif.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="ทำเครื่องหมายว่าอ่านแล้ว"
                          >
                            <FaCheck className="text-xl" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-800 text-lg leading-relaxed mb-4">
                      {notif.message}
                    </p>

                    {/* Metadata */}
                    {notif.metadata && (
                      <div className="space-y-2">
                        {notif.metadata.reason && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-700">เหตุผล:</span>
                            <span className="text-gray-600">{notif.metadata.reason}</span>
                          </div>
                        )}
                        {notif.metadata.discount && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-700">ส่วนลด:</span>
                            <span className="text-orange-600 font-bold">
                              {notif.metadata.discount}
                            </span>
                          </div>
                        )}
                        {notif.metadata.actionUrl && (
                          <Link
                            href={notif.metadata.actionUrl}
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                            className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            <span>ดูรายละเอียด</span>
                            <span>→</span>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Channels */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <span className="text-xs text-gray-500 font-semibold">ส่งผ่าน:</span>
                      {notif.channels.includes('web') && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold">
                          🌐 Web
                        </span>
                      )}
                      {notif.channels.includes('email') && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-semibold">
                          📧 Email
                        </span>
                      )}
                      {notif.channels.includes('line') && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-semibold">
                          💬 LINE
                        </span>
                      )}
                      {notif.channels.includes('sms') && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-semibold">
                          📱 SMS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
