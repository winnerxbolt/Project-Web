'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaPlay, FaEye, FaTag, FaTimes } from 'react-icons/fa'

interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl?: string
  thumbnail_url?: string
  viewCount: number
  tags: string[]
  createdAt: string
  isActive: boolean
  active: boolean
}

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  } catch (error) {
    console.error('Error extracting YouTube ID:', error)
    return null
  }
}

// Helper function to get YouTube thumbnail
function getYoutubeThumbnail(url: string): string {
  const videoId = extractYoutubeVideoId(url)
  return videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : '/images/placeholder-video.jpg'
}

// Helper function to get YouTube embed URL
function getYoutubeEmbedUrl(url: string): string {
  const videoId = extractYoutubeVideoId(url)
  return videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : ''
}

export default function VideoReviewsPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setVideos([])
      setSelectedVideo(null)
    }
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/videos')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Filter only active videos and ensure data integrity
      const activeVideos = (Array.isArray(data.videos) ? data.videos : [])
        .filter((video: Video) => 
          video && (video.isActive === true || video.active === true)
        )
        .map((video: Video) => ({
          ...video,
          viewCount: video.viewCount || 0,
          tags: Array.isArray(video.tags) ? video.tags : [],
          title: video.title || 'ไม่มีชื่อ',
          description: video.description || ''
        }))
      
      setVideos(activeVideos)
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดวิดีโอได้')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
    document.body.style.overflow = 'hidden' // Prevent background scroll
  }

  const closeModal = () => {
    setSelectedVideo(null)
    document.body.style.overflow = 'unset'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg font-semibold">กำลังโหลดวิดีโอรีวิว...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">เกิดข้อผิดพลาด</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchVideos}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 relative">
      {/* Header Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-lg text-white rounded-2xl hover:bg-opacity-30 transition-all duration-300 shadow-lg mb-8 font-semibold"
          >
            ← กลับไปหน้ารีวิว
          </Link>

          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="inline-block bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl px-8 py-6 mb-6 shadow-2xl">
              <h1 className="text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                📹 VIDEO REVIEWS
              </h1>
            </div>
            <p className="text-white text-xl font-semibold mb-8 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl px-6 py-3 inline-block shadow-lg">
              🎬 ชมประสบการณ์จริงจากผู้เคยมาใช้บริการ
            </p>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ทั้งหมด (1)
              </button>
              <button className="px-6 py-3 bg-white bg-opacity-30 backdrop-blur-lg text-white rounded-2xl font-bold hover:bg-opacity-40 transition-all duration-300 shadow-lg">
                🏊 Poolvilla (0)
              </button>
              <button className="px-6 py-3 bg-white bg-opacity-30 backdrop-blur-lg text-white rounded-2xl font-bold hover:bg-opacity-40 transition-all duration-300 shadow-lg">
                💎 ไม่ใช่พื้น (0)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="container mx-auto px-4 pb-12">
        {videos.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center">
              <div className="text-white text-7xl mb-6">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                ยังไม่มีวิดีโอรีวิว
              </h3>
              <p className="text-white text-opacity-90">
                กรุณารอการอัปเดตวิดีโอรีวิวจากลูกค้า
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-800 overflow-hidden">
                    <img
                      src={video.thumbnailUrl || video.thumbnail_url || getYoutubeThumbnail(video.youtubeUrl)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-video.jpg'
                      }}
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-yellow-400 rounded-full p-6 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                        <FaPlay className="text-gray-900 text-3xl ml-1" />
                      </div>
                    </div>

                    {/* View Count Badge */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 font-semibold shadow-lg">
                      <FaEye className="text-yellow-400" />
                      <span>{video.viewCount.toLocaleString()} ครั้ง</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-yellow-400 rounded-full p-2 flex-shrink-0">
                        <FaPlay className="text-gray-900 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-white text-opacity-80 text-sm line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {video.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1 font-semibold"
                          >
                            <FaTag className="text-yellow-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Watch Button */}
                    <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                      📺 ดูใน YouTube
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              {getYoutubeEmbedUrl(selectedVideo.youtubeUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl)}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>ไม่สามารถโหลดวิดีโอได้</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedVideo.title}
              </h2>
              {selectedVideo.description && (
                <p className="text-gray-300 mb-4">
                  {selectedVideo.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <FaEye className="text-yellow-400" />
                  {selectedVideo.viewCount.toLocaleString()} ครั้ง
                </span>
                {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}