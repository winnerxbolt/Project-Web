'use client'

import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { SeasonalPricing } from '@/types/blackout'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  seasonal: SeasonalPricing | null
}

export default function SeasonalModal({ isOpen, onClose, onSave, seasonal }: Props) {
  if (!isOpen) return null

  const [longStayDiscounts, setLongStayDiscounts] = useState(
    seasonal?.longStayDiscount || [{ nights: 7, discount: 10 }]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      id: seasonal?.id,
      seasonName: formData.get('seasonName'),
      seasonNameTh: formData.get('seasonNameTh'),
      seasonNameEn: formData.get('seasonNameEn'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      isRecurring: formData.get('isRecurring') === 'on',
      strategy: formData.get('strategy'),
      baseAdjustment: Number(formData.get('baseAdjustment')) || 0,
      roomPricing: [],
      minimumStay: Number(formData.get('minimumStay')) || 1,
      advanceBookingRequired: Number(formData.get('advanceBookingRequired')) || 0,
      cancellationPolicy: formData.get('cancellationPolicy') || undefined,
      weekendMultiplier: Number(formData.get('weekendMultiplier')) || undefined,
      longStayDiscount: longStayDiscounts,
      color: formData.get('color') || '#4ECDC4',
      badge: formData.get('badge'),
      tags: (formData.get('tags') as string || '').split(',').filter(Boolean).map(t => t.trim()),
      maxBookingsPerDay: Number(formData.get('maxBookingsPerDay')) || undefined,
      enableEarlyBird: formData.get('enableEarlyBird') === 'on',
      earlyBirdDiscount: Number(formData.get('earlyBirdDiscount')) || undefined,
      earlyBirdDays: Number(formData.get('earlyBirdDays')) || undefined,
      isActive: formData.get('isActive') === 'on',
      priority: Number(formData.get('priority')) || 5,
    }

    try {
      const url = '/api/seasonal-pricing'
      const method = seasonal ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert(seasonal ? 'อัปเดตสำเร็จ!' : 'สร้างราคาตามฤดูกาลสำเร็จ!')
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
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            {seasonal ? 'แก้ไขราคาตามฤดูกาล' : 'สร้างราคาตามฤดูกาลใหม่'}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อฤดูกาล *</label>
            <input
              type="text"
              name="seasonName"
              required
              defaultValue={seasonal?.seasonName}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              placeholder="เช่น: High Season - ฤดูกาลท่องเที่ยว"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อภาษาไทย *</label>
              <input
                type="text"
                name="seasonNameTh"
                required
                defaultValue={seasonal?.seasonNameTh}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อภาษาอังกฤษ *</label>
              <input
                type="text"
                name="seasonNameEn"
                required
                defaultValue={seasonal?.seasonNameEn}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={seasonal?.description}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              placeholder="อธิบายเกี่ยวกับฤดูกาลนี้..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่เริ่ม *</label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={seasonal?.startDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่สิ้นสุด *</label>
              <input
                type="date"
                name="endDate"
                required
                defaultValue={seasonal?.endDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วิธีปรับราคา *</label>
              <select
                name="strategy"
                required
                defaultValue={seasonal?.strategy || 'percentage'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              >
                <option value="percentage">เปอร์เซ็นต์ (%)</option>
                <option value="fixed_amount">จำนวนเงิน (บาท)</option>
                <option value="multiplier">ตัวคูณ (x)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ปรับราคา *</label>
              <input
                type="number"
                name="baseAdjustment"
                step="0.01"
                required
                defaultValue={seasonal?.baseAdjustment || 0}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                placeholder="50 = +50%, -30 = -30%"
              />
              <p className="text-xs text-gray-500 mt-1">บวก (+) = เพิ่มราคา, ลบ (-) = ลดราคา</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">พักขั้นต่ำ (คืน)</label>
              <input
                type="number"
                name="minimumStay"
                min="1"
                defaultValue={seasonal?.minimumStay || 1}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">จองล่วงหน้า (วัน)</label>
              <input
                type="number"
                name="advanceBookingRequired"
                min="0"
                defaultValue={seasonal?.advanceBookingRequired || 0}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority (1-10)</label>
              <input
                type="number"
                name="priority"
                min="1"
                max="10"
                defaultValue={seasonal?.priority || 5}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Weekend Multiplier</label>
            <input
              type="number"
              name="weekendMultiplier"
              step="0.1"
              min="1.0"
              defaultValue={seasonal?.weekendMultiplier}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              placeholder="1.2 = +20% สำหรับศุกร์-อาทิตย์"
            />
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 mb-3">Long Stay Discount (ส่วนลดพักยาว)</h4>
            {longStayDiscounts.map((discount, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="number"
                  value={discount.nights}
                  onChange={(e) => {
                    const newDiscounts = [...longStayDiscounts]
                    newDiscounts[index].nights = Number(e.target.value)
                    setLongStayDiscounts(newDiscounts)
                  }}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium"
                  placeholder="คืน"
                />
                <input
                  type="number"
                  value={discount.discount}
                  onChange={(e) => {
                    const newDiscounts = [...longStayDiscounts]
                    newDiscounts[index].discount = Number(e.target.value)
                    setLongStayDiscounts(newDiscounts)
                  }}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium"
                  placeholder="ส่วนลด %"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newDiscounts = longStayDiscounts.filter((_, i) => i !== index)
                    setLongStayDiscounts(newDiscounts)
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ลบ
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLongStayDiscounts([...longStayDiscounts, { nights: 0, discount: 0 }])}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              + เพิ่มระดับส่วนลด
            </button>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 mb-3">Early Bird Discount</h4>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="enableEarlyBird"
                defaultChecked={seasonal?.enableEarlyBird}
                className="w-5 h-5 text-green-600"
              />
              <span className="text-sm font-semibold text-gray-700">เปิดใช้งาน Early Bird</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ส่วนลด (%)</label>
                <input
                  type="number"
                  name="earlyBirdDiscount"
                  min="0"
                  defaultValue={seasonal?.earlyBirdDiscount}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">จองล่วงหน้า (วัน)</label>
                <input
                  type="number"
                  name="earlyBirdDays"
                  min="0"
                  defaultValue={seasonal?.earlyBirdDays}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Badge</label>
              <input
                type="text"
                name="badge"
                defaultValue={seasonal?.badge}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                placeholder="🔥 High Season"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">สี</label>
              <input
                type="color"
                name="color"
                defaultValue={seasonal?.color || '#4ECDC4'}
                className="w-full h-12 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (คั่นด้วยเครื่องหมายจุลภาค)</label>
            <input
              type="text"
              name="tags"
              defaultValue={seasonal?.tags.join(', ')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
              placeholder="peak, popular, discount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isRecurring"
                defaultChecked={seasonal?.isRecurring}
                className="w-5 h-5 text-green-600"
              />
              <span className="text-sm font-semibold text-gray-700">ซ้ำทุกปี</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={seasonal?.isActive ?? true}
                className="w-5 h-5 text-green-600"
              />
              <span className="text-sm font-semibold text-gray-700">เปิดใช้งาน</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-semibold"
            >
              {seasonal ? 'บันทึกการแก้ไข' : 'สร้างราคาตามฤดูกาล'}
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
