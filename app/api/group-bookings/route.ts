import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Get all group bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase.from('group_bookings').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data: bookings, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch group bookings' }, { status: 500 });
    }
    
    return NextResponse.json(bookings || []);
  } catch (error) {
    console.error('Error fetching group bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch group bookings' }, { status: 500 })
  }
}

// POST - Create new group booking
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const bookingData = {
      user_id: body.userId || null,
      group_name: body.groupName || body.group_name,
      total_rooms: body.totalRooms || body.total_rooms,
      total_guests: body.totalGuests || body.total_guests,
      check_in: body.checkIn || body.check_in,
      check_out: body.checkOut || body.check_out,
      total_price: body.totalPrice || body.total_price,
      discount_percentage: body.discountPercentage || body.discount_percentage || 0,
      status: body.status || 'pending',
      payment_status: body.paymentStatus || body.payment_status || 'pending',
      contact_name: body.contactName || body.contact_name,
      contact_email: body.contactEmail || body.contact_email,
      contact_phone: body.contactPhone || body.contact_phone,
      special_requests: body.specialRequests || body.special_requests || null,
      room_ids: body.roomIds || body.room_ids || []
    };

    const { data: newBooking, error } = await supabaseAdmin
      .from('group_bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create group booking' }, { status: 500 });
    }
    
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating group booking:', error)
    return NextResponse.json({ error: 'Failed to create group booking' }, { status: 500 })
  }
}

// PUT - Update group booking
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const bookingUpdates: any = {};
    if (updates.status !== undefined) bookingUpdates.status = updates.status;
    if (updates.paymentStatus !== undefined || updates.payment_status !== undefined) {
      bookingUpdates.payment_status = updates.payment_status || updates.paymentStatus;
    }
    if (updates.totalPrice !== undefined || updates.total_price !== undefined) {
      bookingUpdates.total_price = updates.total_price || updates.totalPrice;
    }
    if (updates.discountPercentage !== undefined || updates.discount_percentage !== undefined) {
      bookingUpdates.discount_percentage = updates.discount_percentage || updates.discountPercentage;
    }
    if (updates.specialRequests !== undefined || updates.special_requests !== undefined) {
      bookingUpdates.special_requests = updates.special_requests || updates.specialRequests;
    }

    bookingUpdates.updated_at = new Date().toISOString();

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('group_bookings')
      .update(bookingUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update group booking' }, { status: 500 });
    }
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating group booking:', error)
    return NextResponse.json({ error: 'Failed to update group booking' }, { status: 500 })
  }
}

// DELETE - Remove group booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('group_bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete group booking' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Group booking deleted' });
  } catch (error) {
    console.error('Error deleting group booking:', error)
    return NextResponse.json({ error: 'Failed to delete group booking' }, { status: 500 })
  }
}
