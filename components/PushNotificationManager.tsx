'use client'

import { useEffect, useState } from 'react'
import { FaBell, FaBellSlash, FaCheckCircle } from 'react-icons/fa'

interface PushManagerState {
  supported: boolean
  permission: NotificationPermission
  subscribed: boolean
  loading: boolean
}

export default function PushNotificationManager() {
  const [state, setState] = useState<PushManagerState>({
    supported: false,
    permission: 'default',
    subscribed: false,
    loading: false
  })

  useEffect(() => {
    checkPushSupport()
  }, [])

  const checkPushSupport = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setState(prev => ({ ...prev, supported: true }))
      
      const permission = Notification.permission
      setState(prev => ({ ...prev, permission }))

      // Check if already subscribed
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setState(prev => ({ ...prev, subscribed: !!subscription }))
    }
  }

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      throw error
    }
  }

  const subscribeToPush = async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission !== 'granted') {
        alert('กรุณาอนุญาตการแจ้งเตือนเพื่อรับข่าวสารจากเรา')
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      // Register service worker
      const registration = await registerServiceWorker()
      await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userEmail') || 'guest',
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setState(prev => ({ ...prev, subscribed: true }))
        
        // Show test notification
        registration.showNotification('🎉 เปิดการแจ้งเตือนสำเร็จ!', {
          body: 'คุณจะได้รับการแจ้งเตือนเกี่ยวกับการจองและโปรโมชั่นพิเศษ',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'welcome'
        })
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
      alert('ไม่สามารถเปิดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const unsubscribeFromPush = async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        
        // Notify server
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE'
        })

        setState(prev => ({ ...prev, subscribed: false }))
        alert('ปิดการแจ้งเตือนสำเร็จ')
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      alert('ไม่สามารถปิดการแจ้งเตือนได้')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  if (!state.supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <FaBellSlash className="text-yellow-600 text-xl" />
          <div>
            <div className="font-semibold text-yellow-900">ไม่รองรับการแจ้งเตือน</div>
            <div className="text-sm text-yellow-700">เบราว์เซอร์ของคุณไม่รองรับ Push Notifications</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <FaBell className="text-blue-600" />
            การแจ้งเตือนผ่านเบราว์เซอร์
          </h3>
          <p className="text-gray-600 text-sm">
            รับการแจ้งเตือนเกี่ยวกับการจอง สถานะการชำระเงิน และโปรโมชันพิเศษ
          </p>
        </div>
        {state.subscribed && (
          <FaCheckCircle className="text-green-500 text-2xl" />
        )}
      </div>

      {state.subscribed ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <FaCheckCircle />
              <span className="font-semibold">เปิดการแจ้งเตือนแล้ว</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              คุณจะได้รับการแจ้งเตือนจากเราแล้ว
            </p>
          </div>
          <button
            onClick={unsubscribeFromPush}
            disabled={state.loading}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            {state.loading ? 'กำลังปิด...' : 'ปิดการแจ้งเตือน'}
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">คุณจะได้รับ:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ การยืนยันการจอง</li>
              <li>✅ แจ้งเตือนการชำระเงิน</li>
              <li>✅ เตือนก่อนเช็คอิน/เช็คเอาท์</li>
              <li>✅ โปรโมชันและดีลพิเศษ</li>
              <li>✅ ราคาลดพิเศษ</li>
            </ul>
          </div>
          <button
            onClick={subscribeToPush}
            disabled={state.loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
          >
            {state.loading ? 'กำลังเปิด...' : '🔔 เปิดการแจ้งเตือน'}
          </button>
        </div>
      )}

      {state.permission === 'denied' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            คุณได้ปิดการแจ้งเตือนไว้ กรุณาเปิดในการตั้งค่าเบราว์เซอร์
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
