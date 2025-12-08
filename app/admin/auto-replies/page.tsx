'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaRobot,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaSave,
  FaKey,
  FaReply,
  FaChartLine,
  FaStar,
} from 'react-icons/fa'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

interface AutoReply {
  id: string
  keywords: string[]
  response: string
  isActive: boolean
  priority: number
  useCount: number
  createdAt: string
  updatedAt: string
}

export default function AdminAutoRepliesPage() {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingReply, setEditingReply] = useState<AutoReply | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    keywords: [] as string[],
    keywordInput: '',
    response: '',
    priority: 1,
    isActive: true,
  })

  useEffect(() => {
    fetchAutoReplies()
  }, [])

  const fetchAutoReplies = async () => {
    try {
      const response = await fetch('/api/auto-replies')
      const data = await response.json()
      setAutoReplies(data)
    } catch (error) {
      console.error('Error fetching auto-replies:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.keywords.length === 0) {
      showError('กรุณาเพิ่มคำสำคัญอย่างน้อย 1 คำ')
      return
    }

    try {
      const url = '/api/auto-replies'
      const method = editingReply ? 'PUT' : 'POST'
      const payload = editingReply
        ? {
            id: editingReply.id,
            keywords: formData.keywords,
            response: formData.response,
            priority: formData.priority,
            isActive: formData.isActive,
          }
        : {
            keywords: formData.keywords,
            response: formData.response,
            priority: formData.priority,
            isActive: formData.isActive,
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        success(editingReply ? 'อัพเดทการตอบกลับอัตโนมัติสำเร็จ!' : 'เพิ่มการตอบกลับอัตโนมัติสำเร็จ!')
        setShowModal(false)
        resetForm()
        fetchAutoReplies()
      } else {
        showError('เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error saving auto-reply:', error)
      showError('เกิดข้อผิดพลาด')
    }
  }

  const handleEdit = (reply: AutoReply) => {
    setEditingReply(reply)
    setFormData({
      keywords: reply.keywords,
      keywordInput: '',
      response: reply.response,
      priority: reply.priority,
      isActive: reply.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบการตอบกลับอัตโนมัติ?')) return

    try {
      const response = await fetch(`/api/auto-replies?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        success('ลบการตอบกลับอัตโนมัติสำเร็จ!')
        fetchAutoReplies()
      } else {
        showError('เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error deleting auto-reply:', error)
      showError('เกิดข้อผิดพลาด')
    }
  }

  const toggleActive = async (reply: AutoReply) => {
    try {
      const response = await fetch('/api/auto-replies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reply,
          isActive: !reply.isActive,
        }),
      })

      if (response.ok) {
        fetchAutoReplies()
      }
    } catch (error) {
      console.error('Error toggling auto-reply:', error)
    }
  }

  const addKeyword = () => {
    if (!formData.keywordInput.trim()) return

    if (!formData.keywords.includes(formData.keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, formData.keywordInput.trim()],
        keywordInput: '',
      })
    } else {
      showError('คำสำคัญนี้มีอยู่แล้ว')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    })
  }

  const resetForm = () => {
    setFormData({
      keywords: [],
      keywordInput: '',
      response: '',
      priority: 1,
      isActive: true,
    })
    setEditingReply(null)
  }

  const filteredReplies = autoReplies.filter((reply) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      reply.keywords.some((k) => k.toLowerCase().includes(searchLower)) ||
      reply.response.toLowerCase().includes(searchLower)
    )
  })

  const stats = {
    total: autoReplies.length,
    active: autoReplies.filter((r) => r.isActive).length,
    totalUse: autoReplies.reduce((sum, r) => sum + r.useCount, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
          >
            <FaArrowLeft />
            <span>กลับหน้าแอดมิน</span>
          </button>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4">
                <FaRobot className="text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900">ตอบกลับอัตโนมัติ</h1>
                <p className="text-gray-600 font-medium">จัดการระบบตอบกลับอัตโนมัติด้วย AI</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus />
              เพิ่มการตอบกลับ
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">ทั้งหมด</p>
                  <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                </div>
                <FaRobot className="text-4xl text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">เปิดใช้งาน</p>
                  <p className="text-3xl font-black text-gray-900">{stats.active}</p>
                </div>
                <FaToggleOn className="text-4xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">จำนวนการใช้งาน</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalUse}</p>
                </div>
                <FaChartLine className="text-4xl text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาคำสำคัญหรือคำตอบ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900"
            />
          </div>
        </div>

        {/* Auto-Replies List */}
        <div className="space-y-4">
          {filteredReplies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FaRobot className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบการตอบกลับอัตโนมัติ</p>
            </div>
          ) : (
            filteredReplies.map((reply) => (
              <div
                key={reply.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm font-bold text-gray-600">ลำดับความสำคัญ: {reply.priority}</span>
                      </div>
                      {!reply.isActive && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
                          ปิดการใช้งาน
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-orange-600">
                        <FaChartLine />
                        <span className="text-sm font-semibold">ใช้งาน {reply.useCount} ครั้ง</span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FaKey className="text-purple-600" />
                        <span className="text-sm font-bold text-gray-700">คำสำคัญ:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reply.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-semibold"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaReply className="text-green-600" />
                        <span className="text-sm font-bold text-gray-700">คำตอบ:</span>
                      </div>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                        {reply.response}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(reply)}
                      className={`p-2 rounded-lg transition-colors ${
                        reply.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {reply.isActive ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                    <button
                      onClick={() => handleEdit(reply)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      onClick={() => handleDelete(reply.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash className="text-xl" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-black">
                {editingReply ? 'แก้ไขการตอบกลับอัตโนมัติ' : 'เพิ่มการตอบกลับอัตโนมัติ'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Keywords */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  คำสำคัญ * (กด Enter เพื่อเพิ่ม)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={formData.keywordInput}
                    onChange={(e) => setFormData({ ...formData, keywordInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="พิมพ์คำสำคัญ..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-lg flex items-center gap-2"
                    >
                      <span className="font-semibold">{keyword}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-purple-600 hover:text-purple-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {formData.keywords.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">กรุณาเพิ่มคำสำคัญอย่างน้อย 1 คำ</p>
                )}
              </div>

              {/* Response */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">คำตอบอัตโนมัติ *</label>
                <textarea
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  rows={5}
                  placeholder="พิมพ์คำตอบที่ต้องการส่งกลับอัตโนมัติ..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900"
                  required
                />
              </div>

              {/* Priority & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">ลำดับความสำคัญ *</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900"
                    min="1"
                    max="10"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">เลขมากกว่า = ความสำคัญสูงกว่า</p>
                </div>

                <div className="flex items-end">
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
                </div>
              </div>

              {/* Buttons */}
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {editingReply ? 'บันทึก' : 'เพิ่มการตอบกลับ'}
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
