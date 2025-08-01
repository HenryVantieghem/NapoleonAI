'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  touchTargetSize: 'standard' | 'large'
  screenReader: boolean
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  touchTargetSize: 'standard',
  screenReader: false
}

const STORAGE_KEY = 'napoleon-accessibility-settings'

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error)
      }
    }
    
    // Detect user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
      highContrast: prev.highContrast || contrastQuery.matches
    }))
    
    setMounted(true)
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      
      // Apply settings to document
      applySettingsToDocument(settings)
    }
  }, [settings, mounted, applySettingsToDocument])

  const applySettingsToDocument = useCallback((settings: AccessibilitySettings) => {
    const root = document.documentElement
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${settings.fontSize}`)
    
    // Touch target size
    if (settings.touchTargetSize === 'large') {
      root.classList.add('large-touch-targets')
    } else {
      root.classList.remove('large-touch-targets')
    }
  }, [])

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('a11y-announcer')
    if (announcer) {
      announcer.textContent = message
      announcer.setAttribute('aria-live', priority)
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  }, [])

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      // Announce focus change for screen readers
      const label = element.getAttribute('aria-label') || element.textContent || 'element'
      announce(`Focused on ${label}`)
    }
  }, [announce])

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number
  ) => {
    let newIndex = currentIndex
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        newIndex = Math.min(currentIndex + 1, items.length - 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return currentIndex
    }
    
    items[newIndex]?.focus()
    return newIndex
  }, [])

  return {
    settings,
    mounted,
    updateSetting,
    toggleHighContrast,
    toggleReducedMotion,
    resetToDefaults,
    announce,
    focusElement,
    handleKeyboardNavigation,
    
    // Computed values
    isHighContrast: settings.highContrast,
    isReducedMotion: settings.reducedMotion,
    fontSize: settings.fontSize,
    touchTargetSize: settings.touchTargetSize
  }
}

// Component for screen reader announcements
export function AccessibilityAnnouncer() {
  return (
    <div
      id="a11y-announcer"
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  )
}

// Hook for accessible form handling
export function useAccessibleForm() {
  const { announce } = useAccessibility()
  
  const announceError = useCallback((fieldName: string, error: string) => {
    announce(`Error in ${fieldName}: ${error}`, 'assertive')
  }, [announce])
  
  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])
  
  const validateTouchTarget = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const minSize = 44 // WCAG minimum touch target size
    
    if (rect.width < minSize || rect.height < minSize) {
      console.warn(`Touch target too small: ${rect.width}x${rect.height}px. Minimum: ${minSize}x${minSize}px`, element)
      return false
    }
    
    return true
  }, [])
  
  return {
    announceError,
    announceSuccess,
    validateTouchTarget
  }
}

// Mobile accessibility utilities
export function useMobileAccessibility() {
  const { settings, announce } = useAccessibility()
  
  const handleSwipeAnnouncement = useCallback((direction: 'left' | 'right', action: string) => {
    announce(`Swiped ${direction}: ${action}`)
  }, [announce])
  
  const handleLongPressAnnouncement = useCallback((element: string) => {
    announce(`Long pressed on ${element}. Additional options available.`)
  }, [announce])
  
  const getTouchTargetClass = useCallback(() => {
    return settings.touchTargetSize === 'large' 
      ? 'min-h-[56px] min-w-[56px]' // Larger for better accessibility
      : 'min-h-[44px] min-w-[44px]' // Standard WCAG minimum
  }, [settings.touchTargetSize])
  
  const getMotionClass = useCallback(() => {
    return settings.reducedMotion 
      ? 'motion-reduce:transition-none motion-reduce:animate-none'
      : ''
  }, [settings.reducedMotion])
  
  return {
    handleSwipeAnnouncement,
    handleLongPressAnnouncement,
    getTouchTargetClass,
    getMotionClass
  }
}