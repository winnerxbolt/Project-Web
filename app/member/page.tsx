'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaUser,
  FaCalendarAlt,
  FaHeart,
  FaStar,
  FaMoneyBillWave,
  FaCrown,
  FaTrophy,
  FaChartLine,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaTicketAlt,
  FaGift,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function MemberDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    wishlistCount: 0,
    points: 0,
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMemberData();
  }, [user]);

  const fetchMemberData = async () => {
    try {
      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings');
      const bookingsData = await bookingsRes.json();
      
      // Validate array
      let bookingsArray: any[] = [];
      if (Array.isArray(bookingsData)) {
        bookingsArray = bookingsData;
      } else if (bookingsData.success && Array.isArray(bookingsData.bookings)) {
        bookingsArray = bookingsData.bookings;
      }
      
      const userBookings = bookingsArray.filter((b: any) => b.email === user?.email);

      // Fetch wishlist
      const wishlistRes = await fetch(`/api/member/wishlist?userId=${user?.id}`);
      const wishlistData = await wishlistRes.json();

      // Fetch points
      const pointsRes = await fetch(`/api/points?userId=${user?.id}&action=summary`);
      const pointsData = await pointsRes.json();

      // Calculate stats
      const totalSpent = userBookings.reduce((sum: number, b: any) => sum + (b.total || 0), 0);

      setStats({
        totalBookings: userBookings.length,
        totalSpent,
        wishlistCount: wishlistData.length || 0,
        points: pointsData.totalPoints || 0,
        tier: pointsData.tier || 'bronze',
      });

      setRecentBookings(userBookings.slice(0, 3));
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      bronze: { icon: '🥉', color: 'from-orange-600 to-yellow-700', name: 'Bronze' },
      silver: { icon: '🥈', color: 'from-gray-400 to-gray-600', name: 'Silver' },
      gold: { icon: '🥇', color: 'from-yellow-500 to-yellow-600', name: 'Gold' },
      platinum: { icon: '💎', color: 'from-purple-500 to-indigo-600', name: 'Platinum' },
    };
    return badges[tier as keyof typeof badges] || badges.bronze;
  };

  const tierBadge = getTierBadge(stats.tier);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">สวัสดี, {user?.name}! 👋</h1>
              <p className="text-white/90 text-lg">ยินดีต้อนรับสู่สมาชิกพิเศษของเรา</p>
            </div>
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <FaHome />
              <span>กลับหน้าแรก</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Member Tier Card */}
        <div className={`bg-gradient-to-r ${tierBadge.color} text-white rounded-3xl p-8 mb-8 shadow-2xl`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{tierBadge.icon}</span>
                <div>
                  <p className="text-white/80 text-sm font-semibold">สมาชิกระดับ</p>
                  <h2 className="text-4xl font-black">{tierBadge.name}</h2>
                </div>
              </div>
              <p className="text-white/90 text-lg mt-4">คะแนนสะสม: <span className="font-bold text-2xl">{stats.points.toLocaleString()}</span> แต้ม</p>
            </div>
            <Link
              href="/member/points"
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm"
            >
              ดูรายละเอียด →
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/member/bookings"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaCalendarAlt className="text-3xl" />
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-semibold">การจองทั้งหมด</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
            <p className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
              ดูประวัติการจอง →
            </p>
          </Link>

          <Link
            href="/member/wishlist"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-pink-500 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-100 text-pink-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaHeart className="text-3xl" />
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-semibold">รายการโปรด</p>
                <p className="text-4xl font-bold text-gray-900">{stats.wishlistCount}</p>
              </div>
            </div>
            <p className="text-pink-600 font-semibold group-hover:translate-x-2 transition-transform">
              ดูรายการโปรด →
            </p>
          </Link>

          <Link
            href="/member/points"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-purple-500 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 text-purple-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaStar className="text-3xl" />
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-semibold">คะแนนสะสม</p>
                <p className="text-4xl font-bold text-gray-900">{stats.points.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
              ใช้คะแนน →
            </p>
          </Link>

          <Link
            href="/member/payments"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 text-green-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaMoneyBillWave className="text-3xl" />
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-semibold">ยอดใช้จ่ายรวม</p>
                <p className="text-3xl font-bold text-gray-900">฿{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
              ดูประวัติการชำระ →
            </p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaChartLine className="text-blue-600" />
            การดำเนินการด่วน
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/member/profile"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all group"
            >
              <div className="bg-blue-600 text-white p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaUser className="text-2xl" />
              </div>
              <span className="font-bold text-gray-900">แก้ไขโปรไฟล์</span>
            </Link>

            <Link
              href="/rooms"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 hover:from-pink-100 hover:to-orange-100 transition-all group"
            >
              <div className="bg-pink-600 text-white p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaHome className="text-2xl" />
              </div>
              <span className="font-bold text-gray-900">จองห้องพัก</span>
            </Link>

            <Link
              href="/member/points"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-all group"
            >
              <div className="bg-purple-600 text-white p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaGift className="text-2xl" />
              </div>
              <span className="font-bold text-gray-900">แลกของรางวัล</span>
            </Link>

            <Link
              href="/reviews"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 transition-all group"
            >
              <div className="bg-green-600 text-white p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FaStar className="text-2xl" />
              </div>
              <span className="font-bold text-gray-900">เขียนรีวิว</span>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaHistory className="text-blue-600" />
                การจองล่าสุด
              </h2>
              <Link
                href="/member/bookings"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl hover:shadow-md transition-all"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{booking.roomName}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(booking.checkIn).toLocaleDateString('th-TH')} - {new Date(booking.checkOut).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">฿{booking.total.toLocaleString()}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status === 'confirmed' ? '✓ ยืนยันแล้ว' :
                       booking.status === 'pending' ? '⏳ รอยืนยัน' :
                       booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
