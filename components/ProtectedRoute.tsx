'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (!isLoading && user && requireAdmin && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, isLoading, requireAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ocean-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">กำลังตรวจสอบ...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
