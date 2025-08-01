"use client"

import { motion } from "framer-motion"
import { Search, Filter, Mail, MessageSquare, Users, Star, Clock, ArrowRight } from "lucide-react"
import { useState } from "react"

interface MessagesListProps {
  onMessageSelect: (message: any) => void
  selectedMessage: any
}

export function MessagesList({ onMessageSelect, selectedMessage }: MessagesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'priority' | 'today'>('all')

  // Mock unified messages data
  const allMessages = [
    {
      id: '1',
      subject: 'Q4 Board Meeting - Strategic Decisions Required',
      sender: 'Sarah Chen',
      senderRole: 'Chief Strategy Officer',
      channel: 'gmail',
      channelIcon: Mail,
      priority: 'critical',
      time: '2 min ago',
      isUnread: true,
      preview: 'I wanted to get your input on the Q4 board meeting agenda. We need to address the acquisition strategy and budget allocation for next year...',
      attachments: 2,
      threadCount: 3
    },
    {
      id: '2',
      subject: 'Acquisition Target - Due Diligence Complete',
      sender: 'Michael Torres',
      senderRole: 'Corporate Development',
      channel: 'slack',
      channelIcon: MessageSquare,
      priority: 'critical',
      time: '5 min ago',
      isUnread: true,
      preview: '#strategy-team: Due diligence on TechCorp acquisition completed. Financial models show 15% IRR. Full report attached for your review.',
      attachments: 5,
      threadCount: 12
    },
    {
      id: '3',
      subject: 'Enterprise Customer Escalation - Immediate Action',
      sender: 'Jennifer Liu',
      senderRole: 'VP Sales',
      channel: 'teams',
      channelIcon: Users,
      priority: 'high',
      time: '12 min ago',
      isUnread: true,
      preview: 'Major enterprise client (GlobalTech Inc.) threatening to cancel $5M contract due to service issues. Need executive intervention ASAP.',
      attachments: 1,
      threadCount: 8
    },
    {
      id: '4',
      subject: 'Board Meeting Preparation - Document Review',
      sender: 'David Kim',
      senderRole: 'Legal Counsel',
      channel: 'gmail',
      channelIcon: Mail,
      priority: 'high',
      time: '25 min ago',
      isUnread: false,
      preview: 'Please review the attached board resolutions and governance documents before tomorrow\'s meeting. Legal has flagged 3 items requiring your attention.',
      attachments: 7,
      threadCount: 2
    },
    {
      id: '5',
      subject: 'Q3 Performance Review - Executive Summary',
      sender: 'Lisa Zhang',
      senderRole: 'Chief Financial Officer',
      channel: 'slack',
      channelIcon: MessageSquare,
      priority: 'medium',
      time: '1 hour ago',
      isUnread: false,
      preview: 'Q3 results exceed expectations. Revenue up 23% YoY, EBITDA margin improved to 28%. Detailed analysis and projections attached.',
      attachments: 4,
      threadCount: 15
    },
    {
      id: '6',
      subject: 'Strategic Partnership - Tesla Meeting Follow-up',
      sender: 'Robert Chen',
      senderRole: 'VP Business Development',
      channel: 'teams',
      channelIcon: Users,
      priority: 'medium',
      time: '2 hours ago',
      isUnread: false,
      preview: 'Follow-up from yesterday\'s Tesla partnership discussion. They\'re interested in our AI platform for their manufacturing operations.',
      attachments: 3,
      threadCount: 6
    }
  ]

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'gmail': return 'text-red-600 bg-red-50'
      case 'slack': return 'text-purple-600 bg-purple-50'
      case 'teams': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const filteredMessages = allMessages.filter(message => {
    if (searchQuery && !message.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.sender.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    switch (filterBy) {
      case 'unread': return message.isUnread
      case 'priority': return message.priority === 'critical' || message.priority === 'high'
      case 'today': return message.time.includes('min ago') || message.time.includes('hour ago')
      default: return true
    }
  })

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 border-b border-gray-100"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-500"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread Only</option>
            <option value="priority">Priority</option>
            <option value="today">Today</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredMessages.length} messages</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              {allMessages.filter(m => m.isUnread).length} unread
            </span>
            <span className="flex items-center">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              {allMessages.filter(m => m.priority === 'critical' || m.priority === 'high').length} priority
            </span>
          </div>
        </div>
      </motion.div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-4">
          {filteredMessages.map((message, index) => {
            const ChannelIcon = message.channelIcon
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => onMessageSelect(message)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  ${selectedMessage?.id === message.id
                    ? 'border-burgundy-200 bg-burgundy-50'
                    : message.isUnread
                    ? 'border-blue-200 bg-blue-50/30'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Channel & Priority Indicators */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className={`p-1 rounded ${getChannelColor(message.channel)}`}>
                        <ChannelIcon className="w-3 h-3" />
                      </div>
                      {message.isUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(message.priority)}`}>
                          {message.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                      
                      <h4 className={`font-semibold text-sm mb-1 ${
                        message.isUnread ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {message.subject}
                      </h4>
                      
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">{message.sender}</span>
                        <span className="text-gray-500"> • {message.senderRole}</span>
                      </p>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {message.preview}
                      </p>
                    </div>
                  </div>

                  {/* Action Indicators */}
                  <div className="flex flex-col items-end space-y-1 ml-4">
                    {message.attachments > 0 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        📎 {message.attachments}
                      </span>
                    )}
                    {message.threadCount > 1 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        💬 {message.threadCount}
                      </span>
                    )}
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                </div>

                {/* Quick Actions for Priority Messages */}
                {(message.priority === 'critical' || message.priority === 'high') && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <button className="text-xs bg-burgundy-600 text-white px-3 py-1 rounded-lg hover:bg-burgundy-700 transition-colors">
                      Quick Reply
                    </button>
                    <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">
                      Schedule
                    </button>
                    <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">
                      Delegate
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MessagesList