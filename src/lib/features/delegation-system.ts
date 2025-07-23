import { supabase } from '@/lib/supabase/client'
import { unifiedMessageService } from '@/lib/integrations/unified-message-service'
import { vipTrackingService } from './vip-tracking'
import { openai, AI_MODELS, AI_CONFIG } from '@/lib/ai/openai-client'
import { Message, PriorityLevel } from '@/types/ai'

export interface DelegationRule {
  id: string
  userId: string
  name: string
  description: string
  isActive: boolean
  priority: number
  conditions: DelegationCondition[]
  actions: DelegationAction[]
  delegateTo: string // User ID or role
  approvalRequired: boolean
  escalationRules?: EscalationRule[]
  createdAt: Date
  updatedAt: Date
}

export interface DelegationCondition {
  type: 'sender' | 'subject' | 'content' | 'priority' | 'platform' | 'time' | 'vip_level'
  operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: string | string[] | number
  metadata?: Record<string, any>
}

export interface DelegationAction {
  type: 'delegate' | 'notify' | 'template_response' | 'schedule_meeting' | 'add_note' | 'escalate'
  value: string
  delay?: number // minutes
  metadata?: Record<string, any>
}

export interface EscalationRule {
  trigger: 'no_response' | 'deadline_approaching' | 'manual' | 'error'
  timeLimit: number // minutes
  escalateTo: string
  notification: string
}

export interface DelegationTask {
  id: string
  userId: string // Original message owner
  messageId: string
  delegatedTo: string
  delegatedBy: string
  status: DelegationStatus
  priority: PriorityLevel
  dueDate?: Date
  instructions: string
  context: DelegationContext
  response?: string
  feedback?: string
  completedAt?: Date
  escalatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type DelegationStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'escalated' | 'rejected'

export interface DelegationContext {
  originalMessage: Message
  threadMessages?: Message[]
  relatedMessages?: Message[]
  vipInfo?: {
    isVIP: boolean
    level?: string
  }
  businessContext?: string
  suggestedActions?: string[]
}

export interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  role: string
  department: string
  skills: string[]
  availability: TeamMemberAvailability
  workload: {
    current: number
    capacity: number
  }
  delegationHistory: {
    totalTasks: number
    completionRate: number
    avgResponseTime: number
    avgQualityScore: number
  }
  preferences: {
    platforms: string[]
    messageTypes: string[]
    maxTasksPerDay: number
  }
  isActive: boolean
  createdAt: Date
}

export interface TeamMemberAvailability {
  status: 'available' | 'busy' | 'away' | 'offline'
  timezone: string
  workingHours: {
    start: string // HH:MM
    end: string   // HH:MM
    days: number[] // 0-6, Sunday-Saturday
  }
  currentLoad: number // 0-100
  nextAvailable?: Date
}

export class DelegationSystem {
  /**
   * Analyze message for delegation opportunities
   */
  async analyzeDelegationOpportunity(
    message: Message,
    userId: string
  ): Promise<{
    shouldDelegate: boolean
    confidence: number
    suggestedDelegates: TeamMember[]
    reasoning: string[]
    estimatedTimeToComplete: number
    businessImpact: 'high' | 'medium' | 'low'
  }> {
    try {
      // Get AI analysis of delegation potential
      const aiAnalysis = await this.analyzeDelegationWithAI(message)
      
      // Check delegation rules
      const ruleMatch = await this.evaluateDelegationRules(message, userId)
      
      // Get team members and their capabilities
      const teamMembers = await this.getTeamMembers(userId)
      const suggestedDelegates = await this.findBestDelegates(message, teamMembers, aiAnalysis)
      
      // Calculate final recommendation
      const shouldDelegate = 
        aiAnalysis.confidence > 0.7 || 
        ruleMatch.shouldDelegate ||
        message.priority === 'medium' || message.priority === 'low'
      
      return {
        shouldDelegate,
        confidence: Math.max(aiAnalysis.confidence, ruleMatch.confidence),
        suggestedDelegates: suggestedDelegates.slice(0, 3),
        reasoning: [
          ...aiAnalysis.reasoning,
          ...ruleMatch.reasoning
        ],
        estimatedTimeToComplete: aiAnalysis.estimatedTime,
        businessImpact: aiAnalysis.businessImpact
      }
    } catch (error) {
      console.error('Error analyzing delegation opportunity:', error)
      return {
        shouldDelegate: false,
        confidence: 0,
        suggestedDelegates: [],
        reasoning: ['Error in analysis'],
        estimatedTimeToComplete: 0,
        businessImpact: 'low'
      }
    }
  }

  /**
   * Create delegation task
   */
  async createDelegationTask(
    messageId: string,
    userId: string,
    delegatedTo: string,
    options: {
      instructions: string
      dueDate?: Date
      priority?: PriorityLevel
      context?: Partial<DelegationContext>
      autoAccept?: boolean
    }
  ): Promise<DelegationTask> {
    try {
      // Get message details
      const { data: message } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (!message) throw new Error('Message not found')

      // Get additional context
      const context = await this.buildDelegationContext(message, options.context)
      
      // Create delegation task
      const taskData = {
        user_id: userId,
        message_id: messageId,
        delegated_to: delegatedTo,
        delegated_by: userId,
        status: options.autoAccept ? 'accepted' : 'pending',
        priority: options.priority || message.priority || 'medium',
        due_date: options.dueDate?.toISOString(),
        instructions: options.instructions,
        context: context,
        created_at: new Date().toISOString()
      }

      const { data: task, error } = await supabase
        .from('delegation_tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) throw error

      // Send notification to delegate
      await this.notifyDelegate(task, 'new_task')
      
      // Update team member workload
      await this.updateTeamMemberWorkload(delegatedTo, 1)

      return task
    } catch (error) {
      throw new Error(`Failed to create delegation task: ${(error as Error).message}`)
    }
  }

  /**
   * Update delegation task status
   */
  async updateDelegationTask(
    taskId: string,
    updates: {
      status?: DelegationStatus
      response?: string
      feedback?: string
      completedAt?: Date
    }
  ): Promise<DelegationTask> {
    const { data: task, error } = await supabase
      .from('delegation_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error

    // Handle status changes
    if (updates.status === 'completed') {
      await this.handleTaskCompletion(task)
    } else if (updates.status === 'escalated') {
      await this.handleTaskEscalation(task)
    }

    return task
  }

  /**
   * Get delegation tasks for user
   */
  async getDelegationTasks(
    userId: string,
    filters?: {
      status?: DelegationStatus[]
      assignedToMe?: boolean
      assignedByMe?: boolean
      priority?: PriorityLevel[]
      dueSoon?: boolean
    }
  ): Promise<DelegationTask[]> {
    let query = supabase
      .from('delegation_tasks')
      .select(`
        *,
        messages(*),
        delegated_to_user:users!delegation_tasks_delegated_to_fkey(name, email),
        delegated_by_user:users!delegation_tasks_delegated_by_fkey(name, email)
      `)

    if (filters?.assignedToMe) {
      query = query.eq('delegated_to', userId)
    } else if (filters?.assignedByMe) {
      query = query.eq('delegated_by', userId)
    } else {
      query = query.or(`delegated_to.eq.${userId},delegated_by.eq.${userId}`)
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status)
    }

    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority)
    }

    if (filters?.dueSoon) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      query = query.lte('due_date', tomorrow.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Create delegation rule
   */
  async createDelegationRule(
    userId: string,
    rule: Omit<DelegationRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<DelegationRule> {
    const { data, error } = await supabase
      .from('delegation_rules')
      .insert({
        ...rule,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Manage team members
   */
  async addTeamMember(
    userId: string,
    memberData: Omit<TeamMember, 'id' | 'userId' | 'createdAt'>
  ): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        ...memberData,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTeamMembers(userId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  /**
   * Get delegation analytics
   */
  async getDelegationAnalytics(userId: string): Promise<{
    overview: {
      totalTasks: number
      activeTasks: number
      completedTasks: number
      avgCompletionTime: number
      teamUtilization: number
    }
    teamPerformance: Array<{
      member: TeamMember
      tasks: number
      completionRate: number
      avgResponseTime: number
      qualityScore: number
    }>
    trends: {
      delegationRate: number
      timesSaved: number
      efficiencyGain: number
    }
  }> {
    // Get task statistics
    const { data: tasks } = await supabase
      .from('delegation_tasks')
      .select('*')
      .eq('delegated_by', userId)

    const totalTasks = tasks?.length || 0
    const activeTasks = tasks?.filter(t => ['pending', 'accepted', 'in_progress'].includes(t.status)).length || 0
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0

    // Calculate completion time
    const completedTasksWithTime = tasks?.filter(t => t.status === 'completed' && t.completed_at) || []
    const avgCompletionTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const completionTime = new Date(task.completed_at!).getTime() - new Date(task.created_at).getTime()
          return sum + completionTime
        }, 0) / completedTasksWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0

    // Get team performance
    const teamMembers = await this.getTeamMembers(userId)
    const teamPerformance = await Promise.all(
      teamMembers.map(async member => {
        const memberTasks = tasks?.filter(t => t.delegated_to === member.id) || []
        const memberCompleted = memberTasks.filter(t => t.status === 'completed')
        
        return {
          member,
          tasks: memberTasks.length,
          completionRate: memberTasks.length > 0 ? (memberCompleted.length / memberTasks.length) * 100 : 0,
          avgResponseTime: member.delegationHistory.avgResponseTime,
          qualityScore: member.delegationHistory.avgQualityScore
        }
      })
    )

    // Calculate team utilization
    const teamUtilization = teamMembers.length > 0
      ? teamMembers.reduce((sum, member) => sum + member.workload.current, 0) / 
        teamMembers.reduce((sum, member) => sum + member.workload.capacity, 0) * 100
      : 0

    return {
      overview: {
        totalTasks,
        activeTasks,
        completedTasks,
        avgCompletionTime,
        teamUtilization
      },
      teamPerformance,
      trends: {
        delegationRate: totalTasks > 0 ? (totalTasks / (totalTasks + 100)) * 100 : 0, // Estimated
        timesSaved: completedTasks * 2, // Estimated 2 hours per task
        efficiencyGain: completedTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      }
    }
  }

  /**
   * Private helper methods
   */
  private async analyzeDelegationWithAI(message: Message): Promise<{
    confidence: number
    reasoning: string[]
    estimatedTime: number
    businessImpact: 'high' | 'medium' | 'low'
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are an executive assistant analyzing messages for delegation potential.
            
            Consider:
            - Task complexity and skill requirements
            - Time sensitivity and deadlines
            - Business impact and stakeholder importance
            - Executive vs. team member capabilities
            - Delegation safety and risk factors
            
            Provide practical delegation recommendations for executive productivity.`
          },
          {
            role: 'user',
            content: `Analyze this message for delegation potential:
            
            Subject: ${message.subject}
            From: ${message.sender} (${message.senderRole || 'Unknown role'})
            Content: ${message.content.substring(0, 500)}
            Channel: ${message.channel}
            
            Provide JSON with:
            - confidence: 0.0-1.0 delegation recommendation confidence
            - reasoning: array of delegation reasons/factors
            - estimatedTime: estimated completion time in minutes
            - businessImpact: high/medium/low business impact
            - suggestedRole: type of team member who should handle this`
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: 400,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        confidence: result.confidence || 0,
        reasoning: result.reasoning || [],
        estimatedTime: result.estimatedTime || 60,
        businessImpact: result.businessImpact || 'medium'
      }
    } catch (error) {
      return {
        confidence: 0,
        reasoning: ['AI analysis failed'],
        estimatedTime: 60,
        businessImpact: 'medium'
      }
    }
  }

  private async evaluateDelegationRules(message: Message, userId: string): Promise<{
    shouldDelegate: boolean
    confidence: number
    reasoning: string[]
    matchedRule?: DelegationRule
  }> {
    const { data: rules } = await supabase
      .from('delegation_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (!rules) return { shouldDelegate: false, confidence: 0, reasoning: [] }

    for (const rule of rules) {
      if (this.evaluateRuleConditions(rule.conditions, message)) {
        return {
          shouldDelegate: true,
          confidence: 1.0,
          reasoning: [`Matched delegation rule: ${rule.name}`],
          matchedRule: rule
        }
      }
    }

    return { shouldDelegate: false, confidence: 0, reasoning: [] }
  }

  private evaluateRuleConditions(conditions: DelegationCondition[], message: Message): boolean {
    return conditions.every(condition => {
      const messageValue = this.getMessageValueForCondition(message, condition.type)
      
      switch (condition.operator) {
        case 'equals':
          return messageValue === condition.value
        case 'contains':
          return typeof messageValue === 'string' && 
                 typeof condition.value === 'string' &&
                 messageValue.toLowerCase().includes(condition.value.toLowerCase())
        case 'not_equals':
          return messageValue !== condition.value
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(messageValue)
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(messageValue)
        default:
          return false
      }
    })
  }

  private getMessageValueForCondition(message: Message, type: string): string | number {
    switch (type) {
      case 'sender':
        return message.sender
      case 'subject':
        return message.subject
      case 'content':
        return message.content
      case 'priority':
        return message.priority || 'medium'
      case 'platform':
        return message.channel
      case 'time':
        return message.timestamp.getHours()
      default:
        return ''
    }
  }

  private async findBestDelegates(
    message: Message,
    teamMembers: TeamMember[],
    aiAnalysis: any
  ): Promise<TeamMember[]> {
    // Score team members based on various factors
    const scoredMembers = teamMembers.map(member => {
      let score = 0
      
      // Availability score
      if (member.availability.status === 'available') score += 50
      else if (member.availability.status === 'busy') score += 20
      
      // Workload score (prefer less loaded members)
      score += (100 - member.workload.current) * 0.3
      
      // Performance score
      score += member.delegationHistory.completionRate * 0.2
      score += (100 - member.delegationHistory.avgResponseTime) * 0.1
      
      // Skills match (simplified)
      if (message.channel === 'gmail' && member.skills.includes('email')) score += 20
      if (message.channel === 'slack' && member.skills.includes('slack')) score += 20
      if (message.channel === 'teams' && member.skills.includes('teams')) score += 20
      
      return { member, score }
    })
    
    return scoredMembers
      .sort((a, b) => b.score - a.score)
      .map(item => item.member)
  }

  private async buildDelegationContext(
    message: Message,
    additionalContext?: Partial<DelegationContext>
  ): Promise<DelegationContext> {
    // Get VIP information
    const vipResult = await vipTrackingService.analyzeMessageSender(message, message.userId || '')
    
    return {
      originalMessage: message,
      vipInfo: {
        isVIP: vipResult.isVIP,
        level: vipResult.vipLevel
      },
      businessContext: additionalContext?.businessContext,
      suggestedActions: additionalContext?.suggestedActions || [],
      ...additionalContext
    }
  }

  private async notifyDelegate(task: DelegationTask, type: string): Promise<void> {
    // Send notification via email, Slack, or Teams
    // Implementation depends on preferred notification method
    console.log(`Notifying delegate ${task.delegatedTo} about ${type} for task ${task.id}`)
  }

  private async updateTeamMemberWorkload(memberId: string, change: number): Promise<void> {
    await supabase.rpc('update_team_member_workload', {
      member_id: memberId,
      workload_change: change
    })
  }

  private async handleTaskCompletion(task: DelegationTask): Promise<void> {
    // Update team member performance metrics
    await this.updateTeamMemberWorkload(task.delegatedTo, -1)
    
    // Send completion notification
    await this.notifyDelegate(task, 'completed')
  }

  private async handleTaskEscalation(task: DelegationTask): Promise<void> {
    // Notify executive about escalation
    await this.notifyDelegate(task, 'escalated')
  }
}

// Singleton instance
export const delegationSystem = new DelegationSystem()