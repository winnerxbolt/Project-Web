'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaQuestionCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSearch,
  FaThumbsUp,
  FaThumbsDown,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaSave,
} from 'react-icons/fa'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

interface FAQ {
  id: string
  question: string
  answer: string
  category: 'booking' | 'payment' | 'facilities' | 'policies' | 'other'
  order: number
  isActive: boolean
  views: number
  helpful: number
  notHelpful: number
  createdAt: string
  updatedAt: string
}

export default function AdminFAQPage() {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'booking' as FAQ['category'],
    order: 1,
    isActive: true,
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faq')
      const data = await response.json()
      setFaqs(data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = '/api/faq'
      const method = editingFAQ ? 'PUT' : 'POST'
      const payload = editingFAQ ? { ...formData, id: editingFAQ.id } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        success(editingFAQ ? 'อัพเดท FAQ สำเร็จ!' : 'เพิ่ม FAQ สำเร็จ!')
        setShowModal(false)
        resetForm()
        fetchFAQs()
      } else {
        showError('เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      showError('เกิดข้อผิดพลาด')
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบ FAQ?')) return

    try {
      const response = await fetch(`/api/faq?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        success('ลบ FAQ สำเร็จ!')
        fetchFAQs()
      } else {
        showError('เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      showError('เกิดข้อผิดพลาด')
    }
  }

  const toggleActive = async (faq: FAQ) => {
    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...faq,
          isActive: !faq.isActive,
        }),
      })

      if (response.ok) {
        fetchFAQs()
      }
    } catch (error) {
      console.error('Error toggling FAQ:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'booking',
      order: faqs.length + 1,
      isActive: true,
    })
    setEditingFAQ(null)
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'booking':
        return '📅 การจอง'
      case 'payment':
        return '💳 การชำระเงิน'
      case 'facilities':
        return '🏊 สิ่งอำนวยความสะดวก'
      case 'policies':
        return '📋 นโยบาย'
      default:
        return '📌 อื่นๆ'
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: faqs.length,
    active: faqs.filter((f) => f.isActive).length,
    totalViews: faqs.reduce((sum, f) => sum + f.views, 0),
    totalHelpful: faqs.reduce((sum, f) => sum + f.helpful, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition-colors"
          >
            <FaArrowLeft />
            <span>กลับหน้าแอดมิน</span>
          </button>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-4">
                <FaQuestionCircle className="text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900">จัดการ FAQ</h1>
                <p className="text-gray-600 font-medium">คำถามที่พบบ่อย</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus />
              เพิ่ม FAQ
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">FAQ ทั้งหมด</p>
                  <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                </div>
                <FaQuestionCircle className="text-4xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">เปิดใช้งาน</p>
                  <p className="text-3xl font-black text-gray-900">{stats.active}</p>
                </div>
                <FaToggleOn className="text-4xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">ยอดดู</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalViews}</p>
                </div>
                <FaEye className="text-4xl text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">มีประโยชน์</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalHelpful}</p>
                </div>
                <FaThumbsUp className="text-4xl text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900 font-semibold"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="booking">การจอง</option>
              <option value="payment">การชำระเงิน</option>
              <option value="facilities">สิ่งอำนวยความสะดวก</option>
              <option value="policies">นโยบาย</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FaQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบ FAQ</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getCategoryName(faq.category)}</span>
                      <span className="text-sm text-gray-500">#{faq.order}</span>
                      {!faq.isActive && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
                          ปิดการใช้งาน
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(faq)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {faq.isActive ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaEye />
                    <span>{faq.views} ครั้ง</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <FaThumbsUp />
                    <span>{faq.helpful}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <FaThumbsDown />
                    <span>{faq.notHelpful}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-black">{editingFAQ ? 'แก้ไข FAQ' : 'เพิ่ม FAQ ใหม่'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-900 font-bold mb-2">คำถาม *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-2">คำตอบ *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">หมวดหมู่ *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as FAQ['category'] })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900 font-semibold"
                  >
                    <option value="booking">การจอง</option>
                    <option value="payment">การชำระเงิน</option>
                    <option value="facilities">สิ่งอำนวยความสะดวก</option>
                    <option value="policies">นโยบาย</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">ลำดับ *</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="isActive" className="text-gray-900 font-semibold">
                  เปิดใช้งาน
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {editingFAQ ? 'บันทึก' : 'เพิ่ม FAQ'}
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
  )
}
