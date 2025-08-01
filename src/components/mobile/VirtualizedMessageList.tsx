'use client'

import { memo, useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { cn } from '@/lib/utils'
import GestureMessageCard from './GestureMessageCard'

interface Message {
  id: string
  sender: string
  subject: string
  content: string
  createdAt: string
  isVip: boolean
  priorityScore: number
  isRead: boolean
  aiSummary?: string
}

interface VirtualizedMessageListProps {
  messages: Message[]
  height: number
  selectedMessageId?: string | null
  onMessageSelect?: (messageId: string) => void
  onArchive?: (messageId: string) => void
  onSnooze?: (messageId: string) => void
  onReply?: (messageId: string) => void
  onToggleVip?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  loading?: boolean
  className?: string
}

// Item height should include message card + margin
const ITEM_HEIGHT = 88 // 72px card + 16px margin

// Memoized row component to prevent unnecessary re-renders
const MessageRow = memo(({ 
  index, 
  style, 
  data 
}: {
  index: number
  style: React.CSSProperties
  data: {
    messages: Message[]
    selectedMessageId: string | null
    onMessageSelect: (id: string) => void
    onArchive: (id: string) => void
    onSnooze: (id: string) => void
    onReply: (id: string) => void
    onToggleVip: (id: string) => void
    onDelete: (id: string) => void
  }
}) => {
  const message = data.messages[index]
  
  if (!message) {
    return (
      <div style={style} className="px-4">
        <div className="bg-gray-100 rounded-xl h-16 animate-pulse" />
      </div>
    )
  }

  return (
    <div style={style} className="px-4">
      <GestureMessageCard
        message={message}
        isSelected={data.selectedMessageId === message.id}
        onSelect={data.onMessageSelect}
        onArchive={data.onArchive}
        onSnooze={data.onSnooze}
        onReply={data.onReply}
        onToggleVip={data.onToggleVip}
        onDelete={data.onDelete}
      />
    </div>
  )
})

MessageRow.displayName = 'MessageRow'

// Loading skeleton for better perceived performance
const LoadingSkeleton = memo(({ count = 5 }: { count?: number }) => (
  <div className="px-4 space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 bg-gold/20 rounded w-32" />
          <div className="h-3 bg-gold/20 rounded w-12" />
        </div>
        <div className="h-3 bg-gold/20 rounded w-48 mb-2" />
        <div className="h-3 bg-gold/20 rounded w-full" />
      </div>
    ))}
  </div>
))

LoadingSkeleton.displayName = 'LoadingSkeleton'

// Empty state component
const EmptyState = memo(({ 
  title = "No messages found",
  description = "Your messages will appear here"
}: {
  title?: string
  description?: string
}) => (
  <div className="flex flex-col items-center justify-center h-64 text-center px-8">
    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">📭</span>
    </div>
    <h3 className="text-lg font-semibold text-navy-900 mb-2">{title}</h3>
    <p className="text-sm text-navy-600">{description}</p>
  </div>
))

EmptyState.displayName = 'EmptyState'

export default function VirtualizedMessageList({
  messages,
  height,
  selectedMessageId = null,
  onMessageSelect = () => {},
  onArchive = () => {},
  onSnooze = () => {},
  onReply = () => {},
  onToggleVip = () => {},
  onDelete = () => {},
  loading = false,
  className
}: VirtualizedMessageListProps) {
  
  // Memoize the data object to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    messages,
    selectedMessageId,
    onMessageSelect,
    onArchive,
    onSnooze,
    onReply,
    onToggleVip,
    onDelete
  }), [
    messages,
    selectedMessageId,
    onMessageSelect,
    onArchive,
    onSnooze,
    onReply,
    onToggleVip,
    onDelete
  ])

  // Custom scrolling behavior for better mobile experience
  const onItemsRendered = useCallback((props: any) => {
    // Could add logic here for infinite loading, analytics, etc.
  }, [])

  if (loading) {
    return (
      <div className={cn("flex-1", className)}>
        <LoadingSkeleton />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1", className)}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={cn("flex-1", className)}>
      <List
        height={height}
        itemCount={messages.length}
        itemSize={ITEM_HEIGHT}
        itemData={itemData}
        onItemsRendered={onItemsRendered}
        overscanCount={3} // Render a few extra items for smoother scrolling
        className="scrollbar-hide" // Hide scrollbar for cleaner mobile look
      >
        {MessageRow}
      </List>
    </div>
  )
}

// Hook for calculating optimal list height
export function useOptimalListHeight(containerRef: React.RefObject<HTMLElement>) {
  const calculateHeight = useCallback(() => {
    if (!containerRef.current) return 400 // fallback height
    
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    // Account for header, search bar, bottom nav, etc.
    const reservedSpace = 200 // Adjust based on your layout
    const availableHeight = viewportHeight - containerRect.top - reservedSpace
    
    return Math.max(300, availableHeight) // Minimum 300px height
  }, [])

  return calculateHeight
}

// Performance monitoring hook
export function useListPerformance() {
  const measureScrollPerformance = useCallback((startTime: number) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Log performance if it's slow (>16ms for 60fps)
    if (duration > 16) {
      console.warn(`Slow scroll detected: ${duration.toFixed(2)}ms`)
    }
    
    // Could send to analytics service
    return duration
  }, [])

  const measureRenderPerformance = useCallback((itemCount: number) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      const itemsPerMs = itemCount / duration
      
      if (itemsPerMs < 1) {
        console.warn(`Slow render detected: ${itemCount} items in ${duration.toFixed(2)}ms`)
      }
      
      return { duration, itemsPerMs }
    }
  }, [])

  return {
    measureScrollPerformance,
    measureRenderPerformance
  }
}