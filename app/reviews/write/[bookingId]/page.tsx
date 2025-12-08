'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaStar,
  FaImage,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaBroom,
  FaUserTie,
  FaWifi,
  FaMapMarkerAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface Booking {
  id: number;
  roomId: string;
  roomName: string;
  guestName: string;
  email: string;
  status: string;
}

export default function WriteReviewPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rating states
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    staff: 0,
    amenities: 0,
    location: 0,
  });

  const [hoverRatings, setHoverRatings] = useState({
    overall: 0,
    cleanliness: 0,
    staff: 0,
    amenities: 0,
    location: 0,
  });

  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();

      if (data.success) {
        const found = data.bookings.find(
          (b: Booking) => b.id === Number(resolvedParams.bookingId) && b.status === 'completed'
        );

        if (found) {
          setBooking(found);
        } else {
          setMessage({
            type: 'error',
            text: 'ไม่พบการจองหรือการจองยังไม่เสร็จสิ้น',
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleRatingHover = (category: keyof typeof hoverRatings, value: number) => {
    setHoverRatings({ ...hoverRatings, [category]: value });
  };

  const handleRatingLeave = (category: keyof typeof hoverRatings) => {
    setHoverRatings({ ...hoverRatings, [category]: 0 });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    const newImages: string[] = [];

    Array.from(files).forEach((file) => {
      if (imagePreviews.length + newPreviews.length >= 5) {
        warning('คุณสามารถอัพโหลดรูปได้สูงสุด 5 รูป');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        newPreviews.push(result);
        newImages.push(result);

        if (newPreviews.length === Math.min(files.length, 5 - imagePreviews.length)) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
          setImages([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) return;

    // Validate ratings
    if (Object.values(ratings).some((r) => r === 0)) {
      setMessage({ type: 'error', text: 'กรุณาให้คะแนนทุกหมวดหมู่' });
      return;
    }

    if (comment.trim().length < 10) {
      setMessage({ type: 'error', text: 'กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id.toString(),
          roomId: booking.roomId,
          roomName: booking.roomName,
          userId: 'guest', // In production, use actual user ID
          userName: booking.guestName,
          userEmail: booking.email,
          ratings,
          comment,
          images,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ ส่งรีวิวเรียบร้อยแล้ว!' });
        setTimeout(() => {
          router.push('/reviews');
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'เกิดข้อผิดพลาด' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการส่งรีวิว' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({
    category,
    icon: Icon,
    label,
  }: {
    category: keyof typeof ratings;
    icon: any;
    label: string;
  }) => {
    const displayRating = hoverRatings[category] || ratings[category];

    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="text-2xl text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">{label}</h3>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(category, star)}
              onMouseEnter={() => handleRatingHover(category, star)}
              onMouseLeave={() => handleRatingLeave(category)}
              className="transition-transform hover:scale-110"
            >
              <FaStar
                className={`text-4xl ${
                  star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-3">
          {displayRating === 0 && 'คลิกเพื่อให้คะแนน'}
          {displayRating === 1 && 'แย่มาก'}
          {displayRating === 2 && 'แย่'}
          {displayRating === 3 && 'ปานกลาง'}
          {displayRating === 4 && 'ดี'}
          {displayRating === 5 && 'ดีเยี่ยม'}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl">
          <p className="text-2xl text-red-600 mb-4">ไม่สามารถเขียนรีวิวได้</p>
          <p className="text-gray-600 mb-6">ไม่พบการจองหรือการจองยังไม่เสร็จสิ้น</p>
          <button
            onClick={() => router.push('/account')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            กลับหน้าบัญชี
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => router.push('/account')}
            className="mb-4 text-white/80 hover:text-white transition-colors flex items-center gap-2"
          >
            <FaArrowLeft /> กลับ
          </button>
          <h1 className="text-4xl font-bold mb-2">เขียนรีวิว</h1>
          <p className="text-white/90 text-lg">
            {booking.roomName} - หมายเลขจอง #{booking.id}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Overall Rating */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 shadow-xl border-2 border-yellow-200">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">คะแนนรวม</h2>
              <p className="text-gray-600">ประสบการณ์โดยรวมของคุณเป็นอย่างไร?</p>
            </div>

            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick('overall', star)}
                  onMouseEnter={() => handleRatingHover('overall', star)}
                  onMouseLeave={() => handleRatingLeave('overall')}
                  className="transition-transform hover:scale-110"
                >
                  <FaStar
                    className={`text-6xl ${
                      star <= (hoverRatings.overall || ratings.overall)
                        ? 'text-yellow-400 drop-shadow-lg'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-center text-2xl font-bold text-gray-800">
              {ratings.overall === 0 && 'คลิกเพื่อให้คะแนน'}
              {ratings.overall === 1 && '⭐ แย่มาก'}
              {ratings.overall === 2 && '⭐⭐ แย่'}
              {ratings.overall === 3 && '⭐⭐⭐ ปานกลาง'}
              {ratings.overall === 4 && '⭐⭐⭐⭐ ดี'}
              {ratings.overall === 5 && '⭐⭐⭐⭐⭐ ดีเยี่ยม'}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ให้คะแนนแต่ละด้าน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RatingStars category="cleanliness" icon={FaBroom} label="ความสะอาด" />
              <RatingStars category="staff" icon={FaUserTie} label="พนักงาน" />
              <RatingStars category="amenities" icon={FaWifi} label="สิ่งอำนวยความสะดวก" />
              <RatingStars category="location" icon={FaMapMarkerAlt} label="ทำเล/สถานที่" />
            </div>
          </div>

          {/* Comment */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">เขียนรีวิวของคุณ</h2>
            <p className="text-gray-600 mb-4">
              บอกเล่าประสบการณ์ของคุณให้ผู้อื่นได้รู้ (อย่างน้อย 10 ตัวอักษร)
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="เช่น: ห้องพักสะอาดมาก วิวสวย เจ้าหน้าที่บริการดีเยี่ยม..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
            />
            <p className="text-sm text-gray-500 mt-2">
              {comment.length} / 500 ตัวอักษร
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">เพิ่มรูปภาพ (ไม่บังคับ)</h2>
            <p className="text-gray-600 mb-4">อัพโหลดรูปภาพประกอบรีวิวของคุณ (สูงสุด 5 รูป)</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 5 && (
                <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <FaImage className="text-3xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">เพิ่มรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-gray-500">
              รองรับไฟล์: JPG, PNG, GIF (สูงสุด 5MB ต่อรูป)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || Object.values(ratings).some((r) => r === 0)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                กำลังส่งรีวิว...
              </>
            ) : (
              <>
                <FaCheckCircle />
                ส่งรีวิว
              </>
            )}
          </button>
        </form>
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
  );
}
