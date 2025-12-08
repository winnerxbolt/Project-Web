'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTrophy,
  FaStar,
  FaCoins,
  FaHistory,
  FaGift,
  FaArrowUp,
  FaArrowDown,
  FaTicketAlt,
  FaFire,
  FaCrown,
  FaGem,
  FaMedal,
} from 'react-icons/fa';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface PointsSummary {
  userId: string;
  totalPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimePoints: number;
  transactions: {
    id: string;
    type: 'earn' | 'redeem' | 'expire';
    points: number;
    reason: string;
    bookingId?: string;
    couponId?: string;
    createdAt: string;
    expiresAt?: string;
  }[];
  benefits: {
    earnRate: number;
    redeemRate: number;
    bonusMultiplier: number;
    perks: string[];
  };
}

export default function PointsPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch('/api/points?userId=guest&action=summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <FaMedal className="text-4xl" />;
      case 'silver':
        return <FaTrophy className="text-4xl" />;
      case 'gold':
        return <FaCrown className="text-4xl" />;
      case 'platinum':
        return <FaGem className="text-4xl" />;
      default:
        return <FaStar className="text-4xl" />;
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'Bronze';
      case 'silver':
        return 'Silver';
      case 'gold':
        return 'Gold';
      case 'platinum':
        return 'Platinum';
      default:
        return tier;
    }
  };

  const getNextTier = (currentPoints: number) => {
    if (currentPoints < 10000) return { name: 'Silver', points: 10000 - currentPoints };
    if (currentPoints < 25000) return { name: 'Gold', points: 25000 - currentPoints };
    if (currentPoints < 50000) return { name: 'Platinum', points: 50000 - currentPoints };
    return null;
  };

  const getProgressPercentage = (currentPoints: number) => {
    if (currentPoints < 10000) return (currentPoints / 10000) * 100;
    if (currentPoints < 25000) return ((currentPoints - 10000) / 15000) * 100;
    if (currentPoints < 50000) return ((currentPoints - 25000) / 25000) * 100;
    return 100;
  };

  const handleRedeem = async () => {
    if (!summary || redeemAmount <= 0 || redeemAmount > summary.totalPoints) {
      warning('จำนวนคะแนนไม่ถูกต้อง');
      return;
    }

    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest',
          type: 'redeem',
          points: redeemAmount,
          reason: 'แลกคะแนนเป็นส่วนลด',
        }),
      });

      if (response.ok) {
        success(`แลกคะแนน ${redeemAmount} คะแนนสำเร็จ!`);
        setShowRedeemModal(false);
        setRedeemAmount(0);
        fetchPoints();
      } else {
        showError('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl">
          <p className="text-gray-600 text-lg">ไม่พบข้อมูลคะแนน</p>
        </div>
      </div>
    );
  }

  const nextTier = getNextTier(summary.lifetimePoints);
  const progressPercentage = getProgressPercentage(summary.lifetimePoints);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-purple-600 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => router.push('/account')}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors font-semibold"
          >
            ← กลับหน้าบัญชี
          </button>
          <div className="text-center">
            <div className={`inline-block mb-4 p-4 rounded-2xl bg-gradient-to-r ${getTierColor(summary.tier)} text-white`}>
              {getTierIcon(summary.tier)}
            </div>
            <h1 className="text-5xl font-bold mb-2 text-gray-900">ระดับ {getTierName(summary.tier)}</h1>
            <p className="text-gray-600 text-xl">คะแนนสะสมของคุณ</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Points */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">คะแนนคงเหลือ</p>
                <p className="text-4xl font-bold text-gray-800">{summary.totalPoints.toLocaleString()}</p>
              </div>
              <FaCoins className="text-5xl text-green-500" />
            </div>
            <button
              onClick={() => setShowRedeemModal(true)}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              แลกคะแนน
            </button>
          </div>

          {/* Lifetime Points */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">คะแนนสะสมทั้งหมด</p>
                <p className="text-4xl font-bold text-gray-800">{summary.lifetimePoints.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">ตั้งแต่เริ่มใช้งาน</p>
              </div>
              <FaFire className="text-5xl text-blue-500" />
            </div>
          </div>

          {/* Earn Rate */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">อัตราการได้คะแนน</p>
                <p className="text-4xl font-bold text-gray-800">×{summary.benefits.earnRate}</p>
                <p className="text-xs text-gray-500 mt-2">คะแนนต่อ 1 บาท</p>
              </div>
              <FaStar className="text-5xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">ความคืบหน้าสู่ระดับถัดไป</h2>
              <span className="text-gray-600 font-semibold">
                อีก {nextTier.points.toLocaleString()} คะแนน ถึง {nextTier.name}
              </span>
            </div>
            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getTierColor(summary.tier)} transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
                  {progressPercentage.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 shadow-xl mb-8 border-2 border-yellow-200">
          <div className="flex items-center gap-3 mb-6">
            <FaGift className="text-4xl text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-800">สิทธิพิเศษของคุณ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-800 mb-4">สิทธิประโยชน์</h3>
              <ul className="space-y-2">
                {summary.benefits.perks.map((perk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaStar className="text-yellow-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-800 mb-4">อัตราพิเศษ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">รับคะแนน</span>
                  <span className="font-bold text-green-600">×{summary.benefits.earnRate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">แลกคะแนน</span>
                  <span className="font-bold text-blue-600">×{summary.benefits.redeemRate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">โบนัสพิเศษ</span>
                  <span className="font-bold text-purple-600">×{summary.benefits.bonusMultiplier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaHistory className="text-3xl text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">ประวัติการใช้คะแนน</h2>
          </div>

          <div className="space-y-4">
            {summary.transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">ยังไม่มีประวัติการใช้คะแนน</p>
            ) : (
              summary.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 rounded-xl border-2 ${
                    transaction.type === 'earn'
                      ? 'bg-green-50 border-green-200'
                      : transaction.type === 'redeem'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'earn'
                            ? 'bg-green-500'
                            : transaction.type === 'redeem'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}
                      >
                        {transaction.type === 'earn' ? (
                          <FaArrowUp className="text-white text-xl" />
                        ) : transaction.type === 'redeem' ? (
                          <FaArrowDown className="text-white text-xl" />
                        ) : (
                          <FaHistory className="text-white text-xl" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">{transaction.reason}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {transaction.expiresAt && (
                          <p className="text-xs text-orange-600">
                            หมดอายุ: {new Date(transaction.expiresAt).toLocaleDateString('th-TH')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          transaction.type === 'earn'
                            ? 'text-green-600'
                            : transaction.type === 'redeem'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {transaction.type === 'earn' ? '+' : '-'}
                        {transaction.points.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">คะแนน</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <FaTicketAlt className="text-6xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">แลกคะแนน</h2>
              <p className="text-gray-600">แลกคะแนนเป็นส่วนลดสำหรับการจองครั้งถัดไป</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">จำนวนคะแนนที่ต้องการแลก</label>
                <span className="text-sm text-gray-500">
                  คงเหลือ: {summary.totalPoints.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                value={redeemAmount || ''}
                onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 0)}
                max={summary.totalPoints}
                min={100}
                step={100}
                placeholder="ขั้นต่ำ 100 คะแนน"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
              />

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">คะแนนที่แลก:</span>
                  <span className="font-bold text-blue-600">{redeemAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">มูลค่าส่วนลด:</span>
                  <span className="font-bold text-green-600">
                    ฿{(redeemAmount * summary.benefits.redeemRate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemAmount(0);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRedeem}
                disabled={redeemAmount < 100 || redeemAmount > summary.totalPoints}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยืนยันการแลก
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
