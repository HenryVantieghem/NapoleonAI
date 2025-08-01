'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

export interface RealtimeMessage {
  id: string
  user_id: string
  source: 'gmail' | 'slack' | 'teams'
  external_id: string
  sender_name: string
  sender_email: string
  subject: string
  content: string
  ai_summary?: string
  priority_score: number
  is_vip: boolean
  is_read: boolean
  is_archived: boolean
  is_snoozed: boolean
  message_date: string
  created_at: string
  updated_at: string
}

export interface MessageUpdate {
  messageId: string
  userId: string
  summary?: string
  priorityScore?: number
  isVip?: boolean
  actionItemsCount?: number
  timestamp: string
}

export function useRealtimeMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [processingCount, setProcessingCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Fetch messages error:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  // Handle real-time message updates
  const handleMessageUpdate = useCallback((payload: any) => {
    const { messageId, summary, priorityScore, isVip } = payload

    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            ai_summary: summary || msg.ai_summary,
            priority_score: priorityScore !== undefined ? priorityScore : msg.priority_score,
            is_vip: isVip !== undefined ? isVip : msg.is_vip,
            updated_at: new Date().toISOString()
          }
        : msg
    ))

    setLastUpdate(new Date().toISOString())
    setProcessingCount(prev => Math.max(0, prev - 1))
  }, [])

  // Handle new messages
  const handleNewMessage = useCallback((payload: any) => {
    const newMessage = payload.new as RealtimeMessage
    
    if (newMessage.user_id === user?.id) {
      setMessages(prev => [newMessage, ...prev.slice(0, 49)]) // Keep latest 50
      
      // Increment processing count if no AI summary
      if (!newMessage.ai_summary) {
        setProcessingCount(prev => prev + 1)
      }
    }
  }, [user?.id])

  // Handle message deletion
  const handleMessageDelete = useCallback((payload: any) => {
    const deletedMessage = payload.old as RealtimeMessage
    
    if (deletedMessage.user_id === user?.id) {
      setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id))
    }
  }, [user?.id])

  // Trigger manual processing for unprocessed messages
  const triggerProcessing = useCallback(async (messageId?: string) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/ai/process-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageIds: messageId ? [messageId] : undefined,
          batchSize: messageId ? 1 : 10
        })
      })

      if (!response.ok) {
        throw new Error('Processing failed')
      }

      const result = await response.json()
      console.log('Processing triggered:', result)
      
      if (result.processed > 0) {
        setProcessingCount(prev => prev + result.processed)
      }
    } catch (error) {
      console.error('Error triggering processing:', error)
    }
  }, [user?.id])

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          messageId
        })
      })

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [])

  // Archive message
  const archiveMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          messageId
        })
      })

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Error archiving message:', error)
    }
  }, [])

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user?.id) return

    fetchMessages()

    // Subscribe to message table changes
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`
        },
        handleNewMessage
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedMessage = payload.new as RealtimeMessage
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`
        },
        handleMessageDelete
      )
      .subscribe()

    // Subscribe to processing updates broadcast
    const processingSubscription = supabase
      .channel('message_updates')
      .on(
        'broadcast',
        { event: 'message_processed' },
        (payload) => {
          if (payload.payload.userId === user.id) {
            handleMessageUpdate(payload.payload)
          }
        }
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
      processingSubscription.unsubscribe()
    }
  }, [user?.id, fetchMessages, handleNewMessage, handleMessageDelete, handleMessageUpdate, supabase])

  return {
    messages,
    loading,
    processingCount,
    lastUpdate,
    triggerProcessing,
    markAsRead,
    archiveMessage,
    refetch: fetchMessages
  }
}