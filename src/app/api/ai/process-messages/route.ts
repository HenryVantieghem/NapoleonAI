import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service'
import { aiService } from '@/lib/ai/ai-service' // Fallback for compatibility

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
    const { messageIds, batchSize = 10 } = body

    const supabase = createClient()
    let messagesToProcess = []

    if (messageIds && Array.isArray(messageIds)) {
      // Process specific message IDs
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .in('id', messageIds)
      
      messagesToProcess = messages || []
    } else {
      // Process unanalyzed messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .is('ai_summary', null)
        .order('created_at', { ascending: false })
        .limit(batchSize)
      
      messagesToProcess = messages || []
    }

    if (messagesToProcess.length === 0) {
      return NextResponse.json({
        message: 'No messages to process',
        processed: 0,
        results: []
      })
    }

    const results = []
    let processedCount = 0

    console.log(`Processing ${messagesToProcess.length} messages for user ${user.id}`)

    // Process messages with enhanced AI service
    const processMessage = async (message: any) => {
      try {
        // Try enhanced AI service first
        const enhancedAnalysis = await enhancedAIService.processMessage(message, user.id)
        await enhancedAIService.saveEnhancedAnalysis(message.id, enhancedAnalysis, user.id)
        
        return {
          messageId: message.id,
          success: true,
          summary: enhancedAnalysis.executiveSummary.summary,
          priorityScore: enhancedAnalysis.priorityAnalysis.finalScore,
          actionItemsCount: enhancedAnalysis.actionItems.length,
          processingTime: enhancedAnalysis.processingMetrics.processingTime,
          tokensUsed: enhancedAnalysis.processingMetrics.tokensUsed,
          cost: enhancedAnalysis.processingMetrics.cost,
          vipBoost: enhancedAnalysis.priorityAnalysis.vipBoost,
          enhanced: true
        }
      } catch (enhancedError) {
        console.warn(`Enhanced AI processing failed for message ${message.id}, falling back to simple AI:`, enhancedError)
        
        try {
          // Fallback to simple AI service
          const analysis = await aiService.processMessage(message, user.id)
          await aiService.saveMessageAnalysis(message.id, analysis, user.id)
          
          return {
            messageId: message.id,
            success: true,
            summary: analysis.summary,
            priorityScore: analysis.priority.score,
            actionItemsCount: analysis.actionItems.length,
            enhanced: false,
            fallback: true
          }
        } catch (fallbackError) {
          console.error(`Both enhanced and simple AI processing failed for message ${message.id}:`, fallbackError)
          return {
            messageId: message.id,
            success: false,
            error: fallbackError instanceof Error ? fallbackError.message : 'Processing failed',
            enhanced: false
          }
        }
      }
    }

    // Process in chunks of 5 to respect API rate limits
    const chunkSize = 5
    for (let i = 0; i < messagesToProcess.length; i += chunkSize) {
      const chunk = messagesToProcess.slice(i, i + chunkSize)
      const chunkResults = await Promise.all(chunk.map(processMessage))
      
      results.push(...chunkResults)
      processedCount += chunkResults.filter(r => r.success).length
      
      // Small delay between chunks to be kind to OpenAI API
      if (i + chunkSize < messagesToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    console.log(`Batch processing complete: ${successCount} successful, ${failureCount} failed`)

    return NextResponse.json({
      message: `Processed ${successCount} messages successfully`,
      processed: processedCount,
      total: messagesToProcess.length,
      successful: successCount,
      failed: failureCount,
      results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Batch processing error:', error)
    return NextResponse.json(
      { 
        error: 'Batch processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}