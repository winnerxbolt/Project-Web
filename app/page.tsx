'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import FeaturedRooms from '@/components/FeaturedRooms'
import Features from '@/components/Features'
import Footer from '@/components/Footer'

export default function Home() {
  // เรียกใช้ auto-checkout เมื่อโหลดหน้า
  useEffect(() => {
    fetch('/api/auto-checkout')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Auto-checkout:', data.message)
        }
      })
      .catch(err => console.error('Auto-checkout error:', err))
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedRooms />
      <Features />
      <Footer />
    </main>
  )
}
