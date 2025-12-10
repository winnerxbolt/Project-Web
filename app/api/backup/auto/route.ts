import { NextResponse } from 'next/server'
import { createBackup, loadBackupConfig } from '@/lib/server/backup'

/**
 * POST /api/backup/auto - Auto backup endpoint (เรียกจาก Vercel Cron)
 * ใช้สำหรับการ backup อัตโนมัติตาม schedule
 * Updated: 2025-12-10
 */
export async function POST(request: Request) {
  try {
    // ตรวจสอบ Authorization header (ถ้ามี)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    // ใน production ควรตรวจสอบ secret
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Auto backup triggered at:', new Date().toISOString())

    // โหลดการตั้งค่า
    const config = await loadBackupConfig()

    // ตรวจสอบว่าเปิดใช้งาน backup หรือไม่
    if (!config.enabled) {
      console.log('⚠️ Backup is disabled in config')
      return NextResponse.json({
        success: false,
        message: 'Backup is disabled in configuration'
      })
    }

    // ตรวจสอบว่ามีไฟล์ที่เลือกไว้หรือไม่
    if (!config.selectedFiles || config.selectedFiles.length === 0) {
      console.log('⚠️ No files selected for backup')
      return NextResponse.json({
        success: false,
        message: 'No files selected for backup'
      })
    }

    console.log('📁 Selected files:', config.selectedFiles)

    // สร้าง backup
    const result = await createBackup({
      selectedFiles: config.selectedFiles,
      autoDelete: config.autoDelete
    })

    if (result.success) {
      console.log('✅ Auto backup completed successfully')
      console.log('📦 Backup name:', result.backupName)
      console.log('📊 Files backed up:', result.files?.length || 0)
    } else {
      console.error('❌ Auto backup failed:', result.message)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Auto backup error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Auto backup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/backup/auto - ตรวจสอบสถานะ auto backup
 */
export async function GET() {
  try {
    const config = await loadBackupConfig()
    
    return NextResponse.json({
      success: true,
      enabled: config.enabled,
      schedule: config.schedule,
      backupTime: config.backupTime,
      customDays: config.customDays,
      lastBackup: config.lastBackup,
      selectedFiles: config.selectedFiles,
      autoDelete: config.autoDelete,
      nextBackup: getNextBackupTime(config)
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to get auto backup status' },
      { status: 500 }
    )
  }
}

/**
 * คำนวณเวลา backup ถัดไป
 */
function getNextBackupTime(config: any): string | null {
  if (!config.enabled) return null

  const now = new Date()
  const [hours, minutes] = config.backupTime.split(':').map(Number)
  const nextBackup = new Date()
  nextBackup.setHours(hours, minutes, 0, 0)

  // ถ้าเวลาที่กำหนดผ่านไปแล้ววันนี้ ให้เลื่อนไปวันถัดไป
  if (nextBackup <= now) {
    nextBackup.setDate(nextBackup.getDate() + 1)
  }

  // ปรับตาม schedule
  switch (config.schedule) {
    case 'daily':
      // ไม่ต้องปรับ เพราะทุกวัน
      break
    case 'weekly':
      // ถ้ายังไม่ถึงวันถัดไป ให้เลื่อนไป 7 วัน
      const daysSinceLastBackup = config.lastBackup
        ? Math.floor((now.getTime() - new Date(config.lastBackup).getTime()) / (1000 * 60 * 60 * 24))
        : 7
      if (daysSinceLastBackup < 7) {
        nextBackup.setDate(nextBackup.getDate() + (7 - daysSinceLastBackup))
      }
      break
    case 'monthly':
      // ตั้งไปวันที่ 1 ของเดือนถัดไป
      nextBackup.setMonth(nextBackup.getMonth() + 1, 1)
      break
    case 'custom':
      if (config.customDays) {
        const daysSinceLastBackup = config.lastBackup
          ? Math.floor((now.getTime() - new Date(config.lastBackup).getTime()) / (1000 * 60 * 60 * 24))
          : config.customDays
        if (daysSinceLastBackup < config.customDays) {
          nextBackup.setDate(nextBackup.getDate() + (config.customDays - daysSinceLastBackup))
        }
      }
      break
  }

  return nextBackup.toISOString()
}
