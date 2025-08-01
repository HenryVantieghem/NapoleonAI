'use client'

import { Crown, TrendingUp, Users, Mail, Calendar, BarChart3, Shield, Zap } from 'lucide-react'

export function ExecutiveDashboardPreview() {
  return (
    <div className="min-h-screen bg-jetBlack p-8">
      {/* Executive Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-jetBlack" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-warmIvory">Napoleon AI</h1>
            <p className="text-platinumSilver text-sm">Executive Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-warmIvory font-semibold">Victoria Chen</p>
            <p className="text-platinumSilver text-sm">CEO, TechVentures Inc.</p>
          </div>
          <div className="w-10 h-10 bg-gradient-gold rounded-full" />
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Time Saved Today', value: '3.2h', icon: Zap, trend: '+12%' },
          { label: 'Messages Prioritized', value: '847', icon: Mail, trend: '+8%' },
          { label: 'VIP Communications', value: '23', icon: Shield, trend: '0%' },
          { label: 'Action Items', value: '7', icon: Calendar, trend: '-3%' }
        ].map((metric, i) => (
          <div key={i} className="bg-midnightBlue/20 backdrop-blur-[30px] border border-platinumSilver/20 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <metric.icon className="w-5 h-5 text-champagneGold" />
              <span className={`text-xs font-medium ${
                metric.trend.startsWith('+') ? 'text-emerald-400' : 
                metric.trend === '0%' ? 'text-platinumSilver' : 'text-rose-400'
              }`}>
                {metric.trend}
              </span>
            </div>
            <p className="text-3xl font-serif text-warmIvory mb-1">{metric.value}</p>
            <p className="text-sm text-platinumSilver">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-3 gap-8">
        {/* Strategic Digest */}
        <div className="col-span-2 bg-midnightBlue/10 backdrop-blur-[30px] border border-platinumSilver/20 rounded-2xl p-8">
          <h2 className="text-xl font-serif text-warmIvory mb-6 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-champagneGold" />
            Strategic Daily Digest
          </h2>
          
          <div className="space-y-4">
            {[
              { 
                priority: 'CRITICAL',
                title: 'Board Meeting Tomorrow - Q4 Financials Review',
                summary: 'CFO Marcus requires your approval on revised projections. 3 key decisions needed.',
                time: '8:00 AM',
                color: 'bg-rose-500'
              },
              {
                priority: 'HIGH',
                title: 'Investor Relations - Series D Interest',
                summary: 'Sequoia partner requesting follow-up call. Valuation discussions progressing positively.',
                time: '2:30 PM',
                color: 'bg-champagneGold'
              },
              {
                priority: 'MEDIUM',
                title: 'Engineering Team - Product Roadmap Update',
                summary: 'CTO highlights 2 critical features for Q1. Resource allocation decision required.',
                time: '4:00 PM',
                color: 'bg-platinumSilver'
              }
            ].map((item, i) => (
              <div key={i} className="bg-jetBlack/50 border border-platinumSilver/10 rounded-xl p-6 hover:border-champagneGold/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 ${item.color} rounded-full`} />
                    <span className="text-xs font-medium text-platinumSilver">{item.priority}</span>
                  </div>
                  <span className="text-xs text-platinumSilver">{item.time}</span>
                </div>
                <h3 className="text-warmIvory font-semibold mb-2">{item.title}</h3>
                <p className="text-platinumSilver/80 text-sm">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Activity */}
        <div className="bg-midnightBlue/10 backdrop-blur-[30px] border border-platinumSilver/20 rounded-2xl p-8">
          <h2 className="text-xl font-serif text-warmIvory mb-6 flex items-center gap-3">
            <Users className="w-5 h-5 text-champagneGold" />
            VIP Activity
          </h2>
          
          <div className="space-y-4">
            {[
              { name: 'Michael Roberts', role: 'Board Chairman', status: 'Awaiting Response', urgent: true },
              { name: 'Sarah Kim', role: 'Lead Investor', status: 'Reviewed Proposal', urgent: false },
              { name: 'David Chen', role: 'Strategic Advisor', status: 'Scheduled Call', urgent: false }
            ].map((vip, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-jetBlack/50 rounded-lg border border-platinumSilver/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-gold rounded-full" />
                  <div>
                    <p className="text-warmIvory text-sm font-medium">{vip.name}</p>
                    <p className="text-platinumSilver text-xs">{vip.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vip.urgent && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
                  <p className="text-xs text-platinumSilver">{vip.status}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 bg-gradient-gold text-jetBlack font-semibold rounded-xl hover:shadow-champagne-glow transition-all">
            View All VIP Contacts
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-midnightBlue/90 backdrop-blur-[30px] border border-platinumSilver/20 rounded-full px-8 py-4 flex items-center gap-6">
        {[
          { icon: Mail, label: 'Compose' },
          { icon: Calendar, label: 'Schedule' },
          { icon: Users, label: 'Contacts' },
          { icon: BarChart3, label: 'Analytics' }
        ].map((action, i) => (
          <button key={i} className="flex items-center gap-2 text-platinumSilver hover:text-champagneGold transition-colors">
            <action.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}