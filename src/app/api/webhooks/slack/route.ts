import { NextRequest, NextResponse } from 'next/server'
import { slackAPI } from '@/lib/integrations/slack-api'
import { unifiedMessageService } from '@/lib/integrations/unified-message-service'
import { supabase } from '@/lib/supabase/client'
import { createHmac } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const timestamp = request.headers.get('x-slack-request-timestamp')
    const signature = request.headers.get('x-slack-signature')

    // Verify the request is from Slack
    if (!timestamp || !signature) {
      return NextResponse.json({ error: 'Missing Slack headers' }, { status: 401 })
    }

    // Verify the signature (requires SLACK_SIGNING_SECRET)
    const signingSecret = process.env.SLACK_SIGNING_SECRET
    if (signingSecret) {
      const hmac = createHmac('sha256', signingSecret)
      const requestSignature = 'v0=' + hmac
        .update(`v0:${timestamp}:${body}`)
        .digest('hex')

      if (requestSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Parse the Slack event
    let slackEvent
    try {
      slackEvent = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Handle URL verification challenge
    if (slackEvent.type === 'url_verification') {
      return NextResponse.json({ challenge: slackEvent.challenge })
    }

    // Handle event callbacks
    if (slackEvent.type === 'event_callback') {
      const event = slackEvent.event

      // Only process message events
      if (event.type === 'message' && !event.subtype) {
        await handleSlackMessage(event, slackEvent.team_id)
      }
    }

    return NextResponse.json({ message: 'OK' })

  } catch (error) {
    console.error('Slack webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSlackMessage(event: any, teamId: string) {
  try {
    // Find the user associated with this Slack workspace
    const { data: userIntegration } = await supabase
      .from('user_integrations')
      .select('user_id, access_token, metadata')
      .eq('platform', 'slack')
      .eq('metadata->team_id', teamId)
      .single()

    if (!userIntegration) {
      console.warn(`No user found for Slack team: ${teamId}`)
      return
    }

    // Set up Slack API with user's token
    slackAPI.setToken(userIntegration.access_token)

    // Get detailed message information
    const channelInfo = await slackAPI.getChannelInfo(event.channel)
    const userInfo = await slackAPI.getUserInfo(event.user)

    // Convert to unified message format
    const message = {
      id: `slack-${event.channel}-${event.ts}`,
      subject: `Message in ${channelInfo?.name || event.channel}`,
      content: cleanSlackText(event.text || ''),
      sender: userInfo?.realName || userInfo?.name || 'Unknown User',
      senderEmail: userInfo?.email,
      senderRole: userInfo?.title,
      channel: 'slack' as const,
      timestamp: new Date(parseFloat(event.ts) * 1000),
      isRead: true,
      threadId: event.thread_ts || event.ts,
      hasAttachments: (event.files && event.files.length > 0) || false,
      attachmentCount: event.files ? event.files.length : 0,
      externalId: event.ts,
      externalThreadId: event.thread_ts,
      metadata: {
        slackChannel: event.channel,
        slackChannelName: channelInfo?.name,
        slackUser: event.user,
        slackTeam: teamId,
        slackEventTs: event.event_ts
      }
    }

    // Set up tokens for unified service
    unifiedMessageService.setTokens(userIntegration.user_id, {
      slack: {
        accessToken: userIntegration.access_token,
        teamId
      }
    })

    // Process message with AI
    const { aiService } = await import('@/lib/ai/ai-service')
    await aiService.processNewMessage(message)

    // Update last sync timestamp
    await supabase
      .from('user_integrations')
      .update({
        last_sync_at: new Date().toISOString()
      })
      .eq('user_id', userIntegration.user_id)
      .eq('platform', 'slack')

    console.log(`Processed new Slack message for user ${userIntegration.user_id}`)

  } catch (error) {
    console.error('Failed to handle Slack message:', error)
  }
}

function cleanSlackText(text: string): string {
  return text
    .replace(/<@([UW][A-Z0-9]+)>/g, '@user') // User mentions
    .replace(/<#([C][A-Z0-9]+)\|([^>]+)>/g, '#$2') // Channel mentions
    .replace(/<([^>|]+)\|([^>]+)>/g, '$2') // Links with labels
    .replace(/<([^>]+)>/g, '$1') // Simple links
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

// Handle GET requests for endpoint verification
export async function GET() {
  return NextResponse.json({ message: 'Slack webhook endpoint' })
}