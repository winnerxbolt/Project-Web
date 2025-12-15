'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHome, FaYoutube, FaPlay, FaArrowLeft, FaEye, FaTag, FaFire, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import PoolButton from '@/components/PoolButton'
import PoolCard from '@/components/PoolCard'

interface Video {
  id: string
  room_id?: number
  video_url: string
  thumbnail_url?: string
  title: string
  description?: string
  duration?: number
  order_index?: number
  active: boolean
  created_at: string
  // For display compatibility
  youtubeUrl?: string
  category?: 'poolvilla' | 'room_tour' | 'amenities' | 'promotion' | 'other'
  tags?: string[]
  isActive?: boolean
  viewCount?: number
}

export default function VideoReviewsPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/videos?activeOnly=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }
      
      const data = await response.json()
      
      // Transform data to ensure compatibility
      const transformedVideos = data.map((video: any) => ({
        ...video,
        youtubeUrl: video.video_url || video.youtubeUrl,
        category: getCategoryFromUrl(video.video_url) || 'other',
        tags: video.tags || [],
        isActive: video.active,
        viewCount: 0 // Since we don't have view_count in DB yet
      }))
      
      setVideos(transformedVideos)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('ไม่สามารถโหลดวิดีโอได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryFromUrl = (url: string): string => {
    if (!url) return 'other'
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('poolvilla') || lowerUrl.includes('pool')) return 'poolvilla'
    if (lowerUrl.includes('room') || lowerUrl.includes('tour')) return 'room_tour'
    if (lowerUrl.includes('promo') || lowerUrl.includes('discount')) return 'promotion'
    return 'other'
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
    if (typeof url !== 'string' || !url) return null
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = extractYoutubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  const getYoutubeThumbnail = (url: string): string => {
    const videoId = extractYoutubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/images/default-video-thumb.jpg'
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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pool-dark via-pool-blue to-tropical-dark flex items-center justify-center">
        <PoolCard variant="glass" className="max-w-lg mx-4 text-center">
          <FaExclamationTriangle className="text-6xl text-yellow-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <PoolButton onClick={fetchVideos} variant="luxury">
            ลองใหม่อีกครั้ง
          </PoolButton>
        </PoolCard>
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
          <div className="inline-flex items-center justify-center gap-4 mb-6 bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-4 border border-white/20 shadow-2xl">
            <FaYoutube className="text-6xl text-red-500 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pool-light to-tropical-mint">
              VIDEO REVIEWS
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto mb-8 drop-shadow-lg">
            🎬 ชมประสบการณ์จริงจากผู้ที่เคยมาใช้บริการ
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                filterCategory === 'all'
                  ? 'bg-white text-pool-blue shadow-xl scale-105 ring-4 ring-white/30'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              ทั้งหมด ({videos.length})
            </button>
            <button
              onClick={() => setFilterCategory('poolvilla')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                filterCategory === 'poolvilla'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl scale-105 ring-4 ring-blue-400/30'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              🏊 Poolvilla ({videos.filter((v) => v.category === 'poolvilla').length})
            </button>
            <button
              onClick={() => setFilterCategory('promotion')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                filterCategory === 'promotion'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-105 ring-4 ring-purple-400/30'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              🎉 โปรโมชั่น ({videos.filter((v) => v.category === 'promotion').length})
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <PoolCard variant="glass" className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <FaYoutube className="text-[200px]" />
              </div>
              <div className="relative z-10">
                <FaYoutube className="text-7xl text-pool-light/50 mx-auto mb-6 animate-bounce" />
                <p className="text-white text-2xl font-semibold mb-2">ยังไม่มีรีวิววิดีโอในหมวดนี้</p>
                <p className="text-white/70 text-lg mb-6">กำลังอัปเดตเนื้อหาใหม่เร็วๆ นี้</p>
                {filterCategory !== 'all' && (
                  <PoolButton onClick={() => setFilterCategory('all')} variant="luxury">
                    ดูวิดีโอทั้งหมด
                  </PoolButton>
                )}
              </div>
            </div>
          </PoolCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <PoolCard
                key={video.id}
                variant="gradient"
                className="overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                {/* Video Player */}
                <div 
                  className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden mb-4 cursor-pointer shadow-lg"
                  onClick={() => {
                    setPlayingVideo(video.id)
                    incrementViewCount(video.id)
                  }}
                >
                  {/* Show thumbnail when not playing */}
                  {playingVideo !== video.id ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all"
                      style={{ backgroundImage: `url(${video.thumbnail_url || getYoutubeThumbnail(video.youtubeUrl || video.video_url)})` }}
                    >
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-all">
                        <div className="bg-red-600 rounded-full p-6 group-hover:scale-110 group-hover:bg-red-500 transition-all shadow-2xl">
                          <FaPlay className="text-white text-3xl ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* YouTube Embed (shown when playing) */
                    <iframe
                      className="w-full h-full"
                      src={`${getYoutubeEmbedUrl(video.youtubeUrl || video.video_url)}?autoplay=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                  
                  {/* Close button when video is playing */}
                  {playingVideo === video.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPlayingVideo(null)
                      }}
                      className="absolute top-3 right-3 z-20 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white p-2 rounded-full transition-all hover:scale-110"
                      title="ปิดวิดีโอ"
                    >
                      <FaTimes className="text-lg" />
                    </button>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                      {getCategoryName(video.category || 'other')}
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  {video.duration && playingVideo !== video.id && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 backdrop-blur-sm rounded-full p-3 mt-1 border-2 border-red-400/50 flex-shrink-0 shadow-lg">
                    <FaYoutube className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-luxury-gold transition-colors line-clamp-2 drop-shadow">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {video.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 rounded-lg text-xs font-semibold border border-purple-400/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-white/60 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <FaEye className="text-pool-light" />
                        <span>{typeof video.viewCount === 'number' ? video.viewCount.toLocaleString() : '0'} ครั้ง</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaTag className="text-tropical-mint" />
                        <span className="text-xs">{getCategoryName(video.category || 'other')}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      {playingVideo !== video.id ? (
                        <button
                          className="flex-1 bg-gradient-to-r from-pool-blue to-blue-600 hover:from-blue-600 hover:to-pool-blue text-white text-sm py-3 px-4 rounded-xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPlayingVideo(video.id)
                            incrementViewCount(video.id)
                          }}
                        >
                          <FaPlay className="text-sm" />
                          เล่นวิดีโอ
                        </button>
                      ) : (
                        <button
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white text-sm py-3 px-4 rounded-xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPlayingVideo(null)
                          }}
                        >
                          <FaTimes className="text-sm" />
                          ปิดวิดีโอ
                        </button>
                      )}
                      <button
                        className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-sm py-3 px-4 rounded-xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(video.youtubeUrl || video.video_url, '_blank')
                        }}
                      >
                        <FaYoutube className="text-lg" />
                      </button>
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
