'use client'

import { useState, useEffect } from 'react'
import { FaMobileAlt, FaPaperPlane, FaChartLine, FaCog, FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaExclamationTriangle, FaTimes, FaSave } from 'react-icons/fa'
import ProtectedRoute from '@/components/ProtectedRoute'
import type { SMSMessage, SMSTemplate, SMSAnalytics } from '@/types/sms'

// Optional: Install chart.js for analytics charts
// npm install chart.js react-chartjs-2
let Line: any, Doughnut: any, Bar: any, ChartJS: any
try {
  const chartImports = require('react-chartjs-2')
  const chartJSImports = require('chart.js')
  
  Line = chartImports.Line
  Doughnut = chartImports.Doughnut
  Bar = chartImports.Bar
  
  ChartJS = chartJSImports.Chart
  const {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  } = chartJSImports
  
  if (ChartJS) {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      ArcElement,
      Title,
      Tooltip,
      Legend,
      Filler
    )
  }
} catch (e) {
  console.log('📊 Chart.js not installed. Run: npm install chart.js react-chartjs-2')
}

type TabType = 'dashboard' | 'messages' | 'templates' | 'analytics' | 'settings'

export default function AdminSMSPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [messages, setMessages] = useState<SMSMessage[]>([])
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [analytics, setAnalytics] = useState<SMSAnalytics | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [settingsForm, setSettingsForm] = useState({
    provider: 'test',
    twilioSid: '',
    twilioToken: '',
    twilioPhone: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      if (activeTab === 'messages' || activeTab === 'dashboard') {
        const res = await fetch('/api/sms?limit=100')
        const data = await res.json()
        if (data.success) {
          setMessages(data.messages)
        }
      }

      if (activeTab === 'templates' || activeTab === 'dashboard') {
        const res = await fetch('/api/sms/templates')
        const data = await res.json()
        if (data.success) {
          setTemplates(data.templates)
        }
      }

      if (activeTab === 'analytics' || activeTab === 'dashboard') {
        const res = await fetch('/api/sms/analytics?period=week')
        const data = await res.json()
        if (data.success) {
          setAnalytics(data.analytics)
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const sendTestSMS = async (phoneNumber: string, templateId: string, variables: Record<string, any>) => {
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          templateId,
          variables,
          priority: 'normal'
        })
      })

      const data = await res.json()
      if (data.success) {
        showMessage('success', 'SMS sent successfully!')
        loadData()
      } else {
        showMessage('error', data.error || 'Failed to send SMS')
      }
    } catch (error) {
      showMessage('error', 'Failed to send SMS')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/sms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultProvider: settingsForm.provider,
          providers: {
            twilio: {
              accountSid: settingsForm.twilioSid,
              authToken: settingsForm.twilioToken,
              fromNumber: settingsForm.twilioPhone
            }
          }
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Settings saved successfully!')
      } else {
        showMessage('error', data.error || 'Failed to save settings')
      }
    } catch (error) {
      showMessage('error', 'Failed to save settings')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }
    
    try {
      const res = await fetch(`/api/sms?id=${messageId}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Message deleted successfully!')
        loadData()
      } else {
        showMessage('error', data.error || 'Failed to delete message')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete message')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />
      case 'failed':
        return <FaTimesCircle className="text-red-500" />
      case 'pending':
      case 'queued':
        return <FaClock className="text-yellow-500" />
      default:
        return <FaClock className="text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      queued: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-gray-100 text-gray-700'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.to.includes(searchTerm) || 
                         msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Dashboard Stats
  const dashboardStats = {
    totalSent: messages.filter(m => ['sent', 'delivered'].includes(m.status)).length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    failed: messages.filter(m => m.status === 'failed').length,
    pending: messages.filter(m => ['pending', 'queued'].includes(m.status)).length,
    deliveryRate: messages.length > 0 
      ? (messages.filter(m => m.status === 'delivered').length / messages.filter(m => ['sent', 'delivered'].includes(m.status)).length * 100).toFixed(1)
      : '0'
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <FaMobileAlt className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900">📱 SMS Notification System</h1>
                <p className="text-gray-600 text-lg">Manage SMS messages, templates, and analytics</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-lg"
            >
              <FaTimes className="text-xl" /> ย้อนกลับ
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
              { id: 'messages', label: 'Messages', icon: FaPaperPlane },
              { id: 'templates', label: 'Templates', icon: FaEnvelope },
              { id: 'analytics', label: 'Analytics', icon: FaChartLine },
              { id: 'settings', label: 'Settings', icon: FaCog }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <FaPaperPlane className="text-3xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total Sent</p>
                    <p className="text-4xl font-black">{dashboardStats.totalSent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <FaCheckCircle className="text-3xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Delivered</p>
                    <p className="text-4xl font-black">{dashboardStats.delivered}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <FaTimesCircle className="text-3xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Failed</p>
                    <p className="text-4xl font-black">{dashboardStats.failed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <FaClock className="text-3xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-4xl font-black">{dashboardStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <FaChartLine className="text-3xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Delivery Rate</p>
                    <p className="text-4xl font-black">{dashboardStats.deliveryRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {analytics && Line && Doughnut && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-black text-gray-900 mb-4">📈 SMS Timeline (7 Days)</h3>
                  <Line
                    data={{
                      labels: analytics.timeline.map(t => new Date(t.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })),
                      datasets: [
                        {
                          label: 'Sent',
                          data: analytics.timeline.map(t => t.sent),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'Delivered',
                          data: analytics.timeline.map(t => t.delivered),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'Failed',
                          data: analytics.timeline.map(t => t.failed),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                    height={250}
                  />
                </div>

                {/* Provider Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-black text-gray-900 mb-4">📊 By Provider</h3>
                  <Doughnut
                    data={{
                      labels: analytics.byProvider.map(p => p.provider.toUpperCase()),
                      datasets: [{
                        data: analytics.byProvider.map(p => p.sent),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ],
                        borderWidth: 0
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                    height={250}
                  />
                </div>
              </div>
            )}
            
            {/* Chart.js not installed notice */}
            {analytics && (!Line || !Doughnut) && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <FaExclamationTriangle className="text-3xl text-yellow-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900 mb-2">📊 Charts Not Available</h3>
                    <p className="text-yellow-800 mb-3">
                      Install Chart.js to see beautiful analytics charts:
                    </p>
                    <code className="block bg-yellow-100 text-yellow-900 px-4 py-2 rounded-lg font-mono text-sm">
                      npm install chart.js react-chartjs-2
                    </code>
                    <p className="text-yellow-700 text-sm mt-2">
                      Then restart your server: <strong>npm run dev</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-4">⚡ Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowSendModal(true)}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  <FaPaperPlane className="text-2xl" />
                  <div className="text-left">
                    <p className="font-bold">Send SMS</p>
                    <p className="text-sm opacity-90">Send a new message</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedTemplate(null)
                    setShowTemplateModal(true)
                  }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  <FaPlus className="text-2xl" />
                  <div className="text-left">
                    <p className="font-bold">New Template</p>
                    <p className="text-sm opacity-90">Create SMS template</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  <FaChartLine className="text-2xl" />
                  <div className="text-left">
                    <p className="font-bold">View Analytics</p>
                    <p className="text-sm opacity-90">Detailed reports</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-900">📨 Recent Messages</h3>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="text-purple-600 hover:text-purple-700 font-bold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {messages.slice(0, 5).map(msg => (
                  <div key={msg.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="text-2xl">{getStatusIcon(msg.status)}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{msg.to}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{msg.message}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(msg.status)}`}>
                        {msg.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by phone number or message..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white font-bold"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
                <button
                  onClick={() => setShowSendModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
                >
                  <FaPlus /> Send SMS
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-black">Status</th>
                      <th className="px-6 py-4 text-left font-black">To</th>
                      <th className="px-6 py-4 text-left font-black">Message</th>
                      <th className="px-6 py-4 text-left font-black">Provider</th>
                      <th className="px-6 py-4 text-left font-black">Sent At</th>
                      <th className="px-6 py-4 text-center font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMessages.map(msg => (
                      <tr key={msg.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(msg.status)}`}>
                            {getStatusIcon(msg.status)}
                            {msg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{msg.to}</p>
                          {msg.toName && <p className="text-sm text-gray-500">{msg.toName}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 line-clamp-2">{msg.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{msg.segmentCount} segment(s)</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {msg.provider.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {msg.sentAt ? formatDate(msg.sentAt) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                alert(`Message ID: ${msg.id}\nTo: ${msg.to}\nMessage: ${msg.message}\nStatus: ${msg.status}\nProvider: ${msg.provider}`)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Message"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900">📋 SMS Templates</h2>
              <button
                onClick={() => {
                  setSelectedTemplate(null)
                  setShowTemplateModal(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
              >
                <FaPlus /> Create Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template.id} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{template.name}</h3>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                        template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      {template.category}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg">
                      {template.content}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map(v => (
                        <span key={v} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-mono">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Sent</p>
                      <p className="font-bold text-blue-600">{template.totalSent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Delivered</p>
                      <p className="font-bold text-green-600">{template.totalDelivered}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Rate</p>
                      <p className="font-bold text-purple-600">{template.deliveryRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template)
                        setShowTemplateModal(true)
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template)
                        setShowSendModal(true)
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <FaPaperPlane /> Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">📊 SMS Analytics</h2>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-sm opacity-90 mb-2">Total Sent</p>
                <p className="text-4xl font-black">{analytics.overview.totalSent}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-sm opacity-90 mb-2">Delivered</p>
                <p className="text-4xl font-black">{analytics.overview.totalDelivered}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-sm opacity-90 mb-2">Failed</p>
                <p className="text-4xl font-black">{analytics.overview.totalFailed}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-sm opacity-90 mb-2">Success Rate</p>
                <p className="text-4xl font-black">{analytics.overview.deliveryRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Charts */}
            {Line && Doughnut && Bar && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-black text-gray-900 mb-4">📈 Timeline (Last 7 Days)</h3>
                  <Line
                    data={{
                      labels: analytics.timeline.map(t => new Date(t.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })),
                      datasets: [
                        {
                          label: 'Sent',
                          data: analytics.timeline.map(t => t.sent),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'Delivered',
                          data: analytics.timeline.map(t => t.delivered),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                    height={300}
                  />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-black text-gray-900 mb-4">📊 By Category</h3>
                  <Doughnut
                    data={{
                      labels: analytics.byCategory.map(c => c.category),
                      datasets: [{
                        data: analytics.byCategory.map(c => c.sent),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(236, 72, 153, 0.8)',
                          'rgba(249, 115, 22, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                    height={300}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">⚙️ SMS Settings</h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">SMS Provider Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Active Provider</label>
                  <select 
                    value={settingsForm.provider}
                    onChange={(e) => setSettingsForm({...settingsForm, provider: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white"
                  >
                    <option value="test">Test Provider</option>
                    <option value="twilio">Twilio</option>
                    <option value="thaibulksms">Thai Bulk SMS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Twilio Account SID</label>
                  <input
                    type="text"
                    value={settingsForm.twilioSid}
                    onChange={(e) => setSettingsForm({...settingsForm, twilioSid: e.target.value})}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Twilio Auth Token</label>
                  <input
                    type="password"
                    value={settingsForm.twilioToken}
                    onChange={(e) => setSettingsForm({...settingsForm, twilioToken: e.target.value})}
                    placeholder="••••••••••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">From Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.twilioPhone}
                    onChange={(e) => setSettingsForm({...settingsForm, twilioPhone: e.target.value})}
                    placeholder="+66812345678"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>

                <button 
                  onClick={handleSaveSettings}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                >
                  <FaSave className="inline mr-2" /> Save Settings
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <FaExclamationTriangle className="text-3xl text-yellow-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Important Notes</h3>
                  <ul className="list-disc list-inside space-y-2 text-yellow-800">
                    <li>Test provider is active by default and only logs messages</li>
                    <li>Configure Twilio credentials in environment variables for production</li>
                    <li>Ensure your Twilio account has sufficient credits</li>
                    <li>Follow Thai SMS regulations and opt-in requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send SMS Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900">📤 Send SMS</h3>
                  <button
                    onClick={() => {
                      setShowSendModal(false)
                      setSelectedTemplate(null)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const phoneNumber = formData.get('phoneNumber') as string
                const templateId = formData.get('templateId') as string || selectedTemplate?.id
                const message = formData.get('message') as string
                
                if (templateId) {
                  // Get template variables
                  const template = templates.find(t => t.id === templateId)
                  const variables: Record<string, any> = {}
                  
                  template?.variables.forEach(v => {
                    variables[v] = formData.get(`var_${v}`) as string
                  })
                  
                  await sendTestSMS(phoneNumber, templateId, variables)
                } else if (message) {
                  // Send custom message
                  try {
                    const res = await fetch('/api/sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: phoneNumber,
                        message,
                        priority: 'normal'
                      })
                    })
                    const data = await res.json()
                    if (data.success) {
                      showMessage('success', 'SMS sent successfully!')
                      setShowSendModal(false)
                      loadData()
                    } else {
                      showMessage('error', data.error || 'Failed to send SMS')
                    }
                  } catch (error) {
                    showMessage('error', 'Failed to send SMS')
                  }
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="+66812345678"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>

                {selectedTemplate ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Template</label>
                    <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <p className="font-bold text-purple-900">{selectedTemplate.name}</p>
                      <p className="text-sm text-purple-700 mt-2">{selectedTemplate.content}</p>
                    </div>
                    
                    <input type="hidden" name="templateId" value={selectedTemplate.id} />
                    
                    {selectedTemplate.variables.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-bold text-gray-700">Template Variables:</p>
                        {selectedTemplate.variables.map(v => (
                          <div key={v}>
                            <label className="block text-sm text-gray-600 mb-1">{v}</label>
                            <input
                              type="text"
                              name={`var_${v}`}
                              placeholder={`Enter ${v}`}
                              required
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Or Select Template</label>
                      <select
                        name="templateId"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white"
                        onChange={(e) => {
                          const template = templates.find(t => t.id === e.target.value)
                          if (template) setSelectedTemplate(template)
                        }}
                      >
                        <option value="">Custom Message</option>
                        {templates.filter(t => t.isActive).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                      <textarea
                        name="message"
                        rows={4}
                        placeholder="Enter your message..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSendModal(false)
                      setSelectedTemplate(null)
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FaPaperPlane /> Send SMS
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900">
                    {selectedTemplate ? '✏️ Edit Template' : '➕ Create Template'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowTemplateModal(false)
                      setSelectedTemplate(null)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                
                const templateData = {
                  id: selectedTemplate?.id || `tpl_${Date.now()}`,
                  name: formData.get('name') as string,
                  category: formData.get('category') as any,
                  subject: formData.get('subject') as string,
                  content: formData.get('content') as string,
                  variables: (formData.get('variables') as string).split(',').map(v => v.trim()).filter(v => v),
                  provider: formData.get('provider') as any,
                  isActive: formData.get('isActive') === 'true',
                  language: 'th' as const,
                  sendImmediately: true,
                  sendOnWeekdays: true,
                  sendOnWeekends: true,
                  totalSent: selectedTemplate?.totalSent || 0,
                  totalDelivered: selectedTemplate?.totalDelivered || 0,
                  totalFailed: selectedTemplate?.totalFailed || 0,
                  deliveryRate: selectedTemplate?.deliveryRate || 0,
                  createdAt: selectedTemplate?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }

                try {
                  const res = await fetch('/api/sms/templates', {
                    method: selectedTemplate ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(templateData)
                  })

                  const data = await res.json()
                  if (data.success) {
                    showMessage('success', `Template ${selectedTemplate ? 'updated' : 'created'} successfully!`)
                    setShowTemplateModal(false)
                    setSelectedTemplate(null)
                    loadData()
                  } else {
                    showMessage('error', data.error || 'Failed to save template')
                  }
                } catch (error) {
                  showMessage('error', 'Failed to save template')
                }
              }} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedTemplate?.name}
                      required
                      placeholder="e.g., Booking Confirmation"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      defaultValue={selectedTemplate?.category}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white"
                    >
                      <option value="booking">Booking</option>
                      <option value="payment">Payment</option>
                      <option value="reminder">Reminder</option>
                      <option value="marketing">Marketing</option>
                      <option value="notification">Notification</option>
                      <option value="verification">Verification</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    defaultValue={selectedTemplate?.subject}
                    required
                    placeholder="e.g., Your booking is confirmed"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message Content</label>
                  <textarea
                    name="content"
                    defaultValue={selectedTemplate?.content}
                    required
                    rows={4}
                    placeholder="Use {{variable}} for dynamic content, e.g., Hello {{customerName}}"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{{variableName}}`} syntax for dynamic content
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Variables (comma-separated)</label>
                  <input
                    type="text"
                    name="variables"
                    defaultValue={selectedTemplate?.variables.join(', ')}
                    placeholder="e.g., customerName, bookingId, amount"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Provider</label>
                    <select
                      name="provider"
                      defaultValue={selectedTemplate?.provider || 'test'}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white"
                    >
                      <option value="test">Test</option>
                      <option value="twilio">Twilio</option>
                      <option value="thaibulksms">Thai Bulk SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      name="isActive"
                      defaultValue={selectedTemplate?.isActive ? 'true' : 'false'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false)
                      setSelectedTemplate(null)
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FaSave /> {selectedTemplate ? 'Update' : 'Create'} Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Message Notifications */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaExclamationTriangle className="text-2xl" />}
            <p className="font-bold">{message.text}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
    </ProtectedRoute>
  )
}
