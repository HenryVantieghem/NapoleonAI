import { useState, useEffect, useCallback } from 'react'
import { CalendarEvent } from '@/lib/integrations/calendar-api'

interface CalendarContextData {
  upcomingMeetings: CalendarEvent[]
  recentMeetings: CalendarEvent[]
  meetingsWithSender: CalendarEvent[]
}

interface UseCalendarReturn {
  // State
  upcomingMeetings: CalendarEvent[]
  isLoading: boolean
  error: string | null
  lastSync: Date | null

  // Functions
  syncCalendars: () => Promise<void>
  getUpcomingMeetings: (hours?: number) => Promise<CalendarEvent[]>
  getMeetingContext: (messageContent: string, senderEmail?: string) => Promise<CalendarContextData>
  createMeetingFromMessage: (meetingDetails: CreateMeetingParams) => Promise<CalendarEvent | null>
  refreshData: () => Promise<void>
}

interface CreateMeetingParams {
  messageId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  attendees: string[]
  provider: 'microsoft' | 'google'
}

interface SyncResult {
  microsoft: CalendarEvent[]
  google: CalendarEvent[]
  total: number
  errors: string[]
}

export function useCalendar(userId?: string): UseCalendarReturn {
  const [upcomingMeetings, setUpcomingMeetings] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Sync all connected calendars
  const syncCalendars = useCallback(async () => {
    if (!userId) {
      setError('User ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'sync-calendars'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync calendars')
      }

      const result: SyncResult = await response.json()
      
      if (result.errors.length > 0) {
        console.warn('Calendar sync warnings:', result.errors)
      }

      setLastSync(new Date())
      
      // Refresh upcoming meetings after sync
      await getUpcomingMeetings(24)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync calendars'
      setError(errorMessage)
      console.error('Calendar sync error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Get upcoming meetings
  const getUpcomingMeetings = useCallback(async (hours: number = 24): Promise<CalendarEvent[]> => {
    if (!userId) {
      setError('User ID is required')
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/calendar?userId=${userId}&action=upcoming&hours=${hours}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get upcoming meetings')
      }

      const data = await response.json()
      setUpcomingMeetings(data.meetings)
      return data.meetings
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get upcoming meetings'
      setError(errorMessage)
      console.error('Get upcoming meetings error:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Get meeting context for message analysis
  const getMeetingContext = useCallback(async (
    messageContent: string, 
    senderEmail?: string
  ): Promise<CalendarContextData> => {
    if (!userId) {
      setError('User ID is required')
      return { upcomingMeetings: [], recentMeetings: [], meetingsWithSender: [] }
    }

    try {
      const params = new URLSearchParams({
        userId,
        action: 'context',
        message: messageContent
      })

      if (senderEmail) {
        params.append('sender', senderEmail)
      }

      const response = await fetch(`/api/calendar?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get meeting context')
      }

      const data = await response.json()
      return data.context
    } catch (err) {
      console.error('Get meeting context error:', err)
      return { upcomingMeetings: [], recentMeetings: [], meetingsWithSender: [] }
    }
  }, [userId])

  // Create meeting from message
  const createMeetingFromMessage = useCallback(async (
    meetingDetails: CreateMeetingParams
  ): Promise<CalendarEvent | null> => {
    if (!userId) {
      setError('User ID is required')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'create-meeting',
          ...meetingDetails
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create meeting')
      }

      const data = await response.json()
      
      // Refresh upcoming meetings
      await getUpcomingMeetings(24)
      
      return data.meeting
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create meeting'
      setError(errorMessage)
      console.error('Create meeting error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [userId, getUpcomingMeetings])

  // Refresh all calendar data
  const refreshData = useCallback(async () => {
    if (!userId) return

    await Promise.all([
      syncCalendars(),
      getUpcomingMeetings(24)
    ])
  }, [userId, syncCalendars, getUpcomingMeetings])

  // Auto-sync on mount and periodically
  useEffect(() => {
    if (userId) {
      getUpcomingMeetings(24)
      
      // Auto-sync every 30 minutes
      const syncInterval = setInterval(() => {
        syncCalendars()
      }, 30 * 60 * 1000)

      return () => clearInterval(syncInterval)
    }
  }, [userId, getUpcomingMeetings, syncCalendars])

  return {
    // State
    upcomingMeetings,
    isLoading,
    error,
    lastSync,

    // Functions
    syncCalendars,
    getUpcomingMeetings,
    getMeetingContext,
    createMeetingFromMessage,
    refreshData
  }
}

// Hook for meeting context in message analysis
export function useMeetingContext(userId: string, messageContent: string, senderEmail?: string) {
  const [context, setContext] = useState<CalendarContextData>({
    upcomingMeetings: [],
    recentMeetings: [],
    meetingsWithSender: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getMeetingContext } = useCalendar(userId)

  useEffect(() => {
    const loadContext = async () => {
      if (!messageContent.trim()) return

      setIsLoading(true)
      setError(null)

      try {
        const contextData = await getMeetingContext(messageContent, senderEmail)
        setContext(contextData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meeting context')
      } finally {
        setIsLoading(false)
      }
    }

    loadContext()
  }, [messageContent, senderEmail, getMeetingContext])

  return {
    context,
    isLoading,
    error
  }
}

// Hook for upcoming meetings widget
export function useUpcomingMeetings(userId: string, hours: number = 24) {
  const { upcomingMeetings, isLoading, error, getUpcomingMeetings } = useCalendar(userId)
  
  const refreshMeetings = useCallback(() => {
    return getUpcomingMeetings(hours)
  }, [getUpcomingMeetings, hours])

  return {
    meetings: upcomingMeetings,
    isLoading,
    error,
    refresh: refreshMeetings
  }
}