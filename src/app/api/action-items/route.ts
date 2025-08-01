import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

// Sample action items for MVP
const sampleActionItems = [
  {
    id: 'action_1',
    user_id: '',
    message_id: 'msg_1',
    title: 'Review Q4 Budget Proposal',
    description: 'Examine the revised Q4 budget with marketing increase and tech cost reduction before board meeting',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    priority: 'high',
    status: 'pending',
    completed: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'action_2',
    user_id: '',
    message_id: 'msg_3',
    title: 'Schedule Series B Discussion Call',
    description: 'Coordinate with John Smith for Series B funding discussion - $50M round',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    priority: 'high',
    status: 'pending',
    completed: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'action_3',
    user_id: '',
    message_id: 'msg_4',
    title: 'Approve Engineering Hires',
    description: 'Final approval for 3 senior engineering candidates by Friday',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
    priority: 'medium',
    status: 'pending',
    completed: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'action_4',
    user_id: '',
    message_id: 'msg_2',
    title: 'Decide on Marketing Budget Increase',
    description: 'Review campaign performance data and decide on budget allocation increase',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
    priority: 'medium',
    status: 'in_progress',
    completed: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'action_5',
    user_id: '',
    message_id: 'msg_5',
    title: 'Review TechCorp Partnership Agreement',
    description: 'Review legal recommendations for IP clause, termination notice, and revenue split',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
    priority: 'low',
    status: 'completed',
    completed: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const completed = searchParams.get('completed')

    // For MVP, use sample data with user ID set
    let actionItems = sampleActionItems.map(item => ({
      ...item,
      user_id: user.id
    }))

    // Apply filters
    if (messageId) {
      actionItems = actionItems.filter(item => item.message_id === messageId)
    }

    if (status) {
      actionItems = actionItems.filter(item => item.status === status)
    }

    if (priority) {
      actionItems = actionItems.filter(item => item.priority === priority)
    }

    if (completed !== null) {
      const isCompleted = completed === 'true'
      actionItems = actionItems.filter(item => item.completed === isCompleted)
    }

    // Sort by priority and due date
    actionItems.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      }
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })

    // Transform for frontend
    const transformedItems = actionItems.map(item => ({
      id: item.id,
      messageId: item.message_id,
      title: item.title,
      description: item.description,
      dueDate: item.due_date,
      priority: item.priority,
      status: item.status,
      completed: item.completed,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // Computed fields
      isOverdue: new Date(item.due_date) < new Date() && !item.completed,
      dueInDays: Math.ceil((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      dueDateFormatted: new Date(item.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: new Date(item.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })
    }))

    // Calculate metrics
    const metrics = {
      total: actionItems.length,
      pending: actionItems.filter(item => item.status === 'pending').length,
      inProgress: actionItems.filter(item => item.status === 'in_progress').length,
      completed: actionItems.filter(item => item.completed).length,
      overdue: actionItems.filter(item => 
        new Date(item.due_date) < new Date() && !item.completed
      ).length,
      dueToday: actionItems.filter(item => {
        const today = new Date()
        const itemDate = new Date(item.due_date)
        return today.toDateString() === itemDate.toDateString() && !item.completed
      }).length
    }

    return NextResponse.json({
      actionItems: transformedItems,
      metrics
    })

  } catch (error) {
    console.error('Action items API error:', error)
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
    const { action, actionItemId, data } = body

    switch (action) {
      case 'create':
        const newActionItem = {
          id: `action_${Date.now()}`,
          user_id: user.id,
          message_id: data.messageId,
          title: data.title,
          description: data.description || '',
          due_date: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: data.priority || 'medium',
          status: 'pending',
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('Creating action item:', newActionItem)
        return NextResponse.json({
          success: true,
          actionItem: newActionItem,
          message: 'Action item created successfully'
        })

      case 'update':
        console.log(`Updating action item ${actionItemId} with data:`, data)
        return NextResponse.json({
          success: true,
          message: 'Action item updated successfully'
        })

      case 'complete':
        console.log(`Marking action item ${actionItemId} as complete`)
        return NextResponse.json({
          success: true,
          message: 'Action item marked as complete'
        })

      case 'delete':
        console.log(`Deleting action item ${actionItemId}`)
        return NextResponse.json({
          success: true,
          message: 'Action item deleted successfully'
        })

      case 'bulk_update':
        const { actionItemIds, updateData } = data
        console.log(`Bulk updating action items:`, actionItemIds, updateData)
        return NextResponse.json({
          success: true,
          message: `${actionItemIds.length} action items updated`,
          processedCount: actionItemIds.length
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Action items POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}