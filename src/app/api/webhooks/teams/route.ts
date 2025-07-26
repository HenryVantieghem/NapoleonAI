import { NextRequest, NextResponse } from 'next/server'
import { teamsAPI } from '@/lib/integrations/teams-api'
import { unifiedMessageService } from '@/lib/integrations/unified-message-service'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    let teamsEvent

    try {
      teamsEvent = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Handle subscription validation
    if (teamsEvent.validationToken) {
      return new NextResponse(teamsEvent.validationToken, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Process webhook notifications
    if (teamsEvent.value && Array.isArray(teamsEvent.value)) {
      for (const notification of teamsEvent.value) {
        await handleTeamsNotification(notification)
      }
    }

    return NextResponse.json({ message: 'OK' })

  } catch (error) {
    console.error('Teams webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleTeamsNotification(notification: any) {
  try {
    const { resource, changeType, tenantId } = notification

    // Only process created messages
    if (changeType !== 'created') {
      return
    }

    // Extract resource information
    const resourceData = notification.resourceData || {}
    const resourceUrl = resource

    // Parse resource URL to get chat/channel information
    const resourceMatch = resourceUrl.match(/\/(chats|teams)\/([^\/]+)/)
    if (!resourceMatch) {
      console.warn('Could not parse Teams resource URL:', resourceUrl)
      return
    }

    const [, resourceType, resourceId] = resourceMatch
    
    // Find the user associated with this Teams tenant
    const { data: userIntegration } = await supabase
      .from('connected_accounts')
      .select('user_id, access_token, account_id')
      .eq('provider', 'teams')
      .eq('account_id', tenantId)
      .single()

    if (!userIntegration) {
      console.warn(`No user found for Teams tenant: ${tenantId}`)
      return
    }

    // Set up Teams API with user's token
    if (!userIntegration.access_token) {
      console.error('No access token found for Teams user')
      return
    }
    
    teamsAPI.setAccessToken(userIntegration.access_token)

    let message
    let contextName = ''

    if (resourceType === 'chats') {
      // Get message from chat
      try {
        const chatMessages = await teamsAPI.getMessages({
          chatId: resourceId,
          limit: 1,
          orderBy: 'createdDateTime desc'
        })

        if (chatMessages.messages.length > 0) {
          message = chatMessages.messages[0]
          
          // Get chat information for context
          const chats = await teamsAPI.getAllChats()
          const chat = chats.find(c => c.id === resourceId)
          contextName = chat?.topic || 'Teams Chat'
        }
      } catch (error) {
        console.error('Failed to get Teams chat message:', error)
        return
      }
    } else if (resourceType === 'teams') {
      // Parse team and channel from resource URL
      const teamChannelMatch = resourceUrl.match(/\/teams\/([^\/]+)\/channels\/([^\/]+)/)
      if (!teamChannelMatch) {
        console.warn('Could not parse Teams channel URL:', resourceUrl)
        return
      }

      const [, teamId, channelId] = teamChannelMatch

      try {
        const channelMessages = await teamsAPI.getMessages({
          teamId,
          channelId,
          limit: 1,
          orderBy: 'createdDateTime desc'
        })

        if (channelMessages.messages.length > 0) {
          message = channelMessages.messages[0]
          
          // Get team and channel information for context
          const teams = await teamsAPI.getAllTeams()
          const team = teams.find(t => t.id === teamId)
          
          const channels = await teamsAPI.getTeamChannels(teamId)
          const channel = channels.find(c => c.id === channelId)
          
          contextName = `${team?.displayName || 'Unknown Team'} - ${channel?.displayName || 'Unknown Channel'}`
        }
      } catch (error) {
        console.error('Failed to get Teams channel message:', error)
        return
      }
    }

    if (!message) {
      console.warn('No message found for Teams notification')
      return
    }

    // Set up tokens for unified service
    unifiedMessageService.setTokens(userIntegration.user_id, {
      teams: {
        accessToken: userIntegration.access_token,
        tenantId
      }
    })

    // Process message with simplified AI (MVP)
    console.log(`Processing Teams message for user ${userIntegration.user_id}`)
    
    // Store message and analyze with AI
    await unifiedMessageService.fetchAllMessages(userIntegration.user_id, {
      channels: ['teams'],
      limit: 1,
      includeAnalysis: true,
      saveToDB: true
    })

    // Update last sync timestamp
    await supabase
      .from('connected_accounts')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userIntegration.user_id)
      .eq('provider', 'teams')

    console.log(`Processed new Teams message for user ${userIntegration.user_id}`)

  } catch (error) {
    console.error('Failed to handle Teams notification:', error)
  }
}

// Handle GET requests for endpoint verification
export async function GET() {
  return NextResponse.json({ message: 'Teams webhook endpoint' })
}