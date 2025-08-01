"use client"

import { cn } from "@/lib/utils"

interface NapoleonLogoProps {
  variant?: 'default' | 'light' | 'dark' | 'gold' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showIcon?: boolean
}

export function NapoleonLogo({ 
  variant = 'default', 
  size = 'md', 
  className,
  showIcon = true 
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
    white: 'text-white'
  }

  return (
    <div className={cn(
      "flex items-center gap-3",
      className
    )}>
      {showIcon && (
        <div className={cn(
          "relative",
          size === 'sm' && "w-8 h-8",
          size === 'md' && "w-10 h-10", 
          size === 'lg' && "w-12 h-12",
          size === 'xl' && "w-16 h-16",
          size === '2xl' && "w-20 h-20"
        )}>
          {/* Crown Icon SVG */}
          <svg 
            viewBox="0 0 100 100" 
            className={cn(
              "w-full h-full",
              variantClasses[variant]
            )}
            fill="currentColor"
          >
            {/* Crown design inspired by luxury executive aesthetics */}
            <path d="M15 75 L20 45 L30 55 L40 35 L50 60 L60 35 L70 55 L80 45 L85 75 Z" />
            <circle cx="50" cy="25" r="4" />
            <circle cx="30" cy="30" r="3" />
            <circle cx="70" cy="30" r="3" />
            <path d="M12 75 L88 75 L85 85 L15 85 Z" />
            {/* Luxury details */}
            <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.8" />
            <circle cx="35" cy="55" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="65" cy="55" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
      )}
      
      <div className="flex flex-col">
        {/* Napoleon in luxury script style */}
        <span 
          className={cn(
            "font-script leading-none tracking-wide",
            sizeClasses[size],
            variantClasses[variant],
            // Luxury script styling with CSS
            "relative",
            "[font-style:italic]",
            "[letter-spacing:0.05em]",
            // Luxury glow effect
            variant === 'gold' && "drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]",
            // Elegant hover effect
            "transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          )}
          style={{
            fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Apple Chancery', cursive",
            textShadow: variant === 'gold' ? '0 0 20px rgba(212, 175, 55, 0.2)' : 'none'
          }}
        >
          Napoleon
        </span>
        
        {/* AI subtitle */}
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
          variant === 'white' && "text-white/80"
        )}>
          AI
        </span>
      </div>
    </div>
  )
}

export default NapoleonLogo