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
      .from('user_integrations')
      .select('user_id, access_token, refresh_token, metadata')
      .eq('platform', 'gmail')
      .eq('metadata->email', emailAddress)
      .single()

    if (!userIntegration) {
      console.warn(`No user found for Gmail address: ${emailAddress}`)
      return NextResponse.json({ message: 'No user found' }, { status: 200 })
    }

    // Get the last processed history ID
    const metadata = userIntegration.metadata as { lastHistoryId?: string } | null
    const lastHistoryId = metadata?.lastHistoryId

    if (!lastHistoryId || parseInt(historyId) <= parseInt(lastHistoryId)) {
      // No new changes to process
      return NextResponse.json({ message: 'No new changes' }, { status: 200 })
    }

    // Set up Gmail API with user's tokens
    gmailAPI.setAccessToken(
      userIntegration.access_token,
      userIntegration.refresh_token || undefined
    )

    // Get the history since last processed ID
    const history = await gmailAPI.getHistory(lastHistoryId)

    if (history.messages.length > 0) {
      // Set up tokens for unified service
      unifiedMessageService.setTokens(userIntegration.user_id, {
        gmail: {
          accessToken: userIntegration.access_token,
          refreshToken: userIntegration.refresh_token || undefined
        }
      })

      // Process new messages with AI
      await Promise.all(
        history.messages.map(async (message) => {
          try {
            const { aiService } = await import('@/lib/ai/ai-service')
            await aiService.processNewMessage(message)
          } catch (error) {
            console.error(`Failed to process Gmail message ${message.id}:`, error)
          }
        })
      )

      // Update the last processed history ID
      await supabase
        .from('user_integrations')
        .update({
          metadata: {
            ...(userIntegration.metadata as object || {}),
            lastHistoryId: history.historyId
          },
          last_sync_at: new Date().toISOString()
        })
        .eq('user_id', userIntegration.user_id)
        .eq('platform', 'gmail')

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