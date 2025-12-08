'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { FaGlobe, FaChevronDown } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'

export default function LanguageSwitcher() {
  const { language, currency, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'th' as const, name: 'ไทย', flag: '🇹🇭', currency: 'THB' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸', currency: 'USD' },
    { code: 'cn' as const, name: '中文', flag: '🇨🇳', currency: 'CNY' },
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300 group"
      >
        <FaGlobe className="text-xl text-blue-600 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-gray-800 text-lg">{currentLang.flag}</span>
        <span className="font-semibold text-gray-700 hidden sm:inline">{currentLang.name}</span>
        <span className="text-sm text-gray-500 hidden md:inline">({currentLang.currency})</span>
        <FaChevronDown
          className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <FaGlobe className="text-xl" />
              Select Language
            </p>
          </div>
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${
                  language === lang.code
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className={`font-bold ${language === lang.code ? 'text-white' : 'text-gray-800'}`}>
                      {lang.name}
                    </p>
                    <p className={`text-xs ${language === lang.code ? 'text-blue-100' : 'text-gray-500'}`}>
                      {lang.currency}
                    </p>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              💱 Currency auto-converts based on language
            </p>
          </div>
        </div>
      )}

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
