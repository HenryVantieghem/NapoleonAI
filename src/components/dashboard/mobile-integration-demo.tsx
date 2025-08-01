'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Archive, AlertTriangle, Zap, TrendingUp } from 'lucide-react'
import { MobileCommandCenter } from './mobile-command-center'
import { ExecutiveTouchTarget, PriorityBoostButton, VipActionButton, QuickArchiveButton } from '@/components/ui/executive-touch-target'
import { useGestures } from '@/hooks/useGestures'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface MobileIntegrationDemoProps {
  className?: string
}

// Mock data for demonstration
const mockMessages = [
  {
    id: 'msg-1',
    sender_name: 'Sarah Mitchell',
    sender_email: 'sarah.mitchell@boardmember.com',
    subject: 'Q4 Board Meeting - Strategic Decisions Required',
    content: 'The board needs your input on the proposed $100M acquisition of TechCorp. We have until Friday to respond to their offer. This could significantly impact our market position.',
    priority_score: 95,
    is_vip: true,
    ai_summary: 'Board meeting requires urgent decision on $100M acquisition with Friday deadline',
    message_date: new Date().toISOString(),
    sentiment: 'urgent'
  },
  {
    id: 'msg-2',
    sender_name: 'David Chen',
    sender_email: 'david.chen@investor.com',
    subject: 'Series C Funding Timeline Update',
    content: 'Following up on our discussion about the Series C timeline. We have three term sheets and need to make a decision by next week.',
    priority_score: 88,
    is_vip: true,
    ai_summary: 'Investor update on Series C funding with multiple term sheets',
    message_date: new Date().toISOString(),
    sentiment: 'positive'
  },
  {
    id: 'msg-3',
    sender_name: 'Marketing Team',
    sender_email: 'marketing@company.com',
    subject: 'Weekly Campaign Performance Report',
    content: 'This week\'s campaigns performed 15% above target. Detailed analytics attached.',
    priority_score: 45,
    is_vip: false,
    ai_summary: 'Marketing campaign performance exceeded targets by 15%',
    message_date: new Date().toISOString(),
    sentiment: 'positive'
  }
]

const mockActionItems = [
  {
    id: 'action-1',
    title: 'Review TechCorp Acquisition Proposal',
    description: 'Analyze financial projections and strategic fit for $100M acquisition',
    priority: 'critical',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    status: 'pending',
    category: 'strategic'
  },
  {
    id: 'action-2',
    title: 'Series C Term Sheet Decision',
    description: 'Compare three term sheets and select preferred investor',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
    status: 'pending',
    category: 'financial'
  }
]

const mockVipContacts = [
  {
    id: 'vip-1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@boardmember.com',
    relationship_type: 'Board Chair',
    priority_level: 10
  },
  {
    id: 'vip-2',
    name: 'David Chen',
    email: 'david.chen@investor.com',
    relationship_type: 'Lead Investor',
    priority_level: 9
  }
]

export function MobileIntegrationDemo({ className }: MobileIntegrationDemoProps) {
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [demoMode, setDemoMode] = useState<'mobile' | 'gestures' | 'touch'>('mobile')
  const [processingStats, setProcessingStats] = useState({
    messagesProcessed: 156,
    avgProcessingTime: 485,
    vipBoosts: 23,
    successRate: 98.7
  })

  // Gesture demo handlers
  const gestureHandlers = useGestures({
    onSwipeLeft: useCallback(() => {
      console.log('Archive gesture triggered')
    }, []),
    onSwipeRight: useCallback(() => {
      console.log('Priority boost gesture triggered')
    }, []),
    onLongPress: useCallback(() => {
      console.log('Quick actions menu triggered')
    }, []),
    onPriorityBoost: useCallback(() => {
      console.log('Golden priority boost activated!')
    }, []),
    onQuickArchive: useCallback(() => {
      console.log('Champagne archive animation triggered!')
    }, []),
    onVipAction: useCallback(() => {
      console.log('VIP contact action menu opened')
    }, [])
  })

  const handleMessageSelect = useCallback((message: any) => {
    setSelectedMessage(message)
  }, [])

  const handleActionComplete = useCallback((actionId: string) => {
    console.log(`Action ${actionId} completed`)
  }, [])

  const handleRefresh = useCallback(async () => {
    // Simulate AI processing refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    setProcessingStats(prev => ({
      ...prev,
      messagesProcessed: prev.messagesProcessed + 5,
      avgProcessingTime: Math.max(400, prev.avgProcessingTime - 10)
    }))
  }, [])

  const renderMobileDemo = () => (
    <div className="relative">
      <MobileCommandCenter
        messages={mockMessages}
        actionItems={mockActionItems}
        vipContacts={mockVipContacts}
        onMessageSelect={handleMessageSelect}
        onActionComplete={handleActionComplete}
        onRefresh={handleRefresh}
      />
    </div>
  )

  const renderGestureDemo = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Executive Gesture System</h3>
        <p className="text-white/70">Try swiping, long pressing, and tapping the message cards</p>
      </div>

      {mockMessages.slice(0, 2).map(message => (
        <motion.div
          key={message.id}
          className="relative"
          drag="x"
          dragConstraints={{ left: -200, right: 200 }}
          onDragStart={gestureHandlers.handleDragStart}
          onDrag={gestureHandlers.handleDrag}
          onDragEnd={gestureHandlers.handleDragEnd}
        >
          <Card className="p-4 bg-white/10 backdrop-blur-xl border-white/20">
            <div className="flex items-start gap-3">
              {message.is_vip && (
                <Star className="text-yellow-400 flex-shrink-0 mt-1" size={16} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  {message.sender_name}
                </p>
                <p className="text-xs text-white/60 mb-2">
                  {message.subject}
                </p>
                <p className="text-xs text-white/50">
                  {message.ai_summary}
                </p>
              </div>
              <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                {message.priority_score}
              </Badge>
            </div>
          </Card>
        </motion.div>
      ))}

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-medium mb-2">Gesture Guide:</h4>
        <div className="space-y-2 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Archive size={14} className="text-gray-400" />
            <span>Swipe left → Quick archive</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={14} className="text-yellow-400" />
            <span>Swipe right → Priority boost</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span>Long press → Quick actions</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTouchDemo = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Executive Touch Targets</h3>
        <p className="text-white/70">56px touch targets optimized for executive use</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PriorityBoostButton>
          <Star size={24} className="text-yellow-400" />
        </PriorityBoostButton>

        <VipActionButton>
          <AlertTriangle size={24} className="text-purple-400" />
        </VipActionButton>

        <QuickArchiveButton>
          <Archive size={24} className="text-gray-400" />
        </QuickArchiveButton>

        <ExecutiveTouchTarget variant="default" executiveMode>
          <TrendingUp size={24} className="text-blue-400" />
        </ExecutiveTouchTarget>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-medium mb-2">Touch Target Specs:</h4>
        <div className="space-y-2 text-sm text-white/70">
          <div>• Executive Mode: 56px minimum (premium experience)</div>
          <div>• Standard: 44px minimum (Apple guidelines)</div>
          <div>• Haptic feedback on all interactions</div>
          <div>• Golden animations for priority actions</div>
        </div>
      </div>
    </div>
  )

  const renderAIMetrics = () => (
    <motion.div
      className="fixed bottom-4 left-4 right-4 z-50 bg-black/80 backdrop-blur-xl rounded-xl p-4 border border-white/20"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-400">{processingStats.messagesProcessed}</div>
          <div className="text-xs text-white/70">Messages Processed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">{processingStats.avgProcessingTime}ms</div>
          <div className="text-xs text-white/70">Avg Processing Time</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-400">{processingStats.vipBoosts}</div>
          <div className="text-xs text-white/70">VIP Boosts Applied</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">{processingStats.successRate}%</div>
          <div className="text-xs text-white/70">Success Rate</div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 ${className}`}>
      {/* Demo Mode Selector */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20 flex gap-2">
          {[
            { id: 'mobile', label: 'Mobile Dashboard' },
            { id: 'gestures', label: 'Gesture System' },
            { id: 'touch', label: 'Touch Targets' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setDemoMode(mode.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                demoMode === mode.id
                  ? 'bg-yellow-500/20 text-yellow-200'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="pt-20">
        {demoMode === 'mobile' && renderMobileDemo()}
        {demoMode === 'gestures' && renderGestureDemo()}
        {demoMode === 'touch' && renderTouchDemo()}
      </div>

      {/* AI Processing Metrics */}
      {renderAIMetrics()}
    </div>
  )
}