'use client'

import { ReactNode } from 'react'

interface PoolCardProps {
  children: ReactNode
  variant?: 'default' | 'gradient' | 'glass' | 'tropical'
  hover?: boolean
  className?: string
  onClick?: () => void
}

export default function PoolCard({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick,
}: PoolCardProps) {
  
  const variantClasses = {
    default: 'bg-white border-2 border-pool-light shadow-lg',
    gradient: 'bg-gradient-to-br from-white via-pool-light/20 to-sand-100 border-2 border-pool-accent/30 shadow-pool',
    glass: 'bg-white/70 backdrop-blur-xl border border-white/30 shadow-float',
    tropical: 'bg-gradient-to-br from-tropical-green/10 via-white to-tropical-mint/10 border-2 border-tropical-mint/30 shadow-tropical',
  }
  
  const hoverClasses = hover
    ? 'hover:scale-[1.02] hover:shadow-pool-lg hover:-translate-y-2 cursor-pointer'
    : ''
  
  return (
    <div
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${hoverClasses}
        rounded-3xl
        p-6
        transition-all duration-500 ease-out
        relative overflow-hidden
        ${className}
      `}
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pool-light/20 to-transparent rounded-bl-[100%] -z-0" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-tropical-mint/20 to-transparent rounded-tr-[100%] -z-0" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
