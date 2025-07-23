import { openai, AI_MODELS, AI_CONFIG, EXECUTIVE_CONTEXT, AIError } from './openai-client'
import { Message, AnalysisResult, PriorityLevel, BusinessImpactLevel } from '@/types/ai'
// Removed calendar integration for MVP

export class MessageAnalyzer {
  /**
   * Analyze a message for executive priority and business impact
   */
  async analyzeMessage(message: Message, userId?: string): Promise<AnalysisResult> {
    try {
      // Simplified for MVP - no calendar integration
      let calendarContext = ''

      const analysisPrompt = this.buildAnalysisPrompt(message, calendarContext)
      
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: AI_CONFIG.maxTokens.analysis,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        priority: this.validatePriority(result.priority),
        confidence: result.confidence || 0.8,
        sentiment: result.sentiment || 'neutral',
        topics: result.topics || [],
        urgencyLevel: result.urgency || 'normal',
        requiresAction: result.actionRequired || false
      }
    } catch (error) {
      throw new AIError(
        'Failed to analyze message',
        'ANALYSIS_ERROR',
        error as Error
      )
    }
  }

  /**
   * Generate executive summary for a message
   */
  async generateExecutiveSummary(message: Message): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.summarization,
        messages: [
          {
            role: 'system',
            content: `You are an executive assistant creating concise summaries for C-suite executives. 
            Focus on business impact, decisions required, and actionable insights. 
            Keep summaries to 2-3 sentences maximum.`
          },
          {
            role: 'user',
            content: `Create an executive summary for this message:
            
            Subject: ${message.subject}
            From: ${message.sender}
            Content: ${message.content}
            
            Focus on: What decision is needed? What's the business impact? What action should the executive take?`
          }
        ],
        temperature: AI_CONFIG.temperature.summarization,
        max_tokens: AI_CONFIG.maxTokens.summarization,
      })

      return response.choices[0].message.content || 'Summary unavailable'
    } catch (error) {
      throw new AIError(
        'Failed to generate executive summary',
        'SUMMARY_ERROR',
        error as Error
      )
    }
  }

  /**
   * Extract action items from message content
   */
  async extractActionItems(message: Message): Promise<Array<{
    title: string
    description: string
    priority: PriorityLevel
    dueDate?: string
    assignedTo?: string
    category: string
  }>> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.extraction,
        messages: [
          {
            role: 'system',
            content: `Extract specific action items from executive communications. 
            Focus on decisions, approvals, reviews, meetings, and other concrete actions.
            Return valid JSON array format.`
          },
          {
            role: 'user',
            content: `Extract action items from this message:
            
            Subject: ${message.subject}
            From: ${message.sender}
            Content: ${message.content}
            
            Return JSON array with objects containing: title, description, priority (critical/high/medium/low), dueDate, assignedTo, category`
          }
        ],
        temperature: AI_CONFIG.temperature.extraction,
        max_tokens: AI_CONFIG.maxTokens.extraction,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{"actionItems":[]}')
      return result.actionItems || []
    } catch (error) {
      throw new AIError(
        'Failed to extract action items',
        'EXTRACTION_ERROR',
        error as Error
      )
    }
  }

  /**
   * Analyze communication patterns and generate insights
   */
  async generateInsights(messages: Message[]): Promise<{
    patterns: string[]
    recommendations: string[]
    trends: string[]
    delegationOpportunities: string[]
  }> {
    try {
      const messagesSummary = messages.slice(0, 20).map(m => ({
        subject: m.subject,
        sender: m.sender,
        priority: m.priority,
        timestamp: m.timestamp,
        channel: m.channel
      }))

      const response = await openai.chat.completions.create({
        model: AI_MODELS.insights,
        messages: [
          {
            role: 'system',
            content: `You are an AI executive coach analyzing communication patterns. 
            Provide strategic insights about efficiency, decision patterns, and optimization opportunities.
            Focus on executive-level strategic recommendations.`
          },
          {
            role: 'user',
            content: `Analyze these recent executive communications and provide insights:
            
            ${JSON.stringify(messagesSummary, null, 2)}
            
            Provide JSON response with: patterns, recommendations, trends, delegationOpportunities`
          }
        ],
        temperature: AI_CONFIG.temperature.insights,
        max_tokens: AI_CONFIG.maxTokens.insights,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      throw new AIError(
        'Failed to generate insights',
        'INSIGHTS_ERROR',
        error as Error
      )
    }
  }

  /**
   * Build analysis prompt with executive context
   */
  private buildAnalysisPrompt(message: Message, calendarContext = ''): string {
    return `Analyze this executive communication for priority and business impact:

Subject: ${message.subject}
From: ${message.sender}
Channel: ${message.channel}
Timestamp: ${message.timestamp}
Content: ${message.content}

${calendarContext ? `Calendar Context:
${calendarContext}
` : ''}
Consider these executive priorities:
${EXECUTIVE_CONTEXT.priorities.map(p => `- ${p}`).join('\n')}

Provide JSON analysis with:
- priority: critical/high/medium/low
- urgency: immediate/today/thisWeek/normal
- sentiment: positive/neutral/negative/urgent
- topics: array of key business topics
- actionRequired: boolean
- decisionRequired: boolean  
- financialImpact: estimated dollar amount (0 if none)
- stakeholderLevel: executive/management/staff/external
- timeToDecision: hours until decision needed (null if no deadline)
- riskLevel: critical/high/medium/low
- confidence: 0.0-1.0 confidence in analysis
- reasoning: brief explanation of priority assessment
- suggestedActions: array of recommended next steps`
  }

  /**
   * Get system prompt for AI analysis
   */
  private getSystemPrompt(): string {
    return `You are an AI assistant specialized in analyzing executive communications for C-suite leaders.

Your role is to:
1. Assess business priority and urgency of messages
2. Identify decisions that require executive attention
3. Evaluate financial and strategic impact
4. Recognize patterns that affect business operations
5. Provide actionable recommendations

Executive Context:
- Target audience: C-suite executives (CEO, CFO, COO, etc.)
- Decision thresholds: $10M+ (critical), $1M+ (high), $100K+ (medium)
- Focus areas: Strategy, M&A, governance, revenue, compliance, leadership
- Time sensitivity: Board meetings, earnings, regulatory deadlines

Analysis Criteria:
- Financial impact and revenue implications
- Strategic importance to business objectives  
- Stakeholder level and influence
- Time sensitivity and decision deadlines
- Legal, compliance, or regulatory implications
- Customer impact and relationship risks
- Competitive advantage or threats

Always provide structured, data-driven analysis that helps executives prioritize their time and make informed decisions quickly.`
  }

  /**
   * Validate and normalize priority levels
   */
  private validatePriority(priority: string): PriorityLevel {
    const normalizedPriority = priority?.toLowerCase()
    if (['critical', 'high', 'medium', 'low'].includes(normalizedPriority)) {
      return normalizedPriority as PriorityLevel
    }
    return 'medium' // Default fallback
  }

  /**
   * Assess business impact based on analysis results
   */
  private assessBusinessImpact(result: any): BusinessImpactLevel {
    const financial = result.financialImpact || 0
    const stakeholder = result.stakeholderLevel || 'staff'
    const risk = result.riskLevel || 'low'

    if (financial >= EXECUTIVE_CONTEXT.decisionThresholds.critical.financial || 
        risk === 'critical' || 
        stakeholder === 'board') {
      return 'very-high'
    }

    if (financial >= EXECUTIVE_CONTEXT.decisionThresholds.high.financial || 
        risk === 'high' || 
        stakeholder === 'executive') {
      return 'high'
    }

    if (financial >= EXECUTIVE_CONTEXT.decisionThresholds.medium.financial || 
        risk === 'medium' || 
        stakeholder === 'management') {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Format calendar context for AI analysis (removed for MVP)
   */
  private formatCalendarContext(context: any): string {
    // Simplified for MVP - no calendar integration
    return ''
  }
}

// Singleton instance
export const messageAnalyzer = new MessageAnalyzer()