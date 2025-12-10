'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FaArrowLeft, FaSave, FaCheck, FaTimes, FaFileInvoice, FaEnvelope } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'
import type { GroupBookingRequest } from '@/types/groupBooking'

export default function GroupBookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { formatPrice } = useLanguage()
  const [booking, setBooking] = useState<GroupBookingRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      const res = await fetch('/api/group-bookings')
      const data: GroupBookingRequest[] = await res.json()
      const found = data.find(b => b.id === params.id)
      if (found) {
        setBooking(found)
        setInternalNotes(found.internalNotes || '')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!booking) return
    
    try {
      await fetch('/api/group-bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, status })
      })
      fetchBooking()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const saveNotes = async () => {
    if (!booking) return
    
    try {
      await fetch('/api/group-bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, internalNotes })
      })
      alert('Notes saved!')
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <button
            onClick={() => router.push('/admin/group-bookings')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Group Bookings
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'quoted': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/group-bookings')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Group Bookings</span>
          </button>
          
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{booking.groupDetails.groupName}</h1>
                <p className="text-blue-100 text-lg">Booking ID: #{booking.id}</p>
              </div>
              <div className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${getStatusColor(booking.status)}`}>
                {booking.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Group Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Group Type</p>
                  <p className="font-bold text-lg capitalize">{booking.groupDetails.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Rooms</p>
                  <p className="font-bold text-lg">{booking.groupDetails.numberOfRooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Guests</p>
                  <p className="font-bold text-lg">{booking.groupDetails.totalGuests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-in / Check-out</p>
                  <p className="font-bold">{new Date(booking.dates.checkIn).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">{booking.dates.nights} nights</p>
                </div>
              </div>
              {booking.groupDetails.specialRequests && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                  <p className="text-gray-900">{booking.groupDetails.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-bold text-lg">{booking.contactPerson.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-bold flex items-center gap-2">
                    <FaEnvelope className="text-indigo-600" />
                    {booking.contactPerson.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-bold">{booking.contactPerson.phone}</p>
                </div>
                {booking.contactPerson.company && (
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-bold">{booking.contactPerson.company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Selection</h2>
              <div className="space-y-3">
                {booking.rooms.map((room, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{room.roomName}</h3>
                        <p className="text-gray-600">{room.roomType}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {room.adults} adults, {room.children} children × {room.quantity} rooms
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-bold text-indigo-600">{formatPrice(room.totalPrice)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Internal Notes</h2>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes here (not visible to customer)..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none"
              />
              <button
                onClick={saveNotes}
                className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FaSave /> Save Notes
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Pricing Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between opacity-90">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(booking.pricing.subtotal)}</span>
                </div>
                {booking.pricing.groupDiscountPercentage > 0 && (
                  <div className="flex justify-between opacity-90">
                    <span>Group Discount ({booking.pricing.groupDiscountPercentage}%)</span>
                    <span className="font-bold">-{formatPrice(booking.pricing.groupDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between opacity-90">
                  <span>Tax (7%)</span>
                  <span className="font-bold">{formatPrice(booking.pricing.taxAmount)}</span>
                </div>
                <div className="border-t-2 border-white/30 pt-3 mt-3">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(booking.pricing.totalAmount)}</span>
                  </div>
                  <p className="text-sm opacity-90 mt-2">
                    Deposit: {formatPrice(booking.pricing.depositRequired)} (30%)
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus('quoted')}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <FaFileInvoice /> Send Quote
                    </button>
                    <button
                      onClick={() => updateStatus('confirmed')}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <FaCheck /> Confirm Booking
                    </button>
                  </>
                )}
                {booking.status === 'quoted' && (
                  <button
                    onClick={() => updateStatus('confirmed')}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Confirm Booking
                  </button>
                )}
                {(booking.status === 'pending' || booking.status === 'quoted') && (
                  <button
                    onClick={() => updateStatus('cancelled')}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <FaTimes /> Cancel Booking
                  </button>
                )}
                <button
                  onClick={() => alert('Email feature coming soon!')}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <FaEnvelope /> Send Email
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full mt-1"></div>
                  <div>
                    <p className="font-bold text-sm">Created</p>
                    <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                  <div>
                    <p className="font-bold text-sm">Last Updated</p>
                    <p className="text-xs text-gray-500">{new Date(booking.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
