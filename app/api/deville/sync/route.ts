import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const ROOMS_FILE = path.join(process.cwd(), 'data', 'rooms.json')

// POST - Sync Deville rooms to rooms.json
export async function POST() {
  try {
    // เรียก API เพื่อดึงข้อมูลจาก Deville
    const devilleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/deville/accommodations`, {
      cache: 'no-store'
    })

    if (!devilleResponse.ok) {
      throw new Error('Failed to fetch Deville accommodations')
    }

    const devilleData = await devilleResponse.json()

    if (!devilleData.success || !devilleData.data) {
      throw new Error('Invalid Deville data')
    }

    const devilleRooms = devilleData.data

    // อ่านห้องปัจจุบัน
    let existingRooms: any[] = []
    try {
      const roomsData = await readFile(ROOMS_FILE, 'utf-8')
      existingRooms = JSON.parse(roomsData)
    } catch (error) {
      existingRooms = []
    }

    // ลบห้องจาก Deville ที่มีอยู่เดิม (ID >= 1000)
    const localRooms = existingRooms.filter(room => room.id < 1000)

    // รวมห้อง
    const allRooms = [...localRooms, ...devilleRooms]

    // บันทึก
    await writeFile(ROOMS_FILE, JSON.stringify(allRooms, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Synced successfully',
      stats: {
        localRooms: localRooms.length,
        devilleRooms: devilleRooms.length,
        totalRooms: allRooms.length
      }
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync rooms',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Get sync status
export async function GET() {
  try {
    const roomsData = await readFile(ROOMS_FILE, 'utf-8')
    const rooms = JSON.parse(roomsData)
    
    const devilleRooms = rooms.filter((r: any) => r.id >= 1000)
    const localRooms = rooms.filter((r: any) => r.id < 1000)

    return NextResponse.json({
      success: true,
      stats: {
        total: rooms.length,
        local: localRooms.length,
        deville: devilleRooms.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get sync status'
      },
      { status: 500 }
    )
  }
}
