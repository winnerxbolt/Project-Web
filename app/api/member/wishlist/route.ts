import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const wishlistPath = path.join(process.cwd(), 'data', 'wishlist.json');

interface WishlistItem {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  price: number;
  addedAt: string;
}

function readWishlist(): WishlistItem[] {
  try {
    const data = fs.readFileSync(wishlistPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeWishlist(wishlist: WishlistItem[]) {
  fs.writeFileSync(wishlistPath, JSON.stringify(wishlist, null, 2));
}

// GET - Fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const wishlist = readWishlist();
    const userWishlist = wishlist.filter(item => item.userId === userId);

    return NextResponse.json(userWishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roomId, roomName, roomImage, price } = body;

    if (!userId || !roomId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wishlist = readWishlist();

    // Check if already in wishlist
    const exists = wishlist.some(item => item.userId === userId && item.roomId === roomId);
    if (exists) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 400 });
    }

    const newItem: WishlistItem = {
      id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      roomId,
      roomName,
      roomImage,
      price,
      addedAt: new Date().toISOString(),
    };

    wishlist.push(newItem);
    writeWishlist(wishlist);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');

    let wishlist = readWishlist();

    if (itemId) {
      wishlist = wishlist.filter(item => item.id !== itemId);
    } else if (userId && roomId) {
      wishlist = wishlist.filter(item => !(item.userId === userId && item.roomId === roomId));
    } else {
      return NextResponse.json({ error: 'Item ID or userId+roomId required' }, { status: 400 });
    }

    writeWishlist(wishlist);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
