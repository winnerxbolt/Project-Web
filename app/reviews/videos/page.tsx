'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaHome, FaYoutube, FaPlay, FaArrowLeft } from 'react-icons/fa'
import PoolButton from '@/components/PoolButton'
import PoolCard from '@/components/PoolCard'

interface VideoReview {
  id: string
  title: string
  videoUrl: string
  description: string
}

export default function VideoReviewsPage() {
  const [videos] = useState<VideoReview[]>([
    {
      id: '1',
      title: 'รีวิว Poolvilla Pattaya - ประสบการณ์สุดพิเศษ',
      videoUrl: 'https://www.youtube.com/embed/WX7chULLLdA',
      description: 'พาชมบรรยากาศสุดหรูของพูลวิลล่าพัทยา พร้อมสระว่ายน้ำส่วนตัว'
    },
    {
      id: '2',
      title: 'พักผ่อนสุดชิล ณ Poolvilla Pattaya',
      videoUrl: 'https://www.youtube.com/embed/WX7chULLLdA',
      description: 'รีวิวห้องพักและสิ่งอำนวยความสะดวกครบครัน'
    },
    {
      id: '3',
      title: 'Weekend Getaway - Poolvilla Pattaya',
      videoUrl: 'https://www.youtube.com/embed/WX7chULLLdA',
      description: 'วันหยุดสุดพิเศษกับครอบครัว ณ พูลวิลล่าพัทยา'
    }
  ])

  return (
    <main className="min-h-screen bg-gradient-to-br from-pool-dark via-pool-blue to-tropical-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pool-light/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-tropical-mint/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/reviews">
            <PoolButton variant="secondary" className="gap-2">
              <FaArrowLeft />
              <span>กลับไปหน้ารีวิว</span>
            </PoolButton>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-6 bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-4 border border-white/20">
            <FaYoutube className="text-6xl text-luxury-gold animate-float" />
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pool-light to-tropical-mint">
              VIDEO REVIEWS
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto">
            🎬 ชมประสบการณ์จริงจากผู้ที่เคยมาใช้บริการ
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <PoolCard variant="glass" className="text-center py-16">
            <FaYoutube className="text-7xl text-pool-light/50 mx-auto mb-6" />
            <p className="text-white text-2xl font-semibold mb-2">ยังไม่มีรีวิววิดีโอ</p>
            <p className="text-white/70 text-lg">กำลังอัปเดตเนื้อหาใหม่เร็วๆ นี้</p>
          </PoolCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <PoolCard
                key={video.id}
                variant="gradient"
                className="overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                {/* Video Player */}
                <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-4">
                  <iframe
                    className="w-full h-full"
                    src={video.videoUrl}
                    title={video.title} 
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Info */}
                <div className="flex items-start gap-3">
                  <div className="bg-luxury-gold/20 backdrop-blur-sm rounded-full p-3 mt-1 border border-luxury-gold/30">
                    <FaPlay className="text-luxury-gold text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xl mb-2 group-hover:text-luxury-gold transition">
                      {video.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>
              </PoolCard>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link href="/">
            <PoolButton variant="primary" className="gap-2 text-lg px-8 py-4">
              <FaHome />
              <span>กลับสู่หน้าแรก</span>
            </PoolButton>
          </Link>
        </div>
      </div>
    </main>
  )
}
