'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaStar,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaReply,
  FaExclamationTriangle,
  FaChartBar,
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaBroom,
  FaUserTie,
  FaWifi,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface Review {
  id: string;
  bookingId: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  ratings: {
    overall: number;
    cleanliness: number;
    staff: number;
    amenities: number;
    location: number;
  };
  comment: string;
  images?: string[];
  createdAt: string;
  helpful: number;
  adminReply?: {
    message: string;
    repliedAt: string;
    repliedBy: string;
  };
  reports?: {
    userId: string;
    reason: string;
    reportedAt: string;
  }[];
  isHidden: boolean;
  isVerifiedBooking: boolean;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'reported' | 'hidden'>('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?includeHidden=true');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyMessage.trim()) {
      warning('กรุณาเขียนข้อความตอบกลับ');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          action: 'adminReply',
          message: replyMessage,
          repliedBy: 'Admin', // In production, use actual admin name
        }),
      });

      if (response.ok) {
        success('ตอบกลับรีวิวเรียบร้อย!');
        setShowReplyModal(false);
        setReplyMessage('');
        setSelectedReview(null);
        fetchReviews();
      } else {
        showError('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error replying to review:', error);
      showError('เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentlyHidden: boolean) => {
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action: currentlyHidden ? 'unhide' : 'hide',
        }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('ยืนยันการลบรีวิว? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;

    try {
      await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });
      success('ลบรีวิวเรียบร้อย');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  // Filter reviews
  let filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'reported' && review.reports && review.reports.length > 0) ||
      (filterStatus === 'hidden' && review.isHidden);

    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const stats = {
    total: reviews.length,
    reported: reviews.filter((r) => r.reports && r.reports.length > 0).length,
    hidden: reviews.filter((r) => r.isHidden).length,
    averageRating:
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length).toFixed(1)
        : '0',
  };

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
      <div className="bg-white border-b-4 border-purple-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 font-semibold"
          >
            <FaArrowLeft /> กลับหน้า Admin
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">จัดการรีวิว</h1>
              <p className="text-gray-600">ตอบกลับ ซ่อน และจัดการรีวิวจากลูกค้า</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">รีวิวทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaStar className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ถูกรายงาน</p>
                <p className="text-3xl font-bold text-gray-800">{stats.reported}</p>
              </div>
              <FaExclamationTriangle className="text-4xl text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ถูกซ่อน</p>
                <p className="text-3xl font-bold text-gray-800">{stats.hidden}</p>
              </div>
              <FaEyeSlash className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">คะแนนเฉลี่ย</p>
                <p className="text-3xl font-bold text-gray-800">{stats.averageRating}</p>
              </div>
              <FaChartBar className="text-4xl text-green-500" />
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
                placeholder="ชื่อผู้รีวิว, ห้องพัก, หรือเนื้อหา"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFilter className="inline mr-2" />
                สถานะ
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">ทั้งหมด</option>
                <option value="reported">ถูกรายงาน</option>
                <option value="hidden">ถูกซ่อน</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <p className="text-gray-500 text-lg">ไม่พบรีวิว</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-2xl p-8 shadow-lg ${
                  review.isHidden ? 'border-4 border-red-300' : ''
                } ${review.reports && review.reports.length > 0 ? 'border-4 border-orange-300' : ''}`}
              >
                {/* Status Badges */}
                <div className="flex gap-2 mb-4">
                  {review.isHidden && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                      ถูกซ่อน
                    </span>
                  )}
                  {review.reports && review.reports.length > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                      ถูกรายงาน {review.reports.length} ครั้ง
                    </span>
                  )}
                  {review.adminReply && (
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                      ตอบกลับแล้ว
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Review Content */}
                  <div className="lg:col-span-2">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-gray-800 mb-1">{review.userName}</h3>
                      <p className="text-sm text-gray-500">
                        {review.roomName} • {new Date(review.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          <span className="text-sm">รวม</span>
                        </div>
                        <span className="font-bold">{review.ratings.overall}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaBroom className="text-blue-600" />
                          <span className="text-sm">สะอาด</span>
                        </div>
                        <span className="font-bold">{review.ratings.cleanliness}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-green-600" />
                          <span className="text-sm">พนักงาน</span>
                        </div>
                        <span className="font-bold">{review.ratings.staff}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaWifi className="text-purple-600" />
                          <span className="text-sm">อำนวย</span>
                        </div>
                        <span className="font-bold">{review.ratings.amenities}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image src={image} alt={`Review ${index + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Admin Reply */}
                    {review.adminReply && (
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-gray-800 mb-2">
                          ตอบกลับโดย: {review.adminReply.repliedBy}
                        </p>
                        <p className="text-gray-700">{review.adminReply.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.adminReply.repliedAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    )}

                    {/* Reports */}
                    {review.reports && review.reports.length > 0 && (
                      <div className="mt-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <p className="font-semibold text-gray-800 mb-2">
                          การรายงาน ({review.reports.length})
                        </p>
                        {review.reports.map((report, index) => (
                          <div key={index} className="text-sm text-gray-700 mb-1">
                            • {report.reason} -{' '}
                            {new Date(report.reportedAt).toLocaleDateString('th-TH')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setReplyMessage(review.adminReply?.message || '');
                        setShowReplyModal(true);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FaReply />
                      {review.adminReply ? 'แก้ไขการตอบกลับ' : 'ตอบกลับรีวิว'}
                    </button>

                    <button
                      onClick={() => handleToggleVisibility(review.id, review.isHidden)}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        review.isHidden
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {review.isHidden ? (
                        <>
                          <FaEye />
                          แสดงรีวิว
                        </>
                      ) : (
                        <>
                          <FaEyeSlash />
                          ซ่อนรีวิว
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="w-full px-4 py-3 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <FaTrash />
                      ลบรีวิว
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ตอบกลับรีวิวของ {selectedReview.userName}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">รีวิวต้นฉบับ:</p>
              <p className="text-gray-800">{selectedReview.comment}</p>
            </div>

            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="เขียนข้อความตอบกลับ..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4 text-gray-900"
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                  setSelectedReview(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReply}
                disabled={isSubmitting || !replyMessage.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังส่ง...' : 'ส่งการตอบกลับ'}
              </button>
            </div>
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
