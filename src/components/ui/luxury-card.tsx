"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { cardHoverEffect } from "@/lib/animations"

interface LuxuryCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "elevated" | "bordered" | "gradient" | "glass" | "executive"
  interactive?: boolean
  glow?: boolean
  shimmer?: boolean
  vip?: boolean
  children?: React.ReactNode
}

export const LuxuryCard = forwardRef<HTMLDivElement, LuxuryCardProps>(
  ({ 
    className, 
    variant = "default", 
    interactive = false,
    glow = false,
    shimmer = false,
    vip = false,
    children,
    ...props 
  }, ref) => {
    const baseStyles = "relative overflow-hidden rounded-2xl transition-all duration-300"
    
    const variants = {
      default: "bg-white shadow-luxury",
      elevated: "bg-white shadow-luxury-lg",
      bordered: "bg-white border-2 border-gray-100 shadow-sm hover:border-navy/20",
      gradient: "bg-gradient-to-br from-white to-cream shadow-luxury",
      glass: "backdrop-blur-luxury bg-white/40 border border-white/20 shadow-luxury-glass",
      executive: "backdrop-blur-luxury bg-navy/5 border border-gold/20 shadow-executive hover:bg-navy/10"
    }
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          interactive && "cursor-pointer hover:scale-[1.02]",
          vip && "ring-2 ring-gold/30 shadow-gold-glow",
          className
        )}
        variants={interactive ? cardHoverEffect : undefined}
        initial="rest"
        whileHover="hover"
        animate="rest"
        {...props}
      >
        {/* Executive glassmorphism shimmer */}
        {shimmer && (
          <motion.div
            className="absolute inset-0 -translate-x-full"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2
            }}
          >
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-gold/20 to-transparent skew-x-12" />
          </motion.div>
        )}
        
        {/* Executive glow effect */}
        {glow && (
          <motion.div
            className="absolute -inset-2 opacity-0 pointer-events-none"
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-navy/20 via-gold/20 to-navy/20 blur-xl" />
          </motion.div>
        )}
        
        {/* VIP gold accent border animation */}
        {vip && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-gold/0"
            animate={{ 
              borderColor: ["rgba(212, 175, 55, 0)", "rgba(212, 175, 55, 0.4)", "rgba(212, 175, 55, 0)"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {children}
      </motion.div>
    )
  }
)

LuxuryCard.displayName = "LuxuryCard"

// Export as Card for backward compatibility
export const Card = LuxuryCard

// Executive stat card with animation
export function ExecutiveStatCard({
  value,
  label,
  icon: Icon,
  trend,
  delay = 0
}: {
  value: string | number
  label: string
  icon?: React.ElementType
  trend?: { value: number; positive: boolean }
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <LuxuryCard 
        variant="executive" 
        interactive
        glow
        shimmer
        className="p-6 group"
      >
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 bg-navy/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gold/20"
            >
              <Icon className="w-6 h-6 text-navy" />
            </motion.div>
          )}
          
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={cn(
                "text-sm font-medium px-2 py-1 rounded-lg",
                trend.positive 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              )}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-1"
        >
          {value}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="text-sm text-gray-600"
        >
          {label}
        </motion.div>
        
        {/* Executive hover indicator */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-navy to-gold"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0 }}
        />
      </LuxuryCard>
    </motion.div>
  )
}

// Testimonial card with luxury styling
export function LuxuryTestimonialCard({
  quote,
  author,
  role,
  company,
  rating = 5,
  delay = 0
}: {
  quote: string
  author: string
  role: string
  company: string
  rating?: number
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <LuxuryCard 
        variant="gradient" 
        interactive
        className="p-8 h-full"
      >
        {/* Stars */}
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: delay + 0.1 * i,
                type: "spring",
                stiffness: 200
              }}
              className={cn(
                "text-gold-400",
                i < rating ? "fill-current" : "fill-transparent"
              )}
            >
              ★
            </motion.span>
          ))}
        </div>
        
        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="text-gray-700 leading-relaxed mb-6 italic"
        >
          "{quote}"
        </motion.blockquote>
        
        {/* Author */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-burgundy-600">{role}</div>
          <div className="text-xs text-gray-500">{company}</div>
        </motion.div>
      </LuxuryCard>
    </motion.div>
  )
}