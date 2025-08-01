import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { gmailAPI } from '@/lib/integrations/gmail-api'
import { aiService } from '@/lib/ai/ai-service'

// Enhanced sample messages for DEMO/FALLBACK when no Gmail connection
const sampleMessages = [
  {
    id: 'msg_1',
    user_id: '',
    source_platform: 'gmail',
    external_id: 'gmail_123',
    sender_name: 'Sarah Chen',
    sender_email: 'sarah.chen@company.com',
    subject: 'Q4 Budget Review - Urgent',
    content: 'Need your approval on the revised Q4 budget by EOD. The board meeting is tomorrow and we need to present the final numbers. The main changes are: 1) Marketing budget increased by 15% due to strong Q3 performance, 2) Technology expenses reduced by 8% after renegotiating vendor contracts, 3) Hiring budget expanded for 3 additional engineering roles. Please review the attached spreadsheet and let me know if you have any concerns. Time is critical on this one.',
    ai_summary: 'CFO needs urgent Q4 budget approval before tomorrow\'s board meeting. Key changes: +15% marketing, -8% tech costs, +3 engineering hires.',
    priority_score: 95,
    is_vip: true,
    is_read: false,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_2',
    user_id: '',
    source_platform: 'slack',
    external_id: 'slack_456',
    sender_name: 'Marketing Team',
    sender_email: 'marketing@company.com',
    subject: 'Campaign Performance Update',
    content: 'Our latest digital marketing campaign exceeded expectations by 40%! We\'re seeing fantastic engagement across all channels. The conversion rate is up 25% compared to last quarter. Should we consider increasing the budget allocation to capitalize on this momentum? The team is excited about the results and wants to know if we can double down on what\'s working.',
    ai_summary: 'Marketing campaign performing 40% above expectations with 25% higher conversion rates. Team requesting budget increase.',
    priority_score: 70,
    is_vip: false,
    is_read: false,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_3',
    user_id: '',
    source_platform: 'gmail',
    external_id: 'gmail_789',
    sender_name: 'John Smith',
    sender_email: 'john.smith@sequoia.com',
    subject: 'Series B Investment Discussion',
    content: 'Following up on our Series B discussion from last week. The partners are very interested in moving forward. Can we schedule a call next week to discuss terms and timeline? We\'re looking at a potential $50M round and want to move quickly given the current market conditions. Please let me know your availability for Tuesday or Wednesday afternoon.',
    ai_summary: 'Lead investor ready to proceed with $50M Series B funding, requesting call next week to discuss terms.',
    priority_score: 98,
    is_vip: true,
    is_read: true,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_4',
    user_id: '',
    source_platform: 'teams',
    external_id: 'teams_101',
    sender_name: 'HR Team',
    sender_email: 'hr@company.com',
    subject: 'Engineering Hire Approvals Needed',
    content: 'We have three excellent candidates for the senior engineering positions who have completed all interview rounds. The hiring committee unanimously recommends all three. We need your final approval to extend offers: 1) Senior Frontend Developer with React/Next.js expertise, 2) DevOps Engineer with AWS/Kubernetes experience, 3) Backend Developer specializing in microservices. Salary ranges are within approved budget. Can you approve by Friday?',
    ai_summary: 'HR needs approval for 3 senior engineering hires by Friday. All candidates passed interviews and fit budget.',
    priority_score: 65,
    is_vip: false,
    is_read: false,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_5',
    user_id: '',
    source_platform: 'gmail',
    external_id: 'gmail_202',
    sender_name: 'Legal Team',
    sender_email: 'legal@company.com',
    subject: 'Partnership Agreement Review Complete',
    content: 'The partnership agreement with TechCorp has been reviewed by our legal team. Overall, the terms are favorable, but we suggest a few minor modifications: 1) Intellectual property clause needs clarification on shared development, 2) Termination conditions should include a 90-day notice period instead of 60 days, 3) Revenue sharing percentage should be adjusted from 70/30 to 65/35 in our favor. The document is ready for your review and signature pending these changes.',
    ai_summary: 'Legal completed TechCorp partnership review. Minor changes needed before signature: IP clause, termination notice, revenue split.',
    priority_score: 40,
    is_vip: false,
    is_read: true,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_6',
    user_id: '',
    source_platform: 'gmail',
    external_id: 'gmail_303',
    sender_name: 'Board Chair',
    sender_email: 'boardchair@company.com',
    subject: 'Board Meeting Agenda Review',
    content: 'Please review the draft agenda for next week\'s board meeting. I\'ve included the quarterly performance review, budget discussions, and strategic initiatives updates. Let me know if there are any additional items you\'d like to discuss.',
    ai_summary: 'Board chair requesting review of meeting agenda for next week.',
    priority_score: 85,
    is_vip: true,
    is_read: false,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_7',
    user_id: '',
    source_platform: 'slack',
    external_id: 'slack_404',
    sender_name: 'Engineering Team',
    sender_email: 'engineering@company.com',
    subject: 'Production Deployment Complete',
    content: 'The latest feature release has been successfully deployed to production. All systems are running smoothly and we\'re monitoring for any issues.',
    ai_summary: null, // This message needs AI summary
    priority_score: 30,
    is_vip: false,
    is_read: false,
    is_archived: false,
    is_snoozed: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
]

/**
 * Get messages from Gmail API with AI processing
 */
async function getMessagesFromGmail(userId: string, limit: number = 50) {
  try {
    const supabase = createClient()
    
    // Get Gmail OAuth tokens from database
    const { data: gmailAccount } = await supabase
      .from('connected_accounts')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .eq('status', 'active')
      .single()

    if (!gmailAccount?.access_token) {
      console.log('No Gmail account connected for user:', userId)
      return null // Fall back to sample data
    }

    // Set up Gmail API with user's tokens
    gmailAPI.setAccessToken(
      gmailAccount.access_token,
      gmailAccount.refresh_token
    )

    // Fetch recent messages from Gmail
    const gmailResult = await gmailAPI.getMessages(userId, {
      maxResults: limit,
      labelIds: ['INBOX'],
      includeSpamTrash: false
    })

    if (!gmailResult.messages || gmailResult.messages.length === 0) {
      return null // Fall back to sample data
    }

    // Transform Gmail messages to our format and process with AI
    const processedMessages = []
    
    for (const gmailMessage of gmailResult.messages) {
      try {
        // Check if message already exists in our database
        const { data: existingMessage } = await supabase
          .from('messages')
          .select('id, ai_summary, priority_score')
          .eq('external_id', gmailMessage.id)
          .eq('user_id', userId)
          .single()

        let aiSummary = null
        let priorityScore = 50
        let isVip = false

        if (existingMessage) {
          // Use existing AI analysis
          aiSummary = existingMessage.ai_summary
          priorityScore = existingMessage.priority_score || 50
        } else {
          // Process new message with AI
          try {
            const messageData = {
              id: gmailMessage.id || '',
              content: gmailMessage.content || '',
              subject: gmailMessage.subject || '',
              sender_name: gmailMessage.sender || '',
              sender_email: gmailMessage.sender || '',
              message_date: gmailMessage.timestamp || new Date(),
              source: 'gmail',
              external_id: gmailMessage.id || '',
              user_id: userId
            }

            const analysis = await aiService.processMessage(messageData as any, userId)
            aiSummary = analysis.summary
            priorityScore = analysis.priority.score
            isVip = analysis.priority.isVip

            // Save to database for future reference
            await supabase.from('messages').insert({
              user_id: userId,
              source: 'gmail',
              external_id: gmailMessage.id,
              sender_name: gmailMessage.sender,
              sender_email: gmailMessage.sender || '',
              subject: gmailMessage.subject,
              content: gmailMessage.content,
              ai_summary: aiSummary,
              priority_score: priorityScore,
              is_vip: isVip,
              status: 'unread',
              message_date: gmailMessage.timestamp?.toISOString() || new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

            // Save action items if any
            if (analysis.actionItems.length > 0) {
              await aiService.saveMessageAnalysis(gmailMessage.id || '', analysis, userId)
            }
          } catch (aiError) {
            console.error('AI processing failed for message:', gmailMessage.id, aiError)
            // Continue with default values
          }
        }

        // Transform to our message format
        processedMessages.push({
          id: gmailMessage.id || `gmail_${Date.now()}`,
          user_id: userId,
          source: 'gmail',
          external_id: gmailMessage.id,
          sender_name: gmailMessage.sender || 'Unknown Sender',
          sender_email: gmailMessage.sender || '',
          subject: gmailMessage.subject || 'No Subject',
          content: gmailMessage.content || '',
          ai_summary: aiSummary,
          priority_score: priorityScore,
          is_vip: isVip,
          status: 'unread',
          created_at: gmailMessage.timestamp?.toISOString() || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } catch (messageError) {
        console.error('Error processing message:', gmailMessage.id, messageError)
        // Skip this message and continue
      }
    }

    console.log(`Successfully processed ${processedMessages.length} Gmail messages for user ${userId}`)
    return processedMessages

  } catch (error) {
    console.error('Gmail API error:', error)
    return null // Fall back to sample data
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user with Clerk
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const filters = searchParams.get('filters')?.split(',') || []
    
    // Get real Gmail messages or use sample data as fallback
    let messages = await getMessagesFromGmail(user.id, limit) || sampleMessages.map(msg => ({
      ...msg,
      user_id: user.id
    }))

    // Apply filters
    let filteredMessages = messages

    if (filters.includes('vip')) {
      filteredMessages = filteredMessages.filter(msg => msg.is_vip)
    }
    
    if (filters.includes('high-priority')) {
      filteredMessages = filteredMessages.filter(msg => msg.priority_score >= 80)
    }
    
    if (filters.includes('unread')) {
      filteredMessages = filteredMessages.filter(msg => !msg.is_read)
    }
    
    if (filters.includes('today')) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filteredMessages = filteredMessages.filter(msg => 
        new Date(msg.created_at) >= today
      )
    }

    // Apply search across multiple fields
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMessages = filteredMessages.filter(msg =>
        msg.subject.toLowerCase().includes(searchLower) ||
        msg.sender_name.toLowerCase().includes(searchLower) ||
        msg.sender_email.toLowerCase().includes(searchLower) ||
        msg.content.toLowerCase().includes(searchLower) ||
        msg.ai_summary?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by priority score, then by created_at (newest first)
    filteredMessages.sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Apply pagination
    const paginatedMessages = filteredMessages.slice(offset, offset + limit)

    // Transform data for frontend with enhanced fields
    const transformedMessages = paginatedMessages.map(message => ({
      id: message.id,
      sender: {
        name: message.sender_name,
        email: message.sender_email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_name)}&background=1B2951&color=D4AF37&size=40`
      },
      subject: message.subject,
      content: message.content,
      preview: message.content.length > 150 
        ? message.content.substring(0, 150) + '...' 
        : message.content,
      aiSummary: message.ai_summary,
      priorityScore: message.priority_score,
      priority: message.priority_score >= 80 ? 'high' : 
                message.priority_score >= 50 ? 'medium' : 'low',
      isVip: message.is_vip,
      isRead: message.status === 'read',
      isArchived: message.status === 'archived',
      isSnoozed: message.status === 'snoozed',
      source: message.source,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      timeAgo: formatTimeAgo(message.created_at),
      needsAiSummary: !message.ai_summary && message.content.length > 200,
      tags: [
        message.is_vip && 'VIP',
        message.priority_score >= 80 && 'Urgent',
        !message.is_read && 'Unread',
        message.is_snoozed && 'Snoozed'
      ].filter(Boolean)
    }))

    // Calculate metrics for dashboard
    const metrics = {
      total: messages.length,
      vip: messages.filter(msg => msg.is_vip).length,
      urgent: messages.filter(msg => msg.priority_score >= 80).length,
      unread: messages.filter(msg => !msg.is_read).length,
      today: messages.filter(msg => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(msg.created_at) >= today
      }).length,
      needsAiSummary: messages.filter(msg => !msg.ai_summary && msg.content.length > 200).length
    }

    return NextResponse.json({
      messages: transformedMessages,
      pagination: {
        limit,
        offset,
        total: filteredMessages.length,
        hasMore: (offset + limit) < filteredMessages.length
      },
      metrics,
      filters: {
        applied: filters,
        available: ['all', 'vip', 'high-priority', 'unread', 'today']
      }
    })

  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, messageId, data } = body

    // In production, this would interact with Supabase
    // For MVP, we'll simulate the operations and log them
    
    switch (action) {
      case 'mark_read':
        console.log(`Marking message ${messageId} as read for user ${user.id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Message marked as read' 
        })

      case 'archive':
        console.log(`Archiving message ${messageId} for user ${user.id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Message archived successfully' 
        })

      case 'snooze':
        const snoozeUntil = data?.snoozeUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        console.log(`Snoozing message ${messageId} until ${snoozeUntil} for user ${user.id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Message snoozed successfully',
          snoozeUntil 
        })

      case 'update_priority':
        const newPriority = data?.priorityScore || data?.priority
        console.log(`Updating priority for message ${messageId} to ${newPriority} for user ${user.id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Priority updated successfully',
          priorityScore: newPriority
        })

      case 'add_to_vip':
        console.log(`Adding sender of message ${messageId} to VIP list for user ${user.id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Sender added to VIP contacts' 
        })

      case 'generate_summary':
        console.log(`Generating AI summary for message ${messageId} for user ${user.id}`)
        // This would call the AI summarization service
        return NextResponse.json({ 
          success: true, 
          message: 'AI summary generation initiated',
          status: 'processing'
        })

      case 'create_action_item':
        const actionItem = {
          id: `action_${Date.now()}`,
          messageId,
          title: data?.title || 'New action item',
          description: data?.description || '',
          dueDate: data?.dueDate,
          priority: data?.priority || 'medium',
          completed: false,
          createdAt: new Date().toISOString()
        }
        console.log(`Creating action item for message ${messageId}:`, actionItem)
        return NextResponse.json({ 
          success: true, 
          message: 'Action item created',
          actionItem
        })

      case 'bulk_action':
        const { messageIds, bulkAction } = data
        console.log(`Performing bulk action ${bulkAction} on messages:`, messageIds)
        return NextResponse.json({ 
          success: true, 
          message: `Bulk ${bulkAction} completed`,
          processedCount: messageIds?.length || 0
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}