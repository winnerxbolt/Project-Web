import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const DEVILLE_API_URL = 'https://deville-central.com/api/houses/accommodations'
const DEVILLE_BEARER_TOKEN = 'UmV9Hj4PLzWhFDMDjasULWSzsJuUDLYSoiiB2uFtdoBYLEMx0wl1QVIXeR0plVYc'
const ROOMS_FILE = path.join(process.cwd(), 'data', 'rooms.json')

interface DevilleHouse {
  id: number | string
  name?: string
  title?: string
  description?: string
  address?: string
  location?: string
  price?: number
  daily_price?: number
  guests?: number
  max_guests?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  image?: string
  images?: string[]
  main_image?: string
  cover_image?: string
  photo?: string
  photos?: string[]
  gallery?: string[]
  amenities?: string[]
  available?: boolean
  status?: string
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
  bedrooms?: number
  bathrooms?: number
  kitchen?: boolean
  parking?: boolean
  pool?: boolean
  wifi?: boolean
  devilleId?: string | number
}

// ฟังก์ชันดึงรูปภาพจาก Deville House
function extractImages(house: DevilleHouse): string[] {
  const imageList: string[] = []
  
  // รวบรวมรูปภาพจากทุก field ที่เป็นไปได้
  const imageSources = [
    house.images,
    house.photos,
    house.gallery,
  ]
  
  // เพิ่มรูปเดี่ยวทั้งหมด
  const singleImages = [
    house.main_image,
    house.cover_image,
    house.image,
    house.photo,
  ]
  
  // รวมรูปจาก arrays
  imageSources.forEach(source => {
    if (Array.isArray(source) && source.length > 0) {
      source.forEach(img => {
        if (img && typeof img === 'string' && img.trim() !== '') {
          imageList.push(img.trim())
        }
      })
    }
  })
  
  // รวมรูปเดี่ยว (ถ้ายังไม่มีในรายการ)
  singleImages.forEach(img => {
    if (img && typeof img === 'string' && img.trim() !== '' && !imageList.includes(img.trim())) {
      imageList.push(img.trim())
    }
  })
  
  // กรองเฉพาะ URL ที่ถูกต้อง
  const validImages = imageList.filter(img => 
    img.startsWith('http://') || 
    img.startsWith('https://') || 
    img.startsWith('/')
  )
  
  // ใช้ logo.png แทน placeholder-villa.jpg ที่ไม่มีอยู่จริง
  return validImages.length > 0 ? validImages : ['/logo.png']
}

// แปลงข้อมูลจาก Deville เป็น Room format
function convertDevilleToRoom(house: DevilleHouse, index: number): Room {
  // ดึงรูปภาพทั้งหมด
  const allImages = extractImages(house)
  const mainImage = allImages[0] || '/logo.png'
  
  return {
    id: 1000 + index, // เริ่มจาก ID 1000+ เพื่อไม่ซ้ำกับห้องปกติ
    name: house.name || house.title || `Villa ${house.id}`,
    price: house.price || house.daily_price || 3000,
    description: house.description || 'บ้านพักสวยงามจาก Deville Central พร้อมสิ่งอำนวยความสะดวกครบครัน',
    guests: house.guests || house.max_guests || 4,
    beds: house.beds || house.bedrooms || 2,
    size: 150,
    image: mainImage,
    images: allImages,
    rating: 4.8,
    reviews: Math.floor(Math.random() * 50) + 10,
    amenities: house.amenities || ['WiFi', 'แอร์', 'TV', 'สระว่ายน้ำ', 'ที่จอดรถ', 'ครัว'],
    location: house.location || house.address || 'พัทยา ชลบุรี',
    available: house.available !== false && house.status !== 'unavailable',
    bedrooms: house.bedrooms || 2,
    bathrooms: house.bathrooms || 2,
    kitchen: true,
    parking: true,
    pool: true,
    wifi: true,
    devilleId: house.id
  }
}

// GET - ดึงข้อมูลบ้านพักจาก Deville Central และแปลงเป็น Room format
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sync = searchParams.get('sync') === 'true' // ถ้าส่ง ?sync=true จะบันทึกลง rooms.json

    // ดึงข้อมูลจาก Deville API
    const response = await fetch(DEVILLE_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEVILLE_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Deville API error: ${response.status}`)
    }

    const devilleData = await response.json()
    
    // แปลงข้อมูลให้เป็น array ถ้าเป็น object
    let houses: DevilleHouse[] = []
    if (Array.isArray(devilleData)) {
      houses = devilleData
    } else if (devilleData.data && Array.isArray(devilleData.data)) {
      houses = devilleData.data
    } else if (devilleData.houses && Array.isArray(devilleData.houses)) {
      houses = devilleData.houses
    } else if (devilleData.accommodations && Array.isArray(devilleData.accommodations)) {
      houses = devilleData.accommodations
    }

    // แปลงเป็น Room format
    const rooms: Room[] = houses.map((house, index) => convertDevilleToRoom(house, index))

    // ถ้ามีการ sync ให้บันทึกลง rooms.json
    if (sync && rooms.length > 0) {
      try {
        // อ่านห้องปัจจุบัน
        let existingRooms: Room[] = []
        try {
          const roomsData = await readFile(ROOMS_FILE, 'utf-8')
          existingRooms = JSON.parse(roomsData)
        } catch (error) {
          // ถ้าไฟล์ไม่มี ให้เริ่มต้นเป็น array ว่าง
          existingRooms = []
        }

        // ลบห้องจาก Deville ที่มีอยู่เดิม (ID >= 1000)
        existingRooms = existingRooms.filter(room => room.id < 1000)

        // เพิ่มห้องจาก Deville ใหม่
        const updatedRooms = [...existingRooms, ...rooms]

        // บันทึกลงไฟล์
        await writeFile(ROOMS_FILE, JSON.stringify(updatedRooms, null, 2))

        return NextResponse.json({
          success: true,
          data: rooms,
          synced: true,
          totalRooms: updatedRooms.length,
          devilleRooms: rooms.length,
          timestamp: new Date().toISOString()
        })
      } catch (syncError) {
        console.error('Error syncing to rooms.json:', syncError)
        // แม้ sync ไม่สำเร็จ ก็ยังส่งข้อมูลกลับไป
        return NextResponse.json({
          success: true,
          data: rooms,
          synced: false,
          syncError: 'Failed to write to rooms.json',
          timestamp: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: rooms,
      count: rooms.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching Deville accommodations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accommodations from Deville Central',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
