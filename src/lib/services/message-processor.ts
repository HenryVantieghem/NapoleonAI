import { aiService } from '@/lib/ai/ai-service'
import { createClient } from '@/lib/supabase/server'

export interface ProcessingOptions {
  batchSize?: number
  priorityThreshold?: number
  skipExisting?: boolean
  maxRetries?: number
}

export interface ProcessingResult {
  processed: number
  failed: number
  skipped: number
  results: Array<{
    messageId: string
    success: boolean
    error?: string
    analysis?: any
  }>
  duration: number
}

export class MessageProcessor {
  private static instance: MessageProcessor
  private processingQueue = new Set<string>()
  private rateLimitWindow = new Map<string, number[]>()

  static getInstance(): MessageProcessor {
    if (!MessageProcessor.instance) {
      MessageProcessor.instance = new MessageProcessor()
    }
    return MessageProcessor.instance
  }

  /**
   * Process pending messages for a user
   */
  async processUserMessages(
    userId: string, 
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now()
    const {
      batchSize = 10,
      priorityThreshold = 50,
      skipExisting = true,
      maxRetries = 3
    } = options

    // Check rate limiting (max 100 messages per hour per user)
    if (!this.checkRateLimit(userId, batchSize)) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    const supabase = createClient()
    const results: ProcessingResult['results'] = []
    let processed = 0
    let failed = 0
    let skipped = 0

    try {
      // Get messages to process
      const query = supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(batchSize)

      if (skipExisting) {
        query.is('ai_summary', null)
      }

      const { data: messages, error } = await query

      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`)
      }

      if (!messages || messages.length === 0) {
        return {
          processed: 0,
          failed: 0,
          skipped: 0,
          results: [],
          duration: Date.now() - startTime
        }
      }

      console.log(`Processing ${messages.length} messages for user ${userId}`)

      // Process messages in chunks to respect API limits
      const chunkSize = 3
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize)
        
        // Process chunk in parallel
        const chunkResults = await Promise.allSettled(
          chunk.map(message => this.processMessage(message, userId, maxRetries))
        )

        // Collect results
        chunkResults.forEach((result, index) => {
          const message = chunk[index]
          
          if (result.status === 'fulfilled') {
            results.push({
              messageId: message.id,
              success: true,
              analysis: result.value
            })
            processed++
          } else {
            results.push({
              messageId: message.id,
              success: false,
              error: result.reason?.message || 'Processing failed'
            })
            failed++
          }
        })

        // Small delay between chunks
        if (i + chunkSize < messages.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      console.log(`Batch processing complete: ${processed} successful, ${failed} failed`)

    } catch (error) {
      console.error('Batch processing error:', error)
      throw error
    }

    return {
      processed,
      failed,
      skipped,
      results,
      duration: Date.now() - startTime
    }
  }

  /**
   * Process a single message with retry logic
   */
  private async processMessage(
    message: any, 
    userId: string, 
    maxRetries: number = 3
  ): Promise<any> {
    const messageId = message.id

    // Skip if already processing
    if (this.processingQueue.has(messageId)) {
      throw new Error('Message already being processed')
    }

    this.processingQueue.add(messageId)

    try {
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Processing message ${messageId} (attempt ${attempt})`)

          // Process with AI
          const analysis = await aiService.processMessage(message, userId)
          
          // Save results
          await aiService.saveMessageAnalysis(messageId, analysis, userId)

          // Broadcast real-time update
          await this.broadcastUpdate(messageId, userId, analysis)

          return analysis
        } catch (error) {
          lastError = error as Error
          console.error(`Processing attempt ${attempt} failed for ${messageId}:`, error)

          // Exponential backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      throw lastError || new Error('Processing failed after all retries')
    } finally {
      this.processingQueue.delete(messageId)
    }
  }

  /**
   * Broadcast real-time update via Supabase
   */
  private async broadcastUpdate(messageId: string, userId: string, analysis: any) {
    try {
      const supabase = createClient()
      
      await supabase
        .channel('message_updates')
        .send({
          type: 'broadcast',
          event: 'message_processed',
          payload: {
            messageId,
            userId,
            summary: analysis.summary,
            priorityScore: analysis.priority.score,
            isVip: analysis.priority.isVip,
            actionItemsCount: analysis.actionItems.length,
            timestamp: new Date().toISOString()
          }
        })
    } catch (error) {
      console.error('Failed to broadcast update:', error)
      // Non-critical error, don't throw
    }
  }

  /**
   * Check rate limiting for user
   */
  private checkRateLimit(userId: string, requestCount: number): boolean {
    const now = Date.now()
    const windowMs = 60 * 60 * 1000 // 1 hour
    const maxRequests = 100

    // Get user's request history
    const userRequests = this.rateLimitWindow.get(userId) || []
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => 
      now - timestamp < windowMs
    )

    // Check if adding this request would exceed limit
    if (recentRequests.length + requestCount > maxRequests) {
      return false
    }

    // Add current request timestamps
    const newTimestamps = Array(requestCount).fill(now)
    recentRequests.push(...newTimestamps)
    
    this.rateLimitWindow.set(userId, recentRequests)
    return true
  }

  /**
   * Get processing statistics for a user
   */
  async getProcessingStats(userId: string): Promise<{
    totalMessages: number
    processedMessages: number
    pendingMessages: number
    avgProcessingTime: number
    lastProcessed: string | null
  }> {
    const supabase = createClient()

    const { data: stats } = await supabase
      .from('messages')
      .select('ai_summary, updated_at, created_at')
      .eq('user_id', userId)

    if (!stats) {
      return {
        totalMessages: 0,
        processedMessages: 0,
        pendingMessages: 0,
        avgProcessingTime: 0,
        lastProcessed: null
      }
    }

    const processedMessages = stats.filter(m => m.ai_summary).length
    const lastProcessed = processedMessages > 0 
      ? stats
          .filter(m => m.ai_summary)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          [0]?.updated_at || null
      : null

    return {
      totalMessages: stats.length,
      processedMessages,
      pendingMessages: stats.length - processedMessages,
      avgProcessingTime: 500, // Placeholder - would calculate from logs
      lastProcessed
    }
  }

  /**
   * Cleanup old rate limit data
   */
  private cleanup() {
    const now = Date.now()
    const windowMs = 60 * 60 * 1000 // 1 hour

    for (const [userId, requests] of this.rateLimitWindow.entries()) {
      const recentRequests = requests.filter(timestamp => 
        now - timestamp < windowMs
      )
      
      if (recentRequests.length === 0) {
        this.rateLimitWindow.delete(userId)
      } else {
        this.rateLimitWindow.set(userId, recentRequests)
      }
    }
  }
}

// Export singleton instance
export const messageProcessor = MessageProcessor.getInstance()

// Cleanup every hour
setInterval(() => {
  messageProcessor['cleanup']()
}, 60 * 60 * 1000)