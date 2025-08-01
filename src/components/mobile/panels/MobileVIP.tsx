'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star, Phone, Mail, Calendar, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VIPContact {
  id: string
  name: string
  email: string
  company?: string
  role?: string
  avatar?: string
  lastMessageDate: string
  messageCount: number
  priorityScore: number
}

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

interface MobileVIPProps {
  messages?: Message[]
  loading?: boolean
  error?: string | null
  selectedMessageId?: string | null
  onMessageSelect?: (messageId: string) => void
  onArchive?: (messageId: string) => void
  onSnooze?: (messageId: string) => void
  vipCount?: number
}

// Mock VIP contacts - in real app, this would come from props/API
const mockVIPContacts: VIPContact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@boarddirectors.com',
    company: 'Board of Directors',
    role: 'Chairman',
    lastMessageDate: '2024-01-31T09:30:00Z',
    messageCount: 3,
    priorityScore: 95
  },
  {
    id: '2', 
    name: 'Michael Rodriguez',
    email: 'm.rodriguez@venturecapital.com',
    company: 'Sequoia Capital',
    role: 'Partner',
    lastMessageDate: '2024-01-31T14:15:00Z',
    messageCount: 2,
    priorityScore: 88
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily@strategicpartners.com',
    company: 'Strategic Partners Inc',
    role: 'CEO',
    lastMessageDate: '2024-01-30T16:45:00Z',
    messageCount: 1,
    priorityScore: 82
  }
]

function VIPContactCard({ contact }: { contact: VIPContact }) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}m ago`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getPriorityColor = (score: number) => {
    if (score >= 90) return 'bg-red-500'
    if (score >= 80) return 'bg-yellow-500' 
    return 'bg-blue-500'
  }

  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-sm border border-gold/20"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center text-navy-900 font-semibold shadow-gold">
            {contact.avatar ? (
              <img 
                src={contact.avatar} 
                alt={contact.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(contact.name)
            )}
          </div>
          <div 
            className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
              getPriorityColor(contact.priorityScore)
            )}
          />
        </div>

        {/* Contact Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-semibold text-navy-900 truncate">
              {contact.name}
            </h3>
            <Crown className="w-4 h-4 text-gold" />
          </div>
          
          <p className="text-xs text-navy-600 truncate mb-1">
            {contact.role} {contact.company && `• ${contact.company}`}
          </p>
          
          <div className="flex items-center justify-between text-xs text-navy-500">
            <span>{formatTime(contact.lastMessageDate)}</span>
            {contact.messageCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full">
                {contact.messageCount}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col space-y-1">
          <button
            className="p-2 text-navy-600 hover:text-navy-900 hover:bg-gold/10 rounded-lg transition-colors"
            aria-label={`Call ${contact.name}`}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-navy-600 hover:text-navy-900 hover:bg-gold/10 rounded-lg transition-colors"
            aria-label={`Email ${contact.name}`}
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function VIPMessagePreview({ 
  message, 
  onSelect 
}: { 
  message: Message
  onSelect: (id: string) => void 
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}m`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-4 cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(message.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Crown className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-navy-900 truncate">
            {message.sender}
          </span>
        </div>
        <span className="text-xs text-navy-500 whitespace-nowrap ml-2">
          {formatTime(message.createdAt)}
        </span>
      </div>
      
      <h4 className="text-sm font-medium text-navy-900 mb-1 truncate">
        {message.subject}
      </h4>
      
      <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
        {message.aiSummary || message.content}
      </p>
      
      {message.priorityScore >= 90 && (
        <div className="flex items-center space-x-1 mt-2">
          <Star className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-600 font-medium">Critical Priority</span>
        </div>
      )}
    </motion.div>
  )
}

export default function MobileVIP({
  messages = [],
  loading = false,
  error = null,
  selectedMessageId,
  onMessageSelect = () => {},
  onArchive = () => {},
  onSnooze = () => {},
  vipCount = 0
}: MobileVIPProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'messages'>('contacts')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter VIP messages
  const vipMessages = messages.filter(message => message.isVip)
  
  // Filter contacts based on search
  const filteredContacts = mockVIPContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gold/20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gold/20 rounded w-32" />
                  <div className="h-3 bg-gold/20 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/20 to-gold/10 border-b border-gold/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
              <Crown className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-navy-900">VIP Communications</h1>
              <p className="text-xs text-navy-600">Executive Priority Management</p>
            </div>
          </div>
          
          <button
            className="p-2 bg-gold text-navy-900 rounded-lg shadow-lg hover:bg-gold/90 transition-colors"
            aria-label="Add new VIP contact"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
          {[
            { id: 'contacts', label: 'Contacts', count: filteredContacts.length },
            { id: 'messages', label: 'Messages', count: vipCount }
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all",
                "min-h-[36px]", // Touch target
                activeTab === id
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-navy-600 hover:text-navy-900"
              )}
            >
              {label} {count > 0 && `(${count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/95 backdrop-blur-luxury border-b border-gold/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-600 w-4 h-4" />
          <input
            type="search"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white/80 transition-all"
            style={{ minHeight: '44px' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20">
        {activeTab === 'contacts' ? (
          <div className="space-y-3">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">No VIP contacts found</h3>
                <p className="text-sm text-navy-600 mb-4">
                  {searchQuery ? "Try adjusting your search" : "Add important contacts to get started"}
                </p>
                <button className="px-4 py-2 bg-gold text-navy-900 rounded-lg font-medium hover:bg-gold/90 transition-colors">
                  Add VIP Contact
                </button>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <VIPContactCard key={contact.id} contact={contact} />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {vipMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">No VIP messages</h3>
                <p className="text-sm text-navy-600">
                  VIP messages will appear here when received
                </p>
              </div>
            ) : (
              vipMessages.map((message) => (
                <VIPMessagePreview
                  key={message.id}
                  message={message}
                  onSelect={onMessageSelect}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}