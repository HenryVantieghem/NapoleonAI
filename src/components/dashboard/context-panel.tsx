"use client"

import { motion } from "framer-motion"
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Star, 
  MessageSquare, 
  Mail, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Link
} from "lucide-react"
import { useState } from "react"
import CalendarWidget from "./calendar-widget"
import { useAuth } from "@/lib/hooks/use-auth"

interface ContextPanelProps {
  selectedMessage: any
  onClose: () => void
}

export function ContextPanel({ selectedMessage, onClose }: ContextPanelProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'details' | 'thread' | 'actions' | 'insights' | 'calendar'>('details')

  // Mock data for demonstration
  const contextData = {
    contact: {
      name: selectedMessage?.sender || 'Sarah Chen',
      role: 'Chief Strategy Officer',
      company: 'Acme Corporation',
      avatar: null,
      interactions: 47,
      lastContact: '3 days ago',
      importance: 'high'
    },
    thread: [
      {
        id: '1',
        subject: 'Q4 Board Meeting Agenda',
        time: '2 min ago',
        type: 'received',
        preview: 'I wanted to get your input on the Q4 board meeting agenda...'
      },
      {
        id: '2',
        subject: 'Re: Strategic Planning Update',
        time: '2 days ago',
        type: 'sent',
        preview: 'Thanks for the update. I think we should focus on...'
      }
    ],
    actions: [
      {
        id: '1',
        title: 'Review Q4 budget proposal',
        dueDate: 'Today, 3:00 PM',
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Schedule board meeting',
        dueDate: 'Tomorrow',
        priority: 'medium',
        status: 'pending'
      }
    ],
    insights: {
      sentiment: 'positive',
      urgency: 'high',
      topics: ['Budget', 'Strategy', 'Board Meeting'],
      aiSummary: 'This message requires immediate attention regarding Q4 board meeting preparations. The sender is requesting input on strategic priorities and budget allocations.'
    }
  }

  const tabs = [
    { id: 'details' as const, label: 'Details', icon: User },
    { id: 'thread' as const, label: 'Thread', icon: MessageSquare },
    { id: 'actions' as const, label: 'Actions', icon: CheckCircle },
    { id: 'insights' as const, label: 'AI Insights', icon: TrendingUp },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar }
  ]

  if (!selectedMessage) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Context Panel</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Select a message to view context
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full bg-gray-50"
    >
      {/* Context Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="font-medium text-gray-900">Message Context</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === id
                ? 'text-burgundy-700 border-b-2 border-burgundy-600 bg-burgundy-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6"
          >
            {/* Contact Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-burgundy rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {contextData.contact.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{contextData.contact.name}</h4>
                  <p className="text-sm text-gray-600">{contextData.contact.role}</p>
                  <p className="text-sm text-gray-500">{contextData.contact.company}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interactions</span>
                  <span className="text-sm font-medium">{contextData.contact.interactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Contact</span>
                  <span className="text-sm font-medium">{contextData.contact.lastContact}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Importance</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    contextData.contact.importance === 'high'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {contextData.contact.importance}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h5 className="font-medium text-gray-900 mb-3">Message Details</h5>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Received {selectedMessage.time}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Priority: {selectedMessage.priority}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">via {selectedMessage.channel}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'thread' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="space-y-4">
              {contextData.thread.map((message, index) => (
                <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{message.subject}</span>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{message.preview}</p>
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                    message.type === 'received' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {message.type}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="space-y-4">
              {contextData.actions.map((action) => (
                <div key={action.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-sm">{action.title}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      action.priority === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {action.priority}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {action.dueDate}
                  </div>
                  <button className="mt-3 text-sm text-burgundy-600 hover:text-burgundy-700 font-medium">
                    Mark as Complete
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6"
          >
            {/* AI Summary */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                AI Summary
              </h5>
              <p className="text-sm text-gray-700">{contextData.insights.aiSummary}</p>
            </div>

            {/* Sentiment & Urgency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h6 className="text-sm font-medium text-gray-900 mb-2">Sentiment</h6>
                <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                  contextData.insights.sentiment === 'positive'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {contextData.insights.sentiment}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h6 className="text-sm font-medium text-gray-900 mb-2">Urgency</h6>
                <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                  contextData.insights.urgency === 'high'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {contextData.insights.urgency}
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h6 className="text-sm font-medium text-gray-900 mb-3">Key Topics</h6>
              <div className="flex flex-wrap gap-2">
                {contextData.insights.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="text-xs bg-burgundy-100 text-burgundy-700 px-2 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'calendar' && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <CalendarWidget userId={user.id} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}