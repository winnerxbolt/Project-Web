// Performance utilities

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy load images
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = reject
    img.src = src
  })
}

// Check if element is in viewport
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Cache management
const cache = new Map<string, { data: any; timestamp: number }>()

export function setCache(key: string, data: any, ttl: number = 300000): void {
  cache.set(key, {
    data,
    timestamp: Date.now() + ttl,
  })
}

export function getCache<T = any>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() > item.timestamp) {
    cache.delete(key)
    return null
  }
  
  return item.data as T
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// Preload critical resources
export function preloadImage(src: string): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}

export function preloadFont(href: string): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.type = 'font/woff2'
  link.href = href
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

// Request Animation Frame wrapper
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let requestId: number | null = null
  
  return function throttledFunction(...args: Parameters<T>) {
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        requestId = null
        callback(...args)
      })
    }
  }
}

// Measure performance
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window === 'undefined') return
  
  const start = performance.now()
  fn()
  const end = performance.now()
  
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
}

// Optimize scroll events
export function optimizeScroll(callback: () => void): () => void {
  const throttledCallback = rafThrottle(callback)
  window.addEventListener('scroll', throttledCallback, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', throttledCallback)
  }
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}
