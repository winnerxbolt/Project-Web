'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RoomCalendar from '@/components/RoomCalendar'
import { useAuth } from '@/contexts/AuthContext'
import { FaHotel, FaCalendarCheck, FaDollarSign, FaUsers, FaPlus, FaEdit, FaUserShield, FaSearch, FaTimes, FaCalendarAlt, FaFire, FaCrown, FaChartLine, FaDatabase, FaComments, FaQuestionCircle, FaRobot, FaMapMarkedAlt, FaImages, FaEnvelope, FaShieldAlt, FaBan, FaMobileAlt, FaUndo, FaCheckCircle, FaStar } from 'react-icons/fa'
import { containsProfanity } from '@/lib/profanityFilter'
import AdminStats from '@/components/AdminStats'
import AdminButton from '@/components/AdminButton'
import AdminCard from '@/components/AdminCard'

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

interface User {
  id: string | number
  name?: string
  email: string
  role: string
  phone?: string
  picture?: string
  isVerified: boolean
  createdAt: string
  updatedAt?: string
}

interface SystemSetting {
  id: string
  systemKey: string
  systemName: string
  description?: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const { promoteToAdmin, demoteFromAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'calendar' | 'users' | 'settings' | 'bookings' | 'payments' | 'promotions' | 'reports' | 'notifications' | 'reviews' | 'articles' | 'videos'>('dashboard')
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

  // Users management states
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // System settings states
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([])
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalRevenue: 0
  })

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
      fetchUsers()
      fetchSystemSettings()
    }
    initializeAdmin()
  }, [])

  // Filter users based on search
  useEffect(() => {
    if (userSearch.trim() === '') {
      setFilteredUsers(users)
    } else {
      const search = userSearch.toLowerCase()
      setFilteredUsers(
        users.filter(user => 
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search)
        )
      )
    }
  }, [userSearch, users])

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users from API...')
      const response = await fetch('/api/users')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Users fetched:', data.count || 0, 'users')
        console.log('📊 Users data:', data.users)
        setUsers(data.users || [])
        
        if (data.users && data.users.length === 0) {
          console.log('⚠️ No users found in database')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch users:', errorData)
        setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const fetchSystemSettings = async () => {
    try {
      console.log('🔄 Fetching system settings from API...')
      const response = await fetch('/api/admin/system-settings')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ System settings fetched:', data.settings?.length || 0, 'settings')
        setSystemSettings(data.settings || [])
      } else {
        console.error('❌ Failed to fetch system settings')
      }
    } catch (error) {
      console.error('❌ Error fetching system settings:', error)
    }
  }

  const toggleSystemSetting = async (systemKey: string, currentStatus: boolean) => {
    try {
      setSettingsLoading(true)
      console.log('🔄 Toggling system setting:', systemKey, '→', !currentStatus)

      const response = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemKey,
          isEnabled: !currentStatus
        })
      })

      if (response.ok) {
        console.log('✅ System setting updated')
        setMessage(`อัพเดทการตั้งค่า ${systemKey} สำเร็จ`)
        setTimeout(() => setMessage(''), 3000)
        // Refresh settings
        await fetchSystemSettings()
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to update system setting:', errorData)
        setError('ไม่สามารถอัพเดทการตั้งค่าได้')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('❌ Error toggling system setting:', error)
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSettingsLoading(false)
    }
  }

  const calculateStats = () => {
    setStats({
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.available).length,
      totalBookings: 0,
      totalRevenue: 0
    })
  }

  // Update stats when rooms change
  useEffect(() => {
    calculateStats()
  }, [rooms])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      
      // Validate array
      if (Array.isArray(data)) {
        setRooms(data);
      } else if (data.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
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

  const handlePromoteToAdmin = async (userId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการให้สิทธิ์ Admin แก่ผู้ใช้นี้?')) {
      return
    }

    try {
      const response = await fetch('/api/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        setMessage('✅ ให้สิทธิ์ Admin สำเร็จ')
        fetchUsers()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError('❌ เกิดข้อผิดพลาดในการให้สิทธิ์')
      }
    } catch (error) {
      setError('❌ เกิดข้อผิดพลาด')
      console.error('Error promoting user:', error)
    }
  }

  const handleDemoteFromAdmin = async (userId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการถอดสิทธิ์ Admin ของผู้ใช้นี้?')) {
      return
    }

    try {
      const response = await fetch('/api/users/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        setMessage('✅ ถอดสิทธิ์ Admin สำเร็จ')
        fetchUsers()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError('❌ เกิดข้อผิดพลาดในการถอดสิทธิ์')
      }
    } catch (error) {
      setError('❌ เกิดข้อผิดพลาด')
      console.error('Error demoting user:', error)
    }
  }

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

          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {/* Dashboard - อ่านสถานะจาก database */}
            {systemSettings.find(s => s.systemKey === 'dashboard')?.isEnabled !== false && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-pool-blue to-pool-dark text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-pool-blue hover:text-pool-blue'
                }`}
              >
                <FaChartLine className="text-xl inline mr-2" />
                <span>ภาพรวม</span>
              </button>
            )}
            
            {/* System Settings - แสดงเสมอ */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600'
              }`}
            >
              <FaDatabase className="text-xl inline mr-2" />
              <span>ตั้งค่าระบบ</span>
            </button>

            {/* Rooms - อ่านสถานะจาก database */}
            {systemSettings.find(s => s.systemKey === 'rooms')?.isEnabled ? (
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'rooms'
                    ? 'bg-gradient-to-r from-pool-blue to-pool-dark text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-pool-blue hover:text-pool-blue'
                }`}
              >
                <FaHotel className="text-xl inline mr-2" />
                <span>จัดการบ้านพัก</span>
              </button>
            ) : (
              <button
                className="px-6 py-3 font-bold rounded-xl bg-white text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-50"
                disabled
              >
                <FaHotel className="text-xl inline mr-2" />
                <span>จัดการบ้านพัก (ปิดชั่วคราว)</span>
              </button>
            )}

            {/* Calendar - อ่านสถานะจาก database */}
            {systemSettings.find(s => s.systemKey === 'calendar')?.isEnabled ? (
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'calendar'
                    ? 'bg-gradient-to-r from-pool-blue to-pool-dark text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-pool-blue hover:text-pool-blue'
                }`}
              >
                <FaCalendarAlt className="text-xl inline mr-2" />
                <span>ปฏิทิน</span>
              </button>
            ) : (
              <button
                className="px-6 py-3 font-bold rounded-xl bg-white text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-50"
                disabled
              >
                <FaCalendarAlt className="text-xl inline mr-2" />
                <span>ปฏิทิน (ปิดชั่วคราว)</span>
              </button>
            )}

            {/* Users - อ่านสถานะจาก database */}
            {systemSettings.find(s => s.systemKey === 'users')?.isEnabled !== false && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-luxury-gold to-luxury-bronze text-gray-900 shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-luxury-gold hover:text-luxury-gold'
                }`}
              >
                <FaUserShield className="text-xl inline mr-2" />
                <span>สิทธิ์ผู้ใช้</span>
              </button>
            )}

            {/* Bookings */}
            {systemSettings.find(s => s.systemKey === 'bookings')?.isEnabled && (
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'bookings'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                <FaCalendarCheck className="text-xl inline mr-2" />
                <span>จัดการจอง</span>
              </button>
            )}

            {/* Payments */}
            {systemSettings.find(s => s.systemKey === 'payments')?.isEnabled && (
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'payments'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-green-600 hover:text-green-600'
                }`}
              >
                <FaDollarSign className="text-xl inline mr-2" />
                <span>การชำระเงิน</span>
              </button>
            )}

            {/* Promotions */}
            {systemSettings.find(s => s.systemKey === 'promotions')?.isEnabled && (
              <button
                onClick={() => setActiveTab('promotions')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'promotions'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-600 hover:text-orange-600'
                }`}
              >
                <FaFire className="text-xl inline mr-2" />
                <span>โปรโมชั่น</span>
              </button>
            )}

            {/* Reports */}
            {systemSettings.find(s => s.systemKey === 'reports')?.isEnabled && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600'
                }`}
              >
                <FaChartLine className="text-xl inline mr-2" />
                <span>รายงาน</span>
              </button>
            )}

            {/* Notifications */}
            {systemSettings.find(s => s.systemKey === 'notifications')?.isEnabled && (
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-yellow-600 hover:text-yellow-600'
                }`}
              >
                <FaEnvelope className="text-xl inline mr-2" />
                <span>แจ้งเตือน</span>
              </button>
            )}

            {/* Reviews */}
            {systemSettings.find(s => s.systemKey === 'reviews')?.isEnabled !== false && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600'
                }`}
              >
                <FaCrown className="text-xl inline mr-2" />
                <span>รีวิว</span>
              </button>
            )}

            {/* Articles */}
            {systemSettings.find(s => s.systemKey === 'articles')?.isEnabled !== false && (
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'articles'
                    ? 'bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-teal-600 hover:text-teal-600'
                }`}
              >
                <FaDatabase className="text-xl inline mr-2" />
                <span>บทความ</span>
              </button>
            )}

            {/* Videos */}
            {systemSettings.find(s => s.systemKey === 'videos')?.isEnabled && (
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'videos'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-red-600 hover:text-red-600'
                }`}
              >
                <FaChartLine className="text-xl inline mr-2" />
                <span>วิดีโอ</span>
              </button>
            )}
          </div>

          {/* ข้อความแจ้งเตือน */}
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaCheckCircle className="text-blue-600 text-2xl" />
              <h3 className="text-xl font-bold text-blue-800">ระบบที่เปิดใช้งาน</h3>
            </div>
            <p className="text-blue-700">
              {systemSettings.filter(s => s.isEnabled).map(s => s.systemName).join(', ') || 'กำลังโหลด...'}
            </p>
          </div>

          {/* ระบบอื่นๆ ที่ปิดไว้ชั่วคราว - แสดงเป็นสีเทา */}
          {systemSettings.filter(s => !s.isEnabled && s.systemKey !== 'settings').length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-500 mb-4 text-center">
                ระบบที่ปิดชั่วคราว ({systemSettings.filter(s => !s.isEnabled && s.systemKey !== 'settings').length} ระบบ)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {systemSettings.filter(s => !s.isEnabled && s.systemKey !== 'settings').map(setting => (
                  <div 
                    key={setting.id}
                    className="px-4 py-3 rounded-xl bg-gray-200 text-gray-600 flex items-center gap-2 cursor-not-allowed opacity-50"
                  >
                    <FaDatabase className="text-lg" />
                    <span className="text-sm">{setting.systemName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Grid */}
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
                  label="สมาชิกทั้งหมด"
                  value={users.length}
                  gradient="from-luxury-gold to-luxury-bronze"
                />
                <AdminStats
                  icon={<FaStar />}
                  label="รีวิวทั้งหมด"
                  value={0}
                  gradient="from-sunset-orange to-sunset-red"
                />
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-xl">
                    <FaUserShield className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้งาน</h2>
                    <p className="text-gray-700 font-medium">ควบคุมสิทธิ์และข้อมูลผู้ใช้งานในระบบ</p>
                  </div>
                </div>
              </div>

              {/* Existing Users Table */}
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaUsers />
                  ผู้ใช้ทั้งหมดในระบบ
                  <span className="text-sm font-normal opacity-75">({users.length} คน)</span>
                </h3>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="mb-4 bg-green-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span>{message}</span>
                  </div>
                )}

                {/* User search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="🔍 ค้นหาผู้ใช้ด้วยชื่อหรืออีเมล..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border-2 border-white/50 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white/50 focus:bg-white transition-all backdrop-blur-sm font-medium shadow-lg"
                  />
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/20 text-white">
                          <th className="px-6 py-4 text-left font-bold">ชื่อ</th>
                          <th className="px-6 py-4 text-left font-bold">อีเมล</th>
                          <th className="px-6 py-4 text-left font-bold">สิทธิ์</th>
                          <th className="px-6 py-4 text-left font-bold">สถานะ</th>
                          <th className="px-6 py-4 text-left font-bold">วันที่สมัคร</th>
                          <th className="px-6 py-4 text-center font-bold">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-white/80">
                              <FaUsers className="mx-auto text-5xl mb-3 text-white/40" />
                              <p className="text-lg font-medium">ไม่พบผู้ใช้ที่ค้นหา</p>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(user => (
                            <tr 
                              key={user.id}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 text-white font-medium">{user.name || 'ไม่ระบุ'}</td>
                              <td className="px-6 py-4 text-white/90">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  user.role === 'admin' 
                                    ? 'bg-luxury-gold text-gray-900' 
                                    : 'bg-white/20 text-white'
                                }`}>
                                  {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  user.isVerified 
                                    ? 'bg-green-500/80 text-white' 
                                    : 'bg-yellow-500/80 text-gray-900'
                                }`}>
                                  {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white/80 text-sm">
                                {new Date(user.createdAt).toLocaleDateString('th-TH')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                  {user.role !== 'admin' ? (
                                    <button
                                      onClick={() => handlePromoteToAdmin(user.id)}
                                      className="px-4 py-2 bg-gradient-to-r from-luxury-gold to-luxury-bronze text-gray-900 rounded-lg font-bold hover:shadow-xl hover:scale-105 transition-all text-sm shadow-lg"
                                    >
                                      ↑ ให้สิทธิ์ Admin
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDemoteFromAdmin(user.id)}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-105 transition-all text-sm shadow-lg"
                                    >
                                      ↓ ถอดสิทธิ์ Admin
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-white/10 backdrop-blur-sm rounded-xl text-white">
                  <p className="font-bold text-lg mb-2">📊 สรุปข้อมูลผู้ใช้</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">ทั้งหมด:</span>
                      <span className="ml-2 font-bold text-lg">{users.length} คน</span>
                    </div>
                    <div>
                      <span className="text-white/70">Admin:</span>
                      <span className="ml-2 font-bold text-lg text-luxury-gold">
                        {users.filter(u => u.role === 'admin').length} คน
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">User ธรรมดา:</span>
                      <span className="ml-2 font-bold text-lg">
                        {users.filter(u => u.role !== 'admin').length} คน
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                  <FaShieldAlt />
                  ⚠️ คำเตือนการจัดการสิทธิ์
                </h3>
                <ul className="space-y-3 text-white">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-lg font-bold">🔒</span>
                    <span className="font-medium">Admin มีสิทธิ์เต็มในการจัดการทุกส่วนของเว็บไซต์</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-lg font-bold">👤</span>
                    <span className="font-medium">ตรวจสอบตัวตนของผู้ใช้ก่อนให้สิทธิ์ Admin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 text-lg font-bold">⚠</span>
                    <span className="font-medium">ใช้ความระมัดระวังในการให้และถอดสิทธิ์ Admin</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                    <FaDatabase className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">ตั้งค่าระบบ</h2>
                    <p className="text-gray-700 font-medium">เปิด/ปิดระบบต่างๆ ในหน้า Admin</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="mb-4 bg-green-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span>{message}</span>
                </div>
              )}

              {/* System Settings Grid */}
              <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaDatabase />
                  ระบบทั้งหมด
                  <span className="text-sm font-normal opacity-75">({systemSettings.length} ระบบ)</span>
                </h3>

                {systemSettings.length === 0 ? (
                  <div className="text-center py-12 text-white">
                    <FaDatabase className="mx-auto text-5xl mb-3 text-white/40" />
                    <p className="text-lg font-medium">กำลังโหลดการตั้งค่า...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemSettings.map(setting => (
                      <div 
                        key={setting.id}
                        className={`bg-white/10 backdrop-blur-md rounded-xl p-5 border-2 transition-all duration-300 ${
                          setting.isEnabled 
                            ? 'border-green-400 shadow-lg shadow-green-500/20' 
                            : 'border-white/20 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg mb-1">
                              {setting.systemName}
                            </h4>
                            {setting.description && (
                              <p className="text-white/70 text-sm">
                                {setting.description}
                              </p>
                            )}
                          </div>
                          <div className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                            setting.isEnabled 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {setting.isEnabled ? '🟢 เปิด' : '🔴 ปิด'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => toggleSystemSetting(setting.systemKey, setting.isEnabled)}
                            disabled={settingsLoading}
                            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                              setting.isEnabled
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                            } ${settingsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                          >
                            {settingsLoading ? '⏳ กำลังอัพเดท...' : setting.isEnabled ? '🔴 ปิดระบบ' : '🟢 เปิดระบบ'}
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                          Key: {setting.systemKey}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-5 bg-white/10 backdrop-blur-sm rounded-xl text-white">
                  <p className="font-bold text-lg mb-2">📊 สรุปการตั้งค่า</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">ระบบที่เปิดใช้งาน:</span>
                      <span className="ml-2 font-bold text-lg text-green-300">
                        {systemSettings.filter(s => s.isEnabled).length} ระบบ
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">ระบบที่ปิด:</span>
                      <span className="ml-2 font-bold text-lg text-red-300">
                        {systemSettings.filter(s => !s.isEnabled).length} ระบบ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                  <FaShieldAlt />
                  ⚠️ คำเตือนการตั้งค่าระบบ
                </h3>
                <ul className="space-y-3 text-white">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-lg font-bold">🔒</span>
                    <span className="font-medium">การเปิด/ปิดระบบจะมีผลทันทีกับผู้ใช้ทุกคน</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 text-lg font-bold">⚡</span>
                    <span className="font-medium">ระบบที่ปิดจะไม่แสดงในหน้า Admin Dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 text-lg font-bold">📝</span>
                    <span className="font-medium">ตรวจสอบให้แน่ใจก่อนปิดระบบสำคัญ</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                    <FaCalendarCheck className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการการจอง</h2>
                    <p className="text-gray-700 font-medium">ดูและจัดการการจองทั้งหมด</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaCalendarCheck />
                  ระบบจัดการการจอง
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaCalendarCheck className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                    <FaDollarSign className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการการชำระเงิน</h2>
                    <p className="text-gray-700 font-medium">ดูประวัติและจัดการการชำระเงิน</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaDollarSign />
                  ระบบจัดการการชำระเงิน
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaDollarSign className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                </div>
              </div>
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
                    <FaFire className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการโปรโมชั่น</h2>
                    <p className="text-gray-700 font-medium">สร้างและจัดการโปรโมชั่นส่วนลด</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaFire />
                  ระบบจัดการโปรโมชั่น
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaFire className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                    <FaChartLine className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">รายงานและสถิติ</h2>
                    <p className="text-gray-700 font-medium">ดูรายงานและสถิติต่างๆ ของระบบ</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaChartLine />
                  ระบบรายงานและสถิติ
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaChartLine className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl">
                    <FaEnvelope className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการการแจ้งเตือน</h2>
                    <p className="text-gray-700 font-medium">ส่งและจัดการการแจ้งเตือนให้ผู้ใช้</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 via-orange-600 to-amber-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaEnvelope />
                  ระบบจัดการการแจ้งเตือน
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaEnvelope className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl">
                    <FaCrown className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการรีวิว</h2>
                    <p className="text-gray-700 font-medium">ตรวจสอบและจัดการรีวิวจากลูกค้า</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaCrown />
                  ระบบจัดการรีวิว
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaCrown className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                  <button
                    onClick={() => window.location.href = '/admin/reviews'}
                    className="mt-6 px-6 py-3 bg-white text-purple-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                  >
                    เปิดหน้าจัดการรีวิวแบบเต็ม →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl">
                    <FaDatabase className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการบทความ</h2>
                    <p className="text-gray-700 font-medium">สร้างและจัดการบทความและข่าวสาร</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-500 via-blue-600 to-blue-700 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaDatabase />
                  ระบบจัดการบทความ
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaDatabase className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                  <button
                    onClick={() => window.location.href = '/admin-articles'}
                    className="mt-6 px-6 py-3 bg-white text-teal-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                  >
                    เปิดหน้าจัดการบทความแบบเต็ม →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl">
                    <FaChartLine className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">จัดการวิดีโอ</h2>
                    <p className="text-gray-700 font-medium">อัพโหลดและจัดการวิดีโอประชาสัมพันธ์</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <FaChartLine />
                  ระบบจัดการวิดีโอ
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                  <FaChartLine className="mx-auto text-6xl text-white/40 mb-4" />
                  <p className="text-white text-lg font-medium">ระบบนี้พร้อมใช้งาน</p>
                  <p className="text-white/70 text-sm mt-2">เชื่อมต่อกับ database แล้ว</p>
                  <div className="mt-6 space-y-3">
                    <p className="text-white/90 text-sm">รองรับ:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">YouTube</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">Vimeo</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">MP4</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push('/admin-videos')}
                    className="mt-6 px-8 py-3 bg-white text-red-600 rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                  >
                    <FaChartLine />
                    ไปหน้าจัดการวิดีโอ
                  </button>
                </div>
              </div>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
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
    </main>
  )
}
