"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { 
  Crown, Mail, MessageSquare, Users, Clock, Star, 
  Archive, Reply, Timer, MoreHorizontal, Eye, 
  AlertCircle, CheckCircle, Zap, Calendar
} from "lucide-react"
import { useState } from "react"
import { Message } from "@/hooks/useMessages"

interface MessageCardProps {
  message: Message
  isSelected?: boolean
  onSelect: (messageId: string) => void
  onArchive: (messageId: string) => void
  onSnooze: (messageId: string) => void
  onReply?: (messageId: string) => void
}

export default function MessageCard({
  message,
  isSelected = false,
  onSelect,
  onArchive,
  onSnooze,
  onReply
}: MessageCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500' 
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'gmail': return <Mail className="w-4 h-4" />
      case 'slack': return <MessageSquare className="w-4 h-4" />
      case 'teams': return <Users className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    switch (action) {
      case 'archive':
        onArchive(message.id)
        break
      case 'snooze':
        onSnooze(message.id)
        break
      case 'reply':
        onReply?.(message.id)
        break
      case 'mark_done':
        onArchive(message.id) // Archive as "done"
        break
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`
        relative group cursor-pointer rounded-xl border-2 transition-all duration-300
        ${isSelected 
          ? 'border-gold bg-gold-50 shadow-gold-lg' 
          : 'border-gold/20 bg-white/95 hover:border-gold/40 hover:shadow-luxury'
        }
        ${!message.isRead ? 'border-l-4 border-l-navy-900' : ''}
      `}
      onClick={() => onSelect(message.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {!message.isRead && (
        <div className="absolute -left-1 top-4 w-2 h-2 bg-navy-900 rounded-full"></div>
      )}

      <div className="p-6">
        {/* Header with sender info and metadata */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src={message.sender.avatar}
                alt={message.sender.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-gold/20"
              />
              {message.isVip && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-gold rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-navy-900" />
                </div>
              )}
            </div>

            {/* Sender details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold truncate ${message.isVip ? 'text-navy-900' : 'text-navy-800'}`}>
                  {message.sender.name}
                </h3>
                <div className="flex items-center space-x-1 text-navy-600">
                  {getSourceIcon(message.source)}
                  <span className="text-xs capitalize">{message.source}</span>
                </div>
              </div>
              <p className="text-sm text-navy-600 truncate">{message.sender.email}</p>
            </div>
          </div>

          {/* Priority indicator and time */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(message.priority)} shadow-sm`}></div>
            <span className="text-sm text-navy-600">{message.timeAgo}</span>
            
            {/* More actions menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
                className={`p-1 rounded-lg transition-all ${isHovered ? 'opacity-100' : 'opacity-0'} hover:bg-gold/10`}
              >
                <MoreHorizontal className="w-4 h-4 text-navy-600" />
              </button>

              {/* Actions dropdown */}
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-luxury border border-gold/20 py-2 min-w-[160px]"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={(e) => handleQuickAction('reply', e)}
                    className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-gold/10 flex items-center space-x-2"
                  >
                    <Reply className="w-4 h-4" />
                    <span>AI Reply</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction('mark_done', e)}
                    className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-gold/10 flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Done</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction('snooze', e)}
                    className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-gold/10 flex items-center space-x-2"
                  >
                    <Timer className="w-4 h-4" />
                    <span>Snooze</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction('archive', e)}
                    className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-gold/10 flex items-center space-x-2"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Subject */}
        <h4 className={`text-lg font-medium mb-2 ${!message.isRead ? 'font-semibold' : ''}`}>
          {message.subject}
        </h4>

        {/* Preview */}
        <p className="text-navy-600 mb-3 line-clamp-2">
          {message.preview}
        </p>

        {/* AI Summary */}
        {message.aiSummary ? (
          <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-lg p-3 mb-3 border border-gold/20">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-navy-700">
                <span className="font-medium">AI Insight:</span> {message.aiSummary}
              </p>
            </div>
          </div>
        ) : message.needsAiSummary && (
          <div className="bg-navy-50 rounded-lg p-3 mb-3 border border-navy-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-navy-600" />
                <span className="text-sm text-navy-600">AI summary pending...</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Trigger AI summarization
                }}
                className="text-xs bg-navy-900 text-white px-2 py-1 rounded-lg hover:bg-navy-800 transition-colors"
              >
                Summarize
              </button>
            </div>
          </div>
        )}

        {/* Tags and quick actions */}
        <div className="flex items-center justify-between">
          {/* Tags */}
          <div className="flex items-center space-x-2">
            {message.tags.map((tag, index) => (
              <span
                key={index}
                className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${tag === 'VIP' ? 'bg-gradient-gold text-navy-900' :
                    tag === 'Urgent' ? 'bg-red-100 text-red-700' :
                    tag === 'Unread' ? 'bg-navy-100 text-navy-700' :
                    'bg-gray-100 text-gray-700'
                  }
                `}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Quick action buttons - visible on hover */}
          <div className={`flex space-x-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => handleQuickAction('mark_done', e)}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 transition-colors"
              title="Mark as done"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Done</span>
            </button>
            
            <button
              onClick={(e) => handleQuickAction('reply', e)}
              className="px-3 py-1 bg-gradient-gold text-navy-900 rounded-lg text-sm hover:shadow-gold transition-all"
              title="AI Reply"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Loading skeleton overlay when processing actions */}
      {message.isSnoozed && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-navy-600">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Snoozed</span>
          </div>
        </div>
      )}

      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  )
}