// lib/supabaseClient.ts - Client-side Supabase Client
'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffkzqihfaqscqnkhstnv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma3pxaWhmYXFzY3Fua2hzdG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2Mjk5NDMsImV4cCI6MjA4MTIwNTk0M30.NBGfhSQnYnVuWPkqRS5YzOzrndZzawiLNOE5o5R6F9k'

// Client-side Supabase client (without strict typing to avoid type conflicts)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for client-side operations

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      }
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  return { user, error }
}

export async function getSession() {
  const { data: { session }, error } = await supabaseClient.auth.getSession()
  return { session, error }
}

// Social login helpers
export async function signInWithGoogle() {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signInWithFacebook() {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// Database query helpers
export const db = {
  // Rooms
  getRooms: async (available = true) => {
    const { data, error } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('available', available)
      .order('rating', { ascending: false })
    return { data, error }
  },

  getRoomById: async (id: number) => {
    const { data, error } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Bookings
  getUserBookings: async (userId: string) => {
    const { data, error } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        rooms (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createBooking: async (booking: any) => {
    const { data, error } = await supabaseClient
      .from('bookings')
      .insert(booking as any)
      .select()
      .single()
    return { data, error }
  },

  // Articles
  getPublishedArticles: async (limit = 10) => {
    const { data, error } = await supabaseClient
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  getArticleById: async (id: string) => {
    const { data, error } = await supabaseClient
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  incrementArticleViews: async (id: string) => {
    // Get current article and increment views manually
    const { data: article } = await supabaseClient
      .from('articles')
      .select('views')
      .eq('id', id)
      .single()
    
    const { data, error } = await supabaseClient
      .from('articles')
      .update({ views: (article?.views || 0) + 1 } as any)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Reviews
  getRoomReviews: async (roomId: number) => {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select(`
        *,
        users (name, picture)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createReview: async (review: any) => {
    const { data, error } = await supabaseClient
      .from('reviews')
      .insert(review as any)
      .select()
      .single()
    return { data, error }
  },

  // Notifications
  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  markNotificationAsRead: async (id: string) => {
    const { data, error } = await supabaseClient
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Wishlist
  getUserWishlist: async (userId: string) => {
    const { data, error } = await supabaseClient
      .from('wishlist')
      .select(`
        *,
        rooms (*)
      `)
      .eq('user_id', userId)
    return { data, error }
  },

  addToWishlist: async (userId: string, roomId: number) => {
    const { data, error } = await supabaseClient
      .from('wishlist')
      .insert({ user_id: userId, room_id: roomId } as any)
      .select()
      .single()
    return { data, error }
  },

  removeFromWishlist: async (userId: string, roomId: number) => {
    const { data, error } = await supabaseClient
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('room_id', roomId)
    return { data, error }
  }
}

export default supabaseClient
