import { NextRequest, NextResponse } from 'next/server'
import { gmailAPI } from '@/lib/integrations/gmail-api'
import { unifiedMessageService } from '@/lib/integrations/unified-message-service'
import { supabase } from '@/lib/supabase/client'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook is from Google
    const body = await request.text()
    const signature = headers().get('x-goog-channel-token')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Parse the Pub/Sub message
    let pubsubMessage
    try {
      const data = JSON.parse(body)
      pubsubMessage = data.message
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!pubsubMessage?.data) {
      return NextResponse.json({ error: 'No message data' }, { status: 400 })
    }

    // Decode the base64 data
    const messageData = JSON.parse(
      Buffer.from(pubsubMessage.data, 'base64').toString()
    )

    const { historyId, emailAddress } = messageData

    // Find the user associated with this email address
    const { data: userIntegration } = await supabase
      .from('connected_accounts')
      .select('user_id, access_token, refresh_token, account_email')
      .eq('provider', 'gmail')
      .eq('account_email', emailAddress)
      .single()

    if (!userIntegration) {
      console.warn(`No user found for Gmail address: ${emailAddress}`)
      return NextResponse.json({ message: 'No user found' }, { status: 200 })
    }

    // For MVP, process all webhook notifications (simplified)

    // Set up Gmail API with user's tokens
    if (!userIntegration.access_token) {
      console.error('No access token found for user')
      return NextResponse.json({ message: 'No access token' }, { status: 400 })
    }
    
    gmailAPI.setAccessToken(
      userIntegration.access_token,
      userIntegration.refresh_token || undefined
    )

    // Get recent messages (simplified for MVP)
    const history = await gmailAPI.getHistory(historyId)

    if (history.messages.length > 0) {
      // Set up tokens for unified service
      unifiedMessageService.setTokens(userIntegration.user_id, {
        gmail: {
          accessToken: userIntegration.access_token,
          refreshToken: userIntegration.refresh_token || undefined
        }
      })

      // Process new messages (simplified for MVP)
      console.log(`Processing ${history.messages.length} new Gmail messages for user ${userIntegration.user_id}`)
      
      // Fetch and store messages with AI analysis
      await unifiedMessageService.fetchAllMessages(userIntegration.user_id, {
        channels: ['gmail'],
        limit: history.messages.length,
        includeAnalysis: true,
        saveToDB: true
      })

      // Update last sync time (simplified for MVP)
      await supabase
        .from('connected_accounts')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userIntegration.user_id)
        .eq('provider', 'gmail')

      console.log(`Processed ${history.messages.length} new Gmail messages for user ${userIntegration.user_id}`)
    }

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      messagesProcessed: history.messages.length
    })

  } catch (error) {
    console.error('Gmail webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  // Google sends a GET request to verify the webhook endpoint
  const url = new URL(request.url)
  const challenge = url.searchParams.get('hub.challenge')
  
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  return NextResponse.json({ message: 'Gmail webhook endpoint' })
}