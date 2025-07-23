import { WebClient } from '@slack/web-api'
import { Message } from '@/types/ai'

export class SlackAPI {
  private client: WebClient

  constructor(token?: string) {
    this.client = new WebClient(token)
  }

  /**
   * Set access token for authenticated requests
   */
  setToken(token: string) {
    this.client = new WebClient(token)
  }

  /**
   * Get messages from Slack channels and DMs
   */
  async getMessages(options: {
    channelId?: string
    limit?: number
    oldest?: string
    latest?: string
    inclusive?: boolean
  } = {}): Promise<{
    messages: Message[]
    hasMore: boolean
    responseMetadata?: any
  }> {
    try {
      const { channelId, limit = 50, oldest, latest, inclusive = true } = options

      let allMessages: Message[] = []
      let hasMore = false

      if (channelId) {
        // Get messages from specific channel
        const response = await this.client.conversations.history({
          channel: channelId,
          limit,
          oldest,
          latest,
          inclusive
        })

        const messages = response.messages || []
        allMessages = await this.convertSlackMessages(messages, channelId)
        hasMore = response.has_more || false
      } else {
        // Get messages from all accessible channels and DMs
        const channels = await this.getAllChannels()
        
        for (const channel of channels.slice(0, 10)) { // Limit to first 10 channels
          try {
            const response = await this.client.conversations.history({
              channel: channel.id!,
              limit: Math.min(limit, 10),
              oldest,
              latest,
              inclusive
            })

            const channelMessages = await this.convertSlackMessages(
              response.messages || [], 
              channel.id!,
              channel.name
            )
            allMessages.push(...channelMessages)
          } catch (error) {
            console.warn(`Failed to get messages from channel ${channel.id}:`, error)
          }
        }
      }

      // Sort by timestamp, newest first
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      return {
        messages: allMessages.slice(0, limit),
        hasMore,
        responseMetadata: { channelCount: channelId ? 1 : 10 }
      }
    } catch (error) {
      throw new Error(`Failed to get Slack messages: ${(error as Error).message}`)
    }
  }

  /**
   * Get all accessible channels and DMs
   */
  async getAllChannels(): Promise<Array<{
    id: string
    name?: string
    isChannel: boolean
    isPrivate: boolean
    isMember: boolean
  }>> {
    try {
      const channels = []

      // Get public channels
      const publicChannels = await this.client.conversations.list({
        types: 'public_channel',
        limit: 100
      })

      for (const channel of publicChannels.channels || []) {
        channels.push({
          id: channel.id!,
          name: channel.name,
          isChannel: true,
          isPrivate: false,
          isMember: channel.is_member || false
        })
      }

      // Get private channels
      const privateChannels = await this.client.conversations.list({
        types: 'private_channel',
        limit: 100
      })

      for (const channel of privateChannels.channels || []) {
        channels.push({
          id: channel.id!,
          name: channel.name,
          isChannel: true,
          isPrivate: true,
          isMember: channel.is_member || false
        })
      }

      // Get direct messages
      const dms = await this.client.conversations.list({
        types: 'im',
        limit: 100
      })

      for (const dm of dms.channels || []) {
        channels.push({
          id: dm.id!,
          name: `DM with ${dm.user}`,
          isChannel: false,
          isPrivate: true,
          isMember: true
        })
      }

      return channels.filter(c => c.isMember)
    } catch (error) {
      throw new Error(`Failed to get Slack channels: ${(error as Error).message}`)
    }
  }

  /**
   * Send message to Slack channel or DM
   */
  async sendMessage(
    channelId: string,
    text: string,
    options: {
      threadTs?: string
      asUser?: boolean
      username?: string
      iconEmoji?: string
      blocks?: any[]
    } = {}
  ): Promise<{
    success: boolean
    ts?: string
    message?: any
    error?: string
  }> {
    try {
      const messageParams: any = {
        channel: channelId,
        text,
        as_user: options.asUser,
        username: options.username,
        icon_emoji: options.iconEmoji,
        blocks: options.blocks || []
      }
      
      // Only add thread_ts and reply_broadcast if threadTs is provided
      if (options.threadTs) {
        messageParams.thread_ts = options.threadTs
        messageParams.reply_broadcast = false
      }
      
      const response = await this.client.chat.postMessage(messageParams)

      return {
        success: true,
        ts: response.ts,
        message: response.message
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Reply to a thread
   */
  async replyToThread(
    channelId: string,
    threadTs: string,
    text: string
  ): Promise<{
    success: boolean
    ts?: string
    error?: string
  }> {
    return this.sendMessage(channelId, text, { threadTs })
  }

  /**
   * Get user information
   */
  async getUserInfo(userId: string): Promise<{
    id: string
    name: string
    realName?: string
    email?: string
    title?: string
    image?: string
  } | null> {
    try {
      const response = await this.client.users.info({
        user: userId
      })

      const user = response.user
      if (!user) return null

      return {
        id: user.id!,
        name: user.name!,
        realName: user.real_name,
        email: user.profile?.email,
        title: user.profile?.title,
        image: user.profile?.image_72
      }
    } catch (error) {
      console.error(`Failed to get user info for ${userId}:`, error)
      return null
    }
  }

  /**
   * Get workspace/team information
   */
  async getTeamInfo(): Promise<{
    id: string
    name: string
    domain: string
    emailDomain?: string
  } | null> {
    try {
      const response = await this.client.team.info()
      const team = response.team

      if (!team) return null

      return {
        id: team.id!,
        name: team.name!,
        domain: team.domain!,
        emailDomain: team.email_domain
      }
    } catch (error) {
      console.error('Failed to get team info:', error)
      return null
    }
  }

  /**
   * Search messages across the workspace
   */
  async searchMessages(
    query: string,
    options: {
      sort?: 'timestamp' | 'score'
      sortDir?: 'asc' | 'desc'
      count?: number
    } = {}
  ): Promise<Message[]> {
    try {
      const { sort = 'timestamp', sortDir = 'desc', count = 20 } = options

      const response = await this.client.search.messages({
        query,
        sort,
        sort_dir: sortDir,
        count
      })

      const searchResults = response.messages?.matches || []
      return this.convertSlackSearchResults(searchResults)
    } catch (error) {
      throw new Error(`Failed to search Slack messages: ${(error as Error).message}`)
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(channelId: string, timestamp: string): Promise<boolean> {
    try {
      await this.client.conversations.mark({
        channel: channelId,
        ts: timestamp
      })
      return true
    } catch (error) {
      console.error('Failed to mark Slack message as read:', error)
      return false
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string): Promise<{
    id: string
    name: string
    isPrivate: boolean
    memberCount?: number
    purpose?: string
    topic?: string
  } | null> {
    try {
      const response = await this.client.conversations.info({
        channel: channelId
      })

      const channel = response.channel
      if (!channel) return null

      return {
        id: channel.id!,
        name: channel.name || 'Unknown Channel',
        isPrivate: channel.is_private || false,
        memberCount: channel.num_members,
        purpose: channel.purpose?.value,
        topic: channel.topic?.value
      }
    } catch (error) {
      console.error(`Failed to get channel info for ${channelId}:`, error)
      return null
    }
  }

  /**
   * Convert Slack messages to unified Message format
   */
  private async convertSlackMessages(
    slackMessages: any[],
    channelId: string,
    channelName?: string
  ): Promise<Message[]> {
    const messages: Message[] = []

    for (const msg of slackMessages) {
      // Skip bot messages and message edits
      if (msg.subtype === 'bot_message' || msg.subtype === 'message_changed') {
        continue
      }

      // Get user information
      const userInfo = msg.user ? await this.getUserInfo(msg.user) : null
      
      // Extract text content
      let content = msg.text || ''
      
      // Handle formatted messages
      if (msg.blocks) {
        content = this.extractTextFromBlocks(msg.blocks)
      }

      // Clean up Slack formatting
      content = this.cleanSlackFormatting(content)

      const message: Message = {
        id: `slack-${channelId}-${msg.ts}`,
        subject: `Message in ${channelName || channelId}`,
        content,
        sender: userInfo?.realName || userInfo?.name || 'Unknown User',
        channel: 'slack',
        timestamp: new Date(parseFloat(msg.ts) * 1000)
      }

      messages.push(message)
    }

    return messages
  }

  /**
   * Convert Slack search results to unified Message format
   */
  private convertSlackSearchResults(searchResults: any[]): Message[] {
    return searchResults.map(result => {
      const msg = result
      
      return {
        id: `slack-search-${msg.channel?.id}-${msg.ts}`,
        subject: `Search Result from ${msg.channel?.name || 'Unknown Channel'}`,
        content: this.cleanSlackFormatting(msg.text || ''),
        sender: msg.username || 'Unknown User',
        channel: 'slack',
        timestamp: new Date(parseFloat(msg.ts) * 1000),
        isRead: true,
        threadId: msg.thread_ts || msg.ts,
        externalId: msg.ts,
        metadata: {
          slackChannel: msg.channel?.id,
          slackChannelName: msg.channel?.name,
          slackUser: msg.user,
          permalink: msg.permalink,
          score: result.score
        }
      } as Message
    })
  }

  /**
   * Extract text content from Slack blocks
   */
  private extractTextFromBlocks(blocks: any[]): string {
    let text = ''
    
    for (const block of blocks) {
      if (block.type === 'section' && block.text) {
        text += block.text.text + '\n'
      } else if (block.type === 'rich_text' && block.elements) {
        for (const element of block.elements) {
          if (element.type === 'rich_text_section' && element.elements) {
            for (const textElement of element.elements) {
              if (textElement.text) {
                text += textElement.text
              }
            }
          }
        }
        text += '\n'
      }
    }
    
    return text.trim()
  }

  /**
   * Clean up Slack-specific formatting
   */
  private cleanSlackFormatting(text: string): string {
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
}

// Singleton instance
export const slackAPI = new SlackAPI()