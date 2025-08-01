/**
 * Performance Monitoring for Napoleon AI
 * Tracks core web vitals, API performance, and user experience metrics
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte

  // Custom Metrics
  pageLoadTime?: number
  apiResponseTime?: number
  aiProcessingTime?: number
  dashboardRenderTime?: number
  messageLoadTime?: number

  // User Experience
  interactionLatency?: number
  searchLatency?: number
  navigationLatency?: number
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number } // < 2.5s good, < 4.0s needs improvement
  fid: { good: number; needsImprovement: number } // < 100ms good, < 300ms needs improvement
  cls: { good: number; needsImprovement: number } // < 0.1 good, < 0.25 needs improvement
  apiResponse: { good: number; needsImprovement: number } // < 200ms good, < 500ms needs improvement
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics = {}
  private observers: Map<string, PerformanceObserver> = new Map()
  private thresholds: PerformanceThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    apiResponse: { good: 200, needsImprovement: 500 }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.measureInitialLoad()
    }
  }

  /**
   * Initialize performance observers for Core Web Vitals
   */
  private initializeObservers() {
    // Largest Contentful Paint
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.metrics.lcp = lastEntry.startTime
          this.logMetric('LCP', lastEntry.startTime, 'ms')
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime
            this.logMetric('FID', this.metrics.fid, 'ms')
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          this.metrics.cls = clsValue
          this.logMetric('CLS', clsValue)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('cls', clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }

      // Navigation timing for custom metrics
      this.measureNavigationTiming()
    }
  }

  /**
   * Measure initial page load performance
   */
  private measureInitialLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      // Wait for load event
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = window.performance.getEntriesByType('navigation')[0] as any
          if (navigation) {
            this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
            this.metrics.ttfb = navigation.responseStart - navigation.fetchStart
            this.metrics.fcp = this.getFirstContentfulPaint()
            
            this.logMetric('Page Load Time', this.metrics.pageLoadTime, 'ms')
            this.logMetric('TTFB', this.metrics.ttfb, 'ms')
          }
        }, 0)
      })
    }
  }

  /**
   * Get First Contentful Paint
   */
  private getFirstContentfulPaint(): number | undefined {
    if (typeof window !== 'undefined' && window.performance) {
      const entries = window.performance.getEntriesByName('first-contentful-paint')
      return entries.length > 0 ? entries[0].startTime : undefined
    }
    return undefined
  }

  /**
   * Measure navigation timing
   */
  private measureNavigationTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.metrics.navigationLatency = entry.loadEventEnd - entry.fetchStart
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['navigation'] })
        this.observers.set('navigation', observer)
      } catch (e) {
        console.warn('Navigation observer not supported')
      }
    }
  }

  /**
   * Measure API response time
   */
  measureApiCall(url: string, startTime: number, endTime: number) {
    const responseTime = endTime - startTime
    this.metrics.apiResponseTime = responseTime
    
    this.logMetric(`API ${url}`, responseTime, 'ms')
    
    // Log if performance is poor
    if (responseTime > this.thresholds.apiResponse.needsImprovement) {
      console.warn(`Slow API response: ${url} took ${responseTime}ms`)
    }
  }

  /**
   * Measure AI processing time
   */
  measureAIProcessing(startTime: number, endTime: number) {
    const processingTime = endTime - startTime
    this.metrics.aiProcessingTime = processingTime
    
    this.logMetric('AI Processing', processingTime, 'ms')
    
    // Executive standard: AI processing should complete within 2 seconds
    if (processingTime > 2000) {
      console.warn(`Slow AI processing: ${processingTime}ms (target: <2000ms)`)
    }
  }

  /**
   * Measure dashboard render time
   */
  measureDashboardRender(startTime: number, endTime: number) {
    const renderTime = endTime - startTime
    this.metrics.dashboardRenderTime = renderTime
    
    this.logMetric('Dashboard Render', renderTime, 'ms')
    
    // Executive standard: Dashboard should render within 500ms
    if (renderTime > 500) {
      console.warn(`Slow dashboard render: ${renderTime}ms (target: <500ms)`)
    }
  }

  /**
   * Measure interaction latency
   */
  measureInteraction(action: string, startTime: number, endTime: number) {
    const latency = endTime - startTime
    this.metrics.interactionLatency = latency
    
    this.logMetric(`Interaction: ${action}`, latency, 'ms')
    
    // Executive standard: Interactions should respond within 100ms
    if (latency > 100) {
      console.warn(`Slow interaction: ${action} took ${latency}ms (target: <100ms)`)
    }
  }

  /**
   * Get current performance scores
   */
  getPerformanceScores(): {
    overall: number
    scores: Record<string, { value: number; score: number; status: 'good' | 'needs-improvement' | 'poor' }>
  } {
    const scores: any = {}
    let totalScore = 0
    let metricCount = 0

    // Score LCP
    if (this.metrics.lcp !== undefined) {
      const score = this.scoreMetric(this.metrics.lcp, this.thresholds.lcp)
      scores.lcp = { value: this.metrics.lcp, score, status: this.getStatus(score) }
      totalScore += score
      metricCount++
    }

    // Score FID
    if (this.metrics.fid !== undefined) {
      const score = this.scoreMetric(this.metrics.fid, this.thresholds.fid)
      scores.fid = { value: this.metrics.fid, score, status: this.getStatus(score) }
      totalScore += score
      metricCount++
    }

    // Score CLS
    if (this.metrics.cls !== undefined) {
      const score = this.scoreMetric(this.metrics.cls, this.thresholds.cls)
      scores.cls = { value: this.metrics.cls, score, status: this.getStatus(score) }
      totalScore += score
      metricCount++
    }

    // Score API response time
    if (this.metrics.apiResponseTime !== undefined) {
      const score = this.scoreMetric(this.metrics.apiResponseTime, this.thresholds.apiResponse)
      scores.apiResponse = { value: this.metrics.apiResponseTime, score, status: this.getStatus(score) }
      totalScore += score
      metricCount++
    }

    const overallScore = metricCount > 0 ? Math.round(totalScore / metricCount) : 0

    return { overall: overallScore, scores }
  }

  /**
   * Score individual metric (0-100)
   */
  private scoreMetric(value: number, threshold: { good: number; needsImprovement: number }): number {
    if (value <= threshold.good) return 100
    if (value <= threshold.needsImprovement) return Math.round(100 - ((value - threshold.good) / (threshold.needsImprovement - threshold.good)) * 50)
    return Math.max(0, Math.round(50 - ((value - threshold.needsImprovement) / threshold.needsImprovement) * 50))
  }

  /**
   * Get status from score
   */
  private getStatus(score: number): 'good' | 'needs-improvement' | 'poor' {
    if (score >= 90) return 'good'
    if (score >= 50) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Log performance metric
   */
  private logMetric(name: string, value: number, unit: string = '') {
    const status = this.getMetricStatus(name, value)
    const color = status === 'good' ? 'green' : status === 'needs-improvement' ? 'orange' : 'red'
    
    console.log(
      `%c⚡ ${name}: ${value.toFixed(1)}${unit}`,
      `color: ${color}; font-weight: bold;`
    )
  }

  /**
   * Get metric status for logging
   */
  private getMetricStatus(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Simplified status check for logging
    if (name.includes('API') || name.includes('Processing')) {
      return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor'
    }
    if (name.includes('LCP')) {
      return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
    }
    if (name.includes('FID')) {
      return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor'
    }
    return 'good'
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = {}
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Helper functions for easy integration
export const measureApiCall = (url: string) => {
  const startTime = performance.now()
  return () => performanceMonitor.measureApiCall(url, startTime, performance.now())
}

export const measureAIProcessing = () => {
  const startTime = performance.now()
  return () => performanceMonitor.measureAIProcessing(startTime, performance.now())
}

export const measureDashboardRender = () => {
  const startTime = performance.now()
  return () => performanceMonitor.measureDashboardRender(startTime, performance.now())
}

export const measureInteraction = (action: string) => {
  const startTime = performance.now()
  return () => performanceMonitor.measureInteraction(action, startTime, performance.now())
}