'use client'

import { ReactNode } from 'react'

interface PoolButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'tropical' | 'sunset' | 'luxury' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  icon?: ReactNode
}

export default function PoolButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon,
}: PoolButtonProps) {
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-pool-blue via-pool-accent to-pool-dark text-white shadow-pool hover:shadow-pool-lg hover:scale-105',
    tropical: 'bg-gradient-to-r from-tropical-green via-tropical-mint to-tropical-lime text-white shadow-tropical hover:shadow-pool-lg hover:scale-105',
    sunset: 'bg-gradient-to-r from-tropical-orange via-tropical-yellow to-luxury-gold text-white shadow-sunset hover:shadow-pool-lg hover:scale-105',
    luxury: 'bg-gradient-to-r from-luxury-gold via-luxury-rose to-luxury-gold text-gray-900 shadow-luxury hover:shadow-pool-lg hover:scale-105 font-semibold',
    ghost: 'bg-white/90 backdrop-blur-sm text-pool-dark border-2 border-pool-accent hover:bg-pool-light/50 hover:border-pool-dark',
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-10 py-5 text-xl rounded-3xl',
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-300 ease-out
        font-medium
        flex items-center justify-center gap-3
        group
        ${className}
      `}
    >
      {/* Ripple Effect */}
      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Shimmer Effect */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer" />
      
      {/* Icon */}
      {icon && (
        <span className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
          {icon}
        </span>
      )}
      
      {/* Text */}
      <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
        {children}
      </span>
    </button>
  )
}
