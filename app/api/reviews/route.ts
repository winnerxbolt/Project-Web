import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');
const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json');

// Review interface
export interface Review {
  id: string;
  bookingId: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  ratings: {
    overall: number;
    cleanliness: number;
    staff: number;
    amenities: number;
    location: number;
  };
  comment: string;
  images?: string[]; // Array of image URLs
  createdAt: string;
  helpful: number; // Number of helpful votes
  adminReply?: {
    message: string;
    repliedAt: string;
    repliedBy: string;
  };
  reports?: {
    userId: string;
    reason: string;
    reportedAt: string;
  }[];
  isHidden: boolean; // Admin can hide inappropriate reviews
  isVerifiedBooking: boolean; // Verified if user actually stayed
}

// Read reviews from file
async function readReviews(): Promise<Review[]> {
  try {
    const data = await fs.readFile(reviewsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write reviews to file
async function writeReviews(reviews: Review[]): Promise<void> {
  await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2));
}

// Read bookings from file
async function readBookings(): Promise<any[]> {
  try {
    const data = await fs.readFile(bookingsFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.bookings || [];
  } catch (error) {
    return [];
  }
}

// Verify if user has completed booking
async function verifyBooking(bookingId: string, userId: string): Promise<boolean> {
  const bookings = await readBookings();
  const booking = bookings.find(
    (b: any) => b.id.toString() === bookingId && b.status === 'completed'
  );
  return !!booking;
}

// Calculate average rating from ratings object
function calculateAverageRating(ratings: Review['ratings']): number {
  const { overall, cleanliness, staff, amenities, location } = ratings;
  return (overall + cleanliness + staff + amenities + location) / 5;
}

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const bookingId = searchParams.get('bookingId');
    const userId = searchParams.get('userId');
    const includeHidden = searchParams.get('includeHidden') === 'true';

    let reviews = await readReviews();

    // Filter by room
    if (roomId) {
      reviews = reviews.filter(r => r.roomId === roomId);
    }

    // Filter by booking
    if (bookingId) {
      reviews = reviews.filter(r => r.bookingId === bookingId);
    }

    // Filter by user
    if (userId) {
      reviews = reviews.filter(r => r.userId === userId);
    }

    // Hide inappropriate reviews (unless admin requesting)
    if (!includeHidden) {
      reviews = reviews.filter(r => !r.isHidden);
    }

    // Sort by most recent
    reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(reviews);
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
    const isVerified = await verifyBooking(bookingId, userId);
    if (!isVerified) {
      return NextResponse.json(
        { error: 'คุณสามารถรีวิวได้เฉพาะการจองที่เสร็จสิ้นแล้วเท่านั้น' },
        { status: 403 }
      );
    }

    const reviews = await readReviews();

    // Check if user already reviewed this booking
    const existingReview = reviews.find(
      r => r.bookingId === bookingId && r.userId === userId
    );
    if (existingReview) {
      return NextResponse.json(
        { error: 'คุณรีวิวการจองนี้ไปแล้ว' },
        { status: 400 }
      );
    }

    // Create new review
    const newReview: Review = {
      id: Date.now().toString(),
      bookingId,
      roomId,
      roomName,
      userId,
      userName,
      userEmail,
      ratings: {
        overall: ratings.overall || 5,
        cleanliness: ratings.cleanliness || 5,
        staff: ratings.staff || 5,
        amenities: ratings.amenities || 5,
        location: ratings.location || 5,
      },
      comment,
      images: images || [],
      createdAt: new Date().toISOString(),
      helpful: 0,
      reports: [],
      isHidden: false,
      isVerifiedBooking: true,
    };

    reviews.push(newReview);
    await writeReviews(reviews);

    return NextResponse.json(newReview, { status: 201 });
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

    const reviews = await readReviews();
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'adminReply':
        const { message, repliedBy } = body;
        if (!message || !repliedBy) {
          return NextResponse.json(
            { error: 'Reply message and admin name required' },
            { status: 400 }
          );
        }
        reviews[reviewIndex].adminReply = {
          message,
          repliedAt: new Date().toISOString(),
          repliedBy,
        };
        break;

      case 'incrementHelpful':
        reviews[reviewIndex].helpful += 1;
        break;

      case 'hide':
        reviews[reviewIndex].isHidden = true;
        break;

      case 'unhide':
        reviews[reviewIndex].isHidden = false;
        break;

      case 'report':
        const { userId, reason } = body;
        if (!userId || !reason) {
          return NextResponse.json(
            { error: 'User ID and reason required' },
            { status: 400 }
          );
        }
        if (!reviews[reviewIndex].reports) {
          reviews[reviewIndex].reports = [];
        }
        reviews[reviewIndex].reports!.push({
          userId,
          reason,
          reportedAt: new Date().toISOString(),
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await writeReviews(reviews);

    return NextResponse.json(reviews[reviewIndex]);
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

    const reviews = await readReviews();
    const filteredReviews = reviews.filter(r => r.id !== reviewId);

    if (filteredReviews.length === reviews.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await writeReviews(filteredReviews);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
