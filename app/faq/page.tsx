'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaQuestionCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaThumbsUp,
  FaThumbsDown,
  FaHome,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaComments,
} from 'react-icons/fa'
import { SiLine } from 'react-icons/si'

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
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faq?activeOnly=true')
      const data = await response.json()
      setFaqs(data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (id: string) => {
    try {
      await fetch(`/api/faq?id=${id}&action=view`, {
        method: 'PATCH',
      })
    } catch (error) {
      console.error('Error updating view:', error)
    }
  }

  const handleFeedback = async (id: string, isHelpful: boolean) => {
    try {
      await fetch(`/api/faq?id=${id}&action=${isHelpful ? 'helpful' : 'notHelpful'}`, {
        method: 'PATCH',
      })
      fetchFAQs()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      handleView(id)
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'booking':
        return { name: '📅 การจอง', color: 'from-blue-500 to-cyan-500' }
      case 'payment':
        return { name: '💳 การชำระเงิน', color: 'from-green-500 to-emerald-500' }
      case 'facilities':
        return { name: '🏊 สิ่งอำนวยความสะดวก', color: 'from-purple-500 to-pink-500' }
      case 'policies':
        return { name: '📋 นโยบาย', color: 'from-orange-500 to-red-500' }
      default:
        return { name: '📌 อื่นๆ', color: 'from-gray-500 to-slate-500' }
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'ทั้งหมด', icon: '📚' },
    { value: 'booking', label: 'การจอง', icon: '📅' },
    { value: 'payment', label: 'การชำระเงิน', icon: '💳' },
    { value: 'facilities', label: 'สิ่งอำนวยความสะดวก', icon: '🏊' },
    { value: 'policies', label: 'นโยบาย', icon: '📋' },
    { value: 'other', label: 'อื่นๆ', icon: '📌' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-6 bg-white/80 backdrop-blur-xl rounded-3xl px-8 py-4 border border-white/20 shadow-xl">
            <FaQuestionCircle className="text-6xl text-gradient bg-gradient-to-r from-blue-600 to-purple-600 animate-bounce" />
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              FAQ
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 font-semibold max-w-3xl mx-auto">
            คำถามที่พบบ่อย - ตอบทุกข้อสงสัยของคุณ
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="ค้นหาคำถาม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-gray-900 text-lg font-semibold"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-semibold">กำลังโหลด...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/20">
            <FaQuestionCircle className="text-8xl text-gray-300 mx-auto mb-6" />
            <p className="text-gray-500 text-xl font-semibold">ไม่พบคำถามที่คุณค้นหา</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => {
              const category = getCategoryName(faq.category)
              const isExpanded = expandedId === faq.id

              return (
                <div
                  key={faq.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/20 overflow-hidden"
                >
                  {/* Question */}
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1 flex items-start gap-4">
                      <div className={`bg-gradient-to-r ${category.color} text-white rounded-full p-3 flex-shrink-0`}>
                        <FaQuestionCircle className="text-2xl" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-gray-500 mb-1 block">
                          {category.name}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <FaChevronUp className="text-2xl text-blue-600" />
                      ) : (
                        <FaChevronDown className="text-2xl text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Answer */}
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>

                      {/* Feedback */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>คำตอบนี้มีประโยชน์หรือไม่?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFeedback(faq.id, true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold"
                          >
                            <FaThumbsUp />
                            มีประโยชน์ ({faq.helpful})
                          </button>
                          <button
                            onClick={() => handleFeedback(faq.id, false)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                          >
                            <FaThumbsDown />
                            ไม่มีประโยชน์ ({faq.notHelpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <FaComments className="text-6xl mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">ไม่พบคำตอบที่ต้องการ?</h2>
            <p className="text-xl text-white/90 font-medium">ติดต่อเราได้ทันทีผ่านช่องทางเหล่านี้</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="tel:0812345678"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <FaPhone className="text-4xl mx-auto mb-3" />
              <p className="font-bold text-lg">โทรศัพท์</p>
              <p className="text-sm text-white/80">081-234-5678</p>
            </a>

            <a
              href="mailto:info@poolvilla.com"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <FaEnvelope className="text-4xl mx-auto mb-3" />
              <p className="font-bold text-lg">อีเมล</p>
              <p className="text-sm text-white/80">info@poolvilla.com</p>
            </a>

            <a
              href="https://wa.me/66812345678"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <FaWhatsapp className="text-4xl mx-auto mb-3" />
              <p className="font-bold text-lg">WhatsApp</p>
              <p className="text-sm text-white/80">แชทตอนนี้</p>
            </a>

            <a
              href="https://line.me/ti/p/@poolvilla"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <SiLine className="text-4xl mx-auto mb-3" />
              <p className="font-bold text-lg">LINE</p>
              <p className="text-sm text-white/80">@poolvilla</p>
            </a>
          </div>
        </div>

        {/* Back Home Button */}
        <div className="mt-12 text-center">
          <Link href="/">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
              <FaHome />
              กลับสู่หน้าแรก
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
