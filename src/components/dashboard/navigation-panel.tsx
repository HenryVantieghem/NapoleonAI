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
        className="p-6 border-b border-platinumSilver/20 bg-gradient-to-br from-warmIvory/20 to-jetBlack/5 backdrop-blur-[10px]"
      >
        <div className="flex items-center mb-4">
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Crown className="w-5 h-5 text-champagneGold mr-2" />
          </motion.div>
          <h2 className="font-serif font-semibold text-jetBlack">Command Center</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-gradient-to-br from-champagneGold/20 to-midnightBlue/20 p-3 rounded-lg border border-champagneGold/30 backdrop-blur-sm"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-bold text-champagneGold"
            >
              {messageStats.priority}
            </motion.div>
            <div className="text-xs text-jetBlack font-medium">Priority</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, rotateY: -5 }}
            className="bg-gradient-to-br from-midnightBlue/20 to-cognacLeather/20 p-3 rounded-lg border border-platinumSilver/30 backdrop-blur-sm"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="text-2xl font-bold text-midnightBlue"
            >
              {messageStats.actionItems}
            </motion.div>
            <div className="text-xs text-jetBlack font-medium">Actions</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-6 border-b border-platinumSilver/20 bg-gradient-to-br from-midnightBlue/5 to-champagneGold/5 backdrop-blur-[10px]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-jetBlack">Filters</h3>
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Filter className="w-4 h-4 text-champagneGold" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          {quickFilters.map(({ id, label, count, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setFilter(id)}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-300
                ${filter === id
                  ? 'bg-champagneGold/20 text-champagneGold border border-champagneGold/30 backdrop-blur-sm'
                  : 'text-jetBlack hover:bg-midnightBlue/10 hover:border hover:border-platinumSilver/30'
                }
              `}
            >
              <div className="flex items-center">
                <motion.div
                  animate={filter === id ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 1 }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                </motion.div>
                {label}
              </div>
              <motion.span 
                animate={{ scale: filter === id ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${filter === id ? 'bg-champagneGold/30 text-champagneGold' : 'bg-platinumSilver/20 text-jetBlack'}
                `}
              >
                {count}
              </motion.span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Connected Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 border-b border-platinumSilver/20 bg-gradient-to-br from-cognacLeather/5 to-midnightBlue/5 backdrop-blur-[10px]"
      >
        <h3 className="font-medium text-jetBlack mb-4">Connected Channels</h3>
        
        <div className="space-y-3">
          {channels.map(({ id, name, icon: Icon, color, unread, status }, index) => (
            <motion.div 
              key={id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x:0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 8 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-midnightBlue/10 transition-all duration-300"
            >
              <div className="flex items-center">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className={`w-3 h-3 rounded-full mr-3`}
                  style={{ backgroundColor: id === 'gmail' ? '#D4AF37' : id === 'slack' ? '#8C5A3C' : '#122039' }}
                />
                <Icon className="w-4 h-4 text-platinumSilver mr-2" />
                <span className="text-sm text-jetBlack font-medium">{name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {unread > 0 && (
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs bg-champagneGold text-jetBlack px-2 py-1 rounded-full font-bold"
                  >
                    {unread}
                  </motion.span>
                )}
                <motion.div 
                  animate={status === 'connected' ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${
                    status === 'connected' ? 'bg-champagneGold' : 'bg-platinumSilver'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-warmIvory/10 to-transparent"
      >
        <h3 className="font-medium text-jetBlack mb-4">Recent Messages</h3>
        
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
                whileHover={{ scale: 1.02, x: 5, rotateY: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all duration-300
                  ${selectedMessage?.id === message.id
                    ? 'border-champagneGold/50 bg-champagneGold/10 backdrop-blur-sm shadow-champagne'
                    : 'border-platinumSilver/30 hover:border-champagneGold/40 hover:bg-midnightBlue/5 hover:backdrop-blur-sm'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className="w-3 h-3 text-gray-400 mr-2" />
                    <motion.span 
                      animate={{ scale: message.priority === 'high' ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        message.priority === 'high' ? 'bg-champagneGold/30 text-champagneGold' :
                        message.priority === 'medium' ? 'bg-cognacLeather/30 text-cognacLeather' :
                        'bg-platinumSilver/30 text-jetBlack'
                      }`}
                    >
                      {message.priority}
                    </motion.span>
                  </div>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                
                <div className={`font-medium text-sm mb-1 ${
                  message.isUnread ? 'text-jetBlack' : 'text-platinumSilver'
                }`}>
                  {message.subject}
                </div>
                
                <div className="text-xs text-platinumSilver/70">
                  from {message.sender}
                </div>
                
                {message.isUnread && (
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-champagneGold rounded-full mt-2 shadow-champagne"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}