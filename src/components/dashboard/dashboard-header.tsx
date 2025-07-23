"use client"

import { motion } from "framer-motion"
import { Bell, Search, Settings, Crown, Menu, Sun, Moon } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { UserWithProfile } from "@/types/database"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface DashboardHeaderProps {
  user: User | null
  profile: UserWithProfile | null
  activeView: 'digest' | 'messages' | 'actions'
  onViewChange: (view: 'digest' | 'messages' | 'actions') => void
}

export function DashboardHeader({
  user,
  profile,
  activeView,
  onViewChange
}: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getUserDisplayName = () => {
    return "Executive"
  }

  const views = [
    { id: 'digest', label: 'Strategic Digest', icon: Crown },
    { id: 'messages', label: 'All Messages', icon: Bell },
    { id: 'actions', label: 'Action Items', icon: Settings }
  ] as const

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Greeting & Time */}
          <div className="flex items-center space-x-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-serif font-bold text-gray-900"
              >
                {getGreeting()}, {getUserDisplayName()}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-600 flex items-center"
              >
                <Crown className="w-4 h-4 text-burgundy-600 mr-1" />
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </motion.p>
            </div>
          </div>

          {/* Center Section - View Navigation */}
          <nav className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            {views.map(({ id, label, icon: Icon }, index) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => onViewChange(id)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeView === id
                    ? 'bg-white text-burgundy-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${
                  activeView === id ? 'text-burgundy-600' : 'text-gray-500'
                }`} />
                {label}
              </motion.button>
            ))}
          </nav>

          {/* Right Section - Controls */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
              />
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Notifications */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Settings */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-2 pl-3"
            >
              <div className="w-8 h-8 bg-gradient-burgundy rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}