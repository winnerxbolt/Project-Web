'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import FeaturedRooms from '@/components/FeaturedRooms'
import Features from '@/components/Features'
import InstagramFeed from '@/components/InstagramFeed'
import EmailSubscribeForm from '@/components/EmailSubscribeForm'
import Footer from '@/components/Footer'

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
      <FeaturedRooms />
      <Features />
      
      {/* Instagram Feed Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InstagramFeed limit={6} />
        </div>
      </section>
      
      {/* Email Subscribe Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmailSubscribeForm />
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
