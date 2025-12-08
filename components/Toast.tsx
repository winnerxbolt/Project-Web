'use client'

import { useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-500',
          icon: <FaCheckCircle className="text-2xl" />,
          border: 'border-green-300/30'
        }
      case 'error':
        return {
          bg: 'from-red-500 to-pink-500',
          icon: <FaExclamationCircle className="text-2xl" />,
          border: 'border-red-300/30'
        }
      case 'warning':
        return {
          bg: 'from-orange-500 to-yellow-500',
          icon: <FaExclamationTriangle className="text-2xl" />,
          border: 'border-orange-300/30'
        }
      default:
        return {
          bg: 'from-blue-500 to-purple-500',
          icon: <FaInfoCircle className="text-2xl" />,
          border: 'border-blue-300/30'
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`fixed top-4 right-4 z-[10000] animate-slide-in-right`}
      style={{
        animation: 'slideInRight 0.3s ease-out forwards'
      }}
    >
      <div className={`bg-gradient-to-r ${styles.bg} text-white rounded-2xl shadow-2xl border-2 ${styles.border} backdrop-blur-xl overflow-hidden min-w-[320px] max-w-[500px]`}>
        <div className="flex items-center gap-4 p-5">
          <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
            {styles.icon}
          </div>
          <p className="flex-1 font-semibold text-lg leading-snug pr-2">
            {message}
          </p>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90 duration-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/80"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
