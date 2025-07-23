"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, Users, Mail, MessageSquare, Clock, Target } from "lucide-react"

export function Analytics() {
  // Mock analytics data
  const analytics = {
    overview: {
      totalMessages: 1247,
      responseTime: "12 min",
      actionItemsCompleted: 89,
      communicationScore: 94
    },
    trends: {
      weeklyChange: {
        messages: +15,
        responseTime: -8,
        actionItems: +23,
        efficiency: +7
      }
    },
    channels: [
      { name: 'Gmail', messages: 687, percentage: 55, trend: +12 },
      { name: 'Slack', messages: 341, percentage: 27, trend: +8 },
      { name: 'Teams', messages: 219, percentage: 18, trend: -3 }
    ],
    timeDistribution: [
      { hour: '9AM', messages: 45 },
      { hour: '10AM', messages: 78 },
      { hour: '11AM', messages: 92 },
      { hour: '12PM', messages: 67 },
      { hour: '1PM', messages: 34 },
      { hour: '2PM', messages: 89 },
      { hour: '3PM', messages: 112 },
      { hour: '4PM', messages: 95 },
      { hour: '5PM', messages: 56 }
    ],
    priorities: {
      critical: 23,
      high: 67,
      medium: 145,
      low: 89
    },
    topContacts: [
      { name: 'Sarah Chen', messages: 45, role: 'Chief Strategy Officer' },
      { name: 'Michael Torres', messages: 38, role: 'Corporate Development' },
      { name: 'Jennifer Liu', messages: 32, role: 'VP Sales' },
      { name: 'David Kim', messages: 28, role: 'Legal Counsel' },
      { name: 'Lisa Zhang', messages: 24, role: 'Chief Financial Officer' }
    ]
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-burgundy-50 rounded-lg">
          <Icon className="w-5 h-5 text-burgundy-600" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </motion.div>
  )

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={analytics.overview.totalMessages.toLocaleString()}
          subtitle="This month"
          icon={Mail}
          trend={analytics.trends.weeklyChange.messages}
        />
        <StatCard
          title="Avg Response Time"
          value={analytics.overview.responseTime}
          subtitle="Down from 15 min"
          icon={Clock}
          trend={analytics.trends.weeklyChange.responseTime}
        />
        <StatCard
          title="Action Items Completed"
          value={`${analytics.overview.actionItemsCompleted}%`}
          subtitle="This quarter"
          icon={Target}
          trend={analytics.trends.weeklyChange.actionItems}
        />
        <StatCard
          title="Communication Score"
          value={`${analytics.overview.communicationScore}%`}
          subtitle="AI-calculated efficiency"
          icon={TrendingUp}
          trend={analytics.trends.weeklyChange.efficiency}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Channel Distribution
          </h3>
          <div className="space-y-4">
            {analytics.channels.map((channel, index) => (
              <div key={channel.name} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-16 text-sm font-medium text-gray-700">{channel.name}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${channel.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 * index }}
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-purple-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {channel.messages}
                  </div>
                </div>
                <div className={`ml-4 text-xs flex items-center ${
                  channel.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {channel.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(channel.trend)}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Message Priorities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Priorities</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Critical</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.priorities.critical}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">High</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.priorities.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Medium</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.priorities.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Low</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.priorities.low}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time Distribution & Top Contacts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Hourly Message Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Volume by Hour</h3>
          <div className="space-y-3">
            {analytics.timeDistribution.map((hour, index) => {
              const maxMessages = Math.max(...analytics.timeDistribution.map(h => h.messages))
              const percentage = (hour.messages / maxMessages) * 100
              
              return (
                <div key={hour.hour} className="flex items-center">
                  <div className="w-12 text-xs font-medium text-gray-600">{hour.hour}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.1 * index }}
                        className="h-1.5 rounded-full bg-gradient-to-r from-burgundy-500 to-burgundy-600"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 w-8 text-right">{hour.messages}</div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Top Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Top Contacts
          </h3>
          <div className="space-y-4">
            {analytics.topContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-burgundy rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-semibold">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.role}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-700">{contact.messages}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-burgundy-50 to-purple-50 rounded-xl border border-burgundy-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-burgundy-600" />
          AI-Powered Insights
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Peak Efficiency</h4>
            <p className="text-sm text-gray-600">Your response time is 40% faster between 2-4 PM. Consider scheduling important decisions during this window.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Communication Pattern</h4>
            <p className="text-sm text-gray-600">Strategic discussions increase 300% before board meetings. Plan additional review time for complex decisions.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Delegation Opportunity</h4>
            <p className="text-sm text-gray-600">15% of your messages could be delegated to direct reports, freeing up 2 hours daily for strategic work.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}