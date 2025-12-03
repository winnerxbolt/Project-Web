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

    // Check if user is already a regular user
    if (user.role === 'user') {
      return NextResponse.json(
        { error: 'ผู้ใช้นี้เป็น User ธรรมดาอยู่แล้ว (User is already a regular user)' },
        { status: 400 }
      );
    }

    // Prevent demoting yourself
    if (user.id === admin.id) {
      return NextResponse.json(
        { error: 'ไม่สามารถถอดสิทธิ์ตัวเองได้ (Cannot demote yourself)' },
        { status: 400 }
      );
    }

    // Update user role to regular user
    const updated = await updateUserRole(user.id, 'user');

    if (!updated) {
      return NextResponse.json(
        { error: 'ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้ (Failed to update user role)' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'ถอดสิทธิ์ Admin สำเร็จ (User demoted to regular user successfully)',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });

  } catch (error) {
    console.error('Error demoting user:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด (Internal server error)' },
      { status: 500 }
    );
  }
}
