import type { Metadata } from 'next'
import Link from 'next/link'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaLine } from 'react-icons/fa'
import Contact from '../../../components/contact'

export const metadata: Metadata = {
  title: 'ช่องทางการติดต่อ - Booking Poolvilla Pattaya',
  description: 'ดูช่องทางการติดต่อทั้งหมด เช่น โทรศัพท์ อีเมล LINE และโซเชียลมีเดีย',
}

export default function ContactChannelsPage() {
  const telHref = 'tel:+6621234567'
  const emailHref = 'mailto:info@bookinghotel.com'
  const mapQuery = encodeURIComponent('พัทยา ชลบุรี ประเทศไทย')
  const googleMaps = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const facebook = 'https://www.facebook.com/' // ใส่ลิงก์จริง
  const instagram = 'https://www.instagram.com/' // ใส่ลิงก์จริง
  const lineUrl = 'https://lin.ee/YOURLINE' // ใส่ลิงก์จริง / QR

  const socialLinks = [
    { href: facebook, Icon: FaFacebook, label: 'Facebook' },
    { href: instagram, Icon: FaInstagram, label: 'Instagram' },
    { href: lineUrl, Icon: FaLine, label: 'LINE' },
  ].filter((s) => s.href)

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">ช่องทางการติดต่อ</h1>
          <p className="text-gray-600">ติดต่อเราได้หลายช่องทาง ทั้งโทรศัพท์ อีเมล LINE หรือโซเชียลมีเดีย</p>

          <div className="mt-4">
            <Link href="/" aria-label="กลับไปหน้าหลัก" className="inline-block bg-white border border-gray-200 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition">
              กลับไปหน้าหลัก
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ช่องทางหลัก</h2>

            <ul className="space-y-4 text-gray-700">
              <li className="flex items-center gap-3">
                <FaPhone className="text-primary-600 text-xl" />
                <a href={telHref} aria-label="โทรหาเรา" className="text-primary-600 hover:underline">02-123-4567</a>
              </li>

              <li className="flex items-center gap-3">
                <FaEnvelope className="text-primary-600 text-xl" />
                <a href={emailHref} aria-label="ส่งอีเมล" className="hover:underline">info@bookinghotel.com</a>
              </li>

              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-primary-600 text-xl" />
                <a href={googleMaps} target="_blank" rel="noopener noreferrer" aria-label="ดูที่ตั้งบน Google Maps" className="hover:underline">พัทยา ชลบุรี ประเทศไทย</a>
              </li>

              <li className="flex items-center gap-3">
                <FaLine className="text-primary-600 text-xl" />
                <a href={lineUrl} target="_blank" rel="noopener noreferrer" aria-label="Line" className="hover:underline">เพิ่มเพื่อนใน LINE</a>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">โซเชียลมีเดีย</h3>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ href, Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="px-3 py-2 bg-gray-100 rounded hover:bg-primary-600 hover:text-white transition">
                    <Icon />
                  </a>
                ))}
              </div>

              {/* ปุ่ม Facebook / LINE แบบมีข้อความ */}
              <div className="mt-4 flex items-center gap-3">
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook page" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                  <FaFacebook />
                  <span className="hidden sm:inline">Facebook</span>
                </a>

                <a href={lineUrl} target="_blank" rel="noopener noreferrer" aria-label="LINE" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md">
                  <FaLine />
                  <span className="hidden sm:inline">LINE</span>
                </a>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">เวลาทำการ</h3>
              <p className="text-gray-600">จันทร์–ศุกร์ 09:00–18:00 น.</p>
              <p className="text-gray-600">เสาร์–อาทิตย์ 10:00–16:00 น.</p>
            </div>

            <div className="mt-6">
              <Link href="/contact" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">ส่งข้อความถึงเรา</Link>
            </div>
          </div>

          <div>
            <Contact endpoint="/api/contacts" showDetails={false} />
          </div>
        </div>
      </section>
    </main>
  )
}