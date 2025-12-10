'use client'

import { FaTimes } from 'react-icons/fa'
import { BlackoutDate } from '@/types/blackout'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  blackout: BlackoutDate | null
}

export default function BlackoutModal({ isOpen, onClose, onSave, blackout }: Props) {
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      id: blackout?.id,
      type: formData.get('type'),
      title: formData.get('title'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: formData.get('status') || 'active',
      allowBooking: formData.get('allowBooking') === 'on',
      minimumStay: Number(formData.get('minimumStay')) || undefined,
      maximumStay: Number(formData.get('maximumStay')) || undefined,
      advanceBookingDays: Number(formData.get('advanceBookingDays')) || undefined,
      color: formData.get('color') || '#FF6B6B',
      priority: Number(formData.get('priority')) || 5,
      priceAdjustment: {
        enabled: formData.get('priceEnabled') === 'on',
        strategy: formData.get('priceStrategy') as any,
        value: Number(formData.get('priceValue')) || 0,
      },
      recurrence: {
        type: formData.get('recurrenceType') || 'none',
      },
      roomIds: [],
      locationIds: [],
      notes: formData.get('notes'),
    }

    try {
      const url = blackout ? '/api/blackout-dates' : '/api/blackout-dates'
      const method = blackout ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert(blackout ? 'อัปเดตสำเร็จ!' : 'สร้างสำเร็จ!')
        onSave()
        onClose()
      } else {
        alert('เกิดข้อผิดพลาด')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-500 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            {blackout ? 'แก้ไข Blackout Date' : 'สร้าง Blackout Date ใหม่'}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท *</label>
              <select
                name="type"
                required
                defaultValue={blackout?.type || 'custom'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              >
                <option value="holiday">วันหยุดนักขัตฤกษ์</option>
                <option value="maintenance">วันซ่อมบำรุง</option>
                <option value="private_event">งานเอกชน</option>
                <option value="seasonal">ตามฤดูกาล</option>
                <option value="custom">กำหนดเอง</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ *</label>
              <select
                name="status"
                defaultValue={blackout?.status || 'active'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              >
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">หัวข้อ *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={blackout?.title}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              placeholder="เช่น: ปิดปรับปรุง Pool Villa A"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={blackout?.description}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              placeholder="รายละเอียดเพิ่มเติม..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่เริ่ม *</label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={blackout?.startDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่สิ้นสุด *</label>
              <input
                type="date"
                name="endDate"
                required
                defaultValue={blackout?.endDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">สี</label>
              <input
                type="color"
                name="color"
                defaultValue={blackout?.color || '#FF6B6B'}
                className="w-full h-10 border-2 border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <input
                type="number"
                name="priority"
                min="1"
                max="10"
                defaultValue={blackout?.priority || 5}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  name="allowBooking"
                  defaultChecked={blackout?.allowBooking}
                  className="w-5 h-5 text-purple-600"
                />
                <span className="text-sm font-semibold text-gray-700">อนุญาตให้จอง</span>
              </label>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 mb-3">ข้อจำกัด</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">พักขั้นต่ำ (คืน)</label>
                <input
                  type="number"
                  name="minimumStay"
                  min="1"
                  defaultValue={blackout?.minimumStay}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">พักสูงสุด (คืน)</label>
                <input
                  type="number"
                  name="maximumStay"
                  min="1"
                  defaultValue={blackout?.maximumStay}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">จองล่วงหน้า (วัน)</label>
                <input
                  type="number"
                  name="advanceBookingDays"
                  min="0"
                  defaultValue={blackout?.advanceBookingDays}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 mb-3">การปรับราคา</h4>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="priceEnabled"
                defaultChecked={blackout?.priceAdjustment?.enabled}
                className="w-5 h-5 text-purple-600"
              />
              <span className="text-sm font-semibold text-gray-700">เปิดใช้งานการปรับราคา</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท</label>
                <select
                  name="priceStrategy"
                  defaultValue={blackout?.priceAdjustment?.strategy || 'percentage'}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                >
                  <option value="percentage">เปอร์เซ็นต์ (%)</option>
                  <option value="fixed_amount">จำนวนเงิน (บาท)</option>
                  <option value="multiplier">ตัวคูณ (x)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ค่า</label>
                <input
                  type="number"
                  name="priceValue"
                  step="0.01"
                  defaultValue={blackout?.priceAdjustment?.value || 0}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">หมายเหตุ</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={blackout?.notes}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-semibold"
            >
              {blackout ? 'บันทึกการแก้ไข' : 'สร้าง Blackout Date'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
