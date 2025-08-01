'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AccessibilityAnnouncer } from '@/hooks/useAccessibility'

interface AccessibilityContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  isHighContrast: boolean
  isReducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  touchTargetSize: 'standard' | 'large'
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState({
    isHighContrast: false,
    isReducedMotion: false,
    fontSize: 'medium' as const,
    touchTargetSize: 'standard' as const
  })

  const [mounted, setMounted] = useState(false)

  // Load settings and apply them
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('napoleon-accessibility-settings')
        if (saved) {
          const parsedSettings = JSON.parse(saved)
          setSettings(prev => ({ ...prev, ...parsedSettings }))
        }
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error)
      }

      // Detect system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

      setSettings(prev => ({
        ...prev,
        isReducedMotion: prev.isReducedMotion || prefersReducedMotion,
        isHighContrast: prev.isHighContrast || prefersHighContrast
      }))

      setMounted(true)
    }

    if (typeof window !== 'undefined') {
      loadSettings()
    }
  }, [])

  // Apply settings to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // High contrast
    root.classList.toggle('high-contrast', settings.isHighContrast)
    
    // Reduced motion
    root.classList.toggle('reduce-motion', settings.isReducedMotion)
    
    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge')
    root.classList.add(`font-${settings.fontSize}`)
    
    // Touch targets
    root.classList.toggle('large-touch-targets', settings.touchTargetSize === 'large')

    // Save settings
    try {
      localStorage.setItem('napoleon-accessibility-settings', JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error)
    }
  }, [settings, mounted])

  // Announcement function
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('a11y-announcer')
    if (announcer) {
      announcer.textContent = message
      announcer.setAttribute('aria-live', priority)
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  }

  const contextValue: AccessibilityContextValue = {
    announce,
    isHighContrast: settings.isHighContrast,
    isReducedMotion: settings.isReducedMotion,
    fontSize: settings.fontSize,
    touchTargetSize: settings.touchTargetSize
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <AccessibilityAnnouncer />
      {/* Skip navigation link */}
      <a 
        href="#main-content" 
        className="skip-link"
        onClick={() => announce('Skipped to main content')}
      >
        Skip to main content
      </a>
      {children}
    </AccessibilityContext.Provider>
  )
}