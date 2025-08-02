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
      primary: "bg-gradient-champagne text-jetBlack hover:shadow-champagne-glow focus:ring-champagneGold/50 shadow-champagne transition-all duration-300",
      secondary: "bg-jetBlack/20 backdrop-blur-glass border-2 border-champagneGold/50 text-champagneGold hover:bg-champagneGold/10 hover:border-champagneGold focus:ring-champagneGold/50",
      ghost: "bg-transparent text-champagneGold hover:bg-champagneGold/10 hover:text-champagneGold focus:ring-champagneGold/30",
      luxury: "bg-gradient-executive text-warmIvory shadow-executive hover:shadow-champagne-glow focus:ring-champagneGold/50 border border-champagneGold/30",
      outline: "bg-transparent text-champagneGold border-2 border-champagneGold/40 hover:bg-champagneGold/10 hover:border-champagneGold focus:ring-champagneGold/50"
    }
    
    const sizes = {
      sm: "px-4 py-3 text-sm gap-2 min-h-[44px]", // WCAG minimum touch target
      md: "px-6 py-4 text-base gap-2.5 min-h-[48px]",
      lg: "px-8 py-5 text-lg gap-3 min-h-[56px]", // Executive touch target 
      xl: "px-12 py-6 text-xl gap-4 min-h-[64px]"
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Enhanced haptic feedback patterns for executives
      if (haptic && 'vibrate' in navigator) {
        // Executive success pattern: [50, 25, 50, 25, 100]
        navigator.vibrate([50, 25, 50, 25, 100])
      }
      
      // Enhanced 3D champagne gold ripple effect
      const button = e.currentTarget
      const ripple = document.createElement("span")
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2.5
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = x + "px"
      ripple.style.top = y + "px"
      ripple.classList.add("luxury-ripple")
      
      button.appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, 800)
      
      onClick?.(e)
    }
    
    return (
      <>
        <style jsx>{`
          .luxury-ripple {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, 
              rgba(212, 175, 55, 0.8) 0%, 
              rgba(212, 175, 55, 0.4) 40%, 
              rgba(212, 175, 55, 0.1) 70%, 
              transparent 100%
            );
            transform: scale(0);
            animation: luxury-ripple-animation 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
            box-shadow: 
              0 0 20px rgba(212, 175, 55, 0.6),
              inset 0 0 15px rgba(212, 175, 55, 0.3);
          }
          
          @keyframes luxury-ripple-animation {
            0% {
              transform: scale(0) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: scale(0.6) rotate(180deg);
              opacity: 0.8;
            }
            100% {
              transform: scale(1) rotate(360deg);
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
              transparent 0%,
              rgba(212, 175, 55, 0.6) 30%,
              rgba(246, 246, 244, 0.4) 50%,
              rgba(212, 175, 55, 0.6) 70%,
              transparent 100%
            );
            animation: champagne-shimmer 2.5s ease-in-out infinite;
            pointer-events: none;
          }
          
          @keyframes champagne-shimmer {
            0% { 
              left: -100%; 
              transform: skewX(-45deg);
            }
            100% { 
              left: 100%; 
              transform: skewX(-45deg);
            }
          }
          
          .luxury-glow {
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(45deg, 
              rgba(212, 175, 55, 0.4) 0%,
              transparent 25%,
              transparent 75%,
              rgba(212, 175, 55, 0.4) 100%
            );
            opacity: 0;
            animation: luxury-glow-pulse 2s ease-in-out infinite;
            filter: blur(4px);
            pointer-events: none;
          }
          
          @keyframes luxury-glow-pulse {
            0%, 100% { opacity: 0; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
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
          {/* Luxury glow effect */}
          {glow && !disabled && (
            <span className="luxury-glow" />
          )}
          
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