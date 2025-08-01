import { supabase } from '@/lib/supabase/client'
import { openai } from './openai-client'
import { errorHandler, withErrorHandling } from '@/lib/services/error-handler'
import type { Message, ActionItem, VipContact } from '@/types/database'

export interface SimplePriorityResult {
  score: number // 0-100
  reason: string
  isUrgent: boolean
  isVip: boolean
}

export interface SimpleAnalysisResult {
  priority: SimplePriorityResult
  summary: string
  actionItems: SimpleActionItem[]
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
}

export interface SimpleActionItem {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
}

export class SimpleAIService {
  /**
   * Process a message with simplified AI analysis for MVP
   */
  async processMessage(message: Message, userId: string): Promise<SimpleAnalysisResult> {
    const result = await withErrorHandling(
      async () => {
        // Get VIP contacts for priority scoring
        const { data: vipContacts } = await supabase
          .from('vip_contacts')
          .select('email, priority_level')
          .eq('user_id', userId)

        const isVip = this.checkIfVip(message.sender_email, vipContacts || [])
        
        // Simplified AI analysis
        const prompt = `
Analyze this executive message for priority and extract action items:

FROM: ${message.sender_name || message.sender_email}
SUBJECT: ${message.subject || 'N/A'}
CONTENT: ${message.content}

Please respond with a JSON object containing:
{
  "priorityScore": number (0-100, where 100 is urgent),
  "priorityReason": "brief explanation why this priority",
  "summary": "1-2 sentence summary",
  "sentiment": "positive|neutral|negative|urgent",
  "actionItems": [
    {
      "title": "Brief action title",
      "description": "What needs to be done",
      "priority": "low|medium|high|urgent",
      "dueDate": "YYYY-MM-DD or null"
    }
  ]
}

Focus on:
- Deadlines and time sensitivity
- Decision requests
- Meeting requests  
- Important approvals
- Critical issues
`

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        })

        const aiResult = JSON.parse(response.choices[0].message.content || '{}')
        
        // Apply VIP boost to priority
        let finalScore = aiResult.priorityScore || 0
        if (isVip.isVip) {
          finalScore = Math.min(100, finalScore + isVip.boost)
        }

        return {
          priority: {
            score: finalScore,
            reason: isVip.isVip ? `VIP Contact: ${aiResult.priorityReason}` : aiResult.priorityReason,
            isUrgent: finalScore >= 80,
            isVip: isVip.isVip
          },
          summary: aiResult.summary || 'No summary available',
          actionItems: aiResult.actionItems || [],
          sentiment: aiResult.sentiment || 'neutral'
        }
      },
      {
        userId,
        messageId: message.id,
        component: 'AIService',
        action: 'processMessage'
      }
    )

    // Return AI result or fallback data
    if (result.data) {
      return result.data
    } else if (result.fallback) {
      return result.fallback
    } else {
      // Ultimate fallback
      return this.getFallbackAnalysis(message)
    }
  }

  /**
   * Check if sender is a VIP contact
   */
  private checkIfVip(senderEmail: string, vipContacts: { email: string; priority_level: number }[]): { isVip: boolean; boost: number } {
    const vip = vipContacts.find(contact => 
      contact.email.toLowerCase() === senderEmail.toLowerCase()
    )
    
    if (vip) {
      // Convert priority level (1-10) to score boost (10-40)
      const boost = Math.min(40, vip.priority_level * 4)
      return { isVip: true, boost }
    }
    
    return { isVip: false, boost: 0 }
  }

  /**
   * Simple keyword-based priority scoring when AI fails
   */
  private getFallbackAnalysis(message: Message): SimpleAnalysisResult {
    const content = (message.content + ' ' + (message.subject || '')).toLowerCase()
    let score = 30 // Base score
    
    // Urgency keywords
    if (content.includes('urgent') || content.includes('asap') || content.includes('immediately')) {
      score += 40
    }
    
    // Meeting/deadline keywords
    if (content.includes('meeting') || content.includes('deadline') || content.includes('due')) {
      score += 20
    }
    
    // Decision keywords
    if (content.includes('approve') || content.includes('decision') || content.includes('sign off')) {
      score += 25
    }
    
    // Issue keywords
    if (content.includes('problem') || content.includes('issue') || content.includes('error')) {
      score += 30
    }

    return {
      priority: {
        score: Math.min(100, score),
        reason: 'Keyword-based priority scoring',
        isUrgent: score >= 80,
        isVip: false
      },
      summary: this.extractSimpleSummary(message),
      actionItems: this.extractSimpleActions(message),
      sentiment: this.detectSentiment(content)
    }
  }

  private extractSimpleSummary(message: Message): string {
    const content = message.content
    if (content.length <= 100) return content
    
    // Take first sentence or first 100 chars
    const firstSentence = content.split('.')[0]
    return firstSentence.length <= 150 ? firstSentence : content.substring(0, 100) + '...'
  }

  private extractSimpleActions(message: Message): SimpleActionItem[] {
    const content = message.content.toLowerCase()
    const actions: SimpleActionItem[] = []
    
    // Simple pattern matching for actions
    if (content.includes('please review') || content.includes('please check')) {
      actions.push({
        title: 'Review Request',
        description: 'Review the content mentioned in this message',
        priority: 'medium'
      })
    }
    
    if (content.includes('meeting') || content.includes('schedule')) {
      actions.push({
        title: 'Schedule Meeting',
        description: 'Schedule or confirm meeting mentioned in message',
        priority: 'medium'
      })
    }
    
    if (content.includes('approve') || content.includes('sign off')) {
      actions.push({
        title: 'Approval Required',
        description: 'Provide approval for request in message',
        priority: 'high'
      })
    }
    
    return actions
  }

  private detectSentiment(content: string): 'positive' | 'neutral' | 'negative' | 'urgent' {
    if (content.includes('urgent') || content.includes('critical') || content.includes('problem')) {
      return 'urgent'
    }
    
    if (content.includes('thank') || content.includes('great') || content.includes('excellent')) {
      return 'positive'
    }
    
    if (content.includes('issue') || content.includes('concern') || content.includes('disappointed')) {
      return 'negative'
    }
    
    return 'neutral'
  }

  /**
   * Get simplified daily digest for dashboard
   */
  async getDailyDigest(userId: string): Promise<{
    totalMessages: number
    highPriorityCount: number
    vipMessagesCount: number
    actionItemsCount: number
    topPriorityMessages: Message[]
  }> {
    try {
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      
      // Get today's messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .gte('message_date', yesterday.toISOString())
        .order('priority_score', { ascending: false })
        .limit(20)

      const messageList = messages || []
      
      // Get pending action items
      const { data: actionItems } = await supabase
        .from('action_items')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')

      return {
        totalMessages: messageList.length,
        highPriorityCount: messageList.filter(m => m.priority_score >= 70).length,
        vipMessagesCount: messageList.filter(m => m.is_vip).length,
        actionItemsCount: actionItems?.length || 0,
        topPriorityMessages: messageList.slice(0, 5)
      }
    } catch (error) {
      console.error('Error getting daily digest:', error)
      return {
        totalMessages: 0,
        highPriorityCount: 0,
        vipMessagesCount: 0,
        actionItemsCount: 0,
        topPriorityMessages: []
      }
    }
  }

  /**
   * Save processed message analysis to database
   */
  async saveMessageAnalysis(messageId: string, analysis: SimpleAnalysisResult, userId: string): Promise<void> {
    try {
      // Update message with AI analysis
      await supabase
        .from('messages')
        .update({
          priority_score: analysis.priority.score,
          ai_summary: analysis.summary,
          sentiment: analysis.sentiment,
          is_vip: analysis.priority.isVip,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)

      // Save action items
      if (analysis.actionItems.length > 0) {
        const actionItemsToInsert = analysis.actionItems.map(item => ({
          message_id: messageId,
          user_id: userId,
          title: item.title,
          description: item.description,
          priority: item.priority,
          due_date: item.dueDate ? new Date(item.dueDate).toISOString() : null,
          status: 'pending' as const
        }))

        await supabase
          .from('action_items')
          .insert(actionItemsToInsert)
      }
    } catch (error) {
      console.error('Error saving message analysis:', error)
    }
  }
}

// Export singleton instance for MVP
export const aiService = new SimpleAIService()