'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Reply, Crown, Trash2, Archive, Clock, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  color: string
  action: () => void
  destructive?: boolean
}

interface QuickActionsSheetProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  messageSender: string
  messageSubject: string
  isVip?: boolean
  onReply?: () => void
  onMarkVip?: () => void
  onArchive?: () => void
  onSnooze?: () => void
  onDelete?: () => void
  onToggleVip?: () => void
}

export default function QuickActionsSheet({
  isOpen,
  onClose,
  messageId,
  messageSender,
  messageSubject,
  isVip = false,
  onReply = () => {},
  onMarkVip = () => {},
  onArchive = () => {},
  onSnooze = () => {},
  onDelete = () => {},
  onToggleVip = () => {}
}: QuickActionsSheetProps) {

  const handleAction = (actionFn: () => void) => {
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    actionFn()
    onClose()
  }

  const actions: QuickAction[] = [
    {
      id: 'reply',
      label: 'Reply',
      icon: Reply,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleAction(onReply)
    },
    {
      id: 'vip',
      label: isVip ? 'Remove VIP' : 'Mark VIP',
      icon: Crown,
      color: isVip 
        ? 'bg-gray-500 hover:bg-gray-600' 
        : 'bg-gold hover:bg-gold/90',
      action: () => handleAction(onToggleVip)
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleAction(onArchive)
    },
    {
      id: 'snooze',
      label: 'Snooze',
      icon: Clock,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => handleAction(onSnooze)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => handleAction(onDelete),
      destructive: true
    }
  ]

  const sheetVariants = {
    hidden: {
      y: '100%',
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500,
        duration: 0.3
      }
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const actionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      }
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-navy-900 truncate">
                    Quick Actions
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-navy-600 truncate">
                      From: {messageSender}
                    </p>
                    <p className="text-sm text-navy-500 truncate">
                      {messageSubject}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="Close quick actions"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="p-6 pb-8">
              <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    custom={index}
                    variants={actionVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl text-white transition-all",
                      "min-h-[80px] shadow-lg",
                      action.color,
                      action.destructive && "ring-2 ring-red-200"
                    )}
                    style={{
                      backgroundImage: action.id === 'vip' && !isVip 
                        ? 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)'
                        : undefined
                    }}
                  >
                    <action.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 text-center">
                  Long press messages for quick access to these actions
                </p>
              </div>
            </div>

            {/* Safe area for iPhone */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}