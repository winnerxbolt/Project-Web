'use client'

import { useState } from 'react'
import { FaFacebook, FaLine, FaTwitter, FaWhatsapp, FaEnvelope, FaLink, FaCheck } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

interface SocialShareProps {
  roomId: string
  roomName: string
  roomImage?: string
  className?: string
}

export default function SocialShare({ roomId, roomName, roomImage, className = '' }: SocialShareProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState<{ [key: string]: number }>({})

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `ดูห้องพักสุดพิเศษ: ${roomName} 🏨✨`
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedText = encodeURIComponent(shareText)

  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          platform,
          userId: user?.id,
          url: currentUrl
        })
      })
      
      setShareCount(prev => ({
        ...prev,
        [platform]: (prev[platform] || 0) + 1
      }))
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  const handleShare = (platform: string, url: string) => {
    trackShare(platform)
    window.open(url, '_blank', 'width=600,height=400')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      trackShare('link')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareButtons = [
    {
      name: 'Facebook',
      platform: 'facebook',
      icon: FaFacebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Line',
      platform: 'line',
      icon: FaLine,
      color: 'bg-[#00B900] hover:bg-[#00A300]',
      url: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
    },
    {
      name: 'Twitter',
      platform: 'twitter',
      icon: FaTwitter,
      color: 'bg-[#1DA1F2] hover:bg-[#1A8CD8]',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    },
    {
      name: 'WhatsApp',
      platform: 'whatsapp',
      icon: FaWhatsapp,
      color: 'bg-[#25D366] hover:bg-[#22C55E]',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Email',
      platform: 'email',
      icon: FaEnvelope,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`
    }
  ]

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        แชร์ห้องพักนี้
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {shareButtons.map((button) => {
          const Icon = button.icon
          return (
            <button
              key={button.platform}
              onClick={() => handleShare(button.platform, button.url)}
              className={`${button.color} text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl`}
            >
              <Icon className="text-xl" />
              <span className="font-medium text-sm">{button.name}</span>
              {shareCount[button.platform] > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {shareCount[button.platform]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <input
          type="text"
          value={currentUrl}
          readOnly
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-600 truncate"
        />
        <button
          onClick={handleCopyLink}
          className={`${
            copied 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-md`}
        >
          {copied ? (
            <>
              <FaCheck className="text-lg" />
              <span className="font-medium text-sm">คัดลอกแล้ว!</span>
            </>
          ) : (
            <>
              <FaLink className="text-lg" />
              <span className="font-medium text-sm">คัดลอก</span>
            </>
          )}
        </button>
      </div>

      {Object.keys(shareCount).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            🎉 แชร์ไปแล้ว{' '}
            <span className="font-bold text-purple-600">
              {Object.values(shareCount).reduce((a, b) => a + b, 0)}
            </span>{' '}
            ครั้ง
          </p>
        </div>
      )}
    </div>
  )
}
