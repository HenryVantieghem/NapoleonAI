import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    // Authenticate user (admin check would go here in production)
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const userId = searchParams.get('userId') || user.id

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate time range
    const now = new Date()
    const timeRangeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    }
    const hoursBack = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 24
    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)

    // Mock processing analytics for MVP
    const processingAnalytics = {
      totalProcessed: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      successRate: 95
    }

    // Get message processing stats from database
    const { data: processedMessages } = await supabase
      .from('messages')
      .select('id, priority_score, ai_summary, sentiment, is_vip, created_at, updated_at')
      .eq('user_id', userId)
      .gte('updated_at', startTime.toISOString())
      .not('ai_summary', 'is', null)

    const { data: allMessages } = await supabase
      .from('messages')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', startTime.toISOString())

    // Get action items stats
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('id, priority, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', startTime.toISOString())

    // Mock VIP contact analytics for MVP
    const vipAnalytics = {
      totalVips: 5,
      categoryBreakdown: {
        board_member: 2,
        investor: 2,
        partner: 1
      },
      recommendations: ['Add more VIP contacts for better prioritization']
    }

    // Calculate processing statistics
    const totalMessages = allMessages?.length || 0
    const processedCount = processedMessages?.length || 0
    const processingRate = totalMessages > 0 ? (processedCount / totalMessages) * 100 : 0

    // Priority distribution
    const priorityDistribution = {
      critical: processedMessages?.filter(m => m.priority_score >= 80).length || 0,
      high: processedMessages?.filter(m => m.priority_score >= 60 && m.priority_score < 80).length || 0,
      medium: processedMessages?.filter(m => m.priority_score >= 40 && m.priority_score < 60).length || 0,
      low: processedMessages?.filter(m => m.priority_score < 40).length || 0
    }

    // Sentiment distribution
    const sentimentDistribution = {
      positive: processedMessages?.filter(m => m.sentiment === 'positive').length || 0,
      neutral: processedMessages?.filter(m => m.sentiment === 'neutral').length || 0,
      negative: processedMessages?.filter(m => m.sentiment === 'negative').length || 0,
      urgent: processedMessages?.filter(m => m.sentiment === 'urgent').length || 0
    }

    // VIP processing stats
    const vipProcessedCount = processedMessages?.filter(m => m.is_vip).length || 0
    const vipProcessingRate = processedCount > 0 ? (vipProcessedCount / processedCount) * 100 : 0

    // Action items stats
    const actionItemsStats = {
      total: actionItems?.length || 0,
      pending: actionItems?.filter(a => a.status === 'pending').length || 0,
      in_progress: actionItems?.filter(a => a.status === 'in_progress').length || 0,
      completed: actionItems?.filter(a => a.status === 'completed').length || 0,
      urgent: actionItems?.filter(a => a.priority === 'high').length || 0,
      high: actionItems?.filter(a => a.priority === 'high').length || 0
    }

    // Calculate average processing time (mock data for demo)
    const avgProcessingTime = Math.floor(300 + Math.random() * 200) // 300-500ms

    // Calculate cost estimates
    const avgTokensPerMessage = processingAnalytics.totalTokensUsed / Math.max(1, processingAnalytics.totalProcessed)
    const avgCostPerMessage = processingAnalytics.totalCost / Math.max(1, processingAnalytics.totalProcessed)
    const dailyCostEstimate = avgCostPerMessage * (totalMessages * (24 / hoursBack))

    // Performance metrics
    const performanceMetrics = {
      processingRate: Math.round(processingRate * 100) / 100,
      averageProcessingTime: avgProcessingTime,
      averageTokensPerMessage: Math.round(avgTokensPerMessage),
      averageCostPerMessage: Math.round(avgCostPerMessage * 10000) / 10000,
      dailyCostEstimate: Math.round(dailyCostEstimate * 100) / 100,
      successRate: processingAnalytics.successRate,
      confidence: Math.round(85 + Math.random() * 10) // Mock confidence score
    }

    // Hourly processing timeline (for charts)
    const hourlyTimeline = []
    for (let i = Math.min(24, hoursBack); i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000)
      
      const hourMessages = processedMessages?.filter(m => {
        const messageTime = new Date(m.updated_at)
        return messageTime >= hourStart && messageTime < hourEnd
      }) || []

      hourlyTimeline.push({
        hour: hourStart.toISOString(),
        processed: hourMessages.length,
        vipCount: hourMessages.filter(m => m.is_vip).length,
        highPriority: hourMessages.filter(m => m.priority_score >= 70).length,
        avgPriority: hourMessages.length > 0 
          ? Math.round(hourMessages.reduce((sum, m) => sum + m.priority_score, 0) / hourMessages.length)
          : 0
      })
    }

    // Executive insights and recommendations
    const executiveInsights = await generateExecutiveInsights(
      priorityDistribution,
      vipAnalytics,
      performanceMetrics,
      actionItemsStats
    )

    const response = {
      timeRange,
      timestamp: now.toISOString(),
      overview: {
        totalMessages,
        processedMessages: processedCount,
        processingRate: performanceMetrics.processingRate,
        vipMessages: vipProcessedCount,
        vipProcessingRate: Math.round(vipProcessingRate * 100) / 100,
        actionItemsGenerated: actionItemsStats.total
      },
      performance: performanceMetrics,
      priorityDistribution,
      sentimentDistribution,
      actionItemsStats,
      vipAnalytics,
      hourlyTimeline,
      executiveInsights,
      recommendations: vipAnalytics.recommendations,
      costAnalysis: {
        totalCost: processingAnalytics.totalCost,
        totalTokens: processingAnalytics.totalTokensUsed,
        avgCostPerMessage: avgCostPerMessage,
        dailyEstimate: dailyCostEstimate,
        monthlyEstimate: dailyCostEstimate * 30,
        efficiency: avgTokensPerMessage < 1500 ? 'High' : avgTokensPerMessage < 2500 ? 'Medium' : 'Low'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI metrics API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch AI metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate executive insights based on AI processing data
 */
async function generateExecutiveInsights(
  priorityDistribution: any,
  vipAnalytics: any,
  performanceMetrics: any,
  actionItemsStats: any
): Promise<{
  insights: string[]
  alerts: string[]
  optimizations: string[]
  trends: string[]
}> {
  const insights: string[] = []
  const alerts: string[] = []
  const optimizations: string[] = []
  const trends: string[] = []

  // Processing efficiency insights
  if (performanceMetrics.processingRate >= 95) {
    insights.push('AI processing pipeline operating at optimal efficiency (95%+ processed)')
  } else if (performanceMetrics.processingRate < 80) {
    alerts.push(`Processing rate below target (${performanceMetrics.processingRate}% - target: 90%+)`)
  }

  // Priority distribution analysis
  const totalPriority = Object.values(priorityDistribution).reduce((a: unknown, b: unknown) => (a as number) + (b as number), 0) as number
  if (totalPriority > 0) {
    const criticalPercentage = (priorityDistribution.critical / totalPriority) * 100
    if (criticalPercentage > 25) {
      alerts.push(`High critical message volume (${Math.round(criticalPercentage)}% - consider workflow optimization)`)
    } else if (criticalPercentage < 5) {
      insights.push('Healthy message priority distribution - most communications are manageable priority')
    }
  }

  // VIP contact insights
  if (vipAnalytics.totalVips < 5) {
    optimizations.push('Consider expanding VIP contact list to improve message prioritization')
  } else if (vipAnalytics.totalVips > 50) {
    optimizations.push('Large VIP contact list - consider prioritization refinement')
  }

  // Action items analysis
  const actionItemCompletionRate = actionItemsStats.total > 0 
    ? (actionItemsStats.completed / actionItemsStats.total) * 100 
    : 0
    
  if (actionItemCompletionRate < 60) {
    alerts.push(`Action item completion rate low (${Math.round(actionItemCompletionRate)}% - target: 80%+)`)
  }

  // Cost optimization insights
  if (performanceMetrics.averageTokensPerMessage > 2000) {
    optimizations.push('Token usage above optimal range - consider prompt optimization')
  }

  // Performance trends (mock data for demo)
  trends.push('Message volume increased 15% over last 7 days')
  trends.push('VIP message processing time improved by 8%')
  trends.push('Critical priority detection accuracy at 94%')

  // Executive recommendations
  if (vipAnalytics.categoryBreakdown.board_member === 0) {
    optimizations.push('Add board members to VIP contacts for governance communication prioritization')
  }

  return { insights, alerts, optimizations, trends }
}