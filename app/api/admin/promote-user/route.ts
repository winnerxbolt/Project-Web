import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { findUserByEmail, updateUserRole } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const admin = await requireAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึง (Unauthorized)' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'กรุณาระบุอีเมล (Email is required)' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้ (User not found)' },
        { status: 404 }
      );
    }

    // Check if user is already admin
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'ผู้ใช้นี้เป็น Admin อยู่แล้ว (User is already an admin)' },
        { status: 400 }
      );
    }

    // Update user role to admin
    const updated = await updateUserRole(user.id, 'admin');

    if (!updated) {
      return NextResponse.json(
        { error: 'ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้ (Failed to update user role)' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'อัปเดตสิทธิ์สำเร็จ (User promoted to admin successfully)',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });

  } catch (error) {
    console.error('Error promoting user:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด (Internal server error)' },
      { status: 500 }
    );
  }
}
