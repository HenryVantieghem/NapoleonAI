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
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Top Header */}
      <header className="bg-navy-900 border-b border-gold/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center mr-3 shadow-gold">
              <Crown className="w-5 h-5 text-navy-900" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Napoleon AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gold-200">
              Welcome, {user?.firstName || 'Executive'}
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gold-200 hover:text-gold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3-Panel Command Center Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Daily Digest */}
        <div className="w-80 bg-white/95 backdrop-blur-luxury border-r border-gold/20 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">Strategic Daily Digest</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-4 border border-gold/20">
                <h3 className="font-semibold text-navy-900 mb-2">🎯 Top 3 Priorities</h3>
                <ul className="space-y-2 text-sm text-navy-700">
                  <li>• Q4 Budget Review (CFO Sarah Chen)</li>
                  <li>• Investment Round Discussion</li>
                  <li>• Marketing Campaign Decision</li>
                </ul>
              </div>
              
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h3 className="font-semibold text-navy-900 mb-2">📊 Executive Metrics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gold">{sampleMessages.length}</div>
                    <div className="text-navy-600">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">{sampleMessages.filter(m => m.priority === 'high').length}</div>
                    <div className="text-navy-600">Urgent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-navy-900">{sampleMessages.filter(m => m.isVip).length}</div>
                    <div className="text-navy-600">VIP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-500">2.4h</div>
                    <div className="text-navy-600">Saved</div>
                  </div>
                </div>
              </div>

              <div className="bg-navy-50 rounded-xl p-4 border border-navy-200">
                <h3 className="font-semibold text-navy-900 mb-2">⚡ Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-navy-700 hover:text-navy-900 py-1">
                    Schedule board meeting prep
                  </button>
                  <button className="w-full text-left text-sm text-navy-700 hover:text-navy-900 py-1">
                    Review investor updates
                  </button>
                  <button className="w-full text-left text-sm text-navy-700 hover:text-navy-900 py-1">
                    Approve hiring decisions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Unified Inbox */}
        <div className="flex-1 bg-cream/50 backdrop-blur-luxury overflow-hidden flex flex-col">
          {/* Search and Filters */}
          <div className="bg-white/95 backdrop-blur-luxury border-b border-gold/20 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white/80"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all' ? 'bg-navy-900 text-white shadow-lg' : 'bg-white/80 text-navy-700 hover:bg-white border border-gold/20'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('high')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'high' ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 text-navy-700 hover:bg-white border border-gold/20'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setFilter('vip')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'vip' ? 'bg-gradient-gold text-navy-900 shadow-lg' : 'bg-white/80 text-navy-700 hover:bg-white border border-gold/20'
                  }`}
                >
                  VIP
                </button>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div key={message.id} className="bg-white/95 backdrop-blur-luxury rounded-xl p-6 shadow-luxury border border-gold/20 hover:shadow-xl transition-all duration-300 hover:border-gold/40">
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(message.priority)} mt-2 shadow-sm`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-navy-900">{message.from}</h3>
                          <div className="flex items-center space-x-1 text-navy-600">
                            {getSourceIcon(message.source)}
                            <span className="text-sm capitalize">{message.source}</span>
                          </div>
                          {message.isVip && (
                            <Crown className="w-4 h-4 text-gold" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-navy-600">
                          <span>{message.time}</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-medium text-navy-900 mb-2">{message.subject}</h4>
                      <p className="text-navy-600 mb-3">{message.preview}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-gold" />
                          <span className="text-navy-600">AI Note: {message.aiInsight}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                            <span>Done</span>
                          </button>
                          <button className="px-3 py-1 bg-gradient-gold text-navy-900 rounded-lg text-sm hover:shadow-gold transition-all">
                            View
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
                <div className="text-navy-600 text-lg">No messages match your current filter.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Context Panel */}
        <div className="w-80 bg-white/95 backdrop-blur-luxury border-l border-gold/20 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">Message Context</h2>
            <div className="space-y-4">
              <div className="bg-gold-50 rounded-xl p-4 border border-gold/20">
                <h3 className="font-semibold text-navy-900 mb-2">💡 AI Insights</h3>
                <p className="text-sm text-navy-700">Select a message to see detailed AI analysis, priority reasoning, and suggested actions.</p>
              </div>
              
              <div className="bg-navy-50 rounded-xl p-4 border border-navy-200">
                <h3 className="font-semibold text-navy-900 mb-2">🏆 VIP Status</h3>
                <p className="text-sm text-navy-700">Board members and investors automatically receive priority scoring of 90-100.</p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h3 className="font-semibold text-navy-900 mb-2">⚡ Quick Reply</h3>
                <p className="text-sm text-navy-700 mb-3">AI-powered response suggestions coming in Phase 2.</p>
                <button className="w-full bg-gray-200 text-gray-500 rounded-lg py-2 text-sm cursor-not-allowed">
                  AI Reply (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}