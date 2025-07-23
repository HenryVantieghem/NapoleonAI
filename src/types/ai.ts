// Simplified AI types for MVP

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'

export type ActionCategory = 
  | 'approval' 
  | 'review' 
  | 'decision' 
  | 'meeting' 
  | 'response'

export type BusinessImpactLevel = 'low' | 'medium' | 'high' | 'very-high'

export interface ActionItem {
  id: string
  messageId: string
  title: string
  description: string
  priority: PriorityLevel
  category: ActionCategory
  dueDate?: Date
  assignedTo?: string
  status: 'pending' | 'in_progress' | 'completed'
  businessImpact: BusinessImpactLevel
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  sender: string
  channel: string
  timestamp: Date
  content: string
  subject?: string
  priority?: PriorityLevel
  isVIP?: boolean
}

export interface AnalysisResult {
  priority: PriorityLevel
  confidence: number
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
  topics: string[]
  urgencyLevel: 'immediate' | 'today' | 'thisWeek' | 'normal'
  requiresAction: boolean
}

export interface CommunicationInsights {
  patterns: Array<{
    type: string
    frequency: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  recommendations: string[]
  trends: Array<{
    metric: string
    change: number
    period: string
  }>
  delegationOpportunities: Array<{
    task: string
    suggestion: string
    confidence: number
  }>
  efficiencyMetrics: {
    avgResponseTime: number
    tasksCompleted: number
    delegationRate: number
  }
  generatedAt: Date
}

export interface ExecutiveSummary {
  overview: string
  keyInsights: string[]
  urgentItems: ActionItem[]
  trends: {
    messageVolume: number
    responseTime: number
    priorityDistribution: Record<PriorityLevel, number>
  }
  recommendations: string[]
  generatedAt: Date
}

export interface DashboardData {
  priorityMessages: (Message & { analysis: AnalysisResult; summary: string })[]
  actionItems: ActionItem[]
  insights: CommunicationInsights
  decisions: any[]
  metrics: any
}

export interface DecisionContext {
  id: string
  summary: string
  stakeholders: string[]
  deadline?: Date
  impact: BusinessImpactLevel
  options: Array<{
    title: string
    pros: string[]
    cons: string[]
    recommendation?: boolean
  }>
  relatedMessages: string[]
  createdAt: Date
}

// Simplified error handling
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIError'
  }
}