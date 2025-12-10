'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { FaGlobe, FaChevronDown } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'

export default function LanguageSwitcher() {
  const { language, currency, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'th' as const, name: 'ไทย', flag: '🇹🇭', currency: 'THB', color: 'from-red-500 to-blue-600' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧', currency: 'USD', color: 'from-blue-600 to-red-600' },
    { code: 'cn' as const, name: '中文', flag: '🇨🇳', currency: 'CNY', color: 'from-red-600 to-yellow-500' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺', currency: 'RUB', color: 'from-blue-500 to-indigo-700' },
    { code: 'kr' as const, name: '한국어', flag: '🇰🇷', currency: 'KRW', color: 'from-red-500 to-blue-700' },
  ]

  const currentLang = languages.find((l) => l.code === language) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-white hover:scale-105 group"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">{currentLang.flag}</span>
        <span className="font-bold text-gray-800 text-sm hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        <FaChevronDown
          className={`text-gray-600 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-4">
            <p className="text-white font-bold text-base flex items-center gap-2">
              <FaGlobe className="text-xl animate-pulse" />
              Choose Language
            </p>
          </div>

          {/* Language Options */}
          <div className="p-3 max-h-96 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
                  language === lang.code
                    ? `bg-gradient-to-r ${lang.color} text-white shadow-lg transform scale-105`
                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 border border-transparent hover:border-gray-200'
                }`}
              >
                {/* Flag */}
                <div className={`text-4xl ${language === lang.code ? 'scale-110' : ''} transition-transform`}>
                  {lang.flag}
                </div>

                {/* Language Info */}
                <div className="flex-1 text-left">
                  <p className={`font-bold text-base ${language === lang.code ? 'text-white' : 'text-gray-900'}`}>
                    {lang.name}
                  </p>
                  <p className={`text-xs ${language === lang.code ? 'text-white/80' : 'text-gray-500'}`}>
                    {lang.currency} • {lang.code.toUpperCase()}
                  </p>
                </div>

                {/* Selected Indicator */}
                {language === lang.code && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
              <span>💱</span>
              <span>Currency auto-converts</span>
            </p>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
