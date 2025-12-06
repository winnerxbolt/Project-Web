import { NextResponse } from 'next/server'
import { createBackup, listBackups, restoreBackup, deleteOldBackups, deleteBackup, deleteBackupMonth, loadBackupConfig, saveBackupConfig, AVAILABLE_FILES } from '@/lib/server/backup'

/**
 * GET /api/backup - แสดงรายการ backup ทั้งหมดและ config
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    // ดึงการตั้งค่า
    if (action === 'config') {
      const config = await loadBackupConfig()
      return NextResponse.json({
        success: true,
        config,
        availableFiles: AVAILABLE_FILES
      })
    }

    // แสดงรายการ backup
    const backups = await listBackups()
    
    return NextResponse.json({
      success: true,
      backups: backups.map(b => ({
        name: b.name,
        month: b.month,
        date: b.date,
        size: b.size,
        exists: b.exists // เพิ่มส่งสถานะว่าไฟล์ยังมีอยู่หรือไม่
      }))
    })
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแสดงรายการ backup:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการแสดงรายการ backup' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/backup - สร้าง backup ใหม่ หรือจัดการ config
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { action, backupName, month, config, selectedFiles, autoDelete } = body
    
    console.log('📥 API received:', { action, backupName, month })

    // บันทึกการตั้งค่า
    if (action === 'saveConfig' && config) {
      const result = await saveBackupConfig(config)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // กู้คืนข้อมูลจาก backup
    if (action === 'restore' && backupName) {
      console.log('🔄 Starting restore...')
      const result = await restoreBackup(backupName, month)
      console.log('📤 Restore result:', result)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // ลบ backup ทั้งหมด
    if (action === 'deleteAll') {
      await deleteOldBackups()
      return NextResponse.json({
        success: true,
        message: '✅ ลบ backup ทั้งหมดเรียบร้อยแล้ว'
      })
    }

    // ลบ backup เฉพาะรายการ (ลบเฉพาะวัน)
    if (action === 'deleteOne' && backupName && month) {
      const result = await deleteBackup(backupName, month)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // ลบ backup ทั้งเดือน
    if (action === 'deleteMonth' && month) {
      const result = await deleteBackupMonth(month)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // สร้าง backup ใหม่ (รองรับการเลือกไฟล์)
    const result = await createBackup(selectedFiles, autoDelete !== false)
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการทำงานกับ backup:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการทำงานกับ backup' 
      },
      { status: 500 }
    )
  }
}
