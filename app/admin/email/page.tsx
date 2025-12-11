'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaPaperPlane,
  FaSync,
  FaChartBar,
} from 'react-icons/fa'

interface EmailLog {
  id: string
  to: string | string[]
  subject: string
  templateId?: string
  provider: string
  status: 'queued' | 'sent' | 'failed' | 'retry'
  error?: string
  attempts: number
  sentAt?: string
  createdAt: string
}

export default function AdminEmailPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [testingProvider, setTestingProvider] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [queueStats, setQueueStats] = useState<any>(null)

  useEffect(() => {
    loadLogs()
    loadQueueStats()
  }, [selectedStatus])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const status = selectedStatus === 'all' ? '' : selectedStatus
      const response = await fetch(`/api/email/logs?limit=50&status=${status}`)
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQueueStats = async () => {
    try {
      const response = await fetch('/api/email/process-queue')
      const data = await response.json()
      
      if (data.success) {
        setQueueStats(data.queue)
      }
    } catch (error) {
      console.error('Failed to load queue stats:', error)
    }
  }

  const testEmailProvider = async (provider: string) => {
    try {
      setTestingProvider(provider)
      setTestResult(null)

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({ success: false, message: error.message })
    } finally {
      setTestingProvider('')
    }
  }

  const processQueue = async () => {
    try {
      const response = await fetch('/api/email/process-queue', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`ประมวลผลสำเร็จ: ${data.processed} ส่ง, ${data.failed} ล้มเหลว`)
        loadLogs()
        loadQueueStats()
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการประมวลผลคิว')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <FaCheckCircle className="text-green-500" />
      case 'failed':
        return <FaTimesCircle className="text-red-500" />
      case 'queued':
      case 'retry':
        return <FaClock className="text-yellow-500" />
      default:
        return <FaClock className="text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      queued: 'bg-yellow-100 text-yellow-800',
      retry: 'bg-orange-100 text-orange-800',
    }

    return `px-3 py-1 rounded-full text-xs font-bold ${badges[status] || 'bg-gray-100 text-gray-800'}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                ← กลับ
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                📧 Email Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/api/email/preview?templateId=booking-confirmation')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <FaEye />
                Preview Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="text-2xl text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Emails</div>
                <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Sent</div>
                <div className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.status === 'sent').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaTimesCircle className="text-2xl text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.status === 'failed').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-2xl text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Queue</div>
                <div className="text-2xl font-bold text-gray-900">
                  {queueStats?.pending || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Email Providers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaPaperPlane className="text-blue-600" />
            Test Email Providers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['development', 'gmail', 'sendgrid'].map((provider) => (
              <button
                key={provider}
                onClick={() => testEmailProvider(provider)}
                disabled={!!testingProvider}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <div className="text-lg font-bold text-gray-900 capitalize mb-2">
                  {provider}
                </div>
                <div className="text-sm text-gray-600">
                  {testingProvider === provider ? 'Testing...' : 'Click to test'}
                </div>
              </button>
            ))}
          </div>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <FaCheckCircle className="text-green-600 text-xl mt-0.5" />
                ) : (
                  <FaTimesCircle className="text-red-600 text-xl mt-0.5" />
                )}
                <div>
                  <div className={`font-bold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? 'Success!' : 'Failed'}
                  </div>
                  <div className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.message}
                  </div>
                  {testResult.emailSent && (
                    <div className="text-sm text-green-600 mt-1">
                      Test email sent: {testResult.messageId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Queue Management */}
        {queueStats && queueStats.pending > 0 && (
          <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-200 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-yellow-900 flex items-center gap-2">
                  <FaClock />
                  Email Queue
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {queueStats.pending} emails waiting to be sent
                </p>
              </div>
              <button
                onClick={processQueue}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
              >
                <FaSync />
                Process Now
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {['all', 'sent', 'failed', 'queued'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'ทั้งหมด' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Email Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Email Logs
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <FaSync className="animate-spin text-4xl mx-auto mb-4" />
              <div>Loading...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FaEnvelope className="text-6xl mx-auto mb-4 opacity-20" />
              <div>No emails found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={getStatusBadge(log.status)}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(log.to) ? log.to.join(', ') : log.to}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.subject}</div>
                        {log.templateId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Template: {log.templateId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {log.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.attempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.sentAt || log.createdAt).toLocaleString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
