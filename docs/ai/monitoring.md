# Napoleon AI - Monitoring & Logging

## Overview

This document outlines the monitoring and logging infrastructure for Napoleon AI's AI processing pipeline, including Vercel AI Gateway integration, metrics collection, and observability dashboard.

## Architecture Components

### 1. Vercel AI Gateway
- **Purpose**: Centralized AI API management, monitoring, and cost tracking
- **Integration**: Proxy for OpenAI API calls with enhanced observability
- **Benefits**: Request/response logging, latency metrics, error tracking, cost monitoring

### 2. Database Logging
- **Table**: `ai_processing_logs`
- **Purpose**: Persistent storage of AI operation metrics
- **Retention**: 90 days (configurable)

### 3. Real-time Metrics
- **Dashboard**: Live monitoring of AI pipeline performance
- **Alerts**: Automated notifications for errors and thresholds
- **Reports**: Daily/weekly AI usage summaries

## Vercel AI Gateway Setup

### Configuration

```typescript
// lib/ai/gateway-client.ts
import { createOpenAI } from '@ai-sdk/openai'

const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.VERCEL_AI_GATEWAY_URL, // Vercel AI Gateway URL
  headers: {
    'x-vercel-ai-gateway-project': process.env.VERCEL_PROJECT_ID!,
    'x-vercel-ai-gateway-environment': process.env.NODE_ENV!,
  }
})

export { openaiClient }
```

### Environment Variables

```bash
# Vercel AI Gateway
VERCEL_AI_GATEWAY_URL=https://gateway.ai.vercel.com/v1
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=your_team_id

# Monitoring
VERCEL_API_TOKEN=your_vercel_api_token
```

## Metrics Collection

### Core Metrics

1. **Request Metrics**
   - Total API requests per hour/day
   - Success rate (%)
   - Average response time (ms)
   - Token usage per request

2. **Cost Metrics**
   - Total spend per day/month
   - Cost per user
   - Cost per operation type (summarize, priority, extract)
   - Budget utilization (%)

3. **Error Metrics**
   - Error rate by type
   - Failed request count
   - Retry attempts
   - Rate limit hits

4. **User Metrics**
   - Active users with AI processing
   - Messages processed per user
   - Feature adoption rates

### Database Schema Enhancement

```sql
-- Enhanced ai_processing_logs table
ALTER TABLE ai_processing_logs ADD COLUMN IF NOT EXISTS
  request_id text,
  gateway_request_id text,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  cache_hit boolean DEFAULT false,
  rate_limited boolean DEFAULT false,
  retry_count integer DEFAULT 0;

-- Add indexes for monitoring queries
CREATE INDEX IF NOT EXISTS idx_ai_logs_monitoring 
ON ai_processing_logs (processed_at, operation_type, user_id);

CREATE INDEX IF NOT EXISTS idx_ai_logs_errors 
ON ai_processing_logs (processed_at) 
WHERE error_count > 0;
```

## Monitoring Dashboard

### API Endpoint: `/src/app/api/admin/metrics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const operation = searchParams.get('operation')
    
    const supabase = createServiceClient()
    
    // Calculate time range
    const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    // Base query
    let query = supabase
      .from('ai_processing_logs')
      .select('*')
      .gte('processed_at', startTime)
    
    if (operation) {
      query = query.eq('operation_type', operation)
    }
    
    const { data: logs, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Calculate metrics
    const metrics = calculateMetrics(logs)
    
    return NextResponse.json({
      timeframe,
      operation,
      metrics,
      logs: logs.slice(0, 100) // Latest 100 for debugging
    })
    
  } catch (error) {
    console.error('Metrics endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateMetrics(logs: any[]) {
  const totalRequests = logs.length
  const successfulRequests = logs.filter(l => l.success_count > 0).length
  const failedRequests = logs.filter(l => l.error_count > 0).length
  
  const totalTokens = logs.reduce((sum, l) => sum + (l.tokens_used || 0), 0)
  const totalCost = logs.reduce((sum, l) => sum + (l.cost_cents || 0), 0)
  const totalTime = logs.reduce((sum, l) => sum + (l.processing_time_ms || 0), 0)
  
  const avgLatency = totalRequests > 0 ? Math.round(totalTime / totalRequests) : 0
  const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0
  
  // Group by operation type
  const operationStats = logs.reduce((acc, log) => {
    const op = log.operation_type
    if (!acc[op]) {
      acc[op] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0,
        avgLatency: 0
      }
    }
    
    acc[op].requests += 1
    acc[op].tokens += log.tokens_used || 0
    acc[op].cost += log.cost_cents || 0
    acc[op].errors += log.error_count || 0
    acc[op].avgLatency += log.processing_time_ms || 0
    
    return acc
  }, {})
  
  // Calculate averages
  Object.keys(operationStats).forEach(op => {
    const stats = operationStats[op]
    stats.avgLatency = Math.round(stats.avgLatency / stats.requests)
    stats.errorRate = Math.round((stats.errors / stats.requests) * 100)
  })
  
  return {
    overview: {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      totalTokens,
      totalCostCents: totalCost,
      avgLatency
    },
    operations: operationStats,
    timeline: generateTimeline(logs)
  }
}

function generateTimeline(logs: any[]) {
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
  }, {})
  
  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, data]) => ({
      timestamp,
      ...data
    }))
}
```

## Alerting System

### Alert Configuration

```typescript
// lib/monitoring/alerts.ts
interface AlertRule {
  name: string
  condition: (metrics: any) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  cooldown: number // minutes
  channels: string[] // email, slack, webhook
}

const alertRules: AlertRule[] = [
  {
    name: 'High Error Rate',
    condition: (metrics) => metrics.overview.successRate < 90,
    severity: 'high',
    cooldown: 15,
    channels: ['email', 'slack']
  },
  {
    name: 'Cost Threshold Exceeded',
    condition: (metrics) => metrics.overview.totalCostCents > 10000, // $100/day
    severity: 'medium',
    cooldown: 60,
    channels: ['email']
  },
  {
    name: 'High Latency',
    condition: (metrics) => metrics.overview.avgLatency > 10000, // 10 seconds
    severity: 'medium',
    cooldown: 30,
    channels: ['slack']
  },
  {
    name: 'No Processing Activity',
    condition: (metrics) => metrics.overview.totalRequests === 0,
    severity: 'low',
    cooldown: 120,
    channels: ['email']
  }
]

export async function checkAlerts() {
  // Fetch recent metrics
  const metrics = await fetchMetrics('1h')
  
  for (const rule of alertRules) {
    if (rule.condition(metrics)) {
      await triggerAlert(rule, metrics)
    }
  }
}

async function triggerAlert(rule: AlertRule, metrics: any) {
  // Check cooldown
  const lastAlert = await getLastAlert(rule.name)
  if (lastAlert && Date.now() - lastAlert < rule.cooldown * 60 * 1000) {
    return // Still in cooldown
  }
  
  // Record alert
  await recordAlert(rule.name, rule.severity, metrics)
  
  // Send notifications
  for (const channel of rule.channels) {
    await sendNotification(channel, rule, metrics)
  }
}
```

### Webhook Integration

```typescript
// lib/monitoring/webhooks.ts
export async function sendSlackAlert(rule: AlertRule, metrics: any) {
  if (!process.env.SLACK_WEBHOOK_URL) return
  
  const message = {
    text: `🚨 Napoleon AI Alert: ${rule.name}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Alert:* ${rule.name}\n*Severity:* ${rule.severity.toUpperCase()}\n*Success Rate:* ${metrics.overview.successRate}%\n*Avg Latency:* ${metrics.overview.avgLatency}ms\n*Total Requests:* ${metrics.overview.totalRequests}`
        }
      }
    ]
  }
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
}
```

## Performance Optimization

### Caching Strategy

```typescript
// lib/monitoring/cache.ts
import { redis } from '@/lib/redis'

const CACHE_TTL = {
  METRICS_1H: 300,    // 5 minutes
  METRICS_24H: 1800,  // 30 minutes
  METRICS_7D: 3600    // 1 hour
}

export async function getCachedMetrics(timeframe: string): Promise<any | null> {
  const cacheKey = `metrics:${timeframe}`
  const cached = await redis.get(cacheKey)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedMetrics(timeframe: string, metrics: any): Promise<void> {
  const cacheKey = `metrics:${timeframe}`
  const ttl = CACHE_TTL[`METRICS_${timeframe.toUpperCase()}`] || 300
  await redis.setex(cacheKey, ttl, JSON.stringify(metrics))
}
```

## Dashboard Components

### React Dashboard Component

```typescript
// components/admin/MetricsDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Metrics {
  overview: {
    totalRequests: number
    successRate: number
    totalTokens: number
    totalCostCents: number
    avgLatency: number
  }
  operations: Record<string, any>
  timeline: any[]
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('24h')

  useEffect(() => {
    fetchMetrics()
  }, [timeframe])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/metrics?timeframe=${timeframe}`)
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading metrics...</div>
  if (!metrics) return <div>Failed to load metrics</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Pipeline Metrics</h1>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.overview.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.overview.successRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.overview.totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(metrics.overview.totalCostCents / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operations Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.operations).map(([operation, stats]: [string, any]) => (
                <div key={operation} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium capitalize">{operation}</div>
                    <div className="text-sm text-gray-500">{stats.requests} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{stats.avgLatency}ms avg</div>
                    <div className="text-sm text-gray-500">{stats.tokens} tokens</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.timeline.slice(-10).map((point, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{new Date(point.timestamp).toLocaleTimeString()}</span>
                  <span>{point.requests} requests</span>
                  <span>${(point.cost / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Production Deployment

### Environment Setup

```bash
# Production monitoring environment variables
NODE_ENV=production
VERCEL_AI_GATEWAY_URL=https://gateway.ai.vercel.com/v1
VERCEL_PROJECT_ID=napoleon-ai-prod
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook
REDIS_URL=redis://your-redis-instance

# Alert thresholds
ALERT_ERROR_RATE_THRESHOLD=90
ALERT_COST_THRESHOLD_CENTS=10000
ALERT_LATENCY_THRESHOLD_MS=10000
```

### Monitoring Checklist

- [ ] Vercel AI Gateway configured
- [ ] Database logging operational
- [ ] Alert rules configured
- [ ] Slack/email notifications tested
- [ ] Dashboard accessible
- [ ] Cost tracking enabled
- [ ] Performance baselines established
- [ ] Automated reporting scheduled

---

**Next Steps**:
1. Configure Vercel AI Gateway integration
2. Set up automated alert monitoring
3. Create executive reporting dashboard
4. Implement cost optimization recommendations
5. Add predictive scaling based on usage patterns