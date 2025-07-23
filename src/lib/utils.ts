import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Luxury animation utilities
export const luxuryAnimations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
}

// Executive-focused content helpers
export const executiveContent = {
  painPoints: [
    "Drowning in emails across multiple platforms",
    "Missing critical communications from VIPs", 
    "Losing time on low-priority messages",
    "Struggling to track follow-ups and action items",
    "Unable to maintain executive-level relationships"
  ],
  
  benefits: [
    "Unified communication command center",
    "AI-powered priority intelligence",
    "VIP relationship management",
    "Automated action item extraction", 
    "Strategic communication insights"
  ],
  
  testimonials: [
    {
      quote: "Napoleon AI transformed how I manage communications. I save 2 hours daily and never miss important messages from investors or board members.",
      author: "Sarah Chen",
      role: "CEO, TechVenture",
      company: "Fortune 500 Company",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      quote: "The AI prioritization is incredibly accurate. It understands what matters to executives and surfaces critical communications instantly.",
      author: "Michael Rodriguez",
      role: "Chief Strategy Officer",
      company: "Global Enterprises",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      quote: "Finally, a communication tool designed for C-suite needs. The luxury experience matches our brand standards.",
      author: "Alexandra Thompson",
      role: "Chief Operating Officer", 
      company: "Premium Brands Inc",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
    }
  ]
}

// Format number for executive dashboards
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

// Executive time formatting
export function formatTimesSaved(hours: number): string {
  if (hours >= 40) {
    return `${Math.round(hours / 40)} weeks`
  }
  if (hours >= 8) {
    return `${Math.round(hours / 8)} days`
  }
  return `${hours} hours`
}

// Luxury loading states
export const luxuryLoadingStates = {
  text: "Preparing your executive command center...",
  steps: [
    "Analyzing communication patterns",
    "Prioritizing VIP contacts", 
    "Extracting strategic insights",
    "Finalizing luxury experience"
  ]
}

// Executive role validation
export const executiveRoles = [
  "CEO", "COO", "CFO", "CTO", "CMO", "CHRO",
  "President", "VP", "Director", "Executive",
  "Founder", "Managing Director", "Partner"
] as const

export type ExecutiveRole = typeof executiveRoles[number]

export function isExecutiveRole(role: string): role is ExecutiveRole {
  return executiveRoles.includes(role as ExecutiveRole)
}

// Luxury gradient generator
export function generateLuxuryGradient(color1: string, color2: string): string {
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
}

// Executive communication scoring
export function calculatePriorityScore(factors: {
  isVip?: boolean
  urgentKeywords?: number
  senderImportance?: number
  timeContext?: number
}): number {
  let score = 0
  
  // VIP bonus (40% weight)
  if (factors.isVip) score += 40
  
  // Urgent keywords (25% weight)
  if (factors.urgentKeywords) score += factors.urgentKeywords * 25
  
  // Sender importance (20% weight)  
  if (factors.senderImportance) score += factors.senderImportance * 20
  
  // Time context (15% weight)
  if (factors.timeContext) score += factors.timeContext * 15
  
  return Math.min(score, 100) // Cap at 100
}

// Executive dashboard metrics
export const executiveMetrics = {
  timeSavedPerWeek: 8, // hours
  priorityAccuracy: 94, // percentage
  vipResponseTime: 15, // minutes
  actionItemsExtracted: 150, // per week
  communicationChannels: 3 // Gmail, Slack, Teams
}