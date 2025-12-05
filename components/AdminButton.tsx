import React from 'react'

interface AdminButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'luxury'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: React.ReactNode
  loading?: boolean
  className?: string
}

export default function AdminButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  icon,
  loading = false,
  className = '',
}: AdminButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-r from-pool-blue to-pool-dark text-white hover:shadow-pool focus:ring-pool-light/50',
    success: 'bg-gradient-to-r from-tropical-green to-tropical-lime text-white hover:shadow-tropical focus:ring-tropical-mint/50',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg focus:ring-red-300',
    warning: 'bg-gradient-to-r from-tropical-orange to-tropical-yellow text-white hover:shadow-sunset focus:ring-tropical-yellow/50',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg focus:ring-blue-300',
    luxury: 'bg-gradient-to-r from-luxury-gold to-luxury-bronze text-white hover:shadow-luxury focus:ring-luxury-gold/50',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} ${!disabled && !loading ? 'hover:scale-105' : ''}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>กำลังดำเนินการ...</span>
        </>
      ) : (
        <>
          {icon && <span className="text-xl">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}
