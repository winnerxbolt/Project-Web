'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHome, FaYoutube, FaPlay, FaArrowLeft, FaEye, FaTag, FaFire } from 'react-icons/fa'
import PoolButton from '@/components/PoolButton'
import PoolCard from '@/components/PoolCard'

interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl?: string
  category: 'poolvilla' | 'room_tour' | 'amenities' | 'promotion' | 'other'
  tags: string[]
  isActive: boolean
  viewCount: number
  createdAt: string
  notification?: {
    enabled: boolean
    type: 'promotion' | 'discount' | 'special_event' | 'new_video'
    reason: string
    couponCode?: string
    discount?: string
  }
}

export default function VideoReviewsPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos?activeOnly=true')
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async (videoId: string) => {
    try {
      await fetch('/api/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const extractYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = extractYoutubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'poolvilla':
        return '🏊 Poolvilla'
      case 'room_tour':
        return '🛏️ Room Tour'
      case 'amenities':
        return '🎯 สิ่งอำนวยความสะดวก'
      case 'promotion':
        return '🎉 โปรโมชั่น'
      default:
        return '📹 อื่นๆ'
    }
  }

  const filteredVideos = videos.filter((v) => {
    if (filterCategory === 'all') return true
    return v.category === filterCategory
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pool-dark via-pool-blue to-tropical-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">กำลังโหลดวิดีโอ...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pool-dark via-pool-blue to-tropical-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pool-light/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-tropical-mint/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/reviews">
            <PoolButton variant="luxury" className="gap-2">
              <FaArrowLeft />
              <span>กลับไปหน้ารีวิว</span>
            </PoolButton>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-6 bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-4 border border-white/20">
            <FaYoutube className="text-6xl text-luxury-gold animate-float" />
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pool-light to-tropical-mint">
              VIDEO REVIEWS
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto mb-8">
            🎬 ชมประสบการณ์จริงจากผู้ที่เคยมาใช้บริการ
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filterCategory === 'all'
                  ? 'bg-white text-pool-blue shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ทั้งหมด ({videos.length})
            </button>
            <button
              onClick={() => setFilterCategory('poolvilla')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filterCategory === 'poolvilla'
                  ? 'bg-white text-pool-blue shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🏊 Poolvilla ({videos.filter((v) => v.category === 'poolvilla').length})
            </button>
            <button
              onClick={() => setFilterCategory('promotion')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filterCategory === 'promotion'
                  ? 'bg-white text-pool-blue shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🎉 โปรโมชั่น ({videos.filter((v) => v.category === 'promotion').length})
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <PoolCard variant="glass" className="text-center py-16">
            <FaYoutube className="text-7xl text-pool-light/50 mx-auto mb-6" />
            <p className="text-white text-2xl font-semibold mb-2">ยังไม่มีรีวิววิดีโอ</p>
            <p className="text-white/70 text-lg">กำลังอัปเดตเนื้อหาใหม่เร็วๆ นี้</p>
          </PoolCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <PoolCard
                key={video.id}
                variant="gradient"
                className="overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                {/* Video Player */}
                <div 
                  className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-4 cursor-pointer"
                  onClick={() => incrementViewCount(video.id)}
                >
                  <iframe
                    className="w-full h-full"
                    src={getYoutubeEmbedUrl(video.youtubeUrl)}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  
                  {/* Special Badge */}
                  {video.notification?.enabled && (
                    <div className="absolute top-2 right-2 z-10">
                      {video.notification.type === 'promotion' && (
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                          <FaFire /> {video.notification.couponCode || 'โปรโมชั่น'}
                        </div>
                      )}
                      {video.notification.type === 'discount' && (
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                          💰 {video.notification.discount || 'ส่วนลด'}
                        </div>
                      )}
                      {video.notification.type === 'new_video' && (
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                          ✨ ใหม่
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex items-start gap-3">
                  <div className="bg-luxury-gold/20 backdrop-blur-sm rounded-full p-3 mt-1 border border-luxury-gold/30 flex-shrink-0">
                    <FaPlay className="text-luxury-gold text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-luxury-gold transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {video.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/10 text-white/80 rounded-lg text-xs font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notification Info */}
                    {video.notification?.enabled && video.notification.reason && (
                      <div className="mb-3 p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <p className="text-purple-200 text-xs font-semibold">
                          🎁 {video.notification.reason}
                        </p>
                        {video.notification.couponCode && (
                          <p className="text-orange-300 text-xs font-bold mt-1">
                            โค้ด: {video.notification.couponCode}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <div className="flex items-center gap-1">
                        <FaEye />
                        <span>{video.viewCount.toLocaleString()} ครั้ง</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaTag />
                        <span className="text-xs">{getCategoryName(video.category)}</span>
                      </div>
                    </div>

                    {/* Quick Action */}
                    <div 
                      className="w-full mt-3 bg-gradient-to-r from-pool-blue to-tropical-blue text-white text-sm py-2 px-4 rounded-xl font-bold cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                      onClick={() => window.open(video.youtubeUrl, '_blank')}
                    >
                      <FaYoutube />
                      ดูใน YouTube
                    </div>
                  </div>
                </div>
              </PoolCard>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link href="/">
            <PoolButton variant="primary" className="gap-2 text-lg px-8 py-4">
              <FaHome />
              <span>กลับสู่หน้าแรก</span>
            </PoolButton>
          </Link>
        </div>
      </div>
    </main>
  )
}
