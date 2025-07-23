"use client"

import { motion } from "framer-motion"
import { 
  Crown, 
  Mail, 
  MessageSquare, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Filter,
  Star,
  Clock,
  AlertCircle
} from "lucide-react"
import { useState } from "react"

interface NavigationPanelProps {
  activeView: 'digest' | 'messages' | 'actions'
  onViewChange: (view: 'digest' | 'messages' | 'actions') => void
  onMessageSelect: (message: any) => void
  selectedMessage: any
}

export function NavigationPanel({
  activeView,
  onViewChange,
  onMessageSelect,
  selectedMessage
}: NavigationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority' | 'today'>('all')

  // Mock data for demonstration
  const messageStats = {
    unread: 23,
    priority: 8,
    actionItems: 5,
    todayMessages: 47
  }

  const quickFilters = [
    { id: 'all', label: 'All Messages', count: 156, icon: Mail },
    { id: 'unread', label: 'Unread', count: messageStats.unread, icon: AlertCircle },
    { id: 'priority', label: 'Priority', count: messageStats.priority, icon: Star },
    { id: 'today', label: 'Today', count: messageStats.todayMessages, icon: Clock }
  ] as const

  const channels = [
    { 
      id: 'gmail', 
      name: 'Gmail', 
      icon: Mail, 
      color: 'bg-red-500',
      unread: 12,
      status: 'connected'
    },
    { 
      id: 'slack', 
      name: 'Slack', 
      icon: MessageSquare, 
      color: 'bg-purple-500',
      unread: 8,
      status: 'connected'
    },
    { 
      id: 'teams', 
      name: 'Teams', 
      icon: Users, 
      color: 'bg-blue-500',
      unread: 3,
      status: 'connected'
    }
  ]

  const recentMessages = [
    {
      id: '1',
      subject: 'Q4 Board Meeting Agenda',
      sender: 'Sarah Chen',
      channel: 'gmail',
      priority: 'high',
      time: '2 min ago',
      isUnread: true
    },
    {
      id: '2',
      subject: 'Acquisition Update - Confidential',
      sender: 'Michael Torres',
      channel: 'slack',
      priority: 'high',
      time: '5 min ago',
      isUnread: true
    },
    {
      id: '3',
      subject: 'Strategic Partnership Proposal',
      sender: 'Jennifer Liu',
      channel: 'teams',
      priority: 'medium',
      time: '12 min ago',
      isUnread: false
    },
    {
      id: '4',
      subject: 'Budget Review Meeting',
      sender: 'David Kim',
      channel: 'gmail',
      priority: 'medium',
      time: '25 min ago',
      isUnread: true
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getChannelIcon = (channel: string) => {
    const channelData = channels.find(c => c.id === channel)
    return channelData?.icon || Mail
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 border-b border-gray-100"
      >
        <div className="flex items-center mb-4">
          <Crown className="w-5 h-5 text-burgundy-600 mr-2" />
          <h2 className="font-serif font-semibold text-gray-900">Command Center</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-burgundy-50 to-burgundy-100 p-3 rounded-lg">
            <div className="text-2xl font-bold text-burgundy-700">{messageStats.priority}</div>
            <div className="text-xs text-burgundy-600">Priority</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{messageStats.actionItems}</div>
            <div className="text-xs text-blue-600">Actions</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-6 border-b border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <Filter className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          {quickFilters.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`
                w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors
                ${filter === id
                  ? 'bg-burgundy-50 text-burgundy-700'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </div>
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${filter === id ? 'bg-burgundy-100' : 'bg-gray-100'}
              `}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Connected Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 border-b border-gray-100"
      >
        <h3 className="font-medium text-gray-900 mb-4">Connected Channels</h3>
        
        <div className="space-y-3">
          {channels.map(({ id, name, icon: Icon, color, unread, status }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${color} rounded-full mr-3`}></div>
                <Icon className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">{name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {unread > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                    {unread}
                  </span>
                )}
                <div className={`w-2 h-2 rounded-full ${
                  status === 'connected' ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        <h3 className="font-medium text-gray-900 mb-4">Recent Messages</h3>
        
        <div className="space-y-3">
          {recentMessages.map((message, index) => {
            const Icon = getChannelIcon(message.channel)
            
            return (
              <motion.button
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => onMessageSelect(message)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all
                  ${selectedMessage?.id === message.id
                    ? 'border-burgundy-200 bg-burgundy-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className="w-3 h-3 text-gray-400 mr-2" />
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                
                <div className={`font-medium text-sm mb-1 ${
                  message.isUnread ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {message.subject}
                </div>
                
                <div className="text-xs text-gray-500">
                  from {message.sender}
                </div>
                
                {message.isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}