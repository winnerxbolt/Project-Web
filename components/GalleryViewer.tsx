'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FaImages,
  FaVrCardboard,
  FaVideo,
  FaPlane,
  FaTimes,
  FaExpand,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaEye,
} from 'react-icons/fa'

interface GalleryViewerProps {
  roomId: number
  initialTab?: 'image' | 'vr' | 'video' | 'drone'
}

export default function GalleryViewer({ roomId, initialTab = 'image' }: GalleryViewerProps) {
  const [gallery, setGallery] = useState<any>(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedImage, setSelectedImage] = useState<number>(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const vrViewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGallery()
  }, [roomId])

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/gallery?roomId=${roomId}`)
      const data = await response.json()
      setGallery(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching gallery:', error)
      setLoading(false)
    }
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    const images = gallery?.images || []
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = gallery?.images || []
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  // Initialize 360° VR Viewer using Photo Sphere Viewer or similar
  useEffect(() => {
    if (activeTab === 'vr' && gallery?.vrTours && gallery.vrTours.length > 0 && vrViewerRef.current) {
      // Here you would initialize a 360° viewer library like Photo Sphere Viewer
      // For now, we'll use a simple iframe or image fallback
    }
  }, [activeTab, gallery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ยังไม่มีแกลเลอรี่</p>
      </div>
    )
  }

  const images = gallery.images || []
  const vrTours = gallery.vrTours || []
  const videos = gallery.videos || []
  const droneViews = gallery.droneViews || []

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl p-4 shadow-xl">
        {images.length > 0 && (
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaImages className="text-lg" />
            <span>รูปภาพ ({images.length})</span>
          </button>
        )}
        {vrTours.length > 0 && (
          <button
            onClick={() => setActiveTab('vr')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'vr'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaVrCardboard className="text-lg" />
            <span>VR Tour ({vrTours.length})</span>
          </button>
        )}
        {videos.length > 0 && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaVideo className="text-lg" />
            <span>วิดีโอ ({videos.length})</span>
          </button>
        )}
        {droneViews.length > 0 && (
          <button
            onClick={() => setActiveTab('drone')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'drone'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaPlane className="text-lg" />
            <span>มุมสูง ({droneViews.length})</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Image Gallery */}
        {activeTab === 'image' && (
          <div className="p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <FaImages className="text-purple-600" />
              แกลเลอรี่รูปภาพ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img: any, index: number) => (
                <div
                  key={img.id}
                  onClick={() => openLightbox(index)}
                  className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white">
                      <p className="font-bold">{img.title}</p>
                      {img.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                          <FaStar /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaEye />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VR Tour */}
        {activeTab === 'vr' && (
          <div className="p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <FaVrCardboard className="text-purple-600" />
              360° Virtual Tour
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vrTours.map((vr: any) => (
                <div
                  key={vr.id}
                  className="relative group overflow-hidden rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
                    <img
                      src={vr.thumbnailUrl || vr.panoramaUrl}
                      alt={vr.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="text-xl font-bold mb-1">{vr.title}</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <FaVrCardboard />
                        <span>คลิกเพื่อเข้าชม 360°</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                    <FaVrCardboard /> 360°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {activeTab === 'video' && (
          <div className="p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <FaVideo className="text-purple-600" />
              วิดีโอแนะนำ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video: any) => (
                <div
                  key={video.id}
                  className="relative group overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 p-6 rounded-full">
                      <FaPlay className="text-4xl text-purple-600" />
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-lg text-gray-900">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                    )}
                    {video.duration && (
                      <span className="inline-block mt-2 text-xs text-gray-500">
                        ⏱️ {video.duration}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {video.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drone Views */}
        {activeTab === 'drone' && (
          <div className="p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <FaPlane className="text-purple-600" />
              มุมมองจากโดรน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {droneViews.map((drone: any) => (
                <div
                  key={drone.id}
                  className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="aspect-video relative group">
                    <img
                      src={drone.imageUrl}
                      alt={drone.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {drone.videoUrl && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 p-4 rounded-full">
                          <FaPlay className="text-3xl text-purple-600" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <FaPlane className="text-purple-600" />
                      {drone.title}
                    </h4>
                    {drone.description && (
                      <p className="text-sm text-gray-600 mt-2">{drone.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-10"
          >
            <FaTimes className="text-2xl" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
          >
            <FaChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
          >
            <FaChevronRight className="text-2xl" />
          </button>

          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={images[selectedImage]?.url}
              alt={images[selectedImage]?.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-6 text-center">
              <h3 className="text-white text-2xl font-bold">
                {images[selectedImage]?.title}
              </h3>
              {images[selectedImage]?.description && (
                <p className="text-gray-300 mt-2">{images[selectedImage]?.description}</p>
              )}
              <p className="text-gray-400 mt-2">
                {selectedImage + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
