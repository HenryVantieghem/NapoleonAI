"use client"

import { motion } from "framer-motion"
import { 
  Crown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign,
  Target,
  Zap,
  ArrowRight,
  Star,
  Calendar
} from "lucide-react"
import { useState } from "react"

interface StrategicDigestProps {
  onMessageSelect: (message: any) => void
  selectedMessage: any
}

export function StrategicDigest({ onMessageSelect, selectedMessage }: StrategicDigestProps) {
  // Mock data for Strategic Daily Digest
  const digestData = {
    executiveSummary: {
      title: "Executive Summary",
      highlight: "3 critical decisions require your immediate attention",
      metrics: {
        priorityMessages: 8,
        actionItems: 5,
        meetings: 3,
        revenue: "$2.4M"
      }
    },
    priorityMessages: [
      {
        id: '1',
        subject: 'Q4 Board Meeting - Strategic Decisions Required',
        sender: 'Sarah Chen, Chief Strategy Officer',
        channel: 'gmail',
        priority: 'critical',
        aiSummary: 'Board meeting agenda requires your input on acquisition strategy and budget allocation. Decision needed by EOD.',
        actionRequired: 'Approve budget, Review acquisition targets',
        timeToDecision: '4 hours',
        businessImpact: 'High - $50M investment decision',
        category: 'Strategic Planning'
      },
      {
        id: '2',
        subject: 'Acquisition Target - Due Diligence Complete',
        sender: 'Michael Torres, Corporate Development',
        channel: 'slack',
        priority: 'critical',
        aiSummary: 'Due diligence on TechCorp acquisition completed. Financial models show 15% IRR. Recommendation to proceed.',
        actionRequired: 'Review DD report, Make go/no-go decision',
        timeToDecision: '2 days',
        businessImpact: 'Very High - $100M acquisition',
        category: 'M&A'
      },
      {
        id: '3',
        subject: 'Enterprise Customer Escalation - Contract Risk',
        sender: 'Jennifer Liu, VP Sales',
        channel: 'teams',
        priority: 'high',
        aiSummary: 'Major enterprise client threatening to cancel $5M contract due to service issues. Requires executive intervention.',
        actionRequired: 'Schedule customer call, Review service SLA',
        timeToDecision: '1 day',
        businessImpact: 'High - $5M revenue at risk',
        category: 'Customer Success'
      }
    ],
    insights: [
      {
        title: 'Communication Pattern Alert',
        type: 'pattern',
        description: 'Board meeting preparation messages increased 300% this week',
        impact: 'Plan additional time for strategic reviews'
      },
      {
        title: 'Stakeholder Urgency',
        type: 'urgency',
        description: '5 C-level executives awaiting your response',
        impact: 'Consider delegation or quick responses to maintain momentum'
      },
      {
        title: 'Decision Bottleneck',
        type: 'bottleneck',
        description: '3 major initiatives waiting for your approval',
        impact: 'Potential project delays if not addressed today'
      }
    ],
    todaySchedule: [
      { time: '10:00 AM', title: 'Strategic Planning Review', type: 'meeting', priority: 'high' },
      { time: '2:00 PM', title: 'Board Prep Session', type: 'meeting', priority: 'critical' },
      { time: '4:00 PM', title: 'Customer Escalation Call', type: 'meeting', priority: 'high' }
    ]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200'
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertCircle
      case 'high': return TrendingUp
      case 'medium': return Clock
      default: return CheckCircle
    }
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Executive Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 rounded-2xl p-6 text-white shadow-luxury"
      >
        <div className="flex items-center mb-4">
          <Crown className="w-6 h-6 mr-3" />
          <h2 className="text-xl font-serif font-bold">Executive Command Center</h2>
        </div>
        
        <p className="text-burgundy-100 mb-6">{digestData.executiveSummary.highlight}</p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{digestData.executiveSummary.metrics.priorityMessages}</div>
            <div className="text-xs text-burgundy-200">Priority Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{digestData.executiveSummary.metrics.actionItems}</div>
            <div className="text-xs text-burgundy-200">Action Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{digestData.executiveSummary.metrics.meetings}</div>
            <div className="text-xs text-burgundy-200">Meetings Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{digestData.executiveSummary.metrics.revenue}</div>
            <div className="text-xs text-burgundy-200">Revenue Impact</div>
          </div>
        </div>
      </motion.div>

      {/* Priority Messages Requiring Decision */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Critical Decisions Required</h3>
            </div>
            <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {digestData.priorityMessages.length} pending
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {digestData.priorityMessages.map((message, index) => {
            const PriorityIcon = getPriorityIcon(message.priority)
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`
                  border-l-4 pl-4 py-4 rounded-r-lg cursor-pointer transition-all
                  ${message.priority === 'critical' ? 'border-red-500 bg-red-50/50' : 
                    message.priority === 'high' ? 'border-orange-500 bg-orange-50/50' : 
                    'border-yellow-500 bg-yellow-50/50'}
                  hover:shadow-md
                `}
                onClick={() => onMessageSelect(message)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <PriorityIcon className="w-4 h-4 mr-2 text-red-600" />
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(message.priority)}`}>
                        {message.priority.toUpperCase()}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">{message.category}</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">{message.subject}</h4>
                    <p className="text-sm text-gray-600 mb-2">from {message.sender}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Decision in</div>
                    <div className="text-sm font-semibold text-red-600">{message.timeToDecision}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 mb-2">{message.aiSummary}</p>
                  <div className="text-xs text-gray-600">
                    <strong>Business Impact:</strong> {message.businessImpact}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <strong>Action Required:</strong> {message.actionRequired}
                  </div>
                  <button className="flex items-center text-sm text-burgundy-600 hover:text-burgundy-700 font-medium">
                    Review <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* AI Insights & Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 gap-6"
      >
        {/* Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {digestData.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <h5 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h5>
                <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                <p className="text-xs text-burgundy-600 font-medium">{insight.impact}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Today's Executive Schedule</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            {digestData.todaySchedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.time}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StrategicDigest