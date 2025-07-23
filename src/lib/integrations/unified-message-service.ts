import { gmailAPI } from './gmail-api'
import { slackAPI } from './slack-api'
import { teamsAPI } from './teams-api'
import { aiService } from '@/lib/ai/ai-service'
import { supabase } from '@/lib/supabase/client'
import { Message, AnalysisResult } from '@/types/ai'

export interface IntegrationTokens {
  gmail?: {
    accessToken: string
    refreshToken?: string
  }
  slack?: {
    accessToken: string
    teamId?: string
  }
  teams?: {
    accessToken: string
    tenantId?: string
  }
}

export interface SyncOptions {
  channels?: ('gmail' | 'slack' | 'teams')[]
  limit?: number
  since?: Date
  includeAnalysis?: boolean
  saveToDB?: boolean
}

export class UnifiedMessageService {
  private integrationTokens: Map<string, IntegrationTokens> = new Map()

  /**
   * Set integration tokens for a user
   */
  setTokens(userId: string, tokens: IntegrationTokens) {
    this.integrationTokens.set(userId, tokens)
    
    // Configure API clients
    if (tokens.gmail) {
      gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
    }
    
    if (tokens.slack) {
      slackAPI.setToken(tokens.slack.accessToken)
    }
    
    if (tokens.teams) {
      teamsAPI.setAccessToken(tokens.teams.accessToken)
    }
  }

  /**
   * Fetch messages from all connected platforms
   */
  async fetchAllMessages(
    userId: string,
    options: SyncOptions = {}
  ): Promise<{
    gmail: Message[]
    slack: Message[]
    teams: Message[]
    total: number
    analysis?: AnalysisResult[]
  }> {
    const {
      channels = ['gmail', 'slack', 'teams'],
      limit = 50,
      since,
      includeAnalysis = false,
      saveToDB = true
    } = options

    const tokens = this.integrationTokens.get(userId)
    if (!tokens) {
      throw new Error('No integration tokens found for user')
    }

    const results = {
      gmail: [] as Message[],
      slack: [] as Message[],
      teams: [] as Message[],
      total: 0,
      analysis: [] as AnalysisResult[]
    }

    // Fetch from each platform in parallel
    const fetchPromises = []

    if (channels.includes('gmail') && tokens.gmail) {
      fetchPromises.push(this.fetchGmailMessages(tokens.gmail, limit, since))
    }

    if (channels.includes('slack') && tokens.slack) {
      fetchPromises.push(this.fetchSlackMessages(tokens.slack, limit, since))
    }

    if (channels.includes('teams') && tokens.teams) {
      fetchPromises.push(this.fetchTeamsMessages(tokens.teams, limit, since))
    }

    try {
      const fetchResults = await Promise.allSettled(fetchPromises)
      
      let channelIndex = 0
      if (channels.includes('gmail') && tokens.gmail) {
        const gmailResult = fetchResults[channelIndex++]
        if (gmailResult.status === 'fulfilled') {
          results.gmail = gmailResult.value
        }
      }

      if (channels.includes('slack') && tokens.slack) {
        const slackResult = fetchResults[channelIndex++]
        if (slackResult.status === 'fulfilled') {
          results.slack = slackResult.value
        }
      }

      if (channels.includes('teams') && tokens.teams) {
        const teamsResult = fetchResults[channelIndex++]
        if (teamsResult.status === 'fulfilled') {
          results.teams = teamsResult.value
        }
      }

      // Combine all messages
      const allMessages = [...results.gmail, ...results.slack, ...results.teams]
      results.total = allMessages.length

      // Sort by timestamp, newest first
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      // Save messages to database
      if (saveToDB && allMessages.length > 0) {
        await this.saveMessagesToDB(userId, allMessages)
      }

      // Process messages with AI if requested
      if (includeAnalysis) {
        results.analysis = await this.processMessagesWithAI(userId, allMessages.slice(0, 20))
      }

      return results
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${(error as Error).message}`)
    }
  }

  /**
   * Sync messages incrementally
   */
  async syncMessages(
    userId: string,
    options: SyncOptions = {}
  ): Promise<{
    newMessages: number
    updatedMessages: number
    totalProcessed: number
  }> {
    try {
      // Simplified for MVP - no sync status tracking
      const lastSyncDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

      // Fetch messages since last sync
      const fetchResult = await this.fetchAllMessages(userId, {
        ...options,
        since: lastSyncDate,
        limit: 200 // Higher limit for sync
      })

      // Filter out existing messages
      const existingMessageIds = await this.getExistingMessageIds(userId, fetchResult)
      const allMessages = [...fetchResult.gmail, ...fetchResult.slack, ...fetchResult.teams]
      const newMessages = allMessages.filter(msg => !existingMessageIds.has(msg.id))

      // Simplified for MVP - no AI processing in unified service

      // Simplified for MVP - no sync status tracking

      return {
        newMessages: newMessages.length,
        updatedMessages: 0, // Could implement update logic for modified messages
        totalProcessed: allMessages.length
      }
    } catch (error) {
      throw new Error(`Failed to sync messages: ${(error as Error).message}`)
    }
  }

  /**
   * Send message across platforms
   */
  async sendMessage(
    userId: string,
    platform: 'gmail' | 'slack' | 'teams',
    options: {
      to?: string // Email address for Gmail
      channelId?: string // Channel/Chat ID for Slack/Teams
      teamId?: string // Team ID for Teams channels
      subject?: string
      content: string
      replyToMessageId?: string
      threadId?: string
    }
  ): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    const tokens = this.integrationTokens.get(userId)
    if (!tokens) {
      throw new Error('No integration tokens found for user')
    }

    try {
      switch (platform) {
        case 'gmail':
          if (!tokens.gmail || !options.to) {
            throw new Error('Gmail token or recipient email missing')
          }
          
          gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
          
          if (options.replyToMessageId && options.threadId) {
            return await gmailAPI.sendReply(
              options.replyToMessageId,
              options.threadId,
              options.content,
              options.subject
            )
          } else {
            // For new emails, would need to implement sendEmail method
            throw new Error('New email sending not implemented yet')
          }

        case 'slack':
          if (!tokens.slack || !options.channelId) {
            throw new Error('Slack token or channel ID missing')
          }
          
          slackAPI.setToken(tokens.slack.accessToken)
          
          if (options.threadId) {
            return await slackAPI.replyToThread(
              options.channelId,
              options.threadId,
              options.content
            )
          } else {
            return await slackAPI.sendMessage(options.channelId, options.content)
          }

        case 'teams':
          if (!tokens.teams || !options.channelId) {
            throw new Error('Teams token or channel/chat ID missing')
          }
          
          teamsAPI.setAccessToken(tokens.teams.accessToken)
          
          if (options.replyToMessageId) {
            return await teamsAPI.replyToMessage(
              options.teamId ? 'channel' : 'chat',
              options.channelId,
              options.replyToMessageId,
              options.content,
              { teamId: options.teamId }
            )
          } else {
            return await teamsAPI.sendMessage(
              options.teamId ? 'channel' : 'chat',
              options.channelId,
              options.content,
              { teamId: options.teamId, subject: options.subject }
            )
          }

        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Search messages across all platforms
   */
  async searchMessages(
    userId: string,
    query: string,
    options: {
      platforms?: ('gmail' | 'slack' | 'teams')[]
      limit?: number
      includeAnalysis?: boolean
    } = {}
  ): Promise<{
    gmail: Message[]
    slack: Message[]
    teams: Message[]
    total: number
    analysis?: AnalysisResult[]
  }> {
    const { platforms = ['gmail', 'slack', 'teams'], limit = 50, includeAnalysis = false } = options
    
    const tokens = this.integrationTokens.get(userId)
    if (!tokens) {
      throw new Error('No integration tokens found for user')
    }

    const results = {
      gmail: [] as Message[],
      slack: [] as Message[],
      teams: [] as Message[],
      total: 0,
      analysis: [] as AnalysisResult[]
    }

    const searchPromises = []

    if (platforms.includes('gmail') && tokens.gmail) {
      gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
      searchPromises.push(gmailAPI.searchMessages(query, limit))
    }

    if (platforms.includes('slack') && tokens.slack) {
      slackAPI.setToken(tokens.slack.accessToken)
      searchPromises.push(slackAPI.searchMessages(query, { count: limit }))
    }

    if (platforms.includes('teams') && tokens.teams) {
      teamsAPI.setAccessToken(tokens.teams.accessToken)
      searchPromises.push(teamsAPI.searchMessages(query))
    }

    try {
      const searchResults = await Promise.allSettled(searchPromises)
      
      let platformIndex = 0
      if (platforms.includes('gmail') && tokens.gmail) {
        const gmailResult = searchResults[platformIndex++]
        if (gmailResult.status === 'fulfilled') {
          results.gmail = gmailResult.value
        }
      }

      if (platforms.includes('slack') && tokens.slack) {
        const slackResult = searchResults[platformIndex++]
        if (slackResult.status === 'fulfilled') {
          results.slack = slackResult.value
        }
      }

      if (platforms.includes('teams') && tokens.teams) {
        const teamsResult = searchResults[platformIndex++]
        if (teamsResult.status === 'fulfilled') {
          results.teams = teamsResult.value
        }
      }

      const allMessages = [...results.gmail, ...results.slack, ...results.teams]
      results.total = allMessages.length

      // Sort by relevance and timestamp
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      if (includeAnalysis) {
        results.analysis = await this.processMessagesWithAI(userId, allMessages.slice(0, 10))
      }

      return results
    } catch (error) {
      throw new Error(`Failed to search messages: ${(error as Error).message}`)
    }
  }

  /**
   * Get integration status for user
   */
  async getIntegrationStatus(userId: string): Promise<{
    gmail: { connected: boolean; email?: string; lastSync?: Date }
    slack: { connected: boolean; workspace?: string; lastSync?: Date }
    teams: { connected: boolean; tenant?: string; lastSync?: Date }
  }> {
    const { data: integrations } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)

    const status = {
      gmail: { connected: false },
      slack: { connected: false },
      teams: { connected: false }
    }

    integrations?.forEach(integration => {
      if (integration.provider === 'gmail') {
        status.gmail = {
          connected: integration.status === 'active'
        }
      } else if (integration.provider === 'slack') {
        status.slack = {
          connected: integration.status === 'active'
        }
      } else if (integration.provider === 'teams') {
        status.teams = {
          connected: integration.status === 'active'
        }
      }
    })

    return status
  }

  /**
   * Private helper methods
   */
  private async fetchGmailMessages(
    gmailTokens: { accessToken: string; refreshToken?: string },
    limit: number,
    since?: Date
  ): Promise<Message[]> {
    gmailAPI.setAccessToken(gmailTokens.accessToken, gmailTokens.refreshToken)
    
    let query = 'in:inbox'
    if (since) {
      const dateStr = since.toISOString().split('T')[0].replace(/-/g, '/')
      query += ` after:${dateStr}`
    }

    const result = await gmailAPI.getMessages('me', {
      maxResults: limit,
      q: query
    })

    return result.messages
  }

  private async fetchSlackMessages(
    slackTokens: { accessToken: string },
    limit: number,
    since?: Date
  ): Promise<Message[]> {
    slackAPI.setToken(slackTokens.accessToken)
    
    const oldest = since ? Math.floor(since.getTime() / 1000).toString() : undefined
    
    const result = await slackAPI.getMessages({
      limit,
      oldest
    })

    return result.messages
  }

  private async fetchTeamsMessages(
    teamsTokens: { accessToken: string },
    limit: number,
    since?: Date
  ): Promise<Message[]> {
    teamsAPI.setAccessToken(teamsTokens.accessToken)
    
    const filter = since ? `createdDateTime gt ${since.toISOString()}` : undefined
    
    const result = await teamsAPI.getMessages({
      limit,
      filter
    })

    return result.messages
  }

  private async saveMessagesToDB(userId: string, messages: Message[]): Promise<void> {
    const messagesToSave = messages.map(msg => ({
      id: msg.id,
      user_id: userId,
      source: (msg.channel === 'gmail' ? 'gmail' : msg.channel === 'slack' ? 'slack' : 'teams') as 'gmail' | 'slack' | 'teams',
      external_id: msg.id,
      thread_id: null,
      subject: msg.subject,
      content: msg.content,
      sender_email: msg.sender,
      sender_name: msg.sender,
      recipients: [],
      priority_score: 0,
      ai_summary: null,
      sentiment: null,
      is_vip: false,
      status: 'unread' as 'unread' | 'read' | 'archived' | 'snoozed',
      snoozed_until: null,
      has_attachments: false,
      message_date: msg.timestamp.toISOString(),
      created_at: new Date().toISOString()
    }))

    // Insert messages in batches
    const batchSize = 100
    for (let i = 0; i < messagesToSave.length; i += batchSize) {
      const batch = messagesToSave.slice(i, i + batchSize)
      await supabase
        .from('messages')
        .upsert(batch, { onConflict: 'id' })
    }
  }

  private async getExistingMessageIds(userId: string, fetchResult: any): Promise<Set<string>> {
    const allMessageIds = [
      ...fetchResult.gmail.map((m: Message) => m.id),
      ...fetchResult.slack.map((m: Message) => m.id),
      ...fetchResult.teams.map((m: Message) => m.id)
    ]

    if (allMessageIds.length === 0) return new Set()

    const { data: existingMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('user_id', userId)
      .in('id', allMessageIds)

    return new Set(existingMessages?.map(m => m.id) || [])
  }

  private async processMessagesWithAI(userId: string, messages: Message[]): Promise<AnalysisResult[]> {
    const analysisResults = []

    // Simplified for MVP - no AI processing
    return []
  }
}

// Singleton instance
export const unifiedMessageService = new UnifiedMessageService()