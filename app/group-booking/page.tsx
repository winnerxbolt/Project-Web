'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUsers, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'

interface Room {
  id: string
  name: string
  type: string
  price: number
  maxGuests: number
}

interface SelectedRoom {
  roomId: string
  quantity: number
  adults: number
  children: number
}

export default function GroupBookingPage() {
  const router = useRouter()
  const { formatPrice } = useLanguage()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [priceCalculation, setPriceCalculation] = useState<any>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Group Details
    groupType: 'family' as 'family' | 'corporate' | 'wedding' | 'friends' | 'educational' | 'other',
    groupName: '',
    numberOfRooms: 3,
    totalGuests: 6,
    specialRequests: '',
    
    // Step 2: Contact Information
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    company: '',
    position: '',
    
    // Step 3: Dates
    checkIn: '',
    checkOut: '',
    flexibleDates: false,
    
    // Step 4: Room Selection
    selectedRooms: [] as SelectedRoom[]
  })
  
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (step === 4 && formData.selectedRooms.length > 0) {
      calculatePrice()
    }
  }, [formData.selectedRooms, formData.checkIn, formData.checkOut])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const calculatePrice = async () => {
    if (!formData.checkIn || !formData.checkOut || formData.selectedRooms.length === 0) return
    
    try {
      const res = await fetch('/api/group-bookings/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: formData.selectedRooms,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          groupType: formData.groupType,
          numberOfRooms: formData.numberOfRooms
        })
      })
      const data = await res.json()
      setPriceCalculation(data)
    } catch (error) {
      console.error('Error calculating price:', error)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const totalGuests = formData.selectedRooms.reduce((sum, r) => sum + r.adults + r.children, 0)
      
      const bookingData = {
        contactPerson: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          company: formData.company || undefined,
          position: formData.position || undefined
        },
        groupDetails: {
          type: formData.groupType,
          groupName: formData.groupName,
          numberOfRooms: formData.numberOfRooms,
          totalGuests,
          adultsPerRoom: formData.selectedRooms.map(r => r.adults),
          childrenPerRoom: formData.selectedRooms.map(r => r.children),
          specialRequests: formData.specialRequests || undefined
        },
        dates: {
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          nights: priceCalculation.nights,
          flexibleDates: formData.flexibleDates
        },
        rooms: priceCalculation.roomDetails,
        pricing: {
          subtotal: priceCalculation.subtotal,
          groupDiscount: priceCalculation.groupDiscountAmount,
          groupDiscountPercentage: priceCalculation.groupDiscountPercentage,
          additionalDiscounts: [],
          taxAmount: priceCalculation.taxAmount,
          totalAmount: priceCalculation.totalAmount,
          depositRequired: priceCalculation.depositRequired,
          currency: priceCalculation.currency
        }
      }
      
      const res = await fetch('/api/group-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      if (res.ok) {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('Failed to submit group booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addRoom = (roomId: string) => {
    const existing = formData.selectedRooms.find(r => r.roomId === roomId)
    if (existing) {
      setFormData({
        ...formData,
        selectedRooms: formData.selectedRooms.map(r =>
          r.roomId === roomId ? { ...r, quantity: r.quantity + 1 } : r
        )
      })
    } else {
      setFormData({
        ...formData,
        selectedRooms: [...formData.selectedRooms, { roomId, quantity: 1, adults: 2, children: 0 }]
      })
    }
  }

  const removeRoom = (roomId: string) => {
    const existing = formData.selectedRooms.find(r => r.roomId === roomId)
    if (existing && existing.quantity > 1) {
      setFormData({
        ...formData,
        selectedRooms: formData.selectedRooms.map(r =>
          r.roomId === roomId ? { ...r, quantity: r.quantity - 1 } : r
        )
      })
    } else {
      setFormData({
        ...formData,
        selectedRooms: formData.selectedRooms.filter(r => r.roomId !== roomId)
      })
    }
  }

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦'
      case 'corporate': return '💼'
      case 'wedding': return '💒'
      case 'friends': return '🎉'
      case 'educational': return '🎓'
      default: return '👥'
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-6">
            <FaCheckCircle className="text-8xl text-green-500 mx-auto animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Group Booking Request Submitted!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your group booking request! Our team will review your request and send you a detailed quote within 24 hours.
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✉️</span>
                <p className="text-gray-700">Check your email ({formData.contactEmail}) for confirmation</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📄</span>
                <p className="text-gray-700">Our team will prepare a detailed quote with special group rates</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <p className="text-gray-700">We'll contact you within 24 hours to discuss details</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <FaUsers className="text-5xl" />
            Group Booking Request
          </h1>
          <p className="text-lg text-blue-100">Get special rates for group bookings of 3+ rooms!</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                  s === step ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 shadow-lg' :
                  s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 5 && (
                  <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm font-medium">
            <span className={step === 1 ? 'text-indigo-600' : 'text-gray-500'}>Group Info</span>
            <span className={step === 2 ? 'text-indigo-600' : 'text-gray-500'}>Contact</span>
            <span className={step === 3 ? 'text-indigo-600' : 'text-gray-500'}>Dates</span>
            <span className={step === 4 ? 'text-indigo-600' : 'text-gray-500'}>Rooms</span>
            <span className={step === 5 ? 'text-indigo-600' : 'text-gray-500'}>Review</span>
          </div>
        </div>

        {/* Step 1: Group Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Group Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-3">Group Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
                    { value: 'corporate', label: 'Corporate', icon: '💼' },
                    { value: 'wedding', label: 'Wedding', icon: '💒' },
                    { value: 'friends', label: 'Friends', icon: '🎉' },
                    { value: 'educational', label: 'Educational', icon: '🎓' },
                    { value: 'other', label: 'Other', icon: '👥' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, groupType: type.value as any })}
                      className={`p-4 rounded-xl border-2 transition ${
                        formData.groupType === type.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{type.icon}</span>
                      <span className="font-bold text-gray-900">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Group Name</label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  placeholder="e.g., Smith Family Reunion, ABC Company Team Building"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Number of Rooms</label>
                  <input
                    type="number"
                    min="3"
                    value={formData.numberOfRooms}
                    onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 font-bold text-lg"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 3 rooms for group booking</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Total Guests (estimate)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalGuests}
                    onChange={(e) => setFormData({ ...formData, totalGuests: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 font-bold text-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Special Requests (Optional)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="e.g., Need adjacent rooms, wheelchair accessible, etc."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.groupName || formData.numberOfRooms < 3}
              className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Contact Information →
            </button>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📞 Contact Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+66 XX XXX XXXX"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {formData.groupType === 'corporate' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Your position"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.contactName || !formData.contactEmail || !formData.contactPhone}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Dates →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dates */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Select Dates</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Check-in Date *</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 font-bold text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Check-out Date *</label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-gray-900 font-bold text-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.flexibleDates}
                    onChange={(e) => setFormData({ ...formData, flexibleDates: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-700">My dates are flexible (±3 days)</span>
                </label>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <span>💰</span> Group Discount Available!
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>• 3-5 rooms: <strong>10% discount</strong></li>
                  <li>• 6-10 rooms: <strong>15% discount</strong></li>
                  <li>• 11-20 rooms: <strong>20% discount</strong></li>
                  <li>• 21+ rooms: <strong>25% discount</strong></li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.checkIn || !formData.checkOut}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Room Selection →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Room Selection */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏨 Select Rooms</h2>
            
            <div className="space-y-4 mb-8">
              {rooms.map((room) => {
                const selected = formData.selectedRooms.find(r => r.roomId === room.id)
                const quantity = selected?.quantity || 0
                
                return (
                  <div key={room.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                        <p className="text-gray-600 mb-2">{room.type}</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatPrice(room.price)} <span className="text-sm text-gray-500">/ night</span></p>
                        <p className="text-sm text-gray-500">Max {room.maxGuests} guests</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeRoom(room.id)}
                          disabled={quantity === 0}
                          className="w-10 h-10 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaMinus className="mx-auto" />
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => addRoom(room.id)}
                          className="w-10 h-10 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition"
                        >
                          <FaPlus className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {priceCalculation && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({priceCalculation.nights} nights)</span>
                    <span className="font-bold">{formatPrice(priceCalculation.subtotal)}</span>
                  </div>
                  {priceCalculation.groupDiscountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Group Discount ({priceCalculation.groupDiscountPercentage}%)</span>
                      <span className="font-bold">-{formatPrice(priceCalculation.groupDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (7%)</span>
                    <span className="font-bold">{formatPrice(priceCalculation.taxAmount)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Total Amount</span>
                      <span className="font-bold text-indigo-600">{formatPrice(priceCalculation.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Deposit Required (30%)</span>
                    <span className="font-bold">{formatPrice(priceCalculation.depositRequired)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={formData.selectedRooms.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review and Submit */}
        {step === 5 && priceCalculation && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Review Your Request</h2>
            
            <div className="space-y-6">
              {/* Group Details */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">{getGroupTypeIcon(formData.groupType)}</span>
                  Group Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Group Name</p>
                    <p className="font-bold">{formData.groupName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-bold capitalize">{formData.groupType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Rooms</p>
                    <p className="font-bold">{formData.numberOfRooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Guests</p>
                    <p className="font-bold">{formData.totalGuests}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-bold">{formData.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-bold">{formData.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-bold">{formData.contactPhone}</p>
                  </div>
                  {formData.company && (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-bold">{formData.company}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Booking Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-bold">{new Date(formData.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-bold">{new Date(formData.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nights</p>
                    <p className="font-bold">{priceCalculation.nights}</p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-4 text-xl">Final Price</h3>
                <div className="space-y-2">
                  <div className="flex justify-between opacity-90">
                    <span>Subtotal</span>
                    <span>{formatPrice(priceCalculation.subtotal)}</span>
                  </div>
                  {priceCalculation.groupDiscountPercentage > 0 && (
                    <div className="flex justify-between opacity-90">
                      <span>Group Discount (-{priceCalculation.groupDiscountPercentage}%)</span>
                      <span>-{formatPrice(priceCalculation.groupDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between opacity-90">
                    <span>Tax</span>
                    <span>{formatPrice(priceCalculation.taxAmount)}</span>
                  </div>
                  <div className="border-t-2 border-white/30 pt-3 mt-3">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total</span>
                      <span>{formatPrice(priceCalculation.totalAmount)}</span>
                    </div>
                    <p className="text-sm opacity-90 mt-2">
                      Deposit: {formatPrice(priceCalculation.depositRequired)} (30%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : '✅ Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
