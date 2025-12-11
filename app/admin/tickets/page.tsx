'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { FaTicketAlt, FaEye, FaCheck, FaTimes } from 'react-icons/fa'
import type { ETicket } from '@/types/ticket'

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<ETicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<ETicket | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (ticketNumber: string, status: ETicket['status']) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNumber, status })
      })

      const data = await res.json()
      if (data.success) {
        loadTickets()
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus)

  const stats = {
    total: tickets.length,
    active: tickets.filter(t => t.status === 'active').length,
    used: tickets.filter(t => t.status === 'used').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
    expired: tickets.filter(t => t.status === 'expired').length
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
              🎫 จัดการ E-Tickets
            </h1>
            <p className="text-xl text-gray-600">ระบบจัดการตั๋วอิเล็กทรอนิกส์</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-gray-600 text-sm mb-1">ทั้งหมด</div>
              <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-white/80 text-sm mb-1">ใช้งานได้</div>
              <div className="text-3xl font-black">{stats.active}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-white/80 text-sm mb-1">ใช้แล้ว</div>
              <div className="text-3xl font-black">{stats.used}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-white/80 text-sm mb-1">ยกเลิก</div>
              <div className="text-3xl font-black">{stats.cancelled}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-white/80 text-sm mb-1">หมดอายุ</div>
              <div className="text-3xl font-black">{stats.expired}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            {['all', 'active', 'used', 'cancelled', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {status === 'all' && 'ทั้งหมด'}
                {status === 'active' && 'ใช้งานได้'}
                {status === 'used' && 'ใช้แล้ว'}
                {status === 'cancelled' && 'ยกเลิก'}
                {status === 'expired' && 'หมดอายุ'}
              </button>
            ))}
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaTicketAlt className="text-2xl text-blue-600" />
                        <div>
                          <div className="font-bold text-xl">{ticket.ticketNumber}</div>
                          <div className="text-sm text-gray-500">Booking: {ticket.bookingId}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-gray-600">ชื่อผู้เข้าพัก</div>
                          <div className="font-semibold">{ticket.guestName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">ห้องพัก</div>
                          <div className="font-semibold">{ticket.roomName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">เช็คอิน</div>
                          <div className="font-semibold">
                            {new Date(ticket.checkIn).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">สถานะ</div>
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'used' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status === 'active' && 'ใช้งานได้'}
                              {ticket.status === 'used' && 'ใช้แล้ว'}
                              {ticket.status === 'cancelled' && 'ยกเลิก'}
                              {ticket.status === 'expired' && 'หมดอายุ'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        title="ดูรายละเอียด"
                      >
                        <FaEye />
                      </button>
                      {ticket.status === 'active' && (
                        <>
                          <button
                            onClick={() => updateStatus(ticket.ticketNumber, 'used')}
                            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                            title="ทำเครื่องหมายว่าใช้แล้ว"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => updateStatus(ticket.ticketNumber, 'cancelled')}
                            className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                            title="ยกเลิก"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTickets.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  ไม่พบข้อมูล E-Ticket
                </div>
              )}
            </div>
          )}

          {/* Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                  <h2 className="text-2xl font-bold">รายละเอียด E-Ticket</h2>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">เลขที่ตั๋ว</div>
                      <div className="text-xl font-bold">{selectedTicket.ticketNumber}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">QR Code</div>
                        <img src={selectedTicket.qrCode} alt="QR Code" className="w-32 h-32 border-2 border-gray-200 rounded-lg" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Barcode</div>
                        <img src={selectedTicket.barcode} alt="Barcode" className="w-full h-auto" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">ชื่อผู้เข้าพัก</div>
                        <div className="font-semibold">{selectedTicket.guestName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">อีเมล</div>
                        <div className="font-semibold">{selectedTicket.guestEmail}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">เบอร์โทร</div>
                        <div className="font-semibold">{selectedTicket.guestPhone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">ห้องพัก</div>
                        <div className="font-semibold">{selectedTicket.roomName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">เช็คอิน</div>
                        <div className="font-semibold">
                          {new Date(selectedTicket.checkIn).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">เช็คเอาท์</div>
                        <div className="font-semibold">
                          {new Date(selectedTicket.checkOut).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">จำนวนคืน</div>
                        <div className="font-semibold">{selectedTicket.nights} คืน</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">ยอดรวม</div>
                        <div className="font-semibold text-green-600">
                          ฿{selectedTicket.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {selectedTicket.specialInstructions && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">คำแนะนำพิเศษ</div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          {selectedTicket.specialInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
