import { supabase } from '@/lib/supabase/client'
import { openai, AI_MODELS, AI_CONFIG } from '@/lib/ai/openai-client'
import { Message } from '@/types/ai'

export interface VIPContact {
  id: string
  userId: string
  email: string
  name: string
  title?: string
  company?: string
  importance: VIPLevel
  relationship: VIPRelationship
  tags: string[]
  notes?: string
  lastContact: Date
  interactionCount: number
  responseTimeExpected: number // minutes
  preferredChannel: 'gmail' | 'slack' | 'teams' | 'any'
  timezone?: string
  metadata: {
    linkedInUrl?: string
    phoneNumber?: string
    socialProfiles?: string[]
    meetingHistory?: any[]
  }
  createdAt: Date
  updatedAt: Date
}

export type VIPLevel = 'board' | 'investor' | 'customer' | 'partner' | 'executive' | 'team' | 'media'
export type VIPRelationship = 'superior' | 'peer' | 'direct-report' | 'external' | 'stakeholder'

export interface VIPRule {
  id: string
  userId: string
  name: string
  description: string
  conditions: VIPCondition[]
  actions: VIPAction[]
  isActive: boolean
  priority: number
  createdAt: Date
}

export interface VIPCondition {
  type: 'email_domain' | 'email_address' | 'sender_name' | 'company' | 'title' | 'keyword'
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex'
  value: string
  caseSensitive: boolean
}

export interface VIPAction {
  type: 'set_importance' | 'add_tag' | 'set_response_time' | 'send_notification' | 'auto_delegate'
  value: string | number
  metadata?: Record<string, any>
}

export class VIPTrackingService {
  /**
   * Analyze message sender and determine VIP status
   */
  async analyzeMessageSender(message: Message, userId: string): Promise<{
    isVIP: boolean
    vipLevel?: VIPLevel
    contact?: VIPContact
    priorityBoost: number
    recommendations: string[]
  }> {
    try {
      // Check if sender is already a VIP contact
      const existingVIP = await this.getVIPByEmail(userId, message.senderEmail || message.sender)
      
      if (existingVIP) {
        await this.updateInteractionCount(existingVIP.id)
        
        return {
          isVIP: true,
          vipLevel: existingVIP.importance,
          contact: existingVIP,
          priorityBoost: this.calculatePriorityBoost(existingVIP.importance),
          recommendations: await this.generateVIPRecommendations(existingVIP, message)
        }
      }

      // Check VIP rules for automatic classification
      const ruleResult = await this.evaluateVIPRules(message, userId)
      if (ruleResult.matched) {
        const newVIP = await this.createVIPFromRule(message, userId, ruleResult)
        
        return {
          isVIP: true,
          vipLevel: newVIP.importance,
          contact: newVIP,
          priorityBoost: this.calculatePriorityBoost(newVIP.importance),
          recommendations: await this.generateVIPRecommendations(newVIP, message)
        }
      }

      // Use AI to analyze potential VIP status
      const aiAnalysis = await this.analyzeWithAI(message)
      
      if (aiAnalysis.suggestedVIPLevel) {
        return {
          isVIP: false,
          priorityBoost: 0,
          recommendations: [
            `Consider adding ${message.sender} as ${aiAnalysis.suggestedVIPLevel} VIP`,
            ...aiAnalysis.recommendations
          ]
        }
      }

      return {
        isVIP: false,
        priorityBoost: 0,
        recommendations: []
      }
    } catch (error) {
      console.error('Error analyzing message sender:', error)
      return {
        isVIP: false,
        priorityBoost: 0,
        recommendations: []
      }
    }
  }

  /**
   * Create new VIP contact
   */
  async createVIP(userId: string, contactData: Partial<VIPContact>): Promise<VIPContact> {
    const vipContact: Omit<VIPContact, 'id'> = {
      userId,
      email: contactData.email!,
      name: contactData.name!,
      title: contactData.title,
      company: contactData.company,
      importance: contactData.importance || 'team',
      relationship: contactData.relationship || 'external',
      tags: contactData.tags || [],
      notes: contactData.notes,
      lastContact: new Date(),
      interactionCount: 0,
      responseTimeExpected: contactData.responseTimeExpected || this.getDefaultResponseTime(contactData.importance || 'team'),
      preferredChannel: contactData.preferredChannel || 'any',
      timezone: contactData.timezone,
      metadata: contactData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const { data, error } = await supabase
      .from('vip_contacts')
      .insert(vipContact)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update VIP contact
   */
  async updateVIP(vipId: string, updates: Partial<VIPContact>): Promise<VIPContact> {
    const { data, error } = await supabase
      .from('vip_contacts')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', vipId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get VIP contacts for user
   */
  async getVIPContacts(userId: string, filters?: {
    importance?: VIPLevel[]
    relationship?: VIPRelationship[]
    tags?: string[]
    searchQuery?: string
  }): Promise<VIPContact[]> {
    let query = supabase
      .from('vip_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .order('last_contact', { ascending: false })

    if (filters?.importance?.length) {
      query = query.in('importance', filters.importance)
    }

    if (filters?.relationship?.length) {
      query = query.in('relationship', filters.relationship)
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%,company.ilike.%${filters.searchQuery}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get VIP by email
   */
  async getVIPByEmail(userId: string, email: string): Promise<VIPContact | null> {
    const { data, error } = await supabase
      .from('vip_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  /**
   * Create VIP rules for automatic classification
   */
  async createVIPRule(userId: string, rule: Omit<VIPRule, 'id' | 'userId' | 'createdAt'>): Promise<VIPRule> {
    const { data, error } = await supabase
      .from('vip_rules')
      .insert({
        ...rule,
        user_id: userId,
        created_at: new Date()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get recent VIP interactions
   */
  async getRecentVIPInteractions(userId: string, limit: number = 10): Promise<Array<{
    contact: VIPContact
    lastMessage: Message
    daysSinceContact: number
    needsAttention: boolean
  }>> {
    const vips = await this.getVIPContacts(userId)
    const interactions = []

    for (const vip of vips) {
      // Get most recent message from this VIP
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .or(`sender_email.eq.${vip.email},sender.eq.${vip.name}`)
        .order('created_at', { ascending: false })
        .limit(1)

      if (recentMessages && recentMessages.length > 0) {
        const lastMessage = recentMessages[0]
        const daysSince = Math.floor((Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60 * 24))
        
        interactions.push({
          contact: vip,
          lastMessage,
          daysSinceContact: daysSince,
          needsAttention: this.needsAttention(vip, daysSince)
        })
      }
    }

    return interactions
      .sort((a, b) => {
        // Sort by importance first, then by days since contact
        const importanceOrder = { board: 6, investor: 5, customer: 4, partner: 3, executive: 2, team: 1, media: 1 }
        const importanceDiff = (importanceOrder[b.contact.importance] || 0) - (importanceOrder[a.contact.importance] || 0)
        if (importanceDiff !== 0) return importanceDiff
        return b.daysSinceContact - a.daysSinceContact
      })
      .slice(0, limit)
  }

  /**
   * Generate VIP insights and recommendations
   */
  async generateVIPInsights(userId: string): Promise<{
    overview: {
      totalVIPs: number
      boardMembers: number
      investors: number
      customers: number
      avgResponseTime: number
    }
    insights: string[]
    recommendations: string[]
    needsAttention: VIPContact[]
  }> {
    const vips = await this.getVIPContacts(userId)
    const recentInteractions = await this.getRecentVIPInteractions(userId, 50)

    const overview = {
      totalVIPs: vips.length,
      boardMembers: vips.filter(v => v.importance === 'board').length,
      investors: vips.filter(v => v.importance === 'investor').length,
      customers: vips.filter(v => v.importance === 'customer').length,
      avgResponseTime: this.calculateAverageResponseTime(vips)
    }

    const insights = [
      `You have ${overview.totalVIPs} VIP contacts requiring executive attention`,
      `${overview.boardMembers} board members and ${overview.investors} investors in your network`,
      `Average expected response time: ${Math.round(overview.avgResponseTime / 60)} hours`
    ]

    const recommendations = await this.generateVIPRecommendationsAI(recentInteractions)
    const needsAttention = recentInteractions
      .filter(i => i.needsAttention)
      .map(i => i.contact)
      .slice(0, 10)

    return {
      overview,
      insights,
      recommendations,
      needsAttention
    }
  }

  /**
   * Private helper methods
   */
  private async evaluateVIPRules(message: Message, userId: string): Promise<{
    matched: boolean
    rule?: VIPRule
    actions: VIPAction[]
  }> {
    const { data: rules } = await supabase
      .from('vip_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (!rules) return { matched: false, actions: [] }

    for (const rule of rules) {
      if (this.evaluateConditions(rule.conditions, message)) {
        return {
          matched: true,
          rule,
          actions: rule.actions
        }
      }
    }

    return { matched: false, actions: [] }
  }

  private evaluateConditions(conditions: VIPCondition[], message: Message): boolean {
    return conditions.every(condition => {
      const value = this.getMessageValue(message, condition.type)
      if (!value) return false

      const testValue = condition.caseSensitive ? value : value.toLowerCase()
      const conditionValue = condition.caseSensitive ? condition.value : condition.value.toLowerCase()

      switch (condition.operator) {
        case 'equals':
          return testValue === conditionValue
        case 'contains':
          return testValue.includes(conditionValue)
        case 'starts_with':
          return testValue.startsWith(conditionValue)
        case 'ends_with':
          return testValue.endsWith(conditionValue)
        case 'regex':
          return new RegExp(condition.value).test(value)
        default:
          return false
      }
    })
  }

  private getMessageValue(message: Message, type: string): string {
    switch (type) {
      case 'email_address':
        return message.senderEmail || ''
      case 'email_domain':
        return message.senderEmail?.split('@')[1] || ''
      case 'sender_name':
        return message.sender
      case 'company':
        return message.senderRole || message.metadata?.company || ''
      case 'title':
        return message.senderRole || ''
      case 'keyword':
        return `${message.subject} ${message.content}`
      default:
        return ''
    }
  }

  private async createVIPFromRule(message: Message, userId: string, ruleResult: any): Promise<VIPContact> {
    const importanceAction = ruleResult.actions.find((a: VIPAction) => a.type === 'set_importance')
    const importance = importanceAction?.value as VIPLevel || 'team'

    return await this.createVIP(userId, {
      email: message.senderEmail || message.sender,
      name: message.sender,
      title: message.senderRole,
      importance,
      relationship: 'external',
      tags: ['auto-classified'],
      notes: `Automatically classified by rule: ${ruleResult.rule.name}`
    })
  }

  private async analyzeWithAI(message: Message): Promise<{
    suggestedVIPLevel?: VIPLevel
    recommendations: string[]
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are an executive assistant analyzing message senders for VIP classification.
            
            VIP Levels:
            - board: Board members, chairperson, directors
            - investor: VCs, angels, fund managers, financial stakeholders
            - customer: Major clients, enterprise customers, key accounts
            - partner: Strategic partners, vendors, key suppliers
            - executive: C-suite, senior leadership, department heads
            - team: Direct reports, team members, colleagues
            - media: Journalists, analysts, industry press
            
            Analyze the sender and suggest appropriate VIP classification based on their role, company, and email domain.`
          },
          {
            role: 'user',
            content: `Analyze this message sender for VIP potential:
            
            Sender: ${message.sender}
            Email: ${message.senderEmail || 'N/A'}
            Role: ${message.senderRole || 'N/A'}
            Subject: ${message.subject}
            
            Provide JSON with:
            - suggestedVIPLevel: board/investor/customer/partner/executive/team/media or null
            - confidence: 0.0-1.0
            - reasoning: brief explanation
            - recommendations: array of suggestions`
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        suggestedVIPLevel: result.confidence > 0.7 ? result.suggestedVIPLevel : undefined,
        recommendations: result.recommendations || []
      }
    } catch (error) {
      return { recommendations: [] }
    }
  }

  private calculatePriorityBoost(importance: VIPLevel): number {
    const boosts = {
      board: 100,
      investor: 80,
      customer: 60,
      partner: 40,
      executive: 30,
      team: 10,
      media: 20
    }
    return boosts[importance] || 0
  }

  private getDefaultResponseTime(importance: VIPLevel): number {
    const times = {
      board: 60,      // 1 hour
      investor: 120,  // 2 hours
      customer: 240,  // 4 hours
      partner: 480,   // 8 hours
      executive: 240, // 4 hours
      team: 1440,     // 24 hours
      media: 480      // 8 hours
    }
    return times[importance] || 1440
  }

  private needsAttention(vip: VIPContact, daysSinceContact: number): boolean {
    const thresholds = {
      board: 3,
      investor: 7,
      customer: 5,
      partner: 14,
      executive: 7,
      team: 30,
      media: 14
    }
    return daysSinceContact > (thresholds[vip.importance] || 30)
  }

  private calculateAverageResponseTime(vips: VIPContact[]): number {
    if (vips.length === 0) return 1440
    return vips.reduce((sum, vip) => sum + vip.responseTimeExpected, 0) / vips.length
  }

  private async updateInteractionCount(vipId: string): Promise<void> {
    await supabase
      .from('vip_contacts')
      .update({
        interaction_count: supabase.rpc('increment', { x: 1 }),
        last_contact: new Date(),
        updated_at: new Date()
      })
      .eq('id', vipId)
  }

  private async generateVIPRecommendations(vip: VIPContact, message: Message): Promise<string[]> {
    const recommendations = []
    
    const hoursSinceContact = (Date.now() - vip.lastContact.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceContact > vip.responseTimeExpected / 60) {
      recommendations.push(`Response overdue by ${Math.round(hoursSinceContact - (vip.responseTimeExpected / 60))} hours`)
    }

    if (vip.importance === 'board' || vip.importance === 'investor') {
      recommendations.push('Consider scheduling follow-up meeting')
      recommendations.push('CC assistant for meeting coordination')
    }

    if (vip.preferredChannel !== 'any' && message.channel !== vip.preferredChannel) {
      recommendations.push(`Consider responding via ${vip.preferredChannel} (preferred channel)`)
    }

    return recommendations
  }

  private async generateVIPRecommendationsAI(interactions: any[]): Promise<string[]> {
    // AI-powered analysis of VIP interaction patterns
    const overdueContacts = interactions.filter(i => i.needsAttention).length
    const boardContacts = interactions.filter(i => i.contact.importance === 'board').length
    
    const recommendations = []
    
    if (overdueContacts > 0) {
      recommendations.push(`${overdueContacts} VIP contacts need immediate attention`)
    }
    
    if (boardContacts > 2) {
      recommendations.push('Consider consolidating board communications into weekly digest')
    }
    
    return recommendations
  }
}

// Singleton instance
export const vipTrackingService = new VIPTrackingService()