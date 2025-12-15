import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const bookingId = searchParams.get('bookingId');
    const userId = searchParams.get('userId');
    const includeHidden = searchParams.get('includeHidden') === 'true';

    let query = supabase.from('reviews').select('*')

    // Filter by room
    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    // Filter by booking
    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    // Filter by user
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Hide inappropriate reviews (unless admin requesting)
    if (!includeHidden) {
      query = query.eq('is_hidden', false)
    }

    // Sort by most recent
    query = query.order('created_at', { ascending: false })

    const { data: reviews, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Map database columns to frontend format
    const mappedReviews = (reviews || []).map(review => ({
      id: review.id,
      bookingId: review.booking_id,
      roomId: review.room_id,
      roomName: review.room_name,
      userId: review.user_id,
      userName: review.user_name,
      userEmail: review.user_email,
      ratings: {
        overall: review.rating_overall || 0,
        cleanliness: review.rating_cleanliness || 0,
        staff: review.rating_staff || 0,
        amenities: review.rating_amenities || 0,
        location: review.rating_location || 0
      },
      comment: review.comment,
      images: review.images || [],
      createdAt: review.created_at,
      helpful: review.helpful || 0,
      adminReply: review.admin_reply,
      reports: review.reports || [],
      isHidden: review.is_hidden || false,
      isVerifiedBooking: review.is_verified_booking || false
    }));

    return NextResponse.json(mappedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      roomId,
      roomName,
      userId,
      userName,
      userEmail,
      ratings,
      comment,
      images
    } = body;

    // Validate required fields
    if (!bookingId || !roomId || !userId || !ratings || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify booking exists and is completed
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('status', 'completed')
      .single()

    if (!booking) {
      return NextResponse.json(
        { error: 'คุณสามารถรีวิวได้เฉพาะการจองที่เสร็จสิ้นแล้วเท่านั้น' },
        { status: 403 }
      );
    }

    // Check if user already reviewed this booking
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('user_id', userId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'คุณรีวิวการจองนี้ไปแล้ว' },
        { status: 400 }
      );
    }

    // Create new review
    const { data: newReview, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id: bookingId,
        room_id: roomId,
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        user_email: userEmail || null,
        rating_overall: ratings.overall || 5,
        rating_cleanliness: ratings.cleanliness || 5,
        rating_staff: ratings.staff || 5,
        rating_amenities: ratings.amenities || 5,
        rating_location: ratings.location || 5,
        comment,
        images: images || [],
        helpful: 0,
        is_hidden: false,
        is_verified_booking: true
      })
      .select()
      .single()

    if (error || !newReview) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Map to frontend format
    const mappedReview = {
      id: newReview.id,
      bookingId: newReview.booking_id,
      roomId: newReview.room_id,
      roomName: newReview.room_name,
      userId: newReview.user_id,
      userName: newReview.user_name,
      userEmail: newReview.user_email,
      ratings: {
        overall: newReview.rating_overall || 0,
        cleanliness: newReview.rating_cleanliness || 0,
        staff: newReview.rating_staff || 0,
        amenities: newReview.rating_amenities || 0,
        location: newReview.rating_location || 0
      },
      comment: newReview.comment,
      images: newReview.images || [],
      createdAt: newReview.created_at,
      helpful: newReview.helpful || 0,
      adminReply: newReview.admin_reply,
      reports: newReview.reports || [],
      isHidden: newReview.is_hidden || false,
      isVerifiedBooking: newReview.is_verified_booking || false
    };

    return NextResponse.json(mappedReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT - Update review or add admin reply
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Get current review
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (fetchError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    let updates: any = {}

    switch (action) {
      case 'adminReply':
        const { message, repliedBy } = body;
        if (!message || !repliedBy) {
          return NextResponse.json(
            { error: 'Reply message and admin name required' },
            { status: 400 }
          );
        }
        updates.admin_reply = {
          message,
          repliedAt: new Date().toISOString(),
          repliedBy,
        };
        break;

      case 'incrementHelpful':
        updates.helpful = (review.helpful || 0) + 1;
        break;

      case 'hide':
        updates.is_hidden = true;
        break;

      case 'unhide':
        updates.is_hidden = false;
        break;

      case 'report':
        const { userId, reason } = body;
        if (!userId || !reason) {
          return NextResponse.json(
            { error: 'User ID and reason required' },
            { status: 400 }
          );
        }
        const currentReports = review.reports || [];
        currentReports.push({
          userId,
          reason,
          reportedAt: new Date().toISOString(),
        });
        updates.reports = currentReports;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const { data: updatedReview, error: updateError } = await supabaseAdmin
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single()

    if (updateError) {
      console.error('Supabase error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete review (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
