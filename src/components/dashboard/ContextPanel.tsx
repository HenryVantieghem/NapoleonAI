"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { 
  Crown, Star, Calendar, Clock, User, Mail, Building, 
  Reply, Archive, Timer, MoreHorizontal, Plus, Check, 
  Edit3, Trash2, AlertCircle, Zap, Eye, CheckCircle,
  ExternalLink, Copy, Flag
} from "lucide-react"
import { Message } from "@/hooks/useMessages"

interface ActionItem {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  createdAt: string
}

interface ContextPanelProps {
  selectedMessage: Message | null
  onReply: () => void
  onArchive: () => void
  onSnooze: () => void
}

export default function ContextPanel({
  selectedMessage,
  onReply,
  onArchive,
  onSnooze
}: ContextPanelProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [newActionItem, setNewActionItem] = useState('')
  const [showNewAction, setShowNewAction] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch action items when message changes
  useEffect(() => {
    if (selectedMessage) {
      fetchActionItems(selectedMessage.id)
    }
  }, [selectedMessage])

  const fetchActionItems = async (messageId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/action-items?messageId=${messageId}`)
      const data = await response.json()
      setActionItems(data.actionItems || [])
    } catch (error) {
      console.error('Error fetching action items:', error)
    } finally {
      setLoading(false)
    }
  }

  const createActionItem = async () => {
    if (!selectedMessage || !newActionItem.trim()) return

    try {
      const response = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            messageId: selectedMessage.id,
            title: newActionItem.trim(),
            priority: 'medium'
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setActionItems(prev => [...prev, data.actionItem])
        setNewActionItem('')
        setShowNewAction(false)
      }
    } catch (error) {
      console.error('Error creating action item:', error)
    }
  }

  const toggleActionItem = async (actionId: string) => {
    try {
      await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          actionItemId: actionId
        })
      })

      setActionItems(prev =>
        prev.map(item =>
          item.id === actionId
            ? { ...item, completed: !item.completed }
            : item
        )
      )
    } catch (error) {
      console.error('Error updating action item:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Empty state when no message selected
  if (!selectedMessage) {
    return (
      <div className="p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-gold-600" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2">
            Select a Message
          </h3>
          <p className="text-navy-600 text-sm max-w-xs">
            Choose a message from your inbox to see AI insights, full content, and manage action items.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gold/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Image
              src={selectedMessage.sender.avatar}
              alt={selectedMessage.sender.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-gold/20"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-navy-900">
                  {selectedMessage.sender.name}
                </h2>
                {selectedMessage.isVip && (
                  <Crown className="w-4 h-4 text-gold-600" />
                )}
              </div>
              <p className="text-sm text-navy-600">{selectedMessage.sender.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-navy-500">{selectedMessage.source}</span>
                <span className="text-xs text-navy-500">•</span>
                <span className="text-xs text-navy-500">{selectedMessage.timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Priority indicator */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${selectedMessage.priority === 'high' ? 'bg-red-100 text-red-700' :
              selectedMessage.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }
          `}>
            {selectedMessage.priority.toUpperCase()}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex space-x-2">
          <button
            onClick={onReply}
            className="flex items-center space-x-1 px-3 py-2 bg-gradient-gold text-navy-900 rounded-lg text-sm hover:shadow-gold transition-all"
          >
            <Reply className="w-4 h-4" />
            <span>AI Reply</span>
          </button>
          <button
            onClick={onArchive}
            className="flex items-center space-x-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 transition-colors"
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>
          <button
            onClick={onSnooze}
            className="flex items-center space-x-1 px-3 py-2 bg-navy-100 text-navy-700 rounded-lg text-sm hover:bg-navy-200 transition-colors"
          >
            <Timer className="w-4 h-4" />
            <span>Snooze</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Subject */}
        <div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            {selectedMessage.subject}
          </h3>
        </div>

        {/* AI Summary */}
        {selectedMessage.aiSummary ? (
          <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-4 border border-gold/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-navy-900" />
              </div>
              <div>
                <h4 className="font-medium text-navy-900 mb-2">AI Summary</h4>
                <p className="text-navy-700 text-sm leading-relaxed">
                  {selectedMessage.aiSummary}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-navy-50 rounded-xl p-4 border border-navy-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-navy-600" />
                <span className="text-navy-700 font-medium">Summary Pending</span>
              </div>
              <button className="px-3 py-1 bg-navy-900 text-white text-sm rounded-lg hover:bg-navy-800 transition-colors">
                Generate
              </button>
            </div>
            <p className="text-navy-600 text-sm mt-2">
              Click to generate an AI summary of this message content.
            </p>
          </div>
        )}

        {/* Full Content */}
        <div>
          <h4 className="font-medium text-navy-900 mb-3 flex items-center justify-between">
            <span>Full Message</span>
            <button
              onClick={() => navigator.clipboard.writeText(selectedMessage.content)}
              className="p-1 text-navy-600 hover:text-navy-900 rounded"
              title="Copy content"
            >
              <Copy className="w-4 h-4" />
            </button>
          </h4>
          <div className="bg-white rounded-xl p-4 border border-gold/20 max-h-64 overflow-y-auto">
            <p className="text-navy-700 leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </p>
          </div>
        </div>

        {/* Action Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-navy-900">Action Items</h4>
            <button
              onClick={() => setShowNewAction(!showNewAction)}
              className="flex items-center space-x-1 px-2 py-1 text-gold-600 hover:text-gold-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* New action item input */}
          <AnimatePresence>
            {showNewAction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    placeholder="Add action item..."
                    className="flex-1 px-3 py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && createActionItem()}
                  />
                  <button
                    onClick={createActionItem}
                    className="px-3 py-2 bg-gradient-gold text-navy-900 rounded-lg text-sm hover:shadow-gold transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action items list */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-gold border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : actionItems.length > 0 ? (
              actionItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className={`
                    flex items-start space-x-3 p-3 rounded-lg border
                    ${item.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gold/20'
                    }
                  `}
                >
                  <button
                    onClick={() => toggleActionItem(item.id)}
                    className={`
                      mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-gold'
                      }
                    `}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`
                      text-sm font-medium
                      ${item.completed ? 'text-green-700 line-through' : 'text-navy-900'}
                    `}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-navy-600 mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-navy-500">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-navy-600 text-sm">
                No action items yet. Click "Add" to create one.
              </div>
            )}
          </div>
        </div>

        {/* VIP Information */}
        {selectedMessage.isVip && (
          <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-4 border border-gold/20">
            <div className="flex items-start space-x-3">
              <Crown className="w-5 h-5 text-gold-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-navy-900 mb-1">VIP Contact</h4>
                <p className="text-navy-700 text-sm">
                  This contact is marked as VIP and receives priority scoring of 90-100.
                  Messages from VIP contacts are automatically highlighted and fast-tracked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Tags */}
        {selectedMessage.tags.length > 0 && (
          <div>
            <h4 className="font-medium text-navy-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedMessage.tags.map((tag, index) => (
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
          </div>
        )}
      </div>
    </div>
  )
}