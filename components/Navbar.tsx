'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, memo, useCallback } from 'react'
import { FaBars, FaTimes, FaUserShield, FaUser, FaSignInAlt, FaSignOutAlt, FaCog } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from './LanguageSwitcher'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { t, language } = useLanguage()

  const handleLogout = useCallback(() => {
    logout()
    setUserMenuOpen(false)
  }, [logout])

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg border-b border-pool-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image 
              key={`logo-${language}`}
              src="/logo.png" 
              alt="Poolvilla Pattaya Logo" 
              width={280} 
              height={70} 
              className="!h-16 !w-auto object-contain"
              style={{ height: '64px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className="relative text-pool-dark hover:text-pool-blue transition font-medium px-4 py-2 rounded-lg hover:bg-pool-blue/10 group">
              <span className="relative z-10">{t('nav.home')}</span>
            </Link>
            <Link href="/rooms" className="relative text-pool-dark hover:text-pool-blue transition font-medium px-4 py-2 rounded-lg hover:bg-pool-blue/10 group">
              <span className="relative z-10">{t('nav.rooms')}</span>
            </Link>
            <Link href="/insurance" className="relative text-pool-dark hover:text-purple-600 transition font-medium px-4 py-2 rounded-lg hover:bg-purple-100 group whitespace-nowrap">
              <span className="relative z-10 flex items-center gap-1">
                🛡️ ประกันการจอง
              </span>
            </Link>
            <Link href="/group-booking" className="relative text-pool-dark hover:text-indigo-600 transition font-medium px-4 py-2 rounded-lg hover:bg-indigo-100 group whitespace-nowrap">
              <span className="relative z-10 flex items-center gap-1">
                👨‍👩‍👧‍👦 จองหมู่คณะ
              </span>
            </Link>
            <Link href="/reviews" className="relative text-pool-dark hover:text-pool-blue transition font-medium px-4 py-2 rounded-lg hover:bg-pool-blue/10 group">
              <span className="relative z-10">{t('nav.reviews')}</span>
            </Link>
            <Link href="/reviews/videos" className="relative text-pool-dark hover:text-pool-blue transition font-medium px-4 py-2 rounded-lg hover:bg-pool-blue/10 group whitespace-nowrap">
              <span className="relative z-10">Video Poolvilla</span>
            </Link>
            <Link href="/about" className="relative text-pool-dark hover:text-pool-blue transition font-medium px-4 py-2 rounded-lg hover:bg-pool-blue/10 group whitespace-nowrap">
              <span className="relative z-10">{t('nav.about')}</span>
            </Link>
            <Link href="/contact" className="relative text-pool-dark hover:text-pool-blue transition font-medium px-4 py-2 rounded-lg hover:bg-pool-blue/10 group">
              <span className="relative z-10">{t('nav.contact')}</span>
            </Link>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Notification Bell */}
            {user && <NotificationBell />}
            
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-pool-blue to-pool-dark text-white px-4 py-2 rounded-lg hover:shadow-pool transition shadow-md text-sm whitespace-nowrap"
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
                          <span>{t('nav.admin')}</span>
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
                      <span>{t('nav.account')}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-pool-dark hover:text-pool-blue transition font-medium text-sm whitespace-nowrap"
                >
                  <FaSignInAlt className="text-sm" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-2 bg-gradient-to-r from-pool-blue to-pool-dark text-white px-4 py-2 rounded-lg hover:shadow-pool transition shadow-md text-sm whitespace-nowrap"
                >
                  <FaUser className="text-sm" />
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}
            
            {/* Admin Mode - Show only for admin */}
            {user && isAdmin() && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 bg-gradient-to-r from-luxury-gold to-luxury-bronze text-white px-4 py-2 rounded-lg hover:shadow-luxury transition shadow-md text-sm whitespace-nowrap"
              >
                <FaUserShield className="text-sm" />
                <span>Admin Mode</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-pool-dark text-2xl hover:text-pool-blue transition"
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
              <span className="relative z-10">{t('nav.home')}</span>
            </Link>
            <Link
              href="/rooms"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">{t('nav.rooms')}</span>
            </Link>
            <Link
              href="/reviews"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">{t('nav.reviews')}</span>
            </Link>
            <Link
              href="/insurance"
              className="block px-4 py-2.5 text-purple-700 font-bold border-2 border-purple-300 bg-purple-50 rounded-lg hover:border-purple-500 hover:bg-purple-100 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10 flex items-center gap-2">
                🛡️ ประกันการจอง
                <span className="text-xs bg-purple-200 px-2 py-0.5 rounded-full">NEW</span>
              </span>
            </Link>
            <Link
              href="/group-booking"
              className="block px-4 py-2.5 text-indigo-700 font-bold border-2 border-indigo-300 bg-indigo-50 rounded-lg hover:border-indigo-500 hover:bg-indigo-100 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10 flex items-center gap-2">
                👨‍👩‍👧‍👦 จองหมู่คณะ
                <span className="text-xs bg-indigo-200 px-2 py-0.5 rounded-full">HOT</span>
              </span>
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
              <span className="relative z-10">{t('nav.about')}</span>
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2.5 text-ocean-700 font-medium border-2 border-ocean-200 rounded-lg hover:border-ocean-400 hover:bg-ocean-50 transition overflow-hidden relative group"
              onClick={() => setIsOpen(false)}
            >
              <span className="relative z-10">{t('nav.contact')}</span>
            </Link>
            
            {/* Language Switcher - Mobile */}
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            
            {/* Mobile User Menu */}
            {user ? (
              <>
                <div className="px-3 py-2 text-ocean-800 font-semibold border-t border-ocean-200 mt-2">
                  {t('account.welcome')}, {user.name}
                </div>
                <Link
                  href="/account"
                  className="block px-3 py-2 text-ocean-700 hover:bg-ocean-50 hover:text-ocean-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog className="inline mr-2" />
                  {t('nav.account')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  {t('nav.logout')}
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
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="inline mr-2" />
                  {t('nav.register')}
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
                {t('nav.admin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default memo(Navbar)
