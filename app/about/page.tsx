import type { Metadata } from 'next'
import About from '../../components/About'
import Link from 'next/link'
import { FaHistory, FaShieldAlt, FaHeadset } from 'react-icons/fa'

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา - Booking Poolvilla Pattaya',
  description: 'ข้อมูลเกี่ยวกับ Booking Poolvilla Pattaya และบริการของเรา',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">เกี่ยวกับเรา</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Booking Poolvilla Pattaya เป็นแพลตฟอร์มที่ช่วยให้การค้นหาและจอง Poolvilla ในพัทยาและพื้นที่ใกล้เคียงเป็นเรื่องง่าย
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaHistory className="mx-auto text-primary-600 text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">ประสบการณ์</h3>
            <p className="text-gray-500">เรามีประสบการณ์ในการรวมและจัดการที่พักที่มีคุณภาพ</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaShieldAlt className="mx-auto text-primary-600 text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">ปลอดภัย</h3>
            <p className="text-gray-500">ข้อมูลผู้ใช้และการชำระเงินได้รับการปกป้องตามมาตรฐาน</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaHeadset className="mx-auto text-primary-600 text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">บริการลูกค้า</h3>
            <p className="text-gray-500">ทีมงานพร้อมให้ความช่วยเหลือผ่านช่องทางติดต่อของเรา</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">วิสัยทัศน์ของเรา</h2>
              <p className="text-gray-600">
                เราต้องการเป็นแพลตฟอร์มอันดับต้น ๆ สำหรับการจอง Poolvilla ในประเทศไทย โดยให้ประสบการณ์การค้นหาและจองที่สะดวกและเชื่อถือได้
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">ภารกิจ</h2>
              <p className="text-gray-600">
                ให้ข้อมูลที่ชัดเจน ครอบคลุม และระบบจองที่ใช้งานง่าย เพื่อช่วยให้ลูกค้าค้นหาที่พักที่เหมาะสมได้อย่างรวดเร็ว
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <About href="/about" showCta={true} />
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/rooms" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg">
            ดูห้องทั้งหมด
          </Link>
        </div>
      </section>
    </main>
  )
}