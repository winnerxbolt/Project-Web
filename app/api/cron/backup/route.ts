import { NextResponse } from 'next/server'
import { createBackup, shouldBackup } from '@/lib/server/backup'

/**
 * GET /api/cron/backup
 * 
 * Cron job ที่รันทุก 7 วัน เพื่อสำรองข้อมูลอัตโนมัติ
 * 
 * วิธีตั้งค่า Cron:
 * 1. ใช้ Vercel Cron Jobs (vercel.json)
 * 2. หรือใช้ External Cron Services เช่น cron-job.org
 * 3. หรือใช้ Node-cron ใน server
 * 
 * ตั้งค่าให้รันทุก 7 วัน:
 * - Cron expression: "0 0 * * 0" (ทุกวันอาทิตย์ เวลา 00:00)
 */
export async function GET(request: Request) {
  try {
    // ตรวจสอบ authorization token (ป้องกันการเรียกใช้จากภายนอก)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token-here'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 เริ่มตรวจสอบระบบ Auto Backup...')

    // ตรวจสอบว่าถึงเวลา backup หรือยัง
    const needsBackup = await shouldBackup()

    if (!needsBackup) {
      console.log('⏭️ ยังไม่ถึงเวลา backup (ยังไม่ครบ 7 วัน)')
      return NextResponse.json({
        success: true,
        message: 'ยังไม่ถึงเวลา backup',
        skipped: true
      })
    }

    // สร้าง backup (จะลบเก่าอัตโนมัติ)
    console.log('📦 เริ่มสร้าง backup อัตโนมัติ...')
    const result = await createBackup()

    if (result.success) {
      console.log('✅ Auto Backup สำเร็จ:', result.message)
    } else {
      console.error('❌ Auto Backup ล้มเหลว:', result.message)
    }

    return NextResponse.json({
      ...result,
      autoBackup: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน Auto Backup:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในระบบ Auto Backup',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cron/backup - ทดสอบ backup ทันที (ไม่สนใจเวลา 7 วัน)
 */
export async function POST(request: Request) {
  try {
    // ตรวจสอบ authorization
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token-here'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔨 ทดสอบ Force Backup ทันที...')
    
    const result = await createBackup()

    return NextResponse.json({
      ...result,
      forceBackup: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน Force Backup:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาด',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
