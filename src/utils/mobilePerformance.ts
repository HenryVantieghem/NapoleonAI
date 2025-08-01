'use client'

// Mobile Performance Monitoring and Optimization Utilities

interface PerformanceMetrics {
  FCP: number | null // First Contentful Paint
  LCP: number | null // Largest Contentful Paint
  FID: number | null // First Input Delay
  CLS: number | null // Cumulative Layout Shift
  TTFB: number | null // Time to First Byte
  INP: number | null // Interaction to Next Paint
}

interface MobileDeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isLowEndDevice: boolean
  deviceMemory: number | null
  effectiveConnectionType: string | null
  saveData: boolean
}

class MobilePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    FCP: null,
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    INP: null
  }

  private deviceInfo: MobileDeviceInfo
  private performanceObserver: PerformanceObserver | null = null

  constructor() {
    this.deviceInfo = this.detectDevice()
    this.initializeObservers()
  }

  private detectDevice(): MobileDeviceInfo {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isLowEndDevice: false,
        deviceMemory: null,
        effectiveConnectionType: null,
        saveData: false
      }
    }

    const userAgent = navigator.userAgent
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)
    
    // @ts-ignore - Non-standard API
    const deviceMemory = (navigator as any).deviceMemory || null
    // @ts-ignore - Non-standard API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    const effectiveConnectionType = connection?.effectiveType || null
    const saveData = connection?.saveData || false
    
    // Consider device low-end if memory <= 4GB or slow connection
    const isLowEndDevice = deviceMemory <= 4 || 
                          effectiveConnectionType === 'slow-2g' || 
                          effectiveConnectionType === '2g'

    return {
      isMobile,
      isTablet,
      isLowEndDevice,
      deviceMemory,
      effectiveConnectionType,
      saveData
    }
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return

    try {
      // Web Vitals Observer
      this.performanceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.processEntry(entry)
        }
      })

      // Observe various performance metrics
      this.performanceObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] })
      
      // Modern INP metric
      if ('PerformanceEventTiming' in window) {
        this.observeINP()
      }

    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    // Measure initial metrics
    this.measureInitialMetrics()
  }

  private processEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime
        }
        break
      
      case 'largest-contentful-paint':
        this.metrics.LCP = entry.startTime
        break
      
      case 'first-input':
        // @ts-ignore - PerformanceEventTiming
        this.metrics.FID = entry.processingStart - entry.startTime
        break
      
      case 'layout-shift':
        // @ts-ignore - LayoutShift specific
        if (!entry.hadRecentInput) {
          this.metrics.CLS = (this.metrics.CLS || 0) + entry.value
        }
        break
      
      case 'navigation':
        // @ts-ignore - PerformanceNavigationTiming
        this.metrics.TTFB = entry.responseStart - entry.fetchStart
        break
    }
  }

  private observeINP() {
    let longestINP = 0
    
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // @ts-ignore - PerformanceEventTiming
        const inp = entry.processingStart + entry.duration - entry.startTime
        if (inp > longestINP) {
          longestINP = inp
          this.metrics.INP = inp
        }
      }
    })

    try {
      observer.observe({ type: 'event', buffered: true })
    } catch {
      // Fallback for browsers without INP support
      observer.observe({ entryTypes: ['first-input'] })
    }
  }

  private measureInitialMetrics() {
    // Measure from navigation timing
    if (performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navEntries.length > 0) {
        const nav = navEntries[0]
        this.metrics.TTFB = nav.responseStart - nav.fetchStart
      }
    }

    // Measure paint metrics
    const paintEntries = performance.getEntriesByType('paint')
    for (const entry of paintEntries) {
      if (entry.name === 'first-contentful-paint') {
        this.metrics.FCP = entry.startTime
      }
    }
  }

  // Public API
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getDeviceInfo(): MobileDeviceInfo {
    return { ...this.deviceInfo }
  }

  // Performance budgets for mobile
  getPerformanceBudgets() {
    const budgets = {
      // Mobile performance budgets (ms)
      FCP: this.deviceInfo.isLowEndDevice ? 2000 : 1800,
      LCP: this.deviceInfo.isLowEndDevice ? 4000 : 2500,
      FID: 100,
      INP: 200,
      CLS: 0.1,
      TTFB: this.deviceInfo.effectiveConnectionType === 'slow-2g' ? 1500 : 800
    }

    return budgets
  }

  // Check if metrics meet performance budgets
  checkPerformanceBudgets(): Record<string, boolean> {
    const budgets = this.getPerformanceBudgets()
    const results: Record<string, boolean> = {}

    Object.entries(budgets).forEach(([metric, budget]) => {
      const value = this.metrics[metric as keyof PerformanceMetrics]
      results[metric] = value !== null ? value <= budget : true // null means not measured yet
    })

    return results
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const budgets = this.getPerformanceBudgets()
    const checks = this.checkPerformanceBudgets()
    
    let score = 0
    let totalChecks = 0

    Object.entries(checks).forEach(([metric, passed]) => {
      const value = this.metrics[metric as keyof PerformanceMetrics]
      if (value !== null) {
        totalChecks++
        if (passed) {
          score += 100
        } else {
          // Partial credit based on how close to budget
          const budget = budgets[metric as keyof typeof budgets]
          const ratio = Math.min(budget / value, 1)
          score += ratio * 100
        }
      }
    })

    return totalChecks > 0 ? Math.round(score / totalChecks) : 0
  }

  // Memory pressure detection
  isMemoryPressure(): boolean {
    // @ts-ignore - Non-standard API
    const memory = (performance as any).memory
    if (!memory) return false

    const usedRatio = memory.usedJSHeapSize / memory.totalJSHeapSize
    return usedRatio > 0.9 || memory.usedJSHeapSize > 50 * 1024 * 1024 // 50MB threshold
  }

  // Adaptive performance optimizations
  getOptimizationRecommendations() {
    const recommendations: string[] = []

    if (this.deviceInfo.isLowEndDevice) {
      recommendations.push('Reduce animation complexity')
      recommendations.push('Use smaller image sizes')
      recommendations.push('Limit concurrent operations')
    }

    if (this.deviceInfo.saveData) {
      recommendations.push('Reduce data usage')
      recommendations.push('Defer non-critical resources')
    }

    if (this.deviceInfo.effectiveConnectionType === 'slow-2g' || this.deviceInfo.effectiveConnectionType === '2g') {
      recommendations.push('Optimize for slow connections')
      recommendations.push('Implement aggressive caching')
    }

    if (this.isMemoryPressure()) {
      recommendations.push('Clear unused caches')
      recommendations.push('Reduce memory-intensive operations')
    }

    const score = this.getPerformanceScore()
    if (score < 75) {
      recommendations.push('Review performance bottlenecks')
      recommendations.push('Consider code splitting optimizations')
    }

    return recommendations
  }

  // Start monitoring session
  startSession() {
    const sessionStart = performance.now()
    
    return {
      end: () => {
        const sessionDuration = performance.now() - sessionStart
        return {
          duration: sessionDuration,
          metrics: this.getMetrics(),
          score: this.getPerformanceScore(),
          recommendations: this.getOptimizationRecommendations()
        }
      }
    }
  }

  // Report to analytics (mock implementation)
  reportToAnalytics() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      metrics: this.getMetrics(),
      score: this.getPerformanceScore(),
      budgetChecks: this.checkPerformanceBudgets(),
      url: window.location.href
    }

    // In a real implementation, send to analytics service
    console.log('Performance Report:', report)
    
    return report
  }
}

// Singleton instance
let performanceMonitor: MobilePerformanceMonitor | null = null

export function getMobilePerformanceMonitor(): MobilePerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new MobilePerformanceMonitor()
  }
  return performanceMonitor
}

// React hook for performance monitoring
export function useMobilePerformance() {
  const monitor = getMobilePerformanceMonitor()
  
  return {
    metrics: monitor.getMetrics(),
    deviceInfo: monitor.getDeviceInfo(),
    score: monitor.getPerformanceScore(),
    budgetChecks: monitor.checkPerformanceBudgets(),
    recommendations: monitor.getOptimizationRecommendations(),
    startSession: monitor.startSession.bind(monitor),
    reportToAnalytics: monitor.reportToAnalytics.bind(monitor)
  }
}

// Performance budget checker for CI/CD
export function checkMobilePerformanceBudgets(): boolean {
  const monitor = getMobilePerformanceMonitor()
  const checks = monitor.checkPerformanceBudgets()
  
  // All critical metrics must pass
  const criticalMetrics = ['FCP', 'LCP', 'FID']
  return criticalMetrics.every(metric => checks[metric] !== false)
}

// Utility functions
export function optimizeForDevice(deviceInfo: MobileDeviceInfo) {
  const optimizations = {
    prefetchStrategy: deviceInfo.isLowEndDevice ? 'minimal' : 'aggressive',
    imageQuality: deviceInfo.saveData ? 'low' : 'high',
    animationDuration: deviceInfo.isLowEndDevice ? 0.1 : 0.3,
    cacheStrategy: deviceInfo.effectiveConnectionType === 'slow-2g' ? 'aggressive' : 'standard'
  }

  return optimizations
}

export function getPerformanceClass(): 'high' | 'medium' | 'low' {
  const monitor = getMobilePerformanceMonitor()
  const score = monitor.getPerformanceScore()
  
  if (score >= 90) return 'high'
  if (score >= 70) return 'medium'
  return 'low'
}