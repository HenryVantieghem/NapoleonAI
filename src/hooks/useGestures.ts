'use client'

import { useRef, useCallback, useState } from 'react'
import { PanInfo } from 'framer-motion'

export interface GestureConfig {
  swipeThreshold: number
  velocityThreshold: number
  longPressDelay: number
  hapticFeedback: boolean
}

export interface GestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void  
  onLongPress?: () => void
  onTap?: () => void
  onPriorityBoost?: () => void // Executive-specific: Golden swipe for VIP boost
  onQuickArchive?: () => void // Executive-specific: Quick archive with champagne animation
  onVipAction?: () => void // Executive-specific: VIP contact quick action
}

export interface SwipeState {
  isDragging: boolean
  dragX: number
  showActionHint: 'left' | 'right' | null
}

const defaultConfig: GestureConfig = {
  swipeThreshold: 120, // Increased for executive precision
  velocityThreshold: 600, // Higher threshold for intentional gestures
  longPressDelay: 400, // Faster for executive efficiency
  hapticFeedback: true
}

export function useGestures(
  handlers: GestureHandlers,
  config: Partial<GestureConfig> = {}
) {
  const fullConfig = { ...defaultConfig, ...config }
  const longPressTimer = useRef<NodeJS.Timeout>()
  const dragStartTime = useRef<number>(0)
  const isDragging = useRef(false)
  const hasTriggeredLongPress = useRef(false)

  // Enhanced haptic feedback helper with executive patterns
  const triggerHaptic = useCallback((pattern: number | number[] = 50, type?: 'success' | 'priority' | 'vip' | 'archive') => {
    if (fullConfig.hapticFeedback && typeof window !== 'undefined' && 'vibrate' in navigator) {
      let hapticPattern: number | number[]

      switch (type) {
        case 'success':
          hapticPattern = [50, 25, 50, 25, 100] // Executive success pattern
          break
        case 'priority':
          hapticPattern = [100, 50, 100] // Golden priority boost
          break
        case 'vip':
          hapticPattern = [30, 30, 30, 30, 200] // VIP recognition pattern
          break
        case 'archive':
          hapticPattern = [75, 25, 25] // Quick archive confirmation
          break
        default:
          hapticPattern = pattern
      }

      navigator.vibrate(hapticPattern)
    }
  }, [fullConfig.hapticFeedback])

  // Handle drag start
  const handleDragStart = useCallback(() => {
    isDragging.current = true
    dragStartTime.current = Date.now()
    hasTriggeredLongPress.current = false
    
    // Clear any existing long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (isDragging.current && !hasTriggeredLongPress.current) {
          hasTriggeredLongPress.current = true
          triggerHaptic([100, 50, 100]) // Long press haptic pattern
          handlers.onLongPress?.()
        }
      }, fullConfig.longPressDelay)
    }

    // Light haptic feedback on drag start
    triggerHaptic(10)
  }, [handlers, fullConfig.longPressDelay, triggerHaptic])

  // Handle drag motion
  const handleDrag = useCallback((event: any, info: PanInfo) => {
    const x = info.offset.x
    const dragDuration = Date.now() - dragStartTime.current

    // Cancel long press if significant drag movement
    if (Math.abs(x) > 30 && longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      hasTriggeredLongPress.current = false
    }

    return {
      dragX: x,
      showActionHint: Math.abs(x) > 30 ? (x > 0 ? 'right' : 'left') : null,
      isDragging: true
    }
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const x = info.offset.x
    const velocity = info.velocity.x
    const dragDuration = Date.now() - dragStartTime.current

    isDragging.current = false

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    // Determine if this was a tap, long press, or swipe
    const wasQuickTap = dragDuration < 200 && Math.abs(x) < 10
    const wasLongPress = hasTriggeredLongPress.current
    const wasSwipe = Math.abs(x) > fullConfig.swipeThreshold || 
                     Math.abs(velocity) > fullConfig.velocityThreshold

    if (wasSwipe && !wasLongPress) {
      // Enhanced executive swipe actions
      if (x > 0) {
        // Right swipe - Priority boost or VIP action
        if (x > fullConfig.swipeThreshold * 1.5 && handlers.onPriorityBoost) {
          triggerHaptic([], 'priority') // Golden priority boost
          handlers.onPriorityBoost()
        } else if (handlers.onSwipeRight) {
          triggerHaptic([], 'success')
          handlers.onSwipeRight()
        }
      } else if (x < 0) {
        // Left swipe - Archive or quick action
        if (Math.abs(x) > fullConfig.swipeThreshold * 1.5 && handlers.onQuickArchive) {
          triggerHaptic([], 'archive') // Quick archive with champagne animation
          handlers.onQuickArchive()
        } else if (handlers.onSwipeLeft) {
          triggerHaptic([], 'success')
          handlers.onSwipeLeft()
        }
      }
    } else if (wasQuickTap && !wasLongPress && handlers.onTap) {
      // Trigger tap action
      triggerHaptic(25) // Light tap haptic
      handlers.onTap()
    }

    // Reset state
    hasTriggeredLongPress.current = false

    return {
      dragX: 0,
      showActionHint: null,
      isDragging: false
    }
  }, [
    handlers,
    fullConfig.swipeThreshold,
    fullConfig.velocityThreshold,
    triggerHaptic
  ])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  return {
    handleDragStart,
    handleDrag,
    handleDragEnd,
    cleanup,
    config: fullConfig
  }
}

// Hook for managing swipe state
export function useSwipeState() {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isDragging: false,
    dragX: 0,
    showActionHint: null
  })

  const updateSwipeState = useCallback((updates: Partial<SwipeState>) => {
    setSwipeState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetSwipeState = useCallback(() => {
    setSwipeState({
      isDragging: false,
      dragX: 0,
      showActionHint: null
    })
  }, [])

  return {
    swipeState,
    updateSwipeState,
    resetSwipeState
  }
}

// Accessibility helpers for gesture interactions
export function useGestureA11y() {
  const announceAction = useCallback((action: string) => {
    // Create a temporary element for screen reader announcement
    if (typeof window !== 'undefined') {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = action
      
      document.body.appendChild(announcement)
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, [])

  const getGestureInstructions = useCallback(() => {
    return {
      'aria-describedby': 'gesture-help',
      'aria-label': 'Swipe right to snooze, swipe left to archive, long press for quick actions'
    }
  }, [])

  return {
    announceAction,
    getGestureInstructions
  }
}