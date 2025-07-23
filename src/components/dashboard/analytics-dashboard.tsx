'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Clock,
  Target,
  Users,
  DollarSign,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExecutiveMetrics, ProductivityInsight, analyticsService } from '@/lib/features/analytics-service'

interface AnalyticsDashboardProps {
  userId: string
  className?: string
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  description?: string
}

const MetricCard = ({ title, value, change, icon, color, description }: MetricCardProps) => (
  <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    {description && (
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    )}
  </div>
)

export default function AnalyticsDashboard({ userId, className }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null)
  const [insights, setInsights] = useState<ProductivityInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30)
  const [activeTab, setActiveTab] = useState<'overview' | 'communication' | 'productivity' | 'insights'>('overview')

  const loadData = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const [metricsData, insightsData] = await Promise.all([
        analyticsService.getExecutiveMetrics(userId, selectedPeriod),
        analyticsService.getProductivityInsights(userId)
      ])

      setMetrics(metricsData)
      setInsights(insightsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      await analyticsService.generateInsights(userId)
      await loadData() // Refresh data
    } catch (err) {
      console.error('Failed to generate insights:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId, selectedPeriod])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-burgundy mx-auto mb-2" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={loadData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'communication', label: 'Communication', icon: MessageCircle },
    { id: 'productivity', label: 'Productivity', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: TrendingUp }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Analytics</h2>
          <p className="text-gray-600">Data-driven insights for executive productivity</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value) as 7 | 30 | 90)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <Button
            onClick={generateInsights}
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
          
          <Button
            onClick={loadData}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-burgundy shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Messages"
              value={metrics.totalMessages.toLocaleString()}
              change={metrics.weekOverWeekChange}
              icon={<MessageCircle className="h-5 w-5 text-white" />}
              color="bg-blue-500"
              description={`${metrics.messagesThisWeek} this week`}
            />
            
            <MetricCard
              title="High Priority"
              value={metrics.highPriorityMessages}
              icon={<AlertTriangle className="h-5 w-5 text-white" />}
              color="bg-red-500"
              description="Urgent messages requiring attention"
            />
            
            <MetricCard
              title="Action Items"
              value={`${metrics.completionRate}%`}
              icon={<CheckCircle className="h-5 w-5 text-white" />}
              color="bg-green-500"
              description={`${metrics.actionItemsCompleted}/${metrics.actionItemsCreated} completed`}
            />
            
            <MetricCard
              title="Time Saved"
              value={`${Math.round(metrics.estimatedTimeSaved / 60)}h`}
              icon={<Clock className="h-5 w-5 text-white" />}
              color="bg-purple-500"
              description="Through automation & templates"
            />
          </div>

          {/* Business Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Financial Impact"
              value={`$${(metrics.totalFinancialImpact / 1000000).toFixed(1)}M`}
              icon={<DollarSign className="h-5 w-5 text-white" />}
              color="bg-green-600"
              description="Estimated from decision tracking"
            />
            
            <MetricCard
              title="VIP Interactions"
              value={metrics.vipInteractions}
              icon={<Users className="h-5 w-5 text-white" />}
              color="bg-burgundy"
              description="Key stakeholder communications"
            />
            
            <MetricCard
              title="Meetings Scheduled"
              value={metrics.meetingsScheduled}
              icon={<Calendar className="h-5 w-5 text-white" />}
              color="bg-blue-600"
              description="Calendar integration active"
            />
          </div>

          {/* Communication Distribution */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Message Distribution</h3>
            <div className="space-y-3">
              {metrics.messagesByChannel.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium capitalize">{channel.channel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${channel.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                      {channel.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Response Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Response Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Response Time</span>
                  <span className="font-semibold">{metrics.averageResponseTime.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Urgent Messages</span>
                  <span className="font-semibold text-red-600">{metrics.urgentMessages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time to Decision</span>
                  <span className="font-semibold">{metrics.timeToDecision}h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
              <div className="space-y-3">
                {metrics.sentimentDistribution.map((sentiment) => (
                  <div key={sentiment.sentiment} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        sentiment.sentiment === 'positive' ? 'bg-green-500' :
                        sentiment.sentiment === 'negative' ? 'bg-red-500' :
                        sentiment.sentiment === 'urgent' ? 'bg-orange-500' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="capitalize">{sentiment.sentiment}</span>
                    </div>
                    <span className="font-medium">{sentiment.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Contacts */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Top Contacts</h3>
            <div className="space-y-3">
              {metrics.topContacts.slice(0, 8).map((contact, index) => (
                <div key={contact.email} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{contact.interactions}</p>
                    <p className="text-xs text-gray-500">Last: {contact.lastContact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Productivity Tab */}
      {activeTab === 'productivity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Productivity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Delegation Rate"
              value={`${metrics.delegationRate}%`}
              icon={<Users className="h-5 w-5 text-white" />}
              color="bg-blue-500"
              description="Tasks delegated to team"
            />
            
            <MetricCard
              title="Templates Used"
              value={metrics.templatesUsed}
              icon={<FileText className="h-5 w-5 text-white" />}
              color="bg-green-500"
              description="Email template usage"
            />
            
            <MetricCard
              title="Quick Responses"
              value={metrics.quickResponsesUsed}
              icon={<Zap className="h-5 w-5 text-white" />}
              color="bg-purple-500"
              description="Automated responses sent"
            />
          </div>

          {/* Peak Activity Hours */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Peak Activity Hours</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.peakActivityHours.map((hour, index) => (
                <div key={hour.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">
                    {hour.hour === 0 ? '12 AM' : 
                     hour.hour < 12 ? `${hour.hour} AM` :
                     hour.hour === 12 ? '12 PM' :
                     `${hour.hour - 12} PM`}
                  </span>
                  <span className="text-burgundy font-semibold">{hour.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Savings Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Time Savings Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Email Templates</span>
                <span className="font-medium">{Math.round(metrics.templatesUsed * 5 / 60 * 10) / 10}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Quick Responses</span>
                <span className="font-medium">{Math.round(metrics.quickResponsesUsed * 2 / 60 * 10) / 10}h</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Time Saved</span>
                  <span className="text-burgundy">{Math.round(metrics.estimatedTimeSaved / 60 * 10) / 10}h</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {insights.length > 0 ? (
            insights.map((insight) => (
              <div key={insight.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.business_impact === 'high' ? 'bg-red-100 text-red-600' :
                      insight.business_impact === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {insight.type.replace(/_/g, ' ')} • {insight.business_impact} impact
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {Math.round(insight.confidence_score * 100)}% confidence
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{insight.description}</p>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionable_recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-burgundy mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Available</h3>
              <p className="text-gray-600 mb-4">Generate insights to get personalized productivity recommendations.</p>
              <Button onClick={generateInsights} className="bg-burgundy text-white hover:bg-burgundy-700">
                <Zap className="h-4 w-4 mr-2" />
                Generate AI Insights
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}