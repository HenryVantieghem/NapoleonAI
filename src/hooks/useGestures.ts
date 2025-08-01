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
}

export interface SwipeState {
  isDragging: boolean
  dragX: number
  showActionHint: 'left' | 'right' | null
}

const defaultConfig: GestureConfig = {
  swipeThreshold: 100,
  velocityThreshold: 500,
  longPressDelay: 500,
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

  // Haptic feedback helper
  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if (fullConfig.hapticFeedback && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
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
      // Trigger swipe action
      if (x > 0 && handlers.onSwipeRight) {
        triggerHaptic([50, 25, 50]) // Swipe success haptic
        handlers.onSwipeRight()
      } else if (x < 0 && handlers.onSwipeLeft) {
        triggerHaptic([50, 25, 50]) // Swipe success haptic
        handlers.onSwipeLeft()
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