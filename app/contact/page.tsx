import type { Metadata } from 'next'
import Link from 'next/link'
import { FaHome, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import Contact from '../../components/contact'
import PoolButton from '@/components/PoolButton'
import PoolCard from '@/components/PoolCard'

export const metadata: Metadata = {
  title: 'ติดต่อเรา - Booking Poolvilla Pattaya',
  description: 'ติดต่อเรา หากมีคำถาม ข้อเสนอแนะ หรือปัญหาในการใช้งาน',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pool-dark via-pool-blue to-tropical-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-20 w-72 h-72 bg-tropical-mint/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Home Button */}
        <div className="mb-8">
          <Link href="/">
            <PoolButton variant="secondary" className="gap-2">
              <FaHome />
              <span>กลับสู่หน้าแรก</span>
            </PoolButton>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-6 bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-4 border border-white/20">
            <FaEnvelope className="text-5xl text-luxury-gold animate-float" />
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pool-light to-tropical-mint">
              ติดต่อเรา
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto">
            💬 มีคำถาม ข้อเสนอแนะ หรือปัญหาในการใช้งาน? ติดต่อทีมงานได้ที่นี่
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <PoolCard variant="glass" className="group hover:scale-105 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-pool-light/20 backdrop-blur-sm rounded-full p-4 border-2 border-pool-light/30 group-hover:border-pool-light transition">
                  <FaPhone className="text-pool-light text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">โทรศัพท์</h3>
                  <a href="tel:+6621234567" className="text-white/80 hover:text-luxury-gold transition text-lg">
                    +66 2 123 4567
                  </a>
                </div>
              </div>
            </PoolCard>

            <PoolCard variant="glass" className="group hover:scale-105 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-luxury-gold/20 backdrop-blur-sm rounded-full p-4 border-2 border-luxury-gold/30 group-hover:border-luxury-gold transition">
                  <FaEnvelope className="text-luxury-gold text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">อีเมล</h3>
                  <a href="mailto:contact@poolvilla-pattaya.com" className="text-white/80 hover:text-luxury-gold transition text-lg">
                    contact@poolvilla-pattaya.com
                  </a>
                </div>
              </div>
            </PoolCard>

            <PoolCard variant="glass" className="group hover:scale-105 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-tropical-mint/20 backdrop-blur-sm rounded-full p-4 border-2 border-tropical-mint/30 group-hover:border-tropical-mint transition">
                  <FaMapMarkerAlt className="text-tropical-mint text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">ที่อยู่</h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    พัทยา ชลบุรี<br />
                    ประเทศไทย
                  </p>
                </div>
              </div>
            </PoolCard>
          </div>

          {/* Contact Form */}
          <PoolCard variant="gradient">
            <Contact endpoint="/api/contacts" showDetails={false} />
          </PoolCard>
        </div>
      </section>
    </main>
  )
}