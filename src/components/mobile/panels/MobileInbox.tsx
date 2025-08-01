'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Archive, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface MobileInboxProps {
  messages?: Message[]
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
}

// Swipe action configuration
const SWIPE_THRESHOLD = 100
const SWIPE_VELOCITY_THRESHOLD = 500

interface SwipeActions {
  left: {
    icon: typeof Archive
    label: 'Done'
    color: 'bg-green-500'
    action: 'archive'
  }
  right: {
    icon: typeof Clock
    label: 'Snooze' 
    color: 'bg-blue-500'
    action: 'snooze'
  }
}

const swipeActions: SwipeActions = {
  left: {
    icon: Archive,
    label: 'Done',
    color: 'bg-green-500',
    action: 'archive'
  },
  right: {
    icon: Clock,
    label: 'Snooze',
    color: 'bg-blue-500', 
    action: 'snooze'
  }
}

function MessageCard({ 
  message, 
  isSelected, 
  onSelect, 
  onArchive, 
  onSnooze 
}: {
  message: Message
  isSelected: boolean
  onSelect: (id: string) => void
  onArchive: (id: string) => void
  onSnooze: (id: string) => void
}) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showActions, setShowActions] = useState<'left' | 'right' | null>(null)
  const dragStartX = useRef(0)

  const handleDragStart = () => {
    setIsDragging(true)
    // Haptic feedback on drag start (if available)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    const x = info.offset.x
    setDragX(x)
    
    // Show action hints
    if (Math.abs(x) > 30) {
      setShowActions(x > 0 ? 'right' : 'left')
    } else {
      setShowActions(null)
    }
  }, [])

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const x = info.offset.x
    const velocity = info.velocity.x
    
    setIsDragging(false)
    setDragX(0)
    setShowActions(null)

    // Determine if swipe threshold was met
    const thresholdMet = Math.abs(x) > SWIPE_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD

    if (thresholdMet) {
      // Haptic feedback on successful swipe
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10])
      }

      if (x > 0) {
        // Swipe right - Snooze
        onSnooze(message.id)
      } else {
        // Swipe left - Archive/Done
        onArchive(message.id)
      }
    }
  }, [message.id, onArchive, onSnooze])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}m`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const priorityColor = message.priorityScore >= 80 
    ? 'border-red-400 bg-red-50' 
    : message.priorityScore >= 60 
    ? 'border-yellow-400 bg-yellow-50'
    : 'border-gold/30 bg-white'

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action backgrounds */}
      <div className="absolute inset-y-0 left-0 right-0 flex">
        {/* Right swipe action (Snooze) */}
        <motion.div
          className={cn(
            "flex items-center justify-center w-20",
            swipeActions.right.color,
            "text-white"
          )}
          animate={{
            x: showActions === 'right' ? 0 : -80,
            opacity: showActions === 'right' ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <swipeActions.right.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{swipeActions.right.label}</span>
          </div>
        </motion.div>

        {/* Left swipe action (Done) */}
        <motion.div
          className={cn(
            "flex items-center justify-center w-20 ml-auto",
            swipeActions.left.color,
            "text-white"
          )}
          animate={{
            x: showActions === 'left' ? 0 : 80,
            opacity: showActions === 'left' ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <swipeActions.left.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{swipeActions.left.label}</span>
          </div>
        </motion.div>
      </div>

      {/* Message card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative bg-white border-l-4 rounded-r-xl mb-3 p-4",
          "shadow-sm hover:shadow-md transition-all duration-200",
          "cursor-pointer active:scale-[0.98]",
          "min-h-[44px]", // Minimum touch target
          priorityColor,
          isSelected && "ring-2 ring-gold shadow-lg",
          !message.isRead && "font-medium"
        )}
        onClick={() => !isDragging && onSelect(message.id)}
        role="button"
        tabIndex={0}
        aria-label={`Message from ${message.sender}: ${message.subject}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(message.id)
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Sender and VIP indicator */}
            <div className="flex items-center space-x-2 mb-1">
              <span className={cn(
                "text-sm font-medium truncate",
                message.isVip ? "text-gold-600" : "text-navy-900"
              )}>
                {message.sender}
              </span>
              {message.isVip && (
                <span className="bg-gradient-gold text-navy-900 text-xs px-2 py-0.5 rounded-full font-medium">
                  VIP
                </span>
              )}
              {!message.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>

            {/* Subject */}
            <h3 className="text-sm font-medium text-navy-900 mb-1 truncate">
              {message.subject}
            </h3>

            {/* AI Summary or content preview */}
            <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
              {message.aiSummary || message.content}
            </p>
          </div>

          {/* Timestamp and priority indicator */}
          <div className="flex flex-col items-end space-y-1 ml-3">
            <span className="text-xs text-navy-500 whitespace-nowrap">
              {formatTime(message.createdAt)}
            </span>
            {message.priorityScore >= 80 && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function MobileInbox({
  messages = [],
  loading = false,
  error = null,
  selectedMessageId,
  onMessageSelect = () => {},
  onArchive = () => {},
  onSnooze = () => {},
  searchQuery = '',
  activeFilters = [],
  onFilterToggle = () => {},
  unreadCount = 0
}: MobileInboxProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Search functionality would be handled by parent component
  }

  // Filter messages based on active filters
  const filteredMessages = messages.filter(message => {
    if (activeFilters.includes('vip') && !message.isVip) return false
    if (activeFilters.includes('unread') && message.isRead) return false
    if (activeFilters.includes('high-priority') && message.priorityScore < 80) return false
    if (activeFilters.includes('today')) {
      const today = new Date().toDateString()
      const messageDate = new Date(message.createdAt).toDateString()
      if (today !== messageDate) return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search and filter header */}
      <div className="bg-white/95 backdrop-blur-luxury border-b border-gold/20 p-4 space-y-3">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-600 w-4 h-4" />
          <input
            type="search"
            placeholder="Search messages..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white/80 transition-all"
            style={{ minHeight: '44px' }} // Touch target
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-navy-600 hover:text-navy-900"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>

        {/* Unread count */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-navy-600">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-navy-500">
              Swipe right to snooze, left to mark done
            </span>
          </div>
        )}

        {/* Filter chips */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {[
              { id: 'unread', label: 'Unread' },
              { id: 'vip', label: 'VIP' },
              { id: 'high-priority', label: 'Urgent' },
              { id: 'today', label: 'Today' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onFilterToggle(id)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  "min-h-[36px]", // Touch target
                  activeFilters.includes(id)
                    ? "bg-gold text-navy-900 shadow-lg"
                    : "bg-white/80 text-navy-700 border border-gold/20"
                )}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-auto p-4 pb-20"> {/* Extra padding for bottom nav */}
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No messages found</h3>
            <p className="text-sm text-navy-600">
              {searchQuery || activeFilters.length > 0 
                ? "Try adjusting your search or filters"
                : "Your inbox is empty"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                isSelected={selectedMessageId === message.id}
                onSelect={onMessageSelect}
                onArchive={onArchive}
                onSnooze={onSnooze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileInbox