import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { calendarService } from '@/lib/integrations/calendar-api'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'upcoming'
    const hours = parseInt(searchParams.get('hours') || '24')

    switch (action) {
      case 'upcoming':
        const upcomingMeetings = await calendarService.getUpcomingMeetings(userId, hours)
        return NextResponse.json({ 
          success: true, 
          meetings: upcomingMeetings,
          count: upcomingMeetings.length
        })

      case 'sync':
        const syncResult = await calendarService.syncAllCalendars(userId)
        return NextResponse.json({
          success: true,
          ...syncResult
        })

      case 'context':
        const messageContent = searchParams.get('message') || ''
        const senderEmail = searchParams.get('sender') || undefined
        
        const context = await calendarService.findMeetingContext(
          userId, 
          messageContent, 
          senderEmail
        )
        
        return NextResponse.json({
          success: true,
          context
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create-meeting':
        const {
          messageId,
          title,
          description,
          startTime,
          endTime,
          attendees,
          provider
        } = data

        if (!title || !startTime || !endTime || !provider || !Array.isArray(attendees)) {
          return NextResponse.json(
            { error: 'Missing required meeting details' },
            { status: 400 }
          )
        }

        const meeting = await calendarService.createMeetingFromMessage(
          userId,
          messageId,
          {
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            attendees,
            provider
          }
        )

        if (!meeting) {
          return NextResponse.json(
            { error: 'Failed to create meeting' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          meeting
        })

      case 'sync-calendars':
        const syncResult = await calendarService.syncAllCalendars(userId)
        return NextResponse.json({
          success: true,
          ...syncResult
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Calendar POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}