'use client'

import Link from 'next/link'
import { FaExclamationTriangle, FaEnvelope, FaUsers } from 'react-icons/fa'

export default function GroupBookingPage() {
  // ปิดระบบจองหมู่คณะชั่วคราว
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div className="mb-8">
          <FaExclamationTriangle className="text-8xl text-yellow-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl font-black text-gray-800 mb-6">
            ระบบจองหมู่คณะปิดชั่วคราว
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            ขออภัยในความไม่สะดวก
          </p>
          <p className="text-lg text-gray-500">
            ระบบจองแบบหมู่คณะปิดให้บริการชั่วคราว
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
          <p className="text-xl text-blue-900 font-bold mb-4">
            ต้องการจองหลายห้อง?
          </p>
          <p className="text-blue-800 mb-6">
            กรุณาติดต่อเราโดยตรงผ่านทางอีเมล หรือโทรศัพท์<br />
            เพื่อรับส่วนลดพิเศษสำหรับการจองหลายห้อง
          </p>
          <div className="space-y-3 text-left bg-white rounded-xl p-6">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-2xl text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">อีเมล</p>
                <p className="font-bold text-gray-900">contact@poolvilla-pattaya.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-sm text-gray-500">โทรศัพท์</p>
                <p className="font-bold text-gray-900">+66 XX XXX XXXX</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-lg"
          >
            <FaEnvelope />
            ติดต่อเรา
          </Link>
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg font-bold text-lg"
          >
            <FaUsers />
            ดูห้องพัก
          </Link>
        </div>
      </div>
    </div>
  )
}
