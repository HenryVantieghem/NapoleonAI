import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ExecutiveMetrics {
  // Communication Volume
  totalMessages: number
  messagesByChannel: { channel: string; count: number; percentage: number }[]
  messagesThisWeek: number
  messagesLastWeek: number
  weekOverWeekChange: number

  // Priority & Response Metrics
  highPriorityMessages: number
  averageResponseTime: number // in hours
  vipInteractions: number
  urgentMessages: number

  // Productivity Insights
  actionItemsCreated: number
  actionItemsCompleted: number
  completionRate: number
  timeToDecision: number // average in hours

  // Business Impact
  totalFinancialImpact: number
  criticalDecisionsMade: number
  delegationRate: number
  meetingsScheduled: number

  // Communication Patterns
  peakActivityHours: { hour: number; count: number }[]
  topContacts: { email: string; name: string; interactions: number; lastContact: string }[]
  sentimentDistribution: { sentiment: string; count: number; percentage: number }[]
  
  // Time Savings
  templatesUsed: number
  quickResponsesUsed: number
  estimatedTimeSaved: number // in minutes
}

export interface ProductivityInsight {
  id: string
  type: 'communication_pattern' | 'productivity_trend' | 'delegation_opportunity' | 'time_optimization' | 'stakeholder_analysis'
  title: string
  description: string
  confidence_score: number
  business_impact: 'high' | 'medium' | 'low'
  actionable_recommendations: string[]
  data: any
  created_at: string
}

export interface TrendData {
  period: string
  value: number
  change?: number
}

export interface CommunicationHeatmap {
  day: string
  hour: number
  count: number
  intensity: 'low' | 'medium' | 'high' | 'critical'
}

export class AnalyticsService {
  /**
   * Get comprehensive executive metrics for a user
   */
  async getExecutiveMetrics(userId: string, days: number = 30): Promise<ExecutiveMetrics> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      // Parallel queries for better performance
      const [
        messages,
        actionItems,
        vipContacts,
        calendarEvents,
        templateUsage,
        responseUsage
      ] = await Promise.all([
        this.getMessagesData(userId, startDate),
        this.getActionItemsData(userId, startDate),
        this.getVIPData(userId, startDate),
        this.getCalendarData(userId, startDate),
        this.getTemplateUsageData(userId, startDate),
        this.getResponseUsageData(userId, startDate)
      ])

      // Calculate metrics
      const totalMessages = messages.length
      const messagesThisWeek = messages.filter(m => new Date(m.created_at) >= oneWeekAgo).length
      const messagesLastWeek = messages.filter(m => 
        new Date(m.created_at) >= twoWeeksAgo && new Date(m.created_at) < oneWeekAgo
      ).length

      const weekOverWeekChange = messagesLastWeek === 0 ? 
        (messagesThisWeek > 0 ? 100 : 0) : 
        ((messagesThisWeek - messagesLastWeek) / messagesLastWeek) * 100

      // Message distribution by channel
      const channelCounts = messages.reduce((acc, msg) => {
        acc[msg.source] = (acc[msg.source] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const messagesByChannel = Object.entries(channelCounts).map(([channel, count]) => ({
        channel,
        count,
        percentage: Math.round((count / totalMessages) * 100)
      }))

      // Priority metrics
      const highPriorityMessages = messages.filter(m => 
        m.priority_score >= 80 || m.is_vip
      ).length

      const urgentMessages = messages.filter(m => 
        m.sentiment === 'urgent'
      ).length

      // Response time calculation (mock for now)
      const averageResponseTime = this.calculateAverageResponseTime(messages)

      // Action items metrics
      const actionItemsCreated = actionItems.length
      const actionItemsCompleted = actionItems.filter(a => a.status === 'completed').length
      const completionRate = actionItemsCreated === 0 ? 0 : 
        Math.round((actionItemsCompleted / actionItemsCreated) * 100)

      // Business impact
      const totalFinancialImpact = messages.reduce((sum, msg) => 
        sum + (msg.ai_summary?.financialImpact || 0), 0
      )

      const criticalDecisionsMade = actionItems.filter(a => 
        a.priority === 'urgent' && a.status === 'completed'
      ).length

      // Communication patterns
      const peakActivityHours = this.calculatePeakHours(messages)
      const topContacts = await this.getTopContacts(userId, messages)
      const sentimentDistribution = this.calculateSentimentDistribution(messages)

      // Time savings
      const templatesUsed = templateUsage.reduce((sum, t) => sum + t.usage_count, 0)
      const quickResponsesUsed = responseUsage.reduce((sum, r) => sum + r.usage_count, 0)
      const estimatedTimeSaved = (templatesUsed * 5) + (quickResponsesUsed * 2) // minutes

      return {
        totalMessages,
        messagesByChannel,
        messagesThisWeek,
        messagesLastWeek,
        weekOverWeekChange,
        highPriorityMessages,
        averageResponseTime,
        vipInteractions: vipContacts.length,
        urgentMessages,
        actionItemsCreated,
        actionItemsCompleted,
        completionRate,
        timeToDecision: 4.2, // Mock average
        totalFinancialImpact,
        criticalDecisionsMade,
        delegationRate: Math.round((actionItems.filter(a => a.assigned_to).length / actionItems.length) * 100) || 0,
        meetingsScheduled: calendarEvents.length,
        peakActivityHours,
        topContacts,
        sentimentDistribution,
        templatesUsed,
        quickResponsesUsed,
        estimatedTimeSaved
      }
    } catch (error) {
      console.error('Get executive metrics error:', error)
      throw new Error(`Failed to get executive metrics: ${(error as Error).message}`)
    }
  }

  /**
   * Get productivity insights for a user
   */
  async getProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    try {
      const { data, error } = await supabase
        .from('executive_insights')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['new', 'acknowledged'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        throw new Error(`Failed to get insights: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Get productivity insights error:', error)
      return []
    }
  }

  /**
   * Generate new productivity insights
   */
  async generateInsights(userId: string): Promise<void> {
    try {
      const metrics = await this.getExecutiveMetrics(userId, 7) // Last 7 days

      const insights: Array<{
        type: string
        title: string
        description: string
        confidence: number
        impact: string
        recommendations: string[]
        data: any
      }> = []

      // Communication Pattern Insights
      if (metrics.weekOverWeekChange > 50) {
        insights.push({
          type: 'communication_pattern',
          title: 'Significant Increase in Message Volume',
          description: `Your message volume increased by ${Math.round(metrics.weekOverWeekChange)}% this week. This may indicate heightened business activity or communication bottlenecks.`,
          confidence: 0.9,
          impact: 'medium',
          recommendations: [
            'Consider implementing more aggressive message filtering',
            'Delegate routine communications to team members',
            'Set up auto-responses for common inquiries'
          ],
          data: { 
            weekOverWeekChange: metrics.weekOverWeekChange,
            messagesThisWeek: metrics.messagesThisWeek 
          }
        })
      }

      // Delegation Opportunity
      if (metrics.delegationRate < 30 && metrics.actionItemsCreated > 10) {
        insights.push({
          type: 'delegation_opportunity',
          title: 'Low Delegation Rate Detected',
          description: `Only ${metrics.delegationRate}% of your action items are delegated. You could save significant time by delegating more tasks.`,
          confidence: 0.85,
          impact: 'high',
          recommendations: [
            'Review action items that could be delegated to team members',
            'Set up delegation rules for routine tasks',
            'Identify team members with available capacity'
          ],
          data: {
            delegationRate: metrics.delegationRate,
            actionItemsCreated: metrics.actionItemsCreated
          }
        })
      }

      // Time Optimization
      if (metrics.averageResponseTime > 4) {
        insights.push({
          type: 'time_optimization',
          title: 'Response Time Optimization Opportunity',
          description: `Your average response time is ${metrics.averageResponseTime} hours. Quick responses could improve stakeholder satisfaction.`,
          confidence: 0.8,
          impact: 'medium',
          recommendations: [
            'Set up smart notifications for high-priority messages',
            'Use quick response templates for common inquiries',
            'Schedule dedicated communication review times'
          ],
          data: {
            averageResponseTime: metrics.averageResponseTime,
            highPriorityMessages: metrics.highPriorityMessages
          }
        })
      }

      // VIP Stakeholder Analysis
      const vipEngagement = metrics.vipInteractions / (metrics.totalMessages || 1) * 100
      if (vipEngagement < 20 && metrics.vipInteractions > 0) {
        insights.push({
          type: 'stakeholder_analysis',
          title: 'VIP Stakeholder Engagement Below Optimal',
          description: `VIP communications represent only ${Math.round(vipEngagement)}% of your total interactions. Key relationships may need more attention.`,
          confidence: 0.75,
          impact: 'high',
          recommendations: [
            'Schedule regular check-ins with key stakeholders',
            'Prioritize VIP messages with enhanced notifications',
            'Review and update VIP contact classifications'
          ],
          data: {
            vipEngagement,
            vipInteractions: metrics.vipInteractions,
            totalMessages: metrics.totalMessages
          }
        })
      }

      // Save insights to database
      for (const insight of insights) {
        await supabase.from('executive_insights').insert({
          user_id: userId,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence_score: insight.confidence,
          business_impact: insight.impact,
          actionable_recommendations: insight.recommendations,
          data: insight.data,
          status: 'new',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
      }
    } catch (error) {
      console.error('Generate insights error:', error)
    }
  }

  /**
   * Get communication heatmap data
   */
  async getCommunicationHeatmap(userId: string, days: number = 30): Promise<CommunicationHeatmap[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('messages')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      const heatmapData: CommunicationHeatmap[] = []
      const counts: Record<string, number> = {}

      // Process messages into hour buckets
      for (const msg of data || []) {
        const date = new Date(msg.created_at)
        const day = date.toISOString().split('T')[0]
        const hour = date.getHours()
        const key = `${day}-${hour}`
        counts[key] = (counts[key] || 0) + 1
      }

      // Convert to heatmap format
      const maxCount = Math.max(...Object.values(counts))
      for (const [key, count] of Object.entries(counts)) {
        const [day, hourStr] = key.split('-')
        const hour = parseInt(hourStr)
        const intensity = count <= maxCount * 0.25 ? 'low' :
                         count <= maxCount * 0.5 ? 'medium' :
                         count <= maxCount * 0.75 ? 'high' : 'critical'

        heatmapData.push({ day, hour, count, intensity })
      }

      return heatmapData
    } catch (error) {
      console.error('Get communication heatmap error:', error)
      return []
    }
  }

  /**
   * Get trend data for various metrics
   */
  async getTrendData(userId: string, metric: string, days: number = 30): Promise<TrendData[]> {
    // This would implement trend calculation for specific metrics
    // For now, returning mock data structure
    return []
  }

  // Private helper methods
  private async getMessagesData(userId: string, startDate: Date) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getActionItemsData(userId: string, startDate: Date) {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('user_id', userId)
      .gte('extracted_at', startDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getVIPData(userId: string, startDate: Date) {
    const { data, error } = await supabase
      .from('vip_contacts')
      .select('*')
      .eq('user_id', userId)
      .gte('last_contact', startDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getCalendarData(userId: string, startDate: Date) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getTemplateUsageData(userId: string, startDate: Date) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('usage_count')
      .eq('user_id', userId)
      .gte('updated_at', startDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getResponseUsageData(userId: string, startDate: Date) {
    const { data, error } = await supabase
      .from('quick_responses')
      .select('usage_count')
      .eq('user_id', userId)
      .gte('updated_at', startDate.toISOString())

    if (error) throw error
    return data || []
  }

  private calculateAverageResponseTime(messages: any[]): number {
    // Mock calculation - would need to track actual response times
    return Math.random() * 6 + 1 // 1-7 hours
  }

  private calculatePeakHours(messages: any[]): { hour: number; count: number }[] {
    const hourCounts: Record<number, number> = {}
    
    for (const msg of messages) {
      const hour = new Date(msg.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  private async getTopContacts(userId: string, messages: any[]) {
    const contactCounts: Record<string, { count: number; lastContact: string; name?: string }> = {}
    
    for (const msg of messages) {
      const email = msg.sender_email || msg.sender
      if (!contactCounts[email]) {
        contactCounts[email] = { 
          count: 0, 
          lastContact: msg.created_at,
          name: msg.sender_name || msg.sender
        }
      }
      contactCounts[email].count++
      if (new Date(msg.created_at) > new Date(contactCounts[email].lastContact)) {
        contactCounts[email].lastContact = msg.created_at
      }
    }

    return Object.entries(contactCounts)
      .map(([email, data]) => ({
        email,
        name: data.name || email,
        interactions: data.count,
        lastContact: new Date(data.lastContact).toLocaleDateString()
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)
  }

  private calculateSentimentDistribution(messages: any[]) {
    const sentimentCounts: Record<string, number> = {}
    
    for (const msg of messages) {
      const sentiment = msg.sentiment || 'neutral'
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1
    }

    const total = messages.length
    return Object.entries(sentimentCounts).map(([sentiment, count]) => ({
      sentiment,
      count,
      percentage: Math.round((count / total) * 100)
    }))
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService()