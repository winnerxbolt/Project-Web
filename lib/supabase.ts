// lib/supabase.ts - Server-side Supabase Client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error('Missing Supabase keys - need either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Server-side client with anon key (for regular operations)
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey || supabaseServiceKey!, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
)

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          hash: string
          salt?: string
          role: 'user' | 'admin' | 'staff'
          phone?: string
          picture?: string
          social_provider?: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      rooms: {
        Row: {
          id: number
          name: string
          price: number
          description?: string
          guests: number
          beds: number
          bedrooms: number
          bathrooms: number
          size?: number
          image?: string
          images?: string[]
          rating: number
          reviews: number
          amenities?: string[]
          location?: string
          location_id?: number
          available: boolean
          kitchen: boolean
          parking: boolean
          pool: boolean
          wifi: boolean
          air_conditioning: boolean
          pet_friendly: boolean
          smoking_allowed: boolean
          check_in?: string
          check_out?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          user_id?: string
          room_id: number
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string
          special_requests?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          coupon_code?: string
          discount_amount: number
          insurance_id?: string
          notes?: string
          cancelled_at?: string
          cancellation_reason?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      articles: {
        Row: {
          id: string
          title: string
          content: string
          excerpt?: string
          author?: string
          author_id?: string
          cover_image?: string
          category: string
          tags?: string[]
          published: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['articles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['articles']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          booking_id?: string
          room_id: number
          user_id: string
          rating: number
          title?: string
          comment?: string
          pros?: string[]
          cons?: string[]
          photos?: string[]
          verified: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type?: string
          link?: string
          read: boolean
          read_at?: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
