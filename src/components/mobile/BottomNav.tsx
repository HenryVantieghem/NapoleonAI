'use client'

import { motion } from 'framer-motion'
import { Mail, Crown, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MobileTab = 'inbox' | 'vip' | 'digest' | 'settings'

interface BottomNavProps {
  activeTab: MobileTab
  onTabChange: (tab: MobileTab) => void
  unreadCount?: number
  vipCount?: number
  className?: string
}

const tabs = [
  {
    id: 'inbox' as MobileTab,
    label: 'Inbox',
    icon: Mail,
    ariaLabel: 'View all messages in inbox'
  },
  {
    id: 'vip' as MobileTab,
    label: 'VIP',
    icon: Crown,
    ariaLabel: 'View VIP messages and contacts'
  },
  {
    id: 'digest' as MobileTab,
    label: 'Digest',
    icon: FileText,
    ariaLabel: 'View daily digest and insights'
  },
  {
    id: 'settings' as MobileTab,
    label: 'Settings',
    icon: Settings,
    ariaLabel: 'Access settings and preferences'
  }
]

export default function BottomNav({ 
  activeTab, 
  onTabChange, 
  unreadCount = 0, 
  vipCount = 0,
  className 
}: BottomNavProps) {
  const getBadgeCount = (tabId: MobileTab) => {
    switch (tabId) {
      case 'inbox':
        return unreadCount
      case 'vip':
        return vipCount
      default:
        return 0
    }
  }

  const getTabColors = (tabId: MobileTab, isActive: boolean) => {
    if (tabId === 'vip') {
      return isActive 
        ? 'text-gold bg-gold/10' 
        : 'text-gold-300 hover:text-gold'
    }
    return isActive 
      ? 'text-gold bg-gold/10' 
      : 'text-cream hover:text-gold'
  }

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-navy-900/95 backdrop-blur-luxury",
        "border-t border-gold/20",
        "px-2 py-1",
        "safe-area-inset-bottom", // Handles iPhone notch/home indicator
        className
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon, ariaLabel }) => {
          const isActive = activeTab === id
          const badgeCount = getBadgeCount(id)
          
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "min-h-[44px] px-3 py-2 rounded-xl", // 44px minimum touch target
                "transition-all duration-200 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-gold/50",
                "active:scale-95", // Subtle press feedback
                getTabColors(id, isActive)
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              role="tab"
              aria-selected={isActive}
              aria-label={ariaLabel}
              aria-describedby={badgeCount > 0 ? `${id}-badge` : undefined}
            >
              {/* Icon container with subtle hover effect */}
              <motion.div
                className="relative"
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive && "drop-shadow-glow-gold"
                  )} 
                />
                
                {/* Badge for unread counts */}
                {badgeCount > 0 && (
                  <motion.div
                    id={`${id}-badge`}
                    className={cn(
                      "absolute -top-2 -right-2",
                      "min-w-[18px] h-[18px] px-1",
                      "bg-red-500 text-white text-xs font-medium",
                      "rounded-full flex items-center justify-center",
                      "shadow-lg animate-pulse"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    aria-label={`${badgeCount} unread`}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </motion.div>
                )}
              </motion.div>
              
              {/* Label */}
              <span 
                className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-75"
                )}
              >
                {label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 w-8 h-0.5 bg-gold rounded-full"
                  layoutId="bottomNavIndicator"
                  initial={false}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                  }}
                  style={{ x: '-50%' }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* iOS safe area spacing */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}