'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLine, FaSun, FaMoon } from 'react-icons/fa'
import React from 'react'
import { containsProfanity } from '@/lib/profanityFilter'

type Props = {
  endpoint?: string
  showDetails?: boolean
  className?: string
  onSuccess?: () => void
}

export default function Contact({
  endpoint = '/api/contacts',
  showDetails = true,
  className = '',
  onSuccess,
}: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  useEffect(() => {
    // initialize on client
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name || !email || !message) {
      setErrorText('กรุณากรอกข้อมูลที่จำเป็น')
      setStatus('error')
      return
    }
    if (!validateEmail(email)) {
      setErrorText('รูปแบบอีเมลไม่ถูกต้อง')
      setStatus('error')
      return
    }
    if (containsProfanity(name)) {
      setErrorText('ชื่อมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setStatus('error')
      return
    }
    if (containsProfanity(message)) {
      setErrorText('ข้อความมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม')
      setStatus('error')
      return
    }

    setStatus('pending')
    setErrorText('')

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      })

      if (res.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
        onSuccess?.()
        setTimeout(() => setStatus('idle'), 3000)
        return
      }

      const data = await res.json().catch(() => null)
      setErrorText(data?.message || 'เกิดข้อผิดพลาดในการส่งข้อความ')
      setStatus('error')
    } catch (err) {
      console.error(err)
      setErrorText('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
      setStatus('error')
    }
  }

  const telHref = 'tel:+6621234567'
  const mapQuery = encodeURIComponent('พัทยา ชลบุรี ประเทศไทย')
  const googleMaps = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const facebook = 'https://www.facebook.com/' // เปลี่ยนเป็นลิงก์จริง
  const lineUrl = 'https://lin.ee/YOURLINE' // เปลี่ยนเป็นลิงก์จริง

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow p-6 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        {showDetails ? (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ข้อมูลการติดต่อ</h2>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ส่งข้อความถึงเรา</h2>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition"
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'สว่าง' : 'มืด'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showDetails && (
          <div>
            <ul className="text-gray-600 dark:text-gray-300 space-y-3">
              <li className="flex items-center gap-3">
                <FaPhone className="text-primary-600" />
                <a href={telHref} aria-label="โทร 02-123-4567" className="hover:underline text-primary-600">
                  02-123-4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-primary-600" />
                <a href="mailto:info@bookinghotel.com" aria-label="ส่งอีเมล info@bookinghotel.com" className="hover:underline">
                  info@bookinghotel.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-primary-600" />
                <a href={googleMaps} target="_blank" rel="noopener noreferrer" aria-label="ดูที่ตั้งบน Google Maps" className="hover:underline">
                  พัทยา ชลบุรี ประเทศไทย
                </a>
              </li>
            </ul>

            {/* ปุ่ม Facebook และ LINE */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook page"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
              >
                <FaFacebook />
                <span className="hidden sm:inline">Facebook</span>
              </a>

              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LINE"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md"
              >
                <FaLine />
                <span className="hidden sm:inline">LINE</span>
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              ชื่อ
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-required
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="ชื่อของคุณ"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              อีเมล
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required={true}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              เบอร์โทร (ถ้ามี)
            </label>
            <input
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="เช่น 081-234-5678"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              ข้อความ
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              aria-required={true}
              rows={5}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="รายละเอียดข้อความของคุณ..."
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={status === 'pending'}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'pending' ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>

            {status === 'success' && <span className="text-sm text-green-600">ส่งข้อความเรียบร้อย</span>}
            {status === 'error' && <span className="text-sm text-red-600">{errorText || 'เกิดข้อผิดพลาด'}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}