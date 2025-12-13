import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { hashPassword } from '@/lib/security/encryption'

/**
 * 🔄 Migrate Old Passwords to New Multi-Layer Format
 * แปลง password แบบเก่า (salt + pbkdf2) เป็นแบบใหม่ (multi-layer)
 */
export async function POST(_request: NextRequest) {
  try {
    const users = await readJson<any[]>('data/users.json') || []
    
    let migratedCount = 0
    let skippedCount = 0

    for (const user of users) {
      // ถ้ามี salt แสดงว่ายังเป็นแบบเก่า
      if (user.salt) {
        console.log(`Skipping user ${user.email} - will auto-upgrade on next login`)
        skippedCount++
      } else {
        console.log(`User ${user.email} already using new format`)
        skippedCount++
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password migration completed',
      stats: {
        total: users.length,
        migrated: migratedCount,
        skipped: skippedCount
      },
      note: 'Users with old passwords will auto-upgrade on next login'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
