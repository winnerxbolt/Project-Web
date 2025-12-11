// Service Worker for Push Notifications
// This file should be placed in the public folder

const CACHE_NAME = 'poolvilla-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event)

  let notificationData = {
    title: 'Poolvilla Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification',
    data: {}
  }

  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (e) {
      notificationData.body = event.data.text()
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/badge-72x72.png',
    image: notificationData.image,
    tag: notificationData.tag || 'notification',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    timestamp: notificationData.timestamp || Date.now(),
    vibrate: [200, 100, 200]
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event)

  event.notification.close()

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action)
    
    // Open URL based on action
    if (event.action === 'view') {
      event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
      )
    }
    return
  }

  // Default click - open app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/')
        }
      })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event)
  
  // Track notification dismissal
  if (event.notification.data && event.notification.data.trackClose) {
    fetch('/api/push/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.id,
        action: 'closed'
      })
    }).catch(err => console.error('Failed to track close:', err))
  }
})

// Background sync event (optional)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event)
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  try {
    const response = await fetch('/api/push/send')
    const data = await response.json()
    console.log('Synced notifications:', data)
  } catch (error) {
    console.error('Failed to sync notifications:', error)
  }
}

// Fetch event - Cache strategy (optional)
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache static assets only
          if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
          }

          return response
        })
      })
  )
})

console.log('Service Worker: Loaded')
