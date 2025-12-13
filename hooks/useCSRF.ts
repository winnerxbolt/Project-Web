'use client'

import { useEffect, useState } from 'react'

let csrfToken: string | null = null

/**
 * Hook สำหรับดึง CSRF token
 */
export function useCSRF() {
  const [token, setToken] = useState<string | null>(csrfToken)
  const [loading, setLoading] = useState(!csrfToken)

  useEffect(() => {
    if (csrfToken) {
      setToken(csrfToken)
      setLoading(false)
      return
    }

    const fetchToken = async () => {
      try {
        const res = await fetch('/api/auth/csrf', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (res.ok) {
          const data = await res.json()
          csrfToken = data.csrfToken
          setToken(data.csrfToken)
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, loading }
}

/**
 * ฟังก์ชันสำหรับเรียก API พร้อม CSRF protection
 */
export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
  // ถ้ายังไม่มี CSRF token ให้ดึงมาก่อน
  if (!csrfToken) {
    const res = await fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include'
    })
    
    if (res.ok) {
      const data = await res.json()
      csrfToken = data.csrfToken
    }
  }

  // เพิ่ม CSRF token ใน headers
  const headers = new Headers(options.headers || {})
  if (csrfToken && options.method && options.method !== 'GET') {
    headers.set('X-CSRF-Token', csrfToken)
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })
}
