'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import DynamicPricingToggle from '@/components/DynamicPricingToggle'
import {
  FaChartLine, FaFire, FaCalendarAlt, FaCog,
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaRocket,
  FaArrowUp, FaDollarSign, FaPercent, FaArrowLeft
} from 'react-icons/fa'
import { DynamicPricingRule, DemandPricing } from '@/types/dynamic-pricing'

export default function DynamicPricingAdmin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'demand' | 'analytics'>('overview')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Data states
  const [rules, setRules] = useState<DynamicPricingRule[]>([])
  const [demandPricing, setDemandPricing] = useState<DemandPricing[]>([])
  
  // New rule form
  const [newRule, setNewRule] = useState({
    name: '',
    nameTh: '',
    type: 'demand' as const,
    strategy: 'percentage' as const,
    value: 0,
    priority: 5,
    description: '',
    startDate: '',
    endDate: ''
  })
  
  // Stats
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    avgPriceIncrease: 0,
    revenueImpact: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rulesRes, demandRes] = await Promise.all([
        fetch('/api/dynamic-pricing'),
        fetch('/api/demand-pricing')
      ])

      const rulesData = await rulesRes.json()
      const demandData = await demandRes.json()

      setRules(rulesData.rules || [])
      setDemandPricing(demandData.levels || [])

      // Calculate stats
      const activeRules = rulesData.rules?.filter((r: DynamicPricingRule) => r.isActive) || []
      setStats({
        totalRules: rulesData.rules?.length || 0,
        activeRules: activeRules.length,
        avgPriceIncrease: 15.5,
        revenueImpact: 125000
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await fetch('/api/dynamic-pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, isActive: !isActive })
      })
      loadData()
    } catch (error) {
      console.error('Error toggling rule:', error)
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('คุณต้องการลบกฎนี้หรือไม่?')) return
    
    try {
      await fetch(`/api/dynamic-pricing?id=${ruleId}`, { method: 'DELETE' })
      loadData()
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  const createRule = async () => {
    try {
      const response = await fetch('/api/dynamic-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          id: `rule-${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setNewRule({
          name: '',
          nameTh: '',
          type: 'demand',
          strategy: 'percentage',
          value: 0,
          priority: 5,
          description: '',
          startDate: '',
          endDate: ''
        })
        loadData()
      }
    } catch (error) {
      console.error('Error creating rule:', error)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <a
                    href="/admin"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white p-3 rounded-xl transition-all border border-white/30 hover:scale-105"
                  >
                    <FaArrowLeft className="text-xl" />
                  </a>
                  <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                      <FaRocket className="text-5xl animate-pulse" />
                      Dynamic Pricing System
                    </h1>
                    <p className="text-purple-100 text-lg">ระบบปรับราคาอัตโนมัติ - เพิ่มรายได้สูงสุด</p>
                  </div>
                </div>
                
                {/* เปิด-ปิด Dynamic Pricing */}
                <DynamicPricingToggle />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 rounded-lg p-3">
                      <FaChartLine className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-100">Total Rules</p>
                      <p className="text-2xl font-bold text-white">{stats.totalRules}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-lg p-3">
                      <FaFire className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-100">Active Rules</p>
                      <p className="text-2xl font-bold text-white">{stats.activeRules}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 rounded-lg p-3">
                      <FaArrowUp className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-100">Avg Increase</p>
                      <p className="text-2xl font-bold text-white">+{stats.avgPriceIncrease}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-500 rounded-lg p-3">
                      <FaDollarSign className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-100">Revenue Impact</p>
                      <p className="text-2xl font-bold text-white">{(stats.revenueImpact / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaChartLine />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'rules'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaCog />
                Pricing Rules
              </button>
              <button
                onClick={() => setActiveTab('demand')}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'demand'
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaFire />
                Demand Pricing
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaArrowUp />
                Analytics
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FaRocket className="text-blue-600" />
                          ระบบทำงานอย่างไร?
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-3xl mb-2">📊</div>
                            <h4 className="font-bold text-gray-900 mb-1">1. วิเคราะห์ Demand</h4>
                            <p className="text-sm text-gray-600">ระบบวิเคราะห์ความต้องการจากการจองและการค้นหา</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-3xl mb-2">⚡</div>
                            <h4 className="font-bold text-gray-900 mb-1">2. คำนวณราคา Real-time</h4>
                            <p className="text-sm text-gray-600">ปรับราคาอัตโนมัติตาม demand, วันหยุด, และฤดูกาล</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-3xl mb-2">💰</div>
                            <h4 className="font-bold text-gray-900 mb-1">3. เพิ่มรายได้</h4>
                            <p className="text-sm text-gray-600">เพิ่ม occupancy rate และรายได้โดยรวม</p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setActiveTab('rules')}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-4 shadow-lg"
                        >
                          <FaPlus className="text-3xl" />
                          <div className="text-left">
                            <h4 className="font-bold text-lg">สร้างกฎใหม่</h4>
                            <p className="text-sm text-purple-100">เพิ่มกฎการปรับราคาใหม่</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6 hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-4 shadow-lg"
                        >
                          <FaArrowUp className="text-3xl" />
                          <div className="text-left">
                            <h4 className="font-bold text-lg">ดู Analytics</h4>
                            <p className="text-sm text-blue-100">วิเคราะห์ผลการดำเนินงาน</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rules Tab */}
                  {activeTab === 'rules' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Pricing Rules</h3>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold flex items-center gap-2 shadow-lg"
                        >
                          <FaPlus />
                          สร้างกฎใหม่
                        </button>
                      </div>

                      {rules.length === 0 ? (
                        <div className="text-center py-20">
                          <FaCog className="text-6xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">ยังไม่มีกฎ Pricing</p>
                          <p className="text-gray-400">เริ่มสร้างกฎแรกของคุณเลย!</p>
                        </div>
                      ) : (
                        rules.map((rule) => (
                          <div
                            key={rule.id}
                            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-xl font-bold text-gray-900">{rule.nameTh || rule.name}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    rule.type === 'demand' ? 'bg-red-100 text-red-700' :
                                    rule.type === 'seasonal' ? 'bg-green-100 text-green-700' :
                                    rule.type === 'weekend' ? 'bg-blue-100 text-blue-700' :
                                    rule.type === 'early_bird' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {rule.type}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    rule.priority >= 8 ? 'bg-red-500 text-white' :
                                    rule.priority >= 5 ? 'bg-orange-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    Priority {rule.priority}
                                  </span>
                                </div>
                                
                                <p className="text-gray-600 mb-3">{rule.description}</p>
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <FaPercent className="text-purple-600" />
                                    <span className="font-semibold">
                                      {rule.strategy === 'percentage' ? `${rule.value}%` :
                                       rule.strategy === 'multiplier' ? `x${rule.value}` :
                                       `฿${rule.value}`}
                                    </span>
                                  </div>
                                  {rule.startDate && (
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <FaCalendarAlt />
                                      <span>{new Date(rule.startDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleRule(rule.id, rule.isActive)}
                                  className={`p-2 rounded-lg transition-all ${
                                    rule.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                                >
                                  {rule.isActive ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                                </button>
                                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => deleteRule(rule.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Demand Tab */}
                  {activeTab === 'demand' && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Demand-Based Pricing</h3>
                      
                      {demandPricing.map((demand) => (
                        <div
                          key={demand.id}
                          className="rounded-xl p-6 border-2 transform hover:scale-[1.02] transition-all"
                          style={{ 
                            backgroundColor: `${demand.color}10`,
                            borderColor: demand.color
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-5xl">{demand.icon}</div>
                              <div>
                                <h4 className="text-xl font-bold text-gray-900">{demand.name}</h4>
                                <p className="text-gray-600">{demand.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-sm font-semibold" style={{ color: demand.color }}>
                                    Multiplier: x{demand.multiplier}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Booking Rate: ≥{demand.thresholds.bookingRate}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold" style={{ color: demand.color }}>
                                {demand.multiplier > 1 ? '+' : ''}{((demand.multiplier - 1) * 100).toFixed(0)}%
                              </div>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                                demand.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {demand.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Analytics Tab */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      <div className="text-center py-20">
                        <FaArrowUp className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Analytics Dashboard</p>
                        <p className="text-gray-400">Coming Soon - Real-time analytics and insights</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Create Rule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">สร้างกฎ Pricing ใหม่</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อกฎ (EN)</label>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                      placeholder="e.g., High Demand Pricing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อกฎ (TH)</label>
                    <input
                      type="text"
                      value={newRule.nameTh}
                      onChange={(e) => setNewRule({ ...newRule, nameTh: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                      placeholder="เช่น ราคาช่วง Demand สูง"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                  <textarea
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    rows={3}
                    placeholder="อธิบายกฎนี้..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภท</label>
                    <select
                      value={newRule.type}
                      onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    >
                      <option value="demand">Demand</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="weekend">Weekend</option>
                      <option value="holiday">Holiday</option>
                      <option value="early_bird">Early Bird</option>
                      <option value="last_minute">Last Minute</option>
                      <option value="group_size">Group Size</option>
                      <option value="time_based">Time Based</option>
                      <option value="occupancy">Occupancy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Strategy</label>
                    <select
                      value={newRule.strategy}
                      onChange={(e) => setNewRule({ ...newRule, strategy: e.target.value as any })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="multiplier">Multiplier (x)</option>
                      <option value="fixed_amount">Fixed Amount (฿)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Value</label>
                    <input
                      type="number"
                      value={newRule.value}
                      onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Low (1)</span>
                    <span className="font-bold text-purple-600">Current: {newRule.priority}</span>
                    <span>High (10)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={newRule.startDate}
                      onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={newRule.endDate}
                      onChange={(e) => setNewRule({ ...newRule, endDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={createRule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
                >
                  สร้างกฎ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
