'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaMapPin,
  FaCompass,
  FaArrowLeft,
} from 'react-icons/fa'

interface Location {
  id: number
  roomId: number
  roomName?: string
  latitude: number
  longitude: number
  address: string
  nearbyPlaces: Array<{
    name: string
    type: string
    distance: string
    icon: string
  }>
  directions: {
    from: string
    to: string
    steps: string[]
  }
  mapSettings: {
    zoom: number
    showStreetView: boolean
  }
  updatedAt: string
}

export default function AdminLocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    roomId: 0,
    latitude: 12.9236,
    longitude: 100.8825,
    address: '',
    nearbyPlaces: [] as Array<{
      name: string
      type: string
      distance: string
      icon: string
    }>,
    directions: {
      from: 'Bangkok',
      to: '',
      steps: [] as string[],
    },
    mapSettings: {
      zoom: 15,
      showStreetView: true,
    },
  })

  const [newPlace, setNewPlace] = useState({
    name: '',
    type: '',
    distance: '',
    icon: '📍',
  })

  const [newStep, setNewStep] = useState('')

  useEffect(() => {
    fetchLocations()
    fetchRooms()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const data = await response.json()
      
      // Fetch room names
      const roomsRes = await fetch('/api/rooms')
      const roomsData = await roomsRes.json()
      
      if (Array.isArray(data)) {
        const locationsWithNames = data.map((loc: Location) => {
          const room = roomsData.rooms?.find((r: any) => r.id === loc.roomId)
          return { ...loc, roomName: room?.name || 'Unknown Room' }
        })
        setLocations(locationsWithNames)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location)
      setFormData({
        roomId: location.roomId,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        nearbyPlaces: location.nearbyPlaces || [],
        directions: location.directions || {
          from: 'Bangkok',
          to: location.address,
          steps: [],
        },
        mapSettings: location.mapSettings || {
          zoom: 15,
          showStreetView: true,
        },
      })
    } else {
      setEditingLocation(null)
      setFormData({
        roomId: 0,
        latitude: 12.9236,
        longitude: 100.8825,
        address: '',
        nearbyPlaces: [],
        directions: {
          from: 'Bangkok',
          to: '',
          steps: [],
        },
        mapSettings: {
          zoom: 15,
          showStreetView: true,
        },
      })
    }
    setShowModal(true)
    setError('')
    setMessage('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLocation(null)
    setNewPlace({ name: '', type: '', distance: '', icon: '📍' })
    setNewStep('')
  }

  const handleSave = async () => {
    if (!formData.roomId || !formData.latitude || !formData.longitude || !formData.address) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(editingLocation ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!')
        setTimeout(() => {
          setMessage('')
          handleCloseModal()
          fetchLocations()
        }, 1500)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) return

    try {
      const response = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage('ลบข้อมูลสำเร็จ!')
        setTimeout(() => setMessage(''), 2000)
        fetchLocations()
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const addNearbyPlace = () => {
    if (!newPlace.name || !newPlace.type || !newPlace.distance) {
      alert('กรุณากรอกข้อมูลสถานที่ให้ครบถ้วน')
      return
    }

    setFormData({
      ...formData,
      nearbyPlaces: [...formData.nearbyPlaces, newPlace],
    })
    setNewPlace({ name: '', type: '', distance: '', icon: '📍' })
  }

  const removeNearbyPlace = (index: number) => {
    setFormData({
      ...formData,
      nearbyPlaces: formData.nearbyPlaces.filter((_, i) => i !== index),
    })
  }

  const addDirectionStep = () => {
    if (!newStep.trim()) {
      alert('กรุณากรอกขั้นตอนการเดินทาง')
      return
    }

    setFormData({
      ...formData,
      directions: {
        ...formData.directions,
        steps: [...formData.directions.steps, newStep],
      },
    })
    setNewStep('')
  }

  const removeDirectionStep = (index: number) => {
    setFormData({
      ...formData,
      directions: {
        ...formData.directions,
        steps: formData.directions.steps.filter((_, i) => i !== index),
      },
    })
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <a
                  href="/admin"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-xl transition-all shadow-lg hover:scale-105"
                >
                  <FaArrowLeft className="text-xl" />
                </a>
                <h1 className="text-5xl font-black text-gray-900 flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  จัดการแผนที่และสถานที่
                </h1>
              </div>
              <p className="text-gray-600 mt-2">กำหนดตำแหน่งพิกัด, สถานที่ใกล้เคียง และเส้นทาง</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all"
            >
              <FaPlus />
              เพิ่มข้อมูลแผนที่
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 bg-green-50 border-2 border-green-300 text-green-700 px-6 py-4 rounded-2xl">
              {message}
            </div>
          )}

          {/* Locations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
              <FaMapMarkerAlt className="text-8xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">ยังไม่มีข้อมูลแผนที่</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all border-l-8 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{location.roomName}</h3>
                      <p className="text-sm text-gray-500">Room ID: {location.roomId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(location)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <FaMapPin className="text-red-500" />
                      <span className="font-semibold">พิกัด:</span> {location.latitude}, {location.longitude}
                    </div>
                    <div className="flex items-start gap-2">
                      <FaCompass className="text-green-500 mt-1" />
                      <div>
                        <span className="font-semibold">ที่อยู่:</span>
                        <p className="text-xs text-gray-600">{location.address}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        สถานที่ใกล้เคียง: <span className="font-bold">{location.nearbyPlaces?.length || 0}</span> แห่ง
                      </p>
                      <p className="text-xs text-gray-500">
                        ขั้นตอนเดินทาง: <span className="font-bold">{location.directions?.steps?.length || 0}</span> ขั้นตอน
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                      <FaMapMarkerAlt />
                      {editingLocation ? 'แก้ไขข้อมูลแผนที่' : 'เพิ่มข้อมูลแผนที่'}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                    >
                      <FaTimes className="text-2xl" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {error && (
                    <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl">
                      {error}
                    </div>
                  )}

                  {/* Room Selection */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">
                      เลือกห้องพัก <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: parseInt(e.target.value) })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900 font-semibold"
                      required
                    >
                      <option value={0}>-- เลือกห้องพัก --</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-3">
                        ละติจูด (Latitude) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900"
                        placeholder="12.9236"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-3">
                        ลองจิจูด (Longitude) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900"
                        placeholder="100.8825"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">
                      ที่อยู่ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900"
                      rows={3}
                      placeholder="123 ถนนพัทยา ตำบลหนองปรือ อำเภอบางละมุง จังหวัดชลบุรี 20150"
                      required
                    />
                  </div>

                  {/* Map Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-3">ระดับซูม</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.mapSettings.zoom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mapSettings: { ...formData.mapSettings, zoom: parseInt(e.target.value) },
                          })
                        }
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-3">แสดง Street View</label>
                      <select
                        value={formData.mapSettings.showStreetView ? 'true' : 'false'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mapSettings: { ...formData.mapSettings, showStreetView: e.target.value === 'true' },
                          })
                        }
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-gray-900 font-semibold"
                      >
                        <option value="true">ใช่</option>
                        <option value="false">ไม่</option>
                      </select>
                    </div>
                  </div>

                  {/* Nearby Places */}
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-4">สถานที่ใกล้เคียง</h3>
                    <div className="space-y-3 mb-4">
                      {formData.nearbyPlaces.map((place, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl"
                        >
                          <span className="text-2xl">{place.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{place.name}</p>
                            <p className="text-sm text-gray-600">{place.type} • {place.distance}</p>
                          </div>
                          <button
                            onClick={() => removeNearbyPlace(index)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Place Form */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newPlace.name}
                          onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                          placeholder="ชื่อสถานที่"
                          className="p-3 border-2 border-gray-300 rounded-xl text-gray-900"
                        />
                        <input
                          type="text"
                          value={newPlace.type}
                          onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
                          placeholder="ประเภท (เช่น ชายหาด, ห้าง)"
                          className="p-3 border-2 border-gray-300 rounded-xl text-gray-900"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={newPlace.distance}
                          onChange={(e) => setNewPlace({ ...newPlace, distance: e.target.value })}
                          placeholder="ระยะทาง (เช่น 2 km)"
                          className="col-span-2 p-3 border-2 border-gray-300 rounded-xl text-gray-900"
                        />
                        <input
                          type="text"
                          value={newPlace.icon}
                          onChange={(e) => setNewPlace({ ...newPlace, icon: e.target.value })}
                          placeholder="🏖️"
                          className="p-3 border-2 border-gray-300 rounded-xl text-gray-900 text-center text-2xl"
                        />
                      </div>
                      <button
                        onClick={addNearbyPlace}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                      >
                        + เพิ่มสถานที่
                      </button>
                    </div>
                  </div>

                  {/* Directions */}
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-4">คำแนะนำการเดินทาง</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 font-bold mb-2">จาก</label>
                        <input
                          type="text"
                          value={formData.directions.from}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              directions: { ...formData.directions, from: e.target.value },
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900"
                          placeholder="กรุงเทพฯ"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-2">ไป</label>
                        <input
                          type="text"
                          value={formData.directions.to}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              directions: { ...formData.directions, to: e.target.value },
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900"
                          placeholder="พัทยา"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {formData.directions.steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <p className="flex-1 text-gray-700">{step}</p>
                          <button
                            onClick={() => removeDirectionStep(index)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        placeholder="เพิ่มขั้นตอนการเดินทาง..."
                        className="flex-1 p-3 border-2 border-gray-300 rounded-xl text-gray-900"
                        onKeyPress={(e) => e.key === 'Enter' && addDirectionStep()}
                      />
                      <button
                        onClick={addDirectionStep}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                      >
                        + เพิ่ม
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-6 border-t">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all"
                    >
                      <FaSave />
                      บันทึก
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-8 py-4 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-all"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
