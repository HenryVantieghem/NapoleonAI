'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { MobileTab } from './BottomNav'
import { cn } from '@/lib/utils'

// Lazy load heavy components for better performance
const MobileInbox = lazy(() => import('./panels/MobileInbox'))
const MobileVIP = lazy(() => import('./panels/MobileVIP'))
const MobileDigest = lazy(() => import('./panels/MobileDigest'))
const MobileSettings = lazy(() => import('./panels/MobileSettings'))

interface MobileRouterProps {
  activeTab: MobileTab
  className?: string
  // Pass down necessary props for each panel
  messages?: any[]
  loading?: boolean
  error?: string | null
  selectedMessageId?: string | null
  onMessageSelect?: (messageId: string) => void
  onArchive?: (messageId: string) => void
  onSnooze?: (messageId: string) => void
  searchQuery?: string
  activeFilters?: string[]
  onFilterToggle?: (filter: string) => void
  unreadCount?: number
  vipCount?: number
}

// Loading skeleton component
function LoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gold/20 rounded-full animate-pulse" />
        <div className="h-6 bg-gold/20 rounded w-32 animate-pulse" />
      </div>
      
      {/* Simulate content loading */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/50 rounded-xl p-4 space-y-2">
            <div className="h-4 bg-gold/20 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gold/20 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Error fallback component
function ErrorFallback({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-red-500 text-2xl">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-navy-600 mb-4">{error}</p>
          {retry && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-gold text-navy-900 rounded-lg font-medium hover:bg-gold/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Animation variants for panel transitions
const panelVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export default function MobileRouter({
  activeTab,
  className,
  messages = [],
  loading = false,
  error = null,
  selectedMessageId,
  onMessageSelect,
  onArchive,
  onSnooze,
  searchQuery = '',
  activeFilters = [],
  onFilterToggle,
  unreadCount = 0,
  vipCount = 0
}: MobileRouterProps) {
  
  const renderPanel = () => {
    const commonProps = {
      messages,
      loading,
      error,
      selectedMessageId,
      onMessageSelect,
      onArchive,
      onSnooze,
      searchQuery,
      activeFilters,
      onFilterToggle
    }

    switch (activeTab) {
      case 'inbox':
        return (
          <MobileInbox 
            {...commonProps}
            unreadCount={unreadCount}
            key="inbox"
          />
        )
      
      case 'vip':
        return (
          <MobileVIP 
            {...commonProps}
            vipCount={vipCount}
            key="vip"
          />
        )
      
      case 'digest':
        return (
          <MobileDigest 
            messages={messages}
            loading={loading}
            key="digest"
          />
        )
      
      case 'settings':
        return (
          <MobileSettings 
            key="settings"
          />
        )
      
      default:
        return null
    }
  }

  if (error && !loading) {
    return (
      <div className={cn("flex-1", className)}>
        <ErrorFallback error={error} />
      </div>
    )
  }

  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ 
            duration: 0.25, 
            ease: "easeInOut" 
          }}
          className="h-full"
        >
          <Suspense 
            fallback={
              <LoadingSkeleton 
                title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
              />
            }
          >
            {renderPanel()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}