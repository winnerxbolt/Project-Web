'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaDatabase, FaDownload, FaTrash, FaHistory, FaClock, FaCheckCircle, FaTimesCircle, FaCog, FaSave, FaPlay, FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa'

interface BackupConfig {
  enabled: boolean
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: number
  backupTime: string // เวลาที่ต้องการ backup (HH:MM)
  selectedFiles: string[]
  lastBackup?: string
  autoDelete: boolean
}

interface Backup {
  name: string
  month: string
  date: string
  size?: number
  exists: boolean // ตรวจสอบว่าไฟล์ยังมีอยู่จริง
}

interface ConfirmDialog {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  confirmColor: 'red' | 'blue'
  onConfirm: () => void
}

export default function BackupManagementPage() {
  const [config, setConfig] = useState<BackupConfig>({
    enabled: true,
    schedule: 'weekly',
    customDays: 7,
    backupTime: '02:00',
    selectedFiles: [],
    autoDelete: true
  })
  
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [backups, setBackups] = useState<Backup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    confirmColor: 'red',
    onConfirm: () => {}
  })

  // โหลดข้อมูล config และรายการ backup
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // โหลด config
      const configRes = await fetch('/api/backup?action=config')
      const configData = await configRes.json()
      if (configData.success) {
        setConfig(configData.config)
        setAvailableFiles(configData.availableFiles || [])
      }

      // โหลดรายการ backup
      const backupsRes = await fetch('/api/backup')
      const backupsData = await backupsRes.json()
      if (backupsData.success) {
        setBackups(backupsData.backups || [])
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error)
      showMessage('error', 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'ยืนยัน',
    confirmColor: 'red' | 'blue' = 'red'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmColor,
      onConfirm
    })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      isOpen: false
    })
  }

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveConfig', config })
      })
      
      const data = await res.json()
      if (data.success) {
        // แสดงข้อความพร้อม cron expression
        const message = data.cronExpression 
          ? `✅ บันทึกการตั้งค่าสำเร็จ!\n\n📅 Cron Schedule อัพเดตแล้ว: ${data.cronExpression}`
          : '✅ บันทึกการตั้งค่าสำเร็จ!'
        showMessage('success', message)
      } else {
        showMessage('error', data.message || 'ไม่สามารถบันทึกการตั้งค่าได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า')
    }
  }

  const handleManualBackup = async () => {
    if (config.selectedFiles.length === 0) {
      showMessage('error', 'กรุณาเลือกไฟล์ที่ต้องการสำรอง')
      return
    }

    try {
      setIsBackingUp(true)
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selectedFiles: config.selectedFiles,
          autoDelete: config.autoDelete
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', data.message)
        await loadData() // โหลดข้อมูลใหม่
      } else {
        showMessage('error', data.message || 'ไม่สามารถสำรองข้อมูลได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการสำรองข้อมูล')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (backupName: string, month: string) => {
    if (!confirm(`คุณต้องการกู้คืนข้อมูลจาก ${backupName} (${month}) หรือไม่?\n\n⚠️ ข้อมูลปัจจุบันจะถูกแทนที่!`)) {
      return
    }

    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupName, month })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', data.message)
      } else {
        showMessage('error', data.message || 'ไม่สามารถกู้คืนข้อมูลได้')
      }
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล')
    }
  }

  const handleDeleteAll = async () => {
    showConfirmDialog(
      '⚠️ ลบ Backup ทั้งหมด',
      'คุณต้องการลบ Backup ทั้งหมดหรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!',
      async () => {
        closeConfirmDialog()
        try {
          const res = await fetch('/api/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteAll' })
          })
          
          const data = await res.json()
          if (data.success) {
            showMessage('success', 'ลบ Backup ทั้งหมดสำเร็จ')
            await loadData()
          } else {
            showMessage('error', 'ไม่สามารถลบ Backup ได้')
          }
        } catch (error) {
          showMessage('error', 'เกิดข้อผิดพลาดในการลบ Backup')
        }
      },
      'ลบทั้งหมด',
      'red'
    )
  }

  const handleDeleteOne = async (backupName: string, month: string) => {
    showConfirmDialog(
      '🗑️ ลบ Backup',
      `คุณต้องการลบ Backup "${backupName}" หรือไม่?`,
      async () => {
        closeConfirmDialog()
        try {
          const res = await fetch('/api/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteOne', backupName, month })
          })
          
          const data = await res.json()
          if (data.success) {
            showMessage('success', 'ลบ Backup สำเร็จ')
            await loadData()
          } else {
            showMessage('error', data.message || 'ไม่สามารถลบ Backup ได้')
          }
        } catch (error) {
          showMessage('error', 'เกิดข้อผิดพลาดในการลบ Backup')
        }
      },
      'ลบ',
      'red'
    )
  }

  const handleDeleteMonth = async (month: string) => {
    showConfirmDialog(
      '⚠️ ลบ Backup ทั้งเดือน',
      `คุณต้องการลบ Backup ทั้งเดือน "${month}" หรือไม่?\n\nจะลบ backup ทั้งหมดในเดือนนี้!`,
      async () => {
        closeConfirmDialog()
        try {
          const res = await fetch('/api/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteMonth', month })
          })
          
          const data = await res.json()
          if (data.success) {
            showMessage('success', `ลบ Backup เดือน ${month} สำเร็จ`)
            await loadData()
          } else {
            showMessage('error', data.message || 'ไม่สามารถลบ Backup เดือนได้')
          }
        } catch (error) {
          showMessage('error', 'เกิดข้อผิดพลาดในการลบ Backup เดือน')
        }
      },
      'ลบทั้งเดือน',
      'red'
    )
  }

  const toggleFileSelection = (file: string) => {
    setConfig(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.includes(file)
        ? prev.selectedFiles.filter(f => f !== file)
        : [...prev.selectedFiles, file]
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScheduleText = () => {
    const time = config.backupTime || '02:00'
    switch (config.schedule) {
      case 'daily': return `ทุกวัน เวลา ${time} น.`
      case 'weekly': return `ทุกสัปดาห์ (7 วัน) เวลา ${time} น.`
      case 'monthly': return `ทุกเดือน (30 วัน) เวลา ${time} น.`
      case 'custom': return `ทุก ${config.customDays || 7} วัน เวลา ${time} น.`
      default: return 'ไม่ระบุ'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-800 text-2xl font-bold">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pool-blue/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-luxury-gold/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin">
            <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl shadow-lg border-2 border-gray-200 hover:border-pool-blue transition-all duration-300">
              <FaArrowLeft className="text-lg" />
              <span>กลับไปหน้า Admin</span>
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-4 mb-6 bg-white rounded-3xl px-8 py-6 shadow-2xl border-2 border-pool-blue/20">
            <FaDatabase className="text-6xl text-pool-blue animate-float" />
            <h1 className="text-5xl md:text-6xl font-black text-gray-800">
              BACKUP MANAGEMENT
            </h1>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            💾 จัดการสำรองข้อมูลและกู้คืนข้อมูลของเว็บไซต์
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-5 rounded-xl shadow-lg border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          } animate-float`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <FaCheckCircle className="text-3xl text-green-600" />
              ) : (
                <FaTimesCircle className="text-3xl text-red-600" />
              )}
              <span className="font-bold text-lg">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Backup Configuration */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-luxury-gold/20 p-4 rounded-xl border-2 border-luxury-gold">
                <FaCog className="text-luxury-gold text-3xl" />
              </div>
              <h2 className="text-3xl font-black text-gray-800">การตั้งค่า Backup</h2>
            </div>

            {/* Enable/Disable */}
            <div className="mb-6 p-5 bg-pool-blue/10 rounded-xl border-2 border-pool-blue/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-6 h-6 rounded"
                />
                <span className="text-gray-800 font-bold text-lg">เปิดใช้งาน Auto Backup</span>
              </label>
            </div>

            {/* Schedule Selection */}
            <div className="mb-6">
              <label className="block text-gray-800 font-bold mb-3">
                <FaClock className="inline mr-2" />
                ความถี่ในการ Backup
              </label>
              <select
                value={config.schedule}
                onChange={(e) => setConfig({ ...config, schedule: e.target.value as any })}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-pool-light focus:outline-none focus:ring-2 focus:ring-pool-light/30"
              >
                <option value="daily" className="bg-white">ทุกวัน</option>
                <option value="weekly" className="bg-white">ทุกสัปดาห์</option>
                <option value="monthly" className="bg-white">ทุกเดือน</option>
                <option value="custom" className="bg-pool-dark">กำหนดเอง</option>
              </select>
            </div>

            {/* Custom Days */}
            {config.schedule === 'custom' && (
              <div className="mb-6">
                <label className="block text-gray-800 font-bold mb-3">จำนวนวัน</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={config.customDays || 7}
                  onChange={(e) => setConfig({ ...config, customDays: parseInt(e.target.value) || 7 })}
                  className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-pool-light focus:outline-none focus:ring-2 focus:ring-pool-light/30"
                />
              </div>
            )}

            {/* Backup Time Selection */}
            <div className="mb-6">
              <label className="block text-gray-800 font-bold mb-3">
                <FaClock className="inline mr-2" />
                เวลาที่ต้องการ Backup
              </label>
              <input
                type="time"
                value={config.backupTime}
                onChange={(e) => setConfig({ ...config, backupTime: e.target.value })}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-pool-light focus:outline-none focus:ring-2 focus:ring-pool-light/30"
              />
              <p className="text-gray-500 text-sm mt-2">
                ระบบจะทำการ backup อัตโนมัติตามเวลาที่กำหนด (เวลาไทย)
              </p>
            </div>

            {/* File Selection */}
            <div className="mb-6">
              <label className="block text-gray-800 font-medium mb-3">
                <FaDatabase className="inline mr-2" />
                เลือกไฟล์ที่ต้องการสำรอง
              </label>
              <div className="space-y-2">
                {availableFiles.map(file => (
                  <label key={file} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-pool-light transition-all">
                    <input
                      type="checkbox"
                      checked={config.selectedFiles.includes(file)}
                      onChange={() => toggleFileSelection(file)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-gray-800 font-medium">{file}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Auto Delete Old Backups */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoDelete}
                  onChange={(e) => setConfig({ ...config, autoDelete: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-800 font-bold">ลบ Backup เก่าอัตโนมัติ</span>
              </label>
              <p className="text-gray-600 text-sm mt-2 ml-8">
                จะเก็บเฉพาะ Backup ล่าสุดเท่านั้น
              </p>
            </div>

            {/* Save Config Button */}
            <button
              onClick={handleSaveConfig}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-luxury-gold to-luxury-bronze hover:from-luxury-bronze hover:to-luxury-gold text-white font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FaSave className="text-xl" />
              <span className="text-lg">บันทึกการตั้งค่า</span>
            </button>
          </div>

        {/* Backup Status & Actions */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pool-light/20 p-3 rounded-xl border border-pool-light/30">
                <FaPlay className="text-pool-light text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">สถานะและการดำเนินการ</h2>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all">
                <div className="text-gray-600 text-sm mb-1">สถานะ</div>
                <div className="flex items-center gap-2">
                  {config.enabled ? (
                    <>
                      <FaCheckCircle className="text-green-500 text-xl" />
                      <span className="text-gray-800 font-bold">เปิดใช้งาน</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-500 text-xl" />
                      <span className="text-gray-800 font-bold">ปิดใช้งาน</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all">
                <div className="text-gray-600 text-sm mb-1">ความถี่</div>
                <div className="text-gray-800 font-bold">{getScheduleText()}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all">
                <div className="text-gray-600 text-sm mb-1">ไฟล์ที่เลือก</div>
                <div className="text-gray-800 font-bold">{config.selectedFiles.length} ไฟล์</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all">
                <div className="text-gray-600 text-sm mb-1">Backup ทั้งหมด</div>
                <div className="text-gray-800 font-bold">{backups.length} ชุด</div>
              </div>
            </div>

            {/* Last Backup */}
            {config.lastBackup && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="text-gray-600 text-sm mb-1">Backup ล่าสุด</div>
                <div className="text-gray-800 font-medium">{formatDate(config.lastBackup)}</div>
              </div>
            )}

            {/* Manual Backup Button */}
            <button 
              className={`w-full gap-2 mb-4 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
                isBackingUp || config.selectedFiles.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-pool-light hover:bg-pool-dark text-white shadow-lg hover:shadow-xl'
              }`}
              onClick={handleManualBackup}
              disabled={isBackingUp || config.selectedFiles.length === 0}
            >
              {isBackingUp ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังสำรองข้อมูล...
                </>
              ) : (
                <>
                  <FaDownload />
                  สำรองข้อมูลทันที (Manual)
                </>
              )}
            </button>

            {/* Delete All Backups */}
            {backups.length > 0 && (
              <button 
                className="w-full gap-2 px-6 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                onClick={handleDeleteAll}
              >
                <FaTrash />
                ลบ Backup ทั้งหมด
              </button>
            )}

            {/* Warning */}
            {config.selectedFiles.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-700">
                  <FaExclamationTriangle />
                  <span className="text-sm font-medium">กรุณาเลือกไฟล์ที่ต้องการสำรอง</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-tropical-mint/20 p-3 rounded-xl border border-tropical-mint/30">
              <FaHistory className="text-tropical-mint text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">ประวัติ Backup</h2>
          </div>

          {backups.length === 0 ? (
            <div className="text-center py-12">
              <FaDatabase className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ยังไม่มีประวัติ Backup</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group by month */}
              {Object.entries(
                backups.reduce((acc, backup) => {
                  if (!acc[backup.month]) acc[backup.month] = []
                  acc[backup.month].push(backup)
                  return acc
                }, {} as Record<string, typeof backups>)
              ).map(([month, monthBackups]) => (
                <div key={month}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-luxury-gold/30 px-4 py-2 rounded-lg border-2 border-luxury-gold/50">
                        <span className="text-luxury-gold font-bold">📅 {month}</span>
                      </div>
                      <div className="text-gray-600 text-sm font-medium">
                        {monthBackups.length} ชุด
                      </div>
                    </div>
                    {/* ปุ่มลบทั้งเดือน */}
                    <button
                      onClick={() => handleDeleteMonth(month)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                      title={`ลบ backup ทั้งเดือน ${month}`}
                    >
                      <FaTrash className="text-xs" />
                      ลบทั้งเดือน
                    </button>
                  </div>
                  
                  <div className="space-y-2 ml-4">
                    {monthBackups.map((backup, index) => (
                      <div key={`${backup.month}-${backup.name}-${index}`} className={`rounded-xl p-4 border-2 transition-all ${
                        backup.exists 
                          ? 'bg-gray-50 border-gray-200 hover:shadow-lg' 
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-gray-800 font-bold">{backup.name}</div>
                              {!backup.exists && (
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                                  ไฟล์ถูกลบ
                                </span>
                              )}
                            </div>
                            <div className="text-gray-600 text-sm">{formatDate(backup.date)}</div>
                            {!backup.exists && (
                              <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                <FaExclamationTriangle />
                                <span>ไฟล์ backup ถูกลบออกจาก server แล้ว ไม่สามารถกู้คืนได้</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {backup.exists ? (
                              <>
                                <button
                                  onClick={() => handleRestore(backup.name, backup.month)}
                                  className="bg-pool-light hover:bg-pool-dark text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg border-2 border-pool-light/30 flex items-center gap-2"
                                >
                                  <FaDownload />
                                  กู้คืน
                                </button>
                                <button
                                  onClick={() => handleDeleteOne(backup.name, backup.month)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                  title="ลบ backup นี้"
                                >
                                  <FaTrash />
                                  ลบ
                                </button>
                              </>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center gap-2"
                              >
                                <FaDownload />
                                ไม่สามารถกู้คืน
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scaleIn border-4 border-gray-200">
            {/* Header */}
            <div className={`px-8 py-6 rounded-t-3xl ${
              confirmDialog.confirmColor === 'red' 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-pool-light to-pool-dark'
            }`}>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                {confirmDialog.title}
              </h3>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {confirmDialog.message}
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 rounded-b-3xl flex gap-3">
              <button
                onClick={closeConfirmDialog}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg ${
                  confirmDialog.confirmColor === 'red'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-pool-light hover:bg-pool-dark'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
