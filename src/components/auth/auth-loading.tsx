"use client"

import { motion } from "framer-motion"
import { Crown, Loader2, Shield, Sparkles } from "lucide-react"

interface AuthLoadingProps {
  message?: string
  submessage?: string
  variant?: 'default' | 'luxury' | 'minimal'
}

export function AuthLoading({ 
  message = "Preparing your executive command center...", 
  submessage = "Setting up your luxury experience",
  variant = 'luxury' 
}: AuthLoadingProps) {
  
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Crown className="w-8 h-8 text-burgundy-600" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-luxury p-8">
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 bg-gradient-burgundy rounded-full flex items-center justify-center shadow-burgundy-lg"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          
          {/* Sparkle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
              className="absolute w-4 h-4"
              style={{
                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}px`,
                left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}px`,
              }}
            >
              <Sparkles className="w-4 h-4 text-burgundy-400" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center max-w-md"
      >
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
          {message}
        </h2>
        <p className="text-gray-600 mb-6">
          {submessage}
        </p>

        {/* Progress Steps */}
        <div className="space-y-3">
          {[
            "Securing your connection",
            "Verifying executive credentials", 
            "Preparing AI strategic commander",
            "Finalizing luxury experience"
          ].map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.2 }}
              className="flex items-center text-sm text-gray-600"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 mr-3 flex-shrink-0"
              >
                <Loader2 className="w-4 h-4 text-burgundy-600" />
              </motion.div>
              <span>{step}...</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="mt-8 flex items-center bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200"
      >
        <Shield className="w-4 h-4 text-green-600 mr-2" />
        <span className="text-sm font-medium text-gray-700">
          Enterprise-grade security
        </span>
      </motion.div>

      {/* Luxury Loading Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="mt-6 w-64"
      >
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            animate={{ x: [-100, 300] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "reverse"
            }}
            className="h-full w-1/3 bg-gradient-burgundy rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}

// Compact loading component for inline use
export function InlineAuthLoading({ message = "Authenticating..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="mr-3"
      >
        <Crown className="w-5 h-5 text-burgundy-600" />
      </motion.div>
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  )
}

// Success loading animation
export function AuthSuccessLoading({ message = "Welcome to Napoleon AI" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
        className="w-16 h-16 bg-gradient-burgundy rounded-full flex items-center justify-center mb-4 shadow-burgundy-lg"
      >
        <Crown className="w-8 h-8 text-white" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-serif font-bold text-gray-900 mb-2"
      >
        {message}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-gray-600 text-center"
      >
        Your executive command center is ready
      </motion.p>

      {/* Sparkle animation */}
      <div className="relative mt-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{ left: `${i * 20 - 20}px` }}
          >
            <Sparkles className="w-4 h-4 text-burgundy-400" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}