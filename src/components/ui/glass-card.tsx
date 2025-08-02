"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { forwardRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "executive" | "luxury" | "vip"
  size?: "sm" | "md" | "lg" | "xl"
  glow?: boolean
  shimmer?: boolean
  children?: ReactNode
  className?: string
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    variant = "default", 
    size = "md", 
    glow = false,
    shimmer = false,
    children, 
    className,
    ...props 
  }, ref) => {
    const baseStyles = "relative overflow-hidden rounded-2xl border transition-all duration-500"
    
    const variants = {
      default: {
        background: "rgba(18, 32, 57, 0.1)",
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(199, 202, 209, 0.2)",
        shadow: "shadow-private-jet-glass"
      },
      executive: {
        background: "rgba(11, 13, 17, 0.2)",
        backdropFilter: "backdrop-blur-executive",
        border: "border-champagneGold/20",
        shadow: "shadow-executive"
      },
      luxury: {
        background: "rgba(18, 32, 57, 0.15)",
        backdropFilter: "backdrop-blur-luxury",
        border: "border-champagneGold/30",
        shadow: "shadow-champagne"
      },
      vip: {
        background: "rgba(140, 90, 60, 0.1)",
        backdropFilter: "backdrop-blur-glass",
        border: "border-cognacLeather/30",
        shadow: "shadow-cognac"
      }
    }
    
    const sizes = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8", 
      xl: "p-12"
    }
    
    const hoverEffects = {
      scale: glow ? 1.02 : 1.01,
      transition: { duration: 0.3 }
    }

    return (
      <>
        {/* CSS for advanced glassmorphism effects */}
        <style jsx>{`
          .glass-shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(212, 175, 55, 0.4) 50%,
              transparent 100%
            );
            animation: shimmer 2s ease-in-out infinite;
            pointer-events: none;
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          .glass-glow {
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(135deg, 
              rgba(212, 175, 55, 0.6) 0%, 
              transparent 25%, 
              transparent 75%, 
              rgba(212, 175, 55, 0.6) 100%
            );
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            opacity: 0;
            animation: glow-pulse 3s ease-in-out infinite;
          }
          
          @keyframes glow-pulse {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          
          .glass-border-gradient {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(135deg, 
              rgba(199, 202, 209, 0.3) 0%,
              rgba(212, 175, 55, 0.4) 25%,
              transparent 50%,
              rgba(212, 175, 55, 0.4) 75%,
              rgba(199, 202, 209, 0.3) 100%
            );
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
          }
        `}</style>
        
        <motion.div
          ref={ref}
          className={cn(
            baseStyles,
            variants[variant].backdropFilter,
            variants[variant].border,
            variants[variant].shadow,
            sizes[size],
            "hover:border-champagneGold/40",
            glow && "hover:shadow-champagne-glow",
            className
          )}
          style={{
            background: variants[variant].background
          }}
          whileHover={hoverEffects}
          {...props}
        >
          {/* Border gradient effect */}
          <div className="glass-border-gradient" />
          
          {/* Glow effect */}
          {glow && <div className="glass-glow" />}
          
          {/* Shimmer effect */}
          {shimmer && <div className="glass-shimmer" />}
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      </>
    )
  }
)

GlassCard.displayName = "GlassCard"

// Executive variant for high-impact sections
export const ExecutiveGlassCard = forwardRef<HTMLDivElement, Omit<GlassCardProps, "variant">>(
  ({ glow = true, shimmer = true, ...props }, ref) => {
    return (
      <GlassCard
        ref={ref}
        variant="executive"
        glow={glow}
        shimmer={shimmer}
        {...props}
      />
    )
  }
)

ExecutiveGlassCard.displayName = "ExecutiveGlassCard"

// VIP variant for premium features
export const VIPGlassCard = forwardRef<HTMLDivElement, Omit<GlassCardProps, "variant">>(
  ({ glow = true, ...props }, ref) => {
    return (
      <GlassCard
        ref={ref}
        variant="vip"
        glow={glow}
        {...props}
      />
    )
  }
)

VIPGlassCard.displayName = "VIPGlassCard"