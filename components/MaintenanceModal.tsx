'use client'

import { FaTimes } from 'react-icons/fa'
import { MaintenanceSchedule } from '@/types/blackout'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  maintenance: MaintenanceSchedule | null
}

export default function MaintenanceModal({ isOpen, onClose, onSave, maintenance }: Props) {
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      id: maintenance?.id,
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      estimatedDuration: Number(formData.get('estimatedDuration')) || 0,
      roomIds: [],
      locationIds: [],
      facilities: (formData.get('facilities') as string || '').split(',').filter(Boolean),
      affectsBooking: formData.get('affectsBooking') === 'on',
      partialClosure: formData.get('partialClosure') === 'on',
      alternativeAvailable: formData.get('alternativeAvailable') === 'on',
      assignedTo: (formData.get('assignedTo') as string || '').split(',').filter(Boolean),
      contractor: formData.get('contractor') || undefined,
      cost: Number(formData.get('cost')) || undefined,
      status: formData.get('status') || 'scheduled',
      completionPercentage: Number(formData.get('completionPercentage')) || 0,
      notifyGuests: formData.get('notifyGuests') === 'on',
      guestMessage: formData.get('guestMessage') || undefined,
    }

    try {
      const url = '/api/maintenance'
      const method = maintenance ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert(maintenance ? 'อัปเดตสำเร็จ!' : 'สร้างตารางซ่อมบำรุงสำเร็จ!')
        
        // Send email notification if enabled
        if (data.notifyGuests && data.guestMessage) {
          await fetch('/api/maintenance/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              maintenanceId: maintenance?.id,
              title: data.title,
              startDate: data.startDate,
              endDate: data.endDate,
              message: data.guestMessage,
            }),
          })
        }
        
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
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            {maintenance ? 'แก้ไขตารางซ่อมบำรุง' : 'สร้างตารางซ่อมบำรุงใหม่'}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">หัวข้อ *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={maintenance?.title}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              placeholder="เช่น: ซ่อมระบบสระว่ายน้ำ"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={maintenance?.description}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              placeholder="รายละเอียดการซ่อมบำรุง..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท *</label>
              <select
                name="type"
                required
                defaultValue={maintenance?.type || 'routine'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              >
                <option value="routine">ตามกำหนดปกติ</option>
                <option value="repair">ซ่อมแซม</option>
                <option value="renovation">ปรับปรุง</option>
                <option value="inspection">ตรวจสอบ</option>
                <option value="deep_cleaning">ทำความสะอาดครั้งใหญ่</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ความสำคัญ *</label>
              <select
                name="priority"
                required
                defaultValue={maintenance?.priority || 'medium'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              >
                <option value="low">🟢 Low - ไม่เร่งด่วน</option>
                <option value="medium">🟡 Medium - ปานกลาง</option>
                <option value="high">🟠 High - สำคัญ</option>
                <option value="urgent">🔴 Urgent - เร่งด่วนมาก</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่เริ่ม *</label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={maintenance?.startDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่สิ้นสุด *</label>
              <input
                type="date"
                name="endDate"
                required
                defaultValue={maintenance?.endDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ระยะเวลา (ชั่วโมง)</label>
              <input
                type="number"
                name="estimatedDuration"
                min="0"
                defaultValue={maintenance?.estimatedDuration || 0}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">สถานที่/อุปกรณ์ที่ได้รับผลกระทบ</label>
            <input
              type="text"
              name="facilities"
              defaultValue={maintenance?.facilities.join(', ')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              placeholder="สระว่ายน้ำ, ฟิตเนส, ร้านอาหาร (คั่นด้วยเครื่องหมายจุลภาค)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">มอบหมายพนักงาน</label>
              <input
                type="text"
                name="assignedTo"
                defaultValue={maintenance?.assignedTo.join(', ')}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                placeholder="ชื่อพนักงาน (คั่นด้วยเครื่องหมายจุลภาค)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ผู้รับเหมา</label>
              <input
                type="text"
                name="contractor"
                defaultValue={maintenance?.contractor}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                placeholder="ชื่อบริษัทผู้รับเหมา"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ค่าใช้จ่าย (บาท)</label>
              <input
                type="number"
                name="cost"
                min="0"
                defaultValue={maintenance?.cost}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
              <select
                name="status"
                defaultValue={maintenance?.status || 'scheduled'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              >
                <option value="scheduled">Scheduled - กำหนดการแล้ว</option>
                <option value="in_progress">In Progress - กำลังดำเนินการ</option>
                <option value="completed">Completed - เสร็จสิ้น</option>
                <option value="cancelled">Cancelled - ยกเลิก</option>
                <option value="delayed">Delayed - เลื่อน</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ความคืบหน้า (%)</label>
            <input
              type="range"
              name="completionPercentage"
              min="0"
              max="100"
              defaultValue={maintenance?.completionPercentage || 0}
              className="w-full"
              onChange={(e) => {
                const label = e.target.nextElementSibling as HTMLSpanElement
                if (label) label.textContent = `${e.target.value}%`
              }}
            />
            <span className="text-sm font-bold text-orange-600">{maintenance?.completionPercentage || 0}%</span>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 mb-3">การส่งผลกระทบ</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="affectsBooking"
                  defaultChecked={maintenance?.affectsBooking ?? true}
                  className="w-5 h-5 text-orange-600"
                />
                <span className="text-sm font-semibold text-gray-700">ส่งผลต่อการจอง</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="partialClosure"
                  defaultChecked={maintenance?.partialClosure}
                  className="w-5 h-5 text-orange-600"
                />
                <span className="text-sm font-semibold text-gray-700">ปิดบางส่วน (ยังสามารถจองได้แต่มีข้อจำกัด)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="alternativeAvailable"
                  defaultChecked={maintenance?.alternativeAvailable}
                  className="w-5 h-5 text-orange-600"
                />
                <span className="text-sm font-semibold text-gray-700">มีห้องทางเลือกอื่น</span>
              </label>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 mb-3">การแจ้งเตือนลูกค้า</h4>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="notifyGuests"
                defaultChecked={maintenance?.notifyGuests ?? true}
                className="w-5 h-5 text-orange-600"
              />
              <span className="text-sm font-semibold text-gray-700">ส่งอีเมลแจ้งเตือนลูกค้า</span>
            </label>

            <label className="block text-sm font-semibold text-gray-700 mb-2">ข้อความแจ้งลูกค้า</label>
            <textarea
              name="guestMessage"
              rows={3}
              defaultValue={maintenance?.guestMessage}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              placeholder="ข้อความที่จะส่งให้ลูกค้าทราบ..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold"
            >
              {maintenance ? 'บันทึกการแก้ไข' : 'สร้างตารางซ่อมบำรุง'}
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
