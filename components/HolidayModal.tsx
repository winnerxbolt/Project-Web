'use client'

import { FaTimes } from 'react-icons/fa'
import { HolidayDate } from '@/types/blackout'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  holiday: HolidayDate | null
}

export default function HolidayModal({ isOpen, onClose, onSave, holiday }: Props) {
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      id: holiday?.id,
      name: formData.get('name'),
      nameEn: formData.get('nameEn'),
      nameTh: formData.get('nameTh'),
      date: formData.get('date'),
      endDate: formData.get('endDate') || undefined,
      type: formData.get('type'),
      country: formData.get('country') || 'TH',
      isRecurring: formData.get('isRecurring') === 'on',
      priceMultiplier: Number(formData.get('priceMultiplier')) || 1.0,
      minStayRequired: Number(formData.get('minStayRequired')) || 1,
      color: formData.get('color') || '#FFD700',
      emoji: formData.get('emoji') || '🎉',
      description: formData.get('description'),
      isActive: formData.get('isActive') === 'on',
    }

    try {
      const url = '/api/holidays'
      const method = holiday ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert(holiday ? 'อัปเดตสำเร็จ!' : 'สร้างวันหยุดสำเร็จ!')
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            {holiday ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุดใหม่'}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อวันหยุด *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={holiday?.name}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              placeholder="เช่น: วันขึ้นปีใหม่"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อภาษาไทย *</label>
              <input
                type="text"
                name="nameTh"
                required
                defaultValue={holiday?.nameTh}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อภาษาอังกฤษ *</label>
              <input
                type="text"
                name="nameEn"
                required
                defaultValue={holiday?.nameEn}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่ *</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={holiday?.date}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่สิ้นสุด (ถ้ามี)</label>
              <input
                type="date"
                name="endDate"
                defaultValue={holiday?.endDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท *</label>
              <select
                name="type"
                required
                defaultValue={holiday?.type || 'public'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              >
                <option value="public">วันหยุดราชการ</option>
                <option value="religious">วันสำคัญทางศาสนา</option>
                <option value="cultural">วันสำคัญทางวัฒนธรรม</option>
                <option value="seasonal">ตามฤดูกาล</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ประเทศ</label>
              <input
                type="text"
                name="country"
                defaultValue={holiday?.country || 'TH'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
                placeholder="TH"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ราคาเพิ่ม (ตัวคูณ) *</label>
              <input
                type="number"
                name="priceMultiplier"
                step="0.1"
                min="1.0"
                required
                defaultValue={holiday?.priceMultiplier || 1.5}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              />
              <p className="text-xs text-gray-500 mt-1">1.5 = +50%, 2.0 = +100%</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">พักขั้นต่ำ (คืน) *</label>
              <input
                type="number"
                name="minStayRequired"
                min="1"
                required
                defaultValue={holiday?.minStayRequired || 1}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emoji *</label>
              <input
                type="text"
                name="emoji"
                required
                defaultValue={holiday?.emoji || '🎉'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium text-2xl text-center"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">สี</label>
            <input
              type="color"
              name="color"
              defaultValue={holiday?.color || '#FFD700'}
              className="w-full h-12 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={holiday?.description}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 font-medium"
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับวันหยุด..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isRecurring"
                defaultChecked={holiday?.isRecurring}
                className="w-5 h-5 text-yellow-600"
              />
              <span className="text-sm font-semibold text-gray-700">ซ้ำทุกปี</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={holiday?.isActive ?? true}
                className="w-5 h-5 text-yellow-600"
              />
              <span className="text-sm font-semibold text-gray-700">เปิดใช้งาน</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold"
            >
              {holiday ? 'บันทึกการแก้ไข' : 'เพิ่มวันหยุด'}
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
