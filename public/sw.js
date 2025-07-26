// Service Worker for Napoleon AI
// Executive-grade performance optimization

const CACHE_NAME = 'napoleon-ai-v1'
const STATIC_CACHE = 'napoleon-static-v1'
const DYNAMIC_CACHE = 'napoleon-dynamic-v1'

// Executive priority assets
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/_next/static/css/*',
  '/_next/static/js/*'
]

// Assets to cache immediately
const STATIC_ASSETS = [
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/robots.txt'
]

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker for executive experience')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      // Skip waiting for immediate activation
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !cacheName.includes('napoleon') || 
                     cacheName !== STATIC_CACHE || 
                     cacheName !== DYNAMIC_CACHE
            })
            .map((cacheName) => caches.delete(cacheName))
        )
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  )
})

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip external requests (except for fonts and images)
  if (url.origin !== self.location.origin && !isAllowedExternal(url)) {
    return
  }
  
  event.respondWith(handleRequest(request))
})

// Intelligent request handling
async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Strategy 1: Critical assets - Cache First with Network Fallback
  if (isCriticalAsset(url.pathname)) {
    return cacheFirst(request)
  }
  
  // Strategy 2: API calls - Network First with Cache Fallback
  if (isApiCall(url.pathname)) {
    return networkFirst(request)
  }
  
  // Strategy 3: Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    return cacheFirst(request)
  }
  
  // Strategy 4: Pages - Stale While Revalidate
  if (isPage(url.pathname)) {
    return staleWhileRevalidate(request)
  }
  
  // Default: Network First
  return networkFirst(request)
}

// Cache First strategy (for static assets)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Cache first failed:', error)
    return new Response('Executive content temporarily unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Network First strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network first fallback to cache:', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    
    return new Response('Network unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Stale While Revalidate strategy (for pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Fetch fresh version in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse
  })
  
  // Return cached version immediately if available
  return cachedResponse || networkPromise
}

// Helper functions
function isCriticalAsset(pathname) {
  return CRITICAL_ASSETS.some(asset => {
    if (asset.includes('*')) {
      const pattern = asset.replace('*', '.*')
      return new RegExp(pattern).test(pathname)
    }
    return pathname === asset
  })
}

function isApiCall(pathname) {
  return pathname.startsWith('/api/') || 
         pathname.includes('supabase.co') ||
         pathname.includes('clerk.com')
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/static/') ||
         /\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i.test(pathname)
}

function isPage(pathname) {
  return !pathname.startsWith('/api/') && 
         !pathname.startsWith('/_next/') &&
         !isStaticAsset(pathname)
}

function isAllowedExternal(url) {
  const allowedDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'images.unsplash.com',
    'img.clerk.com'
  ]
  
  return allowedDomains.some(domain => url.hostname.includes(domain))
}

// Background sync for executive actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'executive-action') {
    event.waitUntil(syncExecutiveActions())
  }
})

async function syncExecutiveActions() {
  try {
    // Sync any pending executive actions when online
    const pendingActions = await getStoredActions()
    
    for (const action of pendingActions) {
      await fetch('/api/executive-actions', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    
    // Clear stored actions after successful sync
    await clearStoredActions()
    
    console.log('[SW] Executive actions synced successfully')
  } catch (error) {
    console.log('[SW] Failed to sync executive actions:', error)
  }
}

// Push notifications for VIP communications
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-icon.png',
    tag: data.tag || 'napoleon-notification',
    requireInteraction: data.priority === 'high',
    actions: [
      {
        action: 'reply',
        title: 'Quick Reply',
        icon: '/icons/reply.png'
      },
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view.png'
      }
    ],
    data: {
      url: data.url || '/dashboard'
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const { action, data } = event
  
  if (action === 'reply') {
    // Open quick reply interface
    event.waitUntil(
      self.clients.openWindow('/dashboard/quick-reply?context=' + encodeURIComponent(data.url))
    )
  } else {
    // Open the relevant page
    event.waitUntil(
      self.clients.openWindow(data.url || '/dashboard')
    )
  }
})

// Helper functions for IndexedDB operations
async function getStoredActions() {
  // Implementation for retrieving stored actions
  return []
}

async function clearStoredActions() {
  // Implementation for clearing stored actions
}