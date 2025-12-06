import type { Metadata } from 'next'
import Link from 'next/link'
import { FaHistory, FaShieldAlt, FaHeadset, FaHome, FaStar, FaSwimmingPool } from 'react-icons/fa'
import PoolButton from '@/components/PoolButton'
import PoolCard from '@/components/PoolCard'

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา - Poolvilla Pattaya',
  description: 'ข้อมูลเกี่ยวกับ Poolvilla Pattaya และบริการของเรา',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pool-dark via-pool-blue to-tropical-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-pool-light/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
            <FaSwimmingPool className="text-5xl text-luxury-gold animate-float" />
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pool-light to-tropical-mint">
              เกี่ยวกับเรา
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
            🏝️ Poolvilla Pattaya เป็นแพลตฟอร์มที่ช่วยให้การค้นหาและจองบ้านพัก Poolvilla 
            <br />
            ในพัทยาและพื้นที่ใกล้เคียงเป็นเรื่องง่าย
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <PoolCard variant="glass" className="text-center group hover:scale-105 transition-all duration-300">
            <div className="bg-luxury-gold/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-2 border-luxury-gold/30 group-hover:border-luxury-gold transition">
              <FaHistory className="text-luxury-gold text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">ประสบการณ์</h3>
            <p className="text-white/80 leading-relaxed">
              เรามีประสบการณ์ในการรวมและจัดการที่พักที่มีคุณภาพสูง
            </p>
          </PoolCard>

          <PoolCard variant="glass" className="text-center group hover:scale-105 transition-all duration-300">
            <div className="bg-pool-light/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-2 border-pool-light/30 group-hover:border-pool-light transition">
              <FaShieldAlt className="text-pool-light text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">ปลอดภัย</h3>
            <p className="text-white/80 leading-relaxed">
              ข้อมูลผู้ใช้และการชำระเงินได้รับการปกป้องตามมาตรฐานสากล
            </p>
          </PoolCard>

          <PoolCard variant="glass" className="text-center group hover:scale-105 transition-all duration-300">
            <div className="bg-tropical-mint/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-2 border-tropical-mint/30 group-hover:border-tropical-mint transition">
              <FaHeadset className="text-tropical-mint text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">บริการลูกค้า</h3>
            <p className="text-white/80 leading-relaxed">
              ทีมงานพร้อมให้ความช่วยเหลือผ่านช่องทางติดต่อของเรา 24/7
            </p>
          </PoolCard>
        </div>

        {/* Vision & Mission */}
        <PoolCard variant="gradient" className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-luxury-gold/20 backdrop-blur-sm rounded-full p-3 border border-luxury-gold/30">
                  <FaStar className="text-luxury-gold text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-white">วิสัยทัศน์ของเรา</h2>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                เราต้องการเป็นแพลตฟอร์มอันดับหนึ่งสำหรับการจอง Poolvilla ในประเทศไทย 
                โดยให้ประสบการณ์การค้นหาและจองที่สะดวก รวดเร็ว และเชื่อถือได้
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pool-light/20 backdrop-blur-sm rounded-full p-3 border border-pool-light/30">
                  <FaSwimmingPool className="text-pool-light text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-white">ภารกิจ</h2>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                ให้ข้อมูลที่ชัดเจน ครอบคลุม และระบบจองที่ใช้งานง่าย 
                เพื่อช่วยให้ลูกค้าค้นหาที่พักที่เหมาะสมได้อย่างรวดเร็วและสะดวกสบาย
              </p>
            </div>
          </div>
        </PoolCard>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/rooms">
            <PoolButton variant="primary" className="gap-2 text-lg px-8 py-4">
              <FaSwimmingPool />
              <span>ดูห้องทั้งหมด</span>
            </PoolButton>
          </Link>
          <Link href="/contact">
            <PoolButton variant="gold" className="gap-2 text-lg px-8 py-4">
              <FaHeadset />
              <span>ติดต่อเรา</span>
            </PoolButton>
          </Link>
        </div>
      </section>
    </main>
  )
}