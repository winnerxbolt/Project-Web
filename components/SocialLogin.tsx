'use client'

import { useState, useEffect } from 'react'
import { FaGoogle, FaFacebook, FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface SocialLoginProps {
  mode?: 'login' | 'register'
  onSuccess?: () => void
  className?: string
}

// Declare global types for SDKs
declare global {
  interface Window {
    googleOAuth?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
    FB?: {
      init: (params: any) => void
      login: (callback: (response: any) => void, params?: any) => void
      api: (path: string, callback: (response: any) => void) => void
      getLoginStatus: (callback: (response: any) => void) => void
    }
    fbAsyncInit?: () => void
  }
}

export default function SocialLogin({ mode = 'login', onSuccess, className = '' }: SocialLoginProps) {
  const { loginWithUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [scriptsLoaded, setScriptsLoaded] = useState({ google: false, facebook: false })
  const [canUseFacebook, setCanUseFacebook] = useState(false)

  // Check if Facebook can be used (HTTPS or localhost)
  useEffect(() => {
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1'
    setCanUseFacebook(isSecure)
  }, [])

  // Load Google OAuth SDK
  useEffect(() => {
    const loadGoogleScript = () => {
      if ((window as any).google?.accounts) {
        setScriptsLoaded(prev => ({ ...prev, google: true }))
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        setScriptsLoaded(prev => ({ ...prev, google: true }))
        initializeGoogle()
      }
      document.body.appendChild(script)
    }

    loadGoogleScript()
  }, [])

  // Load Facebook SDK (only if HTTPS/localhost)
  useEffect(() => {
    if (!canUseFacebook) return // Skip if not secure

    const loadFacebookScript = () => {
      if (window.FB) {
        // FB already loaded, mark as ready
        setScriptsLoaded(prev => ({ ...prev, facebook: true }))
        return
      }

      // Define the callback that will be called when SDK loads
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
            cookie: true,
            xfbml: true,
            version: 'v18.0',
            status: true
          })
          
          // Wait for init to complete before marking as loaded
          // Check if page is HTTPS (required for FB.getLoginStatus)
          if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
            try {
              window.FB.getLoginStatus(() => {
                setScriptsLoaded(prev => ({ ...prev, facebook: true }))
              })
            } catch (error) {
              console.warn('FB.getLoginStatus error:', error)
              setScriptsLoaded(prev => ({ ...prev, facebook: true }))
            }
          } else {
            // For HTTP/localhost, just mark as loaded
            console.log('Skipping FB.getLoginStatus (HTTPS required)')
            setScriptsLoaded(prev => ({ ...prev, facebook: true }))
          }
        }
      }

      // Load the SDK script
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
      } else {
        document.body.appendChild(script)
      }
    }

    loadFacebookScript()
  }, [canUseFacebook])

  const initializeGoogle = () => {
    const google = (window as any).google
    if (!google?.accounts) return

    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true
    })
  }

  const handleGoogleCallback = async (response: any) => {
    setLoading('google')
    setError('')

    try {
      // Decode JWT token to get user info
      const base64Url = response.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const payload = JSON.parse(jsonPayload)

      const googleProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }

      const apiResponse = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          token: response.credential,
          profile: googleProfile
        }),
        credentials: 'include'
      })

      const data = await apiResponse.json()

      if (data.success) {
        loginWithUser(data.user)
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/')
          router.refresh()
        }
      } else {
        setError(data.message || 'Google login failed')
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
    } finally {
      setLoading(null)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading('google')
    setError('')

    try {
      const google = (window as any).google
      if (!google?.accounts) {
        setError('Google SDK ยังไม่โหลดเสร็จ กรุณารอสักครู่')
        setLoading(null)
        return
      }

      // Trigger Google One Tap
      google.accounts.id.prompt()
    } catch (error) {
      console.error('Google login error:', error)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
      setLoading(null)
    }
  }

  const handleFacebookLogin = async () => {
    setLoading('facebook')
    setError('')

    try {
      // Wait for FB SDK to be ready
      if (!window.FB || !scriptsLoaded.facebook) {
        setError('Facebook SDK ยังไม่พร้อม กรุณารอสักครู่แล้วลองใหม่')
        setLoading(null)
        return
      }

      // Check if we're on localhost or HTTPS
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1'

      if (!isSecure) {
        setError('Facebook Login ต้องใช้งานผ่าน HTTPS หรือ localhost เท่านั้น')
        setLoading(null)
        return
      }

      // Ensure FB is properly initialized before calling login
      window.FB.getLoginStatus((statusResponse: any) => {
        if (!statusResponse || statusResponse.status === 'unknown') {
          // FB not properly initialized, try again
          setError('กรุณารอสักครู่แล้วลองใหม่อีกครั้ง')
          setLoading(null)
          return
        }

        // Now safe to call FB.login
        window.FB?.login((response) => {
          if (response.authResponse) {
            // Get user profile
            window.FB?.api('/me?fields=id,name,email,picture', async (userInfo) => {
              try {
                const facebookProfile = {
                  id: userInfo.id,
                  email: userInfo.email || `fb_${userInfo.id}@facebook.com`,
                  name: userInfo.name,
                  picture: userInfo.picture?.data?.url || ''
                }

                const apiResponse = await fetch('/api/auth/social-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    provider: 'facebook',
                    token: response.authResponse.accessToken,
                    profile: facebookProfile
                  }),
                  credentials: 'include'
                })

                const data = await apiResponse.json()

                if (data.success) {
                  loginWithUser(data.user)
                  
                  if (onSuccess) {
                    onSuccess()
                  } else {
                    router.push('/')
                    router.refresh()
                  }
                } else {
                  setError(data.message || 'Facebook login failed')
                }
              } catch (error) {
                console.error('Facebook API error:', error)
                setError('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Facebook')
              } finally {
                setLoading(null)
              }
            })
          } else {
            setError('การเข้าสู่ระบบด้วย Facebook ถูกยกเลิก')
            setLoading(null)
          }
        }, { scope: 'public_profile,email' })
      })
    } catch (error) {
      console.error('Facebook login error:', error)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook')
      setLoading(null)
    }
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            {mode === 'login' ? 'หรือเข้าสู่ระบบด้วย' : 'หรือสมัครด้วย'}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading === 'google' ? (
            <FaSpinner className="text-xl animate-spin" />
          ) : (
            <>
              <FaGoogle className="text-xl text-red-500" />
              <span>ดำเนินการต่อด้วย Google</span>
            </>
          )}
        </button>

        {/* Facebook Login */}
        <button
          onClick={handleFacebookLogin}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#166FE5] transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading === 'facebook' ? (
            <FaSpinner className="text-xl animate-spin" />
          ) : (
            <>
              <FaFacebook className="text-xl" />
              <span>ดำเนินการต่อด้วย Facebook</span>
            </>
          )}
        </button>

        {!canUseFacebook && (
          <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
            ⚠️ Facebook Login ต้องใช้งานบน HTTPS เท่านั้น
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          การเข้าสู่ระบบหมายถึงคุณยอมรับ
          <a href="/terms" className="text-purple-600 hover:underline ml-1">
            ข้อกำหนดการใช้งาน
          </a>
          {' '}และ{' '}
          <a href="/privacy" className="text-purple-600 hover:underline">
            นโยบายความเป็นส่วนตัว
          </a>
        </p>
      </div>
    </div>
  )
}
