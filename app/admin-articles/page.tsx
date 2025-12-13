'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiImage, FiTag } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  coverImage?: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  views: number
}

export default function ArticlesAdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <ArticlesAdminContent />
    </ProtectedRoute>
  )
}

function ArticlesAdminContent() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'general',
    tags: '',
    published: true
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles')
      const data = await res.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingArticle(null)
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      category: 'general',
      tags: '',
      published: true
    })
    setShowModal(true)
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      coverImage: article.coverImage || '',
      category: article.category,
      tags: article.tags.join(', '),
      published: article.published
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t)
    
    const body = {
      ...formData,
      tags,
      ...(editingArticle && { id: editingArticle.id })
    }

    try {
      const method = editingArticle ? 'PUT' : 'POST'
      const res = await fetch('/api/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      })

      if (res.ok) {
        setShowModal(false)
        fetchArticles()
      } else {
        alert('Failed to save article')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save article')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?')) return

    try {
      const res = await fetch(`/api/articles?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        fetchArticles()
      } else {
        alert('Failed to delete article')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete article')
    }
  }

  const togglePublished = async (article: Article) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: article.id,
          published: !article.published
        }),
        credentials: 'include'
      })

      if (res.ok) {
        fetchArticles()
      }
    } catch (error) {
      console.error('Toggle published error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
              >
                ← กลับหน้า Admin
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                จัดการบทความ
              </h1>
              <p className="text-gray-600 mt-1">สร้าง แก้ไข และจัดการบทความทั้งหมด</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <FiPlus />
              สร้างบทความใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">ยังไม่มีบทความ</h3>
            <p className="text-gray-600 mb-6">เริ่มสร้างบทความแรกของคุณตอนนี้</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              <FiPlus />
              สร้างบทความใหม่
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Cover */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-teal-400">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiImage className="text-white text-5xl opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => togglePublished(article)}
                      className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                        article.published
                          ? 'bg-green-500/90 text-white'
                          : 'bg-gray-500/90 text-white'
                      }`}
                      title={article.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                    >
                      {article.published ? <FiEye /> : <FiEyeOff />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.views} views</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <FiEdit2 />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingArticle ? 'แก้ไขบทความ' : 'สร้างบทความใหม่'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      หัวเรื่อง *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                      placeholder="หัวข้อบทความที่น่าสนใจ..."
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เนื้อหา *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900 leading-relaxed"
                      placeholder="เขียนเนื้อหาบทความ... (รองรับ HTML)"
                    />
                    <p className="text-xs text-gray-500 mt-1">รองรับ HTML tags เช่น &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;a&gt;</p>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      บทสรุป
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900"
                      placeholder="สรุปสั้น ๆ สำหรับแสดงในรายการ..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        หมวดหมู่
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                      >
                        <option value="general">ทั่วไป</option>
                        <option value="tips">เคล็ดลับ</option>
                        <option value="news">ข่าวสาร</option>
                        <option value="promotion">โปรโมชั่น</option>
                        <option value="review">รีวิว</option>
                      </select>
                    </div>

                    {/* Published */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        สถานะ
                      </label>
                      <select
                        value={formData.published ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, published: e.target.value === 'true' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                      >
                        <option value="true">เผยแพร่</option>
                        <option value="false">ฉบับร่าง</option>
                      </select>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiImage className="inline mr-1" />
                      URL รูปภาพปก
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiTag className="inline mr-1" />
                      แท็ก (คั่นด้วยเครื่องหมายจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                      placeholder="พัทยา, เที่ยวทะเล, pool villa"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <FiSave />
                    บันทึก
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
