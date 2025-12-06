import fs from 'fs/promises'
import path from 'path'

const VERCEL_JSON_PATH = path.join(process.cwd(), 'vercel.json')

interface VercelConfig {
  crons: Array<{
    path: string
    schedule: string
  }>
}

/**
 * แปลง config เป็น cron expression
 * @param schedule - daily, weekly, monthly, custom
 * @param backupTime - เวลา HH:MM (24hr format)
 * @param customDays - จำนวนวันสำหรับ custom (ถ้ามี)
 */
export function generateCronExpression(
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom',
  backupTime: string,
  customDays?: number
): string {
  const [hour, minute] = backupTime.split(':').map(Number)

  switch (schedule) {
    case 'daily':
      // ทุกวัน เวลาที่กำหนด
      return `${minute} ${hour} * * *`
    
    case 'weekly':
      // ทุกสัปดาห์ วันอาทิตย์ เวลาที่กำหนด
      return `${minute} ${hour} * * 0`
    
    case 'monthly':
      // ทุกเดือน วันที่ 1 เวลาที่กำหนด
      return `${minute} ${hour} 1 * *`
    
    case 'custom':
      // สำหรับ custom ใช้ daily แทน (Vercel ไม่รองรับทุก X วัน)
      // ต้องให้ API เช็คเองว่าถึงเวลาหรือยัง
      return `${minute} ${hour} * * *`
    
    default:
      return `${minute} ${hour} * * 0` // default: ทุกสัปดาห์
  }
}

/**
 * อัพเดต vercel.json ด้วย cron expression ใหม่
 */
export async function updateVercelCron(
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom',
  backupTime: string,
  customDays?: number
): Promise<{ success: boolean; message: string; cronExpression?: string }> {
  try {
    // สร้าง cron expression
    const cronExpression = generateCronExpression(schedule, backupTime, customDays)

    // อ่าน vercel.json ปัจจุบัน
    let vercelConfig: VercelConfig
    try {
      const data = await fs.readFile(VERCEL_JSON_PATH, 'utf-8')
      vercelConfig = JSON.parse(data)
    } catch {
      // ถ้าไม่มีไฟล์ ให้สร้างใหม่
      vercelConfig = { crons: [] }
    }

    // อัพเดตหรือเพิ่ม cron job สำหรับ backup
    const backupCronIndex = vercelConfig.crons.findIndex(
      (cron) => cron.path === '/api/cron/backup'
    )

    if (backupCronIndex >= 0) {
      // อัพเดต schedule ที่มีอยู่
      vercelConfig.crons[backupCronIndex].schedule = cronExpression
    } else {
      // เพิ่ม cron job ใหม่
      vercelConfig.crons.push({
        path: '/api/cron/backup',
        schedule: cronExpression
      })
    }

    // เขียนกลับไปที่ vercel.json
    await fs.writeFile(
      VERCEL_JSON_PATH,
      JSON.stringify(vercelConfig, null, 2),
      'utf-8'
    )

    return {
      success: true,
      message: '✅ อัพเดต Cron Schedule สำเร็จ',
      cronExpression
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดต vercel.json:', error)
    return {
      success: false,
      message: `❌ ไม่สามารถอัพเดต Cron Schedule ได้: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * แปลง cron expression เป็นข้อความอ่านง่าย
 */
export function cronToReadable(cronExpression: string): string {
  const parts = cronExpression.split(' ')
  if (parts.length !== 5) return cronExpression

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')} น.`

  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `ทุกวัน เวลา ${time}`
  }

  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '0') {
    return `ทุกวันอาทิตย์ เวลา ${time}`
  }

  if (dayOfMonth === '1' && month === '*') {
    return `ทุกวันที่ 1 ของเดือน เวลา ${time}`
  }

  return `${cronExpression} (เวลา ${time})`
}
