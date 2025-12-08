'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  FaImages,
  FaVrCardboard,
  FaVideo,
  FaPlane,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaStar,
  FaEye,
  FaArrowLeft,
} from 'react-icons/fa'
import type { RoomGallery, GalleryImage, VRTour, Video, DroneView } from '@/types/gallery'

export default function AdminGalleryPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<RoomGallery[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'image' | 'vr' | 'video' | 'drone'>('image')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    category: 'interior',
    videoType: 'tour',
    order: 0,
    isFeatured: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [galleriesRes, roomsRes] = await Promise.all([
        fetch('/api/gallery'),
        fetch('/api/rooms'),
      ])

      const galleriesData = await galleriesRes.json()
      const roomsData = await roomsRes.json()

      setGalleries(Array.isArray(galleriesData) ? galleriesData : [])
      setRooms(Array.isArray(roomsData) ? roomsData : [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('ไม่สามารถโหลดข้อมูลได้')
      setLoading(false)
    }
  }

  const getCurrentGallery = () => {
    return galleries.find((g) => g.roomId === selectedRoom)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnailUrl: '',
      category: 'interior',
      videoType: 'tour',
      order: 0,
      isFeatured: false,
    })
    setShowModal(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      url: item.url || item.imageUrl || item.videoUrl || item.panoramaUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      category: item.category || 'interior',
      videoType: item.type || 'tour',
      order: item.order || 0,
      isFeatured: item.isFeatured || false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) {
      setError('กรุณาเลือกห้องพัก')
      return
    }

    try {
      const data: any = {
        title: formData.title,
        description: formData.description,
        order: formData.order,
      }

      // Add type-specific fields
      if (activeTab === 'image') {
        data.url = formData.url
        data.category = formData.category
        data.isFeatured = formData.isFeatured
      } else if (activeTab === 'vr') {
        data.title = formData.title
        data.thumbnailUrl = formData.thumbnailUrl
        data.panoramaUrl = formData.url
        data.hotspots = []
      } else if (activeTab === 'video') {
        data.videoUrl = formData.url
        data.thumbnailUrl = formData.thumbnailUrl
        data.type = formData.videoType
        data.duration = ''
      } else if (activeTab === 'drone') {
        data.imageUrl = formData.url
        data.videoUrl = formData.thumbnailUrl
        data.description = formData.description
      }

      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem
        ? { roomId: selectedRoom, type: activeTab, itemId: editingItem.id, data }
        : { roomId: selectedRoom, type: activeTab, data }

      const response = await fetch('/api/gallery', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setMessage(editingItem ? 'อัปเดตสำเร็จ' : 'เพิ่มสำเร็จ')
        setShowModal(false)
        fetchData()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError('เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!selectedRoom || !confirm('คุณแน่ใจหรือไม่ที่จะลบ?')) return

    try {
      const response = await fetch(
        `/api/gallery?roomId=${selectedRoom}&type=${activeTab}&itemId=${itemId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setMessage('ลบสำเร็จ')
        fetchData()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('เกิดข้อผิดพลาด')
    }
  }

  const renderItems = () => {
    const gallery = getCurrentGallery()
    if (!gallery) return <p className="text-gray-500">ยังไม่มีข้อมูล</p>

    let items: any[] = []
    if (activeTab === 'image') items = gallery.images
    else if (activeTab === 'vr') items = gallery.vrTours
    else if (activeTab === 'video') items = gallery.videos
    else if (activeTab === 'drone') items = gallery.droneViews

    if (items.length === 0) {
      return <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูล</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border-2 border-purple-100 hover:border-purple-300 transform hover:scale-105"
          >
            <div className="relative h-56 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
              {(item.url || item.imageUrl || item.thumbnailUrl) && (
                <img
                  src={item.url || item.imageUrl || item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              {item.isFeatured && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg">
                  <FaStar /> Featured
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-black text-xl text-gray-900 mb-3">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {item.category && (
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-bold">
                    {item.category}
                  </span>
                )}
                {item.type && (
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-xs font-bold">
                    {item.type}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaEdit /> แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaTrash /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-bold">กำลังโหลด...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl mb-6"
            >
              <FaArrowLeft />
              <span>กลับสู่หน้า Admin</span>
            </Link>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-200">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-4 mb-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl">
                  <FaImages className="text-white text-4xl" />
                </div>
                Gallery Management
              </h1>
              <p className="text-gray-600 text-lg ml-20">จัดการแกลเลอรี่ VR Tour วิดีโอ และ Drone View</p>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl text-green-800 font-bold shadow-lg flex items-center gap-3">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <FaStar />
              </div>
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl text-red-800 font-bold shadow-lg flex items-center gap-3">
              <div className="bg-red-500 text-white p-2 rounded-full">
                <FaTimes />
              </div>
              {error}
            </div>
          )}

          {/* Room Selector */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-100">
            <label className="block text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <FaImages className="text-purple-600" />
              เลือกห้องพัก
            </label>
            <select
              value={selectedRoom || ''}
              onChange={(e) => setSelectedRoom(Number(e.target.value))}
              className="w-full px-6 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 font-bold text-lg transition-all hover:border-purple-400"
            >
              <option value="">-- เลือกห้องพัก --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {selectedRoom && (
            <>
              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-100">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FaEye className="text-purple-600" />
                  เลือกประเภทเนื้อหา
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 ${
                      activeTab === 'image'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaImages /> รูปภาพ
                  </button>
                  <button
                    onClick={() => setActiveTab('vr')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 ${
                      activeTab === 'vr'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                    }`}
                  >
                    <FaVrCardboard /> VR Tour
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 ${
                      activeTab === 'video'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                    }`}
                  >
                    <FaVideo /> วิดีโอ
                  </button>
                  <button
                    onClick={() => setActiveTab('drone')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 ${
                      activeTab === 'drone'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                    }`}
                  >
                    <FaPlane /> Drone View
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                >
                  <FaPlus className="text-xl" /> เพิ่มรายการใหม่
                </button>
              </div>

              {/* Items Grid */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  {activeTab === 'image' && <><FaImages className="text-purple-600" /> รูปภาพ</>}
                  {activeTab === 'vr' && <><FaVrCardboard className="text-purple-600" /> VR Tour</>}
                  {activeTab === 'video' && <><FaVideo className="text-purple-600" /> วิดีโอ</>}
                  {activeTab === 'drone' && <><FaPlane className="text-purple-600" /> Drone View</>}
                </h3>
                {renderItems()}
              </div>
            </>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-200 animate-slideIn">
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white p-8 rounded-t-3xl shadow-lg">
                  <h2 className="text-3xl font-black flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-xl">
                      {editingItem ? <FaEdit className="text-2xl" /> : <FaPlus className="text-2xl" />}
                    </div>
                    <div>
                      <div className="text-2xl">{editingItem ? 'แก้ไข' : 'เพิ่ม'}</div>
                      <div className="text-lg font-normal opacity-90">
                        {activeTab === 'image' && 'รูปภาพ'}
                        {activeTab === 'vr' && 'VR Tour'}
                        {activeTab === 'video' && 'วิดีโอ'}
                        {activeTab === 'drone' && 'Drone View'}
                      </div>
                    </div>
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div>
                    <label className="block text-base font-black text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-red-500">*</span> ชื่อ
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg transition-all"
                      placeholder="ระบุชื่อ..."
                    />
                  </div>

                  <div>
                    <label className="block text-base font-black text-gray-900 mb-3">
                      คำอธิบาย
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg transition-all"
                      placeholder="คำอธิบาย (ถ้ามี)..."
                    />
                  </div>

                  <div>
                    <label className="block text-base font-black text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      {activeTab === 'image' && 'URL รูปภาพ'}
                      {activeTab === 'vr' && 'URL ภาพ 360°'}
                      {activeTab === 'video' && 'URL วิดีโอ'}
                      {activeTab === 'drone' && 'URL รูปภาพ'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg transition-all"
                      placeholder="https://..."
                    />
                  </div>

                  {(activeTab === 'vr' || activeTab === 'video') && (
                    <div>
                      <label className="block text-base font-black text-gray-900 mb-3">
                        URL Thumbnail
                      </label>
                      <input
                        type="text"
                        value={formData.thumbnailUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, thumbnailUrl: e.target.value })
                        }
                        className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {activeTab === 'image' && (
                    <>
                      <div>
                        <label className="block text-base font-black text-gray-900 mb-3">
                          หมวดหมู่
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg font-bold transition-all"
                        >
                          <option value="interior">ภายใน</option>
                          <option value="exterior">ภายนอก</option>
                          <option value="amenities">สิ่งอำนวยความสะดวก</option>
                          <option value="pool">สระว่ายน้ำ</option>
                          <option value="view">ทิวทัศน์</option>
                          <option value="other">อื่นๆ</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({ ...formData, isFeatured: e.target.checked })
                          }
                          className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                        />
                        <label htmlFor="isFeatured" className="font-black text-gray-900 cursor-pointer flex items-center gap-2">
                          <FaStar className="text-yellow-500" /> แสดงเป็นรูปเด่น
                        </label>
                      </div>
                    </>
                  )}

                  {activeTab === 'video' && (
                    <div>
                      <label className="block text-base font-black text-gray-900 mb-3">
                        ประเภทวิดีโอ
                      </label>
                      <select
                        value={formData.videoType}
                        onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg font-bold transition-all"
                      >
                        <option value="tour">Tour</option>
                        <option value="drone">Drone</option>
                        <option value="review">Review</option>
                        <option value="feature">Feature</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      ลำดับการแสดง
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      <FaSave className="text-xl" /> บันทึก
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:from-gray-600 hover:to-gray-700 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      <FaTimes /> ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
