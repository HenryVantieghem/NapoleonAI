'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Archive, Clock, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGestures, useGestureA11y } from '@/hooks/useGestures'
import QuickActionsSheet from './QuickActionsSheet'

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

interface GestureMessageCardProps {
  message: Message
  isSelected?: boolean
  onSelect?: (id: string) => void
  onArchive?: (id: string) => void
  onSnooze?: (id: string) => void
  onReply?: (id: string) => void
  onToggleVip?: (id: string) => void
  onDelete?: (id: string) => void
  disabled?: boolean
}

interface SwipeAction {
  type: 'left' | 'right'
  icon: React.ComponentType<any>
  label: string
  color: string
  textColor: string
}

const swipeActions: Record<'left' | 'right', SwipeAction> = {
  left: {
    type: 'left',
    icon: Archive,
    label: 'Done',
    color: 'bg-green-500',
    textColor: 'text-white'
  },
  right: {
    type: 'right',
    icon: Clock,
    label: 'Snooze',
    color: 'bg-blue-500',
    textColor: 'text-white'
  }
}

export default function GestureMessageCard({
  message,
  isSelected = false,
  onSelect = () => {},
  onArchive = () => {},
  onSnooze = () => {},
  onReply = () => {},
  onToggleVip = () => {},
  onDelete = () => {},
  disabled = false
}: GestureMessageCardProps) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showActionHint, setShowActionHint] = useState<'left' | 'right' | null>(null)
  const [showQuickActions, setShowQuickActions] = useState(false)

  const { announceAction, getGestureInstructions } = useGestureA11y()

  const handleSwipeLeft = useCallback(() => {
    if (disabled) return
    announceAction('Message archived')
    onArchive(message.id)
  }, [disabled, message.id, onArchive, announceAction])

  const handleSwipeRight = useCallback(() => {
    if (disabled) return
    announceAction('Message snoozed')
    onSnooze(message.id)
  }, [disabled, message.id, onSnooze, announceAction])

  const handleTap = useCallback(() => {
    if (disabled) return
    onSelect(message.id)
  }, [disabled, message.id, onSelect])

  const handleLongPress = useCallback(() => {
    if (disabled) return
    announceAction('Quick actions menu opened')
    setShowQuickActions(true)
  }, [disabled, announceAction])

  const { handleDragStart, handleDrag, handleDragEnd } = useGestures(
    {
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
      onTap: handleTap,
      onLongPress: handleLongPress
    },
    {
      swipeThreshold: 100,
      velocityThreshold: 500,
      longPressDelay: 500,
      hapticFeedback: true
    }
  )

  const onDragStart = useCallback(() => {
    if (disabled) return
    setIsDragging(true)
    handleDragStart()
  }, [disabled, handleDragStart])

  const onDrag = useCallback((event: any, info: any) => {
    if (disabled) return
    const result = handleDrag(event, info)
    setDragX(result.dragX)
    setShowActionHint(result.showActionHint)
  }, [disabled, handleDrag])

  const onDragEnd = useCallback((event: any, info: any) => {
    if (disabled) return
    const result = handleDragEnd(event, info)
    setDragX(result.dragX)
    setShowActionHint(result.showActionHint)
    setIsDragging(result.isDragging)
  }, [disabled, handleDragEnd])

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

  const SwipeActionBackground = ({ action }: { action: SwipeAction }) => (
    <motion.div
      className={cn(
        "absolute inset-y-0 flex items-center justify-center w-20",
        action.color,
        action.textColor,
        action.type === 'right' ? 'left-0' : 'right-0'
      )}
      animate={{
        x: showActionHint === action.type 
          ? action.type === 'right' ? 0 : 0
          : action.type === 'right' ? -80 : 80,
        opacity: showActionHint === action.type ? 1 : 0
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center">
        <action.icon className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{action.label}</span>
      </div>
    </motion.div>
  )

  return (
    <>
      <div className="relative overflow-hidden mb-3">
        {/* Swipe action backgrounds */}
        <SwipeActionBackground action={swipeActions.right} />
        <SwipeActionBackground action={swipeActions.left} />

        {/* Message card */}
        <motion.div
          drag={disabled ? false : "x"}
          dragConstraints={{ left: -150, right: 150 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          animate={{ x: dragX }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "relative bg-white border-l-4 rounded-r-xl p-4",
            "shadow-sm hover:shadow-md transition-all duration-200",
            "cursor-pointer select-none",
            "min-h-[72px] mobile-touch-target", // Minimum touch target with class
            priorityColor,
            isSelected && "ring-2 ring-gold shadow-lg",
            !message.isRead && "font-medium",
            disabled && "opacity-50 cursor-not-allowed",
            isDragging && "shadow-lg z-10"
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          {...getGestureInstructions()}
          aria-label={`Message from ${message.sender}: ${message.subject}. ${message.isVip ? 'VIP message. ' : ''}${!message.isRead ? 'Unread. ' : ''}`}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleTap()
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              handleSwipeLeft()
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              handleSwipeRight()
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
                  <motion.span 
                    className="bg-gradient-gold text-navy-900 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    VIP
                  </motion.span>
                )}
                {!message.isRead && (
                  <motion.div 
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Subject */}
              <h3 className="text-sm font-medium text-navy-900 mb-1 truncate leading-tight">
                {message.subject}
              </h3>

              {/* AI Summary or content preview */}
              <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
                {message.aiSummary || message.content}
              </p>
            </div>

            {/* Timestamp and priority indicator */}
            <div className="flex flex-col items-end space-y-1 ml-3 flex-shrink-0">
              <span className="text-xs text-navy-500 whitespace-nowrap">
                {formatTime(message.createdAt)}
              </span>
              {message.priorityScore >= 80 && (
                <motion.div 
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
          </div>

          {/* Drag hint overlay */}
          {isDragging && showActionHint && (
            <motion.div
              className="absolute inset-0 bg-black/5 rounded-r-xl pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium",
                showActionHint === 'left' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              )}>
                {showActionHint === 'left' ? 'Release to archive' : 'Release to snooze'}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Accessibility helper text */}
        <div id="gesture-help" className="sr-only">
          Swipe right to snooze message, swipe left to archive message, long press for more actions
        </div>
      </div>

      {/* Quick Actions Sheet */}
      <QuickActionsSheet
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        messageId={message.id}
        messageSender={message.sender}
        messageSubject={message.subject}
        isVip={message.isVip}
        onReply={() => onReply(message.id)}
        onArchive={() => onArchive(message.id)}
        onSnooze={() => onSnooze(message.id)}
        onDelete={() => onDelete(message.id)}
        onToggleVip={() => onToggleVip(message.id)}
      />
    </>
  )
}