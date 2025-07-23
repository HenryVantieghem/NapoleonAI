import { supabase } from '@/lib/supabase/client'
import { vipTrackingService } from './vip-tracking'
import { openai, AI_MODELS, AI_CONFIG } from '@/lib/ai/openai-client'
import { Message, PriorityLevel } from '@/types/ai'

export interface NotificationRule {
  id: string
  userId: string
  name: string
  description: string
  isActive: boolean
  priority: number
  triggers: NotificationTrigger[]
  conditions: NotificationCondition[]
  actions: NotificationAction[]
  schedule?: NotificationSchedule
  quietHours?: QuietHours
  createdAt: Date
  updatedAt: Date
}

export interface NotificationTrigger {
  type: 'new_message' | 'high_priority' | 'vip_sender' | 'keyword_match' | 'deadline' | 'delegation' | 'escalation'
  metadata?: Record<string, any>
}

export interface NotificationCondition {
  type: 'platform' | 'sender' | 'subject' | 'priority' | 'time' | 'location' | 'meeting_status'
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: string | string[] | number
}

export interface NotificationAction {
  type: 'push' | 'email' | 'sms' | 'slack' | 'teams' | 'phone_call' | 'webhook'
  delay?: number // minutes
  template?: string
  escalationLevel?: number
  metadata?: Record<string, any>
}

export interface NotificationSchedule {
  timezone: string
  workingDays: number[] // 0-6, Sunday-Saturday
  workingHours: {
    start: string // HH:MM
    end: string   // HH:MM
  }
  urgentOverride: boolean // Allow urgent notifications outside hours
}

export interface QuietHours {
  enabled: boolean
  start: string // HH:MM
  end: string   // HH:MM
  exceptions: string[] // VIP contacts who can override
}

export interface NotificationPreferences {
  userId: string
  channels: {
    push: { enabled: boolean; token?: string }
    email: { enabled: boolean; address?: string }
    sms: { enabled: boolean; number?: string }
    slack: { enabled: boolean; webhook?: string }
    teams: { enabled: boolean; webhook?: string }
  }
  batchDelivery: {
    enabled: boolean
    interval: number // minutes
    maxBatchSize: number
  }
  intelligentSummary: {
    enabled: boolean
    threshold: number // number of notifications to trigger summary
  }
  doNotDisturb: {
    enabled: boolean
    schedule?: NotificationSchedule
  }
  priorities: {
    [key in PriorityLevel]: {
      enabled: boolean
      immediateDelivery: boolean
      channels: string[]
    }
  }
}

export interface SmartNotification {
  id: string
  userId: string
  messageId?: string
  type: NotificationType
  title: string
  content: string
  priority: PriorityLevel
  channels: string[]
  status: NotificationStatus
  intelligenceData: {
    contextualRelevance: number
    urgencyScore: number
    businessImpact: number
    userPreferenceMatch: number
    overallScore: number
  }
  scheduledFor?: Date
  deliveredAt?: Date
  readAt?: Date
  metadata: Record<string, any>
  createdAt: Date
}

export type NotificationType = 
  | 'message_received' 
  | 'priority_alert' 
  | 'vip_communication' 
  | 'deadline_reminder' 
  | 'delegation_update' 
  | 'meeting_reminder' 
  | 'system_alert'
  | 'digest_summary'

export type NotificationStatus = 'pending' | 'scheduled' | 'delivered' | 'read' | 'dismissed' | 'failed'

export class SmartNotificationService {
  /**
   * Process incoming message and determine notification strategy
   */
  async processMessageNotification(
    message: Message,
    userId: string
  ): Promise<{
    shouldNotify: boolean
    notifications: SmartNotification[]
    reasoning: string[]
  }> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId)
      
      // Analyze message with AI for intelligent scoring
      const intelligence = await this.analyzeMessageIntelligence(message, userId)
      
      // Check notification rules
      const applicableRules = await this.getApplicableRules(message, userId)
      
      // Determine if we should notify based on various factors
      const shouldNotify = await this.shouldNotifyUser(
        message,
        userId,
        preferences,
        intelligence,
        applicableRules
      )
      
      if (!shouldNotify.notify) {
        return {
          shouldNotify: false,
          notifications: [],
          reasoning: shouldNotify.reasoning
        }
      }
      
      // Create appropriate notifications
      const notifications = await this.createNotifications(
        message,
        userId,
        preferences,
        intelligence,
        applicableRules
      )
      
      // Schedule delivery based on preferences and timing
      const scheduledNotifications = await this.scheduleNotifications(
        notifications,
        preferences
      )
      
      return {
        shouldNotify: true,
        notifications: scheduledNotifications,
        reasoning: shouldNotify.reasoning
      }
    } catch (error) {
      console.error('Error processing message notification:', error)
      return {
        shouldNotify: false,
        notifications: [],
        reasoning: ['Error in notification processing']
      }
    }
  }

  /**
   * Create and send smart notification
   */
  async createSmartNotification(
    userId: string,
    notification: Omit<SmartNotification, 'id' | 'userId' | 'status' | 'createdAt'>
  ): Promise<SmartNotification> {
    const notificationData = {
      ...notification,
      user_id: userId,
      status: 'pending' as NotificationStatus,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('smart_notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) throw error

    // Immediately deliver if appropriate
    if (this.shouldDeliverImmediately(notification, await this.getUserPreferences(userId))) {
      await this.deliverNotification(data)
    }

    return data
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    return data || this.getDefaultPreferences(userId)
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Generate intelligent notification digest
   */
  async generateDigest(
    userId: string,
    timeframe: 'hourly' | 'daily' | 'weekly' = 'daily'
  ): Promise<{
    summary: string
    priorityItems: Array<{
      message: Message
      reason: string
      urgency: number
    }>
    trends: string[]
    recommendations: string[]
  }> {
    try {
      // Get notifications from the specified timeframe
      const timeframeHours = { hourly: 1, daily: 24, weekly: 168 }[timeframe]
      const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000)

      const { data: notifications } = await supabase
        .from('smart_notifications')
        .select(`
          *,
          messages(*)
        `)
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .order('intelligence_data->overallScore', { ascending: false })

      if (!notifications || notifications.length === 0) {
        return {
          summary: `No significant activity in the last ${timeframe.replace('ly', '')}.`,
          priorityItems: [],
          trends: [],
          recommendations: []
        }
      }

      // Generate AI-powered digest
      const digest = await this.generateDigestWithAI(notifications, timeframe)
      
      return digest
    } catch (error) {
      console.error('Error generating digest:', error)
      throw new Error('Failed to generate notification digest')
    }
  }

  /**
   * Manage notification delivery
   */
  async deliverNotification(notification: SmartNotification): Promise<{
    success: boolean
    deliveredChannels: string[]
    failedChannels: string[]
  }> {
    const deliveredChannels: string[] = []
    const failedChannels: string[] = []

    for (const channel of notification.channels) {
      try {
        await this.deliverToChannel(notification, channel)
        deliveredChannels.push(channel)
      } catch (error) {
        console.error(`Failed to deliver to ${channel}:`, error)
        failedChannels.push(channel)
      }
    }

    // Update notification status
    const status = deliveredChannels.length > 0 ? 'delivered' : 'failed'
    await supabase
      .from('smart_notifications')
      .update({
        status,
        delivered_at: new Date().toISOString()
      })
      .eq('id', notification.id)

    return {
      success: deliveredChannels.length > 0,
      deliveredChannels,
      failedChannels
    }
  }

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(userId: string, days: number = 30): Promise<{
    overview: {
      totalNotifications: number
      deliveredNotifications: number
      readNotifications: number
      deliveryRate: number
      readRate: number
    }
    channelPerformance: Record<string, {
      sent: number
      delivered: number
      read: number
      effectiveness: number
    }>
    trends: {
      dailyVolume: Array<{ date: string; count: number }>
      priorityDistribution: Record<PriorityLevel, number>
      responseTime: number // average time to read
    }
    recommendations: string[]
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data: notifications } = await supabase
      .from('smart_notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())

    if (!notifications) {
      return {
        overview: { totalNotifications: 0, deliveredNotifications: 0, readNotifications: 0, deliveryRate: 0, readRate: 0 },
        channelPerformance: {},
        trends: { dailyVolume: [], priorityDistribution: { critical: 0, high: 0, medium: 0, low: 0 }, responseTime: 0 },
        recommendations: []
      }
    }

    const overview = {
      totalNotifications: notifications.length,
      deliveredNotifications: notifications.filter(n => n.status === 'delivered' || n.status === 'read').length,
      readNotifications: notifications.filter(n => n.status === 'read').length,
      deliveryRate: 0,
      readRate: 0
    }

    overview.deliveryRate = overview.totalNotifications > 0 
      ? (overview.deliveredNotifications / overview.totalNotifications) * 100 
      : 0

    overview.readRate = overview.deliveredNotifications > 0 
      ? (overview.readNotifications / overview.deliveredNotifications) * 100 
      : 0

    // Calculate channel performance
    const channelPerformance: Record<string, any> = {}
    notifications.forEach(notification => {
      notification.channels.forEach((channel: string) => {
        if (!channelPerformance[channel]) {
          channelPerformance[channel] = { sent: 0, delivered: 0, read: 0, effectiveness: 0 }
        }
        channelPerformance[channel].sent++
        if (notification.status === 'delivered' || notification.status === 'read') {
          channelPerformance[channel].delivered++
        }
        if (notification.status === 'read') {
          channelPerformance[channel].read++
        }
      })
    })

    // Calculate effectiveness scores
    Object.keys(channelPerformance).forEach(channel => {
      const perf = channelPerformance[channel]
      perf.effectiveness = perf.sent > 0 ? (perf.read / perf.sent) * 100 : 0
    })

    // Generate trends and recommendations
    const trends = this.calculateNotificationTrends(notifications)
    const recommendations = await this.generateNotificationRecommendations(notifications, channelPerformance)

    return {
      overview,
      channelPerformance,
      trends,
      recommendations
    }
  }

  /**
   * Private helper methods
   */
  private async analyzeMessageIntelligence(message: Message, userId: string): Promise<{
    contextualRelevance: number
    urgencyScore: number
    businessImpact: number
    userPreferenceMatch: number
    overallScore: number
  }> {
    try {
      // Analyze with AI
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are an intelligent notification system analyzing messages for executive attention.
            
            Score messages on:
            - Contextual relevance to executive responsibilities
            - Urgency and time sensitivity
            - Business impact and strategic importance
            - User preference alignment
            
            Provide scores from 0-100 for each dimension.`
          },
          {
            role: 'user',
            content: `Analyze this message for notification intelligence:
            
            Subject: ${message.subject}
            From: ${message.sender} (${message.senderRole || 'Unknown'})
            Content: ${message.content.substring(0, 300)}
            Channel: ${message.channel}
            Time: ${message.timestamp.toISOString()}
            
            Provide JSON with scores (0-100):
            - contextualRelevance: relevance to executive work
            - urgencyScore: time sensitivity and urgency
            - businessImpact: strategic/business importance
            - userPreferenceMatch: likely user interest
            - reasoning: brief explanation`
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      const scores = {
        contextualRelevance: Math.max(0, Math.min(100, result.contextualRelevance || 50)),
        urgencyScore: Math.max(0, Math.min(100, result.urgencyScore || 50)),
        businessImpact: Math.max(0, Math.min(100, result.businessImpact || 50)),
        userPreferenceMatch: Math.max(0, Math.min(100, result.userPreferenceMatch || 50)),
        overallScore: 0
      }
      
      // Calculate weighted overall score
      scores.overallScore = (
        scores.contextualRelevance * 0.25 +
        scores.urgencyScore * 0.35 +
        scores.businessImpact * 0.30 +
        scores.userPreferenceMatch * 0.10
      )
      
      return scores
    } catch (error) {
      // Fallback scoring
      return {
        contextualRelevance: 50,
        urgencyScore: message.priority === 'critical' ? 90 : message.priority === 'high' ? 70 : 50,
        businessImpact: 50,
        userPreferenceMatch: 50,
        overallScore: 50
      }
    }
  }

  private async getApplicableRules(message: Message, userId: string): Promise<NotificationRule[]> {
    const { data: rules } = await supabase
      .from('notification_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (!rules) return []

    return rules.filter(rule => this.evaluateRuleConditions(rule, message))
  }

  private evaluateRuleConditions(rule: NotificationRule, message: Message): boolean {
    // Check triggers
    const triggerMatched = rule.triggers.some(trigger => {
      switch (trigger.type) {
        case 'new_message':
          return true
        case 'high_priority':
          return message.priority === 'critical' || message.priority === 'high'
        case 'vip_sender':
          // Would check VIP status
          return false
        case 'keyword_match':
          const keywords = trigger.metadata?.keywords || []
          return keywords.some((keyword: string) => 
            message.subject.toLowerCase().includes(keyword.toLowerCase()) ||
            message.content.toLowerCase().includes(keyword.toLowerCase())
          )
        default:
          return false
      }
    })

    if (!triggerMatched) return false

    // Check conditions
    return rule.conditions.every(condition => {
      const messageValue = this.getMessageValueForCondition(message, condition.type)
      return this.evaluateCondition(condition, messageValue)
    })
  }

  private getMessageValueForCondition(message: Message, type: string): any {
    switch (type) {
      case 'platform':
        return message.channel
      case 'sender':
        return message.sender
      case 'subject':
        return message.subject
      case 'priority':
        return message.priority
      case 'time':
        return message.timestamp.getHours()
      default:
        return null
    }
  }

  private evaluateCondition(condition: NotificationCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'contains':
        return typeof value === 'string' && 
               typeof condition.value === 'string' &&
               value.toLowerCase().includes(condition.value.toLowerCase())
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      case 'greater_than':
        return typeof value === 'number' && 
               typeof condition.value === 'number' && 
               value > condition.value
      case 'less_than':
        return typeof value === 'number' && 
               typeof condition.value === 'number' && 
               value < condition.value
      default:
        return false
    }
  }

  private async shouldNotifyUser(
    message: Message,
    userId: string,
    preferences: NotificationPreferences,
    intelligence: any,
    rules: NotificationRule[]
  ): Promise<{ notify: boolean; reasoning: string[] }> {
    const reasoning: string[] = []

    // Check if notifications are enabled for this priority
    const priorityConfig = preferences.priorities[message.priority || 'medium']
    if (!priorityConfig.enabled) {
      return { notify: false, reasoning: ['Notifications disabled for this priority level'] }
    }

    // Check Do Not Disturb
    if (preferences.doNotDisturb.enabled && this.isInDoNotDisturbTime(preferences)) {
      // Allow override for urgent messages
      if (intelligence.urgencyScore < 80 && intelligence.overallScore < 75) {
        return { notify: false, reasoning: ['Do Not Disturb mode active'] }
      }
      reasoning.push('Overriding Do Not Disturb due to urgency')
    }

    // Check intelligence threshold
    if (intelligence.overallScore < 30) {
      return { notify: false, reasoning: ['Message intelligence score too low'] }
    }

    // If rules matched, prioritize those
    if (rules.length > 0) {
      reasoning.push(`Matched ${rules.length} notification rule(s)`)
      return { notify: true, reasoning }
    }

    // Default notification logic
    if (intelligence.overallScore >= 60 || intelligence.urgencyScore >= 70) {
      reasoning.push('High intelligence or urgency score')
      return { notify: true, reasoning }
    }

    return { notify: false, reasoning: ['No notification criteria met'] }
  }

  private async createNotifications(
    message: Message,
    userId: string,
    preferences: NotificationPreferences,
    intelligence: any,
    rules: NotificationRule[]
  ): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = []
    
    // Determine channels based on priority and preferences
    const priorityConfig = preferences.priorities[message.priority || 'medium']
    const channels = priorityConfig.immediateDelivery 
      ? priorityConfig.channels 
      : ['push'] // Default to push for non-immediate

    // Create notification content
    const title = await this.generateNotificationTitle(message, intelligence)
    const content = await this.generateNotificationContent(message, intelligence)
    
    notifications.push({
      id: '', // Will be set by database
      userId,
      messageId: message.id,
      type: 'message_received',
      title,
      content,
      priority: message.priority || 'medium',
      channels,
      status: 'pending',
      intelligenceData: intelligence,
      metadata: {
        platform: message.channel,
        sender: message.sender
      },
      createdAt: new Date()
    })

    return notifications
  }

  private async scheduleNotifications(
    notifications: SmartNotification[],
    preferences: NotificationPreferences
  ): Promise<SmartNotification[]> {
    // For now, return as-is. In production, would implement intelligent scheduling
    return notifications
  }

  private shouldDeliverImmediately(
    notification: Partial<SmartNotification>,
    preferences: NotificationPreferences
  ): boolean {
    const priorityConfig = preferences.priorities[notification.priority || 'medium']
    return priorityConfig.immediateDelivery || notification.priority === 'critical'
  }

  private async deliverToChannel(notification: SmartNotification, channel: string): Promise<void> {
    // Implementation would depend on the channel
    switch (channel) {
      case 'push':
        await this.sendPushNotification(notification)
        break
      case 'email':
        await this.sendEmailNotification(notification)
        break
      case 'sms':
        await this.sendSMSNotification(notification)
        break
      case 'slack':
        await this.sendSlackNotification(notification)
        break
      case 'teams':
        await this.sendTeamsNotification(notification)
        break
      default:
        throw new Error(`Unsupported channel: ${channel}`)
    }
  }

  private async sendPushNotification(notification: SmartNotification): Promise<void> {
    // Implementation for push notifications
    console.log('Sending push notification:', notification.title)
  }

  private async sendEmailNotification(notification: SmartNotification): Promise<void> {
    // Implementation for email notifications
    console.log('Sending email notification:', notification.title)
  }

  private async sendSMSNotification(notification: SmartNotification): Promise<void> {
    // Implementation for SMS notifications
    console.log('Sending SMS notification:', notification.title)
  }

  private async sendSlackNotification(notification: SmartNotification): Promise<void> {
    // Implementation for Slack notifications
    console.log('Sending Slack notification:', notification.title)
  }

  private async sendTeamsNotification(notification: SmartNotification): Promise<void> {
    // Implementation for Teams notifications
    console.log('Sending Teams notification:', notification.title)
  }

  private isInDoNotDisturbTime(preferences: NotificationPreferences): boolean {
    // Implementation for Do Not Disturb checking
    return false
  }

  private async generateNotificationTitle(message: Message, intelligence: any): Promise<string> {
    if (intelligence.urgencyScore > 80) {
      return `🚨 Urgent: ${message.subject}`
    } else if (intelligence.businessImpact > 70) {
      return `📈 Important: ${message.subject}`
    }
    return message.subject
  }

  private async generateNotificationContent(message: Message, intelligence: any): Promise<string> {
    const preview = message.content.substring(0, 100)
    return `From ${message.sender}: ${preview}${message.content.length > 100 ? '...' : ''}`
  }

  private async generateDigestWithAI(notifications: any[], timeframe: string): Promise<any> {
    // AI-powered digest generation would go here
    return {
      summary: `${notifications.length} notifications in the last ${timeframe}`,
      priorityItems: [],
      trends: [],
      recommendations: []
    }
  }

  private calculateNotificationTrends(notifications: any[]): any {
    // Calculate notification trends
    return {
      dailyVolume: [],
      priorityDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
      responseTime: 0
    }
  }

  private async generateNotificationRecommendations(notifications: any[], channelPerformance: any): Promise<string[]> {
    // Generate recommendations based on analytics
    return ['Consider adjusting notification frequency during peak hours']
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        push: { enabled: true },
        email: { enabled: true },
        sms: { enabled: false },
        slack: { enabled: false },
        teams: { enabled: false }
      },
      batchDelivery: {
        enabled: false,
        interval: 15,
        maxBatchSize: 5
      },
      intelligentSummary: {
        enabled: true,
        threshold: 10
      },
      doNotDisturb: {
        enabled: false
      },
      priorities: {
        critical: { enabled: true, immediateDelivery: true, channels: ['push', 'email', 'sms'] },
        high: { enabled: true, immediateDelivery: true, channels: ['push', 'email'] },
        medium: { enabled: true, immediateDelivery: false, channels: ['push'] },
        low: { enabled: false, immediateDelivery: false, channels: [] }
      }
    }
  }
}

// Singleton instance
export const smartNotificationService = new SmartNotificationService()