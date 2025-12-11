'use client'

import { useEffect, Suspense, lazy } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'

// Dynamic imports for better code splitting
const FeaturedRooms = lazy(() => import('@/components/FeaturedRooms'))
const Features = lazy(() => import('@/components/Features'))
const InstagramFeed = lazy(() => import('@/components/InstagramFeed'))
const EmailSubscribeForm = lazy(() => import('@/components/EmailSubscribeForm'))
const Footer = lazy(() => import('@/components/Footer'))

// Loading component
const LoadingSection = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

export default function Home() {
  // เรียกใช้ auto-checkout เพียงครั้งเดียวต่อ session
  useEffect(() => {
    const lastCheckout = sessionStorage.getItem('lastAutoCheckout')
    const now = Date.now()
    
    // เรียก auto-checkout เฉพาะถ้าไม่เคยเรียกในรอบ 5 นาทีที่แล้ว
    if (!lastCheckout || now - parseInt(lastCheckout) > 300000) {
      fetch('/api/auto-checkout')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Auto-checkout:', data.message)
            sessionStorage.setItem('lastAutoCheckout', now.toString())
          }
        })
        .catch(err => console.error('Auto-checkout error:', err))
    }
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <Hero />
      </div>
      
      <Suspense fallback={<LoadingSection />}>
        <FeaturedRooms />
      </Suspense>
      
      <Suspense fallback={<LoadingSection />}>
        <Features />
      </Suspense>
      
      {/* Instagram Feed Section */}
      <Suspense fallback={<LoadingSection />}>
        <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <InstagramFeed limit={6} />
          </div>
        </section>
      </Suspense>
      
      {/* Email Subscribe Section */}
      <Suspense fallback={<LoadingSection />}>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EmailSubscribeForm />
          </div>
        </section>
      </Suspense>
      
      <Suspense fallback={<LoadingSection />}>
        <Footer />
      </Suspense>
    </main>
  )
}
