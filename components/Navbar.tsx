'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaHotel, FaBars, FaTimes, FaUserShield } from 'react-icons/fa'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FaHotel className="text-3xl text-primary-600" />
            <span className="text-2xl font-bold text-gray-800">Poolvilla Pattaya</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition font-medium">
              Home
            </Link>
            <Link href="/rooms" className="text-gray-700 hover:text-primary-600 transition font-medium">
              Poolvilla
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition font-medium">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition font-medium">
              Contact
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <FaUserShield />
              <span>Admin Mode</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/rooms"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Poolvilla
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/admin"
              className="block px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              onClick={() => setIsOpen(false)}
            >
              <FaUserShield className="inline mr-2" />
              Admin Mode
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
