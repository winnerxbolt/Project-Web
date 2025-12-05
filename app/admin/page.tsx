'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import RoomCalendar from '@/components/RoomCalendar'
import { useAuth } from '@/contexts/AuthContext'
import { FaHotel, FaCalendarCheck, FaDollarSign, FaUsers, FaPlus, FaEdit, FaTrash, FaUserShield, FaSearch, FaTimes, FaCalendarAlt, FaFire, FaCrown, FaChartLine } from 'react-icons/fa'
import { containsProfanity } from '@/lib/profanityFilter'
import AdminStats from '@/components/AdminStats'
import AdminButton from '@/components/AdminButton'
import AdminCard from '@/components/AdminCard'

interface Booking {
  id: number
  roomName: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled'
  total: number
  slipImage?: string
  email?: string
  phone?: string
}

interface BookingFormData {
  roomName: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: string
  total: string
  email?: string
  phone?: string
}

interface Room {
  id: number
  name: string
  price: number
  description: string
  guests: number
  beds?: number
  size?: number
  image?: string
  images?: string[]
  rating?: number
  reviews?: number
  amenities?: string[]
  location?: string
  available: boolean
  deposit?: number
  checkInTime?: string
  checkOutTime?: string
  minNights?: number
  bedrooms?: number
  bathrooms?: number
  kitchen?: boolean
  parking?: boolean
  pool?: boolean
  wifi?: boolean
  extraEquipment?: string
  houseRules?: string
  singleRoomPrice?: number
  promotion?: string
  cancellationPolicy?: string
}

interface RoomFormData {
  name: string
  price: string
  description: string
  guests: string
  beds?: string
  size?: string
  image?: string
  images?: string[]
  amenities?: string
  location?: string
  deposit?: string
  checkInTime?: string
  checkOutTime?: string
  minNights?: string
  bedrooms?: string
  bathrooms?: string
  kitchen?: string
  parking?: string
  pool?: string
  wifi?: string
  extraEquipment?: string
  houseRules?: string
  singleRoomPrice?: string
  promotion?: string
  cancellationPolicy?: string
}

export default function AdminPage() {
  const { user, isAdmin, promoteToAdmin, demoteFromAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'rooms' | 'calendar' | 'users'>('dashboard')
  const [searchEmail, setSearchEmail] = useState('')
  const [demoteEmail, setDemoteEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userLoading, setUserLoading] = useState(false)
  const [demoteLoading, setDemoteLoading] = useState(false)
  
  // Room management states
  const [rooms, setRooms] = useState<Room[]>([])
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [roomFormData, setRoomFormData] = useState<RoomFormData>({
    name: '',
    price: '',
    description: '',
    guests: '',
    beds: '',
    size: '',
    image: '',
    images: [],
    amenities: 'WiFi, TV, แอร์',
    location: 'กรุงเทพ',
    deposit: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    minNights: '1',
    bedrooms: '',
    bathrooms: '',
    kitchen: 'false',
    parking: 'false',
    pool: 'false',
    wifi: 'true',
    extraEquipment: '',
    houseRules: '',
    singleRoomPrice: '',
    promotion: '',
    cancellationPolicy: ''
  })
  const [roomLoading, setRoomLoading] = useState(false)

  // Booking management states
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [showSlipModal, setShowSlipModal] = useState(false)
  const [selectedSlip, setSelectedSlip] = useState<string>('')
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    roomName: '',
    guestName: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    total: '',
    email: '',
    phone: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)

  // Calendar management states
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'booked' | 'pending' | 'holiday' | 'maintenance'>('available')
  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountAmount, setDiscountAmount] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [note, setNote] = useState('')
  const [calendarMessage, setCalendarMessage] = useState('')
  const [calendarKey, setCalendarKey] = useState(0) // สำหรับ force refresh calendar

  // Sample data
  const [bookings, setBookings] = useState<Booking[]>([])

  // Image upload handlers
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    for (let i = 0; i < files.length; i++) {
      const base64 = await convertToBase64(files[i])
      newImages.push(base64)
    }

    setUploadedImages(prev => [...prev, ...newImages])
    setRoomFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
      image: prev.image || newImages[0] // Set first image as main if no main image
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    const newImages: string[] = []
    
    for (const file of files) {
      const base64 = await convertToBase64(file)
      newImages.push(base64)
    }

    setUploadedImages(prev => [...prev, ...newImages])
    setRoomFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
      image: prev.image || newImages[0]
    }))
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const newImages: string[] = []

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) {
          const base64 = await convertToBase64(file)
          newImages.push(base64)
        }
      }
    }

    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages])
      setRoomFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
        image: prev.image || newImages[0]
      }))
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setRoomFormData(prev => {
      const newImages = (prev.images || []).filter((_, i) => i !== index)
      return {
        ...prev,
        images: newImages,
        image: prev.image === prev.images?.[index] ? newImages[0] || '' : prev.image
      }
    })
  }

  const setMainImage = (index: number) => {
    const selectedImage = uploadedImages[index]
    setRoomFormData(prev => ({
      ...prev,
      image: selectedImage
    }))
  }

  // Fetch rooms and bookings from API
  useEffect(() => {
    const initializeAdmin = async () => {
      // เรียก auto-checkout ก่อน
      await fetch('/api/auto-checkout').catch(err => console.error('Auto-checkout error:', err))
      
      // แล้วค่อยโหลดข้อมูล
      fetchRooms()
      fetchBookings()
    }
    initializeAdmin()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
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

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.available).length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
    revenue: bookings.reduce((sum, b) => sum + b.total, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'ยืนยันแล้ว'
      case 'pending':
        return 'รอดำเนินการ'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserLoading(true)
    setError('')
    setMessage('')

    if (!searchEmail) {
      setError('กรุณากรอกอีเมลผู้ใช้')
      setUserLoading(false)
      return
    }

    const success = await promoteToAdmin(searchEmail)
    
    if (success) {
      setMessage(`เพิ่มสิทธิ์ Admin ให้กับ ${searchEmail} สำเร็จ!`)
      setSearchEmail('')
      setTimeout(() => setMessage(''), 5000)
    } else {
      setError('ไม่พบผู้ใช้หรือเกิดข้อผิดพลาด')
    }
    
    setUserLoading(false)
  }

  const handleDemoteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setDemoteLoading(true)
    setError('')
    setMessage('')

    if (!demoteEmail) {
      setError('กรุณากรอกอีเมลผู้ใช้')
      setDemoteLoading(false)
      return
    }

    const success = await demoteFromAdmin(demoteEmail)
    
    if (success) {
      setMessage(`ถอดสิทธิ์ Admin ของ ${demoteEmail} สำเร็จ!`)
      setDemoteEmail('')
      setTimeout(() => setMessage(''), 5000)
    } else {
      setError('ไม่พบผู้ใช้หรือเกิดข้อผิดพลาด')
    }
    
    setDemoteLoading(false)
  }

  // Room management functions
  const openAddRoomModal = () => {
    setEditingRoom(null)
    setRoomFormData({
      name: '',
      price: '',
      description: '',
      guests: '',
      beds: '',
      size: '',
      image: '',
      amenities: 'WiFi, TV, แอร์',
      location: 'กรุงเทพ'
    })
    setShowRoomModal(true)
  }

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room)
    const existingImages = room.images || (room.image ? [room.image] : [])
    setUploadedImages(existingImages)
    setRoomFormData({
      name: room.name,
      price: room.price.toString(),
      description: room.description,
      guests: room.guests.toString(),
      beds: room.beds?.toString() || '',
      size: room.size?.toString() || '',
      image: room.image || '',
      images: existingImages,
      amenities: room.amenities?.join(', ') || 'WiFi, TV, แอร์',
      location: room.location || 'กรุงเทพ',
      deposit: room.deposit?.toString() || '',
      checkInTime: room.checkInTime || '14:00',
      checkOutTime: room.checkOutTime || '11:00',
      minNights: room.minNights?.toString() || '1',
      bedrooms: room.bedrooms?.toString() || '',
      bathrooms: room.bathrooms?.toString() || '',
      kitchen: room.kitchen ? 'true' : 'false',
      parking: room.parking ? 'true' : 'false',
      pool: room.pool ? 'true' : 'false',
      wifi: room.wifi !== false ? 'true' : 'false',
      extraEquipment: room.extraEquipment || '',
      houseRules: room.houseRules || '',
      singleRoomPrice: room.singleRoomPrice?.toString() || '',
      promotion: room.promotion || '',
      cancellationPolicy: room.cancellationPolicy || ''
    })
    setShowRoomModal(true)
  }

  const closeRoomModal = () => {
    setShowRoomModal(false)
    setEditingRoom(null)
    setUploadedImages([])
    setRoomFormData({
      name: '',
      price: '',
      description: '',
      guests: '',
      beds: '',
      size: '',
      image: '',
      images: [],
      amenities: 'WiFi, TV, แอร์',
      location: 'กรุงเทพ',
      deposit: '',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      minNights: '1',
      bedrooms: '',
      bathrooms: '',
      kitchen: 'false',
      parking: 'false',
      pool: 'false',
      wifi: 'true',
      extraEquipment: '',
      houseRules: '',
      singleRoomPrice: '',
      promotion: '',
      cancellationPolicy: ''
    })
    setError('')
    setMessage('')
  }

  const handleRoomFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRoomFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setRoomLoading(true)
    setError('')
    setMessage('')

    // Check for profanity
    if (containsProfanity(roomFormData.name)) {
      setError('ชื่อห้องมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setRoomLoading(false)
      return
    }
    if (containsProfanity(roomFormData.description)) {
      setError('คำอธิบายมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setRoomLoading(false)
      return
    }
    if (roomFormData.location && containsProfanity(roomFormData.location)) {
      setError('ที่ตั้งมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setRoomLoading(false)
      return
    }

    try {
      const amenitiesArray = roomFormData.amenities?.split(',').map(a => a.trim()).filter(a => a) || []
      
      const roomData = {
        name: roomFormData.name,
        price: Number(roomFormData.price),
        description: roomFormData.description,
        guests: Number(roomFormData.guests),
        beds: roomFormData.beds ? Number(roomFormData.beds) : undefined,
        size: roomFormData.size ? Number(roomFormData.size) : undefined,
        image: roomFormData.image || uploadedImages[0] || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        amenities: amenitiesArray,
        location: roomFormData.location,
        deposit: roomFormData.deposit ? Number(roomFormData.deposit) : undefined,
        checkInTime: roomFormData.checkInTime || undefined,
        checkOutTime: roomFormData.checkOutTime || undefined,
        minNights: roomFormData.minNights ? Number(roomFormData.minNights) : undefined,
        bedrooms: roomFormData.bedrooms ? Number(roomFormData.bedrooms) : undefined,
        bathrooms: roomFormData.bathrooms ? Number(roomFormData.bathrooms) : undefined,
        kitchen: roomFormData.kitchen === 'true',
        parking: roomFormData.parking === 'true',
        pool: roomFormData.pool === 'true',
        wifi: roomFormData.wifi === 'true',
        extraEquipment: roomFormData.extraEquipment || undefined,
        houseRules: roomFormData.houseRules || undefined,
        singleRoomPrice: roomFormData.singleRoomPrice ? Number(roomFormData.singleRoomPrice) : undefined,
        promotion: roomFormData.promotion || undefined,
        cancellationPolicy: roomFormData.cancellationPolicy || undefined
      }

      if (editingRoom) {
        // Update existing room
        const response = await fetch('/api/rooms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...roomData, id: editingRoom.id })
        })

        const data = await response.json()

        if (data.success) {
          setMessage('อัพเดทบ้านพักสำเร็จ!')
          await fetchRooms()
          setTimeout(() => {
            closeRoomModal()
            setMessage('')
          }, 1500)
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการอัพเดท')
        }
      } else {
        // Create new room
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomData)
        })

        const data = await response.json()

        if (data.success) {
          setMessage('เพิ่มบ้านพักสำเร็จ!')
          await fetchRooms()
          setTimeout(() => {
            closeRoomModal()
            setMessage('')
          }, 1500)
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการเพิ่มบ้านพัก')
        }
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setRoomLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบ้านพักนี้?')) {
      return
    }

    try {
      const response = await fetch(`/api/rooms?id=${roomId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setMessage('ลบบ้านพักสำเร็จ!')
        await fetchRooms()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการลบบ้านพัก')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  // Booking management functions
  const openEditBookingModal = (booking: Booking) => {
    setEditingBooking(booking)
    setBookingFormData({
      roomName: booking.roomName,
      guestName: booking.guestName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests.toString(),
      total: booking.total.toString(),
      email: booking.email || '',
      phone: booking.phone || ''
    })
    setShowBookingModal(true)
  }

  const closeBookingModal = () => {
    setShowBookingModal(false)
    setEditingBooking(null)
    setError('')
    setMessage('')
  }

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBookingFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingLoading(true)
    setError('')
    setMessage('')

    // Check for profanity
    if (containsProfanity(bookingFormData.guestName)) {
      setError('ชื่อผู้เข้าพักมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setBookingLoading(false)
      return
    }

    try {
      const bookingData = {
        roomName: bookingFormData.roomName,
        guestName: bookingFormData.guestName,
        checkIn: bookingFormData.checkIn,
        checkOut: bookingFormData.checkOut,
        guests: Number(bookingFormData.guests),
        total: Number(bookingFormData.total),
        email: bookingFormData.email,
        phone: bookingFormData.phone
      }

      if (editingBooking) {
        // Update existing booking
        const response = await fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bookingData, id: editingBooking.id })
        })

        const data = await response.json()

        if (data.success) {
          setMessage('อัพเดทการจองสำเร็จ!')
          await fetchBookings()
          setTimeout(() => {
            closeBookingModal()
            setMessage('')
          }, 1500)
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการอัพเดท')
        }
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?')) {
      return
    }

    try {
      // หาข้อมูลการจองก่อนลบ
      const booking = bookings.find(b => b.id === bookingId)
      
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // เปลี่ยนสถานะห้องกลับเป็นว่าง
        if (booking) {
          const room = rooms.find(r => r.name === booking.roomName)
          if (room) {
            await fetch('/api/rooms', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...room, id: room.id, available: true })
            })
            await fetchRooms()
          }
        }
        
        setMessage('ลบการจองสำเร็จ! สถานะห้องถูกเปลี่ยนเป็นว่างแล้ว')
        await fetchBookings()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการลบการจอง')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) return

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, id: bookingId, status: 'confirmed' })
      })

      const data = await response.json()

      if (data.success) {
        // อัพเดทสถานะห้องเป็นไม่ว่าง
        const room = rooms.find(r => r.name === booking.roomName)
        if (room) {
          await fetch('/api/rooms', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...room, id: room.id, available: false })
          })
          await fetchRooms()
        }
        
        setMessage('ยืนยันการจองสำเร็จ! สถานะห้องถูกเปลี่ยนเป็นไม่ว่างแล้ว')
        await fetchBookings()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการยืนยันการจอง')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธการจองนี้?')) {
      return
    }

    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) return

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, id: bookingId, status: 'cancelled' })
      })

      const data = await response.json()

      if (data.success) {
        // เปลี่ยนสถานะห้องกลับเป็นว่าง (เพราะปฏิเสธการจอง)
        const room = rooms.find(r => r.name === booking.roomName)
        if (room) {
          await fetch('/api/rooms', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...room, id: room.id, available: true })
          })
          await fetchRooms()
        }
        
        setMessage('ปฏิเสธการจองสำเร็จ! สถานะห้องถูกเปลี่ยนเป็นว่างแล้ว')
        await fetchBookings()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการปฏิเสธการจอง')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  const openSlipModal = (slipImage: string) => {
    setSelectedSlip(slipImage)
    setShowSlipModal(true)
  }

  // Calendar management functions
  const handleUpdateDay = async () => {
    if (!selectedRoom || !selectedDate) {
      setCalendarMessage('กรุณาเลือกห้องและวันที่')
      return
    }

    if (hasDiscount && (!discountAmount || !discountReason)) {
      setCalendarMessage('กรุณาระบุจำนวนเงินลดและเหตุผล')
      return
    }

    // Check for profanity in discount reason
    if (discountReason && containsProfanity(discountReason)) {
      setCalendarMessage('เหตุผลการลดราคามีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      return
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          date: selectedDate,
          status: selectedStatus,
          hasSpecialDiscount: hasDiscount,
          discountAmount: hasDiscount ? Number(discountAmount) : undefined,
          discountReason: hasDiscount ? discountReason : undefined,
          note: note
        })
      })

      const data = await response.json()
      if (data.success) {
        setCalendarMessage('✅ อัปเดตสถานะสำเร็จ!')
        setSelectedDate('')
        setNote('')
        setHasDiscount(false)
        setDiscountAmount('')
        setDiscountReason('')
        setCalendarKey(prev => prev + 1) // Force refresh calendar
        setTimeout(() => setCalendarMessage(''), 3000)
      } else {
        setCalendarMessage('❌ เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      setCalendarMessage('❌ เกิดข้อผิดพลาดในการอัปเดต')
      console.error('Error updating calendar:', error)
    }
  }

  const handleBulkUpdate = async () => {
    if (!selectedRoom) {
      setCalendarMessage('กรุณาเลือกห้องพัก')
      return
    }

    // ตรวจสอบว่าใช้ date picker หรือ text input
    let start = startDate
    let end = endDate
    
    if (!start || !end) {
      // ถ้าไม่มีค่าจาก date picker ให้ลองดูจาก text input
      const dates = selectedDate.split(' to ')
      if (dates.length === 2) {
        start = dates[0].trim()
        end = dates[1].trim()
      } else {
        setCalendarMessage('กรุณาเลือกช่วงวันที่')
        return
      }
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          startDate: start,
          endDate: end,
          status: selectedStatus,
          note: note
        })
      })

      const data = await response.json()
      if (data.success) {
        setCalendarMessage(`✅ อัปเดต ${data.updatedDates.length} วันสำเร็จ!`)
        setSelectedDate('')
        setStartDate('')
        setEndDate('')
        setNote('')
        setCalendarKey(prev => prev + 1) // Force refresh calendar
        setTimeout(() => setCalendarMessage(''), 3000)
      } else {
        setCalendarMessage('❌ เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      setCalendarMessage('❌ เกิดข้อผิดพลาดในการอัปเดต')
      console.error('Error bulk updating calendar:', error)
    }
  }

  const handleRemoveDiscount = async () => {
    if (!selectedRoom || !selectedDate) {
      setCalendarMessage('กรุณาเลือกห้องและวันที่')
      return
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          date: selectedDate,
          status: selectedStatus,
          hasSpecialDiscount: false, // ลบสติ๊กเกอร์
          note: note
        })
      })

      const data = await response.json()
      if (data.success) {
        setCalendarMessage('✅ ลบสติ๊กเกอร์ราคาพิเศษสำเร็จ!')
        setHasDiscount(false)
        setCalendarKey(prev => prev + 1) // Force refresh calendar
        setTimeout(() => setCalendarMessage(''), 3000)
      } else {
        setCalendarMessage('❌ เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      setCalendarMessage('❌ เกิดข้อผิดพลาดในการลบสติ๊กเกอร์')
      console.error('Error removing discount:', error)
    }
  }

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id)
    }
  }, [rooms])

  return (
    <main className="min-h-screen bg-gradient-to-br from-pool-light via-white to-tropical-mint/20">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with gradient */}
          <div className="mb-12 text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-luxury-gold/20 rounded-full blur-3xl animate-float" />
            <div className="absolute top-10 right-1/4 w-24 h-24 bg-pool-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-4 bg-gradient-to-r from-luxury-gold to-luxury-bronze text-white px-6 py-3 rounded-full shadow-luxury">
                <FaCrown className="text-3xl" />
                <span className="text-xl font-bold">Admin Dashboard</span>
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pool-dark via-pool-blue to-tropical-green mb-2">
                ระบบจัดการ Poolvilla
              </h1>
              <p className="text-xl text-gray-600">จัดการบ้านพัก การจอง และผู้ใช้งาน</p>
            </div>
          </div>

          {/* Modern Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-pool-blue to-pool-dark text-white shadow-pool scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-pool-blue hover:text-pool-blue'
              }`}
            >
              <FaChartLine className="text-xl" />
              <span>ภาพรวม</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-tropical scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-tropical-green hover:text-tropical-green'
              }`}
            >
              <FaCalendarCheck className="text-xl" />
              <span>การจอง</span>
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'rooms'
                  ? 'bg-gradient-to-r from-tropical-orange to-luxury-gold text-white shadow-sunset scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-tropical-orange hover:text-tropical-orange'
              }`}
            >
              <FaHotel className="text-xl" />
              <span>จัดการบ้านพัก</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              <FaCalendarAlt className="text-xl" />
              <span>ปฏิทิน</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-luxury-gold to-luxury-bronze text-white shadow-luxury scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-luxury-gold hover:text-luxury-gold'
              }`}
            >
              <FaUserShield className="text-xl" />
              <span>สิทธิ์ผู้ใช้</span>
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Grid with new components */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <AdminStats
                  icon={<FaHotel />}
                  label="บ้านพักทั้งหมด"
                  value={stats.totalRooms}
                  gradient="from-pool-blue to-pool-dark"
                />
                <AdminStats
                  icon={<FaCalendarCheck />}
                  label="บ้านพักว่าง"
                  value={stats.availableRooms}
                  gradient="from-tropical-green to-tropical-lime"
                />
                <AdminStats
                  icon={<FaUsers />}
                  label="การจองทั้งหมด"
                  value={stats.totalBookings}
                  gradient="from-tropical-orange to-luxury-gold"
                />
                <AdminStats
                  icon={<FaDollarSign />}
                  label="รายได้"
                  value={`฿${stats.revenue.toLocaleString()}`}
                  gradient="from-luxury-gold to-luxury-bronze"
                />
              </div>

              {/* Recent Bookings */}
              <AdminCard variant="glass" hover={false}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-tropical-green to-tropical-lime rounded-xl">
                    <FaCalendarCheck className="text-3xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">การจองล่าสุด</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-pool-blue/10 to-tropical-green/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          ชื่อผู้จอง
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          บ้านพัก
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          วันที่
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          สถานะ
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          ยอดรวม
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-pool-light/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{booking.guestName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800">{booking.roomName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                            {booking.checkIn} ถึง {booking.checkOut}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                            ฿{booking.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <AdminCard variant="glass" hover={false}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-tropical-green to-tropical-lime rounded-xl">
                    <FaCalendarCheck className="text-3xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">จัดการการจอง</h2>
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border-2 border-tropical-green/30 rounded-xl outline-none focus:ring-4 focus:ring-tropical-green/20 focus:border-tropical-green text-gray-700 font-medium">
                    <option value="">ทั้งหมด</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </div>
              </div>

              {message && (
                <div className="mb-4 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium">
                  ✓ {message}
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium">
                  ⚠ {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ชื่อผู้จอง
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ติดต่อ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        บ้านพัก
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        วันที่เข้าพัก
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ผู้เข้าพัก
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        สลิป
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ยอดรวม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-black">#{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-black">
                          {booking.guestName}
                        </td>
                        <td className="px-6 py-4 text-black">
                          <div className="text-sm">
                            <div>{booking.email}</div>
                            <div className="text-gray-500">{booking.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-black">{booking.roomName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-black text-sm">
                          {booking.checkIn} - {booking.checkOut}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-black">{booking.guests} คน</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.slipImage ? (
                            <button
                              onClick={() => openSlipModal(booking.slipImage!)}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              ดูสลิป
                            </button>
                          ) : (
                            <span className="text-gray-400">ไม่มี</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-black">
                          ฿{booking.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => openEditBookingModal(booking)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="แก้ไข"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="ลบ"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            {booking.status === 'pending' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                                >
                                  ยืนยัน
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                                >
                                  ปฏิเสธ
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">จัดการบ้านพัก</h2>
                <button 
                  onClick={openAddRoomModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <FaPlus />
                  <span>เพิ่มบ้านพักใหม่</span>
                </button>
              </div>

              {message && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                        <p className="text-2xl font-bold text-primary-600">
                          ฿{room.price.toLocaleString()}
                          <span className="text-sm text-gray-500 font-normal">/คืน</span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          room.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {room.available ? 'ว่าง' : 'ไม่ว่าง'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="line-clamp-2">{room.description}</p>
                      {room.beds && <p>เตียง: {room.beds}</p>}
                      <p>รองรับผู้เข้าพัก: {room.guests} คน</p>
                      {room.location && <p>สถานที่: {room.location}</p>}
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditRoomModal(room)}
                        className="flex-1 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                      >
                        แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDeleteRoom(room.id)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {rooms.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FaHotel className="mx-auto text-6xl mb-4 text-gray-300" />
                  <p className="text-xl">ยังไม่มีบ้านพักในระบบ</p>
                  <p className="text-sm mt-2">คลิกปุ่ม "เพิ่มบ้านพักใหม่" เพื่อเริ่มต้น</p>
                </div>
              )}
            </div>
          )}

          {/* Calendar Management Tab */}
          {activeTab === 'calendar' && (
            <AdminCard variant="glass" hover={false}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <FaCalendarAlt className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการปฏิทินจองห้องพัก</h2>
                    <p className="text-gray-700 text-lg font-medium">อัปเดตสถานะและจัดการปฏิทินการจองทุกห้องพัก</p>
                  </div>
                </div>
              </div>

              {/* Calendar Control Panel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 mb-8 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaEdit className="text-blue-600" />
                  ตั้งค่าสถานะปฏิทิน
                </h3>

                {/* Room Selection */}
                <div className="mb-6">
                  <label className="block text-gray-800 font-bold mb-3 text-lg">
                    🏠 เลือกห้องพัก
                  </label>
                  <select
                    value={selectedRoom || ''}
                    onChange={(e) => setSelectedRoom(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-ocean-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 text-black font-medium bg-white"
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id} className="text-black">
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Status Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-800 font-bold mb-3 text-lg">
                      📅 วันที่เดียว
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-600 text-gray-900 font-semibold bg-white shadow-md"
                      style={{ colorScheme: 'light' }}
                    />
                    <p className="text-sm text-gray-800 mt-2 font-bold bg-blue-50 px-3 py-2 rounded-lg">
                      💡 สำหรับอัปเดตวันเดียว
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-800 font-bold mb-3 text-lg">
                      🎯 สถานะ
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-600 text-gray-900 font-bold bg-white shadow-md"
                    >
                      <option value="available" className="text-gray-900 font-semibold">⚪ ว่าง (Available)</option>
                      <option value="booked" className="text-gray-900 font-semibold">🔴 ติดจองแล้ว (Booked)</option>
                      <option value="pending" className="text-gray-900 font-semibold">🟡 จองแล้ว-ยังไม่โอน (Pending)</option>
                      <option value="holiday" className="text-gray-900 font-semibold">🟢 วันหยุดยาว-นักขัตฤกษ์ (Holiday)</option>
                      <option value="maintenance" className="text-gray-900 font-semibold">🟠 ปรับปรุง-ซ่อมแซม (Maintenance)</option>
                    </select>
                  </div>
                </div>

                {/* Date Range for Bulk Update */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-6 mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-600" />
                    📆 ช่วงวันที่ (สำหรับอัปเดตหลายวัน)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-800 font-bold mb-2">
                        🟢 วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-gray-900 font-medium bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2">
                        🔴 วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-gray-900 font-medium bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Note Field */}
                <div className="mb-6">
                  <label className="block text-gray-800 font-bold mb-3 text-lg">
                    📝 หมายเหตุ
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500 bg-white"
                  />
                </div>

                {/* Special Discount Section */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-5 shadow-md">
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => {
                          setHasDiscount(e.target.checked)
                          if (!e.target.checked) {
                            setDiscountAmount('')
                            setDiscountReason('')
                          }
                        }}
                        className="w-6 h-6 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                      />
                      <FaFire className="text-orange-600 text-2xl animate-pulse" />
                      <span className="text-xl font-bold text-gray-900">
                        ติดสติ๊กเกอร์ราคาพิเศษ 🔥
                      </span>
                    </label>

                    {hasDiscount && (
                      <div className="mt-4 space-y-4 bg-white p-4 rounded-lg border-2 border-orange-200">
                        <div>
                          <label className="block text-gray-900 font-semibold mb-2">
                            💰 จำนวนเงินที่ลด (บาท) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            placeholder="เช่น 500"
                            min="0"
                            className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black font-medium placeholder-gray-400"
                            required={hasDiscount}
                          />
                          <p className="text-sm text-gray-600 mt-1">ระบุจำนวนเงินที่ลดต่อคืน</p>
                        </div>

                        <div>
                          <label className="block text-gray-900 font-semibold mb-2">
                            📝 เหตุผลการลดราคา <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={discountReason}
                            onChange={(e) => setDiscountReason(e.target.value)}
                            placeholder="เช่น โปรโมชั่นวันหยุดยาว, ช่วงโลว์ซีซัน, ลูกค้าประจำ"
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black font-medium placeholder-gray-400"
                            required={hasDiscount}
                          />
                          <p className="text-sm text-gray-600 mt-1">อธิบายเหตุผลที่ลดราคาเพื่อความชัดเจน</p>
                        </div>

                        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                          <p className="text-sm text-gray-800 font-medium">
                            💡 <strong>หมายเหตุ:</strong> ส่วนลดจะถูกนำไปคำนวณอัตโนมัติเมื่อลูกค้าจองวันที่มีสติ๊กเกอร์นี้
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <button
                    onClick={handleUpdateDay}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border-2 border-blue-400"
                  >
                    <FaCalendarCheck className="text-xl" />
                    <span>อัปเดตวันเดียว</span>
                  </button>
                  <button
                    onClick={handleBulkUpdate}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border-2 border-indigo-400"
                  >
                    <FaCalendarAlt className="text-xl" />
                    <span>อัปเดตหลายวัน</span>
                  </button>
                  <button
                    onClick={handleRemoveDiscount}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border-2 border-gray-500"
                  >
                    <FaTimes className="text-xl" />
                    <span>ลบสติ๊กเกอร์</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDate('')
                      setStartDate('')
                      setEndDate('')
                      setNote('')
                      setHasDiscount(false)
                      setDiscountAmount('')
                      setDiscountReason('')
                      setSelectedStatus('available')
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border-2 border-red-400"
                  >
                    <FaTimes className="text-xl" />
                    <span>ล้างข้อมูล</span>
                  </button>
                </div>

                {/* Message Display */}
                {calendarMessage && (
                  <div className={`p-4 rounded-lg font-semibold text-lg ${calendarMessage.includes('✅') ? 'bg-green-100 text-green-900 border-2 border-green-400' : 'bg-red-100 text-red-900 border-2 border-red-400'}`}>
                    {calendarMessage}
                  </div>
                )}
              </div>

              {/* Calendar Display */}
              {selectedRoom && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <RoomCalendar
                    key={calendarKey}
                    roomId={selectedRoom}
                    roomName={rooms.find(r => r.id === selectedRoom)?.name || ''}
                  />
                </div>
              )}

              {/* Quick Guide */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mt-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  📚 คำแนะนำการใช้งาน
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
                    <FaCalendarCheck className="text-blue-600 mt-1 text-xl flex-shrink-0" />
                    <div>
                      <strong className="text-lg block mb-1 text-gray-800">อัปเดตวันเดียว:</strong>
                      <span className="text-gray-700 font-medium">ใส่วันที่ในรูปแบบ 2024-12-25</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
                    <FaCalendarAlt className="text-indigo-600 mt-1 text-xl flex-shrink-0" />
                    <div>
                      <strong className="text-lg block mb-1 text-gray-800">อัปเดตหลายวัน:</strong>
                      <span className="text-gray-700 font-medium">ใส่ช่วงวันที่ 2024-12-25 to 2024-12-31</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
                    <FaFire className="text-orange-600 mt-1 text-xl flex-shrink-0" />
                    <div>
                      <strong className="text-lg block mb-1 text-gray-800">สติ๊กเกอร์ลดราคา:</strong>
                      <span className="text-gray-700 font-medium">ติ๊กช่องเพื่อแสดงไอคอนไฟ 🔥 บนปฏิทิน</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
                    <FaCalendarCheck className="text-green-600 mt-1 text-xl flex-shrink-0" />
                    <div>
                      <strong className="text-lg block mb-1 text-gray-800">Auto Update:</strong>
                      <span className="text-gray-700 font-medium">ระบบอัปเดตอัตโนมัติเมื่อยืนยันการจอง</span>
                    </div>
                  </div>
                </div>
              </div>
            </AdminCard>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div>
              <AdminCard variant="glass" hover={false} className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-xl">
                    <FaUserShield className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการสิทธิ์ Admin</h2>
                    <p className="text-gray-700 text-lg font-medium">เพิ่มหรือถอดสิทธิ์ผู้ดูแลระบบ</p>
                  </div>
                </div>
              </AdminCard>

              {/* Messages */}
              {message && (
                <div className="mb-6 bg-green-50 border-2 border-green-300 text-green-800 px-5 py-4 rounded-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">⚠</span>
                  {error}
                </div>
              )}

              {/* Form */}
              <AdminCard variant="glass" hover={false} className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">➕</span>
                  เพิ่มสิทธิ์ Admin
                </h3>
                
                <form onSubmit={handlePromoteUser} className="space-y-6">
                  <div>
                    <label className="block text-gray-800 font-bold mb-3 text-lg">
                      📧 อีเมลผู้ใช้
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full p-4 pl-12 border-2 border-luxury-gold/30 rounded-xl focus:ring-4 focus:ring-luxury-gold/20 focus:border-luxury-gold text-gray-900 font-medium bg-white"
                        placeholder="example@email.com"
                        required
                      />
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-gold text-xl" />
                    </div>
                    <p className="text-sm text-gray-700 mt-3 font-semibold">
                      💡 กรอกอีเมลของผู้ใช้ที่ต้องการเพิ่มสิทธิ์ Admin
                    </p>
                  </div>

                  <AdminButton
                    type="submit"
                    variant="luxury"
                    size="lg"
                    fullWidth
                    loading={userLoading}
                    icon={<FaUserShield />}
                  >
                    เพิ่มสิทธิ์ Admin
                  </AdminButton>
                </form>
              </AdminCard>

              {/* Demote Admin Section */}
              <AdminCard variant="glass" hover={false}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">➖</span>
                  ถอดสิทธิ์ Admin
                </h3>
                
                <form onSubmit={handleDemoteUser} className="space-y-6">
                  <div>
                    <label className="block text-gray-800 font-bold mb-3 text-lg">
                      📧 อีเมลผู้ใช้
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={demoteEmail}
                        onChange={(e) => setDemoteEmail(e.target.value)}
                        className="w-full p-4 pl-12 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 text-gray-900 font-medium bg-white"
                        placeholder="example@email.com"
                        required
                      />
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 text-xl" />
                    </div>
                    <p className="text-sm text-gray-700 mt-3 font-semibold">
                      ⚠️ กรอกอีเมลของผู้ใช้ที่ต้องการถอดสิทธิ์ Admin
                    </p>
                  </div>

                  <AdminButton
                    type="submit"
                    variant="danger"
                    size="lg"
                    fullWidth
                    loading={demoteLoading}
                    icon={<FaUserShield />}
                  >
                    ถอดสิทธิ์ Admin
                  </AdminButton>
                </form>

                {/* Warning Box */}
                <div className="mt-8 bg-red-50 border-2 border-red-300 rounded-xl p-5">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ คำเตือน:</h3>
                  <h3 className="font-semibold text-red-900 mb-2">คำเตือน:</h3>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside font-medium">
                    <li>การถอดสิทธิ์จะทำให้ผู้ใช้ไม่สามารถเข้าถึง Admin Mode ได้</li>
                    <li>ไม่สามารถถอดสิทธิ์ตัวเองได้</li>
                    <li>ใช้ความระมัดระวังในการถอดสิทธิ์ Admin</li>
                  </ul>
                </div>
              </AdminCard>

              {/* Info Box */}
              <AdminCard variant="glass" hover={false} className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3 text-xl flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span>
                  หมายเหตุสำคัญ
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 text-lg font-bold">✓</span>
                    <span className="font-medium">เฉพาะ Admin เท่านั้นที่สามารถจัดการสิทธิ์ได้</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg font-bold">✓</span>
                    <span className="font-medium">ผู้ใช้ที่ได้รับสิทธิ์ Admin จะสามารถเข้าถึง Admin Mode ได้</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 text-lg font-bold">⚠</span>
                    <span className="font-medium">ใช้ความระมัดระวังในการให้และถอดสิทธิ์ Admin</span>
                  </li>
                </ul>
              </AdminCard>
            </div>
          )}
        </div>
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onPaste={handlePaste}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingRoom ? 'แก้ไขบ้านพัก' : 'เพิ่มบ้านพักใหม่'}
              </h3>
              <button
                onClick={closeRoomModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmitRoom} className="p-6 space-y-4">
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

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  ชื่อบ้านพัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={roomFormData.name}
                  onChange={handleRoomFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="เช่น Deluxe Suite"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ราคาต่อคืน (บาท) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={roomFormData.price}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="2500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    รองรับผู้เข้าพัก (คน) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={roomFormData.guests}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="4"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  รายละเอียดบ้านพัก <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={roomFormData.description}
                  onChange={handleRoomFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="อธิบายเกี่ยวกับบ้านพัก..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    จำนวนเตียง
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={roomFormData.beds}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="2"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ขนาด (ตร.ม.)
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={roomFormData.size}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="45"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  สถานที่
                </label>
                <input
                  type="text"
                  name="location"
                  value={roomFormData.location}
                  onChange={handleRoomFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  placeholder="กรุงเทพ"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  รูปภาพบ้านพัก <span className="text-red-500">*</span>
                </label>
                
                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  tabIndex={0}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600">
                      <label className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                        <span>เลือกรูปภาพ</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                      <span className="text-gray-500"> หรือลากไฟล์มาวาง</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      รองรับ: JPG, PNG, GIF | วางรูปได้ด้วย Ctrl+V
                    </p>
                  </div>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg ${
                            roomFormData.image === img ? 'ring-4 ring-primary-500' : ''
                          }`}
                        />
                        
                        {/* Main Image Badge */}
                        {roomFormData.image === img && (
                          <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                            รูปหลัก
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {roomFormData.image !== img && (
                            <button
                              type="button"
                              onClick={() => setMainImage(index)}
                              className="px-3 py-1 bg-white text-gray-800 text-xs rounded hover:bg-gray-100"
                            >
                              ตั้งเป็นหลัก
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            ลบ
                          </button>
                        </div>

                        {/* Image Number */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">ยังไม่มีรูปภาพ กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป</p>
                )}
              </div>

              {/* รายละเอียดเพิ่มเติม */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">รายละเอียดเพิ่มเติม</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      ค่ามัดจำ (บาท)
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={roomFormData.deposit}
                      onChange={handleRoomFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      placeholder="300"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      จำนวนคืนขั้นต่ำ
                    </label>
                    <input
                      type="number"
                      name="minNights"
                      value={roomFormData.minNights}
                      onChange={handleRoomFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      เวลาเช็คอิน
                    </label>
                    <input
                      type="time"
                      name="checkInTime"
                      value={roomFormData.checkInTime}
                      onChange={handleRoomFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      เวลาเช็คเอาต์
                    </label>
                    <input
                      type="time"
                      name="checkOutTime"
                      value={roomFormData.checkOutTime}
                      onChange={handleRoomFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      จำนวนห้องนอน
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={roomFormData.bedrooms}
                      onChange={handleRoomFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      placeholder="1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      จำนวนห้องน้ำ
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={roomFormData.bathrooms}
                      onChange={handleRoomFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      placeholder="1"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ราคาห้องเดียว (บาท)
                  </label>
                  <input
                    type="number"
                    name="singleRoomPrice"
                    value={roomFormData.singleRoomPrice}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="700"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">ราคาสำหรับผู้เข้าพัก 1 ท่าน</p>
                </div>
              </div>

              {/* สิ่งอำนวยความสะดวก */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">สิ่งอำนวยความสะดวก</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="wifi"
                      checked={roomFormData.wifi === 'true'}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, wifi: e.target.checked ? 'true' : 'false' }))}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">Free WiFi</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="pool"
                      checked={roomFormData.pool === 'true'}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, pool: e.target.checked ? 'true' : 'false' }))}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">สระว่ายน้ำ</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={roomFormData.parking === 'true'}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, parking: e.target.checked ? 'true' : 'false' }))}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">ที่จอดรถ</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="kitchen"
                      checked={roomFormData.kitchen === 'true'}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, kitchen: e.target.checked ? 'true' : 'false' }))}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">ครัว</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    อุปกรณ์เสริม
                  </label>
                  <textarea
                    name="extraEquipment"
                    value={roomFormData.extraEquipment}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="เช่น เครื่องเสียง, โทรทัศน์, ไมโครเวฟ"
                    rows={2}
                  />
                </div>
              </div>

              {/* กฎและข้อกำหนด */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">กฎและข้อกำหนด</h4>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    คำแนะนำที่พัก
                  </label>
                  <textarea
                    name="houseRules"
                    value={roomFormData.houseRules}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="กฎการเข้าพัก เช่น ห้ามสูบบุหรี่, ห้ามนำสัตว์เลี้ยง"
                    rows={3}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    โปรโมชั่น
                  </label>
                  <textarea
                    name="promotion"
                    value={roomFormData.promotion}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="โปรโมชั่นพิเศษ เช่น จอง 3 คืน ลด 10%"
                    rows={2}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    คำแนะนำการยกเลิก
                  </label>
                  <textarea
                    name="cancellationPolicy"
                    value={roomFormData.cancellationPolicy}
                    onChange={handleRoomFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="นโยบายการยกเลิกการจอง"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeRoomModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={roomLoading}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  disabled={roomLoading}
                >
                  {roomLoading ? 'กำลังบันทึก...' : editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มบ้านพัก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Edit Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">แก้ไขการจอง</h3>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ชื่อผู้จอง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={bookingFormData.guestName}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    บ้านพัก <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="roomName"
                    value={bookingFormData.roomName}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingFormData.email}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    เบอร์โทร
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingFormData.phone}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    วันเช็คอิน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={bookingFormData.checkIn}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
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
                    value={bookingFormData.checkOut}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    จำนวนผู้เข้าพัก <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={bookingFormData.guests}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ยอดรวม (บาท) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={bookingFormData.total}
                    onChange={handleBookingFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeBookingModal}
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
                  {bookingLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Image Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowSlipModal(false)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSlipModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <FaTimes className="text-3xl" />
            </button>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">สลิปการโอนเงิน</h3>
              <div className="relative w-full h-[600px]">
                <Image
                  src={selectedSlip}
                  alt="Payment Slip"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
