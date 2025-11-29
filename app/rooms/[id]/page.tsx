'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { FaBed, FaUsers, FaExpand, FaStar, FaWifi, FaTv, FaSnowflake, FaCheck } from 'react-icons/fa'

// This would come from API/database
const roomData = {
  id: 1,
  name: 'Deluxe Suite',
  price: 2500,
  images: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
  ],
  beds: 2,
  guests: 4,
  size: 45,
  rating: 4.8,
  reviews: 128,
  description:
    'ห้องพักสุดหรูพร้อมสิ่งอำนวยความสะดวกครบครัน วิวสวยงาม เหมาะสำหรับครอบครัวหรือกลุ่มเพื่อน พักผ่อนได้อย่างเต็มที่',
  amenities: [
    { icon: FaWifi, name: 'WiFi ความเร็วสูง' },
    { icon: FaTv, name: 'TV ระบบ Smart' },
    { icon: FaSnowflake, name: 'เครื่องปรับอากาศ' },
    { icon: FaBed, name: 'เตียงคู่ขนาดใหญ่' },
  ],
  features: [
    'ห้องน้ำส่วนตัวพร้อมอ่างอาบน้ำ',
    'มินิบาร์',
    'ตู้นิรภัย',
    'โต๊ะทำงาน',
    'ระเบียงส่วนตัว',
    'เครื่องชงกาแฟ',
  ],
}

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to booking confirmation
    router.push(`/booking/${roomData.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

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
                  src={roomData.images[selectedImage]}
                  alt={roomData.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              {roomData.images.map((img, idx) => (
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{roomData.name}</h1>

                {/* Rating */}
                <div className="flex items-center mb-6">
                  <FaStar className="text-yellow-400 text-xl mr-2" />
                  <span className="text-2xl font-semibold text-gray-900">{roomData.rating}</span>
                  <span className="text-gray-500 ml-2">({roomData.reviews} รีวิว)</span>
                </div>

                {/* Room Info */}
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center text-gray-700">
                    <FaBed className="text-2xl text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">เตียง</p>
                      <p className="font-semibold">{roomData.beds} เตียง</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaUsers className="text-2xl text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ผู้เข้าพัก</p>
                      <p className="font-semibold">{roomData.guests} คน</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaExpand className="text-2xl text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ขนาดห้อง</p>
                      <p className="font-semibold">{roomData.size} ตร.ม.</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
                  <p className="text-gray-700 leading-relaxed">{roomData.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">สิ่งอำนวยความสะดวก</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {roomData.amenities.map((amenity, idx) => {
                      const Icon = amenity.icon
                      return (
                        <div key={idx} className="flex items-center text-gray-700">
                          <Icon className="text-2xl text-primary-600 mr-3" />
                          <span>{amenity.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">คุณสมบัติเพิ่มเติม</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roomData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-gray-700">
                        <FaCheck className="text-green-500 mr-3" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
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

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันเช็คอิน
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันเช็คเอาท์
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนผู้เข้าพัก
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    >
                      {[...Array(roomData.guests)].map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {idx + 1} คน
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
                  >
                    จองเลย
                  </button>
                </form>

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

      <Footer />
    </main>
  )
}
