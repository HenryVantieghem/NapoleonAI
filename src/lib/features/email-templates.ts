import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface EmailTemplate {
  id: string
  name: string
  category: string
  subject_template: string | null
  body_template: string
  variables: string[]
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuickResponse {
  id: string
  trigger_keywords: string[]
  response_text: string
  tone: 'professional' | 'friendly' | 'formal' | 'brief'
  category: string
  usage_count: number
  effectiveness_score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  name: string
  description: string
  placeholder: string
  required: boolean
  type: 'text' | 'date' | 'number' | 'email'
}

export class EmailTemplateService {
  /**
   * Get all email templates for a user
   */
  async getTemplates(userId: string, category?: string): Promise<EmailTemplate[]> {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to get email templates: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Email template service error:', error)
      throw error
    }
  }

  /**
   * Get quick responses for a user
   */
  async getQuickResponses(userId: string, category?: string): Promise<QuickResponse[]> {
    try {
      let query = supabase
        .from('quick_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to get quick responses: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Quick response service error:', error)
      throw error
    }
  }

  /**
   * Create a new email template
   */
  async createTemplate(userId: string, template: {
    name: string
    category: string
    subject_template?: string
    body_template: string
    variables?: string[]
  }): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          user_id: userId,
          name: template.name,
          category: template.category,
          subject_template: template.subject_template || null,
          body_template: template.body_template,
          variables: template.variables || [],
          usage_count: 0,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create email template: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Create template error:', error)
      throw error
    }
  }

  /**
   * Create a new quick response
   */
  async createQuickResponse(userId: string, response: {
    trigger_keywords: string[]
    response_text: string
    tone: 'professional' | 'friendly' | 'formal' | 'brief'
    category: string
  }): Promise<QuickResponse> {
    try {
      const { data, error } = await supabase
        .from('quick_responses')
        .insert({
          user_id: userId,
          trigger_keywords: response.trigger_keywords,
          response_text: response.response_text,
          tone: response.tone,
          category: response.category,
          usage_count: 0,
          effectiveness_score: 0.0,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create quick response: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Create quick response error:', error)
      throw error
    }
  }

  /**
   * Update template usage count
   */
  async incrementTemplateUsage(templateId: string): Promise<void> {
    try {
      // First try RPC function
      const { error: rpcError } = await supabase.rpc('increment_template_usage_count', {
        template_id: templateId
      })
      
      if (rpcError) {
        // Fallback to manual update if function doesn't exist
        const { data: currentTemplate, error: selectError } = await supabase
          .from('email_templates')
          .select('usage_count')
          .eq('id', templateId)
          .single()
        
        if (selectError) {
          throw new Error(`Failed to get template: ${selectError.message}`)
        }
        
        if (currentTemplate) {
          const { error: updateError } = await supabase
            .from('email_templates')
            .update({ 
              usage_count: (currentTemplate.usage_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', templateId)
          
          if (updateError) {
            throw new Error(`Failed to update template usage: ${updateError.message}`)
          }
        }
      }
    } catch (error) {
      console.error('Increment template usage error:', error)
    }
  }

  /**
   * Update quick response usage and effectiveness
   */
  async incrementResponseUsage(responseId: string, wasEffective: boolean = true): Promise<void> {
    try {
      // Get current response to calculate new effectiveness score
      const { data: currentResponse } = await supabase
        .from('quick_responses')
        .select('usage_count, effectiveness_score')
        .eq('id', responseId)
        .single()

      if (currentResponse) {
        const currentCount = currentResponse.usage_count || 0
        const currentScore = currentResponse.effectiveness_score || 0
        const newCount = currentCount + 1
        
        // Calculate weighted average effectiveness
        const newScore = ((currentScore * currentCount) + (wasEffective ? 1 : 0)) / newCount

        const { error } = await supabase
          .from('quick_responses')
          .update({ 
            usage_count: newCount,
            effectiveness_score: newScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', responseId)

        if (error) {
          throw new Error(`Failed to update response usage: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Increment response usage error:', error)
    }
  }

  /**
   * Find suggested quick responses for message content
   */
  async suggestQuickResponses(userId: string, messageContent: string, messageContext?: {
    sender?: string
    subject?: string
    channel?: string
  }): Promise<QuickResponse[]> {
    try {
      const responses = await this.getQuickResponses(userId)
      
      // Simple keyword matching - could be enhanced with AI
      const suggestions: Array<{ response: QuickResponse; score: number }> = []
      
      const contentLower = messageContent.toLowerCase()
      const subjectLower = messageContext?.subject?.toLowerCase() || ''
      const combinedText = `${contentLower} ${subjectLower}`.trim()

      for (const response of responses) {
        let score = 0
        let matches = 0

        for (const keyword of response.trigger_keywords) {
          const keywordLower = keyword.toLowerCase()
          if (combinedText.includes(keywordLower)) {
            matches++
            // Weight longer keywords higher
            score += keyword.length * 2
            // Boost score if keyword appears in subject
            if (subjectLower.includes(keywordLower)) {
              score += 10
            }
          }
        }

        // Calculate relevance score
        if (matches > 0) {
          const keywordCoverage = matches / response.trigger_keywords.length
          const effectivenessBoost = response.effectiveness_score * 10
          const usageBoost = Math.min(response.usage_count * 0.1, 5)
          
          score = score * keywordCoverage + effectivenessBoost + usageBoost
          suggestions.push({ response, score })
        }
      }

      // Sort by relevance score and return top suggestions
      return suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(s => s.response)
    } catch (error) {
      console.error('Suggest quick responses error:', error)
      return []
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: EmailTemplate, variables: Record<string, string>): {
    subject: string
    body: string
  } {
    let subject = template.subject_template || ''
    let body = template.body_template

    // Replace variables in both subject and body
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), value)
      body = body.replace(new RegExp(placeholder, 'g'), value)
    }

    return { subject, body }
  }

  /**
   * Extract variables from template text
   */
  extractVariables(templateText: string): string[] {
    const regex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(templateText)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }

  /**
   * Get default executive templates
   */
  async createDefaultTemplates(userId: string): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Meeting Request',
        category: 'meeting',
        subject_template: 'Meeting Request: {{topic}}',
        body_template: `Dear {{recipient_name}},

I hope this message finds you well. I would like to schedule a meeting to discuss {{topic}}.

Proposed details:
- Duration: {{duration}} minutes
- Purpose: {{purpose}}
- Participants: {{participants}}

I'm available {{availability}}. Please let me know what works best for your schedule.

Best regards,
{{sender_name}}`
      },
      {
        name: 'Quick Acknowledgment',
        category: 'response',
        subject_template: 'Re: {{original_subject}}',
        body_template: `Thank you for your message regarding {{topic}}.

I've received your {{type}} and will {{action}} by {{deadline}}.

{{additional_notes}}

Best regards,
{{sender_name}}`
      },
      {
        name: 'Delegation Request',
        category: 'delegation',
        subject_template: 'Action Required: {{task_title}}',
        body_template: `Hi {{assignee_name}},

I'm delegating the following task to you:

Task: {{task_title}}
Priority: {{priority}}
Deadline: {{deadline}}
Context: {{context}}

Requirements:
{{requirements}}

Please confirm receipt and your estimated completion time.

Let me know if you need any clarification or additional resources.

Best regards,
{{sender_name}}`
      },
      {
        name: 'Strategic Update',
        category: 'update',
        subject_template: '{{company_name}} Strategic Update: {{period}}',
        body_template: `Dear {{recipient_name}},

I wanted to provide you with a strategic update for {{period}}.

Key Highlights:
{{key_highlights}}

Priorities for {{next_period}}:
{{priorities}}

If you have any questions or would like to discuss any of these points further, please don't hesitate to reach out.

Best regards,
{{sender_name}}`
      }
    ]

    for (const template of defaultTemplates) {
      try {
        await this.createTemplate(userId, {
          ...template,
          variables: this.extractVariables(template.body_template + ' ' + (template.subject_template || ''))
        })
      } catch (error) {
        console.error(`Failed to create default template "${template.name}":`, error)
      }
    }
  }

  /**
   * Create default quick responses
   */
  async createDefaultQuickResponses(userId: string): Promise<void> {
    const defaultResponses = [
      {
        trigger_keywords: ['thank you', 'thanks', 'appreciate'],
        response_text: 'Thank you for your message. I appreciate you bringing this to my attention.',
        tone: 'professional' as const,
        category: 'acknowledgment'
      },
      {
        trigger_keywords: ['urgent', 'asap', 'immediately', 'critical'],
        response_text: 'I understand the urgency. I\'m reviewing this now and will respond within the hour.',
        tone: 'professional' as const,
        category: 'urgent'
      },
      {
        trigger_keywords: ['meeting', 'schedule', 'calendar', 'availability'],
        response_text: 'I\'m checking my calendar and will get back to you shortly with my availability.',
        tone: 'professional' as const,
        category: 'meeting'
      },
      {
        trigger_keywords: ['approve', 'approval', 'sign off', 'authorize'],
        response_text: 'I\'m reviewing the details and will provide my decision by end of business today.',
        tone: 'professional' as const,
        category: 'approval'
      },
      {
        trigger_keywords: ['deadline', 'due date', 'timeline', 'delivery'],
        response_text: 'Noted on the timeline. I\'ll ensure this is prioritized accordingly.',
        tone: 'professional' as const,
        category: 'timeline'
      }
    ]

    for (const response of defaultResponses) {
      try {
        await this.createQuickResponse(userId, response)
      } catch (error) {
        console.error(`Failed to create default quick response:`, error)
      }
    }
  }
}

// Singleton instance
export const emailTemplateService = new EmailTemplateService()