'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHome, FaYoutube, FaPlay } from 'react-icons/fa'

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
    <main className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-black hover:text-black font-medium transition group"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaYoutube className="text-5xl text-ocean-600" />
            <h1 className="text-4xl font-bold text-gray-800">คลิปรีวิวบ้านพัก Poolvilla</h1>
          </div>
          <p className="text-gray-600 text-lg">ชมประสบการณ์จริงจากผู้ที่เคยมาใช้บริการ</p>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <FaYoutube className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">ยังไม่มีรีวิววิดีโอ</p>
            <p className="text-gray-400 mt-2">กำลังอัปเดตเนื้อหาใหม่เร็วๆ นี้</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group"
              >
                {/* Video Player */}
                <div className="relative aspect-video bg-gray-900">
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
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-ocean-100 rounded-full p-2 mt-1">
                      <FaPlay className="text-ocean-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-ocean-600 transition">
                        {video.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
