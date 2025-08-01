import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/luxury-toast'

export interface Notification {
  id: string
  userId: string
  type: 'message' | 'action_item' | 'digest' | 'system' | 'vip'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
  expiresAt?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  digest: boolean
  vipOnly: boolean
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string   // "08:00"
  }
}

export function useNotifications() {
  const { user } = useUser()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    digest: true,
    vipOnly: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  })
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [])

  // Check if currently in quiet hours
  const isQuietHours = useCallback(() => {
    if (!preferences.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight quiet hours
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    }
    
    return currentTime >= startTime && currentTime <= endTime
  }, [preferences.quietHours])

  // Show in-app notification
  const showNotification = useCallback((notification: Partial<Notification>) => {
    if (!preferences.inApp) return
    if (isQuietHours()) return
    if (preferences.vipOnly && notification.type !== 'vip') return

    // Use luxury toast
    const toastType = notification.priority === 'urgent' ? 'error' : 
                     notification.priority === 'high' ? 'warning' : 'info'
    
    toast[toastType](notification.title || 'Notification', {
      description: notification.message,
      action: notification.link ? {
        label: 'View',
        onClick: () => window.location.href = notification.link!,
      } : undefined,
    })
  }, [preferences, isQuietHours])

  // Show browser notification
  const showBrowserNotification = useCallback(async (notification: Partial<Notification>) => {
    if (!preferences.push) return
    if (permission !== 'granted') return
    if (isQuietHours()) return
    if (preferences.vipOnly && notification.type !== 'vip') return

    const browserNotif = new Notification(notification.title || 'Napoleon AI', {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: notification.priority === 'low',
      data: {
        link: notification.link,
      },
    })

    browserNotif.onclick = () => {
      window.focus()
      if (notification.link) {
        window.location.href = notification.link
      }
      browserNotif.close()
    }
  }, [preferences, permission, isQuietHours])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [user, supabase])

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [user, supabase])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }, [user, supabase])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [user, supabase, notifications])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return

    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: updated,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }, [user, supabase, preferences])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show notifications
          showNotification(newNotification)
          showBrowserNotification(newNotification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, fetchNotifications, showNotification, showBrowserNotification])

  // Load preferences
  useEffect(() => {
    if (!user) return

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        if (data?.preferences) {
          setPreferences(data.preferences)
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }

    loadPreferences()
  }, [user, supabase])

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  return {
    notifications,
    unreadCount,
    preferences,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    showNotification,
    isQuietHours,
    refetch: fetchNotifications,
  }
}