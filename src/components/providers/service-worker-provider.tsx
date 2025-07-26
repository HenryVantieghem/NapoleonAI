"use client"

import { useEffect } from "react"
import { useServiceWorker } from "@/lib/service-worker"

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const sw = useServiceWorker()

  useEffect(() => {
    // Register service worker for executive experience
    const initServiceWorker = async () => {
      try {
        const registered = await sw.register()
        
        if (registered) {
          console.log('🎩 Executive service worker activated')
          
          // Enable executive mode features
          setTimeout(() => {
            sw.enableExecutiveMode()
          }, 2000)
        }
      } catch (error) {
        console.warn('Service worker registration failed:', error)
      }
    }

    // Only register in production or if explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SW_ENABLED === 'true') {
      initServiceWorker()
    }

    // Network status monitoring for executives
    let cleanup: (() => void) | undefined

    const handleNetworkChange = (online: boolean) => {
      if (typeof window !== 'undefined' && (window as any).showToast) {
        if (online) {
          (window as any).showToast({
            type: 'success',
            title: 'Executive Connection Restored',
            description: 'Your command center is back online.',
            duration: 3000
          })
        } else {
          (window as any).showToast({
            type: 'warning',
            title: 'Executive Offline Mode',
            description: 'Working offline with cached data.',
            duration: 5000
          })
        }
      }
    }

    cleanup = sw.onNetworkChange(handleNetworkChange)

    return () => {
      cleanup?.()
    }
  }, [sw])

  return <>{children}</>
}