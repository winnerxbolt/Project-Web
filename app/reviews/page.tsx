'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  FaStar,
  FaThumbsUp,
  FaFlag,
  FaTimes,
  FaFilter,
  FaChevronDown,
  FaCheckCircle,
  FaUserCircle,
  FaBroom,
  FaUserTie,
  FaWifi,
  FaMapMarkerAlt,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
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
  reports?: any[];
  isHidden: boolean;
  isVerifiedBooking: boolean;
}

export default function ReviewsPage() {
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      
      // Handle both array response and object with reviews property
      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action: 'incrementHelpful',
        }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReport = async () => {
    if (!selectedReview || !reportReason.trim()) {
      warning('กรุณาระบุเหตุผล');
      return;
    }

    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          action: 'report',
          userId: 'guest', // In production, use actual user ID
          reason: reportReason,
        }),
      });
      success('รายงานรีวิวเรียบร้อยแล้ว');
      setShowReportModal(false);
      setReportReason('');
      setSelectedReview(null);
    } catch (error) {
      console.error('Error reporting review:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  const openImageGallery = (images: string[], index: number) => {
    setSelectedImages(images);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  // Filter and sort reviews
  let filteredReviews = Array.isArray(reviews) ? reviews : [];

  if (filterRating > 0) {
    filteredReviews = filteredReviews.filter(
      (r) => Math.round(r.ratings.overall) === filterRating
    );
  }

  // Sort reviews
  filteredReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'helpful') {
      return b.helpful - a.helpful;
    } else if (sortBy === 'rating') {
      return b.ratings.overall - a.ratings.overall;
    }
    return 0;
  });

  // Calculate stats
  const validOverall = reviews.filter(r => r.ratings && typeof r.ratings.overall === 'number');
  const averageOverall =
    validOverall.length > 0
      ? (validOverall.reduce((sum, r) => sum + r.ratings.overall, 0) / validOverall.length).toFixed(1)
      : '0';

  const validCleanliness = reviews.filter(r => r.ratings && typeof r.ratings.cleanliness === 'number');
  const averageCleanliness =
    validCleanliness.length > 0
      ? (validCleanliness.reduce((sum, r) => sum + r.ratings.cleanliness, 0) / validCleanliness.length).toFixed(1)
      : '0';

  const validStaff = reviews.filter(r => r.ratings && typeof r.ratings.staff === 'number');
  const averageStaff =
    validStaff.length > 0
      ? (validStaff.reduce((sum, r) => sum + r.ratings.staff, 0) / validStaff.length).toFixed(1)
      : '0';

  const validAmenities = reviews.filter(r => r.ratings && typeof r.ratings.amenities === 'number');
  const averageAmenities =
    validAmenities.length > 0
      ? (validAmenities.reduce((sum, r) => sum + r.ratings.amenities, 0) / validAmenities.length).toFixed(1)
      : '0';

  const validLocation = reviews.filter(r => r.ratings && typeof r.ratings.location === 'number');
  const averageLocation =
    validLocation.length > 0
      ? (validLocation.reduce((sum, r) => sum + r.ratings.location, 0) / validLocation.length).toFixed(1)
      : '0';

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.ratings && typeof r.ratings.overall === 'number' && Math.round(r.ratings.overall) === rating).length,
    percentage:
      reviews.length > 0
        ? ((reviews.filter((r) => r.ratings && typeof r.ratings.overall === 'number' && Math.round(r.ratings.overall) === rating).length / reviews.length) *
            100).toFixed(0)
        : '0',
  }));

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดรีวิว...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white border-b-4 border-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">รีวิวจากลูกค้า</h1>
          <p className="text-xl text-gray-600">
            ประสบการณ์จริงจากผู้ที่เคยพักกับเรา
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-xl sticky top-4">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-gray-800 mb-2">{averageOverall}</div>
                <div className="flex justify-center mb-2">
                  <StarDisplay rating={Math.round(parseFloat(averageOverall))} />
                </div>
                <p className="text-gray-600">{reviews.length} รีวิว</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3 mb-8">
                {ratingCounts.map(({ rating, count, percentage }) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? 0 : rating)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                      filterRating === rating ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-semibold w-8">{rating} ⭐</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </button>
                ))}
              </div>

              {/* Category Averages */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-bold text-gray-800 mb-4">คะแนนเฉลี่ยแต่ละด้าน</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaBroom className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">ความสะอาด</span>
                  </div>
                  <span className="font-bold text-gray-800">{averageCleanliness}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUserTie className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">พนักงาน</span>
                  </div>
                  <span className="font-bold text-gray-800">{averageStaff}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaWifi className="text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">สิ่งอำนวยความสะดวก</span>
                  </div>
                  <span className="font-bold text-gray-800">{averageAmenities}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600" />
                    <span className="text-sm font-semibold text-gray-700">ทำเล/สถานที่</span>
                  </div>
                  <span className="font-bold text-gray-800">{averageLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-2">
            {/* Sort and Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-md mb-6 flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all"
              >
                <FaFilter />
                ตัวกรอง
                <FaChevronDown
                  className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
              >
                <option value="recent">ล่าสุด</option>
                <option value="helpful">มีประโยชน์สูงสุด</option>
                <option value="rating">คะแนนสูงสุด</option>
              </select>

              {filterRating > 0 && (
                <button
                  onClick={() => setFilterRating(0)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-md text-center">
                  <p className="text-gray-500 text-lg">ไม่มีรีวิวที่ตรงตามเงื่อนไข</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {review.userName && review.userName.length > 0 ? review.userName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800">{review.userName}</h3>
                            {review.isVerifiedBooking && (
                              <FaCheckCircle className="text-green-500" title="เคยเข้าพักจริง" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {review.createdAt && !isNaN(new Date(review.createdAt).getTime())
                              ? new Date(review.createdAt).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : <span className="text-red-600 font-semibold">ไม่พบวันที่</span>
                            }
                          </p>
                          <Link
                            href={`/rooms/${review.roomId}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {review.roomName}
                          </Link>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReportModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="รายงานรีวิวไม่เหมาะสม"
                      >
                        <FaFlag />
                      </button>
                    </div>

                    {/* Overall Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-2xl ${
                              review.ratings && typeof review.ratings.overall === 'number' && star <= review.ratings.overall ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xl text-gray-800">
                        <span className={typeof review.ratings?.overall === 'number' ? 'text-blue-700' : 'text-gray-400'}>
                          {typeof review.ratings?.overall === 'number' ? `${review.ratings.overall}.0` : '-'}
                        </span>
                      </span>
                    </div>

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaBroom className="text-blue-600" />
                          <span className="text-sm">ความสะอาด</span>
                        </div>
                        <span className={typeof review.ratings?.cleanliness === 'number' ? 'text-blue-700 font-bold' : 'text-gray-400'}>
                          {typeof review.ratings?.cleanliness === 'number' ? review.ratings.cleanliness : '-'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-green-600" />
                          <span className="text-sm">พนักงาน</span>
                        </div>
                        <span className={typeof review.ratings?.staff === 'number' ? 'text-green-700 font-bold' : 'text-gray-400'}>
                          {typeof review.ratings?.staff === 'number' ? review.ratings.staff : '-'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaWifi className="text-purple-600" />
                          <span className="text-sm">สิ่งอำนวยความสะดวก</span>
                        </div>
                        <span className={typeof review.ratings?.amenities === 'number' ? 'text-purple-700 font-bold' : 'text-gray-400'}>
                          {typeof review.ratings?.amenities === 'number' ? review.ratings.amenities : '-'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-red-600" />
                          <span className="text-sm">ทำเล/สถานที่</span>
                        </div>
                        <span className={typeof review.ratings?.location === 'number' ? 'text-red-700 font-bold' : 'text-gray-400'}>
                          {typeof review.ratings?.location === 'number' ? review.ratings.location : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                        {review.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => openImageGallery(review.images!, index)}
                            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity group"
                          >
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <FaImage className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Admin Reply */}
                    {review.adminReply && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <FaUserCircle className="text-blue-600" />
                          <span className="font-bold text-gray-800">
                            ตอบกลับจากทีมงาน - {review.adminReply.repliedBy}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.adminReply.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.adminReply.repliedAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-semibold"
                      >
                        <FaThumbsUp />
                        มีประโยชน์ ({review.helpful})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">รายงานรีวิวไม่เหมาะสม</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setSelectedReview(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผลในการรายงาน
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- เลือกเหตุผล --</option>
                <option value="spam">สแปม</option>
                <option value="offensive">ไม่เหมาะสม/หยาบคาย</option>
                <option value="fake">รีวิวปลอม</option>
                <option value="irrelevant">ไม่เกี่ยวข้อง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setSelectedReview(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                รายงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageModal && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <FaTimes className="text-2xl" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <FaChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <FaChevronRight className="text-2xl" />
          </button>

          <div className="max-w-4xl w-full">
            <Image
              src={selectedImages[currentImageIndex]}
              alt={`Review image ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-white text-center mt-4">
              {currentImageIndex + 1} / {selectedImages.length}
            </p>
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

      <Footer />
    </div>
  );
}
