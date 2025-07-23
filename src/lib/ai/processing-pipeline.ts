import { messageAnalyzer } from './message-analyzer'
import { supabase } from '@/lib/supabase/client'
import { 
  Message, 
  ProcessingJob, 
  ProcessingJobType, 
  JobStatus, 
  AnalysisResult,
  ActionItem,
  ExecutiveSummary,
  CommunicationInsights
} from '@/types/ai'
import { AIError, RATE_LIMIT_CONFIG } from './openai-client'

export class AIProcessingPipeline {
  private jobQueue: Map<string, ProcessingJob> = new Map()
  private rateLimitTracker: Map<string, number[]> = new Map()
  private isProcessing = false

  /**
   * Process a new message through the AI pipeline
   */
  async processMessage(message: Message): Promise<void> {
    try {
      // Create processing jobs for the message
      const jobs: ProcessingJob[] = [
        this.createJob('analysis', message.id, 'high'),
        this.createJob('summarization', message.id, 'high'),
        this.createJob('action-extraction', message.id, 'medium'),
      ]

      // Queue jobs for processing
      for (const job of jobs) {
        this.jobQueue.set(job.id, job)
        await this.saveJob(job)
      }

      // Start processing if not already running
      if (!this.isProcessing) {
        this.startProcessing()
      }
    } catch (error) {
      throw new AIError(
        'Failed to queue message for processing',
        'PIPELINE_ERROR',
        error as Error
      )
    }
  }

  /**
   * Process multiple messages in batch
   */
  async batchProcessMessages(messages: Message[]): Promise<void> {
    const batchJobs: ProcessingJob[] = []

    for (const message of messages) {
      batchJobs.push(
        this.createJob('analysis', message.id, 'medium'),
        this.createJob('summarization', message.id, 'medium'),
        this.createJob('action-extraction', message.id, 'low')
      )
    }

    // Add insight generation job for the batch
    if (messages.length > 0) {
      batchJobs.push(
        this.createJob('insight-generation', 'batch-' + Date.now(), 'low')
      )
    }

    // Queue all jobs
    for (const job of batchJobs) {
      this.jobQueue.set(job.id, job)
      await this.saveJob(job)
    }

    if (!this.isProcessing) {
      this.startProcessing()
    }
  }

  /**
   * Get processing status for a message
   */
  async getProcessingStatus(messageId: string): Promise<{
    analysis?: JobStatus
    summarization?: JobStatus
    actionExtraction?: JobStatus
    overall: JobStatus
  }> {
    try {
      const { data: jobs } = await supabase
        .from('ai_processing_jobs')
        .select('type, status')
        .eq('message_id', messageId)

      const statusMap = jobs?.reduce((acc, job) => {
        acc[job.type.replace('-', '')] = job.status
        return acc
      }, {} as Record<string, JobStatus>) || {}

      const allStatuses = Object.values(statusMap)
      const overall: JobStatus = 
        allStatuses.every(s => s === 'completed') ? 'completed' :
        allStatuses.some(s => s === 'failed') ? 'failed' :
        allStatuses.some(s => s === 'processing') ? 'processing' :
        'pending'

      return {
        analysis: statusMap.analysis,
        summarization: statusMap.summarization,
        actionExtraction: statusMap.actionextraction,
        overall
      }
    } catch (error) {
      throw new AIError(
        'Failed to get processing status',
        'STATUS_ERROR',
        error as Error
      )
    }
  }

  /**
   * Start the processing worker
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      while (this.jobQueue.size > 0) {
        // Check rate limits
        if (!this.canMakeRequest()) {
          await this.delay(1000) // Wait 1 second
          continue
        }

        // Get highest priority job
        const job = this.getNextJob()
        if (!job) break

        await this.processJob(job)
        this.jobQueue.delete(job.id)
      }
    } catch (error) {
      console.error('Processing pipeline error:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: ProcessingJob): Promise<void> {
    try {
      // Update job status to processing
      job.status = 'processing'
      job.startedAt = new Date()
      await this.updateJob(job)

      // Get message data
      const message = await this.getMessage(job.messageId)
      if (!message) {
        throw new Error(`Message ${job.messageId} not found`)
      }

      let result: any

      // Process based on job type
      switch (job.type) {
        case 'analysis':
          result = await messageAnalyzer.analyzeMessage(message)
          await this.saveAnalysisResult(result)
          break

        case 'summarization':
          result = await messageAnalyzer.generateExecutiveSummary(message)
          await this.saveExecutiveSummary(job.messageId, result)
          break

        case 'action-extraction':
          result = await messageAnalyzer.extractActionItems(message)
          await this.saveActionItems(job.messageId, result)
          break

        case 'insight-generation':
          const recentMessages = await this.getRecentMessages(20)
          result = await messageAnalyzer.generateInsights(recentMessages)
          await this.saveInsights(result)
          break

        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }

      // Mark job as completed
      job.status = 'completed'
      job.completedAt = new Date()
      job.result = result
      await this.updateJob(job)

      // Track rate limit
      this.trackRequest()

    } catch (error) {
      // Handle job failure
      job.status = 'failed'
      job.error = (error as Error).message
      job.retryCount += 1

      await this.updateJob(job)

      // Retry if within limits
      if (job.retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        setTimeout(() => {
          job.status = 'pending'
          this.jobQueue.set(job.id, job)
        }, RATE_LIMIT_CONFIG.retryDelay * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, job.retryCount))
      }

      throw new AIError(
        `Job ${job.id} failed: ${(error as Error).message}`,
        'JOB_FAILED',
        error as Error
      )
    }
  }

  /**
   * Create a new processing job
   */
  private createJob(
    type: ProcessingJobType, 
    messageId: string, 
    priority: 'high' | 'medium' | 'low'
  ): ProcessingJob {
    return {
      id: `${type}-${messageId}-${Date.now()}`,
      type,
      messageId,
      status: 'pending',
      priority: priority as any,
      createdAt: new Date(),
      retryCount: 0
    }
  }

  /**
   * Get the next highest priority job
   */
  private getNextJob(): ProcessingJob | null {
    const jobs = Array.from(this.jobQueue.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority as keyof typeof priorityOrder] - 
               priorityOrder[a.priority as keyof typeof priorityOrder]
      })

    return jobs[0] || null
  }

  /**
   * Check if we can make a request within rate limits
   */
  private canMakeRequest(): boolean {
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_CONFIG.rateLimitWindow
    
    // Clean old requests
    const currentRequests = this.rateLimitTracker.get('requests') || []
    const recentRequests = currentRequests.filter(time => time > windowStart)
    this.rateLimitTracker.set('requests', recentRequests)

    return recentRequests.length < RATE_LIMIT_CONFIG.maxRequestsPerWindow
  }

  /**
   * Track a request for rate limiting
   */
  private trackRequest(): void {
    const currentRequests = this.rateLimitTracker.get('requests') || []
    currentRequests.push(Date.now())
    this.rateLimitTracker.set('requests', currentRequests)
  }

  /**
   * Database operations
   */
  private async saveJob(job: ProcessingJob): Promise<void> {
    await supabase.from('ai_processing_jobs').insert({
      id: job.id,
      type: job.type,
      message_id: job.messageId,
      status: job.status,
      priority: job.priority,
      created_at: job.createdAt.toISOString(),
      retry_count: job.retryCount
    })
  }

  private async updateJob(job: ProcessingJob): Promise<void> {
    await supabase.from('ai_processing_jobs').update({
      status: job.status,
      started_at: job.startedAt?.toISOString(),
      completed_at: job.completedAt?.toISOString(),
      error: job.error,
      result: job.result,
      retry_count: job.retryCount
    }).eq('id', job.id)
  }

  private async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    await supabase.from('message_analysis').insert({
      message_id: result.messageId,
      priority: result.priority,
      urgency: result.urgency,
      business_impact: result.businessImpact,
      sentiment: result.sentiment,
      topics: result.topics,
      action_required: result.actionRequired,
      decision_required: result.decisionRequired,
      financial_impact: result.financialImpact,
      stakeholder_level: result.stakeholderLevel,
      time_to_decision: result.timeToDecision,
      risk_level: result.riskLevel,
      confidence: result.confidence,
      reasoning: result.reasoning,
      suggested_actions: result.suggestedActions,
      created_at: result.createdAt.toISOString()
    })
  }

  private async saveExecutiveSummary(messageId: string, summary: string): Promise<void> {
    await supabase.from('executive_summaries').insert({
      message_id: messageId,
      summary,
      created_at: new Date().toISOString()
    })
  }

  private async saveActionItems(messageId: string, actionItems: any[]): Promise<void> {
    if (actionItems.length === 0) return

    const items = actionItems.map(item => ({
      message_id: messageId,
      title: item.title,
      description: item.description,
      priority: item.priority,
      category: item.category || 'general',
      due_date: item.dueDate,
      assigned_to: item.assignedTo,
      status: 'pending',
      created_at: new Date().toISOString()
    }))

    await supabase.from('action_items').insert(items)
  }

  private async saveInsights(insights: CommunicationInsights): Promise<void> {
    await supabase.from('communication_insights').insert({
      patterns: insights.patterns,
      recommendations: insights.recommendations,
      trends: insights.trends,
      delegation_opportunities: insights.delegationOpportunities,
      generated_at: new Date().toISOString()
    })
  }

  private async getMessage(messageId: string): Promise<Message | null> {
    // This would typically fetch from your message store
    // For now, return a mock message structure
    return {
      id: messageId,
      subject: 'Mock Subject',
      content: 'Mock content for processing',
      sender: 'Mock Sender',
      channel: 'gmail',
      timestamp: new Date()
    } as Message
  }

  private async getRecentMessages(limit: number): Promise<Message[]> {
    // This would fetch recent messages from your store
    // Return empty array for now
    return []
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
export const aiProcessingPipeline = new AIProcessingPipeline()