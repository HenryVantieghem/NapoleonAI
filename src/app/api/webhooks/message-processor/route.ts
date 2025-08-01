import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, messageId, source = 'webhook' } = body

    // Verify webhook authenticity (in production, add proper webhook verification)
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized webhook' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Get the message that needs processing
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Skip if already processed
    if (message.ai_summary) {
      return NextResponse.json({
        success: true,
        message: 'Message already processed',
        messageId
      })
    }

    console.log(`Processing message ${messageId} for user ${userId} via webhook`)

    // Process with AI
    const analysis = await aiService.processMessage(message, userId)
    
    // Save analysis results
    await aiService.saveMessageAnalysis(messageId, analysis, userId)

    // Trigger real-time update via Supabase
    const { error: broadcastError } = await supabase
      .channel('message_updates')
      .send({
        type: 'broadcast',
        event: 'message_processed',
        payload: {
          messageId,
          userId,
          summary: analysis.summary,
          priorityScore: analysis.priority.score,
          isVip: analysis.priority.isVip,
          actionItemsCount: analysis.actionItems.length,
          timestamp: new Date().toISOString()
        }
      })

    if (broadcastError) {
      console.error('Failed to broadcast update:', broadcastError)
    }

    return NextResponse.json({
      success: true,
      message: 'Message processed successfully',
      messageId,
      analysis: {
        summary: analysis.summary,
        priorityScore: analysis.priority.score,
        isVip: analysis.priority.isVip,
        actionItemsCount: analysis.actionItems.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Message processing webhook error:', error)
    return NextResponse.json(
      { 
        error: 'Processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: 'ok',
    service: 'message-processor',
    timestamp: new Date().toISOString()
  })
}