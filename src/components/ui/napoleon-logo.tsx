"use client"

import { motion } from "framer-motion"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { TextShimmer } from "./shimmer-effects"

interface NapoleonLogoProps {
  variant?: 'default' | 'light' | 'dark' | 'gold' | 'white' | 'luxury' | 'executive'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showIcon?: boolean
  animated?: boolean
  shimmer?: boolean
  onClick?: () => void
}

export function NapoleonLogo({ 
  variant = 'default', 
  size = 'md', 
  className,
  showIcon = true,
  animated = true,
  shimmer = false,
  onClick
}: NapoleonLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
    '2xl': 'text-8xl'
  }

  const variantClasses = {
    default: 'text-champagneGold',
    light: 'text-warmIvory',
    dark: 'text-jetBlack',
    gold: 'text-champagneGold',
    white: 'text-white',
    luxury: 'text-champagneGold',
    executive: 'text-champagneGold'
  }

  const crownAnimation = animated ? {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { duration: 0.8, delay: 0.2 }
  } : {}

  const textAnimation = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.5 }
  } : {}

  // Luxury variant with glassmorphism
  if (variant === 'luxury') {
    return (
      <>
        <style jsx>{`
          .luxury-logo-glow {
            position: absolute;
            inset: -4px;
            border-radius: inherit;
            background: radial-gradient(circle at center, 
              rgba(212, 175, 55, 0.4) 0%, 
              transparent 70%
            );
            animation: luxury-logo-pulse 3s ease-in-out infinite;
            filter: blur(8px);
            pointer-events: none;
          }
          
          @keyframes luxury-logo-pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.95); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}</style>
        
        <motion.div 
          className={cn("relative flex flex-col items-center text-center", className)}
          onClick={onClick}
          whileHover={animated ? { scale: 1.02 } : undefined}
          whileTap={animated ? { scale: 0.98 } : undefined}
        >
          <div className="luxury-logo-glow" />
          
          <motion.div
            className={cn(
              "relative bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mb-4 shadow-champagne border border-champagneGold/30",
              size === 'sm' && "w-12 h-12 p-2",
              size === 'md' && "w-16 h-16 p-3", 
              size === 'lg' && "w-20 h-20 p-4",
              size === 'xl' && "w-24 h-24 p-5",
              size === '2xl' && "w-32 h-32 p-6"
            )}
            {...crownAnimation}
          >
            <Crown className={cn(
              "text-champagneGold",
              size === 'sm' && "w-8 h-8",
              size === 'md' && "w-10 h-10", 
              size === 'lg' && "w-12 h-12",
              size === 'xl' && "w-14 h-14",
              size === '2xl' && "w-20 h-20"
            )} />
          </motion.div>
          
          <motion.div 
            className="relative"
            {...textAnimation}
          >
            <div className={cn("font-script font-bold text-champagneGold mb-1", sizeClasses[size])}>
              {shimmer ? (
                <TextShimmer text="Napoleon" variant="champagne" />
              ) : (
                "Napoleon"
              )}
            </div>
            <div className="font-sans font-medium text-platinumSilver text-sm tracking-wider">
              EXECUTIVE INTELLIGENCE
            </div>
          </motion.div>
        </motion.div>
      </>
    )
  }

  // Executive variant with enhanced crown
  if (variant === 'executive') {
    return (
      <motion.div 
        className={cn("flex items-center gap-4", className)}
        onClick={onClick}
        whileHover={animated ? { scale: 1.05 } : undefined}
        whileTap={animated ? { scale: 0.95 } : undefined}
      >
        {showIcon && (
          <motion.div
            className={cn(
              "bg-gradient-champagne rounded-full flex items-center justify-center shadow-champagne",
              size === 'sm' && "w-8 h-8 p-1.5",
              size === 'md' && "w-12 h-12 p-2", 
              size === 'lg' && "w-16 h-16 p-3",
              size === 'xl' && "w-20 h-20 p-4",
              size === '2xl' && "w-24 h-24 p-5"
            )}
            {...crownAnimation}
          >
            <Crown className={cn(
              "text-jetBlack",
              size === 'sm' && "w-5 h-5",
              size === 'md' && "w-8 h-8", 
              size === 'lg' && "w-10 h-10",
              size === 'xl' && "w-12 h-12",
              size === '2xl' && "w-14 h-14"
            )} />
          </motion.div>
        )}
        
        <motion.div 
          className="flex flex-col"
          {...textAnimation}
        >
          <div className={cn("font-script font-bold text-champagneGold leading-tight", sizeClasses[size])}>
            {shimmer ? (
              <TextShimmer text="Napoleon" variant="champagne" />
            ) : (
              "Napoleon"
            )}
          </div>
          <div className={cn(
            "font-sans text-platinumSilver tracking-widest opacity-80",
            size === 'sm' && "text-xs",
            size === 'md' && "text-sm", 
            size === 'lg' && "text-base",
            size === 'xl' && "text-lg",
            size === '2xl' && "text-xl"
          )}>
            AI
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Default and other variants
  return (
    <motion.div 
      className={cn("flex items-center gap-3", className)}
      onClick={onClick}
      whileHover={animated ? { scale: 1.02 } : undefined}
      whileTap={animated ? { scale: 0.98 } : undefined}
    >
      {showIcon && (
        <motion.div 
          className={cn(
            "relative",
            size === 'sm' && "w-8 h-8",
            size === 'md' && "w-10 h-10", 
            size === 'lg' && "w-12 h-12",
            size === 'xl' && "w-16 h-16",
            size === '2xl' && "w-20 h-20"
          )}
          {...crownAnimation}
        >
          <Crown className={cn("w-full h-full", variantClasses[variant])} />
        </motion.div>
      )}
      
      <motion.div 
        className="flex flex-col"
        {...textAnimation}
      >
        <span 
          className={cn(
            "font-script leading-none tracking-wide font-bold",
            sizeClasses[size],
            variantClasses[variant],
            "relative",
            // Luxury glow effect
            (['gold', 'luxury', 'executive'].includes(variant)) && "drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]",
            // Elegant hover effect
            "transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          )}
        >
          {shimmer ? (
            <TextShimmer text="Napoleon" variant="champagne" />
          ) : (
            "Napoleon"
          )}
        </span>
        
        <span className={cn(
          "font-sans font-light tracking-[0.2em] uppercase",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm", 
          size === 'lg' && "text-base",
          size === 'xl' && "text-lg",
          size === '2xl' && "text-xl",
          variant === 'default' && "text-platinumSilver-600",
          variant === 'light' && "text-platinumSilver-400",
          variant === 'dark' && "text-jetBlack-600",
          variant === 'gold' && "text-champagneGold-700",
          variant === 'white' && "text-white/80",
          (['luxury', 'executive'].includes(variant)) && "text-platinumSilver"
        )}>
          AI
        </span>
      </motion.div>
    </motion.div>
  )
}

export default NapoleonLogo