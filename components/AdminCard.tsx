import React from 'react'

interface AdminCardProps {
  children: React.ReactNode
  variant?: 'default' | 'gradient' | 'glass' | 'luxury'
  hover?: boolean
  className?: string
  onClick?: () => void
}

export default function AdminCard({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick,
}: AdminCardProps) {
  const baseClasses = 'rounded-2xl p-6 transition-all duration-300'
  
  const variants = {
    default: 'bg-white border-2 border-gray-200 shadow-md hover:shadow-xl',
    gradient: 'bg-gradient-to-br from-pool-blue to-pool-dark text-white shadow-pool',
    glass: 'bg-white/80 backdrop-blur-xl border-2 border-white/50 shadow-pool',
    luxury: 'bg-gradient-to-br from-luxury-gold to-luxury-bronze text-white shadow-luxury',
  }

  const hoverClasses = hover ? 'hover:scale-105 hover:-translate-y-1' : ''
  const cursorClass = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
