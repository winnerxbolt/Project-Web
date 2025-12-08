import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const couponsFilePath = path.join(process.cwd(), 'data', 'coupons.json');

// Coupon interface
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'earlyBird' | 'newCustomer' | 'returning';
  discountValue: number; // percentage (1-100) or fixed amount
  minBookingAmount?: number;
  maxDiscountAmount?: number; // for percentage coupons
  startDate: string;
  endDate: string;
  advanceBookingDays?: number; // for early bird (e.g., 30 days advance)
  usageLimit?: number; // total usage limit
  usageCount: number; // current usage count
  usagePerUser?: number; // usage limit per user
  applicableRooms?: string[]; // empty = all rooms
  customerType?: 'new' | 'returning' | 'all'; // for customer-specific coupons
  isActive: boolean;
  createdAt: string;
  description: string;
}

// Read coupons from file
async function readCoupons(): Promise<Coupon[]> {
  try {
    const data = await fs.readFile(couponsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write coupons to file
async function writeCoupons(coupons: Coupon[]): Promise<void> {
  await fs.writeFile(couponsFilePath, JSON.stringify(coupons, null, 2));
}

// Validate coupon
async function validateCoupon(
  code: string,
  userId: string,
  bookingAmount: number,
  roomId?: string,
  checkInDate?: string
): Promise<{ valid: boolean; message: string; discount?: number; coupon?: Coupon }> {
  const coupons = await readCoupons();
  const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.isActive);

  if (!coupon) {
    return { valid: false, message: 'รหัสคูปองไม่ถูกต้องหรือหมดอายุ' };
  }

  // Check date validity
  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  if (now < startDate || now > endDate) {
    return { valid: false, message: 'คูปองนี้หมดอายุแล้วหรือยังไม่เปิดใช้งาน' };
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, message: 'คูปองนี้ถูกใช้งานครบจำนวนแล้ว' };
  }

  // Check minimum booking amount
  if (coupon.minBookingAmount && bookingAmount < coupon.minBookingAmount) {
    return { 
      valid: false, 
      message: `ยอดจองขั้นต่ำสำหรับคูปองนี้คือ ฿${coupon.minBookingAmount.toLocaleString()}` 
    };
  }

  // Check room applicability
  if (coupon.applicableRooms && coupon.applicableRooms.length > 0 && roomId) {
    if (!coupon.applicableRooms.includes(roomId)) {
      return { valid: false, message: 'คูปองนี้ไม่สามารถใช้กับห้องที่เลือกได้' };
    }
  }

  // Check early bird requirement
  if (coupon.type === 'earlyBird' && coupon.advanceBookingDays && checkInDate) {
    const checkIn = new Date(checkInDate);
    const daysInAdvance = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysInAdvance < coupon.advanceBookingDays) {
      return { 
        valid: false, 
        message: `คูปองนี้ต้องจองล่วงหน้าอย่างน้อย ${coupon.advanceBookingDays} วัน` 
      };
    }
  }

  // Check customer type (would need user's booking history)
  // This is a simplified check - in production, you'd query the bookings API
  if (coupon.customerType && coupon.customerType !== 'all') {
    // TODO: Implement customer type validation by checking user's booking history
  }

  // Check per-user usage limit
  if (coupon.usagePerUser) {
    // TODO: Implement per-user usage tracking
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (bookingAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return { 
    valid: true, 
    message: 'คูปองใช้ได้', 
    discount: Math.round(discount),
    coupon 
  };
}

// GET - Fetch coupons or validate
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'validate') {
      const code = searchParams.get('code');
      const userId = searchParams.get('userId');
      const bookingAmount = parseFloat(searchParams.get('bookingAmount') || '0');
      const roomId = searchParams.get('roomId') || undefined;
      const checkInDate = searchParams.get('checkInDate') || undefined;

      if (!code || !userId) {
        return NextResponse.json(
          { error: 'Missing required parameters' },
          { status: 400 }
        );
      }

      const validation = await validateCoupon(code, userId, bookingAmount, roomId, checkInDate);
      return NextResponse.json(validation);
    }

    // Get all coupons or active coupons
    const activeOnly = searchParams.get('activeOnly') === 'true';
    let coupons = await readCoupons();

    if (activeOnly) {
      const now = new Date();
      coupons = coupons.filter(c => {
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        return c.isActive && now >= startDate && now <= endDate;
      });
    }

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const coupons = await readCoupons();

    // Check if code already exists
    if (coupons.some(c => c.code.toLowerCase() === body.code.toLowerCase())) {
      return NextResponse.json(
        { error: 'รหัสคูปองนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: body.code.toUpperCase(),
      type: body.type,
      discountValue: body.discountValue,
      minBookingAmount: body.minBookingAmount,
      maxDiscountAmount: body.maxDiscountAmount,
      startDate: body.startDate,
      endDate: body.endDate,
      advanceBookingDays: body.advanceBookingDays,
      usageLimit: body.usageLimit,
      usageCount: 0,
      usagePerUser: body.usagePerUser,
      applicableRooms: body.applicableRooms || [],
      customerType: body.customerType || 'all',
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      description: body.description || '',
    };

    coupons.push(newCoupon);
    await writeCoupons(coupons);

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const coupons = await readCoupons();
    const index = coupons.findIndex(c => c.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Update coupon
    coupons[index] = {
      ...coupons[index],
      ...body,
      id: coupons[index].id, // Keep original ID
      createdAt: coupons[index].createdAt, // Keep original creation date
      usageCount: coupons[index].usageCount, // Don't allow manual usage count changes
    };

    await writeCoupons(coupons);

    return NextResponse.json(coupons[index]);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupons = await readCoupons();
    const filteredCoupons = coupons.filter(c => c.id !== id);

    if (filteredCoupons.length === coupons.length) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await writeCoupons(filteredCoupons);

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

// PATCH - Increment usage count
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupons = await readCoupons();
    const coupon = coupons.find(c => c.id === couponId);

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    coupon.usageCount += 1;
    await writeCoupons(coupons);

    return NextResponse.json({ message: 'Usage count updated', coupon });
  } catch (error) {
    console.error('Error updating usage count:', error);
    return NextResponse.json(
      { error: 'Failed to update usage count' },
      { status: 500 }
    );
  }
}
