'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { useRealtimeMessages } from '@/lib/hooks/use-realtime-messages'
import { cn } from '@/lib/utils'

export function RealtimeStatus() {
  const { processingCount, lastUpdate, loading } = useRealtimeMessages()

  const getStatusInfo = () => {
    if (loading) {
      return {
        icon: Loader2,
        text: 'Loading messages...',
        color: 'text-navy',
        bgColor: 'bg-navy/10',
        animate: true
      }
    }

    if (processingCount > 0) {
      return {
        icon: Zap,
        text: `Processing ${processingCount} message${processingCount > 1 ? 's' : ''}...`,
        color: 'text-gold',
        bgColor: 'bg-gold/20',
        animate: true
      }
    }

    if (lastUpdate) {
      const updateTime = new Date(lastUpdate)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60))
      
      if (diffMinutes < 1) {
        return {
          icon: CheckCircle,
          text: 'Just updated',
          color: 'text-green-600',
          bgColor: 'bg-green/20',
          animate: false
        }
      } else if (diffMinutes < 60) {
        return {
          icon: CheckCircle,
          text: `Updated ${diffMinutes}m ago`,
          color: 'text-green-600',
          bgColor: 'bg-green/20',
          animate: false
        }
      }
    }

    return {
      icon: AlertCircle,
      text: 'Ready for updates',
      color: 'text-gray-500',
      bgColor: 'bg-gray/10',
      animate: false
    }
  }

  const status = getStatusInfo()
  const Icon = status.icon

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${processingCount}-${loading}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm border border-white/20",
          status.bgColor
        )}
      >
        <motion.div
          animate={status.animate ? { rotate: 360 } : {}}
          transition={status.animate ? { 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          } : {}}
        >
          <Icon className={cn("w-4 h-4", status.color)} />
        </motion.div>
        
        <span className={cn("font-medium", status.color)}>
          {status.text}
        </span>

        {/* Processing indicator dots */}
        {processingCount > 0 && (
          <div className="flex gap-1">
            {[...Array(Math.min(3, processingCount))].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-gold rounded-full"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
            {processingCount > 3 && (
              <span className="text-xs text-gold font-bold">
                +{processingCount - 3}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export function ProcessingPulse({ className }: { className?: string }) {
  const { processingCount } = useRealtimeMessages()

  if (processingCount === 0) return null

  return (
    <motion.div
      className={cn("absolute inset-0 rounded-full", className)}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(212, 175, 55, 0.4)",
          "0 0 0 10px rgba(212, 175, 55, 0)",
          "0 0 0 0 rgba(212, 175, 55, 0)"
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  )
}