'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { FaBars, FaTimes, FaUserShield, FaUser, FaSignInAlt, FaSignOutAlt, FaCog } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  return (
    <nav className="bg-gradient-to-r from-ocean-500 to-primary-500 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Poolvilla Pattaya Logo" 
                width={280} 
                height={70} 
                className="h-16 w-auto transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse-slow"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-shine"></div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="relative text-white hover:text-white transition font-medium px-4 py-2 border-2 border-white/30 rounded-lg hover:border-white/80 hover:bg-white/10 backdrop-blur-sm overflow-hidden group">
              <span className="relative z-10">Home</span>
            </Link>
            <Link href="/rooms" className="relative text-white hover:text-white transition font-medium px-4 py-2 border-2 border-white/30 rounded-lg hover:border-white/80 hover:bg-white/10 backdrop-blur-sm overflow-hidden group">
              <span className="relative z-10">Poolvilla</span>
            </Link>
            <Link href="/reviews" className="relative text-white hover:text-white transition font-medium px-4 py-2 border-2 border-white/30 rounded-lg hover:border-white/80 hover:bg-white/10 backdrop-blur-sm overflow-hidden group">
              <span className="relative z-10">Reviews</span>
            </Link>
            <Link href="/reviews/videos" className="relative text-white hover:text-white transition font-medium px-4 py-2 border-2 border-white/30 rounded-lg hover:border-white/80 hover:bg-white/10 backdrop-blur-sm overflow-hidden group whitespace-nowrap">
              <span className="relative z-10">Video Poolvilla</span>
            </Link>
            <Link href="/about" className="relative text-white hover:text-white transition font-medium px-4 py-2 border-2 border-white/30 rounded-lg hover:border-white/80 hover:bg-white/10 backdrop-blur-sm overflow-hidden group whitespace-nowrap">
              <span className="relative z-10">About Us</span>
            </Link>
            <Link href="/contact" className="relative text-white hover:text-white transition font-medium px-4 py-2 border-2 border-white/30 rounded-lg hover:border-white/80 hover:bg-white/10 backdrop-blur-sm overflow-hidden group">
              <span className="relative z-10">Contact</span>
            </Link>
            
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-white text-ocean-600 px-3 py-1.5 rounded-lg hover:bg-ocean-50 transition shadow-md text-sm whitespace-nowrap"
                >
                  <FaUser className="text-sm" />
                  <span>{user.name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    {isAdmin() && (
                      <>
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-gray-800 hover:bg-ocean-50 flex items-center gap-2"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FaUserShield />
                          <span>Admin Mode</span>
                        </Link>
                        <div className="border-t my-2"></div>
                      </>
                    )}
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-gray-800 hover:bg-ocean-50 flex items-center gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FaCog />
                      <span>ตั้งค่าบัญชี</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-white hover:text-ocean-50 transition font-medium text-sm whitespace-nowrap"
                >
                  <FaSignInAlt className="text-sm" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-2 bg-white text-ocean-600 px-3 py-1.5 rounded-lg hover:bg-ocean-50 transition shadow-md text-sm whitespace-nowrap"
                >
                  <FaUser className="text-sm" />
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}
            
            {/* Admin Mode - Show only for admin */}
            {user && isAdmin() && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 bg-primary-900 text-white px-3 py-1.5 rounded-lg hover:bg-primary-800 transition shadow-md text-sm whitespace-nowrap"
              >
                <FaUserShield className="text-sm" />
                <span>Admin Mode</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-ocean-200">
          <div className="px-2 pt-2 pb-3 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">Home</span>
            </Link>
            <Link
              href="/rooms"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">Poolvilla</span>
            </Link>
            <Link
              href="/reviews"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">Reviews</span>
            </Link>
            <Link
              href="/reviews/videos"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">Video Poolvilla</span>
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">About Us</span>
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">Contact</span>
            </Link>
            
            {/* Mobile User Menu */}
            {user ? (
              <>
                <div className="px-3 py-2 text-ocean-800 font-semibold border-t border-ocean-200 mt-2">
                  สวัสดี, {user.name}
                </div>
                <Link
                  href="/account"
                  className="block px-3 py-2 text-ocean-700 hover:bg-ocean-50 hover:text-ocean-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog className="inline mr-2" />
                  ตั้งค่าบัญชี
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-ocean-700 hover:bg-ocean-50 hover:text-ocean-800 rounded-md border-t border-ocean-200 mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  <FaSignInAlt className="inline mr-2" />
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="inline mr-2" />
                  สมัครสมาชิก
                </Link>
              </>
            )}
            
            {/* Admin Mode - Mobile - Show only for admin */}
            {user && isAdmin() && (
              <Link
                href="/admin"
                className="block px-3 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 shadow-md"
                onClick={() => setIsOpen(false)}
              >
                <FaUserShield className="inline mr-2" />
                Admin Mode
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
