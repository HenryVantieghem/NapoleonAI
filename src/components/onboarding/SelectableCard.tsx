"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { CheckCircle } from "lucide-react"

interface SelectableCardProps {
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
  variant?: 'default' | 'large' | 'compact'
  disabled?: boolean
  className?: string
}

export default function SelectableCard({
  icon,
  title,
  description,
  selected,
  onClick,
  variant = 'default',
  disabled = false,
  className = ''
}: SelectableCardProps) {
  const baseClasses = "relative cursor-pointer transition-all duration-300 rounded-xl border-2 text-left"
  
  const variantClasses = {
    default: "p-4",
    large: "p-6",
    compact: "p-3"
  }
  
  const selectedClasses = selected
    ? "border-gold bg-gold-50 shadow-lg ring-2 ring-gold/20"
    : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30 hover:shadow-md"
    
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : ""

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${variantClasses[variant]} ${selectedClasses} ${disabledClasses} ${className}`}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-3 right-3"
        >
          <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
      
      {/* Content */}
      <div className="flex items-start space-x-3">
        {/* Icon container */}
        <motion.div
          animate={{
            backgroundColor: selected ? '#D4AF37' : '#F3F4F6',
            color: selected ? '#FFFFFF' : '#6B7280'
          }}
          transition={{ duration: 0.3 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'compact' ? 'w-10 h-10' : ''
          }`}
        >
          {icon}
        </motion.div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <motion.div
            animate={{
              color: selected ? '#1B2951' : '#1F2937'
            }}
            transition={{ duration: 0.3 }}
            className={`font-semibold ${
              variant === 'large' ? 'text-lg' : 
              variant === 'compact' ? 'text-sm' : 'text-base'
            }`}
          >
            {title}
          </motion.div>
          <motion.div
            animate={{
              color: selected ? '#1B2951' : '#6B7280'
            }}
            transition={{ duration: 0.3 }}
            className={`${
              variant === 'large' ? 'text-base' : 
              variant === 'compact' ? 'text-xs' : 'text-sm'
            } mt-1`}
          >
            {description}
          </motion.div>
        </div>
      </div>
      
      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-gold/10 to-transparent"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ transform: 'translateX(-100%)' }}
      />
    </motion.button>
  )
}