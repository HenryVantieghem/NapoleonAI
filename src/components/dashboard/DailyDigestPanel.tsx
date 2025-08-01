"use client"

import { motion } from "framer-motion"
import { 
  Crown, Target, TrendingUp, Clock, AlertCircle, Mail, 
  Star, Calendar, Zap, Users, MessageSquare, Settings,
  ChevronRight, Filter, BarChart3, PieChart
} from "lucide-react"
import { Message, MessageMetrics } from "@/hooks/useMessages"
import { useState } from "react"

interface DailyDigestPanelProps {
  messages: Message[]
  loading: boolean
  activeFilters: string[]
  onFilterToggle: (filter: string) => void
}

export default function DailyDigestPanel({
  messages,
  loading,
  activeFilters,
  onFilterToggle
}: DailyDigestPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Calculate metrics from messages
  const metrics = {
    total: messages.length,
    vip: messages.filter(m => m.isVip).length,
    urgent: messages.filter(m => m.priority === 'high').length,
    unread: messages.filter(m => !m.isRead).length,
    today: messages.filter(m => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(m.createdAt) >= today
    }).length,
    needsAiSummary: messages.filter(m => m.needsAiSummary).length
  }

  // Get top priorities from messages
  const topPriorities = messages
    .filter(m => m.priority === 'high' && !m.isRead)
    .slice(0, 3)
    .map(m => ({
      title: m.subject,
      sender: m.sender.name,
      urgency: m.priorityScore,
      isVip: m.isVip
    }))

  // Calculate time saved (mock calculation)
  const timeSaved = Math.round((metrics.urgent * 0.5 + metrics.vip * 0.3 + metrics.total * 0.1) * 10) / 10

  // Filter options with icons and descriptions
  const filterOptions = [
    {
      id: 'all',
      label: 'All Messages',
      icon: Mail,
      count: metrics.total,
      description: 'Show all messages'
    },
    {
      id: 'vip',
      label: 'VIP',
      icon: Crown,
      count: metrics.vip,
      description: 'Board members & investors'
    },
    {
      id: 'high-priority',
      label: 'Urgent',
      icon: AlertCircle,
      count: metrics.urgent,
      description: 'Priority score 80+'
    },
    {
      id: 'unread',
      label: 'Unread',
      icon: Mail,
      count: metrics.unread,
      description: 'Not yet reviewed'
    },
    {
      id: 'today',
      label: 'Today',
      icon: Clock,
      count: metrics.today,
      description: 'Received today'
    }
  ]

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 rounded-xl h-32"></div>
            <div className="bg-gray-200 rounded-xl h-24"></div>
            <div className="bg-gray-200 rounded-xl h-24"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
            <Crown className="w-4 h-4 text-navy-900" />
          </div>
          <h2 className="text-xl font-serif font-bold text-navy-900">
            Strategic Digest
          </h2>
        </div>
        <p className="text-navy-600 text-sm">
          Your executive intelligence briefing
        </p>
      </div>

      {/* Top 3 Priorities */}
      <motion.div 
        className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-4 border border-gold/20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gold-600" />
            <h3 className="font-semibold text-navy-900">Top 3 Priorities</h3>
          </div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'priorities' ? null : 'priorities')}
            className="p-1 hover:bg-gold/20 rounded transition-colors"
          >
            <ChevronRight className={`w-4 h-4 text-gold-600 transition-transform ${expandedSection === 'priorities' ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {topPriorities.length > 0 ? (
          <motion.div
            initial={false}
            animate={{ height: expandedSection === 'priorities' ? 'auto' : 'auto' }}
            className="space-y-2"
          >
            {topPriorities.map((priority, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-gold-600 font-medium">•</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-navy-900 font-medium truncate">
                        {priority.title}
                      </span>
                      {priority.isVip && (
                        <Crown className="w-3 h-3 text-gold-600 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-navy-600 text-xs">
                      from {priority.sender}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <p className="text-navy-600 text-sm">No urgent items today</p>
        )}
      </motion.div>

      {/* Executive Metrics */}
      <motion.div 
        className="bg-emerald-50 rounded-xl p-4 border border-emerald-200"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-navy-900">Executive Metrics</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-navy-900">{metrics.total}</div>
            <div className="text-navy-600 text-xs">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{metrics.urgent}</div>
            <div className="text-navy-600 text-xs">Urgent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-600">{metrics.vip}</div>
            <div className="text-navy-600 text-xs">VIP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{timeSaved}h</div>
            <div className="text-navy-600 text-xs">Saved</div>
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      {metrics.needsAiSummary > 0 && (
        <motion.div 
          className="bg-navy-50 rounded-xl p-4 border border-navy-200"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-navy-600" />
            <h3 className="font-semibold text-navy-900">AI Processing</h3>
          </div>
          <p className="text-navy-700 text-sm mb-2">
            {metrics.needsAiSummary} messages ready for AI summarization
          </p>
          <button className="text-xs bg-navy-900 text-white px-3 py-1 rounded-lg hover:bg-navy-800 transition-colors">
            Process All
          </button>
        </motion.div>
      )}

      {/* Filter Chips */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-5 h-5 text-navy-600" />
          <h3 className="font-semibold text-navy-900">Quick Filters</h3>
        </div>
        
        <div className="space-y-2">
          {filterOptions.map(({ id, label, icon: Icon, count, description }) => (
            <motion.button
              key={id}
              onClick={() => onFilterToggle(id)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200
                ${activeFilters.includes(id)
                  ? id === 'vip' 
                    ? 'bg-gradient-gold text-navy-900 shadow-gold'
                    : id === 'high-priority'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-navy-900 text-white shadow-lg'
                  : 'bg-white/80 text-navy-700 hover:bg-white border border-gold/20 hover:border-gold/40'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className={`text-xs ${activeFilters.includes(id) ? 'opacity-80' : 'text-navy-600'}`}>
                    {description}
                  </div>
                </div>
              </div>
              <div className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${activeFilters.includes(id)
                  ? 'bg-white/20'
                  : 'bg-navy-100 text-navy-700'
                }
              `}>
                {count}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="bg-white/80 rounded-xl p-4 border border-gold/20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-navy-600" />
          <h3 className="font-semibold text-navy-900">Quick Actions</h3>
        </div>
        
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-navy-700 hover:text-navy-900 py-2 px-2 hover:bg-gold/10 rounded transition-colors">
            Schedule board meeting prep
          </button>
          <button className="w-full text-left text-sm text-navy-700 hover:text-navy-900 py-2 px-2 hover:bg-gold/10 rounded transition-colors">
            Review investor updates
          </button>
          <button className="w-full text-left text-sm text-navy-700 hover:text-navy-900 py-2 px-2 hover:bg-gold/10 rounded transition-colors">
            Process action items
          </button>
        </div>
      </motion.div>

      {/* Settings Section */}
      <motion.div 
        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'settings' ? null : 'settings')}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-navy-900">Settings</h3>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${expandedSection === 'settings' ? 'rotate-90' : ''}`} />
        </button>

        {expandedSection === 'settings' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 space-y-2"
          >
            <button className="w-full text-left text-sm text-gray-700 hover:text-navy-900 py-1">
              Notification preferences
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-navy-900 py-1">
              VIP contact management
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-navy-900 py-1">
              AI summary settings
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}