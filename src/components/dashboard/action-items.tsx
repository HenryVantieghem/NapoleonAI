"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, AlertCircle, Calendar, User, Target, ArrowRight, Plus } from "lucide-react"
import { useState } from "react"

interface ActionItemsProps {
  onMessageSelect: (message: any) => void
  selectedMessage: any
}

export function ActionItems({ onMessageSelect, selectedMessage }: ActionItemsProps) {
  const [filterBy, setFilterBy] = useState<'all' | 'overdue' | 'today' | 'thisWeek'>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  // Mock action items data
  const actionItems = [
    {
      id: '1',
      title: 'Approve Q4 budget allocation for strategic initiatives',
      description: 'Review and approve $50M budget for Q4 strategic initiatives including M&A activities and product development.',
      priority: 'critical',
      dueDate: 'Today, 3:00 PM',
      dueDateTimestamp: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      status: 'overdue',
      assignedBy: 'Sarah Chen, Chief Strategy Officer',
      relatedMessage: {
        id: '1',
        subject: 'Q4 Board Meeting - Strategic Decisions Required'
      },
      estimatedTime: '45 minutes',
      businessImpact: 'High - $50M investment decisions',
      category: 'Financial Decision'
    },
    {
      id: '2',
      title: 'Make go/no-go decision on TechCorp acquisition',
      description: 'Review due diligence report and financial models. Decide whether to proceed with $100M acquisition of TechCorp.',
      priority: 'critical',
      dueDate: 'Tomorrow, 10:00 AM',
      dueDateTimestamp: new Date(Date.now() + 28 * 60 * 60 * 1000), // Tomorrow
      status: 'pending',
      assignedBy: 'Michael Torres, Corporate Development',
      relatedMessage: {
        id: '2',
        subject: 'Acquisition Target - Due Diligence Complete'
      },
      estimatedTime: '2 hours',
      businessImpact: 'Very High - $100M acquisition',
      category: 'M&A Decision'
    },
    {
      id: '3',
      title: 'Schedule emergency call with GlobalTech CEO',
      description: 'Arrange executive-level discussion to resolve service issues and prevent $5M contract cancellation.',
      priority: 'high',
      dueDate: 'Today, 5:00 PM',
      dueDateTimestamp: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      status: 'pending',
      assignedBy: 'Jennifer Liu, VP Sales',
      relatedMessage: {
        id: '3',
        subject: 'Enterprise Customer Escalation - Immediate Action'
      },
      estimatedTime: '30 minutes',
      businessImpact: 'High - $5M revenue at risk',
      category: 'Customer Relations'
    },
    {
      id: '4',
      title: 'Review board resolution documents',
      description: 'Review legal documents and governance resolutions for upcoming board meeting.',
      priority: 'high',
      dueDate: 'Tomorrow, 9:00 AM',
      dueDateTimestamp: new Date(Date.now() + 27 * 60 * 60 * 1000),
      status: 'pending',
      assignedBy: 'David Kim, Legal Counsel',
      relatedMessage: {
        id: '4',
        subject: 'Board Meeting Preparation - Document Review'
      },
      estimatedTime: '1 hour',
      businessImpact: 'Medium - Governance compliance',
      category: 'Legal Review'
    },
    {
      id: '5',
      title: 'Approve Tesla partnership term sheet',
      description: 'Review and approve partnership terms for AI platform integration with Tesla manufacturing.',
      priority: 'medium',
      dueDate: 'This Friday',
      dueDateTimestamp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'pending',
      assignedBy: 'Robert Chen, VP Business Development',
      relatedMessage: {
        id: '6',
        subject: 'Strategic Partnership - Tesla Meeting Follow-up'
      },
      estimatedTime: '1.5 hours',
      businessImpact: 'High - Strategic partnership',
      category: 'Partnership'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-700 bg-red-100 border-red-200'
      case 'pending': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'completed': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200'
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getTimeUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffMs = dueDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMs < 0) return 'Overdue'
    if (diffDays === 0) return `${diffHours}h remaining`
    return `${diffDays}d remaining`
  }

  const filteredItems = actionItems.filter(item => {
    const now = new Date()
    const dueDate = item.dueDateTimestamp
    const isToday = dueDate.toDateString() === now.toDateString()
    const isThisWeek = dueDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000

    switch (filterBy) {
      case 'overdue': return item.status === 'overdue' || dueDate.getTime() < now.getTime()
      case 'today': return isToday
      case 'thisWeek': return isThisWeek
      default: return showCompleted || item.status !== 'completed'
    }
  })

  const stats = {
    total: actionItems.length,
    overdue: actionItems.filter(item => item.status === 'overdue').length,
    today: actionItems.filter(item => {
      const now = new Date()
      return item.dueDateTimestamp.toDateString() === now.toDateString()
    }).length,
    pending: actionItems.filter(item => item.status === 'pending').length
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header & Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 border-b border-gray-100"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">{stats.today}</div>
            <div className="text-sm text-orange-600">Due Today</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
            <div className="text-sm text-blue-600">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-500"
            >
              <option value="all">All Items</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="thisWeek">This Week</option>
            </select>
            
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="mr-2"
              />
              Show completed
            </label>
          </div>

          <button className="flex items-center px-4 py-2 bg-burgundy-600 text-white rounded-lg hover:bg-burgundy-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Action
          </button>
        </div>
      </motion.div>

      {/* Action Items List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(item.status)}`}>
                        {item.status === 'overdue' ? 'OVERDUE' : item.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-gray-900">{getTimeUntilDue(item.dueDateTimestamp)}</div>
                    <div className="text-xs text-gray-500">{item.dueDate}</div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Assigned by {item.assignedBy.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Est. {item.estimatedTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{item.businessImpact.split(' - ')[0]}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => onMessageSelect(item.relatedMessage)}
                      className="text-sm text-burgundy-600 hover:text-burgundy-700 font-medium flex items-center"
                    >
                      View Message <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Schedule
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Delegate
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Snooze
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No action items found</h3>
            <p className="text-gray-600">
              {filterBy === 'all' 
                ? "You're all caught up! No pending action items."
                : `No ${filterBy} action items at this time.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}