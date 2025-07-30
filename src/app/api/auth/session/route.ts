import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/auth/session - Get session information
export async function GET() {
  try {
    const { userId, sessionId } = await auth()
    
    if (!userId || !sessionId) {
      return NextResponse.json({ 
        authenticated: false,
        session: null 
      })
    }

    // Get session activity from Supabase (if you want to track it)
    const supabase = createServiceClient()
    
    // Optional: Log session activity
    const { error: logError } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        last_activity: new Date().toISOString(),
        ip_address: '0.0.0.0', // Would get from request headers in production
        user_agent: 'Unknown' // Would get from request headers in production
      }, {
        onConflict: 'user_id,session_id'
      })

    // Don't fail if session logging fails
    if (logError) {
      console.warn('Session logging failed:', logError)
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        userId,
        sessionId,
        lastActivity: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/auth/session/refresh - Refresh session activity
export async function POST() {
  try {
    const { userId, sessionId } = await auth()
    
    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Update last activity timestamp
    const supabase = createServiceClient()
    
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        last_activity: new Date().toISOString()
      }, {
        onConflict: 'user_id,session_id'
      })

    if (error) {
      console.error('Session refresh error:', error)
      return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      lastActivity: new Date().toISOString()
    })
  } catch (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/auth/session - End session (logout)
export async function DELETE() {
  try {
    const { userId, sessionId } = await auth()
    
    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Mark session as ended in database
    const supabase = createServiceClient()
    
    const { error } = await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
        status: 'ended'
      })
      .eq('user_id', userId)
      .eq('session_id', sessionId)

    if (error) {
      console.warn('Session cleanup error:', error)
      // Don't fail logout for database errors
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session end error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}