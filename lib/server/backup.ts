import fs from 'fs/promises'
import path from 'path'
import { updateVercelCron, cronToReadable } from './updateCron'

const DATA_DIR = path.join(process.cwd(), 'data')
const BACKUP_DIR = path.join(process.cwd(), 'backups')
const CONFIG_FILE = path.join(process.cwd(), 'data', 'backup-config.json')

// ไฟล์ข้อมูลที่สามารถสำรองได้ทั้งหมด
export const AVAILABLE_FILES = [
  'users.json',
  'sessions.json',
  'reviews.json',
  'bookings.json',
  'rooms.json',
  'payments.json',
  'coupons.json',
  'notifications.json',
  'videos.json',
  'wishlist.json',
  'points.json',
  'chat-messages.json',
  'faq.json',
  'auto-replies.json',
  'locations.json',
  'bookingCalendar.json',
  'group-bookings.json',
  'group-discount-settings.json',
  'corporate-clients.json',
  'group-quote-templates.json',
  'dynamic-pricing-settings.json',
  'demand-pricing-rules.json',
  'seasonal-pricing.json',
  'blackout-dates.json',
  'backup-config.json'
]

// Backup history record
export interface BackupRecord {
  name: string
  month: string
  date: string // ISO string
  files: string[]
  size?: number
  exists: boolean // ตรวจสอบว่าไฟล์ยังมีอยู่จริงหรือไม่
}

// Backup configuration type
export interface BackupConfig {
  enabled: boolean
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: number // สำหรับ custom schedule
  backupTime: string // เวลาที่ต้องการ backup (HH:MM format 24hr)
  selectedFiles: string[]
  lastBackup?: string
  autoDelete: boolean
  backupHistory: BackupRecord[] // เก็บประวัติ backup ทั้งหมด
}

// Default configuration
const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  schedule: 'weekly',
  customDays: 7,
  backupTime: '02:00', // ค่าเริ่มต้น 02:00 น.
  selectedFiles: AVAILABLE_FILES,
  autoDelete: true,
  backupHistory: []
}

/**
 * โหลดการตั้งค่า backup
 */
export async function loadBackupConfig(): Promise<BackupConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) }
  } catch {
    return DEFAULT_CONFIG
  }
}

/**
 * บันทึกการตั้งค่า backup และอัพเดต vercel.json
 */
export async function saveBackupConfig(config: BackupConfig): Promise<{ success: boolean; message: string; cronExpression?: string }> {
  try {
    // บันทึกการตั้งค่าลง config file
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
    
    // อัพเดต vercel.json ด้วย cron schedule ใหม่
    const cronResult = await updateVercelCron(
      config.schedule,
      config.backupTime,
      config.customDays
    )
    
    if (!cronResult.success) {
      console.warn('ไม่สามารถอัพเดต vercel.json:', cronResult.message)
    }
    
    const cronReadable = cronResult.cronExpression 
      ? cronToReadable(cronResult.cronExpression)
      : ''
    
    return { 
      success: true, 
      message: `✅ บันทึกการตั้งค่าสำเร็จ\n📅 Cron Schedule: ${cronReadable}`,
      cronExpression: cronResult.cronExpression
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า:', error)
    return { success: false, message: '❌ ไม่สามารถบันทึกการตั้งค่าได้' }
  }
}

/**
 * สร้างโฟลเดอร์ backup แยกตามเดือน
 */
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR)
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  }
}

/**
 * สร้างโฟลเดอร์สำหรับเดือนปัจจุบัน
 */
async function ensureMonthlyBackupDir(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const monthDir = path.join(BACKUP_DIR, `${year}-${month}`)
  
  try {
    await fs.access(monthDir)
  } catch {
    await fs.mkdir(monthDir, { recursive: true })
  }
  
  return monthDir
}

/**
 * สร้าง backup ข้อมูล (จัดเก็บแยกตามเดือน ไม่ลบของเก่า)
 */
export async function createBackup(options?: { selectedFiles?: string[], autoDelete?: boolean }): Promise<{ success: boolean; message: string; backupPath?: string; backupName?: string; files?: string[] }> {
  try {
    await ensureBackupDir()

    // โหลด config ถ้าไม่ระบุ selectedFiles
    const config = await loadBackupConfig()
    const filesToBackup = options?.selectedFiles || config.selectedFiles
    const autoDelete = options?.autoDelete ?? false

    // สร้างโฟลเดอร์สำหรับเดือนปัจจุบัน
    const monthDir = await ensureMonthlyBackupDir()
    
    // สร้างชื่อไฟล์ backup ตามวันที่และเวลา
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-')
    const day = String(now.getDate()).padStart(2, '0')
    const time = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
    
    // จัดเก็บในโฟลเดอร์เดือน เช่น backups/2025-12/backup-06_14-30.../
    const backupPath = path.join(monthDir, `backup-day${day}_${time}`)

    // สร้างโฟลเดอร์ backup ใหม่
    await fs.mkdir(backupPath, { recursive: true })

    // คัดลอกไฟล์ที่เลือก
    let backedUpFiles = 0
    const backedUpFileNames: string[] = []
    
    for (const file of filesToBackup) {
      const sourcePath = path.join(DATA_DIR, file)
      const destPath = path.join(backupPath, file)

      try {
        // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
        await fs.access(sourcePath)
        // คัดลอกไฟล์
        await fs.copyFile(sourcePath, destPath)
        backedUpFiles++
        backedUpFileNames.push(file)
      } catch (err) {
        console.warn(`ไม่สามารถสำรองไฟล์ ${file}:`, err)
      }
    }

    // สร้างไฟล์ metadata
    const metadata = {
      backupDate: new Date().toISOString(),
      filesBackedUp: backedUpFiles,
      totalFiles: filesToBackup.length,
      files: backedUpFileNames,
      autoDelete: options?.autoDelete ?? false
    }
    await fs.writeFile(
      path.join(backupPath, 'backup-info.json'),
      JSON.stringify(metadata, null, 2)
    )

    // บันทึกประวัติ backup ลง config
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const backupName = `backup-day${day}_${time}`
    const monthStr = `${year}-${month}`
    
    const backupRecord: BackupRecord = {
      name: backupName,
      month: monthStr,
      date: now.toISOString(),
      files: backedUpFileNames,
      exists: true
    }
    
    // เพิ่มประวัติใหม่ลงใน config
    if (!config.backupHistory) {
      config.backupHistory = []
    }
    config.backupHistory.unshift(backupRecord) // เพิ่มที่หัวลิสต์ (ใหม่สุด)
    
    // อัปเดต lastBackup ใน config
    config.lastBackup = now.toISOString()
    await saveBackupConfig(config)

    return {
      success: true,
      message: `✅ Backup สำเร็จ! สำรอง ${backedUpFiles} ไฟล์`,
      backupPath,
      backupName,
      files: backedUpFileNames
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสำรองข้อมูล:', error)
    return {
      success: false,
      message: `❌ เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * ลบ backup เก่าทั้งหมด
 */
/**
 * ลบ backup ทั้งหมด (ทั้งไฟล์และประวัติใน config)
 */
export async function deleteOldBackups(): Promise<void> {
  try {
    await ensureBackupDir()
    
    // อ่านโฟลเดอร์เดือนทั้งหมด
    const monthDirs = await fs.readdir(BACKUP_DIR)
    
    for (const monthDir of monthDirs) {
      // ข้ามไฟล์ที่ไม่ใช่โฟลเดอร์เดือน
      if (!monthDir.match(/^\d{4}-\d{2}$/)) continue
      
      const monthPath = path.join(BACKUP_DIR, monthDir)
      
      try {
        const stats = await fs.stat(monthPath)
        if (stats.isDirectory()) {
          // ลบโฟลเดอร์เดือนทั้งหมด
          await fs.rm(monthPath, { recursive: true, force: true })
          console.log(`🗑️ ลบ backup เดือน: ${monthDir}`)
        }
      } catch (err) {
        console.error(`ไม่สามารถลบโฟลเดอร์ ${monthDir}:`, err)
      }
    }
    
    // ล้างประวัติ backup ใน config
    const config = await loadBackupConfig()
    config.backupHistory = []
    await saveBackupConfig(config)
    
    console.log('✅ ลบ backup ทั้งหมดและล้างประวัติเรียบร้อย')
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบ backup:', error)
    throw error
  }
}

/**
 * ลบ backup เฉพาะรายการ (ลบเฉพาะวัน)
 */
export async function deleteBackup(backupName: string, month: string): Promise<{ success: boolean; message: string }> {
  try {
    const backupPath = path.join(BACKUP_DIR, month, backupName)
    
    // ตรวจสอบว่า backup มีอยู่จริง
    try {
      await fs.access(backupPath)
    } catch {
      return {
        success: false,
        message: '❌ ไม่พบ backup ที่ระบุ'
      }
    }
    
    // ลบ backup folder
    await fs.rm(backupPath, { recursive: true, force: true })
    console.log(`🗑️ ลบ backup: ${month}/${backupName}`)
    
    // อัพเดตประวัติใน config (ลบรายการนี้ออก)
    const config = await loadBackupConfig()
    config.backupHistory = config.backupHistory.filter(
      (record) => !(record.name === backupName && record.month === month)
    )
    await saveBackupConfig(config)
    
    return {
      success: true,
      message: '✅ ลบ backup สำเร็จ'
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบ backup:', error)
    return {
      success: false,
      message: `❌ ไม่สามารถลบ backup ได้: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * ลบ backup ทั้งเดือน
 */
export async function deleteBackupMonth(month: string): Promise<{ success: boolean; message: string }> {
  try {
    const monthPath = path.join(BACKUP_DIR, month)
    
    // ตรวจสอบว่าโฟลเดอร์เดือนมีอยู่จริง
    try {
      await fs.access(monthPath)
    } catch {
      return {
        success: false,
        message: '❌ ไม่พบโฟลเดอร์เดือนที่ระบุ'
      }
    }
    
    // ลบโฟลเดอร์เดือนทั้งหมด
    await fs.rm(monthPath, { recursive: true, force: true })
    console.log(`🗑️ ลบ backup เดือน: ${month}`)
    
    // อัพเดตประวัติใน config (ลบรายการเดือนนี้ทั้งหมด)
    const config = await loadBackupConfig()
    config.backupHistory = config.backupHistory.filter(
      (record) => record.month !== month
    )
    await saveBackupConfig(config)
    
    return {
      success: true,
      message: `✅ ลบ backup เดือน ${month} สำเร็จ`
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบ backup เดือน:', error)
    return {
      success: false,
      message: `❌ ไม่สามารถลบ backup เดือนได้: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * แสดงรายการ backup ทั้งหมด (อ่านจาก config แล้วตรวจสอบว่าไฟล์ยังมีอยู่)
 */
export async function listBackups(): Promise<Array<{
  name: string
  month: string
  date: Date
  path: string
  size?: number
  exists: boolean
}>> {
  try {
    await ensureBackupDir()
    
    // โหลดประวัติ backup จาก config
    const config = await loadBackupConfig()
    
    if (!config.backupHistory || config.backupHistory.length === 0) {
      console.log('No backup history in config')
      return []
    }

    // แปลง backup records เป็น format ที่ต้องการ และตรวจสอบว่าไฟล์ยังมีอยู่
    const backups = await Promise.all(
      config.backupHistory.map(async (record) => {
        const backupPath = path.join(BACKUP_DIR, record.month, record.name)
        
        // ตรวจสอบว่า backup folder ยังมีอยู่จริงหรือไม่
        let exists = false
        let size: number | undefined
        try {
          const stats = await fs.stat(backupPath)
          if (stats.isDirectory()) {
            // ตรวจสอบว่ามีไฟล์ข้อมูลอยู่ใน backup หรือไม่
            try {
              const files = await fs.readdir(backupPath)
              exists = files.length > 0 // มีไฟล์อยู่ใน folder
            } catch (readErr) {
              console.log(`Cannot read directory ${backupPath}:`, readErr)
              exists = false
            }
          }
        } catch (error) {
          // ไฟล์ไม่พบ - ไม่ต้อง log error
          exists = false
        }
        
        return {
          name: record.name,
          month: record.month,
          date: new Date(record.date),
          path: backupPath,
          size,
          exists
        }
      })
    )

    // เรียงตามวันที่ใหม่สุด
    return backups.sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแสดงรายการ backup:', error)
    return []
  }
}

/**
 * กู้คืนข้อมูลจาก backup (รองรับโครงสร้างแยกเดือน)
 * กู้คืนไฟล์ทั้งหมดจาก backup แม้ว่าไฟล์ต้นทางจะถูกลบไปแล้ว
 */
export async function restoreBackup(backupName: string, month?: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔍 Restore request:', { backupName, month })
    
    // สร้าง data directory ถ้ายังไม่มี
    try {
      await fs.access(DATA_DIR)
    } catch {
      console.log('📁 Creating data directory...')
      await fs.mkdir(DATA_DIR, { recursive: true })
    }
    
    // ถ้าระบุเดือนมา ใช้โครงสร้างใหม่ ไม่งั้นใช้โครงสร้างเก่า
    let backupPath: string
    if (month) {
      backupPath = path.join(BACKUP_DIR, month, backupName)
      console.log('📁 Using month path:', backupPath)
    } else {
      // ค้นหา backup ในทุกโฟลเดอร์เดือน
      console.log('🔎 Searching for backup in all months...')
      const backups = await listBackups()
      const backup = backups.find(b => b.name === backupName)
      if (!backup) {
        console.log('❌ Backup not found in list')
        return {
          success: false,
          message: '❌ ไม่พบ backup ที่ระบุ'
        }
      }
      backupPath = backup.path
      console.log('📁 Found backup path:', backupPath)
    }

    // ตรวจสอบว่า backup มีอยู่จริง
    try {
      await fs.access(backupPath)
      console.log('✅ Backup path exists')
    } catch (error) {
      console.log('❌ Backup path does not exist:', backupPath)
      return {
        success: false,
        message: `❌ ไม่พบ backup ที่ระบุ (${backupPath})`
      }
    }

    // อ่านไฟล์ทั้งหมดจาก backup folder
    console.log('📂 Reading files from backup...')
    const backupFiles = await fs.readdir(backupPath)
    console.log('📄 Found files:', backupFiles)
    
    // กรองเฉพาะไฟล์ข้อมูล (ไม่รวม backup-info.json)
    const dataFiles = backupFiles.filter(file => 
      file.endsWith('.json') && file !== 'backup-info.json'
    )
    
    if (dataFiles.length === 0) {
      console.log('⚠️ No data files found in backup')
      return {
        success: false,
        message: '❌ ไม่พบไฟล์ข้อมูลใน backup นี้'
      }
    }

    // คัดลอกไฟล์ทั้งหมดจาก backup กลับไปที่ data directory
    let restoredFiles = 0
    const restoredFileNames: string[] = []
    
    for (const file of dataFiles) {
      const sourcePath = path.join(backupPath, file)
      const destPath = path.join(DATA_DIR, file)

      try {
        console.log(`📋 Restoring ${file}...`)
        // คัดลอกไฟล์โดยตรง (บังคับเขียนทับไฟล์เดิม)
        await fs.copyFile(sourcePath, destPath)
        restoredFiles++
        restoredFileNames.push(file)
        console.log(`✅ Restored ${file}`)
      } catch (err) {
        console.error(`❌ Failed to restore ${file}:`, err)
      }
    }

    if (restoredFiles === 0) {
      return {
        success: false,
        message: '❌ ไม่สามารถกู้คืนไฟล์ใดๆ ได้'
      }
    }

    console.log(`✅ Restore complete: ${restoredFiles} files`)
    return {
      success: true,
      message: `✅ กู้คืนข้อมูลสำเร็จ! กู้คืน ${restoredFiles} ไฟล์ (${restoredFileNames.join(', ')})`
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการกู้คืนข้อมูล:', error)
    return {
      success: false,
      message: `❌ เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * ตรวจสอบว่าถึงเวลา backup หรือยัง (7 วัน)
 */
export async function shouldBackup(): Promise<boolean> {
  try {
    const backups = await listBackups()
    
    if (backups.length === 0) {
      return true // ไม่มี backup เลย ควร backup
    }

    const lastBackup = backups[0]
    const daysSinceLastBackup = (Date.now() - lastBackup.date.getTime()) / (1000 * 60 * 60 * 24)
    
    return daysSinceLastBackup >= 7
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตรวจสอบเวลา backup:', error)
    return false
  }
}
