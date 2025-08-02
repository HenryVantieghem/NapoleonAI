import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { gmailAPI } from '@/lib/integrations/gmail-api'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get('max') || '10', 10)

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user's Gmail tokens from database
    const { data: connectedAccount } = await supabase
      .from('connected_accounts')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .single()

    if (!connectedAccount?.access_token) {
      return NextResponse.json({ 
        error: 'Gmail not connected',
        needsAuth: true 
      }, { status: 400 })
    }

    // Set tokens and fetch messages
    gmailAPI.setAccessToken(
      connectedAccount.access_token,
      connectedAccount.refresh_token || undefined
    )

    const result = await gmailAPI.getMessages(userId, {
      maxResults,
      labelIds: ['INBOX']
    })

    // Transform messages for simple display
    const messages = result.messages.map(msg => ({
      id: msg.id,
      from: msg.sender,
      subject: msg.subject,
      snippet: msg.content?.substring(0, 150) + '...' || 'No content',
      timestamp: msg.timestamp.toISOString(),
      isRead: true // Simplified for MVP
    }))

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Gmail API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Gmail messages' },
      { status: 500 }
    )
  }
}