import { supabase } from '@/lib/supabase/client'
import { openai } from './openai-client'
import { promises as fs } from 'fs'
import path from 'path'
import type { Message, ActionItem, VipContact } from '@/types/database'

export interface AIProcessingMetrics {
  totalMessages: number
  successfulProcessing: number
  failedProcessing: number
  avgProcessingTime: number
  totalTokensUsed: number
  totalCost: number
  vipBoosts: number
  fallbackUsage: number
  timestamp: string
}

export interface EnhancedAnalysisResult {
  executiveSummary: {
    summary: string
    keyPoints: string[]
    businessImpact: 'low' | 'medium' | 'high' | 'critical'
    decisionRequired: boolean
    estimatedResponseTime: string
    stakeholderLevel: string
    strategicCategory: string
  }
  priorityAnalysis: {
    score: number
    tier: 'critical' | 'high' | 'medium' | 'low' | 'minimal'
    reasoning: string
    urgencyIndicators: string[]
    strategicWeight: number
    vipBoost: number
    finalScore: number
    recommendedResponseTime: string
    escalationRequired: boolean
    competitiveSensitivity: string
  }
  actionItems: ActionItemExtracted[]
  meetingRequests: MeetingRequest[]
  decisionsRequired: DecisionRequired[]
  communicationsNeeded: CommunicationNeeded[]
  processingMetrics: {
    processingTime: number
    tokensUsed: number
    cost: number
    model: string
    promptVersion: string
  }
}

export interface ActionItemExtracted {
  title: string
  description: string
  category: 'strategic' | 'relationship' | 'operational' | 'market' | 'administrative'
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedDuration: string
  delegationPossible: boolean
  suggestedDelegate?: string
  dueDate?: string
  dueTime?: string
  dependencies: string[]
  stakeholders: string[]
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
  calendarBlockingNeeded: boolean
  prepMaterialsNeeded: string[]
  followUpRequired: boolean
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface MeetingRequest {
  type: 'in_person' | 'video_call' | 'phone_call'
  duration: string
  attendees: string[]
  suggestedAgenda: string[]
  preparationNeeded: string[]
  urgency: string
}

export interface DecisionRequired {
  decisionTopic: string
  options: string[]
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  deadline?: string
  additionalInfoNeeded: string[]
  stakeholderInputRequired: string[]
}

export interface CommunicationNeeded {
  type: 'email' | 'call' | 'meeting' | 'presentation'
  recipient: string
  purpose: string
  urgency: string
  talkingPoints: string[]
}

export interface BatchProcessingQueue {
  id: string
  userId: string
  messageIds: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  processedAt?: string
  error?: string
}

export class EnhancedAIService {
  private batchSize = 10 // Process 10 messages per batch
  private maxBatchesPerHour = 12 // Rate limiting: 12 batches per hour
  private rateLimitTracker = new Map<string, number[]>()
  private promptCache = new Map<string, string>()

  /**
   * Load prompt template with variable substitution
   */
  private async loadPromptTemplate(templateName: string, variables: Record<string, any>): Promise<string> {
    const cacheKey = `${templateName}_${JSON.stringify(variables)}`
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!
    }

    try {
      const templatePath = path.join(process.cwd(), 'src', 'prompts', `${templateName}.txt`)
      let template = await fs.readFile(templatePath, 'utf-8')

      // Replace variables in template
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        template = template.replace(regex, String(value))
      }

      this.promptCache.set(cacheKey, template)
      return template
    } catch (error) {
      console.error(`Error loading prompt template ${templateName}:`, error)
      throw new Error(`Failed to load prompt template: ${templateName}`)
    }
  }

  /**
   * Check rate limiting for user
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const hourAgo = now - (60 * 60 * 1000)
    
    if (!this.rateLimitTracker.has(userId)) {
      this.rateLimitTracker.set(userId, [])
    }

    const userRequests = this.rateLimitTracker.get(userId)!
    // Remove requests older than 1 hour
    const recentRequests = userRequests.filter(timestamp => timestamp > hourAgo)
    this.rateLimitTracker.set(userId, recentRequests)

    return recentRequests.length < this.maxBatchesPerHour
  }

  /**
   * Record batch processing request for rate limiting
   */
  private recordBatchRequest(userId: string): void {
    const now = Date.now()
    if (!this.rateLimitTracker.has(userId)) {
      this.rateLimitTracker.set(userId, [])
    }
    this.rateLimitTracker.get(userId)!.push(now)
  }

  /**
   * Get VIP contacts with enhanced relationship data
   */
  private async getVipContacts(userId: string): Promise<VipContact[]> {
    const { data: vipContacts } = await supabase
      .from('vip_contacts')
      .select('*')
      .eq('user_id', userId)

    return vipContacts || []
  }

  /**
   * Enhanced VIP detection with relationship intelligence
   */
  private analyzeVipStatus(senderEmail: string, vipContacts: VipContact[]): {
    isVip: boolean
    boost: number
    relationship: string
    isBoardMember: boolean
    isInvestor: boolean
  } {
    const vip = vipContacts.find(contact => 
      contact.email.toLowerCase() === senderEmail.toLowerCase()
    )
    
    if (vip) {
      let boost = 0
      let relationship = 'vip'
      let isBoardMember = false
      let isInvestor = false

      // Enhanced VIP boost calculation
      switch (vip.priority_level) {
        case 10:
          boost = 25 // CEO, Board Chair, Major Investor
          break
        case 9:
          boost = 20 // Board Member, Key Investor
          isBoardMember = vip.notes?.toLowerCase().includes('board') || false
          isInvestor = vip.notes?.toLowerCase().includes('investor') || false
          break
        case 8:
          boost = 18 // Senior Executive, Strategic Partner
          break
        case 7:
          boost = 15 // Key Client, Important Vendor
          break
        case 6:
          boost = 12 // Regular Client, Team Member
          break
        default:
          boost = 10 // Standard VIP
      }

      relationship = vip.relationship_type || 'vip'
      
      return { 
        isVip: true, 
        boost, 
        relationship,
        isBoardMember,
        isInvestor
      }
    }
    
    return { 
      isVip: false, 
      boost: 0, 
      relationship: 'standard',
      isBoardMember: false,
      isInvestor: false
    }
  }

  /**
   * Process single message with enhanced AI analysis
   */
  async processMessage(message: Message, userId: string): Promise<EnhancedAnalysisResult> {
    const startTime = Date.now()
    let totalTokens = 0
    let totalCost = 0

    try {
      // Get VIP status
      const vipContacts = await this.getVipContacts(userId)
      const vipStatus = this.analyzeVipStatus(message.sender_email, vipContacts)

      // Prepare variables for prompt templates
      const messageVars = {
        sender_name: message.sender_name || 'Unknown',
        sender_email: message.sender_email,
        subject: message.subject || 'No Subject',
        content: message.content,
        received_date: message.message_date,
        is_vip_contact: vipStatus.isVip,
        is_board_member: vipStatus.isBoardMember,
        is_investor: vipStatus.isInvestor,
        priority_score: 0 // Will be updated after priority analysis
      }

      // Run parallel AI analysis
      const [executiveSummaryPromise, priorityAnalysisPromise] = await Promise.all([
        this.analyzeExecutiveSummary(messageVars),
        this.analyzePriority(messageVars)
      ])

      const [executiveSummary, priorityAnalysis] = await Promise.all([
        executiveSummaryPromise,
        priorityAnalysisPromise
      ])

      // Update priority score for action extraction
      messageVars.priority_score = priorityAnalysis.finalScore

      // Extract actions with priority context
      const actionExtraction = await this.extractActions(messageVars)

      // Calculate metrics
      const processingTime = Date.now() - startTime
      totalTokens = executiveSummary.tokensUsed + priorityAnalysis.tokensUsed + actionExtraction.tokensUsed
      totalCost = totalTokens * 0.00003 // Approximate GPT-4 cost per token

      // Log processing metrics
      await this.logProcessingMetrics(userId, message.id, {
        processingTime,
        tokensUsed: totalTokens,
        cost: totalCost,
        success: true,
        vipBoost: vipStatus.boost
      })

      return {
        executiveSummary: executiveSummary.result,
        priorityAnalysis: {
          ...priorityAnalysis.result,
          vipBoost: vipStatus.boost
        },
        actionItems: actionExtraction.result.action_items || [],
        meetingRequests: actionExtraction.result.meeting_requests || [],
        decisionsRequired: actionExtraction.result.decisions_required || [],
        communicationsNeeded: actionExtraction.result.communications_needed || [],
        processingMetrics: {
          processingTime,
          tokensUsed: totalTokens,
          cost: totalCost,
          model: 'gpt-4',
          promptVersion: '1.0'
        }
      }

    } catch (error) {
      console.error('Enhanced AI processing failed:', error)
      
      // Log failure metrics
      await this.logProcessingMetrics(userId, message.id, {
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      // Fallback to simplified analysis
      return this.getFallbackAnalysis(message, vipContacts)
    }
  }

  /**
   * Executive summary analysis
   */
  private async analyzeExecutiveSummary(variables: any): Promise<{result: any, tokensUsed: number}> {
    const prompt = await this.loadPromptTemplate('executive-summary', variables)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      result,
      tokensUsed: response.usage?.total_tokens || 0
    }
  }

  /**
   * Priority analysis
   */
  private async analyzePriority(variables: any): Promise<{result: any, tokensUsed: number}> {
    const prompt = await this.loadPromptTemplate('priority-analysis', variables)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 600
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      result,
      tokensUsed: response.usage?.total_tokens || 0
    }
  }

  /**
   * Action extraction analysis
   */
  private async extractActions(variables: any): Promise<{result: any, tokensUsed: number}> {
    const prompt = await this.loadPromptTemplate('action-extraction', variables)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1200
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      result,
      tokensUsed: response.usage?.total_tokens || 0
    }
  }

  /**
   * Batch process messages with rate limiting
   */
  async processBatch(userId: string, messageIds: string[]): Promise<{
    processed: number
    failed: number
    rateLimited: boolean
    batchId?: string
  }> {
    // Check rate limiting
    if (!this.checkRateLimit(userId)) {
      return {
        processed: 0,
        failed: 0,
        rateLimited: true
      }
    }

    // Create batch record
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const batch: BatchProcessingQueue = {
      id: batchId,
      userId,
      messageIds: messageIds.slice(0, this.batchSize), // Limit batch size
      status: 'processing',
      createdAt: new Date().toISOString()
    }

    // Record rate limit usage
    this.recordBatchRequest(userId)

    let processed = 0
    let failed = 0

    for (const messageId of batch.messageIds) {
      try {
        // Get message
        const { data: message } = await supabase
          .from('messages')
          .select('*')
          .eq('id', messageId)
          .eq('user_id', userId)
          .single()

        if (message) {
          const analysis = await this.processMessage(message, userId)
          await this.saveEnhancedAnalysis(messageId, analysis, userId)
          processed++
        }
      } catch (error) {
        console.error(`Failed to process message ${messageId}:`, error)
        failed++
      }
    }

    // Update batch status
    batch.status = failed === 0 ? 'completed' : 'failed'
    batch.processedAt = new Date().toISOString()

    return {
      processed,
      failed,
      rateLimited: false,
      batchId
    }
  }

  /**
   * Save enhanced analysis results to database
   */
  async saveEnhancedAnalysis(messageId: string, analysis: EnhancedAnalysisResult, userId: string): Promise<void> {
    try {
      // Update message with enhanced analysis
      await supabase
        .from('messages')
        .update({
          priority_score: analysis.priorityAnalysis.finalScore,
          ai_summary: analysis.executiveSummary.summary,
          sentiment: analysis.priorityAnalysis.tier === 'critical' ? 'urgent' : 'neutral',
          is_vip: analysis.priorityAnalysis.vipBoost > 0,
          ai_analysis_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)

      // Save enhanced action items
      if (analysis.actionItems.length > 0) {
        const actionItemsToInsert = analysis.actionItems.map(item => ({
          message_id: messageId,
          user_id: userId,
          title: item.title,
          description: item.description,
          priority: item.priority,
          category: item.category,
          estimated_duration: item.estimatedDuration,
          due_date: item.dueDate ? new Date(item.dueDate).toISOString() : null,
          stakeholders: JSON.stringify(item.stakeholders),
          business_impact: item.businessImpact,
          confidentiality_level: item.confidentialityLevel,
          status: 'pending' as const
        }))

        await supabase
          .from('action_items')
          .upsert(actionItemsToInsert)
      }

    } catch (error) {
      console.error('Error saving enhanced analysis:', error)
    }
  }

  /**
   * Log processing metrics for monitoring
   */
  private async logProcessingMetrics(userId: string, messageId: string, metrics: any): Promise<void> {
    try {
      await supabase
        .from('ai_processing_logs')
        .insert({
          user_id: userId,
          message_id: messageId,
          processing_time_ms: metrics.processingTime,
          tokens_used: metrics.tokensUsed,
          cost_usd: metrics.cost,
          success: metrics.success,
          error_message: metrics.error || null,
          vip_boost_applied: metrics.vipBoost || 0,
          model_version: 'gpt-4',
          prompt_version: '1.0',
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging AI metrics:', error)
    }
  }

  /**
   * Get comprehensive AI metrics for admin dashboard
   */
  async getAIMetrics(userId: string, dateRange: { start: string, end: string }): Promise<AIProcessingMetrics> {
    try {
      const { data: logs } = await supabase
        .from('ai_processing_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (!logs || logs.length === 0) {
        return {
          totalMessages: 0,
          successfulProcessing: 0,
          failedProcessing: 0,
          avgProcessingTime: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          vipBoosts: 0,
          fallbackUsage: 0,
          timestamp: new Date().toISOString()
        }
      }

      const successful = logs.filter(log => log.success)
      const failed = logs.filter(log => !log.success)
      const avgProcessingTime = successful.reduce((sum, log) => sum + log.processing_time_ms, 0) / successful.length
      const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0)
      const totalCost = logs.reduce((sum, log) => sum + (log.cost_usd || 0), 0)
      const vipBoosts = logs.filter(log => log.vip_boost_applied > 0).length

      return {
        totalMessages: logs.length,
        successfulProcessing: successful.length,
        failedProcessing: failed.length,
        avgProcessingTime: Math.round(avgProcessingTime),
        totalTokensUsed: totalTokens,
        totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
        vipBoosts,
        fallbackUsage: failed.length, // Failures typically trigger fallback
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting AI metrics:', error)
      throw error
    }
  }

  /**
   * Enhanced fallback analysis with VIP awareness
   */
  private getFallbackAnalysis(message: Message, vipContacts: VipContact[]): EnhancedAnalysisResult {
    const vipStatus = this.analyzeVipStatus(message.sender_email, vipContacts)
    const content = (message.content + ' ' + (message.subject || '')).toLowerCase()
    
    let baseScore = 30
    const urgencyIndicators: string[] = []

    // Enhanced keyword detection
    if (content.includes('urgent') || content.includes('asap') || content.includes('immediately')) {
      baseScore += 40
      urgencyIndicators.push('Urgency keywords detected')
    }
    
    if (content.includes('board') || content.includes('investor') || content.includes('regulatory')) {
      baseScore += 35
      urgencyIndicators.push('High-level stakeholder communication')
    }
    
    if (content.includes('crisis') || content.includes('breach') || content.includes('lawsuit')) {
      baseScore += 45
      urgencyIndicators.push('Crisis-related keywords')
    }

    const finalScore = Math.min(100, baseScore + vipStatus.boost)

    return {
      executiveSummary: {
        summary: this.extractFallbackSummary(message),
        keyPoints: this.extractKeyPoints(message),
        businessImpact: finalScore >= 80 ? 'critical' : finalScore >= 60 ? 'high' : 'medium',
        decisionRequired: content.includes('approve') || content.includes('decision'),
        estimatedResponseTime: finalScore >= 80 ? 'immediate' : 'same_day',
        stakeholderLevel: vipStatus.isBoardMember ? 'board' : vipStatus.isInvestor ? 'investor' : 'internal',
        strategicCategory: 'operational'
      },
      priorityAnalysis: {
        score: baseScore,
        tier: finalScore >= 80 ? 'critical' : finalScore >= 60 ? 'high' : finalScore >= 40 ? 'medium' : 'low',
        reasoning: 'Keyword-based analysis with VIP boosting',
        urgencyIndicators,
        strategicWeight: 0,
        vipBoost: vipStatus.boost,
        finalScore,
        recommendedResponseTime: finalScore >= 80 ? 'immediate' : 'same_day',
        escalationRequired: finalScore >= 90,
        competitiveSensitivity: 'medium'
      },
      actionItems: this.extractFallbackActions(message),
      meetingRequests: [],
      decisionsRequired: [],
      communicationsNeeded: [],
      processingMetrics: {
        processingTime: 100,
        tokensUsed: 0,
        cost: 0,
        model: 'fallback',
        promptVersion: 'keyword-based'
      }
    }
  }

  private extractFallbackSummary(message: Message): string {
    const content = message.content
    if (content.length <= 100) return content
    
    const firstSentence = content.split('.')[0]
    return firstSentence.length <= 150 ? firstSentence : content.substring(0, 100) + '...'
  }

  private extractKeyPoints(message: Message): string[] {
    const content = message.content.toLowerCase()
    const points: string[] = []
    
    if (content.includes('meeting')) points.push('Meeting mentioned')
    if (content.includes('deadline')) points.push('Deadline referenced')
    if (content.includes('approve')) points.push('Approval required')
    
    return points.length > 0 ? points : ['Message requires review']
  }

  private extractFallbackActions(message: Message): ActionItemExtracted[] {
    const content = message.content.toLowerCase()
    const actions: ActionItemExtracted[] = []
    
    if (content.includes('please review') || content.includes('please check')) {
      actions.push({
        title: 'Review Request',
        description: 'Review the content mentioned in this message',
        category: 'operational',
        priority: 'medium',
        estimatedDuration: '30min',
        delegationPossible: true,
        dependencies: [],
        stakeholders: [message.sender_name || message.sender_email],
        businessImpact: 'medium',
        calendarBlockingNeeded: false,
        prepMaterialsNeeded: [],
        followUpRequired: true,
        confidentialityLevel: 'internal'
      })
    }
    
    return actions
  }
}

// Export enhanced singleton instance
export const enhancedAIService = new EnhancedAIService()