"use client"

import { motion } from "framer-motion"
import { forwardRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ShimmerProps {
  variant?: "gold" | "silver" | "champagne" | "vip"
  intensity?: "subtle" | "medium" | "bold"
  speed?: "slow" | "medium" | "fast"
  direction?: "horizontal" | "vertical" | "diagonal"
  children?: ReactNode
  className?: string
}

export const Shimmer = forwardRef<HTMLDivElement, ShimmerProps>(
  ({ 
    variant = "champagne", 
    intensity = "medium", 
    speed = "medium",
    direction = "horizontal",
    children, 
    className 
  }, ref) => {
    const shimmerVariants = {
      gold: {
        background: `linear-gradient(90deg, 
          transparent 0%, 
          rgba(212, 175, 55, 0.6) 25%,
          rgba(232, 190, 53, 0.8) 50%,
          rgba(212, 175, 55, 0.6) 75%,
          transparent 100%
        )`
      },
      silver: {
        background: `linear-gradient(90deg, 
          transparent 0%, 
          rgba(199, 202, 209, 0.4) 25%,
          rgba(246, 246, 244, 0.6) 50%,
          rgba(199, 202, 209, 0.4) 75%,
          transparent 100%
        )`
      },
      champagne: {
        background: `linear-gradient(90deg, 
          transparent 0%, 
          rgba(212, 175, 55, 0.3) 20%,
          rgba(246, 246, 244, 0.5) 40%,
          rgba(212, 175, 55, 0.8) 60%,
          rgba(246, 246, 244, 0.5) 80%,
          transparent 100%
        )`
      },
      vip: {
        background: `linear-gradient(90deg, 
          transparent 0%, 
          rgba(140, 90, 60, 0.4) 25%,
          rgba(212, 175, 55, 0.6) 50%,
          rgba(140, 90, 60, 0.4) 75%,
          transparent 100%
        )`
      }
    }

    const intensityMap = {
      subtle: 0.3,
      medium: 0.6,
      bold: 1.0
    }

    const speedMap = {
      slow: "3s",
      medium: "2s", 
      fast: "1.2s"
    }

    const directionTransforms = {
      horizontal: "translateX(-100%) to translateX(100%)",
      vertical: "translateY(-100%) to translateY(100%)",
      diagonal: "translate(-100%, -100%) to translate(100%, 100%)"
    }

    return (
      <>
        <style jsx>{`
          .shimmer-effect {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: ${shimmerVariants[variant].background};
            opacity: ${intensityMap[intensity]};
            animation: shimmer-animation ${speedMap[speed]} ease-in-out infinite;
            pointer-events: none;
            ${direction === 'diagonal' ? 'transform: skewX(-20deg);' : ''}
          }
          
          .shimmer-container {
            position: relative;
            overflow: hidden;
          }
          
          @keyframes shimmer-animation {
            0% { 
              ${direction === 'horizontal' ? 'left: -100%;' : ''}
              ${direction === 'vertical' ? 'top: -100%;' : ''}
              ${direction === 'diagonal' ? 'left: -100%; top: -100%;' : ''}
            }
            100% { 
              ${direction === 'horizontal' ? 'left: 100%;' : ''}
              ${direction === 'vertical' ? 'top: 100%;' : ''}
              ${direction === 'diagonal' ? 'left: 100%; top: 100%;' : ''}
            }
          }
        `}</style>
        
        <div ref={ref} className={cn("shimmer-container", className)}>
          <div className="shimmer-effect" />
          {children}
        </div>
      </>
    )
  }
)

Shimmer.displayName = "Shimmer"

// Priority shimmer for VIP items
export const PriorityShimmer = forwardRef<HTMLDivElement, Omit<ShimmerProps, "variant" | "intensity">>(
  ({ speed = "fast", ...props }, ref) => {
    return (
      <Shimmer
        ref={ref}
        variant="vip"
        intensity="bold"
        speed={speed}
        {...props}
      />
    )
  }
)

PriorityShimmer.displayName = "PriorityShimmer"

// Champagne shimmer for CTA elements
export const ChampagneShimmer = forwardRef<HTMLDivElement, Omit<ShimmerProps, "variant">>(
  ({ intensity = "medium", ...props }, ref) => {
    return (
      <Shimmer
        ref={ref}
        variant="champagne"
        intensity={intensity}
        {...props}
      />
    )
  }
)

ChampagneShimmer.displayName = "ChampagneShimmer"

// Animated text shimmer for headlines
interface TextShimmerProps {
  text: string
  variant?: "gold" | "champagne" | "silver"
  className?: string
}

export const TextShimmer = ({ text, variant = "champagne", className }: TextShimmerProps) => {
  return (
    <>
      <style jsx>{`
        .text-shimmer {
          background: linear-gradient(
            90deg,
            ${variant === 'gold' ? '#D4AF37' : 
              variant === 'champagne' ? '#D4AF37' : '#C7CAD1'} 25%,
            ${variant === 'gold' ? '#E8BE35' : 
              variant === 'champagne' ? '#F6F6F4' : '#F6F6F4'} 50%,
            ${variant === 'gold' ? '#D4AF37' : 
              variant === 'champagne' ? '#D4AF37' : '#C7CAD1'} 75%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-shimmer-animation 2.5s ease-in-out infinite;
          font-weight: bold;
        }
        
        @keyframes text-shimmer-animation {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      
      <span className={cn("text-shimmer", className)}>
        {text}
      </span>
    </>
  )
}

// Halo effect for premium elements  
interface HaloEffectProps {
  children: ReactNode
  color?: "gold" | "champagne" | "vip"
  intensity?: "subtle" | "medium" | "bold"
  className?: string
}

export const HaloEffect = ({ 
  children, 
  color = "champagne", 
  intensity = "medium",
  className 
}: HaloEffectProps) => {
  const colorMap = {
    gold: "rgba(212, 175, 55, 0.4)",
    champagne: "rgba(212, 175, 55, 0.3)",
    vip: "rgba(140, 90, 60, 0.4)"
  }

  const intensityMap = {
    subtle: 0.3,
    medium: 0.6,
    bold: 1.0
  }

  return (
    <>
      <style jsx>{`
        .halo-container {
          position: relative;
        }
        
        .halo-effect {
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: radial-gradient(circle at center, 
            ${colorMap[color]} 0%, 
            transparent 70%
          );
          opacity: ${intensityMap[intensity]};
          animation: halo-pulse 3s ease-in-out infinite;
          pointer-events: none;
          filter: blur(8px);
        }
        
        @keyframes halo-pulse {
          0%, 100% { 
            opacity: ${intensityMap[intensity] * 0.5}; 
            transform: scale(0.95); 
          }
          50% { 
            opacity: ${intensityMap[intensity]}; 
            transform: scale(1.05); 
          }
        }
      `}</style>
      
      <div className={cn("halo-container", className)}>
        <div className="halo-effect" />
        {children}
      </div>
    </>
  )
}

export default Shimmer