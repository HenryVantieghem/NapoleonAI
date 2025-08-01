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

    // Session management is handled by Clerk
    // Optional: Add user_sessions table in future for detailed tracking

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

    // Session refresh is handled by Clerk automatically

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

    // Session cleanup is handled by Clerk

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session end error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}