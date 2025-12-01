import Link from 'next/link'
import { FaHotel } from 'react-icons/fa'

type Props = {
  href?: string
  className?: string
  showCta?: boolean
}

export default function About({
  href = '/about',
  className = '',
  showCta = false,
}: Props) {
  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <FaHotel className="text-3xl text-primary-500" />
        <span className="text-2xl font-bold text-white">Poolvilla Pattaya</span>
      </div>
      <p className="text-gray-400 mb-4">
        ระบบจองบ้านพัก Poolvilla ออนไลน์ที่ทันสมัย ให้บริการจองบ้านพัก Poolvilla คุณภาพ ทั่วประเทศไทย
      </p>
      {showCta && (
        <Link href={href} aria-label="ดูเพิ่มเติมเกี่ยวกับเรา">
          <span className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
            ดูเพิ่มเติม
          </span>
        </Link>
      )}
    </>
  )

  return (
    <div className={`max-w-md ${className}`}>
      {href ? (
        <Link href={href} className="group block" aria-label="เกี่ยวกับเรา">
          <div className="group-hover:opacity-95 transition">{content}</div>
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </div>
  )
}