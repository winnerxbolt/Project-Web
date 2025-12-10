'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  FaEnvelope, FaUsers, FaFileAlt, FaChartLine, FaPaperPlane, 
  FaPlus, FaEdit, FaTrash, FaEye, FaClock, FaCheckCircle,
  FaTimes, FaSearch, FaFilter, FaCopy, FaDownload, FaUpload, FaArrowLeft
} from 'react-icons/fa'
import { EmailCampaign, EmailTemplate, EmailSubscriber } from '@/types/email'

type TabType = 'campaigns' | 'templates' | 'subscribers' | 'stats'

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns')
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([])
  const [subscriberStats, setSubscriberStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSubscriberModal, setShowSubscriberModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'campaigns') {
        const res = await fetch('/api/email/campaigns')
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      } else if (activeTab === 'templates') {
        const res = await fetch('/api/email/templates')
        const data = await res.json()
        setTemplates(data.templates || [])
      } else if (activeTab === 'subscribers') {
        const res = await fetch('/api/email/subscribers')
        const data = await res.json()
        setSubscribers(data.subscribers || [])
        setSubscriberStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendCampaign = async (campaignId: string, testEmail?: string) => {
    if (!testEmail && !confirm('คุณแน่ใจหรือไม่ที่จะส่ง Campaign นี้?')) return

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, testEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        const message = testEmail 
          ? 'ส่ง Test Email สำเร็จ!' 
          : `✅ ส่งสำเร็จ!\n\nส่งได้: ${data.stats.sent} อีเมล\n${data.stats.failed > 0 ? `ส่งไม่สำเร็จ: ${data.stats.failed} อีเมล` : ''}`
        alert(message)
        loadData()
      } else {
        // Show detailed error message
        let errorMsg = `❌ ${data.error}`
        if (data.details) {
          if (typeof data.details === 'object' && 'totalSubscribers' in data.details) {
            errorMsg += `\n\n📊 สถิติ:\n- Subscribers ทั้งหมด: ${data.details.totalSubscribers}\n- Active Subscribers: ${data.details.activeSubscribers}\n- ประเภทผู้รับ: ${data.details.recipientType}`
            errorMsg += '\n\n💡 โปรดเพิ่ม Subscribers ก่อนส่ง Campaign'
          } else {
            errorMsg += `\n\nรายละเอียด: ${data.details}`
          }
        }
        alert(errorMsg)
      }
    } catch (error: any) {
      alert('❌ เกิดข้อผิดพลาดในการส่งอีเมล\n\n' + (error.message || 'กรุณาลองใหม่อีกครั้ง'))
    }
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Campaign นี้?')) return

    try {
      const res = await fetch(`/api/email/campaigns?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        alert('ลบสำเร็จ')
        loadData()
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Template นี้?')) return

    try {
      const res = await fetch(`/api/email/templates?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        alert('ลบสำเร็จ')
        loadData()
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกนี้?')) return

    try {
      const res = await fetch(`/api/email/subscribers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        alert('ลบสำเร็จ')
        loadData()
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
      unsubscribed: 'bg-red-100 text-red-800',
      bounced: 'bg-orange-100 text-orange-800',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <a
                href="/admin"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-xl transition-all shadow-lg hover:scale-105"
              >
                <FaArrowLeft className="text-xl" />
              </a>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  📧 Email Marketing
                </h1>
                <p className="text-gray-600">
                  จัดการ Campaigns, Templates และ Subscribers
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <FaPaperPlane className="text-3xl text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'sent').length}
                </span>
              </div>
              <p className="text-gray-600">Campaigns ที่ส่งแล้ว</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <FaFileAlt className="text-3xl text-pink-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.status === 'active').length}
                </span>
              </div>
              <p className="text-gray-600">Templates ที่ใช้งาน</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <FaUsers className="text-3xl text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {subscriberStats?.active || 0}
                </span>
              </div>
              <p className="text-gray-600">Subscribers</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <FaChartLine className="text-3xl text-green-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((acc, c) => acc + c.stats.opened, 0)}
                </span>
              </div>
              <p className="text-gray-600">Total Opens</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              {[
                { id: 'campaigns', label: 'Campaigns', icon: FaPaperPlane },
                { id: 'templates', label: 'Templates', icon: FaFileAlt },
                { id: 'subscribers', label: 'Subscribers', icon: FaUsers },
                { id: 'stats', label: 'Statistics', icon: FaChartLine },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Search and Filter Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`ค้นหา ${activeTab}...`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {activeTab === 'campaigns' && (
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    สร้าง Campaign
                  </button>
                )}
                
                {activeTab === 'templates' && (
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    สร้าง Template
                  </button>
                )}
                
                {activeTab === 'subscribers' && (
                  <button
                    onClick={() => setShowSubscriberModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    เพิ่ม Subscriber
                  </button>
                )}
              </div>

              {/* Content */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">กำลังโหลด...</p>
                </div>
              ) : (
                <>
                  {/* Campaigns Tab */}
                  {activeTab === 'campaigns' && (
                    <div className="space-y-4">
                      {campaigns.length === 0 ? (
                        <div className="text-center py-12">
                          <FaPaperPlane className="text-6xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">ยังไม่มี Campaign</p>
                          <button
                            onClick={() => setShowCampaignModal(true)}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                          >
                            สร้าง Campaign แรก
                          </button>
                        </div>
                      ) : (
                        campaigns.map((campaign) => (
                          <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                                  {getStatusBadge(campaign.status)}
                                </div>
                                <p className="text-gray-600 mb-2">{campaign.subject}</p>
                                <p className="text-sm text-gray-500">
                                  Recipients: {campaign.recipients.totalCount} | 
                                  Created: {new Date(campaign.createdAt).toLocaleDateString('th-TH')}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                {campaign.status === 'draft' && (
                                  <button
                                    onClick={() => sendCampaign(campaign.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                    title="ส่ง Campaign"
                                  >
                                    <FaPaperPlane />
                                  </button>
                                )}
                                <button
                                  onClick={() => sendCampaign(campaign.id, prompt('Test Email:') || undefined)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="ส่ง Test Email"
                                >
                                  <FaEnvelope />
                                </button>
                                <button
                                  onClick={() => deleteCampaign(campaign.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="ลบ"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                              <div>
                                <p className="text-sm text-gray-500">Sent</p>
                                <p className="text-lg font-bold text-gray-900">{campaign.stats.sent}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Delivered</p>
                                <p className="text-lg font-bold text-green-600">{campaign.stats.delivered}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Opened</p>
                                <p className="text-lg font-bold text-blue-600">{campaign.stats.opened}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Clicked</p>
                                <p className="text-lg font-bold text-purple-600">{campaign.stats.clicked}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Templates Tab */}
                  {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templates.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">ยังไม่มี Template</p>
                          <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                          >
                            สร้าง Template แรก
                          </button>
                        </div>
                      ) : (
                        templates.map((template) => (
                          <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                                {getStatusBadge(template.status)}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setShowTemplateModal(true)
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="แก้ไข"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => deleteTemplate(template.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="ลบ"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                            <p className="text-xs text-gray-500 mb-4">
                              Type: {template.type} | Used: {template.usageCount} times
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((v) => (
                                <span key={v} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                  {'{{'}{v}{'}}'}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Subscribers Tab */}
                  {activeTab === 'subscribers' && (
                    <div>
                      {/* Stats Summary */}
                      {subscriberStats && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600">Active</p>
                            <p className="text-2xl font-bold text-green-900">{subscriberStats.active}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-sm text-red-600">Unsubscribed</p>
                            <p className="text-2xl font-bold text-red-900">{subscriberStats.unsubscribed}</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4">
                            <p className="text-sm text-orange-600">Bounced</p>
                            <p className="text-2xl font-bold text-orange-900">{subscriberStats.bounced}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600">Total</p>
                            <p className="text-2xl font-bold text-blue-900">{subscriberStats.total}</p>
                          </div>
                        </div>
                      )}

                      {/* Subscribers Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tags</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Subscribed</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {subscribers.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                  ยังไม่มี Subscribers
                                </td>
                              </tr>
                            ) : (
                              subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{sub.email}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{sub.name || '-'}</td>
                                  <td className="px-4 py-3 text-sm">{getStatusBadge(sub.status)}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {sub.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {new Date(sub.subscribedAt).toLocaleDateString('th-TH')}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => deleteSubscriber(sub.id)}
                                      className="text-red-600 hover:text-red-800"
                                      title="ลบ"
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && (
                    <div className="space-y-6">
                      <div className="text-center py-12">
                        <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Marketing Statistics</h3>
                        <p className="text-gray-600">
                          รายงานและสถิติโดยละเอียดจะแสดงที่นี่
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">สร้าง Campaign ใหม่</h3>
              <button
                onClick={() => {
                  setShowCampaignModal(false)
                  setSelectedCampaign(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              const campaignData = {
                name: formData.get('name'),
                subject: formData.get('subject'),
                templateId: formData.get('templateId'),
                type: 'immediate',
                recipients: {
                  type: formData.get('recipientType'),
                  tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()) : [],
                  customEmails: formData.get('customEmails') ? (formData.get('customEmails') as string).split(',').map(e => e.trim()) : [],
                },
              }

              try {
                const res = await fetch('/api/email/campaigns', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(campaignData),
                })

                if (res.ok) {
                  alert('สร้าง Campaign สำเร็จ!')
                  setShowCampaignModal(false)
                  loadData()
                } else {
                  const data = await res.json()
                  alert(`Error: ${data.error}`)
                }
              } catch (error) {
                alert('เกิดข้อผิดพลาด')
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อ Campaign *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="เช่น: Newsletter ประจำเดือน"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หัวข้ออีเมล *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="เช่น: 🎉 โปรโมชั่นพิเศษเฉพาะคุณ!"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template *
                </label>
                <select
                  name="templateId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="">เลือก Template</option>
                  {templates.filter(t => t.status === 'active').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ผู้รับ *
                </label>
                <select
                  name="recipientType"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="segment">ตาม Tags</option>
                  <option value="custom">กำหนดเอง</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (คั่นด้วย comma)
                </label>
                <input
                  type="text"
                  name="tags"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="เช่น: vip, newsletter"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมลกำหนดเอง (คั่นด้วย comma)
                </label>
                <textarea
                  name="customEmails"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  สร้าง Campaign
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCampaignModal(false)
                    setSelectedCampaign(null)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedTemplate ? 'แก้ไข Template' : 'สร้าง Template ใหม่'}
              </h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setSelectedTemplate(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              const templateData = {
                id: selectedTemplate?.id,
                name: formData.get('name'),
                subject: formData.get('subject'),
                previewText: formData.get('previewText'),
                type: formData.get('type') || 'custom',
                category: 'marketing',
                htmlContent: formData.get('htmlContent'),
                textContent: formData.get('textContent'),
                variables: (formData.get('variables') as string || '').split(',').map(v => v.trim()).filter(Boolean),
              }

              try {
                const url = selectedTemplate ? '/api/email/templates' : '/api/email/templates'
                const method = selectedTemplate ? 'PATCH' : 'POST'
                
                const res = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(templateData),
                })

                if (res.ok) {
                  alert(selectedTemplate ? 'แก้ไข Template สำเร็จ!' : 'สร้าง Template สำเร็จ!')
                  setShowTemplateModal(false)
                  setSelectedTemplate(null)
                  loadData()
                } else {
                  const data = await res.json()
                  alert(`Error: ${data.error}`)
                }
              } catch (error) {
                alert('เกิดข้อผิดพลาด')
              }
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อ Template *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedTemplate?.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                    placeholder="เช่น: Newsletter มาตรฐาน"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ประเภท
                  </label>
                  <select
                    name="type"
                    defaultValue={selectedTemplate?.type || 'custom'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  >
                    <option value="newsletter">Newsletter</option>
                    <option value="promotion">Promotion</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หัวข้ออีเมล *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  defaultValue={selectedTemplate?.subject}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="เช่น: สวัสดี {{customer_name}}!"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ข้อความแสดงก่อนเปิด
                </label>
                <input
                  type="text"
                  name="previewText"
                  defaultValue={selectedTemplate?.previewText}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="ข้อความที่แสดงใน inbox"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เนื้อหา HTML *
                </label>
                <textarea
                  name="htmlContent"
                  required
                  rows={10}
                  defaultValue={selectedTemplate?.htmlContent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm text-gray-900 placeholder:text-gray-500"
                  placeholder="<html><body><h1>สวัสดี {{customer_name}}</h1></body></html>"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เนื้อหา Text (ไม่บังคับ)
                </label>
                <textarea
                  name="textContent"
                  rows={4}
                  defaultValue={selectedTemplate?.textContent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="เวอร์ชัน plain text"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ตัวแปร (คั่นด้วย comma)
                </label>
                <input
                  type="text"
                  name="variables"
                  defaultValue={selectedTemplate?.variables.join(', ')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="customer_name, discount, coupon_code"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ใช้ใน template เป็น {'{{'} variable_name {'}}'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  {selectedTemplate ? 'บันทึกการแก้ไข' : 'สร้าง Template'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplateModal(false)
                    setSelectedTemplate(null)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriber Modal */}
      {showSubscriberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">เพิ่ม Subscriber</h3>
              <button
                onClick={() => setShowSubscriberModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              const subscriberData = {
                email: formData.get('email'),
                name: formData.get('name'),
                phone: formData.get('phone'),
                tags: (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean),
                source: 'manual',
              }

              try {
                const res = await fetch('/api/email/subscribers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(subscriberData),
                })

                if (res.ok) {
                  alert('เพิ่ม Subscriber สำเร็จ!')
                  setShowSubscriberModal(false)
                  loadData()
                } else {
                  const data = await res.json()
                  alert(`Error: ${data.error}`)
                }
              } catch (error) {
                alert('เกิดข้อผิดพลาด')
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมล *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="ชื่อผู้สมัคร"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทร
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="081-234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (คั่นด้วย comma)
                </label>
                <input
                  type="text"
                  name="tags"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
                  placeholder="newsletter, vip"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  เพิ่ม Subscriber
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubscriberModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
