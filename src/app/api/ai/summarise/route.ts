import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, messageId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Process message with AI service
    const messageData = {
      id: messageId || `temp_${Date.now()}`,
      content: message.content || message,
      subject: message.subject || 'No Subject',
      sender_name: message.sender?.name || message.senderName || 'Unknown Sender',
      sender_email: message.sender?.email || message.senderEmail || '',
      message_date: message.timestamp ? new Date(message.timestamp) : new Date(),
      source_platform: message.source || 'email',
      external_id: messageId || `temp_${Date.now()}`,
      user_id: user.id
    }

    console.log('Processing message with AI:', { 
      messageId, 
      contentLength: messageData.content.length,
      sender: messageData.sender_email 
    })

    const analysis = await aiService.processMessage(messageData as any, user.id)
    
    // If messageId provided, save the analysis
    if (messageId && messageId !== `temp_${Date.now()}`) {
      await aiService.saveMessageAnalysis(messageId, analysis, user.id)
    }

    return NextResponse.json({
      summary: analysis.summary,
      priority_score: analysis.priority.score,
      priority_reason: analysis.priority.reason,
      is_urgent: analysis.priority.isUrgent,
      is_vip: analysis.priority.isVip,
      sentiment: analysis.sentiment,
      action_items: analysis.actionItems.map(item => ({
        title: item.title,
        description: item.description,
        priority: item.priority,
        due_date: item.dueDate
      })),
      processing_time: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI summarization error:', error)
    
    // Provide fallback response with error details for debugging
    return NextResponse.json(
      { 
        error: 'AI summarization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback_summary: 'AI processing temporarily unavailable - using fallback analysis',
        priority_score: 50,
        action_items: []
      },
      { status: 500 }
    )
  }
}