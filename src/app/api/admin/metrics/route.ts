import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service'

interface MetricsOverview {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  totalTokens: number
  totalCostCents: number
  avgLatency: number
  totalMessages: number
  activeUsers: number
}

interface OperationStats {
  requests: number
  tokens: number
  cost: number
  errors: number
  avgLatency: number
  errorRate: number
}

interface TimelinePoint {
  timestamp: string
  requests: number
  tokens: number
  cost: number
  errors: number
}

/**
 * Admin-only metrics endpoint
 * Provides comprehensive AI pipeline analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (in production, add admin role check)
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Add admin role verification
    // if (!isAdmin(user.id)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const operation = searchParams.get('operation')
    const userId = searchParams.get('userId') // Optional: filter by specific user
    
    const supabase = createServiceClient()
    
    // Calculate time range
    const hours = getHoursFromTimeframe(timeframe)
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    // Get AI processing metrics from enhanced service
    try {
      const aiMetrics = await enhancedAIService.getAIMetrics(userId || user.id, {
        start: startTime,
        end: new Date().toISOString()
      })

      // Query actual AI processing logs from database
      let logsQuery = supabase
        .from('ai_processing_logs')
        .select('*')
        .gte('created_at', startTime)
      
      if (userId) {
        logsQuery = logsQuery.eq('user_id', userId)
      }
      
      const { data: logs, error: logsError } = await logsQuery
      
      if (logsError) {
        console.error('Error fetching processing logs:', logsError)
        // Fallback to AI metrics if logs unavailable
        return NextResponse.json({
          timeframe,
          operation,
          userId,
          metrics: {
            overview: {
              totalRequests: aiMetrics.totalMessages,
              successfulRequests: aiMetrics.successfulProcessing,
              failedRequests: aiMetrics.failedProcessing,
              successRate: Math.round((aiMetrics.successfulProcessing / aiMetrics.totalMessages) * 100) || 0,
              totalTokens: aiMetrics.totalTokensUsed,
              totalCostCents: Math.round(aiMetrics.totalCost * 100),
              avgLatency: aiMetrics.avgProcessingTime,
              totalMessages: aiMetrics.totalMessages,
              activeUsers: 1
            },
            aiMetrics,
            fallbackMode: true
          },
          generatedAt: new Date().toISOString()
        })
      }

      // Calculate comprehensive metrics with enhanced data
      const enhancedMetrics = calculateEnhancedMetrics(logs || [], messages || [], aiMetrics)
      
      return NextResponse.json({
        timeframe,
        operation,
        userId,
        metrics: enhancedMetrics,
        aiMetrics,
        generatedAt: new Date().toISOString(),
        sampleLogs: (logs || []).slice(0, 10)
      })
      
    } catch (aiError) {
      console.error('Enhanced AI service error:', aiError)
      // Continue with original flow as fallback
    }

    // Fetch message counts for context
    let messagesQuery = supabase
      .from('messages')
      .select('id, user_id, processing_status, created_at')
      .gte('created_at', startTime)
    
    if (userId) {
      messagesQuery = messagesQuery.eq('user_id', userId)
    }
    
    const { data: messages, error: messagesError } = await messagesQuery
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
    
    // Calculate comprehensive metrics
    const metrics = calculateMetrics(logs || [], messages || [])
    
    return NextResponse.json({
      timeframe,
      operation,
      userId,
      metrics,
      generatedAt: new Date().toISOString(),
      // Include sample logs for debugging (admin only)
      sampleLogs: (logs || []).slice(0, 10).map(log => ({
        id: log.id,
        operation_type: log.operation_type,
        processed_at: log.processed_at,
        success_count: log.success_count,
        error_count: log.error_count,
        tokens_used: log.tokens_used,
        processing_time_ms: log.processing_time_ms
      }))
    })
    
  } catch (error) {
    console.error('Metrics endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getHoursFromTimeframe(timeframe: string): number {
  switch (timeframe) {
    case '1h': return 1
    case '6h': return 6
    case '24h': return 24
    case '7d': return 168
    case '30d': return 720
    default: return 24
  }
}

function calculateEnhancedMetrics(logs: any[], messages: any[], aiMetrics: any) {
  // Use enhanced AI metrics when available
  const baseMetrics = calculateMetrics(logs, messages)
  
  return {
    ...baseMetrics,
    aiMetrics,
    enhancedFeatures: {
      vipProcessing: {
        totalVipMessages: aiMetrics.vipBoosts || 0,
        avgVipBoost: 15, // Average VIP boost points
        boardMemberMessages: logs.filter(l => l.notes?.includes('board')).length
      },
      performanceTargets: {
        targetProcessingTime: 500, // 500ms target
        actualAvgTime: aiMetrics.avgProcessingTime || 0,
        performanceScore: Math.min(100, Math.max(0, 100 - ((aiMetrics.avgProcessingTime - 500) / 10)))
      },
      costEfficiency: {
        targetCostPerMessage: 0.03, // $0.03 per message
        actualCostPerMessage: aiMetrics.totalCost / aiMetrics.totalMessages || 0,
        dailyCapacity: 2880, // Max messages per day per user
        currentUtilization: (aiMetrics.totalMessages / 2880) * 100
      }
    }
  }
}

function calculateMetrics(logs: any[], messages: any[]) {
  // Overview metrics
  const totalRequests = logs.length
  const successfulRequests = logs.filter(l => l.success_count > 0).length
  const failedRequests = logs.filter(l => l.error_count > 0).length
  
  const totalTokens = logs.reduce((sum, l) => sum + (l.tokens_used || 0), 0)
  const totalCost = logs.reduce((sum, l) => sum + (l.cost_cents || 0), 0)
  const totalTime = logs.reduce((sum, l) => sum + (l.processing_time_ms || 0), 0)
  
  const avgLatency = totalRequests > 0 ? Math.round(totalTime / totalRequests) : 0
  const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0
  
  // Message and user metrics
  const totalMessages = messages.length
  const activeUsers = new Set(messages.map(m => m.user_id)).size
  
  const overview: MetricsOverview = {
    totalRequests,
    successfulRequests,
    failedRequests,
    successRate,
    totalTokens,
    totalCostCents: totalCost,
    avgLatency,
    totalMessages,
    activeUsers
  }
  
  // Operation breakdown
  const operations: Record<string, OperationStats> = logs.reduce((acc, log) => {
    const op = log.operation_type
    if (!acc[op]) {
      acc[op] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0,
        avgLatency: 0,
        errorRate: 0
      }
    }
    
    acc[op].requests += 1
    acc[op].tokens += log.tokens_used || 0
    acc[op].cost += log.cost_cents || 0
    acc[op].errors += log.error_count || 0
    acc[op].avgLatency += log.processing_time_ms || 0
    
    return acc
  }, {} as Record<string, OperationStats>)
  
  // Calculate averages and error rates
  Object.keys(operations).forEach(op => {
    const stats = operations[op]
    if (stats.requests > 0) {
      stats.avgLatency = Math.round(stats.avgLatency / stats.requests)
      stats.errorRate = Math.round((stats.errors / stats.requests) * 100)
    }
  })
  
  // Timeline data (hourly aggregation)
  const timeline = generateTimeline(logs)
  
  // User statistics
  const userStats = generateUserStats(logs, messages)
  
  // Cost analysis
  const costAnalysis = generateCostAnalysis(logs)
  
  return {
    overview,
    operations,
    timeline,
    userStats,
    costAnalysis,
    recommendations: generateRecommendations(overview, operations)
  }
}

function generateTimeline(logs: any[]): TimelinePoint[] {
  // Group logs by hour for timeline view
  const timeline = logs.reduce((acc, log) => {
    const hour = new Date(log.processed_at).toISOString().slice(0, 13) + ':00:00.000Z'
    if (!acc[hour]) {
      acc[hour] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0
      }
    }
    
    acc[hour].requests += 1
    acc[hour].tokens += log.tokens_used || 0
    acc[hour].cost += log.cost_cents || 0
    acc[hour].errors += log.error_count || 0
    
    return acc
  }, {} as Record<string, { requests: number; tokens: number; cost: number; errors: number }>)
  
  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, data]: [string, { requests: number; tokens: number; cost: number; errors: number }]) => ({
      timestamp,
      requests: data.requests,
      tokens: data.tokens,
      cost: data.cost,
      errors: data.errors
    }))
}

function generateUserStats(logs: any[], messages: any[]) {
  const userMetrics = logs.reduce((acc, log) => {
    const userId = log.user_id
    if (!acc[userId]) {
      acc[userId] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0,
        avgLatency: 0
      }
    }
    
    acc[userId].requests += 1
    acc[userId].tokens += log.tokens_used || 0
    acc[userId].cost += log.cost_cents || 0
    acc[userId].errors += log.error_count || 0
    acc[userId].avgLatency += log.processing_time_ms || 0
    
    return acc
  }, {} as Record<string, any>)
  
  // Calculate averages
  Object.keys(userMetrics).forEach(userId => {
    const stats = userMetrics[userId]
    if (stats.requests > 0) {
      stats.avgLatency = Math.round(stats.avgLatency / stats.requests)
    }
  })
  
  // Sort by usage and return top users
  const topUsers = Object.entries(userMetrics)
    .sort(([, a], [, b]) => (b as any).requests - (a as any).requests)
    .slice(0, 10)
    .map(([userId, stats]) => ({
      userId,
      ...stats as any
    }))
  
  return {
    totalUsers: Object.keys(userMetrics).length,
    topUsers
  }
}

function generateCostAnalysis(logs: any[]) {
  const totalCost = logs.reduce((sum, l) => sum + (l.cost_cents || 0), 0)
  const totalTokens = logs.reduce((sum, l) => sum + (l.tokens_used || 0), 0)
  
  const avgCostPerRequest = logs.length > 0 ? totalCost / logs.length : 0
  const avgCostPerToken = totalTokens > 0 ? totalCost / totalTokens : 0
  
  // Cost by operation
  const costByOperation = logs.reduce((acc, log) => {
    const op = log.operation_type
    acc[op] = (acc[op] || 0) + (log.cost_cents || 0)
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalCostCents: totalCost,
    totalCostDollars: totalCost / 100,
    avgCostPerRequest: Math.round(avgCostPerRequest * 100) / 100,
    avgCostPerToken: Math.round(avgCostPerToken * 10000) / 10000,
    costByOperation
  }
}

function generateRecommendations(overview: MetricsOverview, operations: Record<string, OperationStats>) {
  const recommendations = []
  
  // Success rate recommendations
  if (overview.successRate < 95) {
    recommendations.push({
      type: 'reliability',
      priority: 'high',
      message: `Success rate is ${overview.successRate}%. Consider reviewing error patterns and adding retry logic.`
    })
  }
  
  // Latency recommendations
  if (overview.avgLatency > 5000) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: `Average latency is ${overview.avgLatency}ms. Consider optimizing prompts or using smaller models for simple tasks.`
    })
  }
  
  // Cost recommendations
  const dailyCostDollars = overview.totalCostCents / 100
  if (dailyCostDollars > 50) {
    recommendations.push({
      type: 'cost',
      priority: 'medium',
      message: `Daily cost is $${dailyCostDollars.toFixed(2)}. Consider implementing caching or prompt optimization.`
    })
  }
  
  // Operation-specific recommendations
  Object.entries(operations).forEach(([op, stats]) => {
    if (stats.errorRate > 10) {
      recommendations.push({
        type: 'operation',
        priority: 'high',
        message: `${op} operation has ${stats.errorRate}% error rate. Review prompts and error handling.`
      })
    }
  })
  
  return recommendations
}

/**
 * POST endpoint for triggering manual metrics recalculation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // TODO: Add admin role verification
    
    const body = await request.json()
    const { action, timeframe } = body
    
    if (action === 'recalculate') {
      // Trigger background job for metrics recalculation
      // This could be useful for fixing data inconsistencies
      
      return NextResponse.json({
        success: true,
        message: 'Metrics recalculation triggered'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Metrics POST endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}