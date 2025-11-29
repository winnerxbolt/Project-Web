import Link from 'next/link'
import { FaHotel, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaLine } from 'react-icons/fa'
import About from './About'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <About href="/about" showCta={false} className="text-gray-400" />
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">เกี่ยวกับเรา</Link></li>
              <li><Link href="/rooms" className="text-gray-400 hover:text-white">ห้องพัก</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">ติดต่อเรา</Link></li>
              <li><Link href="/contact/channels" className="text-gray-400 hover:text-white">ช่องทางการติดต่อ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">ติดต่อ</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-3"><FaPhone /> <a href="tel:+6621234567">02-123-4567</a></li>
              <li className="flex items-center gap-3"><FaEnvelope /> <a href="mailto:info@bookinghotel.com">info@bookinghotel.com</a></li>
              <li className="flex items-center gap-3"><FaMapMarkerAlt /> พัทยา ชลบุรี</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">ติดตามเรา</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center"><FaFacebook /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center"><FaInstagram /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center"><FaLine /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 BookingPoolvilla Pattaya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
