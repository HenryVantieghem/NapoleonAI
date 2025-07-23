import { google, gmail_v1 } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { supabase } from '@/lib/supabase/client'
import { Message } from '@/types/ai'

export class GmailAPI {
  private oauth2Client: OAuth2Client
  private gmail: gmail_v1.Gmail

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }

  /**
   * Get user's Gmail messages
   */
  async getMessages(
    userId: string,
    options: {
      maxResults?: number
      pageToken?: string
      labelIds?: string[]
      q?: string // Gmail search query
      includeSpamTrash?: boolean
    } = {}
  ): Promise<{
    messages: Message[]
    nextPageToken?: string
    resultSizeEstimate: number
  }> {
    try {
      const {
        maxResults = 50,
        pageToken,
        labelIds = ['INBOX'],
        q,
        includeSpamTrash = false
      } = options

      // List messages
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        pageToken,
        labelIds,
        q,
        includeSpamTrash
      })

      const messageIds = listResponse.data.messages || []
      const messages: Message[] = []

      // Fetch message details in batches
      const batchSize = 10
      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize)
        const batchMessages = await Promise.all(
          batch.map(msg => this.getMessageDetails(msg.id!))
        )
        messages.push(...batchMessages.filter(Boolean) as Message[])
      }

      return {
        messages,
        nextPageToken: listResponse.data.nextPageToken,
        resultSizeEstimate: listResponse.data.resultSizeEstimate || 0
      }
    } catch (error) {
      throw new Error(`Failed to get Gmail messages: ${(error as Error).message}`)
    }
  }

  /**
   * Get detailed message information
   */
  async getMessageDetails(messageId: string): Promise<Message | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      })

      const message = response.data
      if (!message) return null

      const headers = message.payload?.headers || []
      const subject = this.getHeader(headers, 'Subject') || 'No Subject'
      const from = this.getHeader(headers, 'From') || 'Unknown Sender'
      const to = this.getHeader(headers, 'To') || ''
      const date = this.getHeader(headers, 'Date') || ''
      const messageId_header = this.getHeader(headers, 'Message-ID') || messageId

      // Extract sender information
      const senderMatch = from.match(/^(.+?)\s*<(.+?)>$/) || from.match(/^(.+)$/)
      const senderName = senderMatch ? senderMatch[1]?.replace(/"/g, '').trim() : from
      const senderEmail = senderMatch && senderMatch[2] ? senderMatch[2].trim() : from

      // Get message body
      const body = this.extractMessageBody(message.payload!)

      // Check if message is read
      const labelIds = message.labelIds || []
      const isRead = !labelIds.includes('UNREAD')

      // Count attachments
      const attachmentCount = this.countAttachments(message.payload!)

      return {
        id: messageId,
        subject,
        content: body,
        sender: senderName,
        senderEmail,
        channel: 'gmail',
        timestamp: date ? new Date(date) : new Date(),
        isRead,
        threadId: message.threadId,
        hasAttachments: attachmentCount > 0,
        attachmentCount,
        externalId: messageId,
        externalThreadId: message.threadId,
        metadata: {
          gmailLabels: labelIds,
          snippet: message.snippet,
          internalDate: message.internalDate,
          sizeEstimate: message.sizeEstimate
        }
      } as Message
    } catch (error) {
      console.error(`Failed to get message details for ${messageId}:`, error)
      return null
    }
  }

  /**
   * Send reply to a message
   */
  async sendReply(
    messageId: string,
    threadId: string,
    content: string,
    subject?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get original message to extract reply information
      const originalMessage = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      })

      const headers = originalMessage.data.payload?.headers || []
      const originalFrom = this.getHeader(headers, 'From') || ''
      const originalSubject = this.getHeader(headers, 'Subject') || ''
      const originalMessageId = this.getHeader(headers, 'Message-ID') || ''

      // Create reply headers
      const replySubject = subject || `Re: ${originalSubject.replace(/^Re:\s*/i, '')}`
      
      const emailContent = [
        `To: ${originalFrom}`,
        `Subject: ${replySubject}`,
        `In-Reply-To: ${originalMessageId}`,
        `References: ${originalMessageId}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        content
      ].join('\n')

      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: threadId
        }
      })

      return {
        success: true,
        messageId: response.data.id
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Mark message as read/unread
   */
  async markAsRead(messageId: string, read: boolean = true): Promise<boolean> {
    try {
      if (read) {
        await this.gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: ['UNREAD']
          }
        })
      } else {
        await this.gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: ['UNREAD']
          }
        })
      }
      return true
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      return false
    }
  }

  /**
   * Archive message
   */
  async archiveMessage(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['INBOX']
        }
      })
      return true
    } catch (error) {
      console.error('Failed to archive message:', error)
      return false
    }
  }

  /**
   * Get user's Gmail profile
   */
  async getProfile(): Promise<{
    emailAddress: string
    messagesTotal: number
    threadsTotal: number
    historyId: string
  } | null> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me'
      })

      return {
        emailAddress: response.data.emailAddress || '',
        messagesTotal: response.data.messagesTotal || 0,
        threadsTotal: response.data.threadsTotal || 0,
        historyId: response.data.historyId || ''
      }
    } catch (error) {
      console.error('Failed to get Gmail profile:', error)
      return null
    }
  }

  /**
   * Set up Gmail push notifications (webhooks)
   */
  async setupPushNotifications(topicName: string): Promise<{
    success: boolean
    historyId?: string
    expiration?: string
    error?: string
  }> {
    try {
      const response = await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName,
          labelIds: ['INBOX']
        }
      })

      return {
        success: true,
        historyId: response.data.historyId,
        expiration: response.data.expiration
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Get message history since a specific historyId
   */
  async getHistory(startHistoryId: string): Promise<{
    messages: Message[]
    nextPageToken?: string
    historyId: string
  }> {
    try {
      const response = await this.gmail.users.history.list({
        userId: 'me',
        startHistoryId,
        historyTypes: ['messageAdded', 'messageDeleted', 'labelAdded', 'labelRemoved']
      })

      const history = response.data.history || []
      const messageIds = new Set<string>()

      // Collect unique message IDs from history
      history.forEach(record => {
        record.messagesAdded?.forEach(msg => messageIds.add(msg.message!.id!))
        record.messagesDeleted?.forEach(msg => messageIds.add(msg.message!.id!))
        record.labelsAdded?.forEach(msg => messageIds.add(msg.message!.id!))
        record.labelsRemoved?.forEach(msg => messageIds.add(msg.message!.id!))
      })

      // Fetch detailed message information
      const messages = await Promise.all(
        Array.from(messageIds).map(id => this.getMessageDetails(id))
      )

      return {
        messages: messages.filter(Boolean) as Message[],
        nextPageToken: response.data.nextPageToken,
        historyId: response.data.historyId || startHistoryId
      }
    } catch (error) {
      throw new Error(`Failed to get Gmail history: ${(error as Error).message}`)
    }
  }

  /**
   * Search messages with Gmail query syntax
   */
  async searchMessages(query: string, maxResults: number = 50): Promise<Message[]> {
    try {
      const result = await this.getMessages('me', {
        q: query,
        maxResults
      })
      return result.messages
    } catch (error) {
      throw new Error(`Failed to search Gmail messages: ${(error as Error).message}`)
    }
  }

  /**
   * Helper methods
   */
  private getHeader(headers: gmail_v1.Schema$MessagePartHeader[], name: string): string | null {
    const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase())
    return header?.value || null
  }

  private extractMessageBody(payload: gmail_v1.Schema$MessagePart): string {
    let body = ''

    if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body?.data) {
            body += Buffer.from(part.body.data, 'base64').toString('utf-8')
          }
        } else if (part.parts) {
          body += this.extractMessageBody(part)
        }
      }
    }

    // Clean up HTML if present
    if (body.includes('<')) {
      body = body
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
    }

    return body
  }

  private countAttachments(payload: gmail_v1.Schema$MessagePart): number {
    let count = 0

    if (payload.filename && payload.filename.length > 0 && payload.body?.attachmentId) {
      count++
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        count += this.countAttachments(part)
      }
    }

    return count
  }
}

// Singleton instance
export const gmailAPI = new GmailAPI()