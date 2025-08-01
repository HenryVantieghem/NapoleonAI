'use client'

import { lazy, ComponentType } from 'react'

// Lazy loading wrapper with error boundaries and loading states
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ComponentType<any> | null = null
) {
  const LazyComponent = lazy(importFn)
  
  return {
    Component: LazyComponent,
    fallback: fallback || (() => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    ))
  }
}

// Pre-load components for better UX
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<any> }>) {
  // Start loading the component in the background
  importFn().catch(error => {
    console.warn('Failed to preload component:', error)
  })
}

// Lazy load heavy dashboard components
export const LazyComponents = {
  // Charts and analytics
  MetricsDashboard: createLazyComponent(
    () => import('@/components/admin/metrics-dashboard'),
    () => (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gold/20 rounded w-20 mb-2" />
              <div className="h-8 bg-gold/20 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-4 animate-pulse">
          <div className="h-40 bg-gold/20 rounded" />
        </div>
      </div>
    )
  ),

  // Calendar components
  Calendar: createLazyComponent(
    () => import('@/components/dashboard/Calendar'),
    () => (
      <div className="bg-white rounded-xl p-4 animate-pulse">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-8 bg-gold/20 rounded" />
          ))}
        </div>
      </div>
    )
  ),

  // Heavy modals and overlays
  MessageModal: createLazyComponent(
    () => import('@/components/dashboard/MessageModal'),
    () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-pulse">
          <div className="h-6 bg-gold/20 rounded w-48 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gold/20 rounded w-full" />
            <div className="h-4 bg-gold/20 rounded w-3/4" />
            <div className="h-4 bg-gold/20 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  ),

  // Settings panels
  AdvancedSettings: createLazyComponent(
    () => import('@/components/settings/AdvancedSettings'),
    () => (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gold/20 rounded w-32 mb-2" />
            <div className="h-3 bg-gold/20 rounded w-48" />
          </div>
        ))}
      </div>
    )
  )
}

// Intersection Observer hook for lazy loading on scroll
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  }

  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const setElement = useCallback((element: HTMLElement | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current)
    }

    elementRef.current = element

    if (element) {
      if (observerRef.current) {
        observerRef.current.observe(element)
      } else {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                callback()
              }
            })
          },
          defaultOptions
        )
        observerRef.current.observe(element)
      }
    }
  }, [callback, defaultOptions])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return setElement
}

// Image lazy loading with optimization
export function useLazyImage(src: string, options: {
  placeholder?: string
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png'
} = {}) {
  const [imageSrc, setImageSrc] = useState(options.placeholder || '')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageRef = useIntersectionObserver(() => {
    if (!imageLoaded && !imageError) {
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        setImageLoaded(true)
      }
      
      img.onerror = () => {
        setImageError(true)
      }
      
      // Optimize image URL for Next.js
      if (src.startsWith('/') && typeof window !== 'undefined') {
        const params = new URLSearchParams()
        if (options.quality) params.set('q', options.quality.toString())
        if (options.format) params.set('f', options.format)
        
        img.src = `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
      } else {
        img.src = src
      }
    }
  })

  return {
    src: imageSrc,
    isLoaded: imageLoaded,
    isError: imageError,
    ref: imageRef
  }
}

// Bundle size optimization utilities
export function getBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      transferSize: navigation.transferSize,
      encodedBodySize: navigation.encodedBodySize,
      decodedBodySize: navigation.decodedBodySize
    }
  }
  return null
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Component preloading strategies
export const PreloadStrategies = {
  // Preload on hover (for desktop)
  onHover: (importFn: () => Promise<any>) => ({
    onMouseEnter: () => preloadComponent(importFn),
    onFocus: () => preloadComponent(importFn)
  }),

  // Preload on route change
  onRouteChange: (importFn: () => Promise<any>) => {
    if (typeof window !== 'undefined') {
      // Listen for navigation events
      window.addEventListener('beforeunload', () => {
        preloadComponent(importFn)
      })
    }
  },

  // Preload after initial load
  afterLoad: (importFn: () => Promise<any>, delay: number = 1000) => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        preloadComponent(importFn)
      }, delay)
    }
  }
}

// React imports for hooks
import { useRef, useCallback, useEffect, useState } from 'react'