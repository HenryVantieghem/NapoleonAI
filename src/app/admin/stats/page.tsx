'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/luxury-card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/luxury-button'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  DollarSign,
  Zap,
  Target
} from 'lucide-react'

interface AdminStats {
  users: {
    total: number
    active_daily: number
    active_weekly: number
    retention_7d: number
    retention_30d: number
  }
  messages: {
    processed_today: number
    processed_this_week: number
    processing_time_avg: number
    ai_success_rate: number
  }
  performance: {
    uptime_percentage: number
    avg_response_time: number
    error_rate: number
    lighthouse_score: number
  }
  business: {
    time_saved_total_hours: number
    cost_per_user: number
    revenue_monthly: number
    churn_rate: number
  }
  ai: {
    tokens_used_today: number
    cost_today: number
    accuracy_rate: number
    fallback_rate: number
  }
}

export default function AdminStatsPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/admin/stats?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
          <Typography variant="body" className="mt-4 text-gray-600">
            Loading analytics...
          </Typography>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <Typography variant="h3" className="text-navy mb-2">
            Failed to Load Stats
          </Typography>
          <Button onClick={fetchStats}>Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-luxury p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Typography variant="h1" className="text-navy mb-2">
              Executive Analytics
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Napoleon AI performance dashboard
            </Typography>
          </div>
          
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Button
              onClick={fetchStats}
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-gray-600 mb-1">
                  Daily Active Users
                </Typography>
                <Typography variant="h2" className="text-navy">
                  {formatNumber(stats.users.active_daily)}
                </Typography>
              </div>
              <div className="p-3 bg-navy/10 rounded-lg">
                <Users className="w-6 h-6 text-navy" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-gray-600 mb-1">
                  Messages Processed
                </Typography>
                <Typography variant="h2" className="text-navy">
                  {formatNumber(stats.messages.processed_today)}
                </Typography>
              </div>
              <div className="p-3 bg-gold/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-gold" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-gray-600 mb-1">
                  Avg Response Time
                </Typography>
                <Typography variant="h2" className="text-navy">
                  {stats.performance.avg_response_time}ms
                </Typography>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-gray-600 mb-1">
                  System Uptime
                </Typography>
                <Typography variant="h2" className="text-navy">
                  {formatPercentage(stats.performance.uptime_percentage)}
                </Typography>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Metrics */}
          <Card className="p-6">
            <Typography variant="h3" className="text-navy mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Analytics
            </Typography>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{formatNumber(stats.users.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Active</span>
                <span className="font-semibold">{formatNumber(stats.users.active_weekly)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">7-day Retention</span>
                <span className="font-semibold">{formatPercentage(stats.users.retention_7d)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">30-day Retention</span>
                <span className="font-semibold">{formatPercentage(stats.users.retention_30d)}</span>
              </div>
            </div>
          </Card>

          {/* AI Performance */}
          <Card className="p-6">
            <Typography variant="h3" className="text-navy mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              AI Performance
            </Typography>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(stats.messages.ai_success_rate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accuracy Rate</span>
                <span className="font-semibold">{formatPercentage(stats.ai.accuracy_rate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fallback Rate</span>
                <span className="font-semibold text-orange-600">
                  {formatPercentage(stats.ai.fallback_rate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Processing Time</span>
                <span className="font-semibold">{stats.messages.processing_time_avg}ms</span>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card className="p-6">
            <Typography variant="h3" className="text-navy mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              System Health
            </Typography>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-semibold text-red-600">
                  {formatPercentage(stats.performance.error_rate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lighthouse Score</span>
                <span className="font-semibold text-green-600">
                  {stats.performance.lighthouse_score}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(stats.performance.uptime_percentage)}
                </span>
              </div>
            </div>
          </Card>

          {/* Business Metrics */}
          <Card className="p-6">
            <Typography variant="h3" className="text-navy mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Business Impact
            </Typography>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Saved (Total)</span>
                <span className="font-semibold text-green-600">
                  {formatNumber(stats.business.time_saved_total_hours)}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-semibold">
                  {formatCurrency(stats.business.revenue_monthly)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost per User</span>
                <span className="font-semibold">
                  {formatCurrency(stats.business.cost_per_user)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Churn Rate</span>
                <span className="font-semibold text-orange-600">
                  {formatPercentage(stats.business.churn_rate)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Cost Tracking */}
        <Card className="p-6 mt-8">
          <Typography variant="h3" className="text-navy mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            AI Usage & Costs
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Typography variant="h2" className="text-navy mb-1">
                {formatNumber(stats.ai.tokens_used_today)}
              </Typography>
              <Typography variant="body-sm" className="text-gray-600">
                Tokens Used Today
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h2" className="text-navy mb-1">
                {formatCurrency(stats.ai.cost_today)}
              </Typography>
              <Typography variant="body-sm" className="text-gray-600">
                AI Cost Today
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h2" className="text-navy mb-1">
                {formatCurrency(stats.ai.cost_today / Math.max(stats.messages.processed_today, 1))}
              </Typography>
              <Typography variant="body-sm" className="text-gray-600">
                Cost per Message
              </Typography>
            </div>
          </div>
        </Card>

        {/* Health Indicators */}
        <Card className="p-6 mt-8">
          <Typography variant="h3" className="text-navy mb-4">
            System Health Indicators
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'API Health', 
                status: stats.performance.error_rate < 1 ? 'healthy' : 'warning',
                value: formatPercentage(100 - stats.performance.error_rate) + ' success'
              },
              { 
                label: 'AI Pipeline', 
                status: stats.messages.ai_success_rate > 95 ? 'healthy' : 'warning',
                value: formatPercentage(stats.messages.ai_success_rate) + ' success'
              },
              { 
                label: 'Database', 
                status: stats.performance.avg_response_time < 200 ? 'healthy' : 'warning',
                value: stats.performance.avg_response_time + 'ms avg'
              },
              { 
                label: 'Integrations', 
                status: 'healthy',
                value: 'All systems operational'
              }
            ].map((indicator, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  indicator.status === 'healthy' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div>
                  <Typography variant="body-sm" className="font-medium">
                    {indicator.label}
                  </Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    {indicator.value}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}