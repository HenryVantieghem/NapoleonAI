import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

// Sample messages for MVP (in production, these would come from integrations)
const sampleMessages = [
  {
    id: 'msg_1',
    user_id: '', // Will be set dynamically
    source: 'gmail',
    external_id: 'gmail_123',
    sender: 'Sarah Chen, CFO',
    subject: 'Q4 Budget Review - Urgent',
    content: 'Need your approval on the revised Q4 budget by EOD. The board meeting is tomorrow and we need to present the final numbers. The main changes are: 1) Marketing budget increased by 15% due to strong Q3 performance, 2) Technology expenses reduced by 8% after renegotiating vendor contracts, 3) Hiring budget expanded for 3 additional engineering roles. Please review the attached spreadsheet and let me know if you have any concerns. Time is critical on this one.',
    ai_summary: 'CFO needs urgent Q4 budget approval before tomorrow\'s board meeting. Key changes: +15% marketing, -8% tech costs, +3 engineering hires.',
    priority_score: 95,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_2',
    user_id: '',
    source: 'slack',
    external_id: 'slack_456',
    sender: 'Marketing Team',
    subject: 'Campaign Performance Update',
    content: 'Our latest digital marketing campaign exceeded expectations by 40%! We\'re seeing fantastic engagement across all channels. The conversion rate is up 25% compared to last quarter. Should we consider increasing the budget allocation to capitalize on this momentum? The team is excited about the results and wants to know if we can double down on what\'s working.',
    ai_summary: 'Marketing campaign performing 40% above expectations with 25% higher conversion rates. Team requesting budget increase.',
    priority_score: 70,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_3',
    user_id: '',
    source: 'gmail',
    external_id: 'gmail_789',
    sender: 'John Smith, Lead Investor',
    subject: 'Series B Investment Discussion',
    content: 'Following up on our Series B discussion from last week. The partners are very interested in moving forward. Can we schedule a call next week to discuss terms and timeline? We\'re looking at a potential $50M round and want to move quickly given the current market conditions. Please let me know your availability for Tuesday or Wednesday afternoon.',
    ai_summary: 'Lead investor ready to proceed with $50M Series B funding, requesting call next week to discuss terms.',
    priority_score: 98,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_4',
    user_id: '',
    source: 'teams',
    external_id: 'teams_101',
    sender: 'HR Team',
    subject: 'Engineering Hire Approvals Needed',
    content: 'We have three excellent candidates for the senior engineering positions who have completed all interview rounds. The hiring committee unanimously recommends all three. We need your final approval to extend offers: 1) Senior Frontend Developer with React/Next.js expertise, 2) DevOps Engineer with AWS/Kubernetes experience, 3) Backend Developer specializing in microservices. Salary ranges are within approved budget. Can you approve by Friday?',
    ai_summary: 'HR needs approval for 3 senior engineering hires by Friday. All candidates passed interviews and fit budget.',
    priority_score: 65,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_5',
    user_id: '',
    source: 'gmail',
    external_id: 'gmail_202',
    sender: 'Legal Team',
    subject: 'Partnership Agreement Review Complete',
    content: 'The partnership agreement with TechCorp has been reviewed by our legal team. Overall, the terms are favorable, but we suggest a few minor modifications: 1) Intellectual property clause needs clarification on shared development, 2) Termination conditions should include a 90-day notice period instead of 60 days, 3) Revenue sharing percentage should be adjusted from 70/30 to 65/35 in our favor. The document is ready for your review and signature pending these changes.',
    ai_summary: 'Legal completed TechCorp partnership review. Minor changes needed before signature: IP clause, termination notice, revenue split.',
    priority_score: 40,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const filter = url.searchParams.get('filter') || 'all'
    const search = url.searchParams.get('search') || ''

    // For MVP, return sample messages with user ID set
    const messages = sampleMessages.map(msg => ({
      ...msg,
      user_id: user.id
    }))

    // Apply filters
    let filteredMessages = messages

    if (filter === 'high') {
      filteredMessages = messages.filter(msg => msg.priority_score >= 80)
    } else if (filter === 'vip') {
      // VIP contacts (board members, investors)
      const vipKeywords = ['investor', 'cfo', 'board', 'ceo', 'partner']
      filteredMessages = messages.filter(msg => 
        vipKeywords.some(keyword => 
          msg.sender.toLowerCase().includes(keyword)
        )
      )
    }

    // Apply search
    if (search) {
      filteredMessages = filteredMessages.filter(msg =>
        msg.subject.toLowerCase().includes(search.toLowerCase()) ||
        msg.sender.toLowerCase().includes(search.toLowerCase()) ||
        msg.content.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by priority score and created_at
    filteredMessages.sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({
      messages: filteredMessages,
      total: filteredMessages.length,
      filters: {
        all: messages.length,
        high: messages.filter(msg => msg.priority_score >= 80).length,
        vip: messages.filter(msg => {
          const vipKeywords = ['investor', 'cfo', 'board', 'ceo', 'partner']
          return vipKeywords.some(keyword => 
            msg.sender.toLowerCase().includes(keyword)
          )
        }).length
      }
    })

  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, messageId, data } = await request.json()

    if (action === 'mark_done') {
      // In production, this would update the message status in the database
      console.log(`Marking message ${messageId} as done for user ${user.id}`)
      return NextResponse.json({ success: true })
    }

    if (action === 'prioritize') {
      // In production, this would update the priority score
      console.log(`Updating priority for message ${messageId} to ${data.priority}`)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}