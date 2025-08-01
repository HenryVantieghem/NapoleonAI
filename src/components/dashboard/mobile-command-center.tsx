'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Menu, 
  X, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  TrendingUp,
  Archive,
  Star,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface MobileCommandCenterProps {
  messages: any[]
  actionItems: any[]
  vipContacts: any[]
  onMessageSelect: (message: any) => void
  onActionComplete: (actionId: string) => void
  onRefresh: () => Promise<void>
}

interface SwipeAction {
  type: 'archive' | 'priority' | 'complete'
  threshold: number
  color: string
  icon: React.ReactNode
}

const swipeActions: { left: SwipeAction; right: SwipeAction } = {
  left: {
    type: 'archive',
    threshold: -100,
    color: '#6B7280',
    icon: <Archive size={20} />
  },
  right: {
    type: 'priority',
    threshold: 100,
    color: '#D4AF37',
    icon: <Star size={20} />
  }
}

export function MobileCommandCenter({
  messages,
  actionItems,
  vipContacts,
  onMessageSelect,
  onActionComplete,
  onRefresh
}: MobileCommandCenterProps) {
  const [activeTab, setActiveTab] = useState<'digest' | 'inbox' | 'actions' | 'vip'>('digest')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [swipeStates, setSwipeStates] = useState<Record<string, number>>({})
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh functionality
  const handlePullStart = useCallback((event: any, info: PanInfo) => {
    if (info.offset.y > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(info.offset.y, 120))
    }
  }, [])

  const handlePullEnd = useCallback(async (event: any, info: PanInfo) => {
    if (info.offset.y > 80 && containerRef.current?.scrollTop === 0) {
      setIsRefreshing(true)
      try {
        await onRefresh()
        // Haptic feedback simulation
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
  }, [onRefresh])

  // Swipe gesture handling
  const handleSwipeStart = useCallback((messageId: string) => {
    setSwipeStates(prev => ({ ...prev, [messageId]: 0 }))
  }, [])

  const handleSwipe = useCallback((messageId: string, info: PanInfo) => {
    const offset = Math.max(-150, Math.min(150, info.offset.x))
    setSwipeStates(prev => ({ ...prev, [messageId]: offset }))
  }, [])

  const handleSwipeEnd = useCallback((messageId: string, info: PanInfo) => {
    const offset = info.offset.x
    let actionTriggered = false

    if (offset <= swipeActions.left.threshold) {
      // Archive action
      console.log('Archive message:', messageId)
      actionTriggered = true
    } else if (offset >= swipeActions.right.threshold) {
      // Priority boost action
      console.log('Priority boost message:', messageId)
      actionTriggered = true
    }

    if (actionTriggered && navigator.vibrate) {
      navigator.vibrate([30, 30, 30]) // Triple tap haptic
    }

    // Reset swipe state
    setSwipeStates(prev => ({ ...prev, [messageId]: 0 }))
  }, [])

  const renderGlassmorphicCard = (children: React.ReactNode, className?: string) => (
    <motion.div
      className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )

  const renderDigestTab = () => (
    <div className="space-y-4">
      {/* Executive Summary Card */}
      {renderGlassmorphicCard(
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Strategic Digest</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">High Priority Messages</span>
              <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                {messages.filter(m => m.priority_score >= 80).length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">VIP Communications</span>
              <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                {messages.filter(m => m.is_vip).length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pending Actions</span>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                {actionItems.filter(a => a.status === 'pending').length}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Top Priority Messages */}
      {renderGlassmorphicCard(
        <div className="p-6">
          <h4 className="text-lg font-medium text-white mb-4">Requires Immediate Attention</h4>
          <div className="space-y-3">
            {messages
              .filter(m => m.priority_score >= 80)
              .slice(0, 3)
              .map(message => (
                <motion.div
                  key={message.id}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onMessageSelect(message)}
                >
                  <div className="flex items-start gap-3">
                    {message.is_vip && (
                      <Star className="text-yellow-400 flex-shrink-0 mt-1" size={16} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {message.sender_name || message.sender_email}
                      </p>
                      <p className="text-xs text-white/60 truncate mt-1">
                        {message.subject}
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        {message.ai_summary}
                      </p>
                    </div>
                    <Badge 
                      className={`text-xs ${
                        message.priority_score >= 90 
                          ? 'bg-red-500/20 text-red-200 border-red-500/30'
                          : 'bg-orange-500/20 text-orange-200 border-orange-500/30'
                      }`}
                    >
                      {message.priority_score}
                    </Badge>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderInboxTab = () => (
    <div className="space-y-2">
      {messages.map(message => {
        const swipeOffset = swipeStates[message.id] || 0
        
        return (
          <motion.div
            key={message.id}
            className="relative overflow-hidden"
            style={{ x: swipeOffset }}
            drag="x"
            dragConstraints={{ left: -150, right: 150 }}
            onDragStart={() => handleSwipeStart(message.id)}
            onDrag={(event, info) => handleSwipe(message.id, info)}
            onDragEnd={(event, info) => handleSwipeEnd(message.id, info)}
            whileTap={{ scale: 0.98 }}
          >
            {/* Swipe Action Backgrounds */}
            <AnimatePresence>
              {swipeOffset < -50 && (
                <motion.div
                  className="absolute inset-y-0 right-0 flex items-center justify-center bg-gray-600/50 text-white px-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ width: Math.abs(swipeOffset) }}
                >
                  <Archive size={20} />
                </motion.div>
              )}
              {swipeOffset > 50 && (
                <motion.div
                  className="absolute inset-y-0 left-0 flex items-center justify-center bg-yellow-600/50 text-white px-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ width: swipeOffset }}
                >
                  <Star size={20} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Card */}
            {renderGlassmorphicCard(
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {message.is_vip && (
                    <Star className="text-yellow-400 flex-shrink-0 mt-1" size={16} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {message.sender_name || message.sender_email}
                      </p>
                      <Badge 
                        className={`text-xs ${
                          message.priority_score >= 80 
                            ? 'bg-red-500/20 text-red-200 border-red-500/30'
                            : message.priority_score >= 60
                            ? 'bg-orange-500/20 text-orange-200 border-orange-500/30'
                            : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                        }`}
                      >
                        {message.priority_score}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/60 truncate mb-2">
                      {message.subject}
                    </p>
                    <p className="text-xs text-white/50 line-clamp-2">
                      {message.ai_summary || message.content.substring(0, 100) + '...'}
                    </p>
                    <p className="text-xs text-white/40 mt-2">
                      {new Date(message.message_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>,
              'mb-2'
            )}
          </motion.div>
        )
      })}
    </div>
  )

  const renderActionsTab = () => (
    <div className="space-y-2">
      {actionItems.map(action => (
        <motion.div
          key={action.id}
          whileTap={{ scale: 0.98 }}
        >
          {renderGlassmorphicCard(
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-1"
                  onClick={() => onActionComplete(action.id)}
                >
                  <CheckSquare size={16} />
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white mb-1">
                    {action.title}
                  </p>
                  <p className="text-xs text-white/60 mb-2">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`text-xs ${
                        action.priority === 'critical' || action.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-200 border-red-500/30'
                          : action.priority === 'high'
                          ? 'bg-orange-500/20 text-orange-200 border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                      }`}
                    >
                      {action.priority}
                    </Badge>
                    {action.due_date && (
                      <span className="text-xs text-white/50">
                        Due: {new Date(action.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>,
            'mb-2'
          )}
        </motion.div>
      ))}
    </div>
  )

  const renderVipTab = () => (
    <div className="space-y-2">
      {vipContacts.map(contact => (
        <motion.div
          key={contact.id}
          whileTap={{ scale: 0.98 }}
        >
          {renderGlassmorphicCard(
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {contact.name?.charAt(0) || contact.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {contact.name || contact.email}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {contact.relationship_type}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 text-xs">
                      Priority {contact.priority_level}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>,
            'mb-2'
          )}
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-full p-3 border border-white/20">
              <RefreshCw 
                className={`text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} 
                size={20} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        ref={containerRef}
        className="pb-24 px-4 pt-6 overflow-auto"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDrag={handlePullStart}
        onDragEnd={handlePullEnd}
        style={{ y: pullDistance * 0.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'digest' && renderDigestTab()}
            {activeTab === 'inbox' && renderInboxTab()}
            {activeTab === 'actions' && renderActionsTab()}
            {activeTab === 'vip' && renderVipTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Glassmorphic Bottom Navigation */}
      <motion.div
        className="fixed bottom-6 left-4 right-4 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-4">
          <div className="flex justify-around items-center">
            {[
              { id: 'digest', icon: TrendingUp, label: 'Digest' },
              { id: 'inbox', icon: MessageSquare, label: 'Inbox' },
              { id: 'actions', icon: CheckSquare, label: 'Actions' },
              { id: 'vip', icon: Users, label: 'VIP' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-yellow-500/20 text-yellow-200' 
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
                whileTap={{ scale: 0.95 }}
                style={{
                  minHeight: '44px', // Ensure 44px touch target
                  minWidth: '44px'
                }}
              >
                <tab.icon size={20} />
                <span className="text-xs font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="w-1 h-1 bg-yellow-400 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}