"use client"

import { useState } from "react"
import { Crown, Search, LogOut, Mail, MessageSquare, Users, Clock, AlertCircle, CheckCircle } from "lucide-react"

// MVP Sample Data
const sampleMessages = [
  {
    id: 1,
    from: "Sarah Chen, CFO",
    source: "gmail",
    subject: "Q4 Budget Review - Urgent",
    preview: "Need your approval on the revised Q4 budget by EOD. The board meeting is tomorrow...",
    priority: "high",
    aiInsight: "Financial decision required today",
    time: "2 hours ago",
    isVip: true
  },
  {
    id: 2,
    from: "Marketing Team",
    source: "slack",
    subject: "Campaign Performance",
    preview: "Our latest campaign exceeded expectations by 40%. Should we increase budget?",
    priority: "medium",
    aiInsight: "Positive business update",
    time: "4 hours ago",
    isVip: false
  },
  {
    id: 3,
    from: "John Smith, Investor",
    source: "gmail",
    subject: "Investment Round Discussion",
    preview: "Following up on our Series B discussion. Can we schedule a call next week?",
    priority: "high",
    aiInsight: "Important investor communication",
    time: "6 hours ago",
    isVip: true
  },
  {
    id: 4,
    from: "HR Team",
    source: "teams",
    subject: "New Hire Approvals",
    preview: "Three candidates need final approval for the engineering positions...",
    priority: "medium",
    aiInsight: "Hiring decision needed",
    time: "8 hours ago",
    isVip: false
  },
  {
    id: 5,
    from: "Legal Team",
    source: "gmail",
    subject: "Contract Review Complete",
    preview: "The partnership agreement has been reviewed. A few minor changes suggested...",
    priority: "low",
    aiInsight: "Document ready for review",
    time: "1 day ago",
    isVip: false
  }
]

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'vip'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // For MVP, use a simple fallback user
  const user = { firstName: 'Executive' }

  const filteredMessages = sampleMessages.filter(message => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'high' && message.priority === 'high') ||
                         (filter === 'vip' && message.isVip)
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'gmail': return <Mail className="w-4 h-4" />
      case 'slack': return <MessageSquare className="w-4 h-4" />
      case 'teams': return <Users className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mr-3">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">Napoleon AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-[#666661]">
              Welcome, {user?.firstName || 'Executive'}
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-[#666661] hover:text-[#0A0A0A]"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Your Executive Dashboard</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4AF37] mb-1">{sampleMessages.length}</div>
              <div className="text-[#666661] text-sm">Messages Prioritized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500 mb-1">{sampleMessages.filter(m => m.priority === 'high').length}</div>
              <div className="text-[#666661] text-sm">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0A0A0A] mb-1">{sampleMessages.filter(m => m.isVip).length}</div>
              <div className="text-[#666661] text-sm">VIP Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">2.4h</div>
              <div className="text-[#666661] text-sm">Time Saved Today</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666661] w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-[#0A0A0A] text-white' : 'bg-gray-100 text-[#666661] hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'high' ? 'bg-red-500 text-white' : 'bg-gray-100 text-[#666661] hover:bg-gray-200'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setFilter('vip')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'vip' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-[#666661] hover:bg-gray-200'
                }`}
              >
                VIP
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(message.priority)} mt-2`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-[#0A0A0A]">{message.from}</h3>
                      <div className="flex items-center space-x-1 text-[#666661]">
                        {getSourceIcon(message.source)}
                        <span className="text-sm capitalize">{message.source}</span>
                      </div>
                      {message.isVip && (
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-[#666661]">
                      <span>{message.time}</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-medium text-[#0A0A0A] mb-2">{message.subject}</h4>
                  <p className="text-[#666661] mb-3">{message.preview}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[#666661]">AI Note: {message.aiInsight}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Done</span>
                      </button>
                      <button className="px-3 py-1 bg-[#0A0A0A] text-white rounded-lg text-sm hover:bg-[#333333] transition-colors">
                        View Full
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[#666661] text-lg">No messages match your current filter.</div>
          </div>
        )}
      </div>
    </div>
  )
}