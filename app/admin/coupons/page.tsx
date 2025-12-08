'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTicketAlt, FaPlus, FaEdit, FaTrash, FaPercent, FaDollarSign, FaClock, FaUserPlus, FaUserCheck, FaToggleOn, FaToggleOff, FaCalendar, FaChartLine, FaSearch } from 'react-icons/fa';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'earlyBird' | 'newCustomer' | 'returning';
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  advanceBookingDays?: number;
  usageLimit?: number;
  usageCount: number;
  usagePerUser?: number;
  applicableRooms?: string[];
  customerType?: 'new' | 'returning' | 'all';
  isActive: boolean;
  createdAt: string;
  description: string;
}

interface Room {
  id: string;
  name: string;
}

export default function AdminCoupons() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as Coupon['type'],
    discountValue: 0,
    minBookingAmount: 0,
    maxDiscountAmount: 0,
    startDate: '',
    endDate: '',
    advanceBookingDays: 0,
    usageLimit: 0,
    usagePerUser: 0,
    applicableRooms: [] as string[],
    customerType: 'all' as 'new' | 'returning' | 'all',
    isActive: true,
    description: '',
  });

  useEffect(() => {
    fetchCoupons();
    fetchRooms();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCoupon ? '/api/coupons' : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const payload = editingCoupon
        ? { ...formData, id: editingCoupon.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success(editingCoupon ? 'อัพเดทคูปองสำเร็จ!' : 'สร้างคูปองสำเร็จ!');
        setShowModal(false);
        resetForm();
        fetchCoupons();
      } else {
        const error = await response.json();
        showError(error.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discountValue: coupon.discountValue,
      minBookingAmount: coupon.minBookingAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      startDate: coupon.startDate.split('T')[0],
      endDate: coupon.endDate.split('T')[0],
      advanceBookingDays: coupon.advanceBookingDays || 0,
      usageLimit: coupon.usageLimit || 0,
      usagePerUser: coupon.usagePerUser || 0,
      applicableRooms: coupon.applicableRooms || [],
      customerType: coupon.customerType || 'all',
      isActive: coupon.isActive,
      description: coupon.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบคูปอง?')) return;

    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('ลบคูปองสำเร็จ!');
        fetchCoupons();
      } else {
        showError('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showError('เกิดข้อผิดพลาด');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coupon,
          isActive: !coupon.isActive,
        }),
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      discountValue: 0,
      minBookingAmount: 0,
      maxDiscountAmount: 0,
      startDate: '',
      endDate: '',
      advanceBookingDays: 0,
      usageLimit: 0,
      usagePerUser: 0,
      applicableRooms: [],
      customerType: 'all',
      isActive: true,
      description: '',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <FaPercent className="text-blue-500" />;
      case 'fixed': return <FaDollarSign className="text-green-500" />;
      case 'earlyBird': return <FaClock className="text-orange-500" />;
      case 'newCustomer': return <FaUserPlus className="text-purple-500" />;
      case 'returning': return <FaUserCheck className="text-pink-500" />;
      default: return <FaTicketAlt />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'percentage': return 'ส่วนลด %';
      case 'fixed': return 'ส่วนลดจำนวนคงที่';
      case 'earlyBird': return 'Early Bird';
      case 'newCustomer': return 'ลูกค้าใหม่';
      case 'returning': return 'ลูกค้าเก่า';
      default: return type;
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || coupon.type === filterType;
    
    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = coupon.isActive && !isExpired(coupon.endDate) && !isUpcoming(coupon.startDate);
    } else if (filterStatus === 'inactive') {
      matchesStatus = !coupon.isActive;
    } else if (filterStatus === 'expired') {
      matchesStatus = isExpired(coupon.endDate);
    } else if (filterStatus === 'upcoming') {
      matchesStatus = isUpcoming(coupon.startDate);
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive && !isExpired(c.endDate) && !isUpcoming(c.startDate)).length,
    expired: coupons.filter(c => isExpired(c.endDate)).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usageCount, 0),
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
      <div className="bg-white border-b-4 border-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors font-semibold"
          >
            ← กลับหน้า Admin
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">จัดการคูปอง & โปรโมชั่น</h1>
              <p className="text-gray-600">สร้างและจัดการคูปองส่วนลด</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus /> สร้างคูปองใหม่
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">คูปองทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaTicketAlt className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">กำลังใช้งาน</p>
                <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <FaToggleOn className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">หมดอายุ</p>
                <p className="text-3xl font-bold text-gray-800">{stats.expired}</p>
              </div>
              <FaCalendar className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">จำนวนการใช้งาน</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsage}</p>
              </div>
              <FaChartLine className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                ค้นหา
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหารหัสคูปองหรือคำอธิบาย"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">ทั้งหมด</option>
                <option value="percentage">ส่วนลด %</option>
                <option value="fixed">ส่วนลดจำนวนคงที่</option>
                <option value="earlyBird">Early Bird</option>
                <option value="newCustomer">ลูกค้าใหม่</option>
                <option value="returning">ลูกค้าเก่า</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">ทั้งหมด</option>
                <option value="active">กำลังใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
                <option value="expired">หมดอายุ</option>
                <option value="upcoming">กำลังจะเริ่ม</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getTypeIcon(coupon.type)}
                    <h3 className="text-2xl font-bold text-gray-800">{coupon.code}</h3>
                    {isExpired(coupon.endDate) && (
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                        หมดอายุ
                      </span>
                    )}
                    {isUpcoming(coupon.startDate) && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full">
                        กำลังจะเริ่ม
                      </span>
                    )}
                    {coupon.isActive && !isExpired(coupon.endDate) && !isUpcoming(coupon.startDate) && (
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                        ใช้งานได้
                      </span>
                    )}
                    {!coupon.isActive && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        ปิดใช้งาน
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">{coupon.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">ประเภท</p>
                      <p className="font-semibold">{getTypeName(coupon.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ส่วนลด</p>
                      <p className="font-semibold text-green-600">
                        {coupon.type === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `฿${coupon.discountValue.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">การใช้งาน</p>
                      <p className="font-semibold">
                        {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ยอดขั้นต่ำ</p>
                      <p className="font-semibold">
                        {coupon.minBookingAmount ? `฿${coupon.minBookingAmount.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>เริ่ม: {new Date(coupon.startDate).toLocaleDateString('th-TH')}</span>
                    <span>สิ้นสุด: {new Date(coupon.endDate).toLocaleDateString('th-TH')}</span>
                    {coupon.advanceBookingDays && (
                      <span className="text-orange-600">จองล่วงหน้า {coupon.advanceBookingDays} วัน</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`p-3 rounded-lg transition-all ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={coupon.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  >
                    {coupon.isActive ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                    title="แก้ไข"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                    title="ลบ"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCoupons.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบคูปอง</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingCoupon ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสคูปอง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="เช่น SUMMER2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-gray-900"
                  required
                />
              </div>

              {/* Type and Discount Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภท <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Coupon['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="percentage">ส่วนลด %</option>
                    <option value="fixed">ส่วนลดจำนวนคงที่</option>
                    <option value="earlyBird">Early Bird</option>
                    <option value="newCustomer">ลูกค้าใหม่</option>
                    <option value="returning">ลูกค้าเก่า</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    มูลค่าส่วนลด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                    placeholder={formData.type === 'percentage' ? '10' : '500'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* Min and Max */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยอดจองขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    min="0"
                  />
                </div>

                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ส่วนลดสูงสุด (บาท)
                    </label>
                      <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) })}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่เริ่มต้น <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่สิ้นสุด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Early Bird Days */}
              {(formData.type === 'earlyBird') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนวันจองล่วงหน้า
                  </label>
                  <input
                    type="number"
                    value={formData.advanceBookingDays}
                    onChange={(e) => setFormData({ ...formData, advanceBookingDays: parseInt(e.target.value) })}
                    placeholder="30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    min="1"
                  />
                </div>
              )}

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนครั้งที่ใช้ได้ทั้งหมด
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                    placeholder="0 = ไม่จำกัด"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนครั้งต่อผู้ใช้
                  </label>
                  <input
                    type="number"
                    value={formData.usagePerUser}
                    onChange={(e) => setFormData({ ...formData, usagePerUser: parseInt(e.target.value) })}
                    placeholder="0 = ไม่จำกัด"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    min="0"
                  />
                </div>
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทลูกค้า
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value as 'new' | 'returning' | 'all' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="new">ลูกค้าใหม่</option>
                  <option value="returning">ลูกค้าเก่า</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="คำอธิบายโปรโมชั่น"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  เปิดใช้งานทันที
                </label>
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
                  {editingCoupon ? 'บันทึก' : 'สร้างคูปอง'}
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
