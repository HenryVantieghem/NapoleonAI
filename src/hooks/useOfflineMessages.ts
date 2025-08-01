'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import localforage from 'localforage'

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
  userId: string
  source: string
  lastModified: string
}

interface CacheMetadata {
  lastSync: string
  messageCount: number
  storageUsed: number
  version: string
}

interface OfflineState {
  isOnline: boolean
  issyncing: boolean
  lastSync: Date | null
  cachedCount: number
  pendingActions: Array<{
    id: string
    type: 'archive' | 'snooze' | 'markRead' | 'delete'
    messageId: string
    timestamp: string
    synced: boolean
  }>
}

// Configure localforage for better performance
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: 'napoleonai',
  version: 1.0,
  storeName: 'messages'
})

// Separate store for metadata
const metadataStore = localforage.createInstance({
  name: 'napoleonai',
  storeName: 'metadata'
})

// Separate store for pending actions
const actionsStore = localforage.createInstance({
  name: 'napoleonai', 
  storeName: 'actions'
})

const CACHE_SIZE_LIMIT = 100 // Maximum messages to cache
const CACHE_VERSION = '1.0.0'
const SYNC_RETRY_ATTEMPTS = 3
const SYNC_RETRY_DELAY = 2000

export function useOfflineMessages(userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    issyncing: false,
    lastSync: null,
    cachedCount: 0,
    pendingActions: []
  })

  const syncRetryCount = useRef(0)
  const syncTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize offline state and load cached data
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: true }))
      // Automatically sync when coming back online
      syncWithServer()
    }

    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load initial data
    loadCachedMessages()
    loadPendingActions()
    loadMetadata()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [userId])

  // Load cached messages from IndexedDB
  const loadCachedMessages = useCallback(async () => {
    try {
      setLoading(true)
      const cachedMessages = await localforage.getItem<Message[]>(`messages_${userId}`)
      
      if (cachedMessages && Array.isArray(cachedMessages)) {
        // Sort by priority and creation date
        const sortedMessages = cachedMessages.sort((a, b) => {
          if (a.priorityScore !== b.priorityScore) {
            return b.priorityScore - a.priorityScore
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setMessages(sortedMessages)
        setOfflineState(prev => ({ 
          ...prev, 
          cachedCount: sortedMessages.length 
        }))
      }
    } catch (err) {
      console.error('Failed to load cached messages:', err)
      setError('Failed to load cached messages')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Load pending actions from IndexedDB
  const loadPendingActions = useCallback(async () => {
    try {
      const actions = await actionsStore.getItem<OfflineState['pendingActions']>(`actions_${userId}`)
      if (actions && Array.isArray(actions)) {
        setOfflineState(prev => ({ ...prev, pendingActions: actions }))
      }
    } catch (err) {
      console.error('Failed to load pending actions:', err)
    }
  }, [userId])

  // Load metadata
  const loadMetadata = useCallback(async () => {
    try {
      const metadata = await metadataStore.getItem<CacheMetadata>(`metadata_${userId}`)
      if (metadata) {
        setOfflineState(prev => ({ 
          ...prev, 
          lastSync: new Date(metadata.lastSync) 
        }))
      }
    } catch (err) {
      console.error('Failed to load metadata:', err)
    }
  }, [userId])

  // Cache messages to IndexedDB with size limit
  const cacheMessages = useCallback(async (newMessages: Message[]) => {
    try {
      // Limit cache size and prioritize recent/important messages
      const messagesToCache = newMessages
        .sort((a, b) => {
          // Prioritize VIP and high priority messages
          if (a.isVip !== b.isVip) return a.isVip ? -1 : 1
          if (a.priorityScore !== b.priorityScore) return b.priorityScore - a.priorityScore
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        .slice(0, CACHE_SIZE_LIMIT)

      await localforage.setItem(`messages_${userId}`, messagesToCache)
      
      // Update metadata
      const metadata: CacheMetadata = {
        lastSync: new Date().toISOString(),
        messageCount: messagesToCache.length,
        storageUsed: JSON.stringify(messagesToCache).length,
        version: CACHE_VERSION
      }
      
      await metadataStore.setItem(`metadata_${userId}`, metadata)
      
      setOfflineState(prev => ({ 
        ...prev, 
        lastSync: new Date(),
        cachedCount: messagesToCache.length 
      }))
      
    } catch (err) {
      console.error('Failed to cache messages:', err)
      // Handle storage quota exceeded
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        await clearOldCache()
        // Retry with fewer messages
        await cacheMessages(newMessages.slice(0, CACHE_SIZE_LIMIT / 2))
      }
    }
  }, [userId])

  // Clear old cache data
  const clearOldCache = useCallback(async () => {
    try {
      await localforage.removeItem(`messages_${userId}`)
      await metadataStore.removeItem(`metadata_${userId}`)
      setMessages([])
      setOfflineState(prev => ({ ...prev, cachedCount: 0, lastSync: null }))
    } catch (err) {
      console.error('Failed to clear cache:', err)
    }
  }, [userId])

  // Add pending action for offline operations
  const addPendingAction = useCallback(async (
    type: 'archive' | 'snooze' | 'markRead' | 'delete',
    messageId: string
  ) => {
    const action = {
      id: crypto.randomUUID(),
      type,
      messageId,
      timestamp: new Date().toISOString(),
      synced: false
    }

    try {
      const currentActions = await actionsStore.getItem<OfflineState['pendingActions']>(`actions_${userId}`) || []
      const updatedActions = [...currentActions, action]
      
      await actionsStore.setItem(`actions_${userId}`, updatedActions)
      
      setOfflineState(prev => ({
        ...prev,
        pendingActions: updatedActions
      }))
      
      return action.id
    } catch (err) {
      console.error('Failed to add pending action:', err)
      throw err
    }
  }, [userId])

  // Sync with server
  const syncWithServer = useCallback(async (force: boolean = false) => {
    if (offlineState.issyncing && !force) return
    if (!offlineState.isOnline && !force) return

    try {
      setOfflineState(prev => ({ ...prev, issyncing: true }))
      setError(null)

      // Fetch fresh messages from server
      const response = await fetch('/api/messages', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const freshMessages: Message[] = await response.json()
      
      // Update local state and cache
      setMessages(freshMessages)
      await cacheMessages(freshMessages)
      
      // Sync pending actions
      await syncPendingActions()
      
      syncRetryCount.current = 0
      
    } catch (err) {
      console.error('Sync failed:', err)
      
      // Retry logic
      if (syncRetryCount.current < SYNC_RETRY_ATTEMPTS) {
        syncRetryCount.current++
        syncTimeoutRef.current = setTimeout(() => {
          syncWithServer(force)
        }, SYNC_RETRY_DELAY * syncRetryCount.current)
      } else {
        setError('Sync failed. Please try again later.')
        syncRetryCount.current = 0
      }
    } finally {
      setOfflineState(prev => ({ ...prev, issyncing: false }))
    }
  }, [offlineState.issyncing, offlineState.isOnline, cacheMessages, userId])

  // Sync pending actions with server
  const syncPendingActions = useCallback(async () => {
    try {
      const actions = await actionsStore.getItem<OfflineState['pendingActions']>(`actions_${userId}`) || []
      const unsyncedActions = actions.filter(action => !action.synced)
      
      for (const action of unsyncedActions) {
        try {
          // Send action to server
          const response = await fetch(`/api/messages/${action.messageId}/${action.type}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            // Mark as synced
            action.synced = true
          }
        } catch (err) {
          console.warn(`Failed to sync action ${action.id}:`, err)
        }
      }
      
      // Update actions store
      await actionsStore.setItem(`actions_${userId}`, actions)
      
      // Remove synced actions older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentActions = actions.filter(action => 
        !action.synced || new Date(action.timestamp) > oneDayAgo
      )
      
      await actionsStore.setItem(`actions_${userId}`, recentActions)
      
      setOfflineState(prev => ({
        ...prev,
        pendingActions: recentActions
      }))
      
    } catch (err) {
      console.error('Failed to sync actions:', err)
    }
  }, [userId])

  // Offline-capable message operations
  const archiveMessage = useCallback(async (messageId: string) => {
    try {
      // Update local state immediately
      setMessages(prev => prev.filter(m => m.id !== messageId))
      
      if (offlineState.isOnline) {
        // Try to sync immediately
        const response = await fetch(`/api/messages/${messageId}/archive`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Archive failed')
        }
      } else {
        // Add to pending actions
        await addPendingAction('archive', messageId)
      }
    } catch (err) {
      console.error('Archive failed:', err)
      // Add to pending actions as fallback
      await addPendingAction('archive', messageId)
    }
  }, [offlineState.isOnline, addPendingAction])

  const snoozeMessage = useCallback(async (messageId: string) => {
    try {
      // Update local state immediately
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, isRead: true } // Simple snooze implementation
          : m
      ))
      
      if (offlineState.isOnline) {
        const response = await fetch(`/api/messages/${messageId}/snooze`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Snooze failed')
        }
      } else {
        await addPendingAction('snooze', messageId)
      }
    } catch (err) {
      console.error('Snooze failed:', err)
      await addPendingAction('snooze', messageId)
    }
  }, [offlineState.isOnline, addPendingAction])

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ))
      
      if (offlineState.isOnline) {
        const response = await fetch(`/api/messages/${messageId}/read`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Mark as read failed')
        }
      } else {
        await addPendingAction('markRead', messageId)
      }
    } catch (err) {
      console.error('Mark as read failed:', err)
      await addPendingAction('markRead', messageId)
    }
  }, [offlineState.isOnline, addPendingAction])

  // Manual sync trigger
  const manualSync = useCallback(() => {
    return syncWithServer(true)
  }, [syncWithServer])

  // Get cache statistics
  const getCacheStats = useCallback(async () => {
    try {
      const metadata = await metadataStore.getItem<CacheMetadata>(`metadata_${userId}`)
      return {
        messageCount: messages.length,
        lastSync: offlineState.lastSync,
        storageUsed: metadata?.storageUsed || 0,
        pendingActions: offlineState.pendingActions.length
      }
    } catch (err) {
      console.error('Failed to get cache stats:', err)
      return null
    }
  }, [userId, messages.length, offlineState.lastSync, offlineState.pendingActions.length])

  return {
    // Data
    messages,
    loading,
    error,
    
    // Offline state
    isOnline: offlineState.isOnline,
    issyncing: offlineState.issyncing,
    lastSync: offlineState.lastSync,
    cachedCount: offlineState.cachedCount,
    pendingActions: offlineState.pendingActions,
    
    // Actions
    archiveMessage,
    snoozeMessage,
    markAsRead,
    syncWithServer: manualSync,
    clearCache: clearOldCache,
    getCacheStats,
    
    // Utils
    hasPendingActions: offlineState.pendingActions.length > 0
  }
}