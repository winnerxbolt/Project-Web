'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiUser, FiEye, FiArrowRight, FiX, FiBookOpen } from 'react-icons/fi'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  coverImage?: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  views: number
}

export default function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?published=true&limit=6')
      const data = await res.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReadMore = async (article: Article) => {
    setSelectedArticle(article)
    
    // Update view count
    try {
      await fetch('/api/articles/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id })
      })
    } catch (error) {
      console.error('Failed to update views:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) return null

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-teal-100 px-4 py-2 rounded-full mb-4">
              <FiBookOpen className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">บทความและข่าวสาร</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Stories & Updates
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              เรื่องราวและข้อมูลที่น่าสนใจจาก Poolvilla Pattaya พร้อมเคล็ดลับการเที่ยว
            </p>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100">
                  {/* Cover Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-400 to-teal-400 overflow-hidden">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiBookOpen className="text-white text-6xl opacity-30" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-blue-500" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiEye className="text-teal-500" />
                        <span>{article.views}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
                      {article.excerpt}
                    </p>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                          {article.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{article.author}</span>
                      </div>

                      <button
                        onClick={() => handleReadMore(article)}
                        className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all duration-300"
                      >
                        อ่านเพิ่มเติม
                        <FiArrowRight className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-teal-500">
                {selectedArticle.coverImage && (
                  <img
                    src={selectedArticle.coverImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600 inline-block mb-3">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <FiUser />
                      <span>{selectedArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock />
                      <span>{formatDate(selectedArticle.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiEye />
                      <span>{selectedArticle.views} views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content - แสดงเนื้อหาชัดเจน */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)] bg-white">
                {/* เนื้อหาหลัก */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap"
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {selectedArticle.content}
                  </div>
                </div>
                
                {/* Tags */}
                {selectedArticle.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">แท็ก:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags && selectedArticle.tags.length > 0 && selectedArticle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button - ย้ายมาด้านล่างตรงกลาง */}
                <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <FiX className="text-xl" />
                    <span>ปิด</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
