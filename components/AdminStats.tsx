import React from 'react'

interface AdminStatsProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient?: string
  isLoading?: boolean
}

export default function AdminStats({
  icon,
  label,
  value,
  trend,
  gradient = 'from-pool-blue to-pool-dark',
  isLoading = false,
}: AdminStatsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
      {/* Icon with gradient background */}
      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-3xl text-white">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className={`text-4xl font-black text-gray-800 mb-2 ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? '...' : value}
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-gray-600 mb-2">
        {label}
      </div>

      {/* Trend indicator */}
      {trend && !isLoading && (
        <div className={`inline-flex items-center gap-1 text-sm font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  )
}
