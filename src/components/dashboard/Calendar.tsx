'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock, Users, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  attendees?: number
  location?: string
  type: 'meeting' | 'call' | 'event' | 'deadline'
  priority: 'high' | 'medium' | 'low'
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Board Meeting Q4 Review',
    date: new Date(2024, 11, 15),
    time: '9:00 AM',
    attendees: 8,
    location: 'Executive Boardroom',
    type: 'meeting',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Investor Call',
    date: new Date(2024, 11, 18),
    time: '2:00 PM',
    attendees: 5,
    type: 'call',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Strategic Planning Session',
    date: new Date(2024, 11, 22),
    time: '10:00 AM',
    attendees: 12,
    location: 'Conference Room A',
    type: 'meeting',
    priority: 'medium'
  }
]

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date)
    return events.filter(event => 
      event.date.toDateString() === targetDate.toDateString()
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '👥'
      case 'call': return '📞'
      case 'event': return '📅'
      case 'deadline': return '⏰'
      default: return '📅'
    }
  }

  const renderCalendarDays = () => {
    const days = []
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7

    // Empty cells before the first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 border border-gray-100 bg-gray-50" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day)
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
      const isSelected = selectedDate?.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

      days.push(
        <div
          key={day}
          className={cn(
            "p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors min-h-[80px]",
            isToday && "bg-blue-50 border-blue-200",
            isSelected && "bg-navy-50 border-navy-200"
          )}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            isToday && "text-blue-600",
            isSelected && "text-navy-600"
          )}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={cn(
                  "text-xs px-1 py-0.5 rounded truncate border",
                  getPriorityColor(event.priority)
                )}
                title={event.title}
              >
                <span className="mr-1">{getTypeIcon(event.type)}</span>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    // Empty cells after the last day
    const remainingCells = totalCells - (daysInMonth + firstDayOfMonth)
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <div key={`empty-end-${i}`} className="p-2 border border-gray-100 bg-gray-50" />
      )
    }

    return days
  }

  const selectedDateEvents = selectedDate ? events.filter(event => 
    event.date.toDateString() === selectedDate.toDateString()
  ) : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-serif text-navy">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-xs px-2"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="p-2 bg-gray-100 text-center text-sm font-medium text-gray-700 border-b border-gray-200"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events for this date</p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getTypeIcon(event.type)}</span>
                          <h3 className="font-medium text-navy">{event.title}</h3>
                          <Badge className={getPriorityColor(event.priority)}>
                            {event.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          
                          {event.attendees && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees} attendees</span>
                            </div>
                          )}
                          
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}