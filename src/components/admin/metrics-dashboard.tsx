'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, TrendingUp, Clock, DollarSign, Users, MessageSquare, Zap, CheckCircle } from 'lucide-react'

interface Metrics {
  overview: {
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
  operations: Record<string, {
    requests: number
    tokens: number
    cost: number
    errors: number
    avgLatency: number
    errorRate: number
  }>
  timeline: Array<{
    timestamp: string
    requests: number
    tokens: number
    cost: number
    errors: number
  }>
  userStats: {
    totalUsers: number
    topUsers: Array<{
      userId: string
      requests: number
      tokens: number
      cost: number
      errors: number
      avgLatency: number
    }>
  }
  costAnalysis: {
    totalCostCents: number
    totalCostDollars: number
    avgCostPerRequest: number
    avgCostPerToken: number
    costByOperation: Record<string, number>
  }
  recommendations: Array<{
    type: string
    priority: 'low' | 'medium' | 'high'
    message: string
  }>
}

interface MetricsResponse {
  timeframe: string
  metrics: Metrics
  generatedAt: string
}

export function MetricsDashboard() {
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('24h')
  const [selectedOperation, setSelectedOperation] = useState<string>('')

  useEffect(() => {
    fetchMetrics()
  }, [timeframe, selectedOperation])

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ timeframe })
      if (selectedOperation) {
        params.append('operation', selectedOperation)
      }
      
      const response = await fetch(`/api/admin/metrics?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    fetchMetrics()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading metrics: {error}</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { metrics } = data

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy">AI Pipeline Metrics</h1>
          <p className="text-gray-600 mt-1">
            Generated at {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedOperation} onValueChange={setSelectedOperation}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Operations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Operations</SelectItem>
              <SelectItem value="batch_process">Batch Process</SelectItem>
              <SelectItem value="summarize">Summarize</SelectItem>
              <SelectItem value="priority_score">Priority Score</SelectItem>
              <SelectItem value="extract_actions">Extract Actions</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refresh} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.overview.totalRequests)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(metrics.overview.totalMessages)} messages processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.overview.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(metrics.overview.failedRequests)} failed requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.overview.totalCostCents)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(metrics.overview.totalTokens)} tokens used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.overview.avgLatency}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{metrics.overview.activeUsers}</div>
            <div className="space-y-3">
              {metrics.userStats.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">User #{index + 1}</div>
                    <div className="text-sm text-gray-500">{user.requests} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{formatCurrency(user.cost)}</div>
                    <div className="text-xs text-gray-500">{user.avgLatency}ms avg</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Operations Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.operations).map(([operation, stats]) => (
                <div key={operation} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium capitalize">{operation.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500">
                      {formatNumber(stats.requests)} requests
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{stats.avgLatency}ms</div>
                    <div className="text-sm text-gray-500">
                      {stats.errorRate}% errors
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.costAnalysis.totalCostCents)}
              </div>
              <div className="text-sm text-gray-500">Total Cost</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">
                ${metrics.costAnalysis.avgCostPerRequest.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">Cost per Request</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">
                ${metrics.costAnalysis.avgCostPerToken.toFixed(6)}
              </div>
              <div className="text-sm text-gray-500">Cost per Token</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Cost by Operation</h4>
            {Object.entries(metrics.costAnalysis.costByOperation).map(([operation, cost]) => (
              <div key={operation} className="flex justify-between py-2 border-b">
                <span className="capitalize">{operation.replace('_', ' ')}</span>
                <span className="font-medium">{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{rec.type}</div>
                    <div className="text-sm text-gray-600 mt-1">{rec.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Chart */}
      {metrics.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {metrics.timeline.slice(-20).map((point, index) => (
                <div key={index} className="flex justify-between items-center text-sm py-1 border-b">
                  <span className="text-gray-600">
                    {new Date(point.timestamp).toLocaleString()}
                  </span>
                  <div className="flex space-x-4">
                    <span>{point.requests} requests</span>
                    <span>{formatNumber(point.tokens)} tokens</span>
                    <span>{formatCurrency(point.cost)}</span>
                    {point.errors > 0 && (
                      <span className="text-red-600">{point.errors} errors</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}