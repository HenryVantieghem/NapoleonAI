'use client'

import { lazy, Suspense, ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * Optimized lazy loading wrapper with executive-grade loading states
 */

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  error?: ReactNode
  delay?: number
}

// Executive loading spinner
export function ExecutiveLoader({ 
  size = 'medium',
  message = 'Loading...',
  className = ''
}: {
  size?: 'small' | 'medium' | 'large'
  message?: string
  className?: string
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <Loader2 className={`${sizeClasses[size]} text-navy`} />
        
        {/* Gold accent ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gold/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-navy font-medium"
      >
        {message}
      </motion.span>
    </motion.div>
  )
}

// Skeleton loader for content
export function ExecutiveSkeleton({
  lines = 3,
  avatar = false,
  className = ''
}: {
  lines?: number
  avatar?: boolean
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`animate-pulse ${className}`}
    >
      <div className="flex items-start gap-4">
        {avatar && (
          <div className="w-10 h-10 bg-navy/10 rounded-full flex-shrink-0" />
        )}
        
        <div className="flex-1 space-y-3">
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-navy/10 rounded"
              style={{
                width: i === lines - 1 ? '75%' : '100%'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Optimized lazy wrapper
export function LazyWrapper({ 
  children, 
  fallback, 
  error,
  delay = 0 
}: LazyWrapperProps) {
  const defaultFallback = (
    <ExecutiveLoader 
      message="Loading component..." 
      className="min-h-[200px]"
    />
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
      >
        {children}
      </motion.div>
    </Suspense>
  )
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  loadingComponent?: ReactNode,
  delay?: number
) {
  const LazyComponent = lazy(importFn)

  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper 
        fallback={loadingComponent} 
        delay={delay}
      >
        <LazyComponent {...props} />
      </LazyWrapper>
    )
  }
}

// Pre-optimized lazy components for common dashboard elements
export const LazyStrategicDigest = withLazyLoading(
  () => import('@/components/dashboard/strategic-digest'),
  <ExecutiveLoader message="Loading strategic digest..." className="min-h-[300px]" />
)

export const LazyMessagesList = withLazyLoading(
  () => import('@/components/dashboard/messages-list'),
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <ExecutiveSkeleton key={i} lines={3} avatar className="p-4 rounded-lg border border-navy/10" />
    ))}
  </div>
)

export const LazyActionItems = withLazyLoading(
  () => import('@/components/dashboard/action-items'),
  <ExecutiveLoader message="Loading action items..." className="min-h-[250px]" />
)

export const LazyContextPanel = withLazyLoading(
  () => import('@/components/dashboard/context-panel'),
  <ExecutiveLoader message="Loading context..." className="min-h-[400px]" />
)

// Progressive enhancement wrapper
export function ProgressiveEnhancement({
  children,
  fallback,
  condition = typeof window !== 'undefined'
}: {
  children: ReactNode
  fallback: ReactNode
  condition?: boolean
}) {
  if (!condition) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Intersection observer hook for lazy loading
import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(
  threshold = 0.1,
  rootMargin = '50px'
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true) // Fallback for SSR
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}

// Lazy load on scroll component
export function LazyOnScroll({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className = ''
}: {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}) {
  const [ref, isVisible] = useIntersectionObserver(threshold, rootMargin)

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <ExecutiveSkeleton className="min-h-[100px]" />)}
    </div>
  )
}