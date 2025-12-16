import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface WishlistItem {
  id?: string;
  user_id: string;
  room_id: number;
  notes?: string;
  created_at?: string;
}

// GET - Fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get wishlist with room details
    const { data: wishlist, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        rooms:room_id (
          id,
          name,
          price,
          image,
          images,
          location,
          available
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }

    return NextResponse.json(wishlist || []);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roomId, notes } = body;

    if (!userId || !roomId) {
      return NextResponse.json({ error: 'User ID and Room ID required' }, { status: 400 });
    }

    const wishlistData = {
      user_id: userId,
      room_id: parseInt(roomId),
      notes: notes || null
    };

    const { data: newItem, error } = await supabaseAdmin
      .from('wishlist')
      .insert(wishlistData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Room already in wishlist' }, { status: 409 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');

    if (!userId || !roomId) {
      return NextResponse.json({ error: 'User ID and Room ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('room_id', parseInt(roomId));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
