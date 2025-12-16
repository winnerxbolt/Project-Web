'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiVideo, FiYoutube } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  videoType: 'youtube' | 'vimeo' | 'mp4'
  category: string
  published: boolean
  createdAt: string
  updatedAt: string
  views: number
}

export default function VideosAdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <VideosAdminContent />
    </ProtectedRoute>
  )
}

function VideosAdminContent() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    videoType: 'youtube' as 'youtube' | 'vimeo' | 'mp4',
    category: 'general',
    published: true
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }
      const data = await response.json()
      
      // Convert API format to component format
      const formattedVideos = data.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        videoType: 'youtube' as const,
        category: video.category || 'general',
        published: video.active !== false,
        createdAt: video.created_at,
        updatedAt: video.created_at,
        views: video.viewCount || 0
      }))
      
      setVideos(formattedVideos)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      alert('ไม่สามารถโหลดวิดีโอได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingVideo(null)
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      videoType: 'youtube',
      category: 'general',
      published: true
    })
    setShowModal(true)
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      videoType: video.videoType,
      category: video.category,
      published: video.published
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const videoData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.videoUrl,
        thumbnail_url: formData.thumbnailUrl || null,
        category: formData.category,
        active: formData.published
      }

      let response
      if (editingVideo) {
        // Update existing video
        response = await fetch(`/api/videos?id=${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVideo.id, ...videoData })
        })
      } else {
        // Create new video
        response = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(videoData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save video')
      }

      alert(editingVideo ? 'อัพเดทวิดีโอสำเร็จ!' : 'เพิ่มวิดีโอสำเร็จ!')
      setShowModal(false)
      fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
      alert('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวิดีโอนี้?')) return
    
    try {
      const response = await fetch(`/api/videos?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete video')
      }

      alert('ลบวิดีโอสำเร็จ!')
      fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('เกิดข้อผิดพลาดในการลบวิดีโอ: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const getVideoEmbed = (url: string, type: string) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                จัดการวิดีโอ
              </h1>
              <p className="text-gray-600 mt-1">อัพโหลดและจัดการวิดีโอประชาสัมพันธ์ Pool Villa</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <FiPlus />
              เพิ่มวิดีโอใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">ยังไม่มีวิดีโอ</h3>
            <p className="text-gray-600 mb-6">เริ่มเพิ่มวิดีโอแรกของคุณตอนนี้</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700"
            >
              <FiPlus />
              เพิ่มวิดีโอใหม่
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-red-400 to-pink-400">
                  <iframe
                    src={getVideoEmbed(video.videoUrl, video.videoType)}
                    className="w-full h-full"
                    allowFullScreen
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      video.published ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {video.published ? '🟢 เผยแพร่' : '🔴 ฉบับร่าง'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                      {video.videoType.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{video.views} views</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {video.description}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                    >
                      <FiEdit2 />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
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
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingVideo ? 'แก้ไขวิดีโอ' : 'เพิ่มวิดีโอใหม่'}
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
                      ชื่อวิดีโอ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-gray-900 font-medium"
                      placeholder="Pool Villa Tour 2024"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiYoutube className="inline mr-1" />
                      URL วิดีโอ *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-gray-900"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">รองรับ YouTube, Vimeo, หรือ MP4 URL</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      คำอธิบาย
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all resize-none text-gray-900"
                      placeholder="อธิบายเกี่ยวกับวิดีโอ..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Video Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ประเภทวิดีโอ
                      </label>
                      <select
                        value={formData.videoType}
                        onChange={(e) => setFormData({ ...formData, videoType: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-gray-900"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="mp4">MP4</option>
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-gray-900"
                      >
                        <option value="true">เผยแพร่</option>
                        <option value="false">ฉบับร่าง</option>
                      </select>
                    </div>
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiVideo className="inline mr-1" />
                      URL รูปภาพปก (ถ้ามี)
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-gray-900"
                      placeholder="https://example.com/thumbnail.jpg"
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
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
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
