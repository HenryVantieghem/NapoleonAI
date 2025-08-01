'use client'

import React, { forwardRef, useCallback, useState } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ExecutiveTouchTargetProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'executive'
  variant?: 'default' | 'priority' | 'vip' | 'archive'
  touchFeedback?: boolean
  accessibilityLabel?: string
  description?: string
  disabled?: boolean
  loading?: boolean
  executiveMode?: boolean // Enhanced 56px touch targets for C-suite
}

const sizeMap = {
  sm: 'min-h-[40px] min-w-[40px]', // Below recommended, use sparingly
  md: 'min-h-[44px] min-w-[44px]', // Apple's recommended minimum
  lg: 'min-h-[48px] min-w-[48px]', // Google's recommended minimum
  executive: 'min-h-[56px] min-w-[56px]' // Premium experience for executives
}

const variantStyles = {
  default: {
    base: 'bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20',
    disabled: 'bg-white/5 border-white/10 text-white/30',
    loading: 'bg-white/15 border-white/25'
  },
  priority: {
    base: 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/25 to-yellow-500/20 hover:from-yellow-500/30 hover:via-yellow-400/35 hover:to-yellow-500/30 active:from-yellow-500/40 active:via-yellow-400/45 active:to-yellow-500/40 border border-yellow-400/30 shadow-lg shadow-yellow-500/20',
    disabled: 'bg-yellow-500/10 border-yellow-400/20 text-yellow-200/50',
    loading: 'bg-yellow-500/25 border-yellow-400/35'
  },
  vip: {
    base: 'bg-gradient-to-r from-purple-500/20 via-pink-500/25 to-purple-500/20 hover:from-purple-500/30 hover:via-pink-500/35 hover:to-purple-500/30 active:from-purple-500/40 active:via-pink-500/45 active:to-purple-500/40 border border-purple-400/30 shadow-lg shadow-purple-500/20',
    disabled: 'bg-purple-500/10 border-purple-400/20 text-purple-200/50',
    loading: 'bg-purple-500/25 border-purple-400/35'
  },
  archive: {
    base: 'bg-gradient-to-r from-gray-500/20 via-gray-400/25 to-gray-500/20 hover:from-gray-500/30 hover:via-gray-400/35 hover:to-gray-500/30 active:from-gray-500/40 active:via-gray-400/45 active:to-gray-500/40 border border-gray-400/30 shadow-lg shadow-gray-500/20',
    disabled: 'bg-gray-500/10 border-gray-400/20 text-gray-200/50',
    loading: 'bg-gray-500/25 border-gray-400/35'
  }
}

export const ExecutiveTouchTarget = forwardRef<HTMLDivElement, ExecutiveTouchTargetProps>(
  ({
    children,
    className,
    size = 'md',
    variant = 'default',
    touchFeedback = true,
    accessibilityLabel,
    description,
    disabled = false,
    loading = false,
    executiveMode = false,
    onClick,
    onTap,
    ...motionProps
  }, ref) => {
    const [isPressing, setIsPressing] = useState(false)
    
    // Use executive size when in executive mode
    const effectiveSize = executiveMode ? 'executive' : size
    
    // Get appropriate styles based on state
    const getStyles = useCallback(() => {
      const styleSet = variantStyles[variant]
      
      if (disabled) return styleSet.disabled
      if (loading) return styleSet.loading
      return styleSet.base
    }, [variant, disabled, loading])

    // Enhanced press handlers with haptic feedback
    const handlePressStart = useCallback(() => {
      if (disabled || loading) return
      
      setIsPressing(true)
      
      // Haptic feedback for press start
      if (touchFeedback && 'vibrate' in navigator) {
        const pattern = variant === 'priority' ? 30 : 
                      variant === 'vip' ? [15, 15, 15] : 15
        navigator.vibrate(pattern)
      }
    }, [disabled, loading, touchFeedback, variant])

    const handlePressEnd = useCallback(() => {
      setIsPressing(false)
    }, [])

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || loading) {
        event.preventDefault()
        return
      }
      
      // Success haptic feedback
      if (touchFeedback && 'vibrate' in navigator) {
        const pattern = variant === 'priority' ? [50, 25, 50] :
                      variant === 'vip' ? [30, 30, 30, 30, 100] :
                      variant === 'archive' ? [75, 25, 25] : 25
        navigator.vibrate(pattern)
      }
      
      onClick?.(event)
    }, [disabled, loading, touchFeedback, variant, onClick])

    // Animation variants
    const buttonVariants = {
      idle: { 
        scale: 1,
        boxShadow: variant === 'priority' ? '0 4px 20px rgba(212, 175, 55, 0.2)' :
                  variant === 'vip' ? '0 4px 20px rgba(147, 51, 234, 0.2)' :
                  '0 2px 10px rgba(255, 255, 255, 0.1)'
      },
      hover: { 
        scale: 1.02,
        boxShadow: variant === 'priority' ? '0 8px 30px rgba(212, 175, 55, 0.3)' :
                  variant === 'vip' ? '0 8px 30px rgba(147, 51, 234, 0.3)' :
                  '0 4px 20px rgba(255, 255, 255, 0.15)'
      },
      tap: { 
        scale: 0.95,
        boxShadow: variant === 'priority' ? '0 2px 15px rgba(212, 175, 55, 0.4)' :
                  variant === 'vip' ? '0 2px 15px rgba(147, 51, 234, 0.4)' :
                  '0 1px 5px rgba(255, 255, 255, 0.2)'
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          'relative flex items-center justify-center rounded-xl cursor-pointer select-none',
          'focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-transparent',
          'transition-all duration-200 ease-out',
          
          // Size classes
          sizeMap[effectiveSize],
          
          // Variant styles
          getStyles(),
          
          // State modifiers
          disabled && 'cursor-not-allowed',
          loading && 'cursor-wait',
          
          // Executive mode enhancements
          executiveMode && 'backdrop-blur-sm',
          
          className
        )}
        variants={buttonVariants}
        initial="idle"
        whileHover={!disabled && !loading ? "hover" : "idle"}
        whileTap={!disabled && !loading ? "tap" : "idle"}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
        onTap={onTap}
        
        // Accessibility
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={accessibilityLabel}
        aria-describedby={description ? `${accessibilityLabel}-desc` : undefined}
        aria-disabled={disabled}
        aria-busy={loading}
        
        // Enhanced keyboard navigation for executives
        onKeyDown={useCallback((event: React.KeyboardEvent) => {
          if (disabled || loading) return
          
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick(event as any)
          }
        }, [disabled, loading, handleClick])}
        
        {...motionProps}
      >
        {/* Loading state overlay */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={cn(
                'w-4 h-4 border-2 border-current border-t-transparent rounded-full',
                variant === 'priority' && 'text-yellow-400',
                variant === 'vip' && 'text-purple-400',
                variant === 'archive' && 'text-gray-400',
                variant === 'default' && 'text-white'
              )}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
        
        {/* Press feedback overlay */}
        {isPressing && touchFeedback && (
          <motion.div
            className="absolute inset-0 bg-white/10 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
          />
        )}
        
        {/* Content */}
        <div className={cn(
          'relative z-10 flex items-center justify-center w-full h-full',
          loading && 'opacity-0'
        )}>
          {children}
        </div>
        
        {/* Executive mode enhancement indicator */}
        {executiveMode && variant === 'priority' && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          />
        )}
        
        {/* Accessibility description */}
        {description && (
          <div id={`${accessibilityLabel}-desc`} className="sr-only">
            {description}
          </div>
        )}
      </motion.div>
    )
  }
)

ExecutiveTouchTarget.displayName = 'ExecutiveTouchTarget'

// Convenience wrapper for common executive actions
export const PriorityBoostButton = forwardRef<HTMLDivElement, Omit<ExecutiveTouchTargetProps, 'variant'>>((props, ref) => (
  <ExecutiveTouchTarget
    ref={ref}
    variant="priority"
    size="executive"
    accessibilityLabel="Boost message priority"
    description="Increases message priority and adds golden highlight"
    {...props}
  />
))

PriorityBoostButton.displayName = 'PriorityBoostButton'

export const VipActionButton = forwardRef<HTMLDivElement, Omit<ExecutiveTouchTargetProps, 'variant'>>((props, ref) => (
  <ExecutiveTouchTarget
    ref={ref}
    variant="vip"
    size="executive"
    accessibilityLabel="VIP contact action"
    description="Perform quick action for VIP contact"
    {...props}
  />
))

VipActionButton.displayName = 'VipActionButton'

export const QuickArchiveButton = forwardRef<HTMLDivElement, Omit<ExecutiveTouchTargetProps, 'variant'>>((props, ref) => (
  <ExecutiveTouchTarget
    ref={ref}
    variant="archive"
    size="executive"
    accessibilityLabel="Quick archive"
    description="Archive message with champagne animation"
    {...props}
  />
))

QuickArchiveButton.displayName = 'QuickArchiveButton'