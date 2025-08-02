import { gmailAPI } from './gmail-api'
import { supabase } from '@/lib/supabase/client'
import { Message } from '@/types/ai'

export interface IntegrationTokens {
  gmail: {
    accessToken: string
    refreshToken?: string
  }
}

export interface SyncOptions {
  limit?: number
  since?: Date
  saveToDB?: boolean
}

export class UnifiedMessageService {
  private integrationTokens: Map<string, IntegrationTokens> = new Map()

  /**
   * Set Gmail integration tokens for a user
   */
  setTokens(userId: string, tokens: IntegrationTokens) {
    this.integrationTokens.set(userId, tokens)
    gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
  }

  /**
   * Fetch messages from Gmail
   */
  async fetchMessages(
    userId: string,
    options: SyncOptions = {}
  ): Promise<{
    messages: Message[]
    total: number
  }> {
    const {
      limit = 50,
      since,
      saveToDB = true
    } = options

    const tokens = this.integrationTokens.get(userId)
    if (!tokens) {
      throw new Error('No Gmail tokens found for user')
    }

    try {
      gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
      
      let query = 'in:inbox'
      if (since) {
        const dateStr = since.toISOString().split('T')[0].replace(/-/g, '/')
        query += ` after:${dateStr}`
      }

      const result = await gmailAPI.getMessages('me', {
        maxResults: limit,
        q: query
      })

      const messages = result.messages || []

      // Save messages to database
      if (saveToDB && messages.length > 0) {
        await this.saveMessagesToDB(userId, messages)
      }

      return {
        messages,
        total: messages.length
      }
    } catch (error) {
      throw new Error(`Failed to fetch Gmail messages: ${(error as Error).message}`)
    }
  }

  /**
   * Send email via Gmail
   */
  async sendMessage(
    userId: string,
    options: {
      to: string
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
      throw new Error('No Gmail tokens found for user')
    }

    try {
      gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
      
      if (options.replyToMessageId && options.threadId) {
        return await gmailAPI.sendReply(
          options.replyToMessageId,
          options.threadId,
          options.content,
          options.subject
        )
      } else {
        return await gmailAPI.sendEmail({
          to: options.to,
          subject: options.subject || 'Message from Napoleon AI',
          content: options.content
        })
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Search Gmail messages
   */
  async searchMessages(
    userId: string,
    query: string,
    limit: number = 50
  ): Promise<{
    messages: Message[]
    total: number
  }> {
    const tokens = this.integrationTokens.get(userId)
    if (!tokens) {
      throw new Error('No Gmail tokens found for user')
    }

    try {
      gmailAPI.setAccessToken(tokens.gmail.accessToken, tokens.gmail.refreshToken)
      const messages = await gmailAPI.searchMessages(query, limit)
      
      return {
        messages,
        total: messages.length
      }
    } catch (error) {
      throw new Error(`Failed to search Gmail messages: ${(error as Error).message}`)
    }
  }

  /**
   * Get Gmail integration status for user
   */
  async getIntegrationStatus(userId: string): Promise<{
    connected: boolean
    email?: string
    lastSync?: Date
  }> {
    const { data: integration } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .single()

    if (!integration || integration.status !== 'active') {
      return { connected: false }
    }

    return {
      connected: true,
      email: integration.account_email,
      lastSync: new Date(integration.updated_at)
    }
  }

  /**
   * Private helper methods
   */
  private async saveMessagesToDB(userId: string, messages: Message[]): Promise<void> {
    const messagesToSave = messages.map(msg => ({
      id: msg.id,
      user_id: userId,
      source: 'gmail' as const,
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
      status: 'unread' as const,
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
}

// Singleton instance
export const unifiedMessageService = new UnifiedMessageService()