"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { notificationSlide } from "@/lib/animations"

export type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface LuxuryToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50",
    iconColor: "text-green-600",
    progressColor: "bg-green-600"
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50",
    iconColor: "text-red-600",
    progressColor: "bg-red-600"
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50",
    iconColor: "text-blue-600",
    progressColor: "bg-blue-600"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50",
    iconColor: "text-amber-600",
    progressColor: "bg-amber-600"
  }
}

export function LuxuryToast({ toast, onClose }: LuxuryToastProps) {
  const [progress, setProgress] = useState(100)
  const config = toastConfig[toast.type]
  const Icon = config.icon
  const duration = toast.duration || 5000

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          onClose(toast.id)
          return 0
        }
        return prev - (100 / (duration / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration, onClose, toast.id])

  return (
    <motion.div
      layout
      variants={notificationSlide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-xl shadow-luxury border-2 p-4",
        config.className
      )}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.1 
          }}
        >
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </motion.div>
        
        <div className="flex-1">
          <motion.h4
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-semibold text-gray-900"
          >
            {toast.title}
          </motion.h4>
          {toast.description && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-600 mt-1"
            >
              {toast.description}
            </motion.p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClose(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-opacity-20"
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      >
        <div className={cn("h-full", config.progressColor)} />
      </motion.div>
    </motion.div>
  )
}

// Toast container component
export function LuxuryToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Expose methods globally
  useEffect(() => {
    (window as any).showToast = addToast
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <LuxuryToast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for using toasts
export function useLuxuryToast() {
  const showToast = (toast: Omit<Toast, "id">) => {
    if (typeof window !== "undefined" && (window as any).showToast) {
      (window as any).showToast(toast)
    }
  }

  return {
    success: (title: string, description?: string) => 
      showToast({ type: "success", title, description }),
    error: (title: string, description?: string) => 
      showToast({ type: "error", title, description }),
    info: (title: string, description?: string) => 
      showToast({ type: "info", title, description }),
    warning: (title: string, description?: string) => 
      showToast({ type: "warning", title, description })
  }
}