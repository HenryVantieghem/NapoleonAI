import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'
import { Message } from '@/types/ai'

class CustomAuthProvider implements AuthenticationProvider {
  private accessToken: string = ''

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }
    return this.accessToken
  }
}

export class TeamsAPI {
  private client: Client
  private authProvider: CustomAuthProvider

  constructor() {
    this.authProvider = new CustomAuthProvider()
    this.client = Client.initWithMiddleware({ authProvider: this.authProvider })
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(accessToken: string) {
    this.authProvider.setAccessToken(accessToken)
  }

  /**
   * Get messages from Teams chats and channels
   */
  async getMessages(options: {
    chatId?: string
    teamId?: string
    channelId?: string
    limit?: number
    filter?: string
    orderBy?: string
  } = {}): Promise<{
    messages: Message[]
    hasMore: boolean
    nextLink?: string
  }> {
    try {
      const { chatId, teamId, channelId, limit = 50, filter, orderBy = 'createdDateTime desc' } = options

      let allMessages: Message[] = []
      let hasMore = false
      let nextLink: string | undefined

      if (chatId) {
        // Get messages from specific chat
        const response = await this.client
          .api(`/chats/${chatId}/messages`)
          .top(limit)
          .orderby(orderBy)
          .filter(filter)
          .get()

        allMessages = await this.convertTeamsMessages(response.value || [], 'chat', chatId)
        hasMore = !!response['@odata.nextLink']
        nextLink = response['@odata.nextLink']
      } else if (teamId && channelId) {
        // Get messages from specific team channel
        const response = await this.client
          .api(`/teams/${teamId}/channels/${channelId}/messages`)
          .top(limit)
          .orderby(orderBy)
          .filter(filter)
          .get()

        allMessages = await this.convertTeamsMessages(response.value || [], 'channel', channelId, teamId)
        hasMore = !!response['@odata.nextLink']
        nextLink = response['@odata.nextLink']
      } else {
        // Get messages from all accessible chats and channels
        const [chats, teams] = await Promise.all([
          this.getAllChats(),
          this.getAllTeams()
        ])

        // Process chats
        for (const chat of chats.slice(0, 5)) { // Limit to first 5 chats
          try {
            const response = await this.client
              .api(`/chats/${chat.id}/messages`)
              .top(10)
              .orderby(orderBy)
              .get()

            const chatMessages = await this.convertTeamsMessages(
              response.value || [], 
              'chat', 
              chat.id,
              undefined,
              chat.topic
            )
            allMessages.push(...chatMessages)
          } catch (error) {
            console.warn(`Failed to get messages from chat ${chat.id}:`, error)
          }
        }

        // Process team channels
        for (const team of teams.slice(0, 3)) { // Limit to first 3 teams
          try {
            const channels = await this.getTeamChannels(team.id)
            for (const channel of channels.slice(0, 2)) { // Limit to first 2 channels per team
              try {
                const response = await this.client
                  .api(`/teams/${team.id}/channels/${channel.id}/messages`)
                  .top(5)
                  .orderby(orderBy)
                  .get()

                const channelMessages = await this.convertTeamsMessages(
                  response.value || [],
                  'channel',
                  channel.id,
                  team.id,
                  `${team.displayName} - ${channel.displayName}`
                )
                allMessages.push(...channelMessages)
              } catch (error) {
                console.warn(`Failed to get messages from channel ${channel.id}:`, error)
              }
            }
          } catch (error) {
            console.warn(`Failed to get channels for team ${team.id}:`, error)
          }
        }
      }

      // Sort by timestamp, newest first
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      return {
        messages: allMessages.slice(0, limit),
        hasMore,
        nextLink
      }
    } catch (error) {
      throw new Error(`Failed to get Teams messages: ${(error as Error).message}`)
    }
  }

  /**
   * Get all accessible chats
   */
  async getAllChats(): Promise<Array<{
    id: string
    topic?: string
    chatType: string
    members: any[]
  }>> {
    try {
      const response = await this.client
        .api('/chats')
        .expand('members')
        .top(50)
        .get()

      return (response.value || []).map((chat: any) => ({
        id: chat.id,
        topic: chat.topic,
        chatType: chat.chatType,
        members: chat.members || []
      }))
    } catch (error) {
      throw new Error(`Failed to get Teams chats: ${(error as Error).message}`)
    }
  }

  /**
   * Get all teams the user is a member of
   */
  async getAllTeams(): Promise<Array<{
    id: string
    displayName: string
    description?: string
    visibility: string
  }>> {
    try {
      const response = await this.client
        .api('/me/joinedTeams')
        .top(50)
        .get()

      return (response.value || []).map((team: any) => ({
        id: team.id,
        displayName: team.displayName,
        description: team.description,
        visibility: team.visibility
      }))
    } catch (error) {
      throw new Error(`Failed to get Teams: ${(error as Error).message}`)
    }
  }

  /**
   * Get channels for a specific team
   */
  async getTeamChannels(teamId: string): Promise<Array<{
    id: string
    displayName: string
    description?: string
    membershipType: string
  }>> {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/channels`)
        .get()

      return (response.value || []).map((channel: any) => ({
        id: channel.id,
        displayName: channel.displayName,
        description: channel.description,
        membershipType: channel.membershipType
      }))
    } catch (error) {
      throw new Error(`Failed to get team channels: ${(error as Error).message}`)
    }
  }

  /**
   * Send message to Teams chat or channel
   */
  async sendMessage(
    type: 'chat' | 'channel',
    id: string,
    content: string,
    options: {
      teamId?: string // Required for channel messages
      subject?: string
      contentType?: 'text' | 'html'
    } = {}
  ): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      const { teamId, subject, contentType = 'html' } = options

      const messageBody = {
        body: {
          contentType,
          content
        },
        ...(subject && { subject })
      }

      let response
      if (type === 'chat') {
        response = await this.client
          .api(`/chats/${id}/messages`)
          .post(messageBody)
      } else if (type === 'channel' && teamId) {
        response = await this.client
          .api(`/teams/${teamId}/channels/${id}/messages`)
          .post(messageBody)
      } else {
        throw new Error('Invalid message type or missing teamId for channel message')
      }

      return {
        success: true,
        messageId: response.id
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    type: 'chat' | 'channel',
    chatOrChannelId: string,
    messageId: string,
    content: string,
    options: {
      teamId?: string
      contentType?: 'text' | 'html'
    } = {}
  ): Promise<{
    success: boolean
    replyId?: string
    error?: string
  }> {
    try {
      const { teamId, contentType = 'html' } = options

      const replyBody = {
        body: {
          contentType,
          content
        }
      }

      let response
      if (type === 'chat') {
        response = await this.client
          .api(`/chats/${chatOrChannelId}/messages/${messageId}/replies`)
          .post(replyBody)
      } else if (type === 'channel' && teamId) {
        response = await this.client
          .api(`/teams/${teamId}/channels/${chatOrChannelId}/messages/${messageId}/replies`)
          .post(replyBody)
      } else {
        throw new Error('Invalid message type or missing teamId for channel reply')
      }

      return {
        success: true,
        replyId: response.id
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Get user's Microsoft Graph profile
   */
  async getProfile(): Promise<{
    id: string
    displayName: string
    mail?: string
    userPrincipalName: string
    jobTitle?: string
    officeLocation?: string
  } | null> {
    try {
      const response = await this.client.api('/me').get()

      return {
        id: response.id,
        displayName: response.displayName,
        mail: response.mail,
        userPrincipalName: response.userPrincipalName,
        jobTitle: response.jobTitle,
        officeLocation: response.officeLocation
      }
    } catch (error) {
      console.error('Failed to get Teams profile:', error)
      return null
    }
  }

  /**
   * Search messages across Teams
   */
  async searchMessages(query: string): Promise<Message[]> {
    try {
      // Note: Microsoft Graph search for Teams messages requires specific permissions
      // and is limited. This is a simplified implementation.
      const response = await this.client
        .api('/search/query')
        .post({
          requests: [
            {
              entityTypes: ['chatMessage'],
              query: {
                queryString: query
              },
              from: 0,
              size: 25
            }
          ]
        })

      const searchResults = response.value?.[0]?.hitsContainers?.[0]?.hits || []
      return this.convertTeamsSearchResults(searchResults)
    } catch (error) {
      console.warn('Teams search not available or failed:', error)
      return []
    }
  }

  /**
   * Get presence status
   */
  async getPresence(): Promise<{
    availability: string
    activity: string
  } | null> {
    try {
      const response = await this.client.api('/me/presence').get()
      
      return {
        availability: response.availability,
        activity: response.activity
      }
    } catch (error) {
      console.error('Failed to get presence:', error)
      return null
    }
  }

  /**
   * Convert Teams messages to unified Message format
   */
  private async convertTeamsMessages(
    teamsMessages: any[],
    type: 'chat' | 'channel',
    contextId: string,
    teamId?: string,
    contextName?: string
  ): Promise<Message[]> {
    const messages: Message[] = []

    for (const msg of teamsMessages) {
      // Skip system messages and deleted messages
      if (msg.messageType !== 'message' || msg.deletedDateTime) {
        continue
      }

      // Extract sender information
      const sender = msg.from?.user
      const senderName = sender?.displayName || 'Unknown User'
      const senderEmail = sender?.userIdentityType === 'aadUser' ? sender.id : undefined

      // Extract content
      let content = ''
      if (msg.body?.content) {
        content = this.cleanTeamsContent(msg.body.content)
      }

      // Create subject based on context
      let subject = `Teams ${type === 'chat' ? 'Chat' : 'Channel'} Message`
      if (contextName) {
        subject = `Message in ${contextName}`
      }

      const message: Message = {
        id: `teams-${type}-${contextId}-${msg.id}`,
        subject,
        content,
        sender: senderName,
        senderEmail,
        channel: 'teams',
        timestamp: new Date(msg.createdDateTime),
        isRead: true, // Teams doesn't provide unread status per message
        threadId: msg.id,
        hasAttachments: (msg.attachments && msg.attachments.length > 0) || false,
        attachmentCount: msg.attachments ? msg.attachments.length : 0,
        externalId: msg.id,
        externalThreadId: msg.id,
        metadata: {
          teamsType: type,
          teamsContextId: contextId,
          teamsTeamId: teamId,
          teamsContextName: contextName,
          messageType: msg.messageType,
          importance: msg.importance,
          locale: msg.locale,
          reactions: msg.reactions || []
        }
      }

      messages.push(message)
    }

    return messages
  }

  /**
   * Convert Teams search results to unified Message format
   */
  private convertTeamsSearchResults(searchResults: any[]): Message[] {
    return searchResults.map(result => {
      const msg = result.resource
      
      return {
        id: `teams-search-${msg.id}`,
        subject: 'Teams Search Result',
        content: this.cleanTeamsContent(msg.body?.content || ''),
        sender: msg.from?.user?.displayName || 'Unknown User',
        channel: 'teams',
        timestamp: new Date(msg.createdDateTime),
        isRead: true,
        threadId: msg.id,
        externalId: msg.id,
        metadata: {
          searchScore: result.score,
          messageType: msg.messageType,
          chatId: msg.chatId
        }
      } as Message
    })
  }

  /**
   * Clean up Teams-specific HTML content
   */
  private cleanTeamsContent(content: string): string {
    return content
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<p>/g, '\n')
      .replace(/<\/p>/g, '')
      .replace(/<[^>]*>/g, '') // Remove all remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// Singleton instance
export const teamsAPI = new TeamsAPI()