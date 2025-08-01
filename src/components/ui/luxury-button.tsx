"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { buttonPress, luxuryHover } from "@/lib/animations"
import { Crown, Loader2 } from "lucide-react"

interface LuxuryButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "luxury" | "outline"
  size?: "sm" | "md" | "lg" | "xl"
  loading?: boolean
  icon?: React.ReactNode
  showCrown?: boolean
  glow?: boolean
  haptic?: boolean
  children?: React.ReactNode
}

type MotionButtonProps = Omit<HTMLMotionProps<"button">, "children"> & LuxuryButtonProps

export const LuxuryButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    loading = false,
    icon,
    showCrown = false,
    glow = false,
    haptic = true,
    disabled,
    children,
    onClick,
    ...props 
  }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    
    const variants = {
      primary: "bg-gradient-to-r from-midnightBlue to-jetBlack text-warmIvory hover:from-midnightBlue/90 hover:to-jetBlack/80 focus:ring-champagneGold/50 shadow-luxury",
      secondary: "bg-warmIvory text-jetBlack border-2 border-platinumSilver/30 hover:bg-platinumSilver/20 hover:border-champagneGold/40 focus:ring-champagneGold/50",
      ghost: "bg-transparent text-jetBlack hover:bg-platinumSilver/20 hover:text-jetBlack focus:ring-champagneGold/30",
      luxury: "bg-gradient-to-br from-jetBlack via-midnightBlue to-jetBlack/80 text-warmIvory shadow-luxury hover:shadow-luxury-lg focus:ring-champagneGold/50 border border-champagneGold/20",
      outline: "bg-transparent text-midnightBlue border-2 border-platinumSilver/40 hover:bg-warmIvory/30 hover:border-champagneGold/50 focus:ring-champagneGold/50"
    }
    
    const sizes = {
      sm: "px-3 py-2 text-sm gap-1.5",
      md: "px-4 py-2.5 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
      xl: "px-8 py-4 text-xl gap-3"
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for mobile devices
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
      
      // Ripple effect
      const button = e.currentTarget
      const ripple = document.createElement("span")
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = x + "px"
      ripple.style.top = y + "px"
      ripple.classList.add("ripple")
      
      button.appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, 600)
      
      onClick?.(e)
    }
    
    return (
      <>
        <style jsx>{`
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
          }
          
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          .shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 2s infinite;
          }
          
          @keyframes shimmer {
            to {
              left: 100%;
            }
          }
        `}</style>
        
        <motion.button
          ref={ref}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            glow && "animate-glow",
            className
          )}
          whileHover={!disabled ? luxuryHover : undefined}
          whileTap={!disabled ? buttonPress.tap : undefined}
          disabled={disabled || loading}
          onClick={handleClick}
          {...props}
        >
          {/* Shimmer effect for luxury variant */}
          {variant === "luxury" && !disabled && (
            <span className="shimmer" />
          )}
          
          {/* Loading state */}
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {showCrown && <Crown className="w-4 h-4" />}
              {icon}
              {children}
            </>
          )}
          
          {/* Glow effect */}
          {glow && !disabled && (
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0"
              style={{
                background: "radial-gradient(circle at center, rgba(128, 27, 43, 0.4), transparent 70%)",
                filter: "blur(20px)"
              }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.button>
      </>
    )
  }
)

LuxuryButton.displayName = "LuxuryButton"

// Export as Button for backward compatibility
export const Button = LuxuryButton

// Executive CTA Button with special effects
export const ExecutiveCTA = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <LuxuryButton
        ref={ref}
        variant="luxury"
        size="lg"
        showCrown
        glow
        className={cn("group", className)}
        {...props}
      >
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mr-2"
        >
          <Crown className="w-5 h-5" />
        </motion.span>
        {children}
        <motion.span
          className="ml-2 inline-block"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </LuxuryButton>
    )
  }
)

ExecutiveCTA.displayName = "ExecutiveCTA"