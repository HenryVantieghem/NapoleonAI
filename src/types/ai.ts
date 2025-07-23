// Core message types for AI processing
export interface Message {
  id: string
  subject: string
  content: string
  sender: string
  senderRole?: string
  senderEmail?: string
  channel: 'gmail' | 'slack' | 'teams'
  timestamp: Date
  priority?: PriorityLevel
  isRead?: boolean
  threadId?: string
  attachments?: Attachment[]
  metadata?: Record<string, any>
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
}

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low'
export type UrgencyLevel = 'immediate' | 'today' | 'thisWeek' | 'normal'
export type SentimentLevel = 'positive' | 'neutral' | 'negative' | 'urgent'
export type BusinessImpact = 'very-high' | 'high' | 'medium' | 'low'
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type StakeholderLevel = 'board' | 'executive' | 'management' | 'staff' | 'external'

// AI Analysis Results
export interface AnalysisResult {
  messageId: string
  priority: PriorityLevel
  urgency: UrgencyLevel
  businessImpact: BusinessImpact
  sentiment: SentimentLevel
  topics: string[]
  actionRequired: boolean
  decisionRequired: boolean
  financialImpact: number
  stakeholderLevel: StakeholderLevel
  timeToDecision?: number // hours
  riskLevel: RiskLevel
  confidence: number // 0.0 - 1.0
  reasoning: string
  suggestedActions: string[]
  createdAt: Date
}

// Executive Summary
export interface ExecutiveSummary {
  messageId: string
  summary: string
  keyPoints: string[]
  decisionRequired?: string
  businessImpact: string
  recommendedAction: string
  timeframe?: string
  createdAt: Date
}

// Action Items
export interface ActionItem {
  id: string
  messageId: string
  title: string
  description: string
  priority: PriorityLevel
  category: ActionCategory
  status: ActionStatus
  dueDate?: Date
  estimatedDuration?: number // minutes
  assignedTo?: string
  businessImpact: BusinessImpact
  dependencies?: string[]
  createdAt: Date
  updatedAt: Date
}

export type ActionCategory = 
  | 'approval' 
  | 'review' 
  | 'decision' 
  | 'meeting' 
  | 'response' 
  | 'escalation'
  | 'legal'
  | 'financial'
  | 'strategic'
  | 'operational'

export type ActionStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'completed' 
  | 'overdue' 
  | 'cancelled'
  | 'delegated'

// Communication Insights
export interface CommunicationInsights {
  patterns: InsightPattern[]
  recommendations: Recommendation[]
  trends: Trend[]
  delegationOpportunities: DelegationOpportunity[]
  efficiencyMetrics: EfficiencyMetrics
  generatedAt: Date
}

export interface InsightPattern {
  type: 'volume' | 'timing' | 'priority' | 'response' | 'stakeholder'
  description: string
  impact: BusinessImpact
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: number
}

export interface Recommendation {
  category: 'time-management' | 'delegation' | 'process' | 'communication' | 'strategic'
  title: string
  description: string
  impact: BusinessImpact
  effort: 'low' | 'medium' | 'high'
  priority: PriorityLevel
  actionItems: string[]
}

export interface Trend {
  metric: string
  current: number
  previous: number
  change: number // percentage
  direction: 'up' | 'down' | 'stable'
  timeframe: string
}

export interface DelegationOpportunity {
  messageType: string
  frequency: number
  potentialTimeSaved: number // minutes per week
  suggestedDelegate: string
  riskLevel: RiskLevel
  reasoning: string
}

export interface EfficiencyMetrics {
  averageResponseTime: number // minutes
  messageVolume: number
  priorityDistribution: Record<PriorityLevel, number>
  channelDistribution: Record<string, number>
  actionItemCompletion: number // percentage
  delegationRate: number // percentage
  decisionSpeed: number // average hours to decision
}

// Strategic Decision Context
export interface DecisionContext {
  messageId: string
  decisionType: DecisionType
  stakeholders: Stakeholder[]
  timeline: Timeline
  riskAssessment: RiskAssessment
  options: DecisionOption[]
  recommendations: string[]
  precedents: string[]
  createdAt: Date
}

export type DecisionType = 
  | 'financial' 
  | 'strategic' 
  | 'operational' 
  | 'legal' 
  | 'hr' 
  | 'technology'
  | 'partnership'
  | 'acquisition'

export interface Stakeholder {
  name: string
  role: string
  influence: 'high' | 'medium' | 'low'
  position: 'supporter' | 'neutral' | 'opposition' | 'unknown'
}

export interface Timeline {
  deadline?: Date
  milestones: Milestone[]
  criticalPath: string[]
}

export interface Milestone {
  name: string
  date: Date
  importance: PriorityLevel
  dependencies: string[]
}

export interface RiskAssessment {
  level: RiskLevel
  factors: RiskFactor[]
  mitigation: string[]
  contingency: string[]
}

export interface RiskFactor {
  type: 'financial' | 'reputational' | 'operational' | 'legal' | 'competitive'
  description: string
  probability: number // 0.0 - 1.0
  impact: BusinessImpact
}

export interface DecisionOption {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  cost: number
  timeline: string
  riskLevel: RiskLevel
  recommendationScore: number // 0.0 - 1.0
}

// AI Processing Pipeline Types
export interface ProcessingJob {
  id: string
  type: ProcessingJobType
  messageId: string
  status: JobStatus
  priority: PriorityLevel
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  result?: any
  retryCount: number
}

export type ProcessingJobType = 
  | 'analysis' 
  | 'summarization' 
  | 'action-extraction'
  | 'insight-generation'
  | 'decision-context'

export type JobStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'retry'

// Executive Dashboard Data
export interface DashboardData {
  priorityMessages: Message[]
  actionItems: ActionItem[]
  insights: CommunicationInsights
  metrics: EfficiencyMetrics
  decisions: DecisionContext[]
  lastUpdated: Date
}

// AI Service Configuration
export interface AIServiceConfig {
  models: {
    analysis: string
    summarization: string
    extraction: string
    insights: string
  }
  timeouts: {
    standard: number
    complex: number
  }
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    baseDelay: number
  }
  rateLimits: {
    requestsPerMinute: number
    requestsPerHour: number
  }
}