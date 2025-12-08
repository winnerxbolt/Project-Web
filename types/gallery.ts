export interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
  category: 'interior' | 'exterior' | 'amenities' | 'pool' | 'view' | 'other'
  order: number
  isFeatured: boolean
  uploadedAt: string
}

export interface VRTour {
  id: string
  title: string
  thumbnailUrl: string
  panoramaUrl: string // 360° image URL
  hotspots?: Array<{
    id: string
    x: number // Position in panorama
    y: number
    title: string
    description: string
    linkedTourId?: string // Link to another VR tour
  }>
  order: number
  createdAt: string
}

export interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl: string
  type: 'tour' | 'drone' | 'review' | 'feature'
  duration?: string
  order: number
  uploadedAt: string
}

export interface DroneView {
  id: string
  title: string
  imageUrl: string
  videoUrl?: string
  description?: string
  capturedAt: string
  order: number
}

export interface RoomGallery {
  id: number
  roomId: number
  roomName?: string
  images: GalleryImage[]
  vrTours: VRTour[]
  videos: Video[]
  droneViews: DroneView[]
  updatedAt: string
}

export interface GalleryFormData {
  roomId: number
  type: 'image' | 'vr' | 'video' | 'drone'
  title: string
  description?: string
  url: string
  thumbnailUrl?: string
  category?: string
  videoType?: string
  order: number
  isFeatured?: boolean
}
