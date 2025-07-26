"use client"

import { motion } from "framer-motion"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface LuxuryLoadingProps {
  size?: "sm" | "md" | "lg"
  message?: string
  className?: string
  fullScreen?: boolean
}

export function LuxuryLoading({ 
  size = "md", 
  message = "Loading executive experience...",
  className,
  fullScreen = false
}: LuxuryLoadingProps) {
  const sizes = {
    sm: { crown: 24, dots: 4 },
    md: { crown: 40, dots: 6 },
    lg: { crown: 56, dots: 8 }
  }

  const { crown, dots } = sizes[size]

  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    fullScreen && "min-h-screen bg-gradient-luxury",
    className
  )

  return (
    <div className={containerClasses}>
      {/* Crown spinner */}
      <motion.div
        className="relative mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Crown 
          className="text-burgundy-600" 
          style={{ width: crown, height: crown }}
        />
        
        {/* Orbiting dots */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3
            }}
          >
            <div 
              className="absolute bg-burgundy-400 rounded-full"
              style={{
                width: dots,
                height: dots,
                top: -dots / 2,
                left: `calc(50% - ${dots / 2}px)`
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Loading text */}
      {message && (
        <motion.p
          className="text-gray-600 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}

      {/* Progress dots */}
      <div className="flex space-x-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-burgundy-300 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Skeleton loader for luxury cards
export function LuxurySkeleton({ 
  className,
  lines = 3
}: { 
  className?: string
  lines?: number 
}) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-4" />
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-gray-200 rounded-full mb-2"
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  )
}

// Executive placeholder with animation
export function ExecutivePlaceholder({
  title = "Preparing your executive dashboard",
  subtitle = "This will only take a moment"
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-luxury p-12 text-center max-w-md mx-auto"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 bg-gradient-burgundy rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Crown className="w-10 h-10 text-white" />
      </motion.div>
      
      <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {subtitle}
      </p>
      
      {/* Luxury progress bar */}
      <div className="mt-8 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-burgundy-600 to-burgundy-700"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ width: "50%" }}
        />
      </div>
    </motion.div>
  )
}