'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Clock, Users, Star, AlertCircle, CheckCircle, 
  Calendar, BarChart3, MessageSquare, Crown, FileText, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  sender: string
  subject: string
  content: string
  createdAt: string
  isVip: boolean
  priorityScore: number
  isRead: boolean
  aiSummary?: string
}

interface MobileDigestProps {
  messages?: Message[]
  loading?: boolean
}

interface DigestMetric {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<any>
  color: string
}

function MetricCard({ metric }: { metric: DigestMetric }) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
      default:
        return null
    }
  }

  return (
    <motion.div
      className={cn(
        "bg-white rounded-xl p-4 shadow-sm border-l-4",
        metric.color
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <metric.icon className="w-5 h-5 text-navy-600" />
          <span className="text-sm font-medium text-navy-900">{metric.label}</span>
        </div>
        {getTrendIcon()}
      </div>
      
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-navy-900">{metric.value}</span>
        {metric.change && (
          <span className={cn(
            "text-xs font-medium",
            metric.trend === 'up' ? "text-green-600" : 
            metric.trend === 'down' ? "text-red-600" : 
            "text-navy-500"
          )}>
            {metric.change}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function PriorityInsight({ messages }: { messages: Message[] }) {
  const highPriorityMessages = messages.filter(m => m.priorityScore >= 80)
  const vipMessages = messages.filter(m => m.isVip)
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-semibold text-red-900">Priority Insights</h3>
      </div>
      
      <div className="space-y-2">
        {highPriorityMessages.length > 0 && (
          <div className="text-sm text-red-800">
            <strong>{highPriorityMessages.length}</strong> high-priority message{highPriorityMessages.length !== 1 ? 's' : ''} require immediate attention
          </div>
        )}
        
        {vipMessages.length > 0 && (
          <div className="text-sm text-red-800">
            <strong>{vipMessages.length}</strong> VIP communication{vipMessages.length !== 1 ? 's' : ''} pending response
          </div>
        )}
        
        {highPriorityMessages.length === 0 && vipMessages.length === 0 && (
          <div className="text-sm text-green-800">
            All messages are under control. Great work! 🎉
          </div>
        )}
      </div>
    </div>
  )
}

function TopMessage({ message }: { message: Message }) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {message.isVip && <Crown className="w-4 h-4 text-gold" />}
          <span className="text-sm font-medium text-navy-900 truncate">
            {message.sender}
          </span>
        </div>
        <span className="text-xs text-navy-500 whitespace-nowrap ml-2">
          {formatTime(message.createdAt)}
        </span>
      </div>
      
      <h4 className="text-sm font-semibold text-navy-900 mb-2 line-clamp-2">
        {message.subject}
      </h4>
      
      <p className="text-xs text-navy-600 line-clamp-3 leading-relaxed mb-3">
        {message.aiSummary || message.content}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            message.priorityScore >= 90 ? "bg-red-500 animate-pulse" :
            message.priorityScore >= 70 ? "bg-yellow-500" :
            "bg-green-500"
          )} />
          <span className="text-xs text-navy-500">
            Priority: {message.priorityScore}/100
          </span>
        </div>
        
        <button className="px-3 py-1 bg-gold text-navy-900 text-xs font-medium rounded-lg hover:bg-gold/90 transition-colors">
          View
        </button>
      </div>
    </motion.div>
  )
}

function ActionItems({ messages }: { messages: Message[] }) {
  // Mock action items - in real app, these would be extracted by AI
  const mockActionItems = [
    {
      id: '1',
      title: 'Review Q4 financial reports',
      dueDate: '2024-02-01',
      priority: 'high' as const,
      source: 'Board Meeting Agenda'
    },
    {
      id: '2', 
      title: 'Schedule investor call',
      dueDate: '2024-01-31',
      priority: 'medium' as const,
      source: 'Series A Follow-up'
    },
    {
      id: '3',
      title: 'Approve marketing budget',
      dueDate: '2024-02-02',
      priority: 'medium' as const,
      source: 'Marketing Department Request'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50'
      case 'medium': return 'border-yellow-400 bg-yellow-50'
      default: return 'border-blue-400 bg-blue-50'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">Action Items</h3>
        <span className="text-xs text-navy-500">{mockActionItems.length} pending</span>
      </div>
      
      {mockActionItems.map((item) => (
        <motion.div
          key={item.id}
          className={cn(
            "border-l-4 bg-white rounded-r-xl p-3 shadow-sm",
            getPriorityColor(item.priority)
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-navy-900 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-navy-600 mb-2">
                From: {item.source}
              </p>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 text-navy-500" />
                <span className="text-xs text-navy-500">
                  Due: {new Date(item.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            <button
              className="p-1 text-navy-500 hover:text-green-600 transition-colors"
              aria-label="Mark as complete"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function MobileDigest({
  messages = [],
  loading = false
}: MobileDigestProps) {
  const [refreshing, setRefreshing] = useState(false)

  // Calculate metrics from messages
  const totalMessages = messages.length
  const unreadMessages = messages.filter(m => !m.isRead).length
  const vipMessages = messages.filter(m => m.isVip).length
  const highPriorityMessages = messages.filter(m => m.priorityScore >= 80).length
  
  // Get today's messages
  const today = new Date().toDateString()
  const todayMessages = messages.filter(m => 
    new Date(m.createdAt).toDateString() === today
  )

  // Get top priority message
  const topMessage = messages
    .filter(m => !m.isRead)
    .sort((a, b) => b.priorityScore - a.priorityScore)[0]

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const metrics: DigestMetric[] = [
    {
      label: 'Total Messages',
      value: totalMessages,
      change: `+${todayMessages.length} today`,
      trend: 'neutral',
      icon: MessageSquare,
      color: 'border-blue-400'
    },
    {
      label: 'Unread',
      value: unreadMessages,
      change: unreadMessages > 5 ? 'High volume' : 'Manageable',
      trend: unreadMessages > 10 ? 'up' : 'neutral',
      icon: AlertCircle,
      color: 'border-orange-400'
    },
    {
      label: 'VIP Messages',
      value: vipMessages,
      change: vipMessages > 0 ? 'Requires attention' : 'All clear',
      trend: vipMessages > 0 ? 'up' : 'neutral',
      icon: Crown,
      color: 'border-gold'
    },
    {
      label: 'High Priority',
      value: highPriorityMessages,
      change: highPriorityMessages > 0 ? 'Action needed' : 'Under control',
      trend: highPriorityMessages > 3 ? 'up' : 'neutral',
      icon: Star,
      color: 'border-red-400'
    }
  ]

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gold/20 rounded w-20 mb-2" />
                <div className="h-8 bg-gold/20 rounded w-12" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gold/20 rounded w-32 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-gold/20 rounded w-full" />
              <div className="h-3 bg-gold/20 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
              <BarChart3 className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold">Executive Digest</h1>
              <p className="text-xs text-gold-200">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gold text-navy-900 rounded-lg shadow-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
            aria-label="Refresh digest"
          >
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Priority Insights */}
        <PriorityInsight messages={messages} />

        {/* Top Priority Message */}
        {topMessage && (
          <div>
            <h3 className="text-sm font-semibold text-navy-900 mb-3">Top Priority</h3>
            <TopMessage message={topMessage} />
          </div>
        )}

        {/* Action Items */}
        <ActionItems messages={messages} />

        {/* Weekly Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-green-900">Weekly Summary</h3>
          </div>
          
          <div className="space-y-2 text-sm text-green-800">
            <div>📈 Message volume up 12% from last week</div>
            <div>⭐ 94% of VIP messages responded to within 2 hours</div>
            <div>✅ 18 action items completed this week</div>
            <div>🎯 Response time improved by 23%</div>
          </div>
        </div>
      </div>
    </div>
  )
}