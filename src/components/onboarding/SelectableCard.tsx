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
  variant?: 'default' | 'large' | 'compact' | 'luxury'
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
  const baseClasses = "relative cursor-pointer transition-all duration-300 text-left"
  
  const variantClasses = {
    default: "p-4 rounded-xl border-2",
    large: "p-6 rounded-xl border-2",
    compact: "p-3 rounded-xl border-2",
    luxury: "p-6 rounded-2xl border"
  }
  
  // Different styling for luxury variant
  const selectedClasses = variant === 'luxury' 
    ? selected
      ? "border-champagneGold bg-champagneGold/10 backdrop-blur-glass shadow-champagne-lg ring-2 ring-champagneGold/30"
      : "border-champagneGold/20 bg-jetBlack/20 backdrop-blur-glass hover:border-champagneGold/40 hover:bg-champagneGold/5 hover:shadow-champagne"
    : selected
      ? "border-gold bg-gold-50 shadow-lg ring-2 ring-gold/20"
      : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30 hover:shadow-md"
    
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : ""

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: variant === 'luxury' ? 1.03 : 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${variantClasses[variant]} ${selectedClasses} ${disabledClasses} ${className}`}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 right-4"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            variant === 'luxury' 
              ? 'bg-champagneGold shadow-champagne' 
              : 'bg-gold'
          }`}>
            <CheckCircle className="w-4 h-4 text-jetBlack" />
          </div>
        </motion.div>
      )}
      
      {/* Content */}
      <div className="flex items-start space-x-4">
        {/* Icon container */}
        <motion.div
          animate={variant === 'luxury' ? {
            backgroundColor: selected ? '#D4AF37' : 'rgba(212, 175, 55, 0.1)',
            color: selected ? '#0B0D11' : '#D4AF37'
          } : {
            backgroundColor: selected ? '#D4AF37' : '#F3F4F6',
            color: selected ? '#FFFFFF' : '#6B7280'
          }}
          transition={{ duration: 0.3 }}
          className={`rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'luxury' ? 'w-14 h-14 backdrop-blur-glass border border-champagneGold/20' :
            variant === 'compact' ? 'w-10 h-10' : 'w-12 h-12'
          }`}
        >
          {icon}
        </motion.div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <motion.div
            animate={variant === 'luxury' ? {
              color: selected ? '#F6F6F4' : '#F6F6F4'
            } : {
              color: selected ? '#1B2951' : '#1F2937'
            }}
            transition={{ duration: 0.3 }}
            className={`font-semibold ${
              variant === 'luxury' ? 'text-xl' :
              variant === 'large' ? 'text-lg' : 
              variant === 'compact' ? 'text-sm' : 'text-base'
            }`}
          >
            {title}
          </motion.div>
          <motion.div
            animate={variant === 'luxury' ? {
              color: selected ? '#C7CAD1' : '#C7CAD1'
            } : {
              color: selected ? '#1B2951' : '#6B7280'
            }}
            transition={{ duration: 0.3 }}
            className={`${
              variant === 'luxury' ? 'text-base' :
              variant === 'large' ? 'text-base' : 
              variant === 'compact' ? 'text-xs' : 'text-sm'
            } mt-2 leading-relaxed`}
          >
            {description}
          </motion.div>
        </div>
      </div>
      
      {/* Hover shimmer effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent ${
          variant === 'luxury' 
            ? 'via-champagneGold/10 rounded-2xl' 
            : 'via-gold/10 rounded-xl'
        }`}
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ transform: 'translateX(-100%)' }}
      />
    </motion.button>
  )
}