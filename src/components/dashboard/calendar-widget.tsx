'use client'

import { useState } from 'react'
import { CalendarDays, Clock, Users, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useUpcomingMeetings } from '@/lib/hooks/use-calendar'
import { CalendarEvent } from '@/lib/integrations/calendar-api'
import { Button } from '@/components/ui/button'

interface CalendarWidgetProps {
  userId: string
  className?: string
}

export default function CalendarWidget({ userId, className }: CalendarWidgetProps) {
  const [hours, setHours] = useState(24)
  const { meetings, isLoading, error, refresh } = useUpcomingMeetings(userId, hours)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getTimeUntilMeeting = (startTime: Date): string => {
    const now = new Date()
    const diff = startTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff < 0) {
      return 'In progress'
    } else if (hours < 1) {
      return `In ${minutes}m`
    } else if (hours < 24) {
      return `In ${hours}h ${minutes}m`
    } else {
      const days = Math.floor(hours / 24)
      return `In ${days}d`
    }
  }

  const getMeetingStatusColor = (meeting: CalendarEvent): string => {
    const now = new Date()
    const diff = meeting.startTime.getTime() - now.getTime()
    const hoursUntil = diff / (1000 * 60 * 60)

    if (diff < 0 && diff > -2 * 60 * 60 * 1000) { // Currently happening (within 2 hours)
      return 'bg-red-50 border-red-200 text-red-900'
    } else if (hoursUntil <= 1) { // Within 1 hour
      return 'bg-amber-50 border-amber-200 text-amber-900'
    } else if (hoursUntil <= 24) { // Today
      return 'bg-blue-50 border-blue-200 text-blue-900'
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-burgundy" />
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={8}>Next 8 hours</option>
            <option value={24}>Next 24 hours</option>
            <option value={72}>Next 3 days</option>
            <option value={168}>Next week</option>
          </select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {isLoading && meetings.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading meetings...</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming meetings</p>
          <p className="text-sm text-gray-400 mt-1">
            Perfect time to focus on strategic priorities
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.slice(0, 5).map((meeting) => (
            <div
              key={meeting.id}
              className={`rounded-lg border p-4 transition-colors hover:shadow-sm ${getMeetingStatusColor(meeting)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {meeting.title}
                    </h4>
                    {meeting.platform === 'teams' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Teams
                      </span>
                    )}
                    {meeting.platform === 'google' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Meet
                      </span>
                    )}
                    {meeting.platform === 'outlook' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Outlook
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{meeting.attendees.length} attendees</span>
                    </div>
                  </div>

                  {meeting.location && (
                    <p className="text-xs text-gray-500 mb-2">
                      📍 {meeting.location}
                    </p>
                  )}

                  {meeting.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className="text-xs font-medium whitespace-nowrap">
                    {getTimeUntilMeeting(meeting.startTime)}
                  </span>
                  
                  {meeting.meetingUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(meeting.meetingUrl, '_blank')}
                      className="h-6 px-2 text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {meeting.attendees.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200/50">
                  <div className="flex -space-x-1">
                    {meeting.attendees.slice(0, 5).map((attendee, index) => (
                      <div
                        key={index}
                        className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                        title={attendee.name}
                      >
                        <span className="text-xs font-medium text-gray-600">
                          {attendee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {meeting.attendees.length > 5 && (
                      <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{meeting.attendees.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {meetings.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                +{meetings.length - 5} more meetings
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}