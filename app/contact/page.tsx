import type { Metadata } from 'next'
import Link from 'next/link'
import Contact from '../../components/contact'

export const metadata: Metadata = {
  title: 'ติดต่อเรา - Booking Poolvilla Pattaya',
  description: 'ติดต่อเรา หากมีคำถาม ข้อเสนอแนะ หรือปัญหาในการใช้งาน',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">ติดต่อเรา</h1>
          <p className="text-gray-600">มีคำถาม ข้อเสนอแนะ หรือปัญหาในการใช้งาน ติดต่อทีมงานได้ที่นี่</p>

          <div className="mt-4">
            <Link
              href="/"
              aria-label="กลับไปหน้าหลัก"
              className="inline-block bg-white border border-gray-200 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition"
            >
              กลับไปหน้าหลัก
            </Link>
          </div>
        </div>

        <Contact endpoint="/api/contacts" showDetails={true} />
      </section>
    </main>
  )
}