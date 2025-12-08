'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaBell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaUserShield,
  FaEnvelope,
  FaSms,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface Notification {
  id: string;
  type: 'booking' | 'status' | 'checkin_reminder' | 'promotion' | 'video' | 'announcement';
  title: string;
  message: string;
  recipientType: 'admin' | 'user' | 'all';
  recipientId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('web' | 'email' | 'line' | 'sms')[];
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    type: 'announcement' as Notification['type'],
    title: '',
    message: '',
    recipientType: 'all' as 'admin' | 'user' | 'all',
    recipientId: '',
    priority: 'normal' as Notification['priority'],
    channels: ['web'] as ('web' | 'email' | 'line' | 'sms')[],
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?recipientType=admin');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        success('ส่งการแจ้งเตือนสำเร็จ!');
        setShowModal(false);
        resetForm();
        fetchNotifications();
      } else {
        showError('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบการแจ้งเตือน?')) return;

    try {
      const response = await fetch(`/api/notifications?notificationId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('ลบการแจ้งเตือนสำเร็จ!');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'announcement',
      title: '',
      message: '',
      recipientType: 'all',
      recipientId: '',
      priority: 'normal',
      channels: ['web'],
    });
  };

  const toggleChannel = (channel: 'web' | 'email' | 'line' | 'sms') => {
    const current = formData.channels;
    if (current.includes(channel)) {
      setFormData({ ...formData, channels: current.filter(c => c !== channel) });
    } else {
      setFormData({ ...formData, channels: [...current, channel] });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'promotion': return '🎉';
      case 'booking': return '📅';
      case 'video': return '📹';
      default: return '🔔';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors font-semibold"
          >
            <FaArrowLeft className="inline mr-2" />
            กลับหน้า Admin
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">ระบบแจ้งเตือน</h1>
              <p className="text-gray-600">จัดการการแจ้งเตือนและประกาศ</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus /> สร้างการแจ้งเตือน
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{notifications.length}</p>
              </div>
              <FaBell className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ส่งถึงทุกคน</p>
                <p className="text-3xl font-bold text-gray-800">
                  {notifications.filter(n => n.recipientType === 'all').length}
                </p>
              </div>
              <FaUsers className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ความสำคัญสูง</p>
                <p className="text-3xl font-bold text-gray-800">
                  {notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
                </p>
              </div>
              <FaExclamationTriangle className="text-4xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ประกาศ</p>
                <p className="text-3xl font-bold text-gray-800">
                  {notifications.filter(n => n.type === 'announcement').length}
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                ค้นหา
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาการแจ้งเตือน"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFilter className="inline mr-2" />
                ประเภท
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">ทั้งหมด</option>
                <option value="announcement">ประกาศ</option>
                <option value="promotion">โปรโมชั่น</option>
                <option value="booking">การจอง</option>
                <option value="video">วิดีโอ</option>
                <option value="status">สถานะ</option>
                <option value="checkin_reminder">เตือนเช็คอิน</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบการแจ้งเตือน</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{getTypeIcon(notif.type)}</span>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{notif.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(notif.priority)}`}>
                            {notif.priority === 'urgent' && '🚨 '}
                            {notif.priority === 'high' && '⚠️ '}
                            {notif.priority.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(notif.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{notif.message}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Recipient */}
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                        {notif.recipientType === 'all' && <FaUsers className="text-blue-600" />}
                        {notif.recipientType === 'admin' && <FaUserShield className="text-purple-600" />}
                        <span className="text-sm font-semibold text-gray-700">
                          {notif.recipientType === 'all' && 'ส่งถึงทุกคน'}
                          {notif.recipientType === 'admin' && 'เฉพาะ Admin'}
                          {notif.recipientType === 'user' && 'ผู้ใช้เฉพาะ'}
                        </span>
                      </div>

                      {/* Channels */}
                      <div className="flex items-center gap-2">
                        {notif.channels.includes('web') && (
                          <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold">
                            🌐 Web
                          </div>
                        )}
                        {notif.channels.includes('email') && (
                          <div className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <FaEnvelope /> Email
                          </div>
                        )}
                        {notif.channels.includes('line') && (
                          <div className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <SiLine /> LINE
                          </div>
                        )}
                        {notif.channels.includes('sms') && (
                          <div className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <FaSms /> SMS
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">สร้างการแจ้งเตือนใหม่</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภท <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="announcement">📢 ประกาศทั่วไป</option>
                  <option value="promotion">🎉 โปรโมชั่น</option>
                  <option value="booking">📅 การจอง</option>
                  <option value="video">📹 วิดีโอใหม่</option>
                  <option value="status">✅ สถานะ</option>
                  <option value="checkin_reminder">⏰ เตือนเช็คอิน</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น: โปรโมชั่นพิเศษ! ลด 50%"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="รายละเอียดการแจ้งเตือน"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              {/* Recipient Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ผู้รับ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.recipientType}
                    onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">👥 ส่งถึงทุกคน</option>
                    <option value="user">👤 ผู้ใช้เฉพาะ</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความสำคัญ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="low">🔵 ต่ำ</option>
                    <option value="normal">🟢 ปกติ</option>
                    <option value="high">🟠 สูง</option>
                    <option value="urgent">🔴 เร่งด่วน</option>
                  </select>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ช่องทางการส่ง <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleChannel('web')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.channels.includes('web')
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center font-semibold">
                      🌐 <span>Web / App</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel('email')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.channels.includes('email')
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center font-semibold">
                      <FaEnvelope /> <span>Email</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel('line')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.channels.includes('line')
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center font-semibold">
                      <SiLine /> <span>LINE</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel('sms')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.channels.includes('sms')
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center font-semibold">
                      <FaSms /> <span>SMS</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  ส่งการแจ้งเตือน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  );
}
