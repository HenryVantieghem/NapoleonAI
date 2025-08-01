import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service'

/**
 * Enhanced AI batch processing endpoint
 * Processes up to 10 messages per batch with rate limiting
 * Max 12 batches per hour per user (2,880 messages/day capacity)
 */
export async function POST(request: NextRequest) {
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
    const { messageIds, priority = 'normal' } = body

    // Validate input
    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'messageIds array is required' },
        { status: 400 }
      )
    }

    if (messageIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one message ID is required' },
        { status: 400 }
      )
    }

    if (messageIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 messages per batch' },
        { status: 400 }
      )
    }

    // Process batch with enhanced AI service
    const result = await enhancedAIService.processBatch(user.id, messageIds)

    if (result.rateLimited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Maximum 12 batches per hour allowed. Please try again later.',
          retryAfter: 3600 // 1 hour in seconds
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '3600',
            'X-RateLimit-Limit': '12',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 3600
          }
        }
      )
    }

    // Log batch processing metrics
    const supabase = createServiceClient()
    await supabase
      .from('ai_processing_logs')
      .insert({
        user_id: user.id,
        operation_type: 'batch_process',
        batch_id: result.batchId,
        messages_processed: result.processed,
        messages_failed: result.failed,
        success: result.failed === 0,
        processing_time_ms: Date.now(), // Will be updated when batch completes
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      processed: result.processed,
      failed: result.failed,
      remainingQuota: 12, // TODO: Calculate actual remaining quota
      processingStats: {
        messagesPerBatch: 10,
        batchesPerHour: 12,
        dailyCapacity: 2880,
        targetProcessingTime: '500ms per message'
      }
    })

  } catch (error) {
    console.error('Batch processing error:', error)
    
    // Enhanced error logging for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/batch-process'
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check batch processing status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    if (!batchId) {
      // Return user's processing quota status
      return NextResponse.json({
        quotaStatus: {
          batchesPerHour: 12,
          remainingBatches: 12, // TODO: Calculate actual remaining
          messagesPerBatch: 10,
          dailyCapacity: 2880,
          resetTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }
      })
    }

    // Get specific batch status
    const supabase = createServiceClient()
    const { data: batch, error } = await supabase
      .from('ai_processing_logs')
      .select('*')
      .eq('batch_id', batchId)
      .eq('user_id', user.id)
      .single()

    if (error || !batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      batchId: batch.batch_id,
      status: batch.success ? 'completed' : batch.error_message ? 'failed' : 'processing',
      processed: batch.messages_processed || 0,
      failed: batch.messages_failed || 0,
      processingTime: batch.processing_time_ms,
      createdAt: batch.created_at,
      completedAt: batch.updated_at,
      error: batch.error_message
    })

  } catch (error) {
    console.error('Batch status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE endpoint to cancel a batch (if still processing)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId is required' },
        { status: 400 }
      )
    }

    // Mark batch as cancelled in database
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('ai_processing_logs')
      .update({
        success: false,
        error_message: 'Cancelled by user',
        updated_at: new Date().toISOString()
      })
      .eq('batch_id', batchId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to cancel batch' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Batch cancelled successfully'
    })

  } catch (error) {
    console.error('Batch cancellation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}