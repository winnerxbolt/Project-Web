'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaVideo,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBell,
  FaYoutube,
  FaEye,
  FaTag,
  FaArrowLeft,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
  FaSms,
} from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category: 'poolvilla' | 'room_tour' | 'amenities' | 'promotion' | 'other';
  tags: string[];
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  notification?: {
    enabled: boolean;
    type: 'promotion' | 'discount' | 'special_event' | 'new_video';
    reason: string;
    couponCode?: string;
    discount?: string;
    channels: ('web' | 'email' | 'line' | 'sms')[];
  };
}

export default function AdminVideosPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: 'poolvilla' as Video['category'],
    tags: [] as string[],
    tagInput: '',
    isActive: true,
    notification: {
      enabled: false,
      type: 'new_video' as 'promotion' | 'discount' | 'special_event' | 'new_video',
      reason: '',
      couponCode: '',
      discount: '',
      channels: ['web'] as ('web' | 'email' | 'line' | 'sms')[],
    },
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const payload = editingVideo
        ? { ...formData, videoId: editingVideo.id, notifyUsers: formData.notification.enabled }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success(editingVideo ? 'อัพเดทวิดีโอสำเร็จ!' : 'เพิ่มวิดีโอสำเร็จ!');
        setShowModal(false);
        resetForm();
        fetchVideos();
      } else {
        showError('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      category: video.category,
      tags: video.tags,
      tagInput: '',
      isActive: video.isActive,
      notification: {
        enabled: video.notification?.enabled || false,
        type: video.notification?.type || 'new_video',
        reason: video.notification?.reason || '',
        couponCode: video.notification?.couponCode || '',
        discount: video.notification?.discount || '',
        channels: video.notification?.channels || ['web'],
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบวิดีโอ?')) return;

    try {
      const response = await fetch(`/api/videos?videoId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('ลบวิดีโอสำเร็จ!');
        fetchVideos();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showError('เกิดข้อผิดพลาดในการลบวิดีโอ');
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      category: 'poolvilla',
      tags: [],
      tagInput: '',
      isActive: true,
      notification: {
        enabled: false,
        type: 'new_video',
        reason: '',
        couponCode: '',
        discount: '',
        channels: ['web'],
      },
    });
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const toggleChannel = (channel: 'web' | 'email' | 'line' | 'sms') => {
    const current = formData.notification.channels;
    if (current.includes(channel)) {
      setFormData({
        ...formData,
        notification: {
          ...formData.notification,
          channels: current.filter(c => c !== channel),
        },
      });
    } else {
      setFormData({
        ...formData,
        notification: {
          ...formData.notification,
          channels: [...current, channel],
        },
      });
    }
  };

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-white border-b-4 border-red-600 py-8">
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
              <h1 className="text-4xl font-bold mb-2 text-gray-900">จัดการวิดีโอ Poolvilla</h1>
              <p className="text-gray-600">เพิ่ม แก้ไข และจัดการวิดีโอพร้อมระบบแจ้งเตือน</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus /> เพิ่มวิดีโอใหม่
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">วิดีโอทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{videos.length}</p>
              </div>
              <FaVideo className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">เผยแพร่แล้ว</p>
                <p className="text-3xl font-bold text-gray-800">
                  {videos.filter(v => v.isActive).length}
                </p>
              </div>
              <FaToggleOn className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Poolvilla</p>
                <p className="text-3xl font-bold text-gray-800">
                  {videos.filter(v => v.category === 'poolvilla').length}
                </p>
              </div>
              <FaYoutube className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">มีแจ้งเตือน</p>
                <p className="text-3xl font-bold text-gray-800">
                  {videos.filter(v => v.notification?.enabled).length}
                </p>
              </div>
              <FaBell className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex items-center gap-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาวิดีโอ..."
              className="flex-1 px-4 py-2 border-0 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 shadow-lg text-center">
              <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบวิดีโอ</p>
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaYoutube className="text-6xl text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {!video.isActive && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                        ไม่เผยแพร่
                      </span>
                    )}
                    {video.notification?.enabled && (
                      <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                        <FaBell className="text-xs" /> แจ้งเตือน
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Notification Info */}
                  {video.notification?.enabled && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-semibold text-purple-900 mb-1">
                        {video.notification.type === 'promotion' && '🎉 โปรโมชั่น'}
                        {video.notification.type === 'discount' && '💰 ส่วนลด'}
                        {video.notification.type === 'special_event' && '✨ กิจกรรมพิเศษ'}
                        {video.notification.type === 'new_video' && '📹 วิดีโอใหม่'}
                      </p>
                      {video.notification.reason && (
                        <p className="text-xs text-purple-700">{video.notification.reason}</p>
                      )}
                      {video.notification.couponCode && (
                        <p className="text-xs font-bold text-orange-600 mt-1">
                          โค้ด: {video.notification.couponCode}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FaEye />
                      <span>{video.viewCount.toLocaleString()} ครั้ง</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaTag />
                      <span>{video.category}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                      <FaEdit /> แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingVideo ? 'แก้ไขวิดีโอ' : 'เพิ่มวิดีโอใหม่'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อวิดีโอ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น: Pool Villa Luxury Resort Tour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="รายละเอียดเกี่ยวกับวิดีโอ"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  required
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  required
                />
              </div>

              {/* Category & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  >
                    <option value="poolvilla">🏊 Poolvilla</option>
                    <option value="room_tour">🛏️ Room Tour</option>
                    <option value="amenities">🎯 สิ่งอำนวยความสะดวก</option>
                    <option value="promotion">🎉 โปรโมชั่น</option>
                    <option value="other">📹 อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานะ
                  </label>
                  <div className="flex items-center gap-3 h-[42px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                        formData.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {formData.isActive ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                      <span>{formData.isActive ? 'เผยแพร่' : 'ไม่เผยแพร่'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  แท็ก (Tags)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="พิมพ์แท็กและกด Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-800 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notification Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-bold text-gray-900">
                    🔔 ระบบแจ้งเตือน
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        notification: {
                          ...formData.notification,
                          enabled: !formData.notification.enabled,
                        },
                      })
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.notification.enabled
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {formData.notification.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </button>
                </div>

                {formData.notification.enabled && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                    {/* Notification Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ประเภทการแจ้งเตือน
                      </label>
                      <select
                        value={formData.notification.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notification: {
                              ...formData.notification,
                              type: e.target.value as any,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      >
                        <option value="new_video">📹 วิดีโอใหม่</option>
                        <option value="promotion">🎉 โปรโมชั่น</option>
                        <option value="discount">💰 ส่วนลด</option>
                        <option value="special_event">✨ กิจกรรมพิเศษ</option>
                      </select>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        เหตุผล / รายละเอียด
                      </label>
                      <input
                        type="text"
                        value={formData.notification.reason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notification: {
                              ...formData.notification,
                              reason: e.target.value,
                            },
                          })
                        }
                        placeholder="เช่น: เนื่องจากเทศกาลปีใหม่"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      />
                    </div>

                    {/* Coupon & Discount */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสคูปอง
                        </label>
                        <input
                          type="text"
                          value={formData.notification.couponCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notification: {
                                ...formData.notification,
                                couponCode: e.target.value.toUpperCase(),
                              },
                            })
                          }
                          placeholder="SUMMER2024"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ส่วนลด
                        </label>
                        <input
                          type="text"
                          value={formData.notification.discount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notification: {
                                ...formData.notification,
                                discount: e.target.value,
                              },
                            })
                          }
                          placeholder="50%"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Channels */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        ช่องทางการแจ้งเตือน
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => toggleChannel('web')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.notification.channels.includes('web')
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 justify-center font-semibold">
                            🌐 Web
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChannel('email')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.notification.channels.includes('email')
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 justify-center font-semibold">
                            <FaEnvelope /> Email
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChannel('line')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.notification.channels.includes('line')
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 justify-center font-semibold">
                            <SiLine /> LINE
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChannel('sms')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.notification.channels.includes('sms')
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 justify-center font-semibold">
                            <FaSms /> SMS
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {editingVideo ? 'บันทึกการแก้ไข' : 'เพิ่มวิดีโอ'}
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
