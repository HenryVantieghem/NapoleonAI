import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'
import { createClient } from '@supabase/supabase-js'

// Types for calendar events
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  attendees: Array<{
    email: string
    name: string
    status: 'accepted' | 'declined' | 'tentative' | 'pending'
  }>
  meetingUrl?: string
  platform: 'outlook' | 'google' | 'teams'
  status: 'confirmed' | 'tentative' | 'cancelled'
  relatedMessages?: string[]
  metadata?: any
}

export interface CalendarIntegration {
  syncEvents(userId: string, accessToken: string): Promise<CalendarEvent[]>
  createEvent(userId: string, accessToken: string, event: Partial<CalendarEvent>): Promise<CalendarEvent>
  updateEvent(userId: string, accessToken: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>
  deleteEvent(userId: string, accessToken: string, eventId: string): Promise<boolean>
}

// Microsoft Auth Provider for Graph API
class MicrosoftAuthProvider implements AuthenticationProvider {
  private accessToken: string = ''

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No Microsoft access token available')
    }
    return this.accessToken
  }
}

// Microsoft Calendar Integration
export class MicrosoftCalendarAPI implements CalendarIntegration {
  private client: Client
  private authProvider: MicrosoftAuthProvider
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  constructor() {
    this.authProvider = new MicrosoftAuthProvider()
    this.client = Client.initWithMiddleware({ authProvider: this.authProvider })
  }

  async syncEvents(userId: string, accessToken: string): Promise<CalendarEvent[]> {
    try {
      this.authProvider.setAccessToken(accessToken)
      
      // Get calendar events from the past 30 days and next 90 days
      const startTime = new Date()
      startTime.setDate(startTime.getDate() - 30)
      const endTime = new Date()
      endTime.setDate(endTime.getDate() + 90)

      const response = await this.client
        .api('/me/calendarview')
        .query({
          startDateTime: startTime.toISOString(),
          endDateTime: endTime.toISOString(),
          $top: 250,
          $orderby: 'start/dateTime asc'
        })
        .get()

      const events: CalendarEvent[] = []
      for (const outlookEvent of response.value || []) {
        const event = this.convertOutlookEvent(outlookEvent)
        events.push(event)
        
        // Store in database
        await this.storeEvent(userId, event)
      }

      return events
    } catch (error) {
      console.error('Failed to sync Microsoft calendar events:', error)
      throw new Error(`Microsoft Calendar sync failed: ${(error as Error).message}`)
    }
  }

  async createEvent(userId: string, accessToken: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      this.authProvider.setAccessToken(accessToken)

      const outlookEvent = {
        subject: eventData.title || 'Napoleon AI Meeting',
        start: {
          dateTime: eventData.startTime?.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventData.endTime?.toISOString(),
          timeZone: 'UTC'
        },
        body: {
          contentType: 'text',
          content: eventData.description || ''
        },
        location: {
          displayName: eventData.location || ''
        },
        attendees: eventData.attendees?.map(attendee => ({
          emailAddress: {
            address: attendee.email,
            name: attendee.name
          },
          type: 'required'
        })) || [],
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
      }

      const response = await this.client
        .api('/me/events')
        .post(outlookEvent)

      const event = this.convertOutlookEvent(response)
      await this.storeEvent(userId, event)

      return event
    } catch (error) {
      throw new Error(`Failed to create Microsoft calendar event: ${(error as Error).message}`)
    }
  }

  async updateEvent(userId: string, accessToken: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      this.authProvider.setAccessToken(accessToken)

      const updateData: any = {}
      if (updates.title) updateData.subject = updates.title
      if (updates.description) updateData.body = { contentType: 'text', content: updates.description }
      if (updates.startTime) updateData.start = { dateTime: updates.startTime.toISOString(), timeZone: 'UTC' }
      if (updates.endTime) updateData.end = { dateTime: updates.endTime.toISOString(), timeZone: 'UTC' }
      if (updates.location) updateData.location = { displayName: updates.location }

      const response = await this.client
        .api(`/me/events/${eventId}`)
        .patch(updateData)

      const event = this.convertOutlookEvent(response)
      await this.storeEvent(userId, event)

      return event
    } catch (error) {
      throw new Error(`Failed to update Microsoft calendar event: ${(error as Error).message}`)
    }
  }

  async deleteEvent(userId: string, accessToken: string, eventId: string): Promise<boolean> {
    try {
      this.authProvider.setAccessToken(accessToken)

      await this.client
        .api(`/me/events/${eventId}`)
        .delete()

      // Remove from database
      await this.supabase
        .from('calendar_events')
        .delete()
        .match({ user_id: userId, external_id: eventId })

      return true
    } catch (error) {
      console.error('Failed to delete Microsoft calendar event:', error)
      return false
    }
  }

  private convertOutlookEvent(outlookEvent: any): CalendarEvent {
    return {
      id: `outlook-${outlookEvent.id}`,
      title: outlookEvent.subject || 'Untitled Event',
      description: outlookEvent.body?.content || '',
      startTime: new Date(outlookEvent.start.dateTime),
      endTime: new Date(outlookEvent.end.dateTime),
      location: outlookEvent.location?.displayName || '',
      attendees: (outlookEvent.attendees || []).map((attendee: any) => ({
        email: attendee.emailAddress?.address || '',
        name: attendee.emailAddress?.name || '',
        status: this.convertAttendeeStatus(attendee.status?.response)
      })),
      meetingUrl: outlookEvent.onlineMeeting?.joinUrl || '',
      platform: 'outlook' as const,
      status: this.convertEventStatus(outlookEvent.showAs),
      metadata: {
        outlookId: outlookEvent.id,
        isAllDay: outlookEvent.isAllDay,
        sensitivity: outlookEvent.sensitivity,
        importance: outlookEvent.importance,
        onlineMeeting: outlookEvent.onlineMeeting
      }
    }
  }

  private convertAttendeeStatus(status: string): 'accepted' | 'declined' | 'tentative' | 'pending' {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'accepted'
      case 'declined': return 'declined'
      case 'tentativelyaccepted': return 'tentative'
      default: return 'pending'
    }
  }

  private convertEventStatus(showAs: string): 'confirmed' | 'tentative' | 'cancelled' {
    switch (showAs?.toLowerCase()) {
      case 'tentative': return 'tentative'
      case 'cancelled': return 'cancelled'
      default: return 'confirmed'
    }
  }

  private async storeEvent(userId: string, event: CalendarEvent): Promise<void> {
    try {
      await this.supabase
        .from('calendar_events')
        .upsert({
          user_id: userId,
          external_id: event.metadata?.outlookId || event.id,
          title: event.title,
          description: event.description,
          start_time: event.startTime.toISOString(),
          end_time: event.endTime.toISOString(),
          location: event.location,
          attendees: event.attendees,
          meeting_url: event.meetingUrl,
          platform: event.platform,
          status: event.status,
          related_messages: event.relatedMessages || [],
          metadata: event.metadata,
          synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,external_id'
        })
    } catch (error) {
      console.error('Failed to store calendar event:', error)
    }
  }
}

// Google Calendar Integration
export class GoogleCalendarAPI implements CalendarIntegration {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async syncEvents(userId: string, accessToken: string): Promise<CalendarEvent[]> {
    try {
      // Get calendar events from the past 30 days and next 90 days
      const timeMin = new Date()
      timeMin.setDate(timeMin.getDate() - 30)
      const timeMax = new Date()
      timeMax.setDate(timeMax.getDate() + 90)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250'
        }),
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      const data = await response.json()
      const events: CalendarEvent[] = []

      for (const googleEvent of data.items || []) {
        if (googleEvent.status === 'cancelled') continue
        
        const event = this.convertGoogleEvent(googleEvent)
        events.push(event)
        
        // Store in database
        await this.storeEvent(userId, event)
      }

      return events
    } catch (error) {
      console.error('Failed to sync Google calendar events:', error)
      throw new Error(`Google Calendar sync failed: ${(error as Error).message}`)
    }
  }

  async createEvent(userId: string, accessToken: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const googleEvent = {
        summary: eventData.title || 'Napoleon AI Meeting',
        description: eventData.description || '',
        start: {
          dateTime: eventData.startTime?.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventData.endTime?.toISOString(),
          timeZone: 'UTC'
        },
        location: eventData.location || '',
        attendees: eventData.attendees?.map(attendee => ({
          email: attendee.email,
          displayName: attendee.name
        })) || [],
        conferenceData: {
          createRequest: {
            requestId: `napoleon-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(googleEvent)
        }
      )

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      const data = await response.json()
      const event = this.convertGoogleEvent(data)
      await this.storeEvent(userId, event)

      return event
    } catch (error) {
      throw new Error(`Failed to create Google calendar event: ${(error as Error).message}`)
    }
  }

  async updateEvent(userId: string, accessToken: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const updateData: any = {}
      if (updates.title) updateData.summary = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.startTime) updateData.start = { dateTime: updates.startTime.toISOString(), timeZone: 'UTC' }
      if (updates.endTime) updateData.end = { dateTime: updates.endTime.toISOString(), timeZone: 'UTC' }
      if (updates.location) updateData.location = updates.location

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      )

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      const data = await response.json()
      const event = this.convertGoogleEvent(data)
      await this.storeEvent(userId, event)

      return event
    } catch (error) {
      throw new Error(`Failed to update Google calendar event: ${(error as Error).message}`)
    }
  }

  async deleteEvent(userId: string, accessToken: string, eventId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok && response.status !== 410) { // 410 = Already deleted
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      // Remove from database
      await this.supabase
        .from('calendar_events')
        .delete()
        .match({ user_id: userId, external_id: eventId })

      return true
    } catch (error) {
      console.error('Failed to delete Google calendar event:', error)
      return false
    }
  }

  private convertGoogleEvent(googleEvent: any): CalendarEvent {
    return {
      id: `google-${googleEvent.id}`,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description || '',
      startTime: new Date(googleEvent.start?.dateTime || googleEvent.start?.date),
      endTime: new Date(googleEvent.end?.dateTime || googleEvent.end?.date),
      location: googleEvent.location || '',
      attendees: (googleEvent.attendees || []).map((attendee: any) => ({
        email: attendee.email || '',
        name: attendee.displayName || attendee.email || '',
        status: this.convertGoogleAttendeeStatus(attendee.responseStatus)
      })),
      meetingUrl: googleEvent.conferenceData?.entryPoints?.[0]?.uri || googleEvent.hangoutLink || '',
      platform: 'google' as const,
      status: googleEvent.status === 'tentative' ? 'tentative' : 'confirmed',
      metadata: {
        googleId: googleEvent.id,
        etag: googleEvent.etag,
        kind: googleEvent.kind,
        creator: googleEvent.creator,
        organizer: googleEvent.organizer,
        conferenceData: googleEvent.conferenceData
      }
    }
  }

  private convertGoogleAttendeeStatus(status: string): 'accepted' | 'declined' | 'tentative' | 'pending' {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'accepted'
      case 'declined': return 'declined'
      case 'tentative': return 'tentative'
      default: return 'pending'
    }
  }

  private async storeEvent(userId: string, event: CalendarEvent): Promise<void> {
    try {
      await this.supabase
        .from('calendar_events')
        .upsert({
          user_id: userId,
          external_id: event.metadata?.googleId || event.metadata?.outlookId || event.id,
          title: event.title,
          description: event.description,
          start_time: event.startTime.toISOString(),
          end_time: event.endTime.toISOString(),
          location: event.location,
          attendees: event.attendees,
          meeting_url: event.meetingUrl,
          platform: event.platform,
          status: event.status,
          related_messages: event.relatedMessages || [],
          metadata: event.metadata,
          synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,external_id'
        })
    } catch (error) {
      console.error('Failed to store calendar event:', error)
    }
  }
}

// Unified Calendar Service
export class CalendarService {
  private microsoftAPI = new MicrosoftCalendarAPI()
  private googleAPI = new GoogleCalendarAPI()
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /**
   * Sync all connected calendars for a user
   */
  async syncAllCalendars(userId: string): Promise<{
    microsoft: CalendarEvent[]
    google: CalendarEvent[]
    total: number
    errors: string[]
  }> {
    const results = {
      microsoft: [] as CalendarEvent[],
      google: [] as CalendarEvent[],
      total: 0,
      errors: [] as string[]
    }

    try {
      // Get connected accounts
      const { data: accounts } = await this.supabase
        .from('connected_accounts')
        .select('*')
        .match({ user_id: userId, status: 'active' })
        .in('provider', ['microsoft', 'google'])

      for (const account of accounts || []) {
        try {
          if (account.provider === 'microsoft' && account.access_token) {
            results.microsoft = await this.microsoftAPI.syncEvents(userId, account.access_token)
          } else if (account.provider === 'google' && account.access_token) {
            results.google = await this.googleAPI.syncEvents(userId, account.access_token)
          }
        } catch (error) {
          results.errors.push(`${account.provider}: ${(error as Error).message}`)
        }
      }

      results.total = results.microsoft.length + results.google.length
      return results
    } catch (error) {
      results.errors.push(`General sync error: ${(error as Error).message}`)
      return results
    }
  }

  /**
   * Get upcoming meetings for context in message analysis
   */
  async getUpcomingMeetings(userId: string, hours: number = 24): Promise<CalendarEvent[]> {
    try {
      const now = new Date()
      const endTime = new Date(now.getTime() + (hours * 60 * 60 * 1000))

      const { data } = await this.supabase
        .from('calendar_events')
        .select('*')
        .match({ user_id: userId })
        .gte('start_time', now.toISOString())
        .lte('start_time', endTime.toISOString())
        .order('start_time', { ascending: true })
        .limit(20)

      return (data || []).map(this.convertDBEvent)
    } catch (error) {
      console.error('Failed to get upcoming meetings:', error)
      return []
    }
  }

  /**
   * Find meeting context for message analysis
   */
  async findMeetingContext(userId: string, messageContent: string, senderEmail?: string): Promise<{
    upcomingMeetings: CalendarEvent[]
    recentMeetings: CalendarEvent[]
    meetingsWithSender: CalendarEvent[]
  }> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
    const threeDaysOut = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))

    try {
      // Get all relevant meetings
      const { data: meetings } = await this.supabase
        .from('calendar_events')
        .select('*')
        .match({ user_id: userId })
        .gte('start_time', oneDayAgo.toISOString())
        .lte('start_time', threeDaysOut.toISOString())
        .order('start_time', { ascending: true })

      const allMeetings = (meetings || []).map(this.convertDBEvent)

      // Categorize meetings
      const upcomingMeetings = allMeetings.filter(m => m.startTime > now)
      const recentMeetings = allMeetings.filter(m => m.startTime <= now)
      
      let meetingsWithSender: CalendarEvent[] = []
      if (senderEmail) {
        meetingsWithSender = allMeetings.filter(meeting => 
          meeting.attendees.some(attendee => 
            attendee.email.toLowerCase() === senderEmail.toLowerCase()
          )
        )
      }

      return {
        upcomingMeetings: upcomingMeetings.slice(0, 10),
        recentMeetings: recentMeetings.slice(0, 5),
        meetingsWithSender: meetingsWithSender.slice(0, 5)
      }
    } catch (error) {
      console.error('Failed to find meeting context:', error)
      return {
        upcomingMeetings: [],
        recentMeetings: [],
        meetingsWithSender: []
      }
    }
  }

  /**
   * Create a meeting from message context
   */
  async createMeetingFromMessage(
    userId: string, 
    messageId: string, 
    meetingDetails: {
      title: string
      description?: string
      startTime: Date
      endTime: Date
      attendees: string[]
      provider: 'microsoft' | 'google'
    }
  ): Promise<CalendarEvent | null> {
    try {
      // Get the connected account
      const { data: account } = await this.supabase
        .from('connected_accounts')
        .select('*')
        .match({ 
          user_id: userId, 
          provider: meetingDetails.provider,
          status: 'active'
        })
        .single()

      if (!account || !account.access_token) {
        throw new Error(`No active ${meetingDetails.provider} account found`)
      }

      const eventData: Partial<CalendarEvent> = {
        title: meetingDetails.title,
        description: meetingDetails.description,
        startTime: meetingDetails.startTime,
        endTime: meetingDetails.endTime,
        attendees: meetingDetails.attendees.map(email => ({
          email,
          name: email,
          status: 'pending' as const
        })),
        relatedMessages: [messageId]
      }

      let event: CalendarEvent
      if (meetingDetails.provider === 'microsoft') {
        event = await this.microsoftAPI.createEvent(userId, account.access_token, eventData)
      } else {
        event = await this.googleAPI.createEvent(userId, account.access_token, eventData)
      }

      // Update the related message with meeting info
      await this.supabase
        .from('messages')
        .update({
          metadata: {
            createdMeeting: {
              eventId: event.id,
              title: event.title,
              startTime: event.startTime.toISOString()
            }
          }
        })
        .match({ id: messageId })

      return event
    } catch (error) {
      console.error('Failed to create meeting from message:', error)
      return null
    }
  }

  private convertDBEvent(dbEvent: any): CalendarEvent {
    return {
      id: dbEvent.external_id,
      title: dbEvent.title,
      description: dbEvent.description,
      startTime: new Date(dbEvent.start_time),
      endTime: new Date(dbEvent.end_time),
      location: dbEvent.location,
      attendees: dbEvent.attendees || [],
      meetingUrl: dbEvent.meeting_url,
      platform: dbEvent.platform,
      status: dbEvent.status,
      relatedMessages: dbEvent.related_messages || [],
      metadata: dbEvent.metadata
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService()