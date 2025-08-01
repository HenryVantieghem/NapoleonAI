import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import Fuse from 'fuse.js'

export interface Message {
  id: string
  sender: {
    name: string
    email: string
    avatar: string
  }
  subject: string
  content: string
  preview: string
  aiSummary: string | null
  priorityScore: number
  priority: 'high' | 'medium' | 'low'
  isVip: boolean
  isRead: boolean
  isArchived: boolean
  isSnoozed: boolean
  source: string
  createdAt: string
  updatedAt: string
  timeAgo: string
  needsAiSummary: boolean
  tags: string[]
}

export interface MessageMetrics {
  total: number
  vip: number
  urgent: number
  unread: number
  today: number
  needsAiSummary: number
}

export interface UseMessagesReturn {
  messages: Message[]
  filteredMessages: Message[]
  selectedMessage: Message | null
  loading: boolean
  error: string | null
  metrics: MessageMetrics | null
  
  // Actions
  refreshMessages: () => Promise<void>
  searchMessages: (query: string) => void
  filterMessages: (filters: string[]) => void
  selectMessage: (messageId: string) => void
  archiveMessage: (messageId: string) => Promise<void>
  snoozeMessage: (messageId: string, snoozeUntil?: string) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  updatePriority: (messageId: string, priority: number) => Promise<void>
  createActionItem: (messageId: string, actionData: any) => Promise<void>
  
  // Search and filter state
  searchQuery: string
  activeFilters: string[]
  searchResults: Message[]
}

export function useMessages(): UseMessagesReturn {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MessageMetrics | null>(null)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
  
  // Supabase client for real-time subscriptions
  const supabase = createClient()

  // Fuse.js search configuration
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'subject', weight: 0.4 },
      { name: 'sender.name', weight: 0.3 },
      { name: 'sender.email', weight: 0.2 },
      { name: 'content', weight: 0.3 },
      { name: 'aiSummary', weight: 0.2 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true
  }), [])

  const fuse = useMemo(() => new Fuse(messages, fuseOptions), [messages, fuseOptions])

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (activeFilters.length > 0 && !activeFilters.includes('all')) {
        params.set('filters', activeFilters.join(','))
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`/api/messages?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      setMessages(data.messages || [])
      setMetrics(data.metrics || null)
      
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [user, activeFilters, searchQuery])

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return

    // Subscribe to message changes
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time message update:', payload)
          
          // Handle different event types
          switch (payload.eventType) {
            case 'INSERT':
              // New message received
              fetchMessages() // Refresh to get transformed data
              break
            case 'UPDATE':
              // Message updated (read status, priority, etc.)
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === payload.new.id 
                    ? { ...msg, ...transformMessage(payload.new) }
                    : msg
                )
              )
              break
            case 'DELETE':
              // Message deleted/archived
              setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
              break
          }
        }
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [user, supabase, fetchMessages])

  // Initial data fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Helper function to transform raw message data
  const transformMessage = (rawMessage: any): Partial<Message> => {
    return {
      id: rawMessage.id,
      isRead: rawMessage.is_read,
      isArchived: rawMessage.is_archived,
      isSnoozed: rawMessage.is_snoozed,
      priorityScore: rawMessage.priority_score,
      updatedAt: rawMessage.updated_at,
      // Add other transformed fields as needed
    }
  }

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return messages
    
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse, messages])

  // Filter functionality
  const filteredMessages = useMemo(() => {
    let filtered = searchQuery ? searchResults : messages

    if (activeFilters.includes('all')) return filtered

    if (activeFilters.includes('vip')) {
      filtered = filtered.filter(msg => msg.isVip)
    }
    
    if (activeFilters.includes('high-priority')) {
      filtered = filtered.filter(msg => msg.priority === 'high')
    }
    
    if (activeFilters.includes('unread')) {
      filtered = filtered.filter(msg => !msg.isRead)
    }
    
    if (activeFilters.includes('today')) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter(msg => 
        new Date(msg.createdAt) >= today
      )
    }

    return filtered
  }, [messages, searchResults, activeFilters, searchQuery])

  // Message actions
  const performMessageAction = useCallback(async (
    messageId: string, 
    action: string, 
    data?: any
  ) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          messageId,
          data
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Refresh messages to reflect changes
      await fetchMessages()
      
      return result
    } catch (err) {
      console.error(`Error performing ${action}:`, err)
      setError(err instanceof Error ? err.message : `Failed to ${action}`)
      throw err
    }
  }, [fetchMessages])

  // Public API
  const refreshMessages = useCallback(() => fetchMessages(), [fetchMessages])

  const searchMessages = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const filterMessages = useCallback((filters: string[]) => {
    setActiveFilters(filters)
  }, [])

  const markAsRead = useCallback(async (messageId: string) => {
    await performMessageAction(messageId, 'mark_read')
  }, [performMessageAction])

  const selectMessage = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    setSelectedMessage(message || null)
    
    // Mark as read when selected
    if (message && !message.isRead) {
      markAsRead(messageId)
    }
  }, [messages, markAsRead])

  const archiveMessage = useCallback(async (messageId: string) => {
    await performMessageAction(messageId, 'archive')
  }, [performMessageAction])

  const snoozeMessage = useCallback(async (messageId: string, snoozeUntil?: string) => {
    await performMessageAction(messageId, 'snooze', { snoozeUntil })
  }, [performMessageAction])

  const updatePriority = useCallback(async (messageId: string, priority: number) => {
    await performMessageAction(messageId, 'update_priority', { priorityScore: priority })
  }, [performMessageAction])

  const createActionItem = useCallback(async (messageId: string, actionData: any) => {
    await performMessageAction(messageId, 'create_action_item', actionData)
  }, [performMessageAction])

  return {
    messages,
    filteredMessages,
    selectedMessage,
    loading,
    error,
    metrics,
    
    // Actions
    refreshMessages,
    searchMessages,
    filterMessages,
    selectMessage,
    archiveMessage,
    snoozeMessage,
    markAsRead,
    updatePriority,
    createActionItem,
    
    // Search and filter state
    searchQuery,
    activeFilters,
    searchResults
  }
}