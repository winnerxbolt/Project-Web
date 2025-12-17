import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * บันทึกความพยายาม login ที่ผิดพลาด
 * @param identifier - IP address หรือ identifier ของ client
 */
export async function recordFailedLoginAttempt(identifier: string): Promise<void> {
  try {
    const now = new Date()
    const blockedUntil = new Date(now.getTime() + 30 * 1000) // 30 วินาที

    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    const { data: existing, error: fetchError } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching failed login attempt:', fetchError)
      return
    }

    if (existing) {
      // อัพเดทข้อมูลเดิม
      const { error: updateError } = await supabase
        .from('failed_login_attempts')
        .update({
          attempt_count: (existing.attempt_count || 0) + 1,
          last_attempt_at: now.toISOString(),
          blocked_until: blockedUntil.toISOString()
        })
        .eq('identifier', identifier)

      if (updateError) {
        console.error('Error updating failed login attempt:', updateError)
      }
    } else {
      // สร้างข้อมูลใหม่
      const { error: insertError } = await supabase
        .from('failed_login_attempts')
        .insert({
          identifier,
          attempt_count: 1,
          last_attempt_at: now.toISOString(),
          blocked_until: blockedUntil.toISOString()
        })

      if (insertError) {
        console.error('Error inserting failed login attempt:', insertError)
      }
    }
  } catch (error) {
    console.error('Error in recordFailedLoginAttempt:', error)
  }
}

/**
 * ตรวจสอบว่าต้องรอก่อน login หรือไม่
 * @param identifier - IP address หรือ identifier ของ client
 * @returns { allowed: boolean, remainingSeconds: number }
 */
export async function checkFailedLoginDelay(identifier: string): Promise<{
  allowed: boolean
  remainingSeconds: number
}> {
  try {
    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single()

    if (error || !data) {
      return { allowed: true, remainingSeconds: 0 }
    }

    if (!data.blocked_until) {
      return { allowed: true, remainingSeconds: 0 }
    }

    const now = new Date()
    const blockedUntil = new Date(data.blocked_until)

    if (now < blockedUntil) {
      const remainingMs = blockedUntil.getTime() - now.getTime()
      const remainingSeconds = Math.ceil(remainingMs / 1000)
      return { allowed: false, remainingSeconds }
    }

    return { allowed: true, remainingSeconds: 0 }
  } catch (error) {
    console.error('Error in checkFailedLoginDelay:', error)
    return { allowed: true, remainingSeconds: 0 }
  }
}

/**
 * ล้างข้อมูล failed login เมื่อ login สำเร็จ
 * @param identifier - IP address หรือ identifier ของ client
 */
export async function clearFailedLoginAttempt(identifier: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('identifier', identifier)

    if (error) {
      console.error('Error clearing failed login attempt:', error)
    }
  } catch (error) {
    console.error('Error in clearFailedLoginAttempt:', error)
  }
}

/**
 * ทำความสะอาดข้อมูลเก่า (เรียกใช้เป็นระยะ)
 */
export async function cleanupOldFailedLoginAttempts(): Promise<void> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('failed_login_attempts')
      .delete()
      .lt('last_attempt_at', twentyFourHoursAgo.toISOString())

    if (error) {
      console.error('Error cleaning up old failed login attempts:', error)
    } else {
      console.log('Successfully cleaned up old failed login attempts')
    }
  } catch (error) {
    console.error('Error in cleanupOldFailedLoginAttempts:', error)
  }
}

/**
 * ดึงจำนวนครั้งที่พยายาม login ผิด
 * @param identifier - IP address หรือ identifier ของ client
 */
export async function getFailedLoginCount(identifier: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('attempt_count')
      .eq('identifier', identifier)
      .single()

    if (error || !data) {
      return 0
    }

    return data.attempt_count || 0
  } catch (error) {
    console.error('Error in getFailedLoginCount:', error)
    return 0
  }
}
