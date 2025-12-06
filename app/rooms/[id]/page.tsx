'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import RoomCalendar from '@/components/RoomCalendar'
import { FaBed, FaUsers, FaExpand, FaStar, FaWifi, FaTv, FaSnowflake, FaCheck, FaTimes, FaUpload, FaFire } from 'react-icons/fa'
import { containsProfanity } from '@/lib/profanityFilter'

const getAmenityIcon = (amenityName: string) => {
  const lowerName = amenityName.toLowerCase()
  if (lowerName.includes('wifi')) return FaWifi
  if (lowerName.includes('tv')) return FaTv
  if (lowerName.includes('แอร์') || lowerName.includes('air')) return FaSnowflake
  return FaCheck
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // Review states
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewData, setReviewData] = useState({
    guestName: '',
    email: '',
    rating: 5,
    comment: ''
  })
  
  // Booking form data
  const [bookingData, setBookingData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    slipImage: ''
  })
  
  // Discount info
  const [discountInfo, setDiscountInfo] = useState<{
    totalDiscount: number
    discounts: Array<{ date: string; amount: number; reason: string }>
  } | null>(null)
  
  // Total amount
  const [totalAmount, setTotalAmount] = useState<number>(0)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        console.log('Fetching room with id:', resolvedParams.id)
        const response = await fetch('/api/rooms')
        const data = await response.json()
        console.log('Rooms data:', data)
        
        if (data.success) {
          const roomId = parseInt(resolvedParams.id)
          console.log('Looking for room with id:', roomId)
          console.log('Available rooms:', data.rooms.map((r: any) => ({ id: r.id, name: r.name })))
          
          const room = data.rooms.find((r: any) => r.id === roomId)
          console.log('Found room:', room)
          
          if (room) {
            setRoomData(room)
            setBookingData(prev => ({ ...prev, guests: Math.min(2, room.guests) }))
          } else {
            console.error('Room not found with id:', roomId)
          }
        } else {
          console.error('Failed to fetch rooms:', data)
        }
      } catch (error) {
        console.error('Error fetching room:', error)
      } finally {
        setLoading(false)
      }
    }
    
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?roomId=${resolvedParams.id}`)
        const data = await response.json()
        if (data.success) {
          setReviews(data.reviews)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    
    fetchRoom()
    fetchReviews()
  }, [resolvedParams.id])

  const calculateTotal = async () => {
    if (!roomData || !bookingData.checkIn || !bookingData.checkOut) return 0
    const checkInDate = new Date(bookingData.checkIn)
    const checkOutDate = new Date(bookingData.checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (nights <= 0) return 0

    // ตรวจสอบความพร้อมและส่วนลด
    try {
      const response = await fetch(
        `/api/check-availability?roomId=${resolvedParams.id}&startDate=${bookingData.checkIn}&endDate=${bookingData.checkOut}`
      )
      const data = await response.json()

      if (data.success) {
        const baseTotal = nights * roomData.price
        const totalDiscount = data.totalDiscount || 0
        return baseTotal - totalDiscount
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    }

    return nights * roomData.price
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBookingData(prev => ({ ...prev, [name]: value }))

    // ถ้าเปลี่ยนวันที่ ให้ตรวจสอบส่วนลดและคำนวณยอดรวม
    if ((name === 'checkIn' || name === 'checkOut') && bookingData.checkIn && bookingData.checkOut) {
      const checkIn = name === 'checkIn' ? value : bookingData.checkIn
      const checkOut = name === 'checkOut' ? value : bookingData.checkOut

      if (checkIn && checkOut && new Date(checkIn) < new Date(checkOut)) {
        try {
          const response = await fetch(
            `/api/check-availability?roomId=${resolvedParams.id}&startDate=${checkIn}&endDate=${checkOut}`
          )
          const data = await response.json()
          
          if (data.success && data.discounts.length > 0) {
            setDiscountInfo({
              totalDiscount: data.totalDiscount,
              discounts: data.discounts
            })
          } else {
            setDiscountInfo(null)
          }
          
          // คำนวณยอดรวม
          if (roomData) {
            const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
            const baseTotal = nights * roomData.price
            const totalDiscount = data.totalDiscount || 0
            setTotalAmount(baseTotal - totalDiscount)
          }
        } catch (error) {
          console.error('Error fetching discount info:', error)
        }
      }
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingLoading(true)
    setError('')
    setMessage('')

    // Check for profanity
    if (containsProfanity(bookingData.guestName)) {
      setError('ชื่อผู้เข้าพักมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setBookingLoading(false)
      return
    }
    if (containsProfanity(bookingData.email)) {
      setError('อีเมลมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setBookingLoading(false)
      return
    }

    try {
      // ตรวจสอบความพร้อมก่อน
      const availabilityResponse = await fetch(
        `/api/check-availability?roomId=${resolvedParams.id}&startDate=${bookingData.checkIn}&endDate=${bookingData.checkOut}`
      )
      const availabilityData = await availabilityResponse.json()

      if (!availabilityData.success) {
        setError('ไม่สามารถตรวจสอบความพร้อมได้')
        setBookingLoading(false)
        return
      }

      if (!availabilityData.available) {
        setError(`ไม่สามารถจองได้ วันที่ ${availabilityData.unavailableDates.join(', ')} ไม่ว่าง (จองแล้ว/ซ่อมแซม/วันหยุด)`)
        setBookingLoading(false)
        return
      }

      const total = await calculateTotal()
      
      if (total <= 0) {
        setError('กรุณาเลือกวันที่ถูกต้อง')
        setBookingLoading(false)
        return
      }

      const bookingPayload = {
        roomId: parseInt(resolvedParams.id),
        roomName: roomData.name,
        guestName: bookingData.guestName,
        email: bookingData.email,
        phone: bookingData.phone,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: Number(bookingData.guests),
        total: total,
        slipImage: bookingData.slipImage || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
        status: 'pending'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })

      const data = await response.json()

      if (data.success) {
        setMessage('จองสำเร็จ! รอการยืนยันจากแอดมิน')
        setTimeout(() => {
          setShowBookingModal(false)
          router.push('/rooms')
        }, 2000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการจอง')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewLoading(true)
    setError('')
    setMessage('')

    // Check for profanity
    if (containsProfanity(reviewData.guestName)) {
      setError('ชื่อมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setReviewLoading(false)
      return
    }
    if (containsProfanity(reviewData.comment)) {
      setError('ความคิดเห็นมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setReviewLoading(false)
      return
    }

    try {
      const reviewPayload = {
        roomId: parseInt(resolvedParams.id),
        roomName: roomData.name,
        guestName: reviewData.guestName,
        email: reviewData.email,
        rating: reviewData.rating,
        comment: reviewData.comment
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload)
      })

      const data = await response.json()

      if (data.success) {
        setMessage('ขอบคุณสำหรับรีวิว! รีวิวของคุณถูกบันทึกแล้ว')
        setReviewData({ guestName: '', email: '', rating: 5, comment: '' })
        
        // Refresh reviews and room data
        const reviewsRes = await fetch(`/api/reviews?roomId=${resolvedParams.id}`)
        const reviewsData = await reviewsRes.json()
        if (reviewsData.success) {
          setReviews(reviewsData.reviews)
        }
        
        const roomsRes = await fetch('/api/rooms')
        const roomsData = await roomsRes.json()
        if (roomsData.success) {
          const room = roomsData.rooms.find((r: any) => r.id === parseInt(resolvedParams.id))
          if (room) {
            setRoomData(room)
          }
        }
        
        setTimeout(() => {
          setShowReviewModal(false)
          setMessage('')
        }, 2000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการส่งรีวิว')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!roomData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">ไม่พบห้องพัก</h1>
              <button
                onClick={() => router.push('/rooms')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                กลับไปหน้าห้องพัก
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Prepare images array (use multiple images if available, or single image, or default)
  const images = roomData.images && roomData.images.length > 0 
    ? roomData.images 
    : roomData.image 
    ? [roomData.image] 
    : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074']

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Room Images */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <Image
                  src={images[selectedImage]}
                  alt={roomData.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative h-28 lg:h-32 rounded-lg overflow-hidden cursor-pointer border-4 ${
                      selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{roomData.name}</h1>
                  {/* Availability Badge */}
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    roomData.available
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {roomData.available ? '✓ ว่าง' : '✕ ไม่ว่าง'}
                  </span>
                </div>

                {/* Rating */}
                {roomData.rating > 0 && (
                  <div className="flex items-center mb-6">
                    <FaStar className="text-yellow-400 text-xl mr-2" />
                    <span className="text-2xl font-semibold text-gray-900">{roomData.rating}</span>
                    {roomData.reviews > 0 && (
                      <span className="text-gray-500 ml-2">({roomData.reviews} รีวิว)</span>
                    )}
                  </div>
                )}

                {/* Room Info */}
                <div className="flex flex-wrap gap-6 mb-8">
                  {roomData.beds && (
                    <div className="flex items-center text-gray-700">
                      <FaBed className="text-2xl text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">เตียง</p>
                        <p className="font-semibold">{roomData.beds} เตียง</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <FaUsers className="text-2xl text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ผู้เข้าพัก</p>
                      <p className="font-semibold">{roomData.guests} คน</p>
                    </div>
                  </div>
                  {roomData.size && (
                    <div className="flex items-center text-gray-700">
                      <FaExpand className="text-2xl text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">ขนาดห้อง</p>
                        <p className="font-semibold">{roomData.size} ตร.ม.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
                  <p className="text-gray-700 leading-relaxed">{roomData.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">สิ่งอำนวยความสะดวก</h2>
                  {roomData.amenities && roomData.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {roomData.amenities.map((amenity: string, idx: number) => {
                        const Icon = getAmenityIcon(amenity)
                        return (
                          <div key={idx} className="flex items-center text-gray-700">
                            <Icon className="text-2xl text-primary-600 mr-3" />
                            <span>{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">ไม่มีข้อมูลสิ่งอำนวยความสะดวก</p>
                  )}
                </div>

                {/* Location */}
                {roomData.location && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">สถานที่</h2>
                    <div className="flex items-center text-gray-700">
                      <FaCheck className="text-green-500 mr-3" />
                      <span>{roomData.location}</span>
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">รีวิวจากผู้เข้าพัก</h2>
                    <button
                      onClick={() => {
                        if (!user) {
                          router.push('/login')
                        } else {
                          setShowReviewModal(true)
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                    >
                      {user ? 'เขียนรีวิว' : 'เข้าสู่ระบบเพื่อรีวิว'}
                    </button>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.guestName}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวห้องนี้!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Calendar Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ปฏิทินการจอง</h2>
                <RoomCalendar roomId={parseInt(resolvedParams.id)} roomName={roomData.name} />
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    ฿{roomData.price.toLocaleString()}
                  </div>
                  <div className="text-gray-500">ต่อคืน</div>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      // ถ้ายังไม่ได้ login ให้ redirect ไป login
                      router.push('/login')
                    } else {
                      setShowBookingModal(true)
                    }
                  }}
                  disabled={!roomData.available}
                  className={`w-full py-3 font-semibold rounded-lg transition shadow-lg hover:shadow-xl ${
                    roomData.available
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {roomData.available ? (user ? 'จองเลย' : 'เข้าสู่ระบบเพื่อจอง') : 'ห้องไม่ว่าง'}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>ยกเลิกฟรี</span>
                      <FaCheck className="text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span>ยืนยันทันที</span>
                      <FaCheck className="text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">จองบ้านพัก</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleBooking} className="p-6 space-y-4">
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Room Info Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{roomData.name}</h4>
                <p className="text-2xl font-bold text-primary-600">
                  ฿{roomData.price.toLocaleString()} <span className="text-sm text-gray-500">/ คืน</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={bookingData.guestName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="สมชาย ใจดี"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="081-234-5678"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    วันเช็คอิน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    วันเช็คเอาท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  จำนวนผู้เข้าพัก <span className="text-red-500">*</span>
                </label>
                <select
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  required
                >
                  {[...Array(roomData.guests)].map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} คน
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  URL สลิปการโอนเงิน (ถ้ามี)
                </label>
                <input
                  type="url"
                  name="slipImage"
                  value={bookingData.slipImage}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="https://example.com/slip.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  หรืออัพโหลดสลิปหลังจากจองเสร็จ
                </p>
              </div>

              {/* Discount Information */}
              {discountInfo && discountInfo.totalDiscount > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <FaFire className="text-orange-600 text-xl animate-pulse" />
                    <h4 className="text-lg font-bold text-gray-900">🎉 ส่วนลดพิเศษ!</h4>
                  </div>
                  <div className="space-y-2">
                    {discountInfo.discounts.map((discount, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              📅 {new Date(discount.date).toLocaleDateString('th-TH', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              💬 {discount.reason}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              -฿{discount.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">รวมส่วนลด:</span>
                      <span className="text-xl font-bold text-orange-600">
                        -฿{discountInfo.totalDiscount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              {bookingData.checkIn && bookingData.checkOut && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-md">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>ราคาห้องพัก:</span>
                      <span className="font-semibold">
                        ฿{(Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)) * roomData.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ({Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} คืน × ฿{roomData.price.toLocaleString()})
                    </p>
                    {discountInfo && discountInfo.totalDiscount > 0 && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span>ส่วนลดพิเศษ:</span>
                        <span className="font-semibold">
                          -฿{discountInfo.totalDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">ยอดรวมทั้งหมด:</span>
                      <span className="text-3xl font-bold text-primary-600">
                        ฿{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={bookingLoading}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-900">เขียนรีวิว</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{roomData.name}</h4>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  ชื่อของคุณ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reviewData.guestName}
                  onChange={(e) => setReviewData({ ...reviewData, guestName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="สมชาย ใจดี"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={reviewData.email}
                  onChange={(e) => setReviewData({ ...reviewData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  คะแนน <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="focus:outline-none"
                    >
                      <FaStar
                        className={`text-3xl ${
                          star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">({reviewData.rating} ดาว)</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  ความคิดเห็น <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  rows={4}
                  placeholder="บอกเล่าประสบการณ์ของคุณ..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={reviewLoading}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  disabled={reviewLoading}
                >
                  {reviewLoading ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
