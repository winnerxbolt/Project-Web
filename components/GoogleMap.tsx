'use client'

import { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaDirections, FaStreetView, FaExpand } from 'react-icons/fa'

interface Location {
  lat: number
  lng: number
  name?: string
  description?: string
}

interface NearbyPlace {
  name: string
  type: string
  distance: string
  icon: string
}

interface GoogleMapProps {
  location: Location
  nearbyPlaces?: NearbyPlace[]
  directions?: {
    from: string
    to: string
    steps: string[]
  }
  zoom?: number
  height?: string
  showStreetView?: boolean
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GoogleMap({
  location,
  nearbyPlaces = [],
  directions,
  zoom = 15,
  height = '500px',
  showStreetView = true,
}: GoogleMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeView, setActiveView] = useState<'map' | 'street'>('map')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const streetViewRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const streetViewInstanceRef = useRef<any>(null)

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // Check if API key is available
    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
      console.error('Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file')
      return
    }

    // Load Google Maps Script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
      }
      document.head.appendChild(script)
    } else {
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.google) {
      initializeMap()
    }
  }, [mapLoaded, location])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Initialize Map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: location.lat, lng: location.lng },
      zoom: zoom,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#4FB8FF' }],
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }],
        },
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: false,
    })

    mapInstanceRef.current = map

    // Add Main Marker
    const mainMarker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.name || 'Location',
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(50, 50),
      },
    })

    // Add Info Window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1e40af;">
            ${location.name || 'Poolvilla Pattaya'}
          </h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            ${location.description || 'พักผ่อนสุดหรูริมทะเล'}
          </p>
        </div>
      `,
    })

    mainMarker.addListener('click', () => {
      infoWindow.open(map, mainMarker)
    })

    // Add Nearby Places Markers
    nearbyPlaces.forEach((place, index) => {
      const offset = 0.01 * (index + 1)
      const marker = new window.google.maps.Marker({
        position: {
          lat: location.lat + offset * Math.cos((index * Math.PI) / 4),
          lng: location.lng + offset * Math.sin((index * Math.PI) / 4),
        },
        map: map,
        title: place.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(35, 35),
        },
      })

      const placeInfo = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <div style="font-size: 20px; margin-bottom: 4px;">${place.icon}</div>
            <h4 style="margin: 0 0 4px 0; font-weight: bold;">${place.name}</h4>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">${place.type}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #10b981;">📍 ${place.distance}</p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        placeInfo.open(map, marker)
      })
    })

    // Initialize Street View
    if (showStreetView && streetViewRef.current) {
      const streetView = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: location.lat, lng: location.lng },
        pov: { heading: 34, pitch: 10 },
        zoom: 1,
      })
      streetViewInstanceRef.current = streetView
      map.setStreetView(streetView)
    }
  }

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    window.open(url, '_blank')
  }

  const toggleFullscreen = () => {
    const container = mapRef.current?.parentElement
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  if (!mapLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-2xl"
        style={{ height }}
      >
        <div className="text-center">
          {!API_KEY || API_KEY === 'YOUR_API_KEY' ? (
            <>
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-bold text-lg">ไม่พบ Google Maps API Key</p>
              <p className="text-gray-600 mt-2">กรุณาเพิ่ม NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ใน .env.local</p>
            </>
          ) : (
            <>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-semibold">กำลังโหลดแผนที่...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex flex-wrap gap-3">
        {showStreetView && (
          <>
            <button
              onClick={() => setActiveView('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                activeView === 'map'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              <FaMapMarkerAlt className="text-lg" />
              <span>แผนที่</span>
            </button>
            <button
              onClick={() => setActiveView('street')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                activeView === 'street'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              <FaStreetView className="text-lg" />
              <span>Street View</span>
            </button>
          </>
        )}
        <button
          onClick={handleGetDirections}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
        >
          <FaDirections className="text-lg" />
          <span>นำทาง</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all shadow-lg"
        >
          <FaExpand className="text-lg" />
          <span>เต็มจอ</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200">
        <div
          ref={mapRef}
          className={`transition-all ${activeView === 'map' ? 'block' : 'hidden'}`}
          style={{ height }}
        />
        {showStreetView && (
          <div
            ref={streetViewRef}
            className={`transition-all ${activeView === 'street' ? 'block' : 'hidden'}`}
            style={{ height }}
          />
        )}
      </div>

      {/* Nearby Places Grid */}
      {nearbyPlaces.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📍</span>
            สถานที่ท่องเที่ยวใกล้เคียง
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyPlaces.map((place, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300"
              >
                <span className="text-4xl">{place.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900">{place.name}</h4>
                  <p className="text-sm text-gray-600">{place.type}</p>
                  <p className="text-xs text-green-600 font-bold">📍 {place.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directions */}
      {directions && (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <FaDirections className="text-blue-600" />
            คำแนะนำการเดินทาง
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-2xl">🚗</span>
              <div>
                <p className="font-bold text-gray-700">จาก: {directions.from}</p>
                <p className="font-bold text-gray-700">ไป: {directions.to}</p>
              </div>
            </div>
            <div className="space-y-2">
              {directions.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
