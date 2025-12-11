'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import { FaInstagram, FaHeart, FaComment, FaPlay } from 'react-icons/fa'
import type { InstagramPost } from '@/types/social'

interface InstagramFeedProps {
  limit?: number
  className?: string
}

function InstagramFeed({ limit = 6, className = '' }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)

  const fetchInstagramPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/social?platform=instagram&limit=${limit}`)
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch Instagram posts:', error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchInstagramPosts()
  }, [fetchInstagramPosts])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'วันนี้'
    if (diffDays === 1) return 'เมื่อวาน'
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`
    return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={className}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <FaInstagram className="text-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Instagram Feed
              </h3>
              <p className="text-sm text-gray-600">@hotelname</p>
            </div>
          </div>
          
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <FaInstagram />
            ติดตาม
          </a>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Image/Video */}
              <img
                src={post.mediaUrl}
                alt={post.caption}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Video indicator */}
              {post.mediaType === 'VIDEO' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <FaPlay className="text-2xl text-purple-600 ml-1" />
                  </div>
                </div>
              )}

              {/* Carousel indicator */}
              {post.mediaType === 'CAROUSEL_ALBUM' && (
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                    <span className="text-sm">📷</span>
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white w-full">
                  <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <FaHeart />
                      {formatNumber(post.likeCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaComment />
                      {formatNumber(post.commentsCount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image/Video side */}
            <div className="flex-1 bg-black flex items-center justify-center">
              <img
                src={selectedPost.mediaUrl}
                alt={selectedPost.caption}
                className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
              />
            </div>

            {/* Info side */}
            <div className="w-full md:w-96 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <FaInstagram className="text-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">@hotelname</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedPost.timestamp)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Caption */}
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{selectedPost.caption}</p>
              </div>

              {/* Stats & Actions */}
              <div className="p-4 border-t space-y-3">
                <div className="flex items-center gap-6 text-gray-700">
                  <span className="flex items-center gap-2">
                    <FaHeart className="text-red-500 text-xl" />
                    <span className="font-semibold">{formatNumber(selectedPost.likeCount)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <FaComment className="text-blue-500 text-xl" />
                    <span className="font-semibold">{formatNumber(selectedPost.commentsCount)}</span>
                  </span>
                </div>
                
                <a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <FaInstagram />
                  ดูใน Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(InstagramFeed)
