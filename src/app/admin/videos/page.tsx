'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa'

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

interface FormData {
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl: string
  tags: string[]
  category: string
  notification: {
    enabled: boolean
    message: string
  }
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    tags: [],
    category: '',
    notification: {
      enabled: false,
      message: ''
    }
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/videos')
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }
      
      const data = await response.json()
      
      const processedVideos = (Array.isArray(data.videos) ? data.videos : []).map((video: Video) => ({
        ...video,
        viewCount: video.viewCount || 0,
        tags: Array.isArray(video.tags) ? video.tags : [],
        isActive: Boolean(video.isActive || video.active),
        active: Boolean(video.isActive || video.active)
      }))
      
      setVideos(processedVideos)
    } catch (error) {
      console.error('Error fetching videos:', error)
      alert('ไม่สามารถโหลดวิดีโอได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = editingVideo
        ? { ...formData, id: editingVideo.id, isActive: true, active: true, notifyUsers: formData.notification.enabled }
        : { ...formData, isActive: true, active: true, notifyUsers: formData.notification.enabled }

      const response = await fetch('/api/videos', {
        method: editingVideo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save video')
      }

      alert(editingVideo ? 'อัปเดตวิดีโอสำเร็จ' : 'เพิ่มวิดีโอสำเร็จ')
      setShowForm(false)
      setEditingVideo(null)
      resetForm()
      fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
      alert(error instanceof Error ? error.message : 'ไม่สามารถบันทึกวิดีโอได้')
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title || '',
      description: video.description || '',
      youtubeUrl: video.youtubeUrl || '',
      thumbnailUrl: video.thumbnailUrl || video.thumbnail_url || '',
      tags: Array.isArray(video.tags) ? video.tags : [],
      category: '',
      notification: {
        enabled: false,
        message: ''
      }
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบวิดีโอนี้ใช่หรือไม่?')) return

    try {
      const response = await fetch(`/api/videos?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete video')
      }

      alert('ลบวิดีโอสำเร็จ')
      fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      alert(error instanceof Error ? error.message : 'ไม่สามารถลบวิดีโอได้')
    }
  }

  const handleToggleActive = async (video: Video) => {
    try {
      const newActiveStatus = !(video.isActive || video.active)
      
      const response = await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: video.id,
          title: video.title,
          description: video.description,
          youtubeUrl: video.youtubeUrl,
          thumbnailUrl: video.thumbnailUrl || video.thumbnail_url,
          tags: Array.isArray(video.tags) ? video.tags : [],
          isActive: newActiveStatus,
          active: newActiveStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update video status')
      }

      alert(newActiveStatus ? 'เผยแพร่วิดีโอแล้ว' : 'ซ่อนวิดีโอแล้ว')
      fetchVideos()
    } catch (error) {
      console.error('Error toggling video status:', error)
      alert(error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะได้')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      thumbnailUrl: '',
      tags: [],
      category: '',
      notification: {
        enabled: false,
        message: ''
      }
    })
    setEditingVideo(null)
  }

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการวิดีโอ</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> เพิ่มวิดีโอ
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingVideo ? 'แก้ไขวิดีโอ' : 'เพิ่มวิดีโอใหม่'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อวิดีโอ *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL *</label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="poolvilla">Pool Villa</option>
                  <option value="other">ไม่ใช่พื้น</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">แท็ก</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="เพิ่มแท็ก"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        handleAddTag(input.value)
                        input.value = ''
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingVideo ? 'อัปเดต' : 'เพิ่ม'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingVideo(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-video bg-gray-200">
              <img
                src={video.thumbnailUrl || video.thumbnail_url || '/images/placeholder-video.jpg'}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-video.jpg'
                }}
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleToggleActive(video)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    video.isActive || video.active
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {video.isActive || video.active ? 'เผยแพร่' : 'ไม่เผยแพร่'}
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {video.description || 'ไม่มีคำอธิบาย'}
              </p>
              
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <FaEye />
                <span>{(video.viewCount || 0).toLocaleString()} ครั้ง</span>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
                >
                  <FaEdit /> แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center gap-1"
                >
                  <FaTrash /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">ยังไม่มีวิดีโอ</p>
        </div>
      )}
    </div>
  )
}