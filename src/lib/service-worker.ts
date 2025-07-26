"use client"

// Service Worker registration for executive experience
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('[SW] Service worker registered successfully')

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate()
      })

      // Check if there's an update available
      if (this.registration.waiting) {
        this.showUpdateAvailable()
      }

      return true
    } catch (error) {
      console.error('[SW] Service worker registration failed:', error)
      return false
    }
  }

  private handleUpdate() {
    if (!this.registration) return

    const newWorker = this.registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.showUpdateAvailable()
      }
    })
  }

  private showUpdateAvailable() {
    // Show luxury update notification
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({
        type: 'info',
        title: 'Executive Experience Update',
        description: 'A new version is available. Refresh to get the latest features.',
        duration: 10000
      })
    }

    // Auto-update after 30 seconds for executives (they don't like interruptions)
    setTimeout(() => {
      this.activateUpdate()
    }, 30000)
  }

  async activateUpdate(): Promise<void> {
    if (!this.registration?.waiting) return

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  async requestPushPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        await this.subscribeToPush()
      }
      
      return permission
    }

    return Notification.permission
  }

  private async subscribeToPush(): Promise<void> {
    if (!this.registration) return

    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.warn('[SW] VAPID public key not configured')
        return
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })

      console.log('[SW] Push subscription successful')
    } catch (error) {
      console.error('[SW] Push subscription failed:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async cacheExecutiveData(data: any): Promise<void> {
    if (!('caches' in window)) return

    try {
      const cache = await caches.open('napoleon-executive-data')
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      })
      await cache.put('/executive-data', response)
    } catch (error) {
      console.error('[SW] Failed to cache executive data:', error)
    }
  }

  async getExecutiveData(): Promise<any | null> {
    if (!('caches' in window)) return null

    try {
      const cache = await caches.open('napoleon-executive-data')
      const response = await cache.match('/executive-data')
      if (response) {
        return await response.json()
      }
    } catch (error) {
      console.error('[SW] Failed to retrieve executive data:', error)
    }
    return null
  }

  async prefetchCriticalAssets(): Promise<void> {
    if (!this.registration) return

    const criticalAssets = [
      '/dashboard',
      '/api/messages/priority',
      '/api/vip-contacts'
    ]

    try {
      const cache = await caches.open('napoleon-prefetch')
      await Promise.all(
        criticalAssets.map(asset => 
          cache.add(asset).catch(err => 
            console.warn(`[SW] Failed to prefetch ${asset}:`, err)
          )
        )
      )
      console.log('[SW] Critical assets prefetched for executive access')
    } catch (error) {
      console.error('[SW] Prefetch failed:', error)
    }
  }

  async enableExecutiveMode(): Promise<void> {
    await Promise.all([
      this.requestPushPermission(),
      this.prefetchCriticalAssets()
    ])
    
    console.log('[SW] Executive mode enabled')
  }

  isOnline(): boolean {
    return navigator.onLine
  }

  onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

// Hook for using service worker in components
export function useServiceWorker() {
  const sw = ServiceWorkerManager.getInstance()

  return {
    register: () => sw.register(),
    requestPushPermission: () => sw.requestPushPermission(),
    enableExecutiveMode: () => sw.enableExecutiveMode(),
    cacheData: (data: any) => sw.cacheExecutiveData(data),
    getData: () => sw.getExecutiveData(),
    isOnline: () => sw.isOnline(),
    onNetworkChange: (callback: (online: boolean) => void) => sw.onNetworkChange(callback)
  }
}