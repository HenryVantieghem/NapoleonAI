"use client"

import { createClient } from '@/lib/supabase/client'

// Executive session management with luxury UX considerations

interface SessionActivity {
  user_id: string
  session_id: string
  last_activity: string
  ip_address?: string
  user_agent?: string
  status: 'active' | 'ended' | 'expired'
  created_at?: string
  ended_at?: string
}

interface SessionWarningConfig {
  warningThreshold: number // minutes before expiry to show warning
  extendThreshold: number   // minutes to extend session
  maxExtensions: number     // max number of extensions allowed
}

class ExecutiveSessionService {
  private warningTimer: NodeJS.Timeout | null = null
  private activityTimer: NodeJS.Timeout | null = null
  private config: SessionWarningConfig = {
    warningThreshold: 5, // 5 minutes before expiry
    extendThreshold: 30, // extend by 30 minutes
    maxExtensions: 3     // max 3 extensions
  }
  
  private callbacks: {
    onWarning?: (minutesLeft: number) => void
    onExpiry?: () => void
    onExtended?: (newExpiryTime: Date) => void
  } = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeActivityTracking()
    }
  }

  // Initialize activity tracking for executive users
  private initializeActivityTracking() {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    const trackActivity = () => {
      this.updateLastActivity()
      this.resetWarningTimer()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true })
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        trackActivity()
      }
    })
  }

  // Update last activity timestamp
  private async updateLastActivity() {
    try {
      // This would call your session API endpoint
      await fetch('/api/auth/session/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.warn('Failed to update session activity:', error)
    }
  }

  // Set session event callbacks
  setCallbacks(callbacks: {
    onWarning?: (minutesLeft: number) => void
    onExpiry?: () => void
    onExtended?: (newExpiryTime: Date) => void
  }) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Start session monitoring
  startMonitoring(sessionExpiryTime: Date) {
    this.resetWarningTimer(sessionExpiryTime)
  }

  // Reset the warning timer
  private resetWarningTimer(expiryTime?: Date) {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }

    if (!expiryTime) return

    const now = new Date().getTime()
    const expiry = expiryTime.getTime()
    const timeUntilWarning = expiry - now - (this.config.warningThreshold * 60 * 1000)

    if (timeUntilWarning > 0) {
      this.warningTimer = setTimeout(() => {
        this.showSessionWarning(expiryTime)
      }, timeUntilWarning)
    } else if (expiry > now) {
      // Already in warning period
      this.showSessionWarning(expiryTime)
    }
  }

  // Show session expiry warning with executive UX
  private showSessionWarning(expiryTime: Date) {
    const now = new Date().getTime()
    const expiry = expiryTime.getTime()
    const minutesLeft = Math.ceil((expiry - now) / (60 * 1000))

    if (minutesLeft <= 0) {
      this.handleSessionExpiry()
      return
    }

    // Trigger warning callback
    if (this.callbacks.onWarning) {
      this.callbacks.onWarning(minutesLeft)
    }

    // Set timer for expiry
    setTimeout(() => {
      this.handleSessionExpiry()
    }, minutesLeft * 60 * 1000)
  }

  // Handle session expiry
  private handleSessionExpiry() {
    if (this.callbacks.onExpiry) {
      this.callbacks.onExpiry()
    }

    // Clear all timers
    if (this.warningTimer) clearTimeout(this.warningTimer)
    if (this.activityTimer) clearTimeout(this.activityTimer)
  }

  // Extend session for executive users
  async extendSession(): Promise<{ success: boolean; newExpiryTime?: Date; error?: string }> {
    try {
      const response = await fetch('/api/auth/session/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extendByMinutes: this.config.extendThreshold
        })
      })

      if (!response.ok) {
        throw new Error('Failed to extend session')
      }

      const data = await response.json()
      const newExpiryTime = new Date(data.expiryTime)
      
      // Reset monitoring with new expiry time
      this.startMonitoring(newExpiryTime)
      
      if (this.callbacks.onExtended) {
        this.callbacks.onExtended(newExpiryTime)
      }

      return { success: true, newExpiryTime }
    } catch (error) {
      console.error('Session extension failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get session status
  async getSessionStatus(): Promise<{
    authenticated: boolean
    expiryTime?: Date
    timeLeft?: number
    extensions?: number
  }> {
    try {
      const response = await fetch('/api/auth/session')
      if (!response.ok) {
        return { authenticated: false }
      }

      const data = await response.json()
      
      return {
        authenticated: data.authenticated,
        expiryTime: data.expiryTime ? new Date(data.expiryTime) : undefined,
        timeLeft: data.timeLeft,
        extensions: data.extensions
      }
    } catch (error) {
      console.error('Session status check failed:', error)
      return { authenticated: false }
    }
  }

  // Cleanup timers on component unmount
  cleanup() {
    if (this.warningTimer) clearTimeout(this.warningTimer)
    if (this.activityTimer) clearTimeout(this.activityTimer)
  }

  // Executive security audit log
  async logSecurityEvent(event: {
    type: 'login' | 'logout' | 'session_extended' | 'biometric_used' | 'suspicious_activity'
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          event_type: event.type,
          event_details: event.details || {},
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.warn('Security audit logging failed:', error)
      }
    } catch (error) {
      console.warn('Security audit logging failed:', error)
    }
  }

  // Check for suspicious activity patterns
  async checkSuspiciousActivity(): Promise<{
    isSuspicious: boolean
    reasons: string[]
    recommendations: string[]
  }> {
    try {
      const response = await fetch('/api/auth/security/check')
      if (!response.ok) {
        return { isSuspicious: false, reasons: [], recommendations: [] }
      }

      return await response.json()
    } catch (error) {
      console.error('Suspicious activity check failed:', error)
      return { isSuspicious: false, reasons: [], recommendations: [] }
    }
  }
}

// Singleton instance for executive session management
const sessionService = new ExecutiveSessionService()

export { sessionService as ExecutiveSessionService }
export type { SessionWarningConfig, SessionActivity }